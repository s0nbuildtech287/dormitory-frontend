import { ShieldAlert } from "lucide-react";

const DisciplineWarning = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <div className="p-5 bg-amber-100 rounded-3xl">
        <ShieldAlert size={48} className="text-amber-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800">Cảnh báo kỷ luật</h3>
      <p className="text-slate-500 text-sm max-w-sm">
        Tính năng này đang được phát triển. Vui lòng quay lại sau.
      </p>
    </div>
  );
};

export default DisciplineWarning;
