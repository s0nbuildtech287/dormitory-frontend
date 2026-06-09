// ContractPrintView.jsx — In hợp đồng qua iframe ẩn, không overlay
import { useEffect, useRef } from "react";
import { getBuildingLabel, getRoomLabel } from "../../../utils/buildingDisplay.js";

const fmtDate  = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "............");
const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đồng` : "............");
const fmt      = (v) => (v != null && v !== "" ? v : "............");

function buildHTML(c) {
  const today = new Date().toLocaleDateString("vi-VN");

  const row = (label, value) => `
    <tr>
      <td class="label">${label}:</td>
      <td class="value">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Hợp đồng ${fmt(c.contract_number)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.7;
      color: #000;
      background: #fff;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 20mm 20mm 20mm 25mm;
    }
    @media print {
      @page { size: A4 portrait; margin: 0; }
      .page { padding: 20mm 20mm 20mm 25mm; page-break-after: auto; }
    }

    /* Tiêu đề */
    .center { text-align: center; }
    .quochieu { font-weight: bold; text-transform: uppercase; font-size: 12pt; }
    .doclaptudo { font-weight: bold; font-size: 12pt; margin-top: 2mm; }
    .gachduoi { border-bottom: 1.5px solid #000; width: 60mm; margin: 2mm auto 3mm; }
    .ngay { font-style: italic; font-size: 11pt; }
    .tieude { font-weight: bold; text-transform: uppercase; font-size: 15pt; letter-spacing: 0.5px; margin: 5mm 0 2mm; }
    .sohd { font-size: 12pt; margin-bottom: 6mm; }
    .divider-bold { border: none; border-top: 2px solid #000; margin-bottom: 5mm; }
    .divider { border: none; border-top: 1px solid #000; margin: 4mm 0; }

    /* Nội dung */
    .section-title { font-weight: bold; margin: 4mm 0 2mm; }
    .italic-note { font-style: italic; font-size: 11pt; margin-bottom: 4mm; }
    p { margin-bottom: 3mm; }

    /* Bảng thông tin */
    table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
    td { padding: 2mm 0; vertical-align: top; }
    td.label { width: 46%; font-style: italic; }
    td.value { font-weight: 600; }

    /* Chữ ký */
    .signature-row { display: flex; justify-content: space-between; margin-top: 10mm; }
    .sig-box { text-align: center; width: 44%; }
    .sig-box .sig-title { font-weight: bold; margin-bottom: 1mm; }
    .sig-box .sig-space { height: 22mm; }
    .sig-box .sig-name { font-weight: 600; }
  </style>
</head>
<body>
<div class="page">

  <div class="center">
    <p class="quochieu">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
    <p class="doclaptudo">Độc lập – Tự do – Hạnh phúc</p>
    <div class="gachduoi"></div>
    <p class="ngay">Hà Nội, ngày ${today}</p>
  </div>

  <div class="center" style="margin-top:5mm">
    <p class="tieude">Hợp đồng nội trú ký túc xá</p>
    <p class="sohd">Số: <strong>${fmt(c.contract_number)}</strong></p>
  </div>

  <hr class="divider-bold" />

  <p class="italic-note">
    Căn cứ Quy chế công tác sinh viên nội trú của Bộ Giáo dục và Đào tạo; Quy định của Trường Đại học Thủy Lợi về quản lý ký túc xá; Hai bên cùng thỏa thuận ký kết hợp đồng với các điều khoản sau:
  </p>

  <p class="section-title">Bên cho thuê (Bên A):</p>
  <table><tbody>
    ${row("Đơn vị", "Ký túc xá Trường Đại học Thủy Lợi")}
    ${row("Địa chỉ", "175 Tây Sơn, Đống Đa, Hà Nội")}
    ${row("Điện thoại", "(024) 3563 3351")}
    ${row("Đại diện", "Ban Quản lý Ký túc xá")}
  </tbody></table>

  <p class="section-title">Bên thuê (Bên B):</p>
  <table><tbody>
    ${row("Mã sinh viên", fmt(c.snapshot_student_id))}
    ${row("Số CCCD", fmt(c.snapshot_cccd))}
    ${row("Khoa", fmt(c.snapshot_faculty))}
    ${row("Năm học", fmt(c.snapshot_year))}
    ${row("Số điện thoại", fmt(c.snapshot_phone))}
  </tbody></table>

  <hr class="divider" />

  <p class="section-title">Điều 1: Nội dung hợp đồng</p>
  <p>Bên A đồng ý cho Bên B thuê chỗ ở tại Ký túc xá với thông tin sau:</p>
  <table><tbody>
    ${row("Phòng", c.room_number ? `${getRoomLabel(c.building, c.room_number)} (Tầng ${c.floor}, ${getBuildingLabel(c.building)})` : "Chưa gán phòng")}
    ${row("Diện tích", c.area ? `${c.area} m²` : "............")}
    ${row("Sức chứa", c.capacity ? `${c.capacity} người` : "............")}
    ${row("Ngày bắt đầu", fmtDate(c.start_date))}
    ${row("Ngày kết thúc", fmtDate(c.end_date))}
    ${row("Ngày ký hợp đồng", fmtDate(c.signed_at))}
  </tbody></table>

  <p class="section-title">Điều 2: Giá thuê và phương thức thanh toán</p>
  <table><tbody>
    ${row("Phí nội trú / người / tháng", fmtMoney(c.rent_price))}
    ${row("Tiền cọc", fmtMoney(c.deposit_amount))}
    ${row("Phí internet / phòng / tháng", fmtMoney(c.internet_fee))}
    ${row("Phí vệ sinh / phòng / tháng", fmtMoney(c.garbage_fee))}
    ${row("Phí gửi xe / xe / tháng", fmtMoney(c.parking_fee))}
  </tbody></table>
  <p class="italic-note">
    Hạn nộp tiền: ngày 10 hàng tháng. Thanh toán qua hệ thống online (VNPay) hoặc nộp trực tiếp tại văn phòng KTX. Nộp trễ bị phạt 0,1%/ngày trên số tiền còn nợ.
  </p>

  <p class="section-title">Điều 3: Quyền và nghĩa vụ các bên</p>
  <p><strong>Bên A:</strong> Cung cấp chỗ ở đúng hợp đồng; đảm bảo an ninh, vệ sinh, điện nước; thông báo kịp thời các thay đổi liên quan đến sinh viên.</p>
  <p><strong>Bên B:</strong> Tuân thủ nội quy KTX; nộp phí đúng hạn; giữ gìn tài sản chung; không tự ý sửa chữa phòng; đăng ký tạm trú theo quy định; thông báo trước 15 ngày khi trả phòng.</p>

  <p class="section-title">Điều 4: Điều khoản chung</p>
  <p>
    ${c.terms_conditions || "Hợp đồng có hiệu lực kể từ ngày ký. Mọi tranh chấp được giải quyết trên tinh thần thương lượng. Nếu không thỏa thuận được, hai bên đưa ra cơ quan có thẩm quyền giải quyết theo quy định pháp luật hiện hành."}
  </p>

  <div class="signature-row">
    <div class="sig-box">
      <p class="sig-title">Đại diện Bên A</p>
      <p style="font-style:italic;font-size:11pt">(Ký, đóng dấu, ghi rõ họ tên)</p>
      <div class="sig-space"></div>
      <p class="sig-name">Ban Quản lý KTX</p>
      <p>Trường Đại học Thủy Lợi</p>
    </div>
    <div class="sig-box">
      <p class="sig-title">Bên B</p>
      <p style="font-style:italic;font-size:11pt">(Ký, ghi rõ họ tên)</p>
      <div class="sig-space"></div>
      <p class="sig-name">Sinh viên</p>
      <p>MSSV: ${fmt(c.snapshot_student_id)}</p>
    </div>
  </div>

</div>
</body>
</html>`;
}

export default function ContractPrintView({ contract: c, onClose }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(buildHTML(c));
    doc.close();

    // Đợi load xong rồi print
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Sau khi đóng hộp thoại in thì đóng view
      iframe.contentWindow.onafterprint = () => onClose();
    };
  }, [c, onClose]);

  return (
    <iframe
      ref={iframeRef}
      style={{ display: "none" }}
      title="contract-print"
    />
  );
}
