"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Plus, Search, Phone, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import StudentModal from "@/components/students/StudentModal";

const categoryColors: Record<string, string> = {
  "입시": "bg-purple-100 text-purple-700",
  "취미": "bg-green-100 text-green-700",
  "단기": "bg-orange-100 text-orange-700",
};

function getCategoryColor(cat: string) {
  return categoryColors[cat] || "bg-gray-100 text-gray-600";
}

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => { fetchStudents(); fetchCategories(); }, []);

  async function fetchStudents() {
    const { data } = await supabase.from("students").select("*").order("name");
    if (data) setStudents(data);
  }

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("name").order("name");
    if (data) setCategories(data.map((c: any) => c.name));
  }

  const filtered = students.filter((s) => {
    const matchSearch = s.name?.includes(search) || s.phone?.includes(search);
    const matchCategory = filterCategory ? s.category === filterCategory : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {students.length}명</p>
        </div>
        <button onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600">
          <Plus className="w-4 h-4" />학생 추가
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름, 전화번호 검색"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-gray-600">
          <option value="">전체</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map((student) => (
          <div key={student.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                {student.name?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  {student.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(student.category)}`}>
                      {student.category}
                    </span>
                  )}
                  {!student.is_active && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">비활성</span>}
                </div>
                {student.phone && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Phone className="w-3 h-3" />{student.phone}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">{search || filterCategory ? "검색 결과가 없어요" : "등록된 학생이 없어요"}</div>
        )}
      </div>

      {isModalOpen && (
        <StudentModal student={selectedStudent} onClose={() => setIsModalOpen(false)}
          onSaved={() => { fetchStudents(); fetchCategories(); setIsModalOpen(false); }} />
      )}
    </div>
  );
}
