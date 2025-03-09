import React from "react";
import { useCountyContext, getCountyFromContext } from "../../store/CountyContext";
import { useGameContext } from "../../store/GameContext";
import Card from "../ui/Card";
import { getColorByValue } from "../../utils/colors";

const CountyInfo = ({ voivodeshipId, countyId, onStartProject }) => {
  const { state: counties } = useCountyContext();
  const { state: gameState, dispatch: gameDispatch } = useGameContext();

  // Pobieramy dane powiatu
  const county = getCountyFromContext(counties, voivodeshipId, countyId);

  if (!county) {
    return <Card title="Powiat">
      <p className="text-gray-500">Nie znaleziono wybranego powiatu.</p>
    </Card>;
  }

  // Funkcja do tworzenia projektu w tym powiecie
  const handleStartProject = (technology) => {
    onStartProject(technology, countyId);
  };

  return (
    <Card title={`Powiat ${county.name}`}>
      <div className="space-y-4">
        {/* Podstawowe informacje */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Stolica</div>
            <div className="font-bold">{county.capital}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Populacja</div>
            <div className="font-bold">{county.population.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Powierzchnia</div>
            <div className="font-bold">{county.area} km²</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Ceny gruntów</div>
            <div className="font-bold">{county.propertyPrices.toFixed(2)}x średnia</div>
          </div>
        </div>

        {/* Wskaźniki dla OZE */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-gray-500">Dostępne grunty</div>
            <div className="font-bold">{county.availableLand} ha</div>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-gray-500">Moc przyłączeniowa</div>
            <div className="font-bold">{county.gridCapacity} MW</div>
          </div>
        </div>

        {/* Warunki naturalne */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Potencjał słoneczny</span>
              <span className="text-sm font-bold">{county.solarPotential}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${county.solarPotential}%`,
                  backgroundColor: getColorByValue(county.solarPotential),
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Potencjał wiatrowy</span>
              <span className="text-sm font-bold">{county.windPotential}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${county.windPotential}%`,
                  backgroundColor: getColorByValue(county.windPotential),
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Wyzwania */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Ograniczenia środowiskowe</span>
              <span className="text-sm font-bold">{county.environmentalRestrictions}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${county.environmentalRestrictions}%`,
                  backgroundColor: getColorByValue(100 - county.environmentalRestrictions),
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Lokalna opozycja</span>
              <span className="text-sm font-bold">{county.localOpposition}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${county.localOpposition}%`,
                  backgroundColor: getColorByValue(100 - county.localOpposition),
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Efektywność administracji</span>
              <span className="text-sm font-bold">{county.administrativeEfficiency}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${county.administrativeEfficiency}%`,
                  backgroundColor: getColorByValue(county.administrativeEfficiency),
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Infrastruktura */}
        <div className="flex space-x-4">
          <div className={`text-xs px-2 py-1 rounded ${county.powerLines.hv ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {county.powerLines.hv ? 'Linie WN dostępne' : 'Brak linii WN'}
          </div>
          <div className={`text-xs px-2 py-1 rounded ${county.powerLines.mv ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {county.powerLines.mv ? 'Linie SN dostępne' : 'Brak linii SN'}
          </div>
          <div className={`text-xs px-2 py-1 rounded ${!county.isNatura2000 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {county.isNatura2000 ? 'Obszar Natura 2000' : 'Bez Natura 2000'}
          </div>
        </div>

        {/* Przyciski do tworzenia projektu */}
        <div className="pt-3 border-t">
          <div className="text-sm font-medium mb-2">Rozpocznij nowy projekt:</div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleStartProject("PV")}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex-1"
            >
              Fotowoltaika
            </button>
            <button
              onClick={() => handleStartProject("WF")}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
            >
              Farma Wiatrowa
            </button>
          </div>
        </div>

        {/* Aktywne projekty */}
        {county.projects.length > 0 && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium mb-2">Aktywne projekty:</div>
            <div className="space-y-2">
              {county.projects.map((project) => (
                <div key={project.id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-gray-600">
                    {project.technology} • {project.power} MW
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aktywne wydarzenia */}
        {county.events.length > 0 && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium mb-2">Aktywne wydarzenia:</div>
            <div className="space-y-2">
              {county.events.map((event) => (
                <div
                  key={event.id}
                  className={`p-2 rounded text-sm ${
                    event.severity === "positive"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div className="font-medium">{event.title}</div>
                  <div>{event.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CountyInfo; 