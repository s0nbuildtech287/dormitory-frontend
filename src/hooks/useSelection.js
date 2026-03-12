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
    // If all are selected on current page (or all items if passed entirely), clear them. Otherwise, select them all.
    // Assuming currentItemsIds is an array of IDs for the items we want to select all of
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
