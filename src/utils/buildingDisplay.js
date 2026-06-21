export const getBuildingLabel = (building, buildingNames = {}) => {
  if (!building) return "—";
  if (building === "Kho") return "Kho tổng";
  return buildingNames?.[building] || `Tòa ${building}`;
};

export const getRoomLabel = (building, roomNumber, buildingNames = {}) => {
  if (!roomNumber) return "Chưa gán phòng";
  if (!building) return roomNumber;
  return `${getBuildingLabel(building, buildingNames)} - ${roomNumber}`;
};