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
  Building2,
  GraduationCap,
} from "lucide-react";
import { getRoomForecast, getDemandForecast, getScoringWeights, updateScoringWeights } from "../../../api/apiRegistration.js";
import { getExpiringContracts, sendRenewalEmails } from "../../../api/apiContract.js";
import StatCard from "../../../components/common/StatCard.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import { getRoomLabel, getBuildingLabel } from "../../../utils/buildingDisplay.js";
import { usePagination } from "../../../hooks/usePagination.js";
import { useNavigationHandlers } from "../../../hooks/useNavigationHandlers.js";

const CampaignLauncher = () => {
  const { handleNavigateToInvoice } = useNavigationHandlers();

  // ─── STATE ────────────────────────────────────────────────
  const [forecastDays, setForecastDays] = useState(30);
  const [roomForecast, setRoomForecast] = useState(null);
  const [demandForecast, setDemandForecast] = useState(null);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [expiringDays, setExpiringDays] = useState(35);

  const [fullSettings, setFullSettings] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await getScoringWeights();
      if (res.success && res.data && res.data.value) {
        setFullSettings(res.data.value);
        if (res.data.value.quotas) {
          setRegistrationOpen(res.data.value.quotas.registration_open !== false);
        }
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleRegistration = async (e) => {
    const newVal = e.target.checked;
    setRegistrationOpen(newVal);
    setUpdatingStatus(true);
    try {
      const updatedValue = {
        ...fullSettings,
        quotas: {
          ...fullSettings?.quotas,
          registration_open: newVal
        }
      };
      await updateScoringWeights(updatedValue);
      const res = await getScoringWeights();
      if (res.success && res.data && res.data.value) {
        setFullSettings(res.data.value);
      }
    } catch (err) {
      console.error("Error updating registration status:", err);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
      setRegistrationOpen(!newVal);
    } finally {
      setUpdatingStatus(false);
    }
  };

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
      header: "Tòa",
      align: "center",
      accessor: (row) => (
        <span className="font-semibold text-slate-700 text-xs whitespace-nowrap">
          {getBuildingLabel(row.building)}
        </span>
      ),
    },
    {
      header: "Phòng",
      align: "center",
      accessor: (row) => {
        let displayRoom = row.room_number || "—";
        if (typeof row.room_number === "string" && row.room_number.startsWith("room-")) {
          const parts = row.room_number.split("-");
          if (parts.length >= 2) {
            displayRoom = `Phòng ${parts[1]}`;
          }
        }
        if (row.floor) {
          displayRoom = `${displayRoom} - Tầng ${row.floor}`;
        }
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold whitespace-nowrap">
            {displayRoom}
          </span>
        );
      },
    },
    {
      header: "Hóa đơn",
      align: "center",
      accessor: (row) => (
        <button
          onClick={() => handleNavigateToInvoice(row.room_number)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
            row.has_unpaid_invoices
              ? "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200"
              : "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
          }`}
          title="Nhấp để xem chi tiết hóa đơn phòng"
        >
          {row.has_unpaid_invoices ? "Còn nợ" : "Không nợ"}
        </button>
      ),
    },
    {
      header: "Hết hạn",
      accessor: (row) => {
        const daysLeft = Math.ceil((new Date(row.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        const color = daysLeft <= 14
          ? "bg-rose-100 text-rose-700 border border-rose-200"
          : daysLeft <= 30
            ? "bg-amber-100 text-amber-700 border border-amber-200"
            : "bg-slate-100 text-slate-600 border border-slate-200";
        const isYear4 = row.snapshot_year === 4;
        return (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              {new Date(row.end_date).toLocaleDateString("vi-VN")}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
                còn {daysLeft} ngày
              </span>
              {isYear4 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap">
                  Năm 4 — Không gia hạn
                </span>
              )}
            </div>
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

      {/* Toggle Mở Đợt Đăng Ký Trực Tuyến */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3.5 rounded-xl ${registrationOpen ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
            <Rocket className={registrationOpen ? "animate-pulse" : ""} size={22} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-900 text-base">Cấu hình Đợt Đăng Ký Trực Tuyến</h3>
            <p className="text-xs text-slate-500 mt-1">Bật/tắt cho phép sinh viên nộp đơn đăng ký trực tiếp từ nút ngoài trang đăng nhập</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${registrationOpen ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
            {registrationOpen ? "Đợt đăng ký đang MỞ" : "Đợt đăng ký đang ĐÓNG"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={registrationOpen}
              onChange={handleToggleRegistration}
              disabled={updatingStatus}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
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
            <div className="space-y-4">
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

              {/* Phòng trống theo tòa — bảng tòa × tầng */}
              {roomForecast.by_building?.length > 0 && (() => {
                // Pivot: { building: { floor: { pct, avail } } }
                const buildingMap = {};
                const floorSet = new Set();
                roomForecast.by_building.forEach((r) => {
                  if (!buildingMap[r.building]) buildingMap[r.building] = {};
                  buildingMap[r.building][r.floor] = {
                    pct: parseInt(r.occupancy_pct),
                    avail: parseInt(r.available_slots),
                  };
                  floorSet.add(parseInt(r.floor));
                });
                const buildings = Object.keys(buildingMap).sort();
                const floors = [...floorSet].sort((a, b) => a - b);

                const cellColor = (pct) => {
                  if (pct >= 95) return "bg-rose-100 text-rose-700";
                  if (pct >= 80) return "bg-amber-100 text-amber-700";
                  if (pct >= 50) return "bg-yellow-50 text-yellow-700";
                  return "bg-emerald-50 text-emerald-700";
                };

                return (
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 size={15} className="text-slate-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỉ lệ lấp đầy theo tòa / tầng</p>
                      <div className="ml-auto flex items-center gap-3 text-[10px] font-semibold">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 inline-block" />{"<50%"}</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200 inline-block" />50–80%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block" />80–95%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-100 inline-block" />{"≥95%"}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left px-3 py-2 bg-slate-100 rounded-tl-lg font-bold text-slate-600 w-24">Tòa \ Tầng</th>
                            {floors.map((f) => (
                              <th key={f} className="px-3 py-2 bg-slate-100 text-center font-bold text-slate-700">
                                {f}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {buildings.map((b, bi) => (
                            <tr key={b} className={bi % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                              <td className="px-3 py-2 font-black text-slate-700 border-r border-slate-100">{b}</td>
                              {floors.map((f) => {
                                const cell = buildingMap[b]?.[f];
                                if (!cell) return (
                                  <td key={f} className="px-3 py-2 text-center text-slate-300">—</td>
                                );
                                return (
                                  <td key={f} className="px-2 py-1.5 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-lg font-bold ${cellColor(cell.pct)}`}>
                                      {cell.pct}%
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
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
            <h3 className="font-bold text-slate-900">Số lượng nhu cầu đăng ký những năm gần đây</h3>
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

              {/* Phân loại đối tượng — bảng lịch sử 6 năm */}
              {demandForecast.history?.length > 0 && (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap size={15} className="text-slate-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch sử đăng ký theo đối tượng (6 năm)</p>
                    <div className="ml-auto flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Ước tính</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Thực tế</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left px-3 py-2 bg-slate-100 rounded-tl-lg font-bold text-slate-600 w-32">Đối tượng \ Năm</th>
                          {demandForecast.history.map((h) => (
                            <th key={h.year} className="px-3 py-2.5 bg-slate-100 text-center border-b border-slate-200">
                              <span className={`block text-sm font-bold ${h.isReal ? "text-blue-700" : "text-slate-600"}`}>{h.year}</span>
                              {!h.isReal && <span className="block text-[10px] font-medium text-slate-500">ước tính</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: "freshmen", label: "Tân SV (Năm 1)", color: "text-blue-700 bg-blue-50" },
                          { key: "returning", label: "Lưu SV (Năm 2-4)", color: "text-violet-700 bg-violet-50" },
                          { key: "policy", label: "Diện chính sách", color: "text-rose-700 bg-rose-50" },
                          { key: "total", label: "Tổng cộng", color: "text-slate-700 bg-slate-100 font-black" },
                        ].map((row, ri) => (
                          <tr key={row.key} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className={`px-3 py-2 font-bold border-r border-slate-100 ${row.key === "total" ? "font-black text-slate-900" : "text-slate-700"}`}>
                              {row.label}
                            </td>
                            {demandForecast.history.map((h) => (
                              <td key={h.year} className="px-2 py-1.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-lg font-extrabold tracking-tight ${h.isReal ? row.color : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
                                  {(h[row.key] || 0).toLocaleString()}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
            {[35, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setExpiringDays(d)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${expiringDays === d
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
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${sendResult.success
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
