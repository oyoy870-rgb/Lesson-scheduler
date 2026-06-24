"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  date: Date;
  lesson: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function LessonModal({ date, lesson, onClose, onSaved }: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_id: lesson?.student_id || "",
    date: lesson?.date || format(date, "yyyy-MM-dd"),
    start_time: lesson?.start_time || "10:00",
    end_time: lesson?.end_time || "11:00",
    status: lesson?.status || "scheduled",
    memo: lesson?.memo || "",
    lesson_fee: lesson?.lesson_fee?.toString() || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("students").select("*").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setStudents(data);
    });
  }, []);

  async function handleSave() {
    if (!form.student_id) return alert("학생을 선택해주세요");
    setSaving(true);
    const payload = {
      student_id: form.student_id,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      status: form.status,
      memo: form.memo || null,
      lesson_fee: form.lesson_fee ? parseInt(form.lesson_fee) : null,
    };
    if (lesson) {
      await supabase.from("lessons").update(payload).eq("id", lesson.id);
    } else {
      await supabase.from("lessons").insert([payload]);
    }
    setSaving(false);
    onSaved();
  }

  async function handleDelete() {
    if (!lesson || !confirm("레슨을 삭제할까요?")) return;
    await supabase.from("lessons").delete().eq("id", lesson.id);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{lesson ? "레슨 수정" : "레슨 추가"}</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="scheduled">예정</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
              <option value="no_show">노쇼</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">레슨비 (원)</label>
            <input type="number" value={form.lesson_fee} onChange={(e) => setForm({ ...form, lesson_fee: e.target.value })}
              placeholder="50000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={3} placeholder="레슨 내용, 피드백 등"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-between p-5 border-t border-gray-100">
          {lesson ? (
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" />삭제</button>
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
