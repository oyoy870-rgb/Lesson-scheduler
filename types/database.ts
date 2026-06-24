export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Student {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface Lesson {
  id: string;
  created_at: string;
  student_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  memo: string | null;
  lesson_fee: number | null;
}

export interface Payment {
  id: string;
  created_at: string;
  student_id: string;
  lesson_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  memo: string | null;
}
