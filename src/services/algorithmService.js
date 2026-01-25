/**
 * Greedy algorithm to allocate rooms to students.
 * Sorts students by priority (Points -> Year -> Distance).
 * Finds the first available room with matching gender.
 */
export const smartAllocate = (registrations, rooms) => {
  // Sort registrations by priority
  const sortedRegs = [...registrations].sort((a, b) => {
    if (b.priorityPoints !== a.priorityPoints) return b.priorityPoints - a.priorityPoints;
    if (b.year !== a.year) return b.year - a.year; // Higher years might get priority or vice versa? Typically seniors first or freshmen first. Let's assume seniors.
    return b.distance - a.distance;
  });

  const updatedRooms = [...rooms].map((r) => ({ ...r }));
  const results = [];

  for (const reg of sortedRegs) {
    // Find a room with space and correct gender
    const suitableRoom = updatedRooms.find((r) => r.genderType === reg.gender && r.currentOccupancy < r.capacity);

    if (suitableRoom) {
      suitableRoom.currentOccupancy += 1;
      results.push({
        registrationId: reg.id,
        roomId: suitableRoom.id,
      });
    }
  }

  return { results, updatedRooms };
};
