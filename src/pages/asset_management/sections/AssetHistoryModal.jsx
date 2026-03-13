import { useState } from "react";
import { X, History, ArrowDownToLine, ArrowUpFromLine, Filter, Calendar, Package, User, FileText, ChevronDown, ChevronUp } from "lucide-react";

const AssetHistoryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [filterType, setFilterType] = useState("all"); // all, import, export
  const [filterDate, setFilterDate] = useState("all"); // all, today, week, month
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Mock data - sẽ thay bằng API call
  const mockHistory = [
    {
      id: "1",
      type: "import",
      asset_code: "NT001",
      asset_name: "Giường đơn",
      quantity: 10,
      unit: "Cái",
      date: "2024-03-10",
      supplier: "Công ty TNHH Nội thất ABC",
      invoice_number: "HD001",
      price: 2000000,
      total_price: 20000000,
      created_by: "Admin",
      notes: "Nhập lô hàng mới cho tòa A",
    },
    {
      id: "2",
      type: "export",
      asset_code: "NT001",
      asset_name: "Giường đơn",
      quantity: 5,
      unit: "Cái",
      date: "2024-03-11",
      export_to: "Tòa A - Phòng 101",
      room_number: "A-101",
      recipient_name: "Nguyễn Văn A",
      recipient_phone: "0123456789",
      purpose: "Sử dụng",
      created_by: "Admin",
      notes: "Cấp phát cho phòng mới",
    },
    {
      id: "3",
      type: "import",
      asset_code: "TB002",
      asset_name: "Quạt trần",
      quantity: 20,
      unit: "Cái",
      date: "2024-03-09",
      supplier: "Công ty Điện máy XYZ",
      invoice_number: "HD002",
      price: 500000,
      total_price: 10000000,
      created_by: "Admin",
      notes: "Nhập quạt cho tòa B",
    },
    {
      id: "4",
      type: "export",
      asset_code: "TB002",
      asset_name: "Quạt trần",
      quantity: 3,
      unit: "Cái",
      date: "2024-03-12",
      export_to: "Tòa B - Phòng 205",
      room_number: "B-205",
      recipient_name: "Trần Thị B",
      recipient_phone: "0987654321",
      purpose: "Sử dụng",
      created_by: "Admin",
      notes: "Thay thế quạt hỏng",
    },
  ];

  const filteredHistory = mockHistory.filter((item) => {
    // Filter by type
    if (filterType !== "all" && item.type !== filterType) return false;
    
    // Filter by search query
    if (searchQuery && !item.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) 
        && !item.asset_code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getTypeIcon = (type) => {
    return type === "import" ? ArrowDownToLine : ArrowUpFromLine;
  };

  const getTypeColor = (type) => {
    return type === "import" 
      ? { text: "text-green-700" }
      : { text: "text-orange-700" };
  };

  const getTypeLabel = (type) => {
    return type === "import" ? "Nhập kho" : "Xuất kho";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Lịch sử xuất nhập kho</h2>
              <p className="text-sm text-slate-500">Theo dõi toàn bộ giao dịch xuất nhập tài sản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã hoặc tên tài sản..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="import">Nhập kho</option>
                <option value="export">Xuất kho</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </select>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <History size={48} className="mb-3" />
              <p className="text-lg font-medium">Không có lịch sử</p>
              <p className="text-sm">Chưa có giao dịch xuất nhập kho nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                const colors = getTypeColor(item.type);
                const isExpanded = expandedId === item.id;
                
                return (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-all"
                  >
                    {/* Header - Always visible */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <TypeIcon className={`w-5 h-5 ${colors.text}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-bold ${colors.text}`}>
                              {getTypeLabel(item.type)}
                            </span>
                            <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 truncate">{item.asset_name}</h3>
                          <p className="text-xs text-slate-600">Mã: {item.asset_code}</p>
                        </div>

                        {/* Quantity */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {item.quantity} {item.unit}
                          </div>
                          {item.type === "import" && item.total_price && (
                            <div className="text-xs text-slate-600">
                              {formatCurrency(item.total_price)} đ
                            </div>
                          )}
                        </div>

                        {/* Expand Icon */}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Details - Expandable */}
                    {isExpanded && (
                      <div className="border-t-2 border-slate-200 bg-slate-50 p-4 space-y-4">
                        {/* Transaction Details */}
                        {item.type === "import" ? (
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-green-700 mb-3">Thông tin nhập kho</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-500">Nhà cung cấp</p>
                                <p className="text-sm font-medium text-slate-900">{item.supplier}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Số hóa đơn</p>
                                <p className="text-sm font-medium text-slate-900">{item.invoice_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Đơn giá</p>
                                <p className="text-sm font-medium text-slate-900">{formatCurrency(item.price)} đ</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Thành tiền</p>
                                <p className="text-sm font-medium text-slate-900">{formatCurrency(item.total_price)} đ</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-orange-700 mb-3">Thông tin xuất kho</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-500">Xuất đến</p>
                                <p className="text-sm font-medium text-slate-900">{item.export_to}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Số phòng</p>
                                <p className="text-sm font-medium text-slate-900">{item.room_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Người nhận</p>
                                <p className="text-sm font-medium text-slate-900">{item.recipient_name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Số điện thoại</p>
                                <p className="text-sm font-medium text-slate-900">{item.recipient_phone}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Mục đích</p>
                                <p className="text-sm font-medium text-slate-900">{item.purpose}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Info */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">Thông tin khác</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-slate-500">Người thực hiện</p>
                              <p className="text-sm font-medium text-slate-900">{item.created_by}</p>
                            </div>
                            {item.notes && (
                              <div>
                                <p className="text-xs text-slate-500">Ghi chú</p>
                                <p className="text-sm text-slate-700">{item.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Hiển thị <span className="font-semibold">{filteredHistory.length}</span> giao dịch
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetHistoryModal;
