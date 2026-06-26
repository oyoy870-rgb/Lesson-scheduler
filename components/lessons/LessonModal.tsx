"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Trash2, Search, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  date: Date;
  lesson: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function LessonModal({ date, lesson, onClose, onSaved }: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentCategory, setStudentCategory] = useState("");
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
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
    fetchStudents();
    fetchCategories();
  }, []);

  async function fetchStudents() {
    const { data } = await supabase.from("students").select("*").eq("is_active", true).order("name");
    if (data) {
      setStudents(data);
      if (lesson?.student_id) {
        const s = data.find((s: any) => s.id === lesson.student_id);
        if (s) setSelectedStudentName(s.name);
      }
    }
  }

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("name").order("name");
    if (data) setCategories(data.map((c: any) => c.name));
  }

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name?.includes(studentSearch);
    const matchCategory = studentCategory ? s.category === studentCategory : true;
    return matchSearch && matchCategory;
  });

  function selectStudent(s: any) {
    setForm({ ...form, student_id: s.id });
    setSelectedStudentName(s.name);
    setShowStudentPicker(false);
    setStudentSearch("");
  }

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

  const categoryColors: Record<string, string> = {
    "입시": "bg-purple-100 text-purple-700",
    "취미": "bg-green-100 text-green-700",
    "단기": "bg-orange-100 text-orange-700",
  };
  function getCategoryColor(cat: string) {
    return categoryColors[cat] || "bg-gray-100 text-gray-600";
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">{lesson ? "레슨 수정" : "레슨 추가"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* 학생 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학생</label>
            <button
              onClick={() => setShowStudentPicker(!showStudentPicker)}
              className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${selectedStudentName ? "border-sky-300 bg-sky-50 text-gray-900" : "border-gray-200 text-gray-400"}`}>
              <span>{selectedStudentName || "학생 선택"}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showStudentPicker && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                {/* 검색 + 카테고리 필터 */}
                <div className="p-2 border-b border-gray-100 bg-gray-50 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="이름 검색"
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setStudentCategory("")}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${studentCategory === "" ? "bg-sky-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      전체
                    </button>
                    {categories.map((c) => (
                      <button key={c}
                        onClick={() => setStudentCategory(studentCategory === c ? "" : c)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${studentCategory === c ? "bg-sky-500 text-white" : `${getCategoryColor(c)} hover:opacity-80`}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 학생 목록 */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <p className="text-center py-4 text-sm text-gray-400">학생이 없어요</p>
                  ) : (
                    filteredStudents.map((s) => (
                      <button key={s.id} onClick={() => selectStudent(s)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${form.student_id === s.id ? "bg-sky-50" : ""}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs">
                            {s.name?.[0]}
                          </div>
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </div>
                        {s.category && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(s.category)}`}>
                            {s.category}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
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

        <div className="flex items-center justify-between p-5 border-t border-gray-100 sticky bottom-0 bg-white">
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
