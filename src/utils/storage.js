export const saveGameState = (state) => {
  try {
    localStorage.setItem("ozeGameState", JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Nie udało się zapisać stanu gry:", error);
    return false;
  }
};

export const loadGameState = () => {
  try {
    const savedState = localStorage.getItem("ozeGameState");
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error("Nie udało się wczytać stanu gry:", error);
    return null;
  }
};
