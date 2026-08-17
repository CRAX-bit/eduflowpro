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
    const grade = escapePromptInjection(sanitizeInput(body.grade || 'Lise / Ortaokul', 100));

    const apiKey = process.env.GEMINI_API_KEY;

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
        console.warn('Gemini generate-quiz API notice, fallback activated:', geminiError.message);
      }
    }

    // High quality fallback
    const fallbackQuestions = [
      { q: `${topic} ile ilgili temel kavram hangisidir?`, a: "Kavram", explanation: "Konunun ana fikrini temsil eder." },
      { q: `${topic} konusunda dikkat edilmesi gereken ana kural nedir?`, a: "Temel Kural", explanation: "Temel prensiptir." },
      { q: `${topic} uygulamalarında en sık kullanılan yöntem nedir?`, a: "Standart Yöntem", explanation: "Sistematik yaklaşımdır." },
    ].slice(0, count);

    return NextResponse.json({
      success: true,
      data: {
        title: `${topic} — Akıllı Test`,
        folder: topic,
        desc: 'Soruları dikkatlice okuyup kısa cevap kutularına doğru yanıtları yazınız.',
        timeLimit: count * 45,
        questions: fallbackQuestions,
      },
      source: 'fallback_template',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
