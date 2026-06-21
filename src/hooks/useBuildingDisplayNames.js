import { useEffect, useState } from "react";
import { getBuildingDisplayNames } from "../api/apiRoom.js";
import { getBuildingLabel as formatBuildingLabel, getRoomLabel as formatRoomLabel } from "../utils/buildingDisplay.js";

const useBuildingDisplayNames = () => {
  const [buildingNames, setBuildingNames] = useState({});

  useEffect(() => {
    const loadBuildingNames = async () => {
      try {
        const response = await getBuildingDisplayNames();
        if (response?.success && response.data && typeof response.data === "object") {
          setBuildingNames(response.data);
        }
      } catch (error) {
        console.error("Error loading building display names:", error);
      }
    };

    loadBuildingNames();
  }, []);

  return {
    buildingNames,
    getBuildingLabel: (building) => formatBuildingLabel(building, buildingNames),
    getRoomLabel: (building, roomNumber) => formatRoomLabel(building, roomNumber, buildingNames),
  };
};

export default useBuildingDisplayNames;