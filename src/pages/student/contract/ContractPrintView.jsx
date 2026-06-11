// ContractPrintView.jsx — In hợp đồng qua iframe ẩn, không overlay
import { useEffect, useRef } from "react";

const fmtDate  = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "............");
const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đồng` : "............");
const fmt      = (v) => (v != null && v !== "" ? v : "............");

function buildHTML(c, { studentName, getBuildingLabel }) {
  const today = new Date().toLocaleDateString("vi-VN");
  const name = studentName || c.student_name || c.rf_student_name;
  const className = c.snapshot_class
    || (c.snapshot_year && c.snapshot_faculty ? `${c.snapshot_year} ${c.snapshot_faculty}` : null);
  const buildingLabel = c.building ? getBuildingLabel(c.building) : "............";
  const roomDisplay = c.room_number
    ? `P.${c.room_number}, ${buildingLabel}`
    : "............";

  const row = (label, value) => `
    <tr>
      <td class="label">${label}:</td>
      <td class="value">${value}</td>
    </tr>`;

  const li = (text) => `<li>${text}</li>`;

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

    .center { text-align: center; }
    .quochieu { font-weight: bold; text-transform: uppercase; font-size: 12pt; }
    .doclaptudo { font-weight: bold; font-size: 12pt; margin-top: 2mm; }
    .gachduoi { border-bottom: 1.5px solid #000; width: 60mm; margin: 2mm auto 3mm; }
    .ngay { font-style: italic; font-size: 11pt; }
    .tieude { font-weight: bold; text-transform: uppercase; font-size: 15pt; letter-spacing: 0.5px; margin: 5mm 0 2mm; }
    .sohd { font-size: 12pt; margin-bottom: 6mm; }
    .divider-bold { border: none; border-top: 2px solid #000; margin-bottom: 5mm; }
    .divider { border: none; border-top: 1px solid #000; margin: 4mm 0; }

    .section-title { font-weight: bold; margin: 4mm 0 2mm; }
    .italic-note { font-style: italic; font-size: 11pt; margin-bottom: 4mm; }
    p { margin-bottom: 3mm; }
    ol { margin: 0 0 3mm 6mm; padding-left: 4mm; }
    li { margin-bottom: 1.5mm; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
    td { padding: 2mm 0; vertical-align: top; }
    td.label { width: 38%; font-style: italic; }
    td.value { font-weight: 600; }

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
    <p class="tieude">Hợp đồng ở nội trú ký túc xá</p>
    <p class="sohd">Số: <strong>${fmt(c.contract_number)}</strong></p>
  </div>

  <hr class="divider-bold" />

  <p class="italic-note">
    Căn cứ Quy chế công tác sinh viên nội trú của Bộ Giáo dục và Đào tạo; Quy định của Trường Đại học Thủy Lợi về quản lý ký túc xá; Hai bên cùng thỏa thuận ký kết hợp đồng với các điều khoản sau:
  </p>

  <table><tbody>
    ${row("Sinh viên", fmt(name))}
    ${row("Lớp", fmt(className))}
    ${row("Phòng", roomDisplay)}
    ${row("Trường", "Trường Đại học Thủy Lợi")}
    ${row("Địa chỉ KTX", "175 Tây Sơn - Đống Đa - Hà Nội")}
    ${row("Mã sinh viên", fmt(c.snapshot_student_id))}
    ${row("Số CCCD", fmt(c.snapshot_cccd))}
    ${row("Số điện thoại", fmt(c.snapshot_phone))}
  </tbody></table>

  <hr class="divider" />

  <p class="section-title">Điều 1. Vị trí phòng ở</p>
  <p>Bên A cho Bên B thuê chỗ ở tại Ký túc xá Trường Đại học Thủy Lợi, cụ thể:</p>
  <table><tbody>
    ${row("Số phòng", c.room_number ? `P.${c.room_number}` : "............")}
    ${row("Nhà", buildingLabel)}
    ${row("Thời hạn", `từ ${fmtDate(c.start_date)} đến ${fmtDate(c.end_date)}`)}
    ${row("Ngày ký hợp đồng", fmtDate(c.signed_at))}
  </tbody></table>

  <p class="section-title">Điều 2. Trang bị, tiện nghi được sử dụng</p>
  <p>Bên B được sử dụng trang bị, tiện nghi trong phòng gồm: giường, nệm, tủ cá nhân, bàn học, ghế, quạt trần, đèn chiếu sáng, ổ cắm điện và các thiết bị chung của phòng theo hiện trạng bàn giao.</p>
  <p>Bên B có trách nhiệm giữ gìn, bảo quản và sử dụng đúng mục đích; không tự ý di chuyển, tháo dỡ hoặc chuyển nhượng tài sản.</p>

  <p class="section-title">Điều 3. Mức phí nội trú hàng tháng</p>
  <p>Mức phí nội trú: <strong>${fmtMoney(c.rent_price)}</strong>/người/tháng.</p>
  <p>Phí nội trú <strong>không bao gồm</strong> tiền điện, tiền nước, cước điện thoại, phí internet và các khoản phí dịch vụ khác (nếu có) theo quy định của KTX.</p>
  <p>Bên B có trách nhiệm đóng phí đúng hạn theo thông báo của Ban quản lý KTX. Tiền cọc (nếu có): <strong>${fmtMoney(c.deposit_amount)}</strong>.</p>

  <p class="section-title">Điều 4. Trách nhiệm Bên A (KTX)</p>
  <ol>
    ${li("Bố trí chỗ ở đúng vị trí đã thỏa thuận.")}
    ${li("Đảm bảo an ninh, trật tự, vệ sinh môi trường chung trong khu nội trú.")}
    ${li("Hướng dẫn, tổ chức thực hiện nội quy KTX và quy định của Nhà trường.")}
    ${li("Thông báo kịp thời các thay đổi liên quan đến sinh viên nội trú.")}
    ${li("Tiếp nhận và xử lý phản ánh, kiến nghị của Bên B theo thẩm quyền.")}
  </ol>

  <p class="section-title">Điều 5. Trách nhiệm Bên B (sinh viên)</p>
  <ol>
    ${li("Chấp hành nội quy KTX, quy định của Nhà trường và pháp luật hiện hành.")}
    ${li("Đóng đầy đủ, đúng hạn các khoản phí theo quy định.")}
    ${li("Giữ gìn vệ sinh phòng ở, tài sản chung; không gây mất trật tự, ảnh hưởng người khác.")}
    ${li("Không tự ý sửa chữa, cải tạo phòng; không cho người khác ở thay hoặc ở chung không đúng quy định.")}
    ${li("Thông báo trước cho Ban quản lý KTX khi có nhu cầu chấm dứt hợp đồng hoặc chuyển phòng.")}
    ${li("Thực hiện đầy đủ thủ tục tạm trú, tạm vắng theo quy định.")}
  </ol>

  <p class="section-title">Điều 6. Các trường hợp chấm dứt hợp đồng tự động</p>
  <p>Hợp đồng tự động chấm dứt trong các trường hợp:</p>
  <ol>
    ${li("Hết thời hạn hợp đồng.")}
    ${li("Bên B không đóng phí hoặc chậm đóng phí theo quy định.")}
    ${li("Bên B vi phạm nội quy nghiêm trọng hoặc vi phạm nhiều lần.")}
    ${li("Bên B bị đình chỉ học tập.")}
    ${li("Bên B đã tốt nghiệp.")}
    ${li("Bên B có kết luận y tế cần cách ly theo quy định.")}
    ${li("Khu nội trú bị phá dỡ hoặc Nhà trường có quyết định thu hồi chỗ ở.")}
  </ol>
  ${c.terms_conditions ? `<p class="italic-note">Ghi chú bổ sung: ${c.terms_conditions}</p>` : ""}

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
      <p class="sig-name">${fmt(name)}</p>
      <p>MSSV: ${fmt(c.snapshot_student_id)}</p>
    </div>
  </div>

</div>
</body>
</html>`;
}

export default function ContractPrintView({ contract: c, studentName, getBuildingLabel, onClose }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const labelFn = getBuildingLabel || (() => "............");
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(buildHTML(c, { studentName, getBuildingLabel: labelFn }));
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      iframe.contentWindow.onafterprint = () => onClose();
    };
  }, [c, studentName, getBuildingLabel, onClose]);

  return (
    <iframe
      ref={iframeRef}
      style={{ display: "none" }}
      title="contract-print"
    />
  );
}
