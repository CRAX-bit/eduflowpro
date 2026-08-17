-- ============================================================
-- EduFlow Pro – assignments tablosu deadline & target_mode migration
-- Tarih: 2026-08-18
-- ============================================================

-- 1. deadline kolonu: timestamptz (NULL = son tarih yok)
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ DEFAULT NULL;

-- 2. target_mode kolonu: 'all' veya 'individual' (varsayılan 'all')
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS target_mode TEXT DEFAULT 'all'
    CHECK (target_mode IN ('all', 'individual'));

-- 3. submissions içinde note alanı zaten JSONB içinde gömülü
--    (EduFlowContext JSONB patch ile yazıyor, ayrı kolon gerekmez)

-- 4. Performans için index: deadline üzerine (aktif deadline sorguları)
CREATE INDEX IF NOT EXISTS idx_assignments_deadline
  ON public.assignments (deadline)
  WHERE deadline IS NOT NULL;

-- 5. Mevcut satırları güncelle: target_mode = 'all' (varolan NULL olanlar)
UPDATE public.assignments
  SET target_mode = 'all'
  WHERE target_mode IS NULL;
