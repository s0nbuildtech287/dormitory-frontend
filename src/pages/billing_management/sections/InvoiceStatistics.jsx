import React, { useMemo, useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, AlertCircle, DollarSign, TrendingUp, Wallet, Zap, Droplet, X, ArrowRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from "recharts";
import { getInvoiceStatistics, getInvoices } from "../../../api/apiInvoice.js";
import { BillStatus } from "../../../utils/types.js";

const InvoiceStatistics = ({ bills, onNavigateToInvoice }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [unpaidInvoicesModal, setUnpaidInvoicesModal] = useState(null); // { type: 'unpaid' | 'overdue', invoices: [] }
  const [loadingModal, setLoadingModal] = useState(false);

  // Generate list of last 6 months (current billing month + 5 previous months)
  // Current billing month = last month (e.g., if now is March 2026 → billing month is Feb 2026)
  const getLastSixMonths = () => {
    const months = [];
    const now = new Date();
    
    // Calculate current billing month (last month)
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const billingMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const billingYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Start from current billing month and go back 5 more months
    const startDate = new Date(billingYear, billingMonth, 1);
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const value = `${year}-${String(month).padStart(2, '0')}-01`;
      const label = `Tháng ${month}/${year}`;
      months.push({ value, label });
    }
    
    return months;
  };

  const availableMonths = getLastSixMonths();

  // Fetch unpaid or overdue invoices
  const handleShowInvoices = async (type) => {
    try {
      setLoadingModal(true);
      const status = type === 'unpaid' ? 'Chưa thanh toán' : 'Quá hạn';
      const filters = { status };
      
      // If a specific month is selected, filter by that month
      if (selectedMonth) {
        filters.month = selectedMonth;
      }
      
      const response = await getInvoices(filters);
      
      if (response.success && response.data) {
        setUnpaidInvoicesModal({
          type,
          invoices: response.data,
          title: type === 'unpaid' ? 'Hóa đơn chưa thanh toán' : 'Hóa đơn quá hạn'
        });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      alert("Không thể tải danh sách hóa đơn. Vui lòng thử lại.");
    } finally {
      setLoadingModal(false);
    }
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await getInvoiceStatistics(selectedMonth);
        if (response.success) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error("Error fetching invoice statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedMonth]);

  // Calculate stats from bills (fallback if API fails)
  const safeBills = Array.isArray(bills) ? bills : [];
  const billStats = useMemo(() => {
    const total = safeBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const unpaid = safeBills.filter((b) => b.status === BillStatus.UNPAID).reduce((sum, b) => sum + (b.total || 0), 0);
    const paid = safeBills.filter((b) => b.status === BillStatus.PAID).reduce((sum, b) => sum + (b.total || 0), 0);
    const overdue = safeBills.filter((b) => b.status === BillStatus.OVERDUE).reduce((sum, b) => sum + (b.total || 0), 0);
    return { total, unpaid, paid, overdue };
  }, [safeBills]);

  // Use API statistics if available, otherwise use calculated stats
  const stats = statistics || {
    total_invoices: safeBills.length,
    paid_count: safeBills.filter((b) => b.status === BillStatus.PAID).length,
    unpaid_count: safeBills.filter((b) => b.status === BillStatus.UNPAID).length,
    overdue_count: safeBills.filter((b) => b.status === BillStatus.OVERDUE).length,
    total_amount: billStats.total,
    paid_amount: billStats.paid,
    unpaid_amount: billStats.unpaid,
    overdue_amount: billStats.overdue,
    average_amount: safeBills.length > 0 ? Math.round(billStats.total / safeBills.length) : 0,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const collectionRate = stats.total_amount > 0 ? ((stats.paid_amount / stats.total_amount) * 100).toFixed(1) : 0;
  const remainingAmount = (Number(stats.unpaid_amount) || 0) + (Number(stats.overdue_amount) || 0);

  // Fake data for utility costs by month (last 6 months)
  const utilityChartData = [
    { month: "T09/2025", electric: 12500000, water: 4200000 },
    { month: "T10/2025", electric: 13200000, water: 4500000 },
    { month: "T11/2025", electric: 14100000, water: 4800000 },
    { month: "T12/2025", electric: 15300000, water: 5100000 },
    { month: "T01/2026", electric: 16800000, water: 5400000 },
    { month: "T02/2026", electric: 14500000, water: 4900000 },
  ];

  // Fake data for total invoice amount by month (last 6 months)
  const monthlyRevenueData = [
    { month: "T09/2025", total: 85000000, paid: 78000000, unpaid: 7000000 },
    { month: "T10/2025", total: 92000000, paid: 85000000, unpaid: 7000000 },
    { month: "T11/2025", total: 98000000, paid: 91000000, unpaid: 7000000 },
    { month: "T12/2025", total: 105000000, paid: 98000000, unpaid: 7000000 },
    { month: "T01/2026", total: 112000000, paid: 105000000, unpaid: 7000000 },
    { month: "T02/2026", total: 108000000, paid: 95000000, unpaid: 13000000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Two Blocks Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overview Block - Tổng quan hóa đơn */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-900">Tổng quan hóa đơn</h4>
            <select
              value={selectedMonth || ""}
              onChange={(e) => setSelectedMonth(e.target.value || null)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableMonths.map((month, index) => (
                <option key={month.value} value={index === 0 ? "" : month.value}>
                  {month.label} {index === 0 ? "(Hiện tại)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tổng hóa đơn</p>
                  <p className="text-xs text-slate-400 mt-0.5">Tất cả hóa đơn</p>
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.total_invoices}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Đã thanh toán</p>
                  <p className="text-xs text-emerald-600 mt-0.5 font-semibold">{formatCurrency(stats.paid_amount)}</p>
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600">{stats.paid_count}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer" onClick={() => handleShowInvoices('unpaid')}>
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-amber-600" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Chưa thanh toán</p>
                  <p className="text-xs text-amber-600 mt-0.5 font-semibold">{formatCurrency(stats.unpaid_amount)}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Ấn để xem chi tiết</p>
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600">{stats.unpaid_count}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer" onClick={() => handleShowInvoices('overdue')}>
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-rose-600" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Quá hạn</p>
                  <p className="text-xs text-rose-600 mt-0.5 font-semibold">{formatCurrency(stats.overdue_amount)}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Ấn để xem chi tiết</p>
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600">{stats.overdue_count}</p>
            </div>
          </div>
        </div>

        {/* Financial Summary Block - Tổng quan tài chính */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-900">Tổng quan tài chính</h4>
            <select
              value={selectedMonth || ""}
              onChange={(e) => setSelectedMonth(e.target.value || null)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableMonths.map((month, index) => (
                <option key={month.value} value={index === 0 ? "" : month.value}>
                  {month.label} {index === 0 ? "(Hiện tại)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tổng phải thu</p>
                </div>
              </div>
              <p className="text-xl font-black text-blue-900">{formatCurrency(stats.total_amount)}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-600 rounded-lg">
                  <Wallet size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cần phải thu</p>
                </div>
              </div>
              <p className="text-xl font-black text-rose-900">{formatCurrency(remainingAmount)}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tỷ lệ thu</p>
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-900">{collectionRate}%</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Trung bình/HĐ</p>
                </div>
              </div>
              <p className="text-xl font-black text-purple-900">{formatCurrency(stats.average_amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="font-bold text-slate-900 mb-6">Phân bổ theo trạng thái</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-700">Đã thanh toán</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-900">{stats.paid_count} hóa đơn</span>
              <span className="text-sm text-emerald-600 font-bold">{formatCurrency(stats.paid_amount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-slate-700">Chưa thanh toán</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-900">{stats.unpaid_count} hóa đơn</span>
              <span className="text-sm text-amber-600 font-bold">{formatCurrency(stats.unpaid_amount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-sm text-slate-700">Quá hạn</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-900">{stats.overdue_count} hóa đơn</span>
              <span className="text-sm text-rose-600 font-bold">{formatCurrency(stats.overdue_amount)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span>Tiến độ thu</span>
            <span>{collectionRate}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Tiền điện và nước theo tháng */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <Droplet size={18} className="text-blue-500" />
            Tiền điện & nước theo tháng
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilityChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: "12px" }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} style={{ fontSize: "12px" }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Legend />
                <Line type="monotone" dataKey="electric" name="Tiền điện" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 4 }} />
                <Line type="monotone" dataKey="water" name="Tiền nước" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Tổng tiền hóa đơn theo tháng */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" />
            Tổng tiền hóa đơn theo tháng
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: "12px" }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} style={{ fontSize: "12px" }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Legend />
                <Bar dataKey="paid" name="Đã thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unpaid" name="Chưa thu" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Unpaid/Overdue Invoices Modal */}
      {unpaidInvoicesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-3xl max-h-[80vh] flex flex-col animate-in scale-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{unpaidInvoicesModal.title}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tổng: <strong>{unpaidInvoicesModal.invoices.length}</strong> hóa đơn
                </p>
              </div>
              <button 
                onClick={() => setUnpaidInvoicesModal(null)} 
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingModal ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : unpaidInvoicesModal.invoices.length > 0 ? (
                <div className="space-y-2">
                  {unpaidInvoicesModal.invoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-bold text-slate-900">
                            Phòng {invoice.building}-{invoice.room_number}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            invoice.status === 'Quá hạn' 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>Tháng: {new Date(invoice.billing_month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</span>
                          <span>Hạn: {new Date(invoice.due_date).toLocaleDateString('vi-VN')}</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(invoice.total_amount)}</span>
                        </div>
                        {invoice.student_names && (
                          <p className="text-xs text-slate-500 mt-1">SV: {invoice.student_names}</p>
                        )}
                      </div>
                      {invoice.invoice_number && onNavigateToInvoice && (
                        <button
                          onClick={() => {
                            setUnpaidInvoicesModal(null);
                            onNavigateToInvoice(invoice.invoice_number);
                          }}
                          className="flex items-center gap-1.5 text-xs font-mono text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer group ml-4"
                          title="Xem chi tiết hóa đơn"
                        >
                          <span>{invoice.invoice_number}</span>
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-8">
                  Không có hóa đơn {unpaidInvoicesModal.type === 'unpaid' ? 'chưa thanh toán' : 'quá hạn'}
                </p>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200">
              <button 
                onClick={() => setUnpaidInvoicesModal(null)} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceStatistics;
