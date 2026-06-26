"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X, Trash2, Search, ChevronDown, Music, FileText, ChevronUp } from "lucide-react";
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
  const [prevLessons, setPrevLessons] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({
    student_id: lesson?.student_id || "",
    date: lesson?.date || format(date, "yyyy-MM-dd"),
    start_time: lesson?.start_time || "10:00",
    end_time: lesson?.end_time || "11:00",
    status: lesson?.status || "scheduled",
    song: lesson?.song || "",
    memo: lesson?.memo || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (form.student_id) fetchPrevLessons(form.student_id);
  }, [form.student_id]);

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

  async function fetchPrevLessons(studentId: string) {
    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("student_id", studentId)
      .lt("date", today)
      .order("date", { ascending: false })
      .limit(5);
    if (data) setPrevLessons(data);
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
    setShowHistory(false);
  }

  function handleStartTimeChange(start: string) {
    const [h, m] = start.split(":").map(Number);
    const endH = String((h + 1) % 24).padStart(2, "0");
    setForm({ ...form, start_time: start, end_time: `${endH}:${String(m).padStart(2, "0")}` });
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
      song: form.song || null,
      memo: form.memo || null,
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
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-xl max-h-[calc(92vh-4rem)] md:max-h-[90vh] overflow-y-auto mb-16 md:mb-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">{lesson ? "레슨 수정" : "레슨 추가"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* 학생 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학생</label>
            <button onClick={() => setShowStudentPicker(!showStudentPicker)}
              className={`w-full flex items-center justify-between border rounded-xl px-3 py-2.5 text-sm ${selectedStudentName ? "border-sky-300 bg-sky-50 text-gray-900" : "border-gray-200 text-gray-400"}`}>
              <span>{selectedStudentName || "학생 선택"}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showStudentPicker && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                <div className="p-2 border-b border-gray-100 bg-gray-50 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="이름 검색" autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white" />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => setStudentCategory("")}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${studentCategory === "" ? "bg-sky-500 text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
                      전체
                    </button>
                    {categories.map((c) => (
                      <button key={c} onClick={() => setStudentCategory(studentCategory === c ? "" : c)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${studentCategory === c ? "bg-sky-500 text-white" : getCategoryColor(c)}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <p className="text-center py-4 text-sm text-gray-400">학생이 없어요</p>
                  ) : filteredStudents.map((s) => (
                    <button key={s.id} onClick={() => selectStudent(s)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 ${form.student_id === s.id ? "bg-sky-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs">
                          {s.name?.[0]}
                        </div>
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                      {s.category && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(s.category)}`}>{s.category}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 이전 수업 히스토리 */}
          {form.student_id && prevLessons.length > 0 && (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <button onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">이전 수업 기록</span>
                  <span className="text-xs text-gray-400">({prevLessons.length}개)</span>
                </div>
                {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showHistory && (
                <div className="divide-y divide-gray-100">
                  {prevLessons.map((pl) => (
                    <div key={pl.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500">
                          {format(new Date(pl.date), "M월 d일 (E)", { locale: ko })}
                        </span>
                        <span className="text-xs text-gray-400">{pl.start_time?.slice(0, 5)} – {pl.end_time?.slice(0, 5)}</span>
                      </div>
                      {pl.song && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Music className="w-3 h-3 text-sky-400" />
                          <span className="text-xs text-gray-600">{pl.song}</span>
                        </div>
                      )}
                      {pl.memo && (
                        <p className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-lg px-2.5 py-1.5">{pl.memo}</p>
                      )}
                      {!pl.song && !pl.memo && (
                        <p className="text-xs text-gray-300">기록 없음</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작</label>
              <input type="time" value={form.start_time} onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="scheduled">예정</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
              <option value="no_show">노쇼</option>
            </select>
          </div>

          {/* 레슨곡 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">레슨곡</label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.song} onChange={(e) => setForm({ ...form, song: e.target.value })}
                placeholder="곡명 / 아티스트"
                className="w-full pl-9 pr-4 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={3} placeholder="레슨 내용, 피드백 등"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 sticky bottom-0 bg-white pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5">
          {lesson ? (
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
