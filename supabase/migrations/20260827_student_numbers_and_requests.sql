-- ============================================================
-- EduFlow Pro / Deskio – Öğrenci Numarası + Öğrenci Ekleme İsteği Sistemi
-- Tarih: 2026-08-27
-- Çalıştırma: Supabase Dashboard > SQL Editor > tümünü yapıştır > Run
-- Idempotent: birden fazla kez çalıştırılabilir.
-- ============================================================

-- ------------------------------------------------------------
-- 0) profiles tablosunda uygulamanın beklediği kolonlar
--    (grade_level / branch yoksa RPC'ler ve profil upsert'i patlar)
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS grade_level TEXT,
  ADD COLUMN IF NOT EXISTS branch      TEXT,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT now();

-- ------------------------------------------------------------
-- 1) profiles.student_no  (6 haneli benzersiz öğrenci numarası)
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_no TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_no_key
  ON public.profiles (student_no)
  WHERE student_no IS NOT NULL;

-- Benzersiz 6 haneli numara üretici
CREATE OR REPLACE FUNCTION public.generate_student_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_no TEXT;
  v_try INT := 0;
BEGIN
  LOOP
    v_no := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.student_no = v_no);
    v_try := v_try + 1;
    IF v_try > 50 THEN
      -- Aşırı çakışma durumunda 8 haneye çık
      v_no := lpad((floor(random() * 90000000) + 10000000)::bigint::text, 8, '0');
      EXIT;
    END IF;
  END LOOP;
  RETURN v_no;
END;
$$;

-- Her yeni öğrenci profiline otomatik numara ver
CREATE OR REPLACE FUNCTION public.assign_student_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.role, 'student') = 'student' AND (NEW.student_no IS NULL OR NEW.student_no = '') THEN
    NEW.student_no := public.generate_student_no();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_student_no ON public.profiles;
CREATE TRIGGER trg_assign_student_no
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_student_no();

-- Mevcut öğrencilere geriye dönük numara ata
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM public.profiles
    WHERE COALESCE(role, 'student') = 'student'
      AND (student_no IS NULL OR student_no = '')
  LOOP
    UPDATE public.profiles
      SET student_no = public.generate_student_no()
      WHERE id = r.id;
  END LOOP;
END;
$$;

-- ------------------------------------------------------------
-- 2) İsim maskeleme yardımcısı ("Zeynep Çelik" -> "Z*** Ç***")
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mask_full_name(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_word TEXT;
  v_out TEXT := '';
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RETURN 'Ö***';
  END IF;

  FOREACH v_word IN ARRAY regexp_split_to_array(btrim(p_name), '\s+')
  LOOP
    IF length(v_word) > 0 THEN
      v_out := v_out || left(v_word, 1) || '***' || ' ';
    END IF;
  END LOOP;

  RETURN btrim(v_out);
END;
$$;

-- ------------------------------------------------------------
-- 3) student_requests tablosu (öğretmen -> öğrenci ekleme isteği)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_no    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at  TIMESTAMPTZ,
  CONSTRAINT student_requests_unique_pair UNIQUE (teacher_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_requests_teacher
  ON public.student_requests (teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_student_requests_student
  ON public.student_requests (student_id, status);

ALTER TABLE public.student_requests ENABLE ROW LEVEL SECURITY;

-- Öğretmen kendi gönderdiği istekleri görür
DROP POLICY IF EXISTS "teacher reads own requests" ON public.student_requests;
CREATE POLICY "teacher reads own requests"
  ON public.student_requests FOR SELECT
  USING (auth.uid() = teacher_id);

-- Öğrenci kendisine gelen istekleri görür
DROP POLICY IF EXISTS "student reads incoming requests" ON public.student_requests;
CREATE POLICY "student reads incoming requests"
  ON public.student_requests FOR SELECT
  USING (auth.uid() = student_id);

-- Öğretmen kendi adına istek oluşturur
DROP POLICY IF EXISTS "teacher creates own requests" ON public.student_requests;
CREATE POLICY "teacher creates own requests"
  ON public.student_requests FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Öğrenci sadece kendi isteğinin durumunu değiştirir
DROP POLICY IF EXISTS "student updates own request" ON public.student_requests;
CREATE POLICY "student updates own request"
  ON public.student_requests FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Öğretmen kendi isteğini siler (iptal / öğrenciyi listeden çıkar)
DROP POLICY IF EXISTS "teacher deletes own requests" ON public.student_requests;
CREATE POLICY "teacher deletes own requests"
  ON public.student_requests FOR DELETE
  USING (auth.uid() = teacher_id);

-- ------------------------------------------------------------
-- 4) RPC: Numara ile öğrenci sorgula (SADECE maskeli isim döner)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lookup_student_by_no(p_student_no TEXT)
RETURNS TABLE (
  student_id   UUID,
  masked_name  TEXT,
  grade_level  TEXT,
  already_sent BOOLEAN,
  request_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_no TEXT := btrim(p_student_no);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum bulunamadi';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    public.mask_full_name(p.full_name)::text,
    p.grade_level::text,
    (sr.id IS NOT NULL),
    sr.status::text
  FROM public.profiles p
  LEFT JOIN public.student_requests sr
    ON sr.student_id = p.id AND sr.teacher_id = auth.uid()
  WHERE p.student_no = v_no
    AND COALESCE(p.role, 'student') = 'student'
  LIMIT 1;
END;
$$;

-- ------------------------------------------------------------
-- 5) RPC: Öğretmen numara ile ekleme isteği gönderir
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_student_request(p_student_no TEXT)
RETURNS TABLE (
  request_id  UUID,
  student_id  UUID,
  masked_name TEXT,
  status      TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teacher UUID := auth.uid();
  v_no      TEXT := btrim(p_student_no);
  v_student public.profiles%ROWTYPE;
  v_req     public.student_requests%ROWTYPE;
BEGIN
  IF v_teacher IS NULL THEN
    RAISE EXCEPTION 'Oturum bulunamadi';
  END IF;

  SELECT * INTO v_student
  FROM public.profiles
  WHERE student_no = v_no AND COALESCE(role, 'student') = 'student'
  LIMIT 1;

  IF v_student.id IS NULL THEN
    RAISE EXCEPTION 'Bu numaraya sahip bir ogrenci bulunamadi';
  END IF;

  IF v_student.id = v_teacher THEN
    RAISE EXCEPTION 'Kendinize istek gonderemezsiniz';
  END IF;

  INSERT INTO public.student_requests (teacher_id, student_id, student_no, status)
  VALUES (v_teacher, v_student.id, v_no, 'pending')
  ON CONFLICT ON CONSTRAINT student_requests_unique_pair DO UPDATE
    SET status = CASE
                   WHEN student_requests.status = 'rejected' THEN 'pending'
                   ELSE student_requests.status
                 END,
        created_at = CASE
                       WHEN student_requests.status = 'rejected' THEN now()
                       ELSE student_requests.created_at
                     END,
        responded_at = CASE
                         WHEN student_requests.status = 'rejected' THEN NULL
                         ELSE student_requests.responded_at
                       END
  RETURNING * INTO v_req;

  RETURN QUERY
  SELECT
    v_req.id,
    v_req.student_id,
    public.mask_full_name(v_student.full_name)::text,
    v_req.status::text;
END;
$$;

-- ------------------------------------------------------------
-- 6) RPC: Öğretmenin istek + öğrenci listesi
--    pending -> maskeli isim, accepted -> tüm detaylar
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_student_requests()
RETURNS TABLE (
  request_id   UUID,
  student_id   UUID,
  student_no   TEXT,
  display_name TEXT,
  is_masked    BOOLEAN,
  grade_level  TEXT,
  email        TEXT,
  status       TEXT,
  created_at   TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum bulunamadi';
  END IF;

  RETURN QUERY
  SELECT
    sr.id,
    sr.student_id,
    sr.student_no::text,
    (CASE WHEN sr.status = 'accepted'
          THEN COALESCE(p.full_name, 'Ogrenci')
          ELSE public.mask_full_name(p.full_name) END)::text,
    (sr.status <> 'accepted'),
    (CASE WHEN sr.status = 'accepted' THEN p.grade_level ELSE NULL END)::text,
    (CASE WHEN sr.status = 'accepted' THEN u.email ELSE NULL END)::text,
    sr.status::text,
    sr.created_at,
    sr.responded_at
  FROM public.student_requests sr
  LEFT JOIN public.profiles p ON p.id = sr.student_id
  LEFT JOIN auth.users u ON u.id = sr.student_id
  WHERE sr.teacher_id = auth.uid()
  ORDER BY sr.created_at DESC;
END;
$$;

-- ------------------------------------------------------------
-- 7) RPC: Öğrenciye gelen istekler
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_incoming_requests()
RETURNS TABLE (
  request_id    UUID,
  teacher_id    UUID,
  teacher_name  TEXT,
  teacher_email TEXT,
  branch        TEXT,
  status        TEXT,
  created_at    TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum bulunamadi';
  END IF;

  RETURN QUERY
  SELECT
    sr.id,
    sr.teacher_id,
    COALESCE(p.full_name, 'Ogretmen')::text,
    u.email::text,
    p.branch::text,
    sr.status::text,
    sr.created_at
  FROM public.student_requests sr
  LEFT JOIN public.profiles p ON p.id = sr.teacher_id
  LEFT JOIN auth.users u ON u.id = sr.teacher_id
  WHERE sr.student_id = auth.uid()
  ORDER BY sr.created_at DESC;
END;
$$;

-- ------------------------------------------------------------
-- 8) RPC: Öğrenci isteği kabul / red eder
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.respond_student_request(p_request_id UUID, p_accept BOOLEAN)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT := CASE WHEN p_accept THEN 'accepted' ELSE 'rejected' END;
  v_rows   INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum bulunamadi';
  END IF;

  UPDATE public.student_requests
    SET status = v_status,
        responded_at = now()
  WHERE id = p_request_id
    AND student_id = auth.uid()
    AND status = 'pending';

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows = 0 THEN
    RAISE EXCEPTION 'Istek bulunamadi veya zaten yanitlanmis';
  END IF;

  RETURN v_status;
END;
$$;

-- ------------------------------------------------------------
-- 9) Fonksiyon yetkileri
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.lookup_student_by_no(TEXT)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_student_request(TEXT)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_teacher_student_requests()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_incoming_requests()       TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_student_request(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mask_full_name(TEXT)                  TO authenticated;

-- ------------------------------------------------------------
-- 10) Kontrol sorgusu (opsiyonel)
-- ------------------------------------------------------------
-- SELECT id, full_name, role, student_no FROM public.profiles ORDER BY created_at DESC LIMIT 20;
