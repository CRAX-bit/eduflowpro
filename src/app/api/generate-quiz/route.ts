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

Sen uzman bir eğitimcisin. Aşağıda belirtilen konu ve eğitim seviyesine %100 uyumlu, orijinal, açık, tek ve kesin cevabı olan ${count} adet interaktif kısa cevaplı soru hazırla.

Konu: "${topic}"
Seviye: "${grade}"
Soru Sayısı: ${count}

Kurallar:
1. Sorular tamamen Türkçe olsun (eğer konu İngilizce değilse).
2. Cevaplar tek kelime, formül sonucu veya kısa net bir ifade olsun (örn: "16", "Mitokondri", "Özne", "Newton", "since").
3. Her soru için pedagojik ve öğretici kısa bir çözüm açıklaması (explanation) ekle.
4. Yalnızca ve kesinlikle geçerli bir JSON nesnesi döndür (markdown kod bloğu veya ekstra açıklama yazma).

JSON Şablonu:
{
  "title": "${topic} — Değerlendirme Testi",
  "folder": "${topic}",
  "desc": "${grade} seviyesine uygun ${count} soruluk kazanım kavrama ve pratik testi.",
  "timeLimit": ${count * 45},
  "questions": [
    {
      "q": "${topic} konusu ile ilgili net soru metni?",
      "a": "Kısa kesin doğru cevap",
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
            return NextResponse.json({ success: true, data: parsed, source: 'gemini' });
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini generate-quiz API notice, fallback activated:', geminiError.message);
      }
    }

    // Dynamic Topic Fallback
    const dynamicQuestions = [
      {
        q: `"${topic}" konusunda problem çözerken dikkat edilmesi gereken temel kural nedir?`,
        a: "Temel Kural",
        explanation: `${topic} kazanımının ana mantığıdır.`
      },
      {
        q: `"${topic}" ünitesinin odaklandığı ana kavram hangisidir?`,
        a: "Kavram",
        explanation: `Konuyla ilgili temel kavramın doğru analizidir.`
      },
      {
        q: `"${topic}" uygulamalarında ulaşılan sonucun doğrulanma yöntemi nedir?`,
        a: "Kontrol",
        explanation: "İşlemlerin adım adım teyit edilmesidir."
      }
    ].slice(0, count);

    return NextResponse.json({
      success: true,
      data: {
        title: `${topic} — Kazanım Testi`,
        folder: topic,
        desc: `${grade} seviyesi için hazırlanmış ${count} soruluk konu kavrama testi.`,
        timeLimit: count * 45,
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
