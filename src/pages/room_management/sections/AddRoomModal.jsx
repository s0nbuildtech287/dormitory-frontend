import { useState } from "react";
import { X, Plus, Wifi, Car } from "lucide-react";

const AddRoomModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log("Adding room...");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl p-6 animate-in scale-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Thêm phòng mới</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Số phòng *</label>
                            <input
                                type="text"
                                placeholder="Ví dụ: 101"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tòa nhà *</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm" required>
                                <option value="">Chọn tòa</option>
                                <option value="A">Tòa A</option>
                                <option value="B">Tòa B</option>
                                <option value="C">Tòa C</option>
                                <option value="D">Tòa D</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tầng *</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm" required>
                                <option value="">Chọn tầng</option>
                                <option value="1">Tầng 1</option>
                                <option value="2">Tầng 2</option>
                                <option value="3">Tầng 3</option>
                                <option value="4">Tầng 4</option>
                                <option value="5">Tầng 5</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sức chứa *</label>
                            <input
                                type="number"
                                placeholder="Số sinh viên"
                                min="1"
                                max="8"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Giá thuê phòng (VNĐ/tháng) *</label>
                        <input
                            type="number"
                            placeholder="Ví dụ: 1500000"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                            required
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-3">Phí dịch vụ</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
                                    <Wifi size={12} /> Internet (VNĐ/tháng)
                                </label>
                                <input
                                    type="number"
                                    placeholder="100000"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
                                    <Car size={12} /> Gửi xe (VNĐ/tháng)
                                </label>
                                <input
                                    type="number"
                                    placeholder="50000"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Phí rác (VNĐ/tháng)</label>
                                <input
                                    type="number"
                                    placeholder="20000"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Thêm phòng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRoomModal;
