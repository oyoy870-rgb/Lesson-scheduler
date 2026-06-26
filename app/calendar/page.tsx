"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LessonModal from "@/components/lessons/LessonModal";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => { fetchLessons(); }, [currentDate]);

  async function fetchLessons() {
    const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentDate), "yyyy-MM-dd");
    const { data } = await supabase
      .from("lessons").select("*, students(name)")
      .gte("date", start).lte("date", end).order("start_time");
    if (data) setLessons(data);
  }

  const days: Date[] = [];
  let day = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const calEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
  while (day <= calEnd) { days.push(day); day = addDays(day, 1); }

  const getDayLessons = (date: Date) => lessons.filter((l) => l.date === format(date, "yyyy-MM-dd"));

  const statusColor: Record<string, string> = {
    scheduled: "bg-sky-100 text-sky-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-400 line-through",
    no_show: "bg-red-100 text-red-600",
  };

  return (
    <div className="p-3 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 text-xs md:text-sm rounded-lg hover:bg-gray-100 font-medium">오늘</button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <button
          onClick={() => { setSelectedDate(new Date()); setSelectedLesson(null); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-sky-600">
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">레슨 추가</span>
          <span className="sm:hidden">추가</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {["일","월","화","수","목","금","토"].map((d, i) => (
            <div key={d} className={`py-2 md:py-3 text-center text-xs font-semibold ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, idx) => {
            const dayLessons = getDayLessons(d);
            const isCurrentMonth = isSameMonth(d, currentDate);
            return (
              <div key={idx}
                onClick={() => { setSelectedDate(d); setSelectedLesson(null); setIsModalOpen(true); }}
                className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 ${!isCurrentMonth ? "bg-gray-50/50" : ""}`}>
                <div className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm font-medium mb-0.5 md:mb-1 ${isToday(d) ? "bg-sky-500 text-white" : idx % 7 === 0 ? "text-red-500" : idx % 7 === 6 ? "text-blue-500" : isCurrentMonth ? "text-gray-900" : "text-gray-300"}`}>
                  {format(d, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayLessons.slice(0, 2).map((lesson: any) => (
                    <div key={lesson.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedLesson(lesson); setIsModalOpen(true); }}
                      className={`text-xs px-1 py-0.5 rounded truncate ${statusColor[lesson.status] || "bg-gray-100"}`}>
                      <span className="hidden md:inline">{lesson.start_time?.slice(0, 5)} </span>
                      {lesson.students?.name}
                    </div>
                  ))}
                  {dayLessons.length > 2 && <div className="text-xs text-gray-400 px-1">+{dayLessons.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <LessonModal
          date={selectedDate || new Date()}
          lesson={selectedLesson}
          onClose={() => { setIsModalOpen(false); setSelectedLesson(null); }}
          onSaved={() => { fetchLessons(); setIsModalOpen(false); }} />
      )}
    </div>
  );
}
