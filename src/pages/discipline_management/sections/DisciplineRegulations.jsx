import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Save, RotateCcw, Home, Shield, Zap,
  Package, FileWarning, Flame
} from "lucide-react";

// ── Accordion Section ────────────────────────────────────────────────────────
const RegSection = ({ id, expanded, onToggle, icon: Icon, iconBg, iconColor, title, subtitle, children }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
    <button
      onClick={() => onToggle(id)}
      className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
    </button>
    {expanded && <div className="px-6 pb-6 border-t border-slate-100 space-y-3 pt-4">{children}</div>}
  </div>
);

// ── Regulation Card ──────────────────────────────────────────────────────────
const RegCard = ({ reg, index, editing, onToggleEdit, onChange }) => (
  <div className={`border-2 rounded-2xl overflow-hidden transition-colors ${editing ? "border-green-300" : "border-slate-200 hover:border-slate-300"}`}>
    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
      <h4 className="font-bold text-slate-900 text-sm">{reg.title}</h4>
      <button
        onClick={onToggleEdit}
        className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${editing ? "bg-green-500 text-white" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
      >
        {editing ? "✓ Xong" : "Chỉnh sửa"}
      </button>
    </div>
    <div className="px-5 py-4">
      {editing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={reg.title}
            onChange={(e) => onChange(index, "title", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-green-400 outline-none"
          />
          <textarea
            value={reg.content}
            onChange={(e) => onChange(index, "content", e.target.value)}
            rows={4}
            className="w-full px-3 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none leading-relaxed resize-none"
          />
        </div>
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed text-justify">{reg.content}</p>
      )}
    </div>
  </div>
);

// ── Save Bar ─────────────────────────────────────────────────────────────────
const SaveBar = ({ status, count, onSave, onAddNew, onDeleteLast, disabled }) => (
  <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-2">
    <div>
      {status === "success" && <span className="flex items-center gap-2 text-emerald-700 text-sm font-semibold"><CheckCircle size={14} /> Đã lưu!</span>}
      {status === "error"   && <span className="flex items-center gap-2 text-rose-700 text-sm font-semibold"><AlertCircle size={14} /> Lỗi khi lưu.</span>}
      {!status && <span className="text-sm text-slate-500">{count} điều khoản</span>}
    </div>
    <div className="flex gap-2">
      <button onClick={onAddNew} className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-colors">
        + Thêm
      </button>
      <button onClick={onDeleteLast} disabled={disabled} className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-colors disabled:opacity-40">
        <RotateCcw size={12} className="inline mr-1" />Xóa cuối
      </button>
      <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm shadow-green-200">
        <Save size={12} /> Lưu
      </button>
    </div>
  </div>
);

// ── Hook quản lý 1 nhóm điều lệ ─────────────────────────────────────────────
const useRegulations = (initial, storageKey) => {
  const [regs, setRegs] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState(null);

  const toggleEdit = (id) => setEditing((p) => (p === id ? null : id));
  const onChange = (index, field, value) => {
    setRegs((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };
  const addNew = () => {
    const newId = Math.max(...regs.map((r) => r.id), 0) + 1;
    setRegs((p) => [...p, { id: newId, title: `Điều ${newId}: Tiêu đề mới`, content: "Nội dung điều khoản..." }]);
  };
  const deleteLast = () => {
    if (regs.length <= 1) return;
    if (confirm("Xóa điều khoản cuối cùng?")) setRegs((p) => p.slice(0, -1));
  };
  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(regs));
    setStatus("success");
    setTimeout(() => setStatus(null), 3000);
  };

  return { regs, editing, status, toggleEdit, onChange, addNew, deleteLast, save };
};

// ════════════════════════════════════════════════════════════════════════════
const DisciplineRegulations = () => {
  const [expanded, setExpanded] = useState("general");
  const toggle = (id) => setExpanded((p) => (p === id ? null : id));

  // ── Nhóm 1: Nội quy chung ─────────────────────────────────────────────
  const general = useRegulations([
    { id: 1, title: "Điều 1: Đối tượng áp dụng", content: "Quy định này áp dụng cho tất cả sinh viên đang cư trú tại Ký túc xá Trường Đại học Thăng Long. Sinh viên có trách nhiệm đọc kỹ, hiểu rõ và ký xác nhận chấp hành khi nhận phòng." },
    { id: 2, title: "Điều 2: Giờ giấc sinh hoạt", content: "Giờ đóng cửa KTX: 23h00. Giờ mở cửa: 05h00. Sinh viên ra vào ngoài giờ quy định phải đăng ký trước với ban quản lý. Nghiêm cấm gây ồn ào sau 22h00 và trước 06h00." },
    { id: 3, title: "Điều 3: Đăng ký khách thăm", content: "Khách thăm chỉ được vào KTX từ 07h00 đến 21h00. Phải đăng ký tại bảo vệ và để lại giấy tờ tùy thân. Nghiêm cấm để khách ở lại qua đêm dưới mọi hình thức." },
    { id: 4, title: "Điều 4: Vệ sinh phòng ở", content: "Sinh viên có trách nhiệm giữ gìn vệ sinh phòng ở và khu vực chung. Phòng phải được dọn dẹp ít nhất 2 lần/tuần. Ban quản lý kiểm tra định kỳ hàng tháng và đột xuất khi cần thiết." },
    { id: 5, title: "Điều 5: Trật tự và an ninh", content: "Sinh viên có trách nhiệm bảo vệ tài sản cá nhân và tài sản chung. Phát hiện người lạ hoặc hành vi đáng ngờ phải báo ngay cho bảo vệ hoặc ban quản lý. Không tự ý cho người khác mượn thẻ ra vào." },
  ], "reg_general");

  // ── Nhóm 2: Tài sản chung ─────────────────────────────────────────────
  const assets = useRegulations([
    { id: 1, title: "Điều 1: Trách nhiệm bảo quản tài sản", content: "Sinh viên có trách nhiệm bảo quản toàn bộ tài sản được bàn giao trong phòng ở. Mọi hư hỏng do sử dụng không đúng mục đích hoặc cố ý phá hoại sẽ phải bồi thường 100% giá trị tài sản." },
    { id: 2, title: "Điều 2: Bồi thường khi làm mất hoặc hư hỏng", content: "Khi làm mất hoàn toàn tài sản, sinh viên phải bồi thường 150% giá trị. Trường hợp hư hỏng có thể sửa chữa, sinh viên chịu toàn bộ chi phí sửa chữa hoặc bồi thường theo giá trị hư hỏng thực tế." },
    { id: 3, title: "Điều 3: Báo cáo hư hỏng và bảo trì", content: "Sinh viên phải báo cáo ngay cho ban quản lý trong vòng 24 giờ khi phát hiện tài sản hư hỏng. Việc không báo cáo kịp thời có thể bị coi là cố ý che giấu và phải chịu trách nhiệm bồi thường." },
    { id: 4, title: "Điều 4: Kiểm tra tài sản định kỳ", content: "Ban quản lý KTX tiến hành kiểm tra tình trạng tài sản trong phòng định kỳ mỗi tháng. Sinh viên có trách nhiệm hợp tác và tạo điều kiện cho việc kiểm tra, không được cản trở." },
    { id: 5, title: "Điều 5: Vật dụng cá nhân và vật cấm", content: "Sinh viên được phép mang đồ dùng cá nhân vào phòng nhưng nghiêm cấm mang các thiết bị nấu ăn (bếp điện, nồi cơm điện), vật nuôi, chất dễ cháy nổ, vũ khí và các vật phẩm vi phạm pháp luật." },
    { id: 6, title: "Điều 6: Di chuyển tài sản", content: "Nghiêm cấm tự ý di chuyển tài sản giữa các phòng hoặc mang tài sản của KTX ra ngoài. Mọi trường hợp cần di chuyển phải được sự đồng ý bằng văn bản của ban quản lý." },
    { id: 7, title: "Điều 7: Trả phòng và bàn giao tài sản", content: "Khi trả phòng, sinh viên phải bàn giao đầy đủ tài sản theo danh mục ban đầu. Nếu thiếu hoặc hư hỏng, phải hoàn tất việc bồi thường trước khi được hoàn trả tiền đặt cọc và nhận giấy xác nhận." },
  ], "reg_assets");

  // ── Nhóm 3: Điện - Nước ───────────────────────────────────────────────
  const utilities = useRegulations([
    { id: 1, title: "Điều 1: Sử dụng điện tiết kiệm", content: "Sinh viên có trách nhiệm sử dụng điện tiết kiệm, tắt đèn và các thiết bị điện khi ra khỏi phòng. Hóa đơn điện được tính theo chỉ số thực tế với đơn giá 3.500 VNĐ/kWh." },
    { id: 2, title: "Điều 2: Thiết bị điện được phép sử dụng", content: "Chỉ được sử dụng các thiết bị điện có công suất dưới 1.000W như: quạt cá nhân, đèn bàn, máy tính xách tay, điện thoại sạc. Nghiêm cấm sử dụng bếp điện, lò vi sóng, máy sấy tóc công suất cao." },
    { id: 3, title: "Điều 3: Sử dụng nước tiết kiệm", content: "Sinh viên có trách nhiệm sử dụng nước tiết kiệm, khóa vòi nước sau khi dùng. Hóa đơn nước được tính theo chỉ số thực tế với đơn giá 15.000 VNĐ/m³. Báo ngay khi phát hiện rò rỉ nước." },
    { id: 4, title: "Điều 4: Xử lý vi phạm sử dụng điện nước", content: "Vi phạm quy định sử dụng điện (dùng thiết bị cấm) bị phạt từ 200.000 - 500.000 VNĐ và tịch thu thiết bị. Gây hư hỏng hệ thống điện nước phải bồi thường toàn bộ chi phí sửa chữa." },
  ], "reg_utilities");

  // ── Nhóm 4: Phòng cháy chữa cháy ─────────────────────────────────────
  const fire = useRegulations([
    { id: 1, title: "Điều 1: Nghiêm cấm sử dụng lửa trần", content: "Tuyệt đối nghiêm cấm đốt lửa, thắp hương, sử dụng nến, bật lửa hoặc bất kỳ nguồn lửa trần nào trong phòng ở và khu vực KTX. Vi phạm sẽ bị xử lý kỷ luật nghiêm khắc." },
    { id: 2, title: "Điều 2: Không tàng trữ chất dễ cháy nổ", content: "Nghiêm cấm tàng trữ xăng, dầu, gas, cồn, pháo nổ và các chất dễ cháy nổ trong phòng ở. Phát hiện vi phạm sẽ bị xử lý theo quy định pháp luật và buộc thôi ở ngay lập tức." },
    { id: 3, title: "Điều 3: Thiết bị chữa cháy", content: "Sinh viên không được tự ý sử dụng, di chuyển hoặc làm hỏng các thiết bị PCCC (bình chữa cháy, vòi rồng, đầu báo khói). Chỉ sử dụng khi có sự cố thực sự. Vi phạm bị phạt 500.000 VNĐ." },
    { id: 4, title: "Điều 4: Thoát hiểm khi có sự cố", content: "Khi có chuông báo cháy hoặc lệnh sơ tán, sinh viên phải lập tức rời phòng theo lối thoát hiểm được chỉ định. Không sử dụng thang máy. Tập trung tại điểm quy định và điểm danh với ban quản lý." },
  ], "reg_fire");

  // ── Nhóm 5: Kỷ luật và xử phạt ───────────────────────────────────────
  const discipline = useRegulations([
    { id: 1, title: "Điều 1: Các mức xử lý kỷ luật", content: "Mức 1 - Nhắc nhở: Vi phạm lần đầu, mức độ nhẹ. Mức 2 - Cảnh cáo: Vi phạm lần 2 hoặc mức trung bình. Mức 3 - Phạt tiền: Có thiệt hại tài sản hoặc vi phạm nghiêm trọng. Mức 4 - Đình chỉ tạm thời. Mức 5 - Buộc thôi ở." },
    { id: 2, title: "Điều 2: Mức phạt tiền cụ thể", content: "Gây ồn ào sau 22h: 100.000 VNĐ/lần. Để xe sai quy định: 50.000 VNĐ/lần. Dùng thiết bị điện cấm: 200.000 - 500.000 VNĐ. Cho người ngoài ở qua đêm: 500.000 VNĐ/lần. Hư hại tài sản: bồi thường 100-150% giá trị." },
    { id: 3, title: "Điều 3: Quyền khiếu nại", content: "Sinh viên có quyền khiếu nại quyết định kỷ luật trong vòng 7 ngày kể từ ngày nhận quyết định. Đơn khiếu nại gửi trực tiếp đến Ban Giám đốc KTX. Ban quản lý có trách nhiệm trả lời trong vòng 15 ngày làm việc." },
    { id: 4, title: "Điều 4: Tái phạm và tăng nặng", content: "Sinh viên tái phạm cùng một lỗi trong vòng 3 tháng sẽ bị tăng mức xử lý lên một bậc. Tái phạm 3 lần trở lên trong một học kỳ sẽ bị xem xét buộc thôi ở và thông báo về gia đình và nhà trường." },
    { id: 5, title: "Điều 5: Hiệu lực của quyết định kỷ luật", content: "Quyết định kỷ luật có hiệu lực ngay sau khi ký ban hành. Sinh viên phải chấp hành quyết định trong thời hạn quy định. Không chấp hành sẽ bị nâng mức xử lý và có thể bị buộc thôi ở." },
  ], "reg_discipline");

  // ── Nhóm 6: Thanh toán và hợp đồng ───────────────────────────────────
  const payment = useRegulations([
    { id: 1, title: "Điều 1: Thời hạn thanh toán", content: "Hóa đơn tiền phòng và dịch vụ phải được thanh toán trước ngày 15 hàng tháng. Quá hạn sẽ bị tính phí phạt 0,1%/ngày trên tổng số tiền chưa thanh toán. Quá 30 ngày có thể bị chấm dứt hợp đồng." },
    { id: 2, title: "Điều 2: Tiền đặt cọc", content: "Sinh viên phải nộp tiền đặt cọc tương đương 1 tháng tiền phòng khi ký hợp đồng. Tiền đặt cọc được hoàn trả sau khi trả phòng, trừ các khoản bồi thường tài sản và nợ chưa thanh toán (nếu có)." },
    { id: 3, title: "Điều 3: Gia hạn hợp đồng", content: "Hợp đồng thuê phòng có thời hạn theo học kỳ hoặc năm học. Sinh viên muốn gia hạn phải đăng ký trước ít nhất 30 ngày trước khi hợp đồng hết hạn. Không đăng ký gia hạn đúng hạn sẽ mất quyền ưu tiên giữ phòng." },
    { id: 4, title: "Điều 4: Chấm dứt hợp đồng trước hạn", content: "Sinh viên muốn chấm dứt hợp đồng trước hạn phải thông báo trước ít nhất 15 ngày. Tiền phòng đã nộp cho tháng chưa ở hết sẽ được hoàn trả theo tỷ lệ ngày thực tế. Tiền đặt cọc hoàn trả sau khi bàn giao phòng đầy đủ." },
  ], "reg_payment");

  const sections = [
    { id: "general",    hook: general,    icon: Home,        iconBg: "bg-blue-100",   iconColor: "text-blue-600",   title: "1. Nội quy chung",                subtitle: "Giờ giấc, vệ sinh, trật tự và an ninh KTX" },
    { id: "assets",     hook: assets,     icon: Package,     iconBg: "bg-green-100",  iconColor: "text-green-600",  title: "2. Tài sản chung",                subtitle: "Bảo quản, bồi thường và bàn giao tài sản" },
    { id: "utilities",  hook: utilities,  icon: Zap,         iconBg: "bg-yellow-100", iconColor: "text-yellow-600", title: "3. Điện - Nước",                  subtitle: "Sử dụng tiết kiệm và quy định thiết bị điện" },
    { id: "fire",       hook: fire,       icon: Flame,       iconBg: "bg-red-100",    iconColor: "text-red-600",    title: "4. Phòng cháy chữa cháy",         subtitle: "An toàn PCCC và xử lý sự cố" },
    { id: "discipline", hook: discipline, icon: Shield,      iconBg: "bg-purple-100", iconColor: "text-purple-600", title: "5. Kỷ luật và xử phạt",           subtitle: "Các mức xử lý, mức phạt và quyền khiếu nại" },
    { id: "payment",    hook: payment,    icon: FileWarning, iconBg: "bg-orange-100", iconColor: "text-orange-600", title: "6. Thanh toán và hợp đồng",       subtitle: "Thời hạn thanh toán, đặt cọc và gia hạn" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <BookOpen size={26} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bảng quy định Ký túc xá</h3>
            <p className="text-sm text-slate-500 mt-0.5">Toàn bộ nội quy, điều lệ và quy định áp dụng cho sinh viên cư trú</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-indigo-50 rounded-xl flex items-start gap-2">
          <AlertCircle size={15} className="text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-700">
            Các quy định có hiệu lực kể từ ngày ban hành. Mọi sinh viên cư trú đều phải tuân thủ.
            Ban quản lý có quyền sửa đổi, bổ sung khi cần thiết và thông báo trước ít nhất 7 ngày.
          </p>
        </div>
      </div>

      {/* Sections */}
      {sections.map(({ id, hook, icon, iconBg, iconColor, title, subtitle }) => (
        <RegSection
          key={id}
          id={id}
          expanded={expanded === id}
          onToggle={toggle}
          icon={icon}
          iconBg={iconBg}
          iconColor={iconColor}
          title={title}
          subtitle={subtitle}
        >
          {hook.regs.map((reg, index) => (
            <RegCard
              key={reg.id}
              reg={reg}
              index={index}
              editing={hook.editing === reg.id}
              onToggleEdit={() => hook.toggleEdit(reg.id)}
              onChange={hook.onChange}
            />
          ))}
          <SaveBar
            status={hook.status}
            count={hook.regs.length}
            onSave={hook.save}
            onAddNew={hook.addNew}
            onDeleteLast={hook.deleteLast}
            disabled={hook.regs.length <= 1}
          />
        </RegSection>
      ))}
    </div>
  );
};

export default DisciplineRegulations;
