import { useState } from "react";
import { X, Upload } from "lucide-react";

/**
 * AddRegistrationModal Component
 * Modal form to add a new registration record
 */
const AddRegistrationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    time_register: new Date().toISOString().split('T')[0],
    student_name: "",
    student_id: "",
    dob: "",
    gender: "Nam",
    cccd: "",
    phone_number: "",
    student_email: "",
    faculty: "",
    major: "",
    class: "",
    year: "1",
    gpa: "0",
    address: "",
    priority_reasons: "",
    evidence_images: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student_name.trim()) newErrors.student_name = "Tên sinh viên không được để trống";
    if (!formData.student_id.trim()) newErrors.student_id = "Mã sinh viên không được để trống";
    if (!formData.student_email.trim()) newErrors.student_email = "Email sinh viên không được để trống";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Số điện thoại không được để trống";
    if (!formData.dob.trim()) newErrors.dob = "Ngày sinh không được để trống";
    if (!formData.cccd.trim()) newErrors.cccd = "CCCD không được để trống";
    if (!formData.faculty.trim()) newErrors.faculty = "Khoa không được để trống";
    if (!formData.major.trim()) newErrors.major = "Chuyên ngành không được để trống";
    if (!formData.class.trim()) newErrors.class = "Lớp không được để trống";
    if (!formData.address.trim()) newErrors.address = "Địa chỉ không được để trống";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.student_email && !emailRegex.test(formData.student_email)) newErrors.student_email = "Email sinh viên không hợp lệ";

    // Phone validation
    const phoneRegex = /^0\d{9,10}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        time_register: new Date().toISOString().split('T')[0],
        student_name: "",
        student_id: "",
        dob: "",
        gender: "Nam",
        cccd: "",
        phone_number: "",
        student_email: "",
        faculty: "",
        major: "",
        class: "",
        year: "1",
        gpa: "0",
        address: "",
        priority_reasons: "",
        evidence_images: "",
        note: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error adding registration:", error);
      setErrors({ submit: error.message || "Có lỗi xảy ra khi thêm hồ sơ" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl my-8 flex flex-col max-h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center rounded-t-3xl flex-shrink-0">
          <h2 className="text-white text-2xl font-bold">Thêm hồ sơ đăng ký mới</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Row 1: Student Name, ID & CCCD */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tên sinh viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Hoàng Văn Long"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.student_name ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.student_name && <p className="text-red-500 text-xs mt-1">{errors.student_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mã sinh viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                placeholder="Ví dụ: 2251164001"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.student_id ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                CCCD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleInputChange}
                placeholder="1205000001"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.cccd ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.cccd && <p className="text-red-500 text-xs mt-1">{errors.cccd}</p>}
            </div>
          </div>

          {/* Row 2: Email Sinh viên, Phone, (Empty) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email sinh viên <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="student_email"
                value={formData.student_email}
                onChange={handleInputChange}
                placeholder="student@sv.tlu.edu.vn"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.student_email ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.student_email && <p className="text-red-500 text-xs mt-1">{errors.student_email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="0698376415"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.phone_number ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
            </div>
          </div>

          {/* Row 3: DOB, Gender, Faculty */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.dob ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-blue-200 transition text-sm"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Khoa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
                placeholder="Ví dụ: Công nghệ thông tin"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.faculty ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>}
            </div>
          </div>

          {/* Row 4: Major, Class, Year */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Chuyên ngành <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                placeholder="Ví dụ: Khoa học máy tính"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.major ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.major && <p className="text-red-500 text-xs mt-1">{errors.major}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                placeholder="Ví dụ: 64CNTT1"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.class ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Năm <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-blue-200 transition text-sm"
              >
                <option value="1">Năm 1</option>
                <option value="2">Năm 2</option>
                <option value="3">Năm 3</option>
                <option value="4">Năm 4</option>
              </select>
            </div>
          </div>

          {/* Row 5: GPA & Address - GPA hidden for Year 1 */}
          <div className={`grid gap-4 ${formData.year === "1" ? "grid-cols-2" : "grid-cols-3"}`}>
            {formData.year !== "1" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Điểm GPA
                </label>
                <input
                  type="number"
                  name="gpa"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-blue-200 transition text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ví dụ: Nam Định"
                className={`w-full px-3 py-2 border rounded-lg outline-none transition text-sm ${
                  errors.address ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                } focus:ring-4`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {formData.year === "1" && (
              <div className="flex items-end mb-2">
                <p className="text-sm text-slate-500 italic">Năm 1: Chưa có điểm GPA, hệ thống sẽ dùng điểm trung bình</p>
              </div>
            )}
          </div>

          {/* Row 6: Priority, Evidence, Note */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lý do ưu tiên
              </label>
              <select
                name="priority_reasons"
                value={formData.priority_reasons}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-blue-200 transition text-sm"
              >
                <option value="">-- Không có --</option>
                <option value="Hộ nghèo cận nghèo">Hộ nghèo/Cận nghèo</option>
                <option value="Vùng sâu vùng xa">Vùng sâu/Vùng xa</option>
                <option value="Con thương binh">Con thương binh</option>
                <option value="Con liệt sỹ">Con liệt sỹ</option>
                <option value="Tàn tật khuyết tật">Tàn tật/Khuyết tật</option>
                <option value="Lưu học sinh">Lưu học sinh</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Liên kết hình ảnh bằng chứng
              </label>
              <input
                type="text"
                name="evidence_images"
                value={formData.evidence_images}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/file/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-blue-200 transition text-sm"
              />
            </div>
          </div>

          {/* Row 7: Note */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Ghi chú thêm (tuỳ chọn)"
              rows="2"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-blue-200 transition resize-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-400 transition-all flex items-center gap-2"
            >
              <Upload size={16} />
              {isLoading ? "Đang thêm..." : "Thêm hồ sơ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRegistrationModal;

