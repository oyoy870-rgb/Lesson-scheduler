"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Payment, Student } from "@/types/database";

type PaymentWithStudent = Payment & { students: Pick<Student, "name"> };

interface Props {
  payment: PaymentWithStudent | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PaymentModal({ payment, onClose, onSaved }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({
    student_id: payment?.student_id || "",
    amount: payment?.amount?.toString() || "",
    payment_date: payment?.payment_date || format(new Date(), "yyyy-MM-dd"),
    payment_method: payment?.payment_method || "transfer",
    memo: payment?.memo || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("students").select("*").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setStudents(data);
    });
  }, []);

  async function handleSave() {
    if (!form.student_id) return alert("학생을 선택해주세요");
    if (!form.amount) return alert("금액을 입력해주세요");
    setSaving(true);
    const payload = { ...form, amount: parseInt(form.amount) };
    if (payment) {
      await supabase.from("payments").update(payload).eq("id", payment.id);
    } else {
      await supabase.from("payments").insert(payload);
    }
    setSaving(false);
    onSaved();
  }

  async function handleDelete() {
    if (!payment || !confirm("결제 내역을 삭제할까요?")) return;
    await supabase.from("payments").delete().eq("id", payment.id);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{payment ? "결제 수정" : "결제 추가"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학생</label>
            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">학생 선택</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">금액 (원)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="50000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">결제일</label>
            <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">결제 방법</label>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value as Payment["payment_method"] })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="transfer">계좌이체</option>
              <option value="cash">현금</option>
              <option value="card">카드</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}
              placeholder="6월 레슨비 등"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
        <div className="flex items-center justify-between p-5 border-t border-gray-100">
          {payment ? (
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />삭제
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">취소</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50">
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
