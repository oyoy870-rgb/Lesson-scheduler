export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          phone: string | null;
          email: string | null;
          notes: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
      };
      lessons: {
        Row: {
          id: string;
          created_at: string;
          student_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status: "scheduled" | "completed" | "cancelled" | "no_show";
          memo: string | null;
          lesson_fee: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          student_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          memo?: string | null;
          lesson_fee?: number | null;
        };
        Update: {
          student_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          memo?: string | null;
          lesson_fee?: number | null;
        };
      };
      payments: {
        Row: {
          id: string;
          created_at: string;
          student_id: string;
          lesson_id: string | null;
          amount: number;
          payment_date: string;
          payment_method: "cash" | "transfer" | "card";
          memo: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          student_id: string;
          lesson_id?: string | null;
          amount: number;
          payment_date: string;
          payment_method: "cash" | "transfer" | "card";
          memo?: string | null;
        };
        Update: {
          amount?: number;
          payment_date?: string;
          payment_method?: "cash" | "transfer" | "card";
          memo?: string | null;
        };
      };
    };
  };
}

export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
