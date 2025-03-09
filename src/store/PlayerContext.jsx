import React, { createContext, useReducer, useContext } from "react";

// Początkowy stan gracza
const initialState = {
  name: "Twój Developer",
  cash: 100000000,
  reputation: 100, // Początkowy poziom reputacji 100 (neutralny)
  reputationHistory: [], // Historia zmian reputacji
  projects: [],
  rtbPower: 0,
  totalPower: 0,
  staff: {
    scouts: [],
    developers: [],
    lawyers: [],
    envSpecialists: [],
    lobbyists: [],
  },
  // System działań niejawnych
  illegals: {
    hasIllegalDatabase: false,
    corruptionNetwork: 0, // Poziom sieci korupcyjnej (0-100)
    intimidationPower: 0, // Poziom zastraszania (0-100)
    forgeryExpertise: 0, // Poziom fałszowania dokumentów (0-100)
    auditRisk: 20, // Początkowe ryzyko audytu (20%)
    lastAuditTurn: 0, // Ostatni audyt (tura)
    totalBribes: 0, // Łączna suma łapówek
    illegalActionHistory: [], // Historia działań niejawnych
  },
  // Metryki ekonomiczne
  economicMetrics: {
    totalInvestment: 0, // Łączne inwestycje
    totalRevenue: 0, // Łączne przychody
    totalExpenses: 0, // Łączne wydatki
    avgROI: 0, // Średni zwrot z inwestycji
    projectsCost: 0, // Koszt wszystkich projektów
    projectsValue: 0, // Wartość wszystkich projektów
  },
  // Audyty i kontrole
  audits: {
    totalAudits: 0, // Liczba przebytych audytów
    passedAudits: 0, // Liczba zaliczonych audytów
    totalFines: 0, // Łączna suma kar
    lastAuditResult: null, // Wynik ostatniego audytu
  },
  loans: [],
};

// Reducer dla akcji gracza
function playerReducer(state, action) {
  switch (action.type) {
    case "UPDATE_CASH":
      return { ...state, cash: state.cash + action.payload };
    case "ADD_PROJECT":
      return {
        ...state,
        projects: [...state.projects, action.payload],
        totalPower: state.totalPower + action.payload.power,
      };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.changes }
            : project
        ),
      };
    case "SELL_PROJECT":
      return {
        ...state,
        cash: state.cash + action.payload.price,
        projects: state.projects.filter(project => project.id !== action.payload.projectId),
        totalPower: state.totalPower - (state.projects.find(p => p.id === action.payload.projectId)?.power || 0),
        rtbPower: state.rtbPower - (
          state.projects.find(p => p.id === action.payload.projectId)?.status === 'ready_to_build' 
            ? (state.projects.find(p => p.id === action.payload.projectId)?.power || 0)
            : 0
        ),
        economicMetrics: {
          ...state.economicMetrics,
          totalRevenue: state.economicMetrics.totalRevenue + action.payload.price,
          projectsValue: state.economicMetrics.projectsValue - (
            state.projects.find(p => p.id === action.payload.projectId)?.marketValue || 0
          ),
        }
      };
    case "UPDATE_RTB_POWER":
      return {
        ...state,
        rtbPower: state.rtbPower + action.payload,
      };
    case "HIRE_STAFF":
      // Upewniamy się, że używamy poprawnej nazwy typu pracownika (dodajemy 's' na końcu jeśli nie ma)
      const staffType = action.payload.staffType.endsWith('s') 
        ? action.payload.staffType 
        : `${action.payload.staffType}s`;
        
      // Upewniamy się, że state.staff[staffType] istnieje
      const currentStaffArray = state.staff[staffType] || [];
      
      return {
        ...state,
        cash: state.cash - action.payload.cost,
        staff: {
          ...state.staff,
          [staffType]: [
            ...currentStaffArray,
            action.payload.staff,
          ],
        },
        economicMetrics: {
          ...state.economicMetrics,
          totalExpenses: state.economicMetrics.totalExpenses + action.payload.cost
        }
      };
    case "FIRE_STAFF":
      // Upewniamy się, że używamy poprawnej nazwy typu pracownika (dodajemy 's' na końcu jeśli nie ma)
      const staffTypeToFire = action.payload.staffType.endsWith('s') 
        ? action.payload.staffType 
        : `${action.payload.staffType}s`;
      
      return {
        ...state,
        cash: state.cash - action.payload.cost,
        staff: {
          ...state.staff,
          [staffTypeToFire]: (state.staff[staffTypeToFire] || []).filter(
            (staff) => staff.id !== action.payload.staffId
          ),
        },
        economicMetrics: {
          ...state.economicMetrics,
          totalExpenses: state.economicMetrics.totalExpenses + action.payload.cost
        }
      };
    case "TRAIN_STAFF":
      // Upewniamy się, że używamy poprawnej nazwy typu pracownika (dodajemy 's' na końcu jeśli nie ma)
      const staffTypeToTrain = action.payload.staffType.endsWith('s') 
        ? action.payload.staffType 
        : `${action.payload.staffType}s`;
        
      return {
        ...state,
        cash: state.cash - action.payload.cost,
        staff: {
          ...state.staff,
          [staffTypeToTrain]: (state.staff[staffTypeToTrain] || []).map(staff => 
            staff.id === action.payload.staffId
              ? { 
                  ...staff, 
                  skill: Math.min(10, staff.skill + action.payload.skillGain),
                  experience: staff.experience + action.payload.experienceGain,
                  training: [...(staff.training || []), {
                    date: new Date().toISOString(),
                    type: action.payload.trainingType,
                    cost: action.payload.cost,
                    skillGain: action.payload.skillGain
                  }]
                }
              : staff
          )
        },
        economicMetrics: {
          ...state.economicMetrics,
          totalExpenses: state.economicMetrics.totalExpenses + action.payload.cost
        }
      };
    case "UPDATE_STAFF":
      const staffTypeToUpdate = action.payload.staffType.endsWith('s')
        ? action.payload.staffType
        : `${action.payload.staffType}s`;
        
      return {
        ...state,
        staff: {
          ...state.staff,
          [staffTypeToUpdate]: (state.staff[staffTypeToUpdate] || []).map(staff =>
            staff.id === action.payload.staffId
              ? { ...staff, ...action.payload.changes }
              : staff
          )
        }
      };
    case "ASSIGN_STAFF_TO_PROJECT":
      // Przypisanie pracownika do projektu
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                assignedStaff: {
                  ...(project.assignedStaff || {}),
                  [action.payload.staffType]: action.payload.staffId
                }
              }
            : project
        ),
        staff: {
          ...state.staff,
          [action.payload.staffType + 's']: (state.staff[action.payload.staffType + 's'] || []).map(staff =>
            staff.id === action.payload.staffId
              ? { 
                  ...staff, 
                  assignedProject: action.payload.projectId,
                  assignedSince: new Date().toISOString()
                }
              : staff
          )
        }
      };
    case "ADD_PROJECT_EVENT":
      // Dodanie zdarzenia do projektu
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                events: [...project.events, action.payload.event] 
              }
            : project
        )
      };
    // Nowe akcje związane z reputacją i działaniami nieoficjalnymi
    case "UPDATE_REPUTATION":
      return {
        ...state,
        reputation: Math.max(0, Math.min(200, state.reputation + action.payload.change)),
        reputationHistory: [
          ...state.reputationHistory, 
          {
            date: new Date().toISOString(),
            change: action.payload.change,
            reason: action.payload.reason,
            turn: action.payload.turn
          }
        ]
      };
    case "USE_ILLEGAL_ACTION":
      return {
        ...state,
        illegals: {
          ...state.illegals,
          corruptionNetwork: action.payload.updateCorruption 
            ? Math.min(100, state.illegals.corruptionNetwork + action.payload.corruptionChange)
            : state.illegals.corruptionNetwork,
          auditRisk: Math.min(100, state.illegals.auditRisk + action.payload.riskIncrease),
          totalBribes: state.illegals.totalBribes + (action.payload.bribeCost || 0),
          illegalActionHistory: [
            ...state.illegals.illegalActionHistory,
            {
              date: new Date().toISOString(),
              type: action.payload.actionType,
              target: action.payload.target,
              cost: action.payload.bribeCost || 0,
              turn: action.payload.turn
            }
          ]
        },
        cash: state.cash - (action.payload.bribeCost || 0),
        economicMetrics: {
          ...state.economicMetrics,
          totalExpenses: state.economicMetrics.totalExpenses + (action.payload.bribeCost || 0)
        }
      };
    case "TRIGGER_AUDIT":
      // Wywołanie audytu
      return {
        ...state,
        illegals: {
          ...state.illegals,
          auditRisk: Math.max(10, state.illegals.auditRisk - action.payload.riskReduction),
          lastAuditTurn: action.payload.turn
        },
        audits: {
          ...state.audits,
          totalAudits: state.audits.totalAudits + 1,
          passedAudits: action.payload.passed ? state.audits.passedAudits + 1 : state.audits.passedAudits,
          totalFines: state.audits.totalFines + (action.payload.fine || 0),
          lastAuditResult: {
            date: new Date().toISOString(),
            turn: action.payload.turn,
            passed: action.payload.passed,
            fine: action.payload.fine || 0,
            reputationLoss: action.payload.reputationLoss || 0
          }
        },
        cash: state.cash - (action.payload.fine || 0),
        economicMetrics: {
          ...state.economicMetrics,
          totalExpenses: state.economicMetrics.totalExpenses + (action.payload.fine || 0)
        }
      };
    case "UPDATE_PROJECT_MARKET_VALUE":
      // Aktualizacja wartości rynkowej projektu
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                marketValue: action.payload.value 
              }
            : project
        ),
        economicMetrics: {
          ...state.economicMetrics,
          projectsValue: state.projects.reduce((total, proj) => {
            const value = proj.id === action.payload.projectId 
              ? action.payload.value 
              : (proj.marketValue || 0);
            return total + value;
          }, 0)
        }
      };
    case "UPDATE_PROJECT_TOTAL_COST":
      // Aktualizacja całkowitego kosztu projektu
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                totalCost: project.totalCost + action.payload.cost 
              }
            : project
        ),
        economicMetrics: {
          ...state.economicMetrics,
          totalInvestment: state.economicMetrics.totalInvestment + action.payload.cost,
          projectsCost: state.economicMetrics.projectsCost + action.payload.cost
        }
      };
    case "INITIALIZE_PROJECT_FORMAL_PARAMS":
      // Inicjalizacja parametrów formalnych projektu (umowy dzierżawy, koszty, etc.)
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project,
                formalParams: action.payload.params
              }
            : project
        )
      };
    case "UPDATE_ILLEGAL_DATABASE":
      return {
        ...state,
        illegals: {
          ...state.illegals,
          hasIllegalDatabase: action.payload.hasIllegalDatabase
        }
      };
    case "UPDATE_ILLEGALS_STATUS":
      return {
        ...state,
        illegals: {
          ...state.illegals,
          ...action.payload
        }
      };
    case "ADD_ILLEGAL_HISTORY":
      return {
        ...state,
        illegals: {
          ...state.illegals,
          illegalActionHistory: [
            ...state.illegals.illegalActionHistory,
            action.payload
          ]
        }
      };
    case "ADD_ILLEGAL_ACTION":
      // Dodanie nielegalnego działania do historii
      return {
        ...state,
        cash: state.cash - action.payload.cost,
        illegals: {
          ...state.illegals,
          auditRisk: Math.min(100, state.illegals.auditRisk + 5), // Zwiększenie ryzyka audytu o 5%
          totalBribes: state.illegals.totalBribes + action.payload.cost,
          illegalActionHistory: [
            ...state.illegals.illegalActionHistory,
            {
              date: new Date().toISOString(),
              type: action.payload.type,
              target: action.payload.target,
              cost: action.payload.cost,
              turn: action.payload.turn,
              exposed: action.payload.exposed
            }
          ]
        },
        economicMetrics: {
          ...state.economicMetrics,
          totalExpenses: state.economicMetrics.totalExpenses + action.payload.cost
        }
      };
    case "ADD_LOAN":
      return {
        ...state,
        loans: [...(state.loans || []), action.payload],
        cash: state.cash + action.payload.amount
      };
    case "UPDATE_LOAN":
      return {
        ...state,
        loans: (state.loans || []).map(loan => 
          loan.id === action.payload.id ? { ...loan, ...action.payload.changes } : loan
        )
      };
    case "REMOVE_LOAN":
      return {
        ...state,
        loans: (state.loans || []).filter(loan => loan.id !== action.payload.id)
      };
    case "SEND_PROJECT_TO_MARKET":
      // Wystawienie projektu na rynek
      const projectToMarket = state.projects.find(p => p.id === action.payload.projectId);
      
      if (!projectToMarket) {
        return state;
      }
      
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                isOnMarket: true,
                marketPrice: action.payload.price,
                marketListingDate: new Date().toISOString(),
                events: [
                  ...project.events,
                  {
                    date: new Date().toISOString(),
                    text: `Projekt został wystawiony na rynek za ${action.payload.price.toLocaleString()} PLN`,
                  }
                ]
              }
            : project
        )
      };
    case "ACCELERATE_PROJECT":
      // Przyspieszenie projektu za dodatkową opłatą
      const projectToAccelerate = state.projects.find(p => p.id === action.payload.projectId);
      
      if (!projectToAccelerate) {
        return state;
      }
      
      return {
        ...state,
        cash: state.cash - action.payload.cost,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { 
                ...project, 
                progress: Math.min(100, (project.progress || 0) + action.payload.progressGain),
                events: [
                  ...project.events,
                  {
                    date: new Date().toISOString(),
                    text: `Przyspieszono projekt o ${action.payload.progressGain}% za ${action.payload.cost.toLocaleString()} PLN`,
                  }
                ]
              }
            : project
        ),
        economicMetrics: {
          ...state.economicMetrics,
          totalExpenses: state.economicMetrics.totalExpenses + action.payload.cost,
          totalInvestment: state.economicMetrics.totalInvestment + action.payload.cost,
          projectsCost: state.economicMetrics.projectsCost + action.payload.cost
        }
      };
    case "UPDATE_ECONOMIC_METRICS":
      return {
        ...state,
        economicMetrics: {
          ...state.economicMetrics,
          ...action.payload
        }
      };
    default:
      return state;
  }
}

// Utworzenie kontekstu
const PlayerContext = createContext();

// Provider komponent
export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Hook do używania kontekstu
export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerContext musi być używany wewnątrz PlayerProvider");
  }
  return context;
};
