import { useState } from 'react';

export const usePagination = (data, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Các phép toán tính toán phân trang
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Đảm bảo trang hiện tại nằm trong giới hạn khi dữ liệu thay đổi
  if (currentPage > totalPages) {
    setCurrentPage(Math.max(1, totalPages));
  }

  // Lấy danh sách các dòng cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Các hàm điều hướng phân trang
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return {
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  };
};
