import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { verifyServerAuth, unauthorizedResponse } from '@/lib/server-auth';
import { sanitizeInput, escapePromptInjection, clampInteger, AI_SAFETY_DIRECTIVE } from '@/lib/security';
import { getClientIdentifier, checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limiter';

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

    const body = await req.json();
    const rawTopic = body.topic || 'Genel Konu Tekrarı';
    const topic = escapePromptInjection(sanitizeInput(rawTopic, 200)) || 'Genel Konu Tekrarı';
    const count = clampInteger(body.count, 1, 10, 3);
    const grade = escapePromptInjection(sanitizeInput(body.grade || 'Ortaokul / LGS (5-8. Sınıf)', 100));

    const apiKey = process.env.GEMINI_API_KEY;

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
        console.warn('Gemini generate-quiz API notice, fallback activated:', geminiError.message);
      }
    }

    // Dynamic Topic Fallback
    const dynamicQuestions = [
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
    ].slice(0, count);

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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
