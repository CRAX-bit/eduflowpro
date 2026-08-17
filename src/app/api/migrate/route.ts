import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Bu route sadece GET isteği ile migration çalıştırır.
// Supabase service_role key gerektirir (RLS bypass için).
// GET /api/migrate → Migration SQL'i çalıştırır ve sonucu döner.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odcjutuhntudjdgxxons.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'eduflow_migrate_2026';

// Migration SQL — Idempotent (IF NOT EXISTS) güvenli
const MIGRATION_SQL = `
-- deadline kolonu: TIMESTAMPTZ (NULL = son tarih yok)
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ DEFAULT NULL;

-- target_mode kolonu: 'all' | 'individual'
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS target_mode TEXT DEFAULT 'all'
    CHECK (target_mode IN ('all', 'individual'));

-- Mevcut NULL satırları güncelle
UPDATE public.assignments
  SET target_mode = 'all'
  WHERE target_mode IS NULL;

-- Performans index'i
CREATE INDEX IF NOT EXISTS idx_assignments_deadline
  ON public.assignments (deadline)
  WHERE deadline IS NOT NULL;
`;

export async function GET(request: Request) {
  // Güvenlik: secret parametresi ile koruma
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== MIGRATION_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized. ?secret=<migration_secret> parametresi gereklidir.' },
      { status: 401 }
    );
  }

  if (!SERVICE_ROLE_KEY) {
    // service_role key yoksa bilgi ver
    return NextResponse.json(
      {
        error: 'SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlanmamış.',
        hint: '.env.local dosyasına SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key> ekleyin.',
        dashboard_url: 'https://supabase.com/dashboard/project/odcjutuhntudjdgxxons/settings/api',
        manual_sql: MIGRATION_SQL.trim(),
      },
      { status: 503 }
    );
  }

  // service_role client (RLS bypass, DDL yetkisi için)
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // Supabase JS doğrudan DDL çalıştıramaz — pg_meta Management API kullanılır
    // Bunun için Supabase Management REST API /v1/projects/{ref}/database/query endpoint'i
    const projectRef = 'odcjutuhntudjdgxxons';
    
    // Supabase Management API ile SQL çalıştır
    const mgmtResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // service_role key, Management API token değil — bunun için ayrı token gerekir
          // Bunun yerine pg_net extension veya postgres function ile çalıştıralım
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: MIGRATION_SQL }),
      }
    );

    // Management API başarılı değilse, pg function ile dene
    if (!mgmtResponse.ok) {
      const mgmtErr = await mgmtResponse.text();
      console.warn('Management API failed, trying pg function:', mgmtErr);

      // Alternatif: exec_sql RPC function'ı varsa kullan
      const { data, error } = await adminClient.rpc('exec_sql', {
        query: MIGRATION_SQL,
      });

      if (error) {
        // Kolon zaten var mı kontrol et
        const { data: columns } = await adminClient
          .from('information_schema.columns' as any)
          .select('column_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'assignments')
          .in('column_name', ['deadline', 'target_mode']);

        return NextResponse.json({
          status: 'partial',
          message: 'Migration exec_sql ile çalıştırılamadı. Manuel SQL çalıştırın.',
          error: error.message,
          existing_columns: columns,
          manual_sql: MIGRATION_SQL.trim(),
          dashboard_sql_editor: `https://supabase.com/dashboard/project/${projectRef}/sql/new`,
        });
      }

      return NextResponse.json({
        status: 'success',
        method: 'exec_sql_rpc',
        message: 'Migration başarıyla çalıştırıldı!',
        data,
      });
    }

    const result = await mgmtResponse.json();
    return NextResponse.json({
      status: 'success',
      method: 'management_api',
      message: 'Migration başarıyla uygulandı!',
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: err.message,
        manual_sql: MIGRATION_SQL.trim(),
        dashboard_sql_editor: 'https://supabase.com/dashboard/project/odcjutuhntudjdgxxons/sql/new',
      },
      { status: 500 }
    );
  }
}
