const RoomAnalytics = ({ rooms }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-12 rounded-3xl shadow-sm border-2 border-slate-200 text-center">
                <h3 className="text-2xl font-bold text-slate-700 mb-4">Thống kê & Mật độ</h3>
                <p className="text-slate-500">Phần thống kê và phân tích mật độ phòng sẽ được triển khai ở đây...</p>
                <p className="text-sm text-slate-400 mt-2">Tổng số phòng: {rooms.length}</p>
            </div>
        </div>
    );
};

export default RoomAnalytics;
