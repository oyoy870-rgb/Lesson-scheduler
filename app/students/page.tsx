
"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Plus, Search, Phone, Mail, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Student } from "@/types/database";
import StudentModal from "@/components/students/StudentModal";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    const { data } = await supabase.from("students").select("*").order("name");
    if (data) setStudents(data);
  }

  const filtered = students.filter((s) =>
    s.name.includes(search) || s.phone?.includes(search) || s.email?.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {students.length}명</p>
        </div>
        <button
          onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600"
        >
          <Plus className="w-4 h-4" />학생 추가
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 전화번호, 이메일 검색"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((student) => (
          <div key={student.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                {student.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  {!student.is_active && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">비활성</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {student.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />{student.phone}
                    </span>
                  )}
                  {student.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />{student.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {search ? "검색 결과가 없어요" : "등록된 학생이 없어요"}
          </div>
        )}
      </div>

      {isModalOpen && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => { fetchStudents(); setIsModalOpen(false); }}
        />
      )}
    </div>
  );
}
