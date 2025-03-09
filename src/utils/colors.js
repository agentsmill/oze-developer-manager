// Funkcja zwracająca kolor dla wartości (0-100)
export const getColorByValue = (value) => {
  if (value >= 75) return "#22c55e"; // green-500
  else if (value >= 50) return "#3b82f6"; // blue-500
  else if (value >= 25) return "#f59e0b"; // amber-500
  else return "#ef4444"; // red-500
};

// Funkcja zwracająca klasę koloru dla statusu projektu
export const getStatusColorClass = (status) => {
  switch (status) {
    case "land_acquisition":
      return "bg-blue-500";
    case "environmental_decision":
      return "bg-yellow-500";
    case "zoning_conditions":
      return "bg-orange-500";
    case "grid_connection":
      return "bg-purple-500";
    case "construction":
      return "bg-red-500";
    case "ready_to_build":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

// Funkcja zwracająca klasę koloru dla technologii
export const getTechnologyColorClass = (technology) => {
  switch (technology) {
    case "PV":
      return "text-yellow-500";
    case "WF":
      return "text-blue-500";
    case "BESS":
      return "text-purple-500";
    default:
      return "text-gray-500";
  }
};
