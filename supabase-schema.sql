-- Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  memo TEXT,
  lesson_fee INTEGER
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'transfer' CHECK (payment_method IN ('cash', 'transfer', 'card')),
  memo TEXT
);

-- RLS Policies (나중에 학생 로그인 추가할 때 활용)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 트레이너는 모두 접근 가능 (anon key 사용 시 - 나중에 auth 추가 후 수정)
CREATE POLICY "Allow all for now" ON students FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON lessons FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON payments FOR ALL USING (true);

-- 인덱스
CREATE INDEX idx_lessons_date ON lessons(date);
CREATE INDEX idx_lessons_student_id ON lessons(student_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_student_id ON payments(student_id);
