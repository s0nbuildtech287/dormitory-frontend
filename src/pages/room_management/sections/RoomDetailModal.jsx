import { useState, useEffect } from "react";
import { X, Home, Package, Wifi, Car, Droplet, Zap, Users } from "lucide-react";
import { getAssetsByRoom } from "../../../api/apiAsset.js";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";

const RoomDetailModal = ({ room, onClose }) => {
    const { getBuildingLabel } = useBuildingDisplayNames();
    const [roomAssets, setRoomAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    useEffect(() => {
        if (room?.id) {
            fetchRoomAssets();
        }
    }, [room?.id]);

    const fetchRoomAssets = async () => {
        setLoadingAssets(true);
        try {
            const response = await getAssetsByRoom(room.id);
            setRoomAssets(response.data || []);
        } catch (error) {
            console.error("Error fetching room assets:", error);
            setRoomAssets([]);
        } finally {
            setLoadingAssets(false);
        }
    };

    if (!room) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-3xl p-6 animate-in scale-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">
                        Chi tiết phòng {room.room_number}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Home size={18} /> Thông tin cơ bản
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600">Số phòng:</span>
                                <span className="text-sm font-bold text-slate-900">{room.room_number}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600">Tòa:</span>
                                <span className="text-sm font-bold text-slate-900">{getBuildingLabel(room.building)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600">Tầng:</span>
                                <span className="text-sm font-bold text-slate-900">{room.floor}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600">Sức chứa:</span>
                                <span className="text-sm font-bold text-slate-900">{room.capacity} sinh viên</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600">Đang ở:</span>
                                <span className="text-sm font-bold text-slate-900">{room.currentOccupancy} sinh viên</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600">Giá thuê:</span>
                                <span className="text-sm font-bold text-blue-700">{room.rent_price?.toLocaleString()} VNĐ/tháng</span>
                            </div>
                        </div>
                    </div>

                    {/* Equipment */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Package size={18} /> Trang thiết bị
                        </h4>
                        {loadingAssets ? (
                            <div className="flex items-center justify-center py-8 text-slate-400">
                                <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        ) : roomAssets.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {roomAssets.map((asset) => (
                                    <div key={asset.asset_code} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                                        <span className="text-sm font-semibold text-slate-600">{asset.asset_name}:</span>
                                        <span className="text-sm font-bold text-slate-900">
                                            {asset.quantity} {asset.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Chưa có trang thiết bị nào trong phòng
                            </div>
                        )}
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Zap size={18} /> Dịch vụ & Tiện ích
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                    <Wifi size={14} /> Internet:
                                </span>
                                <span className="text-sm font-bold text-slate-900">{room.internet_fee?.toLocaleString()} VNĐ/tháng</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                    <Car size={14} /> Gửi xe:
                                </span>
                                <span className="text-sm font-bold text-slate-900">{room.parking_fee?.toLocaleString()} VNĐ/tháng</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                    <Zap size={14} /> Điện:
                                </span>
                                <span className="text-sm font-bold text-slate-900">{(Number(room.electric_meter_reading) || 0).toFixed(2)} kWh</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                    <Droplet size={14} /> Nước:
                                </span>
                                <span className="text-sm font-bold text-slate-900">{(Number(room.water_meter_reading) || 0).toFixed(2)} m³</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-600">Phí rác:</span>
                                <span className="text-sm font-bold text-slate-900">{room.garbage_fee?.toLocaleString()} VNĐ/tháng</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default RoomDetailModal;
