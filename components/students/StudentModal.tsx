"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Student } from "@/types/database";

interface Props {
  student: Student | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function StudentModal({ student, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: student?.name || "",
    phone: student?.phone || "",
    email: student?.email || "",
    notes: student?.notes || "",
    is_active: student?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) return alert("이름을 입력해주세요");
    setSaving(true);
    if (student) {
      await supabase.from("students").update(form).eq("id", student.id);
    } else {
      await supabase.from("students").insert(form);
    }
    setSaving(false);
    onSaved();
  }

  async function handleDelete() {
    if (!student || !confirm("학생을 삭제할까요? 관련 레슨 기록도 함께 삭제됩니다.")) return;
    await supabase.from("students").delete().eq("id", student.id);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{student ? "학생 수정" : "학생 추가"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="홍길동"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3} placeholder="특이사항, 목표 등"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-sky-500" />
            <span className="text-sm text-gray-700">활성 학생</span>
          </label>
        </div>
        <div className="flex items-center justify-between p-5 border-t border-gray-100">
          {student ? (
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
