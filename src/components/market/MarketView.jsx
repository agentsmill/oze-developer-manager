import React, { useState, useEffect } from "react";
import { usePlayerContext } from "../../store/PlayerContext";
import { useGameContext } from "../../store/GameContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Sun, Wind, Battery } from "lucide-react";
import { technologies } from "../../data/technologies";
import MarketplaceView from "./MarketplaceView";

const MarketView = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [selectedTechnology, setSelectedTechnology] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const { state: player, dispatch } = usePlayerContext();
  const { state: gameState } = useGameContext();

  // Przykładowe projekty na giełdzie (w prawdziwej implementacji pobierane z kontekstu)
  const [marketProjects, setMarketProjects] = useState([
    {
      id: 1,
      name: "PV-MAZ1234",
      technology: "PV",
      status: "greenfield",
      region: "mazowieckie",
      power: 15,
      price: 225000,
      seller: "Inny deweloper",
      listedOn: new Date(2025, 2, 1),
    },
    {
      id: 2,
      name: "WF-ZAP4321",
      technology: "WF",
      status: "rtb",
      region: "zachodniopomorskie",
      power: 30,
      price: 13920000, // 464000 PLN/MW * 30 MW
      seller: "Fundusz inwestycyjny",
      listedOn: new Date(2025, 2, 5),
    },
    {
      id: 3,
      name: "BESS-MAL5678",
      technology: "BESS",
      status: "development",
      region: "małopolskie",
      power: 10,
      price: 4000000, // 400000 EUR/MW * 10 MW
      seller: "Prywatny inwestor",
      listedOn: new Date(2025, 2, 8),
    },
  ]);

  // Filtrowanie projektów
  const filteredProjects = marketProjects.filter(
    (project) =>
      (selectedTechnology === "all" ||
        project.technology === selectedTechnology) &&
      (selectedStage === "all" || project.status === selectedStage)
  );

  // Generuje losowy projekt do dodania na giełdę
  const generateRandomProject = () => {
    const techKeys = Object.keys(technologies);
    const randomTech = techKeys[Math.floor(Math.random() * techKeys.length)];
    const tech = technologies[randomTech];

    const stages = ["greenfield", "development", "rtb", "cod"];
    const randomStage = stages[Math.floor(Math.random() * stages.length)];

    const regions = [
      "mazowieckie",
      "małopolskie",
      "wielkopolskie",
      "zachodniopomorskie",
      "podlaskie",
    ];
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];

    const power = Math.floor(5 + Math.random() * 45); // 5-50 MW

    // Cena bazowa z mnożnikiem losowym (±15%)
    const priceRange = tech.marketPrices[randomStage];
    const basePrice =
      priceRange.min + Math.random() * (priceRange.max - priceRange.min);
    const priceMultiplier = 0.85 + Math.random() * 0.3;
    const price = Math.floor(basePrice * power * priceMultiplier);

    const sellers = [
      "Inny deweloper",
      "Fundusz inwestycyjny",
      "Prywatny inwestor",
    ];
    const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];

    return {
      id: Date.now(),
      name: `${tech.shortName}-${randomRegion
        .substring(0, 3)
        .toUpperCase()}${Math.floor(Math.random() * 10000)}`,
      technology: randomTech,
      status: randomStage,
      region: randomRegion,
      power: power,
      price: price,
      seller: randomSeller,
      listedOn: new Date(),
    };
  };

  // Odświeża giełdę dodając nowe projekty
  const refreshMarket = () => {
    const newProjects = [];
    const numNewProjects = Math.floor(1 + Math.random() * 4); // 1-4 nowych projektów

    for (let i = 0; i < numNewProjects; i++) {
      newProjects.push(generateRandomProject());
    }

    setMarketProjects([...marketProjects, ...newProjects]);
  };

  // Funkcja generująca nowe oferty na giełdzie
  const generateNewMarketOffers = () => {
    // Generujemy 1-3 nowe projekty
    const newProjectCount = 1 + Math.floor(Math.random() * 3);
    const newProjects = [];
    
    for (let i = 0; i < newProjectCount; i++) {
      newProjects.push(generateRandomProject());
    }
    
    // Dodajemy nowe projekty do istniejącej listy
    setMarketProjects(prev => [...prev, ...newProjects]);
  };

  // Zakup projektu
  const buyProject = (projectId) => {
    const project = marketProjects.find((p) => p.id === projectId);
    if (!project || player.cash < project.price) return;

    // Dodaj projekt do gracza
    dispatch({
      type: "ADD_PROJECT",
      payload: {
        ...project,
        status:
          project.status === "greenfield"
            ? "land_acquisition"
            : project.status === "development"
            ? "environmental_decision"
            : project.status === "rtb"
            ? "ready_to_build"
            : "constructed",
        etapPaid: {
          land_acquisition: true,
          environmental_decision: project.status !== "greenfield",
          zoning_conditions:
            project.status === "rtb" || project.status === "cod",
          grid_connection: project.status === "rtb" || project.status === "cod",
          construction: project.status === "cod",
        },
        progress: 100,
        totalCost: project.price,
        assignedScout: null,
        assignedDeveloper: null,
        events: [
          {
            turn: 0, // aktualną turę pobieramy z kontekstu gry
            text: `Projekt zakupiony na giełdzie za ${project.price.toLocaleString()} PLN`,
          },
        ],
      },
    });

    // Odejmij koszt
    dispatch({
      type: "UPDATE_CASH",
      payload: -project.price,
    });

    // Usuń projekt z giełdy
    setMarketProjects(marketProjects.filter((p) => p.id !== projectId));
  };

  // Efekt do odświeżania listy projektów na giełdzie
  useEffect(() => {
    refreshMarket();
    
    // Odświeżamy listę co 5 tur
    if (gameState.turn % 5 === 0) {
      generateNewMarketOffers();
    }
  }, [gameState.turn]); // eslint-disable-line react-hooks/exhaustive-deps

  const getTechnologyIcon = (tech) => {
    switch (tech) {
      case "PV":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "WF":
        return <Wind className="h-5 w-5 text-blue-500" />;
      case "BESS":
        return <Battery className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "greenfield":
        return "Greenfield";
      case "development":
        return "W rozwoju";
      case "rtb":
        return "Ready-to-Build";
      case "cod":
        return "Commercial Operation";
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-1">
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Giełda Projektów OZE</h2>

        {/* Zakładki */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("available")}
            className={`py-2 px-4 font-medium ${
              activeTab === "available"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Dostępne Projekty
          </button>
          <button
            onClick={() => setActiveTab("my_listings")}
            className={`py-2 px-4 font-medium ${
              activeTab === "my_listings"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Moje Ogłoszenia
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-4 font-medium ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Historia Transakcji
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`py-2 px-4 font-medium ${
              activeTab === "sell"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sprzedaż
          </button>
        </div>

        {activeTab === "available" && (
          <>
            {/* Filtry technologii */}
            <div className="flex mb-4">
              <button
                onClick={() => setSelectedTechnology("all")}
                className={`px-3 py-1 rounded ${
                  selectedTechnology === "all"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200"
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setSelectedTechnology("PV")}
                className={`px-3 py-1 rounded ml-2 flex items-center ${
                  selectedTechnology === "PV"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <Sun className="h-4 w-4 mr-1" /> Fotowoltaika
              </button>
              <button
                onClick={() => setSelectedTechnology("WF")}
                className={`px-3 py-1 rounded ml-2 flex items-center ${
                  selectedTechnology === "WF"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <Wind className="h-4 w-4 mr-1" /> Farmy Wiatrowe
              </button>
              <button
                onClick={() => setSelectedTechnology("BESS")}
                className={`px-3 py-1 rounded ml-2 flex items-center ${
                  selectedTechnology === "BESS"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <Battery className="h-4 w-4 mr-1" /> Magazyny Energii
              </button>
            </div>

            {/* Filtry etapów */}
            <div className="flex mb-4">
              <button
                onClick={() => setSelectedStage("all")}
                className={`px-3 py-1 rounded ${
                  selectedStage === "all"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200"
                }`}
              >
                Wszystkie etapy
              </button>
              <button
                onClick={() => setSelectedStage("greenfield")}
                className={`px-3 py-1 rounded ml-2 ${
                  selectedStage === "greenfield"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Greenfield
              </button>
              <button
                onClick={() => setSelectedStage("development")}
                className={`px-3 py-1 rounded ml-2 ${
                  selectedStage === "development"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Development
              </button>
              <button
                onClick={() => setSelectedStage("rtb")}
                className={`px-3 py-1 rounded ml-2 ${
                  selectedStage === "rtb"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Ready-to-Build
              </button>
              <button
                onClick={() => setSelectedStage("cod")}
                className={`px-3 py-1 rounded ml-2 ${
                  selectedStage === "cod"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Commercial Operation
              </button>
            </div>

            {/* Lista projektów */}
            <Card
              title="Dostępne projekty"
              headerAction={
                <Button onClick={refreshMarket} variant="info" size="small">
                  Odśwież giełdę
                </Button>
              }
            >
              {filteredProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2">Projekt</th>
                        <th className="text-center p-2">Technologia</th>
                        <th className="text-center p-2">Etap</th>
                        <th className="text-center p-2">Region</th>
                        <th className="text-center p-2">Moc</th>
                        <th className="text-center p-2">Cena</th>
                        <th className="text-center p-2">Sprzedający</th>
                        <th className="text-center p-2">Akcja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="p-2">{project.name}</td>
                          <td className="text-center p-2">
                            <div className="flex justify-center items-center">
                              {getTechnologyIcon(project.technology)}
                              <span className="ml-1">{project.technology}</span>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            {getStatusLabel(project.status)}
                          </td>
                          <td className="text-center p-2">{project.region}</td>
                          <td className="text-center p-2">
                            {project.power} MW
                          </td>
                          <td className="text-center p-2">
                            {project.price.toLocaleString()} PLN
                          </td>
                          <td className="text-center p-2">{project.seller}</td>
                          <td className="text-center p-2">
                            <Button
                              variant="success"
                              size="small"
                              onClick={() => buyProject(project.id)}
                              disabled={player.cash < project.price}
                            >
                              Kup
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">
                  Brak dostępnych projektów spełniających kryteria
                </p>
              )}
            </Card>
          </>
        )}

        {activeTab === "my_listings" && (
          <Card title="Moje ogłoszenia">
            <p className="text-gray-500">
              Nie masz aktualnie wystawionych projektów na sprzedaż.
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => alert("Tu będzie formularz wystawiania projektu")}
            >
              Wystaw projekt na sprzedaż
            </Button>
          </Card>
        )}

        {activeTab === "history" && (
          <Card title="Historia transakcji">
            <p className="text-gray-500">Brak historii transakcji.</p>
          </Card>
        )}

        {activeTab === "sell" && (
          <MarketplaceView />
        )}
      </div>

      {/* Panel boczny */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <Card title="Analiza rynku">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Aktualne trendy cenowe</h4>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">PV (Greenfield):</span> 15
                  000–25 000 zł/MWp
                </div>
                <div>
                  <span className="font-medium">PV (RTB):</span> 100 000–250 000
                  EUR/MWp
                </div>
                <div>
                  <span className="font-medium">Farmy Wiatrowe (RTB):</span> 340
                  000–464 000 zł/MW
                </div>
                <div>
                  <span className="font-medium">Magazyny Energii (RTB):</span>{" "}
                  1.2–1.8 mln zł/MW
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Porady inwestycyjne</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  • Projekty hybrydowe (PV + magazyn) osiągają premię cenową
                  30-40%
                </li>
                <li>
                  • Najwyższe ROI oferują projekty PV w fazie development
                  (50-80k EUR/MWp)
                </li>
                <li>
                  • Projekty z gwarantowaną mocą przyłączeniową są warte 15-20%
                  więcej
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Aktywność giełdy</h4>
              <p className="text-sm">
                W ostatnim kwartale odnotowano 47 transakcji o łącznej wartości
                320 mln zł, co oznacza wzrost o 18% r/r. Średni czas sprzedaży
                projektu wynosi obecnie 4 miesiące.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketView;
