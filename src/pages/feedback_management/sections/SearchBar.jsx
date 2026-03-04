import React from "react";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="relative w-64">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="text" placeholder="Tìm theo nội dung..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  );
};

export default SearchBar;
