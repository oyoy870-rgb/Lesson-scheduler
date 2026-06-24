"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Payment, Student } from "@/types/database";
import PaymentModal from "@/components/payments/PaymentModal";

type PaymentWithStudent = Payment & { students: Pick<Student, "name"> };

const methodLabel: Record<string, string> = {
  cash: "현금",
  transfer: "계좌이체",
  card: "카드",
};
const methodColor: Record<string, string> = {
  cash: "bg-green-100 text-green-700",
  transfer: "bg-blue-100 text-blue-700",
  card: "bg-purple-100 text-purple-700",
};

export default function PaymentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [payments, setPayments] = useState<PaymentWithStudent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithStudent | null>(null);

  useEffect(() => { fetchPayments(); }, [currentDate]);

  async function fetchPayments() {
    const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentDate), "yyyy-MM-dd");
    const { data } = await supabase
      .from("payments")
      .select("*, students(name)")
      .gte("payment_date", start)
      .lte("payment_date", end)
      .order("payment_date", { ascending: false });
    if (data) setPayments(data as PaymentWithStudent[]);
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const byMethod = payments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">결제 관리</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700">
              {format(currentDate, "yyyy년 M월", { locale: ko })}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-gray-100">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => { setSelectedPayment(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600"
        >
          <Plus className="w-4 h-4" />결제 추가
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-gray-500">이번 달 총 수입</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}원</p>
          <p className="text-xs text-gray-400 mt-1">{payments.length}건</p>
        </div>
        {Object.entries(byMethod).map(([method, amount]) => (
          <div key={method} className="bg-white rounded-xl border border-gray-200 p-4">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${methodColor[method]}`}>{methodLabel[method]}</span>
            <p className="text-lg font-bold text-gray-900 mt-2">{amount.toLocaleString()}원</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">날짜</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">학생</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">결제방법</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">금액</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">메모</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} onClick={() => { setSelectedPayment(p); setIsModalOpen(true); }}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 text-gray-600">{p.payment_date}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.students?.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${methodColor[p.payment_method]}`}>
                    {methodLabel[p.payment_method]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{p.amount.toLocaleString()}원</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.memo || "-"}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">이번 달 결제 내역이 없어요</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => { fetchPayments(); setIsModalOpen(false); }}
        />
      )}
    </div>
  );
}
