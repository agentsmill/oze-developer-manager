import React, { useState } from "react";
import { usePlayerContext } from "../../store/PlayerContext";
import { useGameContext } from "../../store/GameContext";
import { useEventsContext } from "../../store/EventContext";
import { translateStage } from "../../utils/translators";

const MarketplaceView = () => {
  const { state: player, dispatch: playerDispatch } = usePlayerContext();
  const { state: gameState, dispatch: gameDispatch, showNotification, calculateEventsEffect } = useGameContext();
  const { dispatch: eventsDispatch } = useEventsContext();
  
  const [filter, setFilter] = useState("all"); // all, pv, wf, rtb
  const [sortBy, setSortBy] = useState("power"); // power, price, stage
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  
  // Filtrujemy projekty według typu i statusu
  const filteredProjects = player.projects.filter(project => {
    if (filter === "all") return true;
    if (filter === "pv") return project.technology === "PV";
    if (filter === "wf") return project.technology === "WF";
    if (filter === "rtb") return project.status === "ready_to_build";
    return true;
  });
  
  // Sortujemy projekty
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "power") {
      return sortOrder === "asc" ? a.power - b.power : b.power - a.power;
    }
    if (sortBy === "price") {
      return sortOrder === "asc" ? a.totalCost - b.totalCost : b.totalCost - a.totalCost;
    }
    if (sortBy === "stage") {
      const stageOrder = ["land_acquisition", "environmental_decision", "zoning_conditions", "grid_connection", "ready_to_build"];
      const aIndex = stageOrder.indexOf(a.status);
      const bIndex = stageOrder.indexOf(b.status);
      return sortOrder === "asc" ? aIndex - bIndex : bIndex - aIndex;
    }
    return 0;
  });
  
  // Funkcja do obliczania ceny sprzedaży projektu na giełdzie
  const calculateMarketPrice = (project) => {
    // Wartość bazowa projektu zależna od mocy w MW
    const baseValue = project.power * 150000; // 150 000 PLN za 1 MW
    
    // Mnożniki w zależności od etapu projektu
    const stagePriceMultipliers = {
      land_acquisition: 0.15, // 15% wartości na etapie pozyskania gruntu
      environmental_decision: 0.35, // 35% wartości po decyzji środowiskowej
      zoning_conditions: 0.55, // 55% wartości po warunkach zabudowy
      grid_connection: 0.85, // 85% wartości po przyłączeniu do sieci
      ready_to_build: 1.0, // 100% wartości dla RTB
    };
    
    // Pobieramy modyfikator cen rynkowych z aktywnych wydarzeń globalnych
    const eventsMarketModifier = calculateEventsEffect('marketModifier');
    
    // Mnożniki w zależności od technologii
    const technologyMultipliers = {
      PV: 1.0 * gameState.marketPriceModifiers.PV * eventsMarketModifier,
      WF: 1.2 * gameState.marketPriceModifiers.WF * eventsMarketModifier,
      BESS: 1.5 * gameState.marketPriceModifiers.BESS * eventsMarketModifier
    };
    
    // Sprawdzamy czy są aktywne wydarzenia wpływające na konkretną technologię
    const technologySpecificModifier = 1.0;
    if (gameState.globalEvents.currentEvents.length > 0) {
      gameState.globalEvents.currentEvents.forEach(event => {
        const effect = event.getEffect();
        if (effect.technologyEffect && 
            effect.technologyEffect.technology === project.technology && 
            effect.technologyEffect.marketModifier) {
          technologySpecificModifier *= effect.technologyEffect.marketModifier;
        }
      });
    }
    
    // Mnożnik etapu
    const stageMultiplier = stagePriceMultipliers[project.status] || 0.1;
    
    // Mnożnik technologii (uwzględniamy też specyficzny modyfikator dla danej technologii)
    const technologyMultiplier = technologyMultipliers[project.technology] * technologySpecificModifier || 1.0;
    
    // Mnożnik mocy (większe projekty są warte proporcjonalnie więcej)
    const powerMultiplier = 1 + (project.power / 100) * 0.2; // Maks. +20% dla projektów 100 MW
    
    // Mnożnik lokalizacji (bazowo neutralny, można rozbudować)
    let locationMultiplier = 1.0;
    
    // Sprawdzamy czy są aktywne wydarzenia wpływające na konkretny region
    if (gameState.globalEvents.currentEvents.length > 0) {
      gameState.globalEvents.currentEvents.forEach(event => {
        const effect = event.getEffect();
        if (effect.regionalEffect && 
            effect.regionalEffect.region === project.regionId && 
            effect.regionalEffect.marketModifier) {
          locationMultiplier *= effect.regionalEffect.marketModifier;
        }
      });
    }
    
    // Mnożnik jakości projektu (wpływ umiejętności developera)
    const developer = player.staff.developers?.find(d => d.id === project.assignedDeveloper);
    const qualityMultiplier = developer ? 1.0 + (developer.skill / 20) : 1.0; // Maks. +50% dla developera z 10 punktami umiejętności
    
    // Dodajemy moduł zdarzeń rynkowych (10% szans) - teraz mniejsza szansa, bo mamy też globalne wydarzenia
    let marketEventInfo = null;
    let marketEventMultiplier = 1.0;
    
    // Zmniejszamy szansę na losowe zdarzenie, jeśli są aktywne wydarzenia globalne
    const randomEventChance = gameState.globalEvents.currentEvents.length > 0 ? 0.05 : 0.1;
    
    if (Math.random() < randomEventChance) {
      // Możliwe zdarzenia rynkowe
      const marketEvents = [
        { name: "Nagły spadek cen energii", impact: 0.85, description: "Ceny energii na rynku spadły o 15%, obniżając wartość projektów OZE." },
        { name: "Zmiana regulacji", impact: 0.80, description: "Niekorzystne zmiany w ustawie o OZE obniżyły wartość projektów." },
        { name: "Lokalne protesty", impact: 0.90, description: "Protesty mieszkańców zniechęcają potencjalnych inwestorów." },
        { name: "Problem geologiczny", impact: 0.70, description: "Wykryto potencjalne problemy geologiczne na terenie projektu." },
        { name: "Korzystna zmiana warunków aukcji", impact: 1.15, description: "Planowane aukcje OZE z korzystnymi warunkami podniosły wartość projektu." },
        { name: "Wzmożone zainteresowanie inwestorów", impact: 1.20, description: "Duzi inwestorzy poszukują projektów w tym regionie." }
      ];
      
      // Losujemy zdarzenie - większe prawdopodobieństwo negatywnych
      const randomIndex = Math.random() < 0.7 ? 
        Math.floor(Math.random() * 4) : // 70% szans na negatywne zdarzenie (indeksy 0-3)
        Math.floor(Math.random() * 2) + 4; // 30% szans na pozytywne zdarzenie (indeksy 4-5)
      
      marketEventInfo = marketEvents[randomIndex];
      marketEventMultiplier = marketEventInfo.impact;
    }
    
    // Obliczamy cenę końcową
    const finalPrice = Math.floor(
      baseValue * 
      stageMultiplier * 
      technologyMultiplier * 
      powerMultiplier * 
      locationMultiplier * 
      qualityMultiplier *
      marketEventMultiplier
    );
    
    // Wyświetlamy informację o zdarzeniu rynkowym, jeśli wystąpiło
    if (marketEventInfo) {
      const severity = marketEventMultiplier < 1.0 ? "warning" : "positive";
      
      // Dodajemy zdarzenie do systemowego logu wydarzeń
      eventsDispatch({
        type: 'ADD_EVENT',
        payload: {
          id: Date.now() + Math.random(),
          type: 'economic_event',
          title: marketEventInfo.name,
          description: marketEventInfo.description,
          severity: severity,
          turn: gameState.turn,
          expires: gameState.turn + 10,
          projectId: project.id,
          effect: {
            type: 'market_price_modifier',
            value: marketEventMultiplier,
            technology: project.technology
          }
        }
      });
      
      // Wyświetlamy powiadomienie
      showNotification(
        `${marketEventInfo.name}: ${marketEventInfo.description} Wpływ na cenę: ${(marketEventInfo.impact * 100).toFixed(0)}%`,
        severity
      );
    }
    
    return finalPrice;
  };
  
  // Funkcja do sprzedaży projektu
  const sellProject = (projectId) => {
    const project = player.projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Sprawdzamy, czy projekt jest na odpowiednim etapie do sprzedaży
    const stageOrder = ["land_acquisition", "environmental_decision", "zoning_conditions", "grid_connection", "ready_to_build"];
    const minSellStageIndex = stageOrder.indexOf("environmental_decision");
    const projectStageIndex = stageOrder.indexOf(project.status);
    
    if (projectStageIndex < minSellStageIndex) {
      showNotification(
        `Nie można sprzedać projektu na etapie "${translateStage(project.status)}". Projekt musi osiągnąć co najmniej etap decyzji środowiskowej.`,
        "error"
      );
      return;
    }
    
    const price = calculateMarketPrice(project);
    
    // Dodajemy transakcję do historii rynku
    gameDispatch({
      type: "ADD_MARKET_TRANSACTION",
      payload: {
        id: Date.now(),
        projectId: project.id,
        projectName: project.name,
        technology: project.technology,
        power: project.power,
        status: project.status,
        price: price,
        turn: gameState.turn,
        seller: "player",
        date: new Date().toISOString()
      }
    });
    
    // Sprzedajemy projekt
    playerDispatch({
      type: "SELL_PROJECT",
      payload: {
        projectId: project.id,
        price: price
      }
    });
    
    // Jeśli projekt był w powiecie, aktualizujemy dane powiatu
    if (project.county) {
      // Tu można dodać akcję do zaktualizowania danych powiatu
    }
    
    showNotification(`Sprzedano projekt "${project.name}" za ${price.toLocaleString()} PLN na giełdzie`, 'success');
  };
  
  // Funkcja pomocnicza do wyświetlania statusu projektu
  const getStatusBadge = (status) => {
    switch (status) {
      case "land_acquisition":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Pozyskiwanie gruntów</span>;
      case "environmental_decision":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Decyzja środowiskowa</span>;
      case "zoning_conditions":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Warunki zabudowy</span>;
      case "grid_connection":
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Przyłączenie</span>;
      case "ready_to_build":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">RTB</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Sprzedaż projektów na giełdzie</h2>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Filtruj</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">Wszystkie projekty</option>
              <option value="pv">Tylko PV</option>
              <option value="wf">Tylko wiatrowe</option>
              <option value="rtb">Tylko RTB</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sortuj według</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="power">Mocy [MW]</option>
              <option value="price">Ceny</option>
              <option value="stage">Etapu</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Kolejność</label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="asc">Rosnąco</option>
              <option value="desc">Malejąco</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Informacje rynkowe */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="text-lg font-bold mb-3">Aktualna wycena projektów</h3>
        <p className="text-sm text-gray-600 mb-3">
          Wartość projektów zależy od etapu rozwoju, technologii, lokalizacji i jakości pracy developera.
          Rynek może ulegać wahaniom w zależności od zdarzeń ekonomicznych.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="border rounded p-3">
            <div className="text-sm text-gray-500">Etap RTB</div>
            <div className="font-bold">x10 wyższa wycena</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-500">Technologia</div>
            <div className="font-bold">PV: x1.0 | WF: x1.2 | BESS: x1.5</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-500">Umiejętności developera</div>
            <div className="font-bold">do +50% dla eksperta</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-500">Wielkość projektu</div>
            <div className="font-bold">+20% dla 100MW</div>
          </div>
        </div>
      </div>
      
      {/* Lista projektów */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Projekt</th>
              <th className="text-center p-3">Technologia</th>
              <th className="text-center p-3">Moc</th>
              <th className="text-center p-3">Status</th>
              <th className="text-right p-3">Cena sprzedaży</th>
              <th className="text-right p-3">Zysk</th>
              <th className="text-center p-3">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedProjects.length > 0 ? (
              sortedProjects.map(project => {
                const marketPrice = calculateMarketPrice(project);
                const profit = marketPrice - project.totalCost;
                const profitPercentage = ((profit / project.totalCost) * 100).toFixed(1);
                
                // Sprawdzamy, czy projekt jest na odpowiednim etapie do sprzedaży
                const stageOrder = ["land_acquisition", "environmental_decision", "zoning_conditions", "grid_connection", "ready_to_build"];
                const minSellStageIndex = stageOrder.indexOf("environmental_decision");
                const projectStageIndex = stageOrder.indexOf(project.status);
                const canSell = projectStageIndex >= minSellStageIndex;
                
                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-gray-500">
                        {project.county ? `Powiat ${project.county.name}` : "Brak lokalizacji"}
                      </div>
                    </td>
                    <td className="text-center p-3">{project.technology}</td>
                    <td className="text-center p-3">{project.power} MW</td>
                    <td className="text-center p-3">{getStatusBadge(project.status)}</td>
                    <td className="text-right p-3 font-medium">{marketPrice.toLocaleString()} PLN</td>
                    <td className="text-right p-3">
                      <div className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                        {profit.toLocaleString()} PLN
                      </div>
                      <div className="text-xs text-gray-500">
                        {profitPercentage}%
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <button
                        onClick={() => sellProject(project.id)}
                        className={`px-3 py-1 ${canSell ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white rounded text-sm`}
                        disabled={!canSell}
                        title={!canSell ? "Projekt musi osiągnąć etap decyzji środowiskowej" : ""}
                      >
                        Sprzedaj
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Brak projektów spełniających kryteria filtrowania
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Historia transakcji */}
      <div className="bg-white rounded shadow overflow-hidden mt-6">
        <div className="p-4 border-b">
          <h3 className="text-lg font-bold">Historia sprzedaży</h3>
        </div>
        
        {gameState.marketHistory.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Projekt</th>
                <th className="text-center p-3">Technologia</th>
                <th className="text-center p-3">Moc</th>
                <th className="text-center p-3">Status</th>
                <th className="text-right p-3">Cena</th>
                <th className="text-center p-3">Tura</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gameState.marketHistory.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="p-3">{transaction.projectName}</td>
                  <td className="text-center p-3">{transaction.technology}</td>
                  <td className="text-center p-3">{transaction.power} MW</td>
                  <td className="text-center p-3">{getStatusBadge(transaction.status)}</td>
                  <td className="text-right p-3 font-medium">{transaction.price.toLocaleString()} PLN</td>
                  <td className="text-center p-3">{transaction.turn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-center text-gray-500">
            Brak historii transakcji
          </p>
        )}
      </div>
    </div>
  );
};

export default MarketplaceView; 