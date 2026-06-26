"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Clock, Music, CheckCircle2, XCircle, AlertCircle, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  student_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  memo: string | null;
  song: string | null;
  students: { name: string; phone: string | null };
};

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
function getLessonState(lesson: Lesson, now: number) {
  if (lesson.status === "completed") return "completed";
  if (lesson.status === "cancelled") return "cancelled";
  if (lesson.status === "no_show") return "no_show";
  const start = timeToMinutes(lesson.start_time);
  const end = timeToMinutes(lesson.end_time);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "done";
}

const stateConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any; dot: string }> = {
  ongoing:   { label: "진행 중", color: "text-sky-600",   bg: "bg-sky-50",   border: "border-sky-200",  icon: Music,        dot: "bg-sky-500 animate-pulse" },
  upcoming:  { label: "예정",    color: "text-gray-400",  bg: "bg-white",    border: "border-gray-200", icon: Circle,       dot: "bg-gray-300" },
  done:      { label: "완료",    color: "text-green-600", bg: "bg-green-50", border: "border-green-200",icon: CheckCircle2, dot: "bg-green-400" },
  completed: { label: "완료",    color: "text-green-600", bg: "bg-green-50", border: "border-green-200",icon: CheckCircle2, dot: "bg-green-400" },
  cancelled: { label: "취소",    color: "text-gray-400",  bg: "bg-gray-50",  border: "border-gray-200", icon: XCircle,      dot: "bg-gray-300" },
  no_show:   { label: "노쇼",    color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200",  icon: AlertCircle,  dot: "bg-red-400" },
};

export default function TodayPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [now, setNow] = useState(nowMinutes());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const ongoingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLessons();
    const timer = setInterval(() => { setNow(nowMinutes()); setCurrentTime(new Date()); }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && ongoingRef.current) {
      ongoingRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  async function fetchLessons() {
    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabase
      .from("lessons").select("*, students(name, phone)")
      .eq("date", today).order("start_time");
    if (data) setLessons(data as Lesson[]);
    setLoading(false);
  }

  const today = new Date();
  const ongoingLesson = lessons.find((l) => getLessonState(l, now) === "ongoing");
  const totalLessons = lessons.filter((l) => l.status !== "cancelled").length;
  const doneLessons = lessons.filter((l) => ["completed", "done"].includes(getLessonState(l, now))).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-0.5">Today</p>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {format(today, "M월 d일 (E)", { locale: ko })}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">
              {format(currentTime, "HH:mm")}
            </p>
            {ongoingLesson && <p className="text-xs text-sky-500 font-medium mt-0.5">레슨 진행 중</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{totalLessons}</p>
            <p className="text-xs text-gray-400 mt-0.5">오늘 레슨</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{doneLessons}/{totalLessons}</p>
            <p className="text-xs text-gray-400 mt-0.5">완료</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-300">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Music className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">오늘 예정된 레슨이 없어요</p>
            <p className="text-gray-300 text-sm mt-1">캘린더에서 레슨을 추가해보세요</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gray-200" />
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const state = getLessonState(lesson, now);
                const cfg = stateConfig[state];
                const Icon = cfg.icon;
                const isOngoing = state === "ongoing";
                const duration = timeToMinutes(lesson.end_time) - timeToMinutes(lesson.start_time);
                return (
                  <div key={lesson.id} ref={isOngoing ? ongoingRef : null} className="relative flex gap-3 md:gap-4">
                    <div className="relative z-10 flex-shrink-0 w-14 flex flex-col items-center pt-3">
                      <div className={`w-3.5 h-3.5 rounded-full ${cfg.dot} ring-2 ring-white`} />
                      <p className="text-xs font-semibold text-gray-500 mt-1 tabular-nums">
                        {lesson.start_time.slice(0, 5)}
                      </p>
                    </div>
                    <div className={`flex-1 rounded-2xl border ${cfg.border} ${cfg.bg} p-3 md:p-4 mb-1 ${isOngoing ? "shadow-md shadow-sky-100 ring-1 ring-sky-200" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isOngoing ? "bg-sky-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                            {lesson.students?.name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{lesson.students?.name}</p>
                            <p className="text-xs text-gray-400 tabular-nums">
                              {lesson.start_time.slice(0, 5)} – {lesson.end_time.slice(0, 5)}
                              <span className="ml-1 text-gray-300">({duration}분)</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </div>
                      {isOngoing && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-sky-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(100, ((now - timeToMinutes(lesson.start_time)) / duration) * 100)}%` }} />
                          </div>
                          <p className="text-xs text-sky-400 mt-1">{timeToMinutes(lesson.end_time) - now}분 남음</p>
                        </div>
                      )}
                      {lesson.song && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Music className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-500 truncate">{lesson.song}</p>
                        </div>
                      )}
                      {lesson.memo && (
                        <p className="mt-2 text-xs text-gray-400 bg-white/60 rounded-lg px-2.5 py-1.5 leading-relaxed">{lesson.memo}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
