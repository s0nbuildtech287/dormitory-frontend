export const getBuildingLabel = (building, buildingNames = {}) => {
  if (!building) return "—";
  if (building === "Kho") return "Kho tổng";
  return buildingNames?.[building] || `Tòa ${building}`;
};

export const getRoomLabel = (building, roomNumber, buildingNames = {}) => {
  if (!roomNumber) return "Chưa gán phòng";
  
  let displayRoom = roomNumber;
  if (typeof roomNumber === "string" && roomNumber.startsWith("room-")) {
    const parts = roomNumber.split("-");
    if (parts.length >= 2) {
      displayRoom = `Phòng ${parts[1]}`;
    }
  }

  if (!building) return displayRoom;
  return `${getBuildingLabel(building, buildingNames)} - ${displayRoom}`;
};