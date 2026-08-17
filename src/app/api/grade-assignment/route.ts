import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { verifyServerAuth, unauthorizedResponse } from '@/lib/server-auth';
import { sanitizeInput, escapePromptInjection, MAX_STUDENT_ANSWER_LENGTH, AI_SAFETY_DIRECTIVE } from '@/lib/security';
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
    const rawAnswer = body.studentAnswer || '';
    
    // 2. Input Sanitization & Abuse Prevention
    const studentAnswer = escapePromptInjection(sanitizeInput(rawAnswer, MAX_STUDENT_ANSWER_LENGTH));
    const assignmentTitle = escapePromptInjection(sanitizeInput(body.assignmentTitle || 'Ödev', 200));
    const assignmentDesc = escapePromptInjection(sanitizeInput(body.assignmentDesc || 'Açıklama belirtilmedi', 500));
    const studentName = escapePromptInjection(sanitizeInput(body.studentName || 'Öğrenci', 100));
    const folder = escapePromptInjection(sanitizeInput(body.folder || 'Genel', 150));

    if (!studentAnswer || !studentAnswer.trim()) {
      return NextResponse.json(
        { success: false, error: 'Öğrenci yanıtı boş olamaz.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `${AI_SAFETY_DIRECTIVE}

Sen Türkiye'nin en iyi ve en yapıcı özel ders öğretmenisin.
Aşağıda verilen ödev detaylarını ve öğrencinin yazmış olduğu ödev yanıtını dikkatle incele:

Ödev Başlığı: "${assignmentTitle}"
Konu / Ünite: "${folder}"
Ödev Yönergesi & Açıklaması: "${assignmentDesc}"
Öğrenci Adı: "${studentName}"
Öğrencinin Yanıtı:
"""
${studentAnswer}
"""

GÖREVİN:
1. Öğrencinin yanıtını ödev konusu ve yönergeleriyle karşılaştır.
2. 100 üzerinden adil, objektif bir puan (0 ile 100 arası bir tamsayı) belirle.
3. Öğrenciye hitaben 2-4 cümlelik samimi, motive edici, pedagojik ve yapıcı Türkçe bir değerlendirme (feedback) yaz.
4. Yanıtın güçlü yönlerini (strengths: en az 2 madde) ve geliştirmesi gereken eksik/öneri noktalarını (improvements: en az 1-2 madde) belirle.

Lütfen SADECE ve SADECE aşağıdaki JSON formatında geçerli bir JSON yanıt ver:
{
  "score": 85,
  "feedback": "Sevgili ${studentName}, ödevini çok beğendim! Konuyu gayet net kavramışsın...",
  "strengths": [
    "Kavramları yerinde ve doğru kullanmışsın.",
    "Açıklamaların mantıklı ve akıcı."
  ],
  "improvements": [
    "Birkaç somut örnek daha ekleyerek anlatımını zenginleştirebilirsin."
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
          return NextResponse.json({
            success: true,
            data: {
              score: Math.min(100, Math.max(0, Number(parsed.score) || 75)),
              feedback: parsed.feedback || 'Ödeviniz başarıyla değerlendirildi.',
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Güzel bir çaba gösterilmiş.'],
              improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Daha fazla pratik yapılabilir.'],
            },
            source: 'gemini',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini grade-assignment notice:', geminiError.message);
      }
    }

    // Heuristic fallback
    const length = studentAnswer.trim().length;
    let fallbackScore = 75;
    let feedback = `Tebrikler ${studentName}, ödevini başarıyla teslim ettin. Konuya odaklanman gayet güzel.`;
    let strengths = ['Yönergelere uygun hazırlık', 'Zamanında teslim'];
    let improvements = ['Detayları genişletme'];

    if (length > 200) {
      fallbackScore = 92;
      feedback = `Harika bir çalışma ${studentName}! Analitik yaklaşımın ve detaylı açıklamaların çok başarılı.`;
      strengths = ['Kapsamlı anlatım', 'Doğru terminoloji kullanımı'];
    }

    return NextResponse.json({
      success: true,
      data: {
        score: fallbackScore,
        feedback,
        strengths,
        improvements,
      },
      source: 'heuristic_fallback',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
