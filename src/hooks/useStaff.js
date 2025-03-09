import { useCallback } from "react";
import { usePlayerContext } from "../store/PlayerContext";
import { useGameContext } from "../store/GameContext";

export const useStaff = () => {
  const { state: player, dispatch: playerDispatch } = usePlayerContext();
  const { dispatch: gameDispatch } = useGameContext();

  // Generowanie imienia pracownika
  const generateStaffName = useCallback(() => {
    const firstNames = [
      "Adam",
      "Anna",
      "Piotr",
      "Katarzyna",
      "Michał",
      "Magdalena",
      "Jan",
      "Aleksandra",
      "Tomasz",
      "Małgorzata",
    ];
    const lastNames = [
      "Nowak",
      "Kowalski",
      "Wiśniewski",
      "Wójcik",
      "Kowalczyk",
      "Kamiński",
      "Lewandowski",
      "Zieliński",
      "Woźniak",
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }, []);

  // Zatrudnienie pracownika
  const hireStaff = useCallback(
    (staffType, level = "junior") => {
      // Parametry poziomów umiejętności
      const skillLevels = {
        junior: { minSkill: 1, maxSkill: 3, salaryMultiplier: 1 },
        mid: { minSkill: 4, maxSkill: 7, salaryMultiplier: 1.5 },
        senior: { minSkill: 8, maxSkill: 10, salaryMultiplier: 2.2 },
      };

      // Bazowe wynagrodzenia
      const baseSalaries = {
        scout: 2500,
        developer: 3000,
        lawyer: 0,
        envSpecialist: 0,
        lobbyist: 5000,
      };

      // Koszty jednorazowe
      const specialistCosts = {
        lawyer: 30000000,
        envSpecialist: 25000000,
      };

      // Obliczanie wynagrodzenia
      const levelData = skillLevels[level];
      const baseSalary = baseSalaries[staffType];
      const monthlySalary = Math.floor(baseSalary * levelData.salaryMultiplier);

      // Koszt zatrudnienia
      const hireCost =
        staffType === "lawyer" || staffType === "envSpecialist"
          ? specialistCosts[staffType]
          : monthlySalary * 2;

      // Sprawdzenie środków
      if (player.cash < hireCost) {
        gameDispatch({
          type: "SET_NOTIFICATION",
          payload: {
            text: `Nie masz wystarczających środków! Potrzebujesz ${hireCost.toLocaleString()} PLN.`,
            type: "error",
          },
        });
        return;
      }

      // Tworzenie nowego pracownika
      const newStaffId = Date.now();
      const skill = Math.floor(
        levelData.minSkill +
          Math.random() * (levelData.maxSkill - levelData.minSkill + 1)
      );

      const newStaff = {
        id: newStaffId,
        type: staffType,
        name: generateStaffName(),
        skill: skill,
        experience: 0,
        level: level,
        salary: monthlySalary,
        motivation: 100, // 0-100
        loyalty: 70 + Math.floor(Math.random() * 30), // 70-100
        hiredOn: 0, // aktualna tura
      };

      // Dispatch akcji zatrudnienia
      playerDispatch({
        type: "HIRE_STAFF",
        payload: {
          staffType,
          staff: newStaff,
          cost: hireCost,
        },
      });

      // Powiadomienie
      gameDispatch({
        type: "SET_NOTIFICATION",
        payload: {
          text: `Zatrudniono ${translateStaffLevel(level)} ${translateStaffType(
            staffType,
            true
          )}: ${newStaff.name}`,
          type: "success",
        },
      });
    },
    [player, playerDispatch, gameDispatch, generateStaffName]
  );

  // Przypisanie pracownika do projektu
  const assignStaffToProject = useCallback(
    (staffId, projectId, staffType) => {
      const project = player.projects.find((p) => p.id === projectId);
      if (!project) return false;

      playerDispatch({
        type: "UPDATE_PROJECT",
        payload: {
          id: projectId,
          changes: {
            [`assigned${
              staffType.charAt(0).toUpperCase() + staffType.slice(1)
            }`]: staffId,
          },
        },
      });

      return true;
    },
    [player, playerDispatch]
  );

  // Funkcje pomocnicze tłumaczące
  const translateStaffType = (type, accusative = false) => {
    if (accusative) {
      switch (type) {
        case "scout":
          return "skauta";
        case "developer":
          return "developera";
        case "lawyer":
          return "prawnika";
        case "envSpecialist":
          return "specjalistę ds. środowiska";
        case "lobbyist":
          return "lobbystę";
        default:
          return type;
      }
    } else {
      switch (type) {
        case "scout":
          return "skaut";
        case "developer":
          return "developer";
        case "lawyer":
          return "prawnik";
        case "envSpecialist":
          return "specjalista ds. środowiska";
        case "lobbyist":
          return "lobbysta";
        default:
          return type;
      }
    }
  };

  const translateStaffLevel = (level) => {
    switch (level) {
      case "junior":
        return "początkującego";
      case "mid":
        return "doświadczonego";
      case "senior":
        return "eksperta";
      default:
        return level;
    }
  };

  return {
    staff: player.staff,
    hireStaff,
    assignStaffToProject,
    translateStaffType,
    translateStaffLevel,
  };
};
