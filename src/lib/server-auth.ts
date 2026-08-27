import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface VerifiedAuthUser {
  id: string;
  email?: string;
  role?: string;
  name?: string;
}

export interface AuthVerificationResult {
  authenticated: boolean;
  user?: VerifiedAuthUser;
  error?: string;
}

/**
 * Server-side authentication guard for Next.js Route Handlers.
 * Verifies Supabase Bearer token, session headers, or cookies.
 * Returns 401 Unauthorized response helper if not authenticated.
 */
export async function verifyServerAuth(req: NextRequest): Promise<AuthVerificationResult> {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const eduflowSessionHeader = req.headers.get('x-eduflow-session');

    // 1. Check Supabase Bearer Token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token && token !== 'undefined' && token !== 'null') {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          return {
            authenticated: true,
            user: {
              id: user.id,
              email: user.email,
              role: user.user_metadata?.role || 'user',
              name: user.user_metadata?.full_name || user.user_metadata?.name,
            },
          };
        }
      }
    }

    // 2. Check Cookie-based session
    const tokenFromCookie = req.cookies.get('sb-access-token')?.value || req.cookies.get('supabase-auth-token')?.value;
    if (tokenFromCookie) {
      const { data: { user }, error } = await supabase.auth.getUser(tokenFromCookie);
      if (user && !error) {
        return {
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
            name: user.user_metadata?.full_name || user.user_metadata?.name,
          },
        };
      }
    }

    // 3. Check EduFlow Platform Session Header (for active student/teacher sessions)
    if (eduflowSessionHeader) {
      try {
        const parsed = JSON.parse(Buffer.from(eduflowSessionHeader, 'base64').toString('utf-8'));
        if (parsed && parsed.id && (parsed.role === 'teacher' || parsed.role === 'student')) {
          // Verify timestamp is within reasonable window (e.g. not older than 7 days)
          const now = Date.now();
          if (!parsed.timestamp || (now - parsed.timestamp < 7 * 24 * 60 * 60 * 1000)) {
            return {
              authenticated: true,
              user: {
                id: parsed.id,
                email: parsed.email,
                role: parsed.role,
                name: parsed.name,
              },
            };
          }
        }
      } catch {
        // Invalid session header payload
      }
    }

    return {
      authenticated: false,
      error: 'Yetkisiz erişim: Bu API endpointini kullanmak için aktif ve geçerli bir Deskio oturumu gereklidir.',
    };
  } catch (err: any) {
    return {
      authenticated: false,
      error: err?.message || 'Yetkilendirme doğrulaması sırasında bir hata oluştu.',
    };
  }
}

/**
 * Creates a standard 401 Unauthorized JSON response.
 */
export function unauthorizedResponse(message?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message || 'Yetkisiz erişim: Bu işlem için aktif bir oturum gereklidir.',
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}
