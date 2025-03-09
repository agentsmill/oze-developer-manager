import React from "react";
import { useEventsContext } from "../../store/EventsContext";
import { getColorByValue } from "../../utils/colors";

const PolandMap = ({ regions, selectedRegionId, onSelectRegion }) => {
  const { state: eventsState } = useEventsContext();
  
  // Defensywnie pobieramy wydarzenia z kontekstu
  const eventsArray = Array.isArray(eventsState?.events) ? eventsState.events : [];
  
  // Określamy kolor regionu na podstawie warunków
  const getRegionFillColor = (region) => {
    if (!region) return "#e5e7eb"; // Domyślny szary
    
    const windValue = region.windConditions || 0;
    const sunValue = region.solarConditions || 0;
    const landValue = region.availableLand ? (region.availableLand / 20000 * 100) : 0;
    
    // Średnia wartość zasobów
    const avgResourceValue = (windValue + sunValue + landValue) / 3;
    
    // getColorByValue zwraca już wartość hex, możemy jej użyć bezpośrednio
    return getColorByValue(avgResourceValue);
  };
  
  // Sprawdzamy, czy region ma aktywne wydarzenia
  const hasActiveEvents = (regionId) => {
    if (!regionId) return false;
    return eventsArray.some(event => 
      event.regionId === regionId && (!event.expires || event.expires > Date.now())
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg 
        viewBox="0 0 700 700" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-3xl max-h-3xl"
      >
        {/* Mapa Polski z województwami */}
        {/* Dolnośląskie */}
        <path 
          id="dolnoslaskie"
          d="M125,352 L106,339 L83,333 L74,312 L54,316 L39,340 L18,340 L21,362 L40,386 L61,398 L117,390 L159,425 L183,409 L176,363 L148,361 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "dolnoslaskie"))}
          stroke={selectedRegionId === "dolnoslaskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "dolnoslaskie" ? "3" : "1"}
          onClick={() => onSelectRegion("dolnoslaskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Kujawsko-Pomorskie */}
        <path 
          id="kujawsko-pomorskie"
          d="M265,164 L292,182 L339,184 L348,204 L331,231 L285,233 L254,219 L228,231 L213,218 L230,188 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "kujawsko-pomorskie"))}
          stroke={selectedRegionId === "kujawsko-pomorskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "kujawsko-pomorskie" ? "3" : "1"}
          onClick={() => onSelectRegion("kujawsko-pomorskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Lubelskie */}
        <path 
          id="lubelskie"
          d="M523,264 L540,230 L516,195 L523,175 L511,152 L464,210 L470,247 L449,277 L461,307 L488,316 L497,339 L526,354 L555,310 L534,280 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "lubelskie"))}
          stroke={selectedRegionId === "lubelskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "lubelskie" ? "3" : "1"}
          onClick={() => onSelectRegion("lubelskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Lubuskie */}
        <path 
          id="lubuskie"
          d="M106,236 L97,206 L108,182 L92,157 L102,125 L137,138 L158,182 L177,186 L165,219 L142,245 L152,271 L114,261 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "lubuskie"))}
          stroke={selectedRegionId === "lubuskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "lubuskie" ? "3" : "1"}
          onClick={() => onSelectRegion("lubuskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Łódzkie */}
        <path 
          id="lodzkie"
          d="M360,308 L340,264 L348,232 L319,200 L329,172 L376,188 L402,210 L433,201 L435,249 L398,278 L399,307 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "lodzkie"))}
          stroke={selectedRegionId === "lodzkie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "lodzkie" ? "3" : "1"}
          onClick={() => onSelectRegion("lodzkie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Małopolskie */}
        <path 
          id="malopolskie"
          d="M383,389 L384,430 L409,471 L449,464 L465,442 L462,410 L423,393 L422,363 L399,347 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "malopolskie"))}
          stroke={selectedRegionId === "malopolskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "malopolskie" ? "3" : "1"}
          onClick={() => onSelectRegion("malopolskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Mazowieckie */}
        <path 
          id="mazowieckie"
          d="M435,249 L456,210 L466,162 L432,143 L413,97 L376,105 L329,172 L376,188 L402,210 L433,201 Z M456,210 L435,249 L464,210 L470,247 L449,277 L461,307 L415,307 L398,278 L435,249 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "mazowieckie"))}
          stroke={selectedRegionId === "mazowieckie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "mazowieckie" ? "3" : "1"}
          onClick={() => onSelectRegion("mazowieckie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Opolskie */}
        <path 
          id="opolskie"
          d="M212,392 L183,409 L159,425 L172,441 L210,445 L238,424 L233,402 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "opolskie"))}
          stroke={selectedRegionId === "opolskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "opolskie" ? "3" : "1"}
          onClick={() => onSelectRegion("opolskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Podkarpackie */}
        <path 
          id="podkarpackie"
          d="M465,442 L508,442 L526,420 L542,449 L583,455 L583,408 L555,392 L547,368 L520,354 L497,339 L488,316 L461,307 L462,410 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "podkarpackie"))}
          stroke={selectedRegionId === "podkarpackie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "podkarpackie" ? "3" : "1"}
          onClick={() => onSelectRegion("podkarpackie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Podlaskie */}
        <path 
          id="podlaskie"
          d="M511,152 L529,84 L486,66 L453,98 L413,97 L432,143 L466,162 L456,210 L464,210 L511,152 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "podlaskie"))}
          stroke={selectedRegionId === "podlaskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "podlaskie" ? "3" : "1"}
          onClick={() => onSelectRegion("podlaskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Pomorskie */}
        <path 
          id="pomorskie"
          d="M265,164 L230,188 L213,143 L178,135 L167,102 L183,68 L224,40 L281,46 L300,69 L276,95 L285,122 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "pomorskie"))}
          stroke={selectedRegionId === "pomorskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "pomorskie" ? "3" : "1"}
          onClick={() => onSelectRegion("pomorskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Śląskie */}
        <path 
          id="slaskie"
          d="M282,385 L300,416 L288,442 L299,469 L338,464 L358,440 L384,430 L383,389 L360,372 L317,388 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "slaskie"))}
          stroke={selectedRegionId === "slaskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "slaskie" ? "3" : "1"}
          onClick={() => onSelectRegion("slaskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Świętokrzyskie */}
        <path 
          id="swietokrzyskie"
          d="M422,363 L423,393 L462,410 L461,307 L415,307 L399,307 L360,308 L372,340 L399,347 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "swietokrzyskie"))}
          stroke={selectedRegionId === "swietokrzyskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "swietokrzyskie" ? "3" : "1"}
          onClick={() => onSelectRegion("swietokrzyskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Warmińsko-Mazurskie */}
        <path 
          id="warminsko-mazurskie"
          d="M340,68 L335,101 L376,105 L413,97 L453,98 L486,66 L474,31 L424,16 L358,37 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "warminsko-mazurskie"))}
          stroke={selectedRegionId === "warminsko-mazurskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "warminsko-mazurskie" ? "3" : "1"}
          onClick={() => onSelectRegion("warminsko-mazurskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Wielkopolskie */}
        <path 
          id="wielkopolskie"
          d="M165,219 L177,186 L185,236 L213,218 L228,231 L254,219 L285,233 L331,231 L348,232 L340,264 L301,314 L265,313 L225,290 L186,300 L165,321 L142,314 L152,271 L142,245 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "wielkopolskie"))}
          stroke={selectedRegionId === "wielkopolskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "wielkopolskie" ? "3" : "1"}
          onClick={() => onSelectRegion("wielkopolskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Zachodniopomorskie */}
        <path 
          id="zachodniopomorskie"
          d="M102,125 L92,157 L108,182 L97,206 L106,236 L114,261 L152,271 L142,245 L165,219 L177,186 L158,182 L137,138 L102,125 L85,79 L42,71 L57,112 L82,111 Z"
          fill={getRegionFillColor(regions.find(r => r.id === "zachodniopomorskie"))}
          stroke={selectedRegionId === "zachodniopomorskie" ? "#3b82f6" : "#9ca3af"}
          strokeWidth={selectedRegionId === "zachodniopomorskie" ? "3" : "1"}
          onClick={() => onSelectRegion("zachodniopomorskie")}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
        
        {/* Wskaźniki zdarzeń */}
        {regions.map(region => hasActiveEvents(region.id) && (
          <circle
            key={`event-${region.id}`}
            cx={getRegionCenterX(region.id)}
            cy={getRegionCenterY(region.id)}
            r="7"
            fill="#ef4444"
            className="animate-pulse"
          />
        ))}
        
        {/* Oznaczenia OPRO */}
        {regions.filter(r => r.isOPRO).map(region => (
          <text
            key={`opro-${region.id}`}
            x={getRegionCenterX(region.id)}
            y={getRegionCenterY(region.id) - 15}
            textAnchor="middle"
            fontSize="12"
            fill="#166534"
            fontWeight="bold"
            className="pointer-events-none"
          >
            OPRO
          </text>
        ))}
      </svg>
    </div>
  );
};

// Funkcje pomocnicze do określania środka województwa dla eventów i oznaczeń
function getRegionCenterX(regionId) {
  const centers = {
    "dolnoslaskie": 120,
    "kujawsko-pomorskie": 280,
    "lubelskie": 500,
    "lubuskie": 130,
    "lodzkie": 370,
    "malopolskie": 420,
    "mazowieckie": 430,
    "opolskie": 210,
    "podkarpackie": 520,
    "podlaskie": 470,
    "pomorskie": 230,
    "slaskie": 320,
    "swietokrzyskie": 410,
    "warminsko-mazurskie": 400,
    "wielkopolskie": 250,
    "zachodniopomorskie": 120
  };
  return centers[regionId] || 0;
}

function getRegionCenterY(regionId) {
  const centers = {
    "dolnoslaskie": 360,
    "kujawsko-pomorskie": 200,
    "lubelskie": 270,
    "lubuskie": 200,
    "lodzkie": 270,
    "malopolskie": 420,
    "mazowieckie": 200,
    "opolskie": 410,
    "podkarpackie": 410,
    "podlaskie": 120,
    "pomorskie": 110,
    "slaskie": 420,
    "swietokrzyskie": 370,
    "warminsko-mazurskie": 70,
    "wielkopolskie": 250,
    "zachodniopomorskie": 160
  };
  return centers[regionId] || 0;
}

export default PolandMap;
