import React, { useState } from "react";
import { usePlayerContext } from "../../store/PlayerContext";
import { useGameContext } from "../../store/GameContext";
import { translateStaffType, translateStaffLevel } from "../../utils/translators";
import useStaffManagement from "../../hooks/useStaffManagement";
import StaffManagement from "./StaffManagement";
import CompanyFinances from "./CompanyFinances";
import CompanyOverview from "./CompanyOverview";
import ProjectsSummaryPanel from "./ProjectsSummaryPanel";
import SidePanel from "../ui/SidePanel";
import IllegalActionsPanel from "./IllegalActionsPanel";
import StaffDetailsPanel from "./StaffDetailsPanel";
import FinancePanel from "./FinancePanel";

const CompanyView = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { state: playerState, dispatch } = usePlayerContext();
  const { state: gameState, showNotification } = useGameContext();
  const { hireStaff, fireStaff, trainStaff } = useStaffManagement();
  
  // Stan dla panelu bocznego
  const [sidePanel, setSidePanel] = useState({
    isOpen: false,
    type: null,
    data: null
  });
  
  // Funkcja do otwierania panelu bocznego
  const openSidePanel = (type, data = null) => {
    setSidePanel({
      isOpen: true,
      type,
      data
    });
  };
  
  // Funkcja do zamykania panelu bocznego
  const closeSidePanel = () => {
    setSidePanel({
      ...sidePanel,
      isOpen: false
    });
  };
  
  // Funkcja do sprzedaży projektu
  const sellProject = (projectId) => {
    const project = playerState.projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Obliczanie ceny sprzedaży w zależności od postępu i etapu projektu
    let price = project.totalCost;
    
    if (project.status === 'land_acquisition') {
      price = Math.round(project.totalCost * 1.05); // 5% zysku
    } else if (project.status === 'environmental_decision') {
      price = Math.round(project.totalCost * 1.15); // 15% zysku
    } else if (project.status === 'zoning_conditions') {
      price = Math.round(project.totalCost * 1.3); // 30% zysku
    } else if (project.status === 'grid_connection') {
      price = Math.round(project.totalCost * 1.5); // 50% zysku
    } else if (project.status === 'ready_to_build') {
      price = Math.round(project.totalCost * 2); // 100% zysku
    } else if (project.status === 'constructed') {
      price = Math.round(project.totalCost * 1.2); // 20% zysku po zbudowaniu (generuje już przychody)
    }
    
    dispatch({
      type: "SELL_PROJECT",
      payload: {
        projectId: project.id,
        price: price
      }
    });
    
    showNotification(`Sprzedano projekt "${project.name}" za ${price.toLocaleString()} PLN`, 'success');
  };

  // Renderuje odpowiedni panel boczny
  const renderSidePanel = () => {
    switch(sidePanel.type) {
      case 'illegal_actions':
        return (
          <SidePanel 
            title="Szara strefa" 
            isOpen={sidePanel.isOpen} 
            onClose={closeSidePanel}
            variant="illegal"
          >
            <IllegalActionsPanel onClose={closeSidePanel} />
          </SidePanel>
        );
        
      case 'staff_details':
        return (
          <SidePanel 
            title="Szczegóły pracownika" 
            isOpen={sidePanel.isOpen} 
            onClose={closeSidePanel}
            variant="staff"
          >
            <StaffDetailsPanel 
              staffId={sidePanel.data?.id}
              staffType={sidePanel.data?.type}
              onClose={closeSidePanel}
              onFire={(id, type) => {
                fireStaff(type, id);
                closeSidePanel();
              }}
              onTrain={(id, type) => {
                // Tutaj możemy dodać logikę trenowania lub po prostu zamknąć panel
                closeSidePanel();
              }}
              onAssign={(id, type) => {
                // Tutaj możemy dodać logikę przydzielania lub po prostu zamknąć panel
                closeSidePanel();
              }}
            />
          </SidePanel>
        );
        
      case 'finance':
        return (
          <SidePanel 
            title="Panel finansowy" 
            isOpen={sidePanel.isOpen} 
            onClose={closeSidePanel}
            variant="finance"
          >
            <FinancePanel onClose={closeSidePanel} />
          </SidePanel>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Zarządzanie firmą</h1>
      
      {/* Przyciski nawigacyjne */}
      <div className="flex mb-6 space-x-2 border-b pb-3">
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "overview"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Przegląd firmy
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "projects"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("projects")}
        >
          Projekty
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "staff"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("staff")}
        >
          Zarządzanie personelem
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "finances"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("finances")}
        >
          Finanse
        </button>
        
        {/* Przycisk do szarej strefy - zawsze widoczny */}
        <button
          className={`ml-auto px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700`}
          onClick={() => openSidePanel('illegal_actions')}
        >
          Szara strefa
        </button>
      </div>
      
      {/* Zawartość zależna od wybranej zakładki */}
      <div>
        {activeTab === "overview" && <CompanyOverview />}
        {activeTab === "projects" && <ProjectsSummaryPanel />}
        {activeTab === "staff" && (
          <StaffManagement 
            openStaffDetails={(staffId, staffType) => 
              openSidePanel('staff_details', { id: staffId, type: staffType })
            }
          />
        )}
        {activeTab === "finances" && (
          <CompanyFinances 
            openFinancePanel={() => openSidePanel('finance')}
          />
        )}
      </div>
      
      {/* Renderujemy panel boczny */}
      {renderSidePanel()}
    </div>
  );
};

export default CompanyView; 