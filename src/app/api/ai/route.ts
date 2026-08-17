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
  role?: 'teacher' | 'student';
  gradeLevel?: string;
  studentName?: string;
  score?: number;
  total?: number;
  mistakes?: Array<{ question: string; studentAnswer: string; correctAnswer: string }>;
  question?: string;
  studentAnswer?: string;
  correctAnswer?: string;
  message?: string;
  history?: Array<{ role: 'user' | 'assistant' | 'model'; text: string }>;
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

    // --------------------------------------------------------------------------
    // ACTION 1: GENERATE QUIZ (Dinamik, 4 Şıklı Çoktan Seçmeli Katı JSON Soru Motoru)
    // --------------------------------------------------------------------------
    if (action === 'generate_quiz') {
      const rawTopic = body.topic || 'Genel Konu Tekrarı';
      const topic = escapePromptInjection(sanitizeInput(rawTopic, 200)) || 'Genel Konu Tekrarı';
      const count = clampInteger(body.count, 1, 10, 3);
      const grade = escapePromptInjection(sanitizeInput(body.grade || body.gradeLevel || 'Ortaokul / LGS (5-8. Sınıf)', 100));

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `${AI_SAFETY_DIRECTIVE}

Sen Türkiye müfredatına ve sınav formatlarına (LGS, YKS, KPSS, ALES) hakim uzman bir soru yazarı ve eğitimcisin.
GÖREV: Aşağıda belirtilen konu ve eğitim seviyesine %100 uyumlu, orijinal, açık, 4 seçenekli (A, B, C, D) ${count} adet çoktan seçmeli soru hazırla.

Konu: "${topic}"
Seviye: "${grade}"
Soru Sayısı: ${count}

KURALLAR:
1. Sorular tamamen Türkçe olsun (eğer konu İngilizce değilse).
2. Her sorunun "options" dizisinde 4 adet gerçekçi ve anlamlı şık olmalıdır. Asla "Seçenek A", "Genel Yaklaşım", "Alternatif Yöntem" gibi anlamsız yer tutucu ifadeler KULLANMA.
3. "correctAnswer" değeri options dizisindeki doğru şık metniyle birebir aynı olmalıdır.
4. "q" ve "question" alanlarına soru metnini, "a" ve "correctAnswer" alanlarına doğru cevabı, "options" alanına 4 şıkkı, "explanation" alanına ise adım adım pedagojik çözüm açıklamasını yaz.
5. Yalnızca ve kesinlikle geçerli bir JSON nesnesi döndür (markdown kod bloğu veya ekstra metin ekleme).

JSON Şablonu:
{
  "title": "${topic} — Pratik Test",
  "folder": "${topic}",
  "desc": "${grade} seviyesine uygun ${count} soruluk çoktan seçmeli kazanım testi.",
  "timeLimit": ${count * 60},
  "questions": [
    {
      "question": "${topic} ile ilgili açık soru metni?",
      "q": "${topic} ile ilgili açık soru metni?",
      "options": [
        "A şıkkı gerçek metni",
        "B şıkkı gerçek metni",
        "C şıkkı gerçek metni",
        "D şıkkı gerçek metni"
      ],
      "correctAnswer": "A şıkkı gerçek metni",
      "a": "A şıkkı gerçek metni",
      "explanation": "Detaylı çözüm ve açıklama..."
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
            if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              const formattedQuestions = parsed.questions.map((q: any) => ({
                question: q.question || q.q || '',
                q: q.q || q.question || '',
                options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : [q.a || q.correctAnswer || 'Doğru', 'Yanlış 1', 'Yanlış 2', 'Yanlış 3'],
                correctAnswer: q.correctAnswer || q.a || '',
                a: q.a || q.correctAnswer || '',
                explanation: q.explanation || 'Doğru çözüm yöntemi uygulanmıştır.',
              }));

              return NextResponse.json({
                success: true,
                data: {
                  ...parsed,
                  questions: formattedQuestions,
                },
                source: 'gemini',
              });
            }
          }
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, falling back to intelligent dynamic generator:', geminiError.message);
        }
      }

      // Dynamic Contextual Question Generation with authentic 4 choices
      const dynamicQuestions = generateIntelligentDynamicQuestions(topic, grade, count);
      return NextResponse.json({
        success: true,
        data: {
          title: `${topic} — Kazanım Testi`,
          folder: topic,
          desc: `${grade} seviyesi için hazırlanmış ${count} soruluk konu kavrama testi.`,
          timeLimit: count * 60,
          questions: dynamicQuestions,
        },
        source: 'dynamic_engine',
      });
    }

    // --------------------------------------------------------------------------
    // ACTION 2: GENERATE LESSON NOTES
    // --------------------------------------------------------------------------
    if (action === 'generate_notes') {
      const rawTopic = body.topic || 'Önemli Konu';
      const topic = escapePromptInjection(sanitizeInput(rawTopic, 300)) || 'Önemli Konu';

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `${AI_SAFETY_DIRECTIVE}

Sen uzman bir öğretmensin. "${topic}" konusu hakkında öğrenciler için anlaşılır, akılda kalıcı, maddeli, örnekli ve formüllü/ipuçlu zengin bir Ders Notu hazırla. Türkçe olsun. Başlıklar ve emojilerle zenginleştir.`;

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
          console.warn('Gemini API call failed, falling back to dynamic note generator:', geminiError.message);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          title: `${topic} — Özet Ders Notu`,
          folder: topic,
          content: generateDynamicNotes(topic),
        },
        source: 'dynamic_engine',
      });
    }

    // --------------------------------------------------------------------------
    // ACTION 3: GENERATE STUDENT FEEDBACK
    // --------------------------------------------------------------------------
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

Sen destekleyici, motivasyon verici ve yapıcı bir öğretmensin.
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
        feedbackText = `Harika bir performans ${studentName}! ${topic} konusunu çok iyi kavramışsın. Temel kurallara olan hakimiyetin ve dikkatli yaklaşımın tebrik edilmeye değer. Bu istikrarı koruyarak sonraki konuya güvenle geçebilirsin! 🌟👏`;
      } else if (pct >= 50) {
        feedbackText = `Tebrikler ${studentName}, güzel bir gayret gösterdin. ${topic} konusunda temel noktalarda başarılısın ancak bazı küçük ayrıntıları tekrar gözden geçirmen faydalı olacaktır. Yanlış yaptığın soruların açıklamalarına mutlaka bak! 📚💪`;
      } else {
        feedbackText = `Sevgili ${studentName}, ${topic} konusu biraz daha pratik gerektiriyor. Yanlış yaptığın soruların doğru çözümlerini dikkatle incele ve konu anlatım notlarına bir kez daha göz at. Birlikte bu eksikleri hızla kapatacağız! ✨🚀`;
      }

      return NextResponse.json({
        success: true,
        feedback: feedbackText,
        source: 'dynamic_engine',
      });
    }

    // --------------------------------------------------------------------------
    // ACTION 4: EXPLAIN QUESTION
    // --------------------------------------------------------------------------
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
        explanation: `💡 **Soru Çözüm Analizi**:\n\n**Soru:** ${question}\n**Senin Cevabın:** ${studentAnswer || '(Boş)'}\n**Doğru Cevap:** **${correctAnswer}**\n\n📌 **Neden Doğru?**\nBu soru tipinde temel kavram tanımı ve kurallar gereğince doğru ifade **"${correctAnswer}"** olmalıdır. Konu tekrarı yaparken bu kuralı notlarına eklemeyi unutma!`,
        source: 'dynamic_engine',
      });
    }

    // --------------------------------------------------------------------------
    // ACTION 5: ADAPTIVE AI CHAT (Öğrenci & Öğretmen Seviye Odaklı Dinamik Rol)
    // --------------------------------------------------------------------------
    if (action === 'chat_assistant') {
      const message = escapePromptInjection(sanitizeInput(body.message || '', 1000));
      if (!message) {
        return NextResponse.json(
          { success: false, error: 'Mesaj metni boş olamaz.' },
          { status: 400 }
        );
      }

      const userRole = body.role || 'teacher';
      const gradeLevel = body.gradeLevel || body.grade || '';

      const history = Array.isArray(body.history)
        ? body.history.slice(-8).map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            text: sanitizeInput(h.text, 600),
          }))
        : [];

      // Determine persona based on role and registered gradeLevel
      let systemPersona = '';
      if (userRole === 'student') {
        const lowerGrade = gradeLevel.toLowerCase();
        if (lowerGrade.includes('ortaokul') || lowerGrade.includes('lgs')) {
          systemPersona = 'Sen 5-8. sınıf öğrencisine LGS hazırlıkta rehberlik eden samimi, motive edici bir özel ders öğretmenisin. Örnekleri günlük hayattan ve LGS yeni nesil soru mantığına uygun ver. Asla akademik pedagoji terimleri kullanma.';
        } else if (lowerGrade.includes('lise') || lowerGrade.includes('yks')) {
          systemPersona = 'Sen YKS koçusun. TYT-AYT sınav taktikleri, formül ispatları ve ÖSYM mantığı odaklı, net ve derinlemesine açıklamalar yap.';
        } else if (lowerGrade.includes('kpss') || lowerGrade.includes('ales') || lowerGrade.includes('lisans')) {
          systemPersona = 'Sen KPSS/ALES hazırlık uzmanısın. Mantık yürütme, mevzuat ve pratik soru çözüm teknikleri üzerinden yanıt ver.';
        } else {
          systemPersona = 'Sen öğrencine derslerinde ve kişisel gelişiminde samimi rehberlik eden modern bir eğitim koçusun. Örneklerle açık ve motive edici yanıtlar ver.';
        }
      } else {
        systemPersona = "Sen EduFlow Pro'nun kıdemli pedagojik danışmanı ve öğretmen asistanısın. Öğretmenlerin müfredat kazanımları, ders planları, soru hazırlama teknikleri, sınav analizi, sınıf yönetimi ve pedagojik yöntemler hakkındaki tüm sorularına uzman seviyesinde, ayrıntılı, maddeli, yapıcı ve samimi Türkçe yanıtlar üretirsin.";
      }

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
        try {
          const ai = new GoogleGenAI({ apiKey });

          const conversationContext = history
            .map((h) => `${h.role === 'user' ? (userRole === 'student' ? 'Öğrenci' : 'Öğretmen') : 'Eğitim Asistanı'}: ${h.text}`)
            .join('\n');

          const prompt = `${AI_SAFETY_DIRECTIVE}

${systemPersona}

Önceki Sohbet Geçmişi:
${conversationContext || '(Yeni görüşme başlatıldı)'}

Kullanıcının Yeni Mesajı: "${message}"

Lütfen samimi, net, maddeli ve ihtiyaca yönelik Türkçe bir yanıt ver.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          if (response.text && response.text.trim().length > 0) {
            return NextResponse.json({
              success: true,
              reply: response.text,
              source: 'gemini',
            });
          }
        } catch (geminiError: any) {
          console.warn('Gemini chat error:', geminiError.message);
        }
      }

      // Intelligent Contextual Response Fallback
      const dynamicReply = generateIntelligentChatReply(message, userRole, gradeLevel);
      return NextResponse.json({
        success: true,
        reply: dynamicReply,
        source: 'dynamic_engine',
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

// -----------------------------------------------------------------------------
// INTELLIGENT TOPIC-AWARE QUESTION GENERATOR (Turkish & Topic Contextual With 4 Choices)
// -----------------------------------------------------------------------------
function generateIntelligentDynamicQuestions(topic: string, grade: string, count: number) {
  const lower = topic.toLowerCase();

  // 1. Matematik / Geometri
  if (
    lower.includes('çarpan') ||
    lower.includes('ebob') ||
    lower.includes('ekok') ||
    lower.includes('matematik') ||
    lower.includes('üslü') ||
    lower.includes('köklü') ||
    lower.includes('denklem') ||
    lower.includes('oran') ||
    lower.includes('yüzde') ||
    lower.includes('fonksiyon') ||
    lower.includes('türev') ||
    lower.includes('integral') ||
    lower.includes('polinom') ||
    lower.includes('üçgen') ||
    lower.includes('pisagor')
  ) {
    const mathPool = [
      {
        question: `36 ve 48 sayılarının En Büyük Ortak Böleni (EBOB) kaçtır?`,
        q: `36 ve 48 sayılarının En Büyük Ortak Böleni (EBOB) kaçtır?`,
        options: ["12", "6", "18", "24"],
        correctAnswer: "12",
        a: "12",
        explanation: "36 ve 48 sayılarının ortak asal çarpanları 2^2 * 3 = 12'dir."
      },
      {
        question: `2 üzeri 5 (2^5) işleminin sonucu kaçtır?`,
        q: `2 üzeri 5 (2^5) işleminin sonucu kaçtır?`,
        options: ["32", "16", "64", "25"],
        correctAnswer: "32",
        a: "32",
        explanation: "2*2*2*2*2 = 32'dir."
      },
      {
        question: `4x - 8 = 24 denkleminde x bilinmeyeninin değeri kaçtır?`,
        q: `4x - 8 = 24 denkleminde x bilinmeyeninin değeri kaçtır?`,
        options: ["8", "6", "10", "4"],
        correctAnswer: "8",
        a: "8",
        explanation: "4x = 32 => x = 8 bulunur."
      },
      {
        question: `Dik kenarları 6 cm ve 8 cm olan dik üçgenin hipotenüs uzunluğu kaç cm'dir?`,
        q: `Dik kenarları 6 cm ve 8 cm olan dik üçgenin hipotenüs uzunluğu kaç cm'dir?`,
        options: ["10", "12", "14", "9"],
        correctAnswer: "10",
        a: "10",
        explanation: "6-8-10 özel dik üçgeni kuralından hipotenüs 10 cm'dir."
      },
      {
        question: `120 sayısının %30'u kaçtır?`,
        q: `120 sayısının %30'u kaçtır?`,
        options: ["36", "40", "30", "45"],
        correctAnswer: "36",
        a: "36",
        explanation: "120 * (30/100) = 36."
      },
      {
        question: `Karekök 144 (√144) sayısının değeri kaçtır?`,
        q: `Karekök 144 (√144) sayısının değeri kaçtır?`,
        options: ["12", "14", "16", "10"],
        correctAnswer: "12",
        a: "12",
        explanation: "12 * 12 = 144 olduğundan √144 = 12'dir."
      },
      {
        question: `f(x) = 2x + 5 fonksiyonunda f(3) değeri kaçtır?`,
        q: `f(x) = 2x + 5 fonksiyonunda f(3) değeri kaçtır?`,
        options: ["11", "10", "13", "8"],
        correctAnswer: "11",
        a: "11",
        explanation: "f(3) = 2(3) + 5 = 6 + 5 = 11'dir."
      }
    ];
    return mathPool.slice(0, count);
  }

  // 2. Fen Bilgisi / Biyoloji / Kimya / Fizik
  if (
    lower.includes('fotosentez') ||
    lower.includes('hücre') ||
    lower.includes('mitoz') ||
    lower.includes('mayoz') ||
    lower.includes('kuvvet') ||
    lower.includes('hareket') ||
    lower.includes('basınç') ||
    lower.includes('asit') ||
    lower.includes('baz') ||
    lower.includes('periyodik') ||
    lower.includes('atom') ||
    lower.includes('fen') ||
    lower.includes('fizik') ||
    lower.includes('kimya') ||
    lower.includes('biyoloji')
  ) {
    const sciPool = [
      {
        question: `Hücrede oksijenli solunumla hücresel enerji (ATP) üreten organel hangisidir?`,
        q: `Hücrede oksijenli solunumla hücresel enerji (ATP) üreten organel hangisidir?`,
        options: ["Mitokondri", "Ribozom", "Golgi Cihazı", "Lizozom"],
        correctAnswer: "Mitokondri",
        a: "Mitokondri",
        explanation: "Hücrenin enerji santrali mitokondridir."
      },
      {
        question: `Fotosentez reaksiyonları sonucunda atmosfere salınan gaz hangisidir?`,
        q: `Fotosentez reaksiyonları sonucunda atmosfere salınan gaz hangisidir?`,
        options: ["Oksijen", "Karbondioksit", "Azot", "Metan"],
        correctAnswer: "Oksijen",
        a: "Oksijen",
        explanation: "Suyun fotolizi sonucu oksijen gazı açığa çıkar."
      },
      {
        question: `Kuvvetin SI birim sistemindeki birimi nedir?`,
        q: `Kuvvetin SI birim sistemindeki birimi nedir?`,
        options: ["Newton", "Joule", "Pascal", "Watt"],
        correctAnswer: "Newton",
        a: "Newton",
        explanation: "Kuvvet birimi Isaac Newton'a ithafen Newton (N)'dur."
      },
      {
        question: `pH değeri 7'den küçük olan sulu çözeltilerin kimyasal özelliği nedir?`,
        q: `pH değeri 7'den küçük olan sulu çözeltilerin kimyasal özelliği nedir?`,
        options: ["Asidik", "Bazik", "Nötr", "Tuzlu"],
        correctAnswer: "Asidik",
        a: "Asidik",
        explanation: "0-7 arası pH değerleri asitleri gösterir."
      },
      {
        question: `DNA zincirinde Adenin (A) nükleotidinin karşısına hangi baz gelir?`,
        q: `DNA zincirinde Adenin (A) nükleotidinin karşısına hangi baz gelir?`,
        options: ["Timin", "Guanin", "Sitozin", "Urasil"],
        correctAnswer: "Timin",
        a: "Timin",
        explanation: "DNA çift sarmalında A=T eşleşmesi kuraldır."
      }
    ];
    return sciPool.slice(0, count);
  }

  // 3. Türkçe / Dil Bilgisi / Edebiyat
  if (
    lower.includes('türkçe') ||
    lower.includes('edebiyat') ||
    lower.includes('paragraf') ||
    lower.includes('fiilimsi') ||
    lower.includes('yazım') ||
    lower.includes('noktalama') ||
    lower.includes('cümlenin ögeleri') ||
    lower.includes('ses olayları')
  ) {
    const trPool = [
      {
        question: `Bir cümlede işi, hareketi veya durumu bildiren temel kurucu öge hangisidir?`,
        q: `Bir cümlede işi, hareketi veya durumu bildiren temel kurucu öge hangisidir?`,
        options: ["Yüklem", "Özne", "Nesne", "Tümleç"],
        correctAnswer: "Yüklem",
        a: "Yüklem",
        explanation: "Yüklem cümlenin en temel yargı ögesidir."
      },
      {
        question: `"Koşan çocukları izledi" cümlesindeki "koşan" kelimesi hangi fiilimsi türüdür?`,
        q: `"Koşan çocukları izledi" cümlesindeki "koşan" kelimesi hangi fiilimsi türüdür?`,
        options: ["Sıfat-fiil", "İsim-fiil", "Zarf-fiil", "Çekimli fiil"],
        correctAnswer: "Sıfat-fiil",
        a: "Sıfat-fiil",
        explanation: "-an eki almış sıfat-fiil (ortaç) görevindedir."
      },
      {
        question: `Bir paragrafta yazarın okuyucuya iletmek istediği asıl düşünceye ne ad verilir?`,
        q: `Bir paragrafta yazarın okuyucuya iletmek istediği asıl düşünceye ne ad verilir?`,
        options: ["Ana fikir", "Konu", "Yardımcı fikir", "Başlık"],
        correctAnswer: "Ana fikir",
        a: "Ana fikir",
        explanation: "Metnin yazılış amacını özetleyen temel yargı ana fikirdir."
      },
      {
        question: `"Kitap-ı" sözcüğünün "Kitabı" şeklinde söylenmesi hangi ses olayıdır?`,
        q: `"Kitap-ı" sözcüğünün "Kitabı" şeklinde söylenmesi hangi ses olayıdır?`,
        options: ["Ünsüz yumuşaması", "Ünsüz benzeşmesi", "Ünlü daralması", "Ünlü düşmesi"],
        correctAnswer: "Ünsüz yumuşaması",
        a: "Ünsüz yumuşaması",
        explanation: "p sesinin b'ye dönüşmesi ünsüz yumuşamasıdır."
      }
    ];
    return trPool.slice(0, count);
  }

  // 4. Genel
  const generalPool = [
    {
      question: `"${topic}" konusunda problem çözerken izlenmesi gereken ilk ve en kritik adım hangisidir?`,
      q: `"${topic}" konusunda problem çözerken izlenmesi gereken ilk ve en kritik adım hangisidir?`,
      options: ["Verilenleri ve isteneni netleştirmek", "Doğrudan işlem yapmak", "Şıklardan gitmek", "Soruyu atlamak"],
      correctAnswer: "Verilenleri ve isteneni netleştirmek",
      a: "Verilenleri ve isteneni netleştirmek",
      explanation: "Analitik soru çözümünün temeli eldeki parametreleri ve isteneni belirlemektir."
    },
    {
      question: `"${topic}" ünitesinin odaklandığı temel kavramsal kazanım nedir?`,
      q: `"${topic}" ünitesinin odaklandığı temel kavramsal kazanım nedir?`,
      options: ["Kavramlar arası sebep-sonuç bağı kurma", "Ezbere formül uygulama", "Sadece teorik tanım öğrenme", "Zaman kısıtını göz ardı etme"],
      correctAnswer: "Kavramlar arası sebep-sonuç bağı kurma",
      a: "Kavramlar arası sebep-sonuç bağı kurma",
      explanation: "Kalıcı öğrenme için kavramların mantıksal ilişkisi kavranmalıdır."
    },
    {
      question: `"${topic}" kazanımında karşılaşılan çeldiricilere karşı en etkili strateji nedir?`,
      q: `"${topic}" kazanımında karşılaşılan çeldiricilere karşı en etkili strateji nedir?`,
      options: ["Soru kökünü dikkatle okuyup sağlamasını yapmak", "İlk akla gelen şıkkı işaretlemek", "Uzun seçenekleri doğrudan elemek", "Sadece formülü yazıp bırakmak"],
      correctAnswer: "Soru kökünü dikkatle okuyup sağlamasını yapmak",
      a: "Soru kökünü dikkatle okuyup sağlamasını yapmak",
      explanation: "Soru kökünün altı çizili ifadelerini teyit etmek hata oranını sıfırlar."
    }
  ];
  return generalPool.slice(0, count);
}

function generateDynamicNotes(topic: string) {
  return `📌 **${topic} — Kapsamlı Ders Notu & Kazanım Rehberi**

### 1. Konunun Temel Mantığı ve Önemi
- **${topic}**, müfredatın temel yapı taşlarından biridir.
- Bu konuyu kavramak, ilişkili alt üniteleri ve problem çözme süreçlerini kolaylaştırır.

### 2. Önemli Püf Noktaları ve Formüller
✨ **Kural 1:** Sorularda verilen anahtar kelimeleri ve tanımları dikkatle işaretleyin.
✨ **Kural 2:** Sık yapılan kavram yanılgılarına ve çeldiricilere karşı uyanık olun.
✨ **Kural 3:** Adım adım işlem yaparak sonucu her zaman bir kez daha kontrol edin.

### 3. Örnek Soru Analizi ve Çözüm Stratejisi
- **Adım 1:** Sorunun kökünü ve ne istediğini belirleyin.
- **Adım 2:** ${topic} konusuna ait temel kuralı soruya uygulayın.
- **Adım 3:** Ulaşılan sonucu sadeleştirin ve mantıksal tutarlılığını onaylayın.

🎯 **Öğretmen Tavsiyesi:** Bu üniteden sonra en az 10-15 pekiştirme sorusu çözerek kazanımı kalıcı hale getirin.`;
}

function generateIntelligentChatReply(userMessage: string, role: string, gradeLevel: string) {
  const lower = userMessage.toLowerCase();

  if (role === 'student') {
    const isLGS = gradeLevel.toLowerCase().includes('lgs') || gradeLevel.toLowerCase().includes('ortaokul');
    const isYKS = gradeLevel.toLowerCase().includes('yks') || gradeLevel.toLowerCase().includes('lise');

    if (lower.includes('taktik') || lower.includes('nasıl çalışmalı') || lower.includes('sınav')) {
      if (isLGS) {
        return `Harika bir soru! LGS'de yeni nesil soruları kaçırmamak için 3 altın kural:

1. **Paragrafı / Şekli Anla:** Soru uzun görünse de korkma, önce verilen görsel veya hikayedeki matematiksel ilişkiyi bul.
2. **Günde 20 Paragraf + 15 Matematik:** Bu ritim sınavda okuma hızını ikiye katlar.
3. **Yanlışını Analiz Et:** Yanlış yaptığın sorunun çözümünü buradaki asistanına sor veya öğretmenine danış.

Hangi konudan başlamak istersin? İstersen yukarıdaki pratik test butonundan hemen başlayalım! 🚀`;
      }
      if (isYKS) {
        return `YKS maratonunda net artışı sağlamak için stratejik adımlar:

1. **TYT Temeli & Hız:** Türkçe paragraf ve Problem rutinini asla aksatma.
2. **AYT Derinliği:** Formülleri ezberlemek yerine ispat mantığını ve ÖSYM'nin geçmiş yıllarda sorduğu soru tiplerini incele.
3. **Deneme Analizi:** Haftalık alan denemesi çözüp yanlışlarının defterini tut.

İstediğin ders veya konu için hemen özet ve taktik çıkarabilirim. 🎯`;
      }
    }

    return `Sorunu inceledim! Bu konuda pratik yaparken dikkat etmen gereken en önemli nokta, temel formülü adım adım uygulamak ve şıklardaki çeldiricilere dikkat etmektir. 

Dilersen bu konudan hemen 3-5 soruluk bir alıştırma testi oluşturalım, ne dersin? ✨`;
  }

  // Teacher reply
  return `Hocam, bu konuyla ilgili sınıfınız için MEB kazanımlarına tam uyumlu ders planı ve interaktif sınav soruları hazırlayabilirim. Dilerseniz "Test & Soru Hazırlama" sekmesinden saniyeler içinde yeni bir ünite testi oluşturabilirsiniz! 🎓`;
}
