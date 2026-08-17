import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { verifyServerAuth, unauthorizedResponse } from '@/lib/server-auth';
import { sanitizeInput, escapePromptInjection, clampInteger, AI_SAFETY_DIRECTIVE } from '@/lib/security';
import { getClientIdentifier, checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limiter';

interface AiRequestBody {
  action: 'generate_quiz' | 'generate_notes' | 'generate_feedback' | 'explain_question' | 'chat_assistant';
  topic?: string;
  count?: number;
  grade?: string;
  studentName?: string;
  score?: number;
  total?: number;
  mistakes?: Array<{ question: string; studentAnswer: string; correctAnswer: string }>;
  question?: string;
  studentAnswer?: string;
  correctAnswer?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Authentication Guard (Reject unauthenticated callers with 401)
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error);
    }

    // 2. Enforce In-Memory Rate Limiting (Max 10 requests / 1 min per User ID or IP)
    const clientKey = getClientIdentifier(req, authResult.user?.id);
    const rateLimit = checkRateLimit(clientKey, 10, 60000);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetInSeconds);
    }

    const body: AiRequestBody = await req.json();
    const { action } = body;

    const allowedActions = ['generate_quiz', 'generate_notes', 'generate_feedback', 'explain_question', 'chat_assistant'];
    if (!action || !allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veya yetkisiz istek türü.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Input Sanitization & Abuse Prevention (Max 1000 chars per text input)
    if (action === 'generate_quiz') {
      const rawTopic = body.topic || 'Genel Konu Tekrarı';
      const topic = escapePromptInjection(sanitizeInput(rawTopic, 200)) || 'Genel Konu Tekrarı';
      const count = clampInteger(body.count, 1, 10, 3);
      const grade = escapePromptInjection(sanitizeInput(body.grade || 'Lise / Ortaokul', 100));

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `${AI_SAFETY_DIRECTIVE}

Sen uzman bir öğretmensin. Aşağıdaki konu ve sınıf seviyesi için ${count} adet interaktif kısa cevaplı (boşluk doldurma veya tek-iki kelimelik net cevaplı) soru hazırla.
Konu: ${topic}
Seviye: ${grade}

Lütfen sadece ve sadece aşağıdaki JSON formatında yanıt ver (başka hiçbir metin veya markdown bloğu ekleme):
{
  "title": "${topic} — Hızlı Test",
  "folder": "${topic}",
  "desc": "Soruları dikkatle okuyarak kısa ve net cevaplar veriniz.",
  "timeLimit": ${count * 45},
  "questions": [
    {
      "q": "Soru metni...",
      "a": "Kısa ve kesin doğru cevap",
      "explanation": "Neden bu cevap doğru kısa açıklama"
    }
  ]
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          const rawText = response.text || '';
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ success: true, data: parsed, source: 'gemini' });
          }
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, falling back to intelligent template response:', geminiError.message);
        }
      }

      const questions = generateFallbackQuestions(topic, count);
      return NextResponse.json({
        success: true,
        data: {
          title: `${topic} — Akıllı Test`,
          folder: topic,
          desc: 'Soruları dikkatlice okuyup kısa cevap kutularına doğru yanıtları yazınız.',
          timeLimit: count * 45,
          questions,
        },
        source: 'fallback_template',
      });
    }

    if (action === 'generate_notes') {
      const rawTopic = body.topic || 'Önemli Konu';
      const topic = escapePromptInjection(sanitizeInput(rawTopic, 300)) || 'Önemli Konu';

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `${AI_SAFETY_DIRECTIVE}

Sen harika bir özel ders öğretmenisin. "${topic}" konusu hakkında öğrenciler için anlaşılır, akılda kalıcı, maddeli, örnekli ve formüllü/ipuçlu zengin bir Ders Notu hazırla. Türkçe olsun. Emojilerle zenginleştir.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          return NextResponse.json({
            success: true,
            data: {
              title: `${topic} — Ders Notu & Özet`,
              folder: topic,
              content: response.text || '',
            },
            source: 'gemini',
          });
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, falling back to intelligent template response:', geminiError.message);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          title: `${topic} — Özet Ders Notu`,
          folder: topic,
          content: generateFallbackNotes(topic),
        },
        source: 'fallback_template',
      });
    }

    if (action === 'generate_feedback') {
      const studentName = escapePromptInjection(sanitizeInput(body.studentName || 'Öğrenci', 100));
      const topic = escapePromptInjection(sanitizeInput(body.topic || 'Genel Konu', 200));
      const score = clampInteger(body.score, 0, 1000, 0);
      const total = clampInteger(body.total, 0, 1000, 0);
      const safeMistakes = Array.isArray(body.mistakes)
        ? body.mistakes.slice(0, 10).map((m) => ({
            question: sanitizeInput(m.question, 300),
            studentAnswer: sanitizeInput(m.studentAnswer, 200),
            correctAnswer: sanitizeInput(m.correctAnswer, 200),
          }))
        : [];

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `${AI_SAFETY_DIRECTIVE}

Sen destekleyici, motivasyon verici ve yapıcı bir özel ders öğretmenisin.
Öğrenci: ${studentName}
Konu: ${topic}
Skor: ${total ? Math.round((score / total) * 100) : 100}% (${score}/${total})
Yapılan Hatalar: ${JSON.stringify(safeMistakes)}

Bu öğrenciye hitaben 2-4 cümlelik samimi, eksik noktaları hatırlatan ve motive eden bir öğretmen geri bildirimi (feedback) yaz.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          return NextResponse.json({
            success: true,
            feedback: response.text || '',
            source: 'gemini',
          });
        } catch (geminiError: any) {
          console.warn('Gemini feedback error:', geminiError.message);
        }
      }

      const pct = total ? Math.round((score / total) * 100) : 0;
      let feedbackText = '';
      if (pct >= 80) {
        feedbackText = `Harika bir performans ${studentName}! Konuyu çok iyi kavramışsın. Temel kurallara olan hakimiyetin ve dikkatli yaklaşımın tebrik edilmeye değer. Bu istikrarı koruyarak bir sonraki üniteye güvenle geçebilirsin! 🌟👏`;
      } else if (pct >= 50) {
        feedbackText = `Tebrikler ${studentName}, güzel bir gayret gösterdin. Temel noktalarda başarılısın ancak bazı küçük istisnaları ve ayrıntıları tekrar gözden geçirmen faydalı olacaktır. Yanlış yaptığın soruların açıklamalarına mutlaka bak! 📚💪`;
      } else {
        feedbackText = `Sevgili ${studentName}, bu konu biraz pratik gerektiriyor. Yanlış yaptığın soruların doğru çözümlerini dikkatle incele ve konu anlatım notlarına bir kez daha göz at. Birlikte yapacağımız bir sonraki derste bu noktaları pekiştireceğiz! ✨🚀`;
      }

      return NextResponse.json({
        success: true,
        feedback: feedbackText,
        source: 'fallback_template',
      });
    }

    if (action === 'explain_question') {
      const question = escapePromptInjection(sanitizeInput(body.question || '', 500));
      const studentAnswer = escapePromptInjection(sanitizeInput(body.studentAnswer || '', 300));
      const correctAnswer = escapePromptInjection(sanitizeInput(body.correctAnswer || '', 300));

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `${AI_SAFETY_DIRECTIVE}

Bir öğrenci aşağıdaki soruda hata yaptı:
Soru: "${question}"
Öğrencinin Verdiği Yanıt: "${studentAnswer || '(Boş bırakıldı)'}"
Doğru Yanıt: "${correctAnswer}"

Lütfen öğrenciye samimi, net ve öğretici bir dille doğrusunun neden "${correctAnswer}" olduğunu ve bu soru tipinde nelere dikkat etmesi gerektiğini adım adım açıkla.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          return NextResponse.json({
            success: true,
            explanation: response.text || '',
            source: 'gemini',
          });
        } catch (geminiError: any) {
          console.warn('Gemini explainer error:', geminiError.message);
        }
      }

      return NextResponse.json({
        success: true,
        explanation: `💡 **Soru Çözüm Analizi**:\n\n**Soru:** ${question}\n**Senin Cevabın:** ${studentAnswer || '(Boş)'}\n**Doğru Cevap:** **${correctAnswer}**\n\n📌 **Neden Doğru?**\nBu soru tipinde cümlenin zaman yapısı ve özne-yüklem uyumu belirleyicidir. Kural gereği doğru ifade **"${correctAnswer}"** olmalıdır. Konu tekrarı yaparken bu kuralı notlarına eklemeyi unutma!`,
        source: 'fallback_template',
      });
    }

    if (action === 'chat_assistant') {
      const message = escapePromptInjection(sanitizeInput(body.message || '', 1000));
      if (!message) {
        return NextResponse.json(
          { success: false, error: 'Mesaj metni boş olamaz.' },
          { status: 400 }
        );
      }

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `${AI_SAFETY_DIRECTIVE}

Sen EduFlow Pro'nun yapay zeka eğitim asistanısın. Öğretmenlere ders planlamada, öğrencilere ise konu anlamada yardımcı oluyorsun.
Kullanıcı Mesajı: "${message}"
Lütfen kısa, faydalı ve samimi bir yanıt ver.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          return NextResponse.json({
            success: true,
            reply: response.text || '',
            source: 'gemini',
          });
        } catch (geminiError: any) {
          console.warn('Gemini chat error:', geminiError.message);
        }
      }

      return NextResponse.json({
        success: true,
        reply: 'EduFlow Pro AI Asistanı devrede! Size nasıl yardımcı olabilirim?',
        source: 'fallback_template',
      });
    }

    return NextResponse.json({ success: false, error: 'Bilinmeyen istek.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function generateFallbackQuestions(topic: string, count: number) {
  const lower = topic.toLowerCase();
  if (lower.includes('matematik') || lower.includes('denklem') || lower.includes('üslü')) {
    const list = [
      { q: "2 üzeri 4 (2^4) işleminin sonucu kaçtır?", a: "16", explanation: "2*2*2*2 = 16" },
      { q: "3x + 5 = 20 denkleminde x kaçtır?", a: "5", explanation: "3x = 15 => x = 5" },
      { q: "Alanı 64 cm² olan bir karenin bir kenar uzunluğu kaç cm'dir?", a: "8", explanation: "8 * 8 = 64" },
      { q: "100 sayısının %25'i kaçtır?", a: "25", explanation: "100 * 0.25 = 25" },
      { q: "En küçük asal sayı kaçtır?", a: "2", explanation: "2 en küçük ve tek çift asal sayıdır." },
    ];
    return list.slice(0, count);
  }

  if (lower.includes('fizik') || lower.includes('kuvvet') || lower.includes('hız')) {
    const list = [
      { q: "Kuvvetin SI birim sistemindeki birimi nedir?", a: "Newton", explanation: "Kuvvet birimi Newton (N)'dur." },
      { q: "Hız formülü nedir? (yol / ...)", a: "zaman", explanation: "Hız = Alınan Yol / Zaman" },
      { q: "Yer çekimi ivmesi Dünya yüzeyinde yaklaşık kaç m/s² kabul edilir?", a: "10", explanation: "g ≈ 9.8 veya 10 m/s²" },
    ];
    return list.slice(0, count);
  }

  // Default English / General
  const defaultList = [
    { q: `'She ___ (go) to school by bus every day.' fiilin doğru hali?`, a: "goes", explanation: "He/She/It için Simple Present Tense fiile -es takısı getirir." },
    { q: `'They ___ not at home yesterday.' boşluğa gelen yardımcı fiil?`, a: "were", explanation: "Past tense 'they' öznesi için 'were' kullanılır." },
    { q: `'I have known him ___ 2018.' boşluğa gelen zaman edatı (for/since)?`, a: "since", explanation: "Belirli bir başlangıç yılı verildiğinde 'since' kullanılır." },
    { q: `'Look! The baby is ___ (sleep).' fiilin şimdiki zaman hali?`, a: "sleeping", explanation: "Present continuous tense 'is + V-ing' yapısındadır." },
  ];
  return defaultList.slice(0, count);
}

function generateFallbackNotes(topic: string) {
  return `📌 **${topic} — Konu Özeti ve Anahtar Kavramlar**\n\n### 1. Temel Kurallar ve Mantık\n- Konunun ana mantığını kavramak için temel formül ve kuralları öğrenin.\n- Önemli ipuçlarını ve istisnaları mutlaka not alın.\n\n### 2. Önemli Noktalar & Püf Noktaları\n✨ **Püf Noktası 1:** Soruları çözerken önce verilenleri listeleyin.\n✨ **Püf Noktası 2:** Sık yapılan kavram yanılgılarına ve çeldiricilere dikkat edin.\n\n### 3. Örnek Çözümlü Soru\n- **Soru:** Konuyla ilgili tipik bir soru kalıbı.\n- **Çözüm:** Adım adım inceleyip sonuca ulaşın.\n\n🎯 **Öğrenci Tavsiyesi:** Bu konudan günde en az 10-15 soru çözerek pekiştirme yapınız.`;
}
