import { useState, useEffect, useCallback } from "react";
import {
  Rocket,
  BedDouble,
  TrendingUp,
  Clock,
  Mail,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  Users,
  BarChart3,
  Info,
} from "lucide-react";
import { getRoomForecast, getDemandForecast } from "../../../api/apiRegistration.js";
import { getExpiringContracts, sendRenewalEmails } from "../../../api/apiContract.js";
import StatCard from "../../../components/common/StatCard.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import { usePagination } from "../../../hooks/usePagination.js";

const CampaignLauncher = () => {
  // ─── STATE ────────────────────────────────────────────────
  const [forecastDays, setForecastDays] = useState(30);
  const [roomForecast, setRoomForecast] = useState(null);
  const [demandForecast, setDemandForecast] = useState(null);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [expiringDays, setExpiringDays] = useState(30);

  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [error, setError] = useState(null);

  // Phân trang cho bảng hợp đồng sắp hết hạn
  const pagination = usePagination(expiringContracts, 10);

  // ─── FETCH ─────────────────────────────────────────────────
  const fetchForecast = useCallback(async () => {
    setLoadingForecast(true);
    setError(null);
    try {
      const [roomRes, demandRes] = await Promise.all([
        getRoomForecast(forecastDays),
        getDemandForecast(),
      ]);
      setRoomForecast(roomRes.data);
      setDemandForecast(demandRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingForecast(false);
    }
  }, [forecastDays]);

  const fetchExpiringContracts = useCallback(async () => {
    setLoadingContracts(true);
    try {
      const res = await getExpiringContracts(expiringDays);
      setExpiringContracts(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingContracts(false);
    }
  }, [expiringDays]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  useEffect(() => {
    fetchExpiringContracts();
  }, [fetchExpiringContracts]);

  // ─── SEND EMAILS ───────────────────────────────────────────
  const handleSendEmails = async () => {
    setSendingEmails(true);
    setConfirmSend(false);
    setSendResult(null);
    try {
      const res = await sendRenewalEmails(selectedIds);
      setSendResult({ success: true, sent: res.data?.sent || 0, failed: res.data?.failed || 0 });
      setSelectedIds([]);
    } catch (e) {
      setSendResult({ success: false, message: e.message });
    } finally {
      setSendingEmails(false);
    }
  };

  // ─── SELECTION ─────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = pagination.currentItems.map((c) => c.id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  // ─── DERIVED ───────────────────────────────────────────────
  const totalAvail = roomForecast ? roomForecast.available_now + roomForecast.available_soon : 0;
  const demand = demandForecast?.estimated || 0;
  const gap = totalAvail - demand;
  const gapColor = gap >= 0 ? "text-emerald-600" : "text-rose-600";
  const gapBg = gap >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200";

  // ─── TABLE COLUMNS ─────────────────────────────────────────
  const contractColumns = [
    {
      header: (
        <button onClick={toggleSelectAll} className="flex items-center justify-center">
          {pagination.currentItems.length > 0 &&
           pagination.currentItems.every((c) => selectedIds.includes(c.id)) ? (
            <CheckSquare size={16} className="text-blue-600" />
          ) : (
            <Square size={16} className="text-slate-400" />
          )}
        </button>
      ),
      accessor: (row) => (
        <button onClick={() => toggleSelect(row.id)} className="flex items-center justify-center">
          {selectedIds.includes(row.id) ? (
            <CheckSquare size={16} className="text-blue-600" />
          ) : (
            <Square size={16} className="text-slate-400" />
          )}
        </button>
      ),
      width: "w-12",
      align: "center",
    },
    {
      header: "Sinh viên",
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.student_name || "—"}</p>
          <p className="text-xs text-slate-400">{row.student_email}</p>
        </div>
      ),
    },
    {
      header: "Mã SV",
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {row.snapshot_student_id || "—"}
        </span>
      ),
    },
    {
      header: "Số HĐ",
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-600">{row.contract_number}</span>
      ),
    },
    {
      header: "Phòng",
      accessor: (row) => (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
          {row.room_number || "—"}
        </span>
      ),
    },
    {
      header: "Hết hạn",
      accessor: (row) => {
        const daysLeft = Math.ceil((new Date(row.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        const color = daysLeft <= 14 ? "text-rose-600 bg-rose-50" : daysLeft <= 30 ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-50";
        return (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {new Date(row.end_date).toLocaleDateString("vi-VN")}
            </p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
              còn {daysLeft} ngày
            </span>
          </div>
        );
      },
    },
  ];

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-xl">
            <Rocket size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Chuẩn bị mở đợt đăng ký mới</h2>
            <p className="text-blue-100 text-sm">
              Công cụ hỗ trợ vận hành — kiểm tra sẵn sàng trước khi mở đợt
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── SECTION 1: DỰ BÁO PHÒNG ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <BedDouble size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Dự báo phòng trống</h3>
              <p className="text-xs text-slate-500">Phòng sẵn có ngay + sẽ trống sau X ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Sau</label>
            <input
              type="number"
              min={7}
              max={365}
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="w-16 text-center border border-slate-200 rounded-xl px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <label className="text-xs font-semibold text-slate-500">ngày</label>
            <button
              onClick={fetchForecast}
              disabled={loadingForecast}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60"
            >
              <RefreshCw size={13} className={loadingForecast ? "animate-spin" : ""} />
              Cập nhật
            </button>
          </div>
        </div>

        <div className="p-6">
          {loadingForecast ? (
            <p className="text-center text-slate-400 text-sm py-8">Đang tải dữ liệu...</p>
          ) : roomForecast ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={BedDouble}
                label="Phòng trống ngay lập tức"
                value={roomForecast.available_now}
                subValue="chỗ trống"
                color="emerald"
              />
              <StatCard
                icon={CalendarClock}
                label={`Chỗ trống trong ${forecastDays} ngày tới`}
                value={roomForecast.available_soon}
                subValue={`chỗ từ ${roomForecast.rooms_affected ?? 0} phòng sắp hết HĐ`}
                color="amber"
              />
              <StatCard
                icon={BarChart3}
                label="Tổng dự kiến có thể đáp ứng"
                value={roomForecast.available_now + roomForecast.available_soon}
                subValue="chỗ"
                color="blue"
              />
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-8">Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* ── SECTION 2: DỰ BÁO NHU CẦU ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-xl">
            <TrendingUp size={20} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Dự báo nhu cầu đăng ký</h3>
            <p className="text-xs text-slate-500">Ước tính dựa trên số đăng ký năm trước + 10% tăng trưởng</p>
          </div>
        </div>

        <div className="p-6">
          {loadingForecast ? (
            <p className="text-center text-slate-400 text-sm py-8">Đang tải dữ liệu...</p>
          ) : demandForecast ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  icon={Users}
                  label={`Số đăng ký năm ${demandForecast.year - 1}`}
                  value={demandForecast.last_year}
                  subValue="hồ sơ"
                  color="slate"
                />
                <StatCard
                  icon={TrendingUp}
                  label={`Dự báo năm ${demandForecast.year} (+${(demandForecast.growth_rate * 100).toFixed(0)}%)`}
                  value={demandForecast.estimated}
                  subValue="hồ sơ dự kiến"
                  color="violet"
                />
                {roomForecast && (
                  <div className={`rounded-2xl border p-4 ${gapBg}`}>
                    <p className="text-xs font-bold text-slate-500 mb-1">Chênh lệch cung / cầu</p>
                    <p className={`text-4xl font-black ${gapColor}`}>
                      {gap >= 0 ? "+" : ""}{gap}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {gap >= 0
                        ? "Đủ chỗ — có thể mở đợt"
                        : "Thiếu chỗ — cần kiểm tra lại chỉ tiêu"}
                    </p>
                  </div>
                )}
              </div>

              {/* Insight banner */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                  Dự báo dựa trên dữ liệu lịch sử. Nếu năm trước chưa có đủ dữ liệu, con số sẽ thấp
                  — hãy cân nhắc điều chỉnh thủ công chỉ tiêu trong tab <strong>Điều chỉnh</strong>.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-8">Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* ── SECTION 3: HỢP ĐỒNG SẮP HẾT HẠN ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Hợp đồng sắp hết hạn</h3>
              <p className="text-xs text-slate-500">Gửi email nhắc gia hạn để giải phóng / duy trì chỗ ở</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Trong</label>
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setExpiringDays(d)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  expiringDays === d
                    ? "bg-amber-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d} ngày
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Send result banner */}
          {sendResult && (
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                sendResult.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}
            >
              {sendResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {sendResult.success
                ? `Đã gửi thành công ${sendResult.sent} email${sendResult.failed > 0 ? `, ${sendResult.failed} lỗi` : ""}`
                : sendResult.message}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">{expiringContracts.length}</span> hợp đồng sắp hết hạn
              {selectedIds.length > 0 && (
                <span className="ml-2 text-blue-600 font-bold">
                  — đã chọn {selectedIds.length}
                </span>
              )}
            </p>
            <button
              onClick={() => selectedIds.length > 0 && setConfirmSend(true)}
              disabled={selectedIds.length === 0 || sendingEmails}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm font-bold transition-colors"
            >
              <Mail size={15} />
              {sendingEmails ? "Đang gửi..." : `Gửi email nhắc (${selectedIds.length})`}
            </button>
          </div>

          {/* Table */}
          {loadingContracts ? (
            <p className="text-center text-slate-400 text-sm py-8">Đang tải dữ liệu...</p>
          ) : (
            <>
              <DataTable
                columns={contractColumns}
                data={pagination.currentItems}
                keyExtractor={(row) => row.id}
                emptyState={{
                  icon: CheckCircle2,
                  title: "Không có hợp đồng sắp hết hạn",
                  description: `Tất cả hợp đồng còn hơn ${expiringDays} ngày hiệu lực`,
                }}
              />
              <Pagination pagination={pagination} />
            </>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmSend}
        onClose={() => setConfirmSend(false)}
        onConfirm={handleSendEmails}
        title="Xác nhận gửi email nhắc gia hạn"
        message={`Bạn sắp gửi email nhắc gia hạn tới ${selectedIds.length} sinh viên. Email sẽ được gửi tới địa chỉ email đã đăng ký.`}
        confirmText="Gửi email"
        icon={Mail}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        confirmColor="bg-blue-600 hover:bg-blue-700 focus:ring-blue-200"
        isLoading={sendingEmails}
      />
    </div>
  );
};

export default CampaignLauncher;
