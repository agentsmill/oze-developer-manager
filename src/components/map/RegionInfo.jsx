import React, { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import { Info, Sun, Wind, Battery } from "lucide-react";
import { getColorByValue } from "../../utils/colors";
import { useEventsContext } from "../../store/EventContext";

const RegionInfo = ({ region, onStartProject }) => {
  const [selectedTechnology, setSelectedTechnology] = useState("PV");
  const { state: events } = useEventsContext();

  // Filtrujemy aktywne wydarzenia dla tego regionu
  const regionEvents = events.filter((e) => e.regionId === region.id);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{region.name}</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">
            Dostępne moce przyłączeniowe
          </div>
          <div className="text-xl font-bold">{region.gridCapacity} MW</div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Dostępne grunty</div>
          <div className="text-xl font-bold">
            {region.availableLand.toLocaleString()} ha
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Nasłonecznienie</div>
          <div className="flex items-center">
            <div className="text-xl font-bold mr-2">
              {region.solarConditions}/100
            </div>
            <div
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor: getColorByValue(region.solarConditions),
              }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Warunki wiatrowe</div>
          <div className="flex items-center">
            <div className="text-xl font-bold mr-2">
              {region.windConditions}/100
            </div>
            <div
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor: getColorByValue(region.windConditions),
              }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Akceptacja społeczna</div>
          <div className="flex items-center">
            <div className="text-xl font-bold mr-2">
              {region.socialAcceptance}/100
            </div>
            <div
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor: getColorByValue(region.socialAcceptance),
              }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Złożoność środowiskowa</div>
          <div className="text-xl font-bold">
            {region.environmentalComplexity.toFixed(1)}x
            <span className="text-sm font-normal text-gray-500 ml-1">
              {region.environmentalComplexity > 1
                ? "(trudniejsza)"
                : "(łatwiejsza)"}
            </span>
          </div>
        </div>
      </div>

      {/* Aktywne wydarzenia w regionie */}
      <Card title="Wydarzenia w regionie" className="mb-4">
        {regionEvents && regionEvents.length > 0 ? (
          <div className="space-y-2">
            {regionEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded text-sm ${
                  event.severity === "positive"
                    ? "bg-green-100 text-green-800"
                    : event.severity === "negative"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <div className="font-bold">{event.title}</div>
                <div>{event.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            Brak aktywnych wydarzeń w tym regionie
          </p>
        )}
      </Card>

      {/* Projekty w regionie */}
      <Card title="Projekty w regionie" className="mb-4">
        {region.projects && region.projects.length > 0 ? (
          <div className="max-h-40 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 text-xs">Nazwa</th>
                  <th className="text-center p-2 text-xs">Moc</th>
                  <th className="text-center p-2 text-xs">Status</th>
                  <th className="text-center p-2 text-xs">Postęp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {region.projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="p-2 text-xs">{project.name}</td>
                    <td className="text-center p-2 text-xs">
                      {project.power} MW
                    </td>
                    <td className="text-center p-2 text-xs">
                      {translateStage(project.status)}
                    </td>
                    <td className="p-2">
                      <ProgressBar
                        value={project.progress}
                        color={getStatusColor(project.status)}
                        height="2"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Brak projektów w tym regionie</p>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        {/* Wybór technologii */}
        <div className="flex mb-4">
          <button
            onClick={() => setSelectedTechnology("PV")}
            className={`px-3 py-1 rounded flex items-center ${
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
            <Wind className="h-4 w-4 mr-1" /> Farma Wiatrowa
          </button>
          <button
            onClick={() => setSelectedTechnology("BESS")}
            className={`px-3 py-1 rounded ml-2 flex items-center ${
              selectedTechnology === "BESS"
                ? "bg-purple-500 text-white"
                : "bg-gray-200"
            }`}
          >
            <Battery className="h-4 w-4 mr-1" /> Magazyn Energii
          </button>
        </div>

        <Button
          onClick={() => onStartProject(selectedTechnology)}
          variant="success"
          className="w-full py-2 font-bold flex items-center justify-center"
        >
          <div className="mr-2">+</div>
          Rozpocznij nowy projekt {translateTechnology(selectedTechnology)}
        </Button>

        <div className="p-3 bg-blue-50 rounded text-sm">
          <div className="font-bold flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Informacje o kosztach:
          </div>
          <div>
            <span className="font-medium">Koszt pozyskania gruntu:</span> ~
            {Math.floor(400000 * region.landPriceMultiplier).toLocaleString()}{" "}
            PLN/ha
          </div>
          <div>
            <span className="font-medium">Szacowana rentowność:</span>{" "}
            {(
              (Math.max(region.solarConditions, region.windConditions) / 60) *
              100
            ).toFixed(1)}
            % średniej
          </div>
          {region.isOPRO && (
            <div className="text-green-700 font-medium mt-1">
              Obszar Przyspieszonego Rozwoju OZE: +40% szybkości procedur
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Funkcje pomocnicze
const translateStage = (stage) => {
  switch (stage) {
    case "land_acquisition":
      return "Pozyskiwanie gruntów";
    case "environmental_decision":
      return "Decyzja środowiskowa";
    case "zoning_conditions":
      return "Warunki zabudowy";
    case "grid_connection":
      return "Przyłączenie do sieci";
    case "construction":
      return "Budowa";
    case "ready_to_build":
      return "Gotowy do budowy";
    default:
      return stage;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "land_acquisition":
      return "blue";
    case "environmental_decision":
      return "yellow";
    case "zoning_conditions":
      return "orange";
    case "grid_connection":
      return "purple";
    case "construction":
      return "red";
    case "ready_to_build":
      return "green";
    default:
      return "gray";
  }
};

const translateTechnology = (tech) => {
  switch (tech) {
    case "PV":
      return "Fotowoltaika";
    case "WF":
      return "Farma Wiatrowa";
    case "BESS":
      return "Magazyn Energii";
    default:
      return tech;
  }
};

export default RegionInfo;
