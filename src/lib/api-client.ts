import { supabase } from '@/lib/supabase';
import { UserSession } from '@/types';

/**
 * Builds security & authentication headers for client-side API calls.
 */
export async function getAuthHeaders(session?: UserSession | null): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // 1. Check active Supabase JWT
    const { data: { session: sbSession } } = await supabase.auth.getSession();
    if (sbSession?.access_token) {
      headers['Authorization'] = `Bearer ${sbSession.access_token}`;
    }

    // 2. Attach EduFlow platform session info if available
    const activeSession = session || (sbSession?.user ? {
      role: (sbSession.user.user_metadata?.role as any) || 'teacher',
      email: sbSession.user.email,
      name: sbSession.user.user_metadata?.full_name || 'Kullanıcı',
      supabaseId: sbSession.user.id,
      studentId: sbSession.user.id,
    } : null);

    if (activeSession) {
      const payload = {
        id: activeSession.supabaseId || activeSession.studentId || 'session-user',
        email: activeSession.email || '',
        role: activeSession.role,
        name: activeSession.name || '',
        timestamp: Date.now(),
      };
      headers['x-eduflow-session'] = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    }
  } catch (e) {
    console.warn('Could not compile auth headers for API call', e);
  }

  return headers;
}

/**
 * Robust wrapper around fetch for secured AI API endpoints.
 */
export async function secureAiFetch(
  url: string,
  body: Record<string, any>,
  session?: UserSession | null
): Promise<Response> {
  const headers = await getAuthHeaders(session);
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}
