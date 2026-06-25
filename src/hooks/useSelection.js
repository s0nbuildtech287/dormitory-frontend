import { useState, useCallback } from 'react';

export const useSelection = (currentItemsIds) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showCheckboxColumn, setShowCheckboxColumn] = useState(false);

  const toggleSelectionMode = useCallback(() => {
    setShowCheckboxColumn(prev => {
      const next = !prev;
      if (next) {
        setSelectedItems(new Set());
      }
      return next;
    });
  }, []);

  const handleSelectItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    // Nếu tất cả các phần tử đã được chọn, thực hiện bỏ chọn toàn bộ. Ngược lại, chọn tất cả.
    // Giả định currentItemsIds là một mảng chứa ID của các bản ghi hiện tại
    if (selectedItems.size === currentItemsIds.length && currentItemsIds.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentItemsIds));
    }
  }, [currentItemsIds, selectedItems.size]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    selectedItems,
    showCheckboxColumn,
    toggleSelectionMode,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
  };
};
