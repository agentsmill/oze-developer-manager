import React, { useState } from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { useGameContext } from '../../store/GameContext';
import { useEventsContext } from '../../store/EventsContext';
import Button from '../ui/Button';
import { AlertTriangle, Eye, FileX, Banknote, ShieldAlert, UserX, Network, Lock } from 'lucide-react';

const IllegalActionsPanel = ({ onClose }) => {
  const { state: player, dispatch: playerDispatch } = usePlayerContext();
  const { state: gameState, showNotification } = useGameContext();
  const { dispatch: eventsDispatch } = useEventsContext();
  
  const [selectedAction, setSelectedAction] = useState(null);
  
  // Lista nielegalnych akcji dostępnych w grze
  const illegalActions = [
    {
      id: 'bribe_officials',
      name: 'Przekupstwo urzędników',
      description: 'Wykorzystaj łapówki, aby przyspieszyć proces administracyjny i uzyskać przychylne decyzje.',
      icon: <Banknote className="h-5 w-5 text-yellow-600" />,
      riskLevel: 'high',
      cost: 50000,
      reputation: -10,
      effects: 'Przyspiesza proces uzyskiwania decyzji administracyjnych o 40% dla wskazanego projektu.',
      requirements: 'Minimum 100 000 PLN i reputacja > 30',
      details: 'Przekupstwo urzędników to powszechna praktyka w krajach o wysokim poziomie korupcji. W sektorze OZE może dotyczyć przyspieszenia wydania decyzji środowiskowych, warunków zabudowy lub przyłączenia do sieci.',
      requiredCorruption: 10,
      targetType: 'project'
    },
    {
      id: 'falsify_documents',
      name: 'Fałszowanie dokumentacji',
      description: 'Zmodyfikuj dokumentację techniczną lub środowiskową, aby ukryć potencjalne problemy.',
      icon: <FileX className="h-5 w-5 text-red-600" />,
      riskLevel: 'extreme',
      cost: 100000,
      reputation: -20,
      effects: 'Eliminuje negatywne czynniki techniczne lub środowiskowe blokujące rozwój projektu.',
      requirements: 'Konieczne posiadanie nielegalnej bazy danych i reputacja > 50',
      details: 'Fałszowanie dokumentacji to poważne przestępstwo, które może dotyczyć raportów oddziaływania na środowisko, badań ornitologicznych lub dokumentacji technicznej. Wykrycie może skutkować nie tylko karami finansowymi, ale nawet odpowiedzialnością karną.',
      requiredCorruption: 30,
      targetType: 'project'
    },
    {
      id: 'insider_info',
      name: 'Informacje poufne',
      description: 'Uzyskaj dostęp do poufnych informacji o planach przestrzennych i aukcjach energii.',
      icon: <Eye className="h-5 w-5 text-blue-600" />,
      riskLevel: 'medium',
      cost: 25000,
      reputation: -5,
      effects: 'Udostępnia informacje o najlepszych lokalizacjach i nadchodzących aukcjach, zwiększając szanse sukcesu.',
      requirements: 'Posiadanie co najmniej jednego lobbysty',
      details: 'Wykorzystanie informacji poufnych to działalność na granicy prawa, która polega na uzyskiwaniu dostępu do niepublicznych danych o planach zagospodarowania, przetargach czy zmianach regulacyjnych. Może dawać znaczącą przewagę konkurencyjną.',
      requiredCorruption: 5,
      targetType: 'company'
    },
    {
      id: 'intimidate_landowners',
      name: 'Zastraszanie właścicieli gruntów',
      description: 'Wywieranie presji na właścicieli gruntów, aby sprzedali ziemię po zaniżonej cenie.',
      icon: <UserX className="h-5 w-5 text-purple-600" />,
      riskLevel: 'high',
      cost: 30000,
      reputation: -15,
      effects: 'Obniża koszty zakupu gruntów o 30-50%.',
      requirements: 'Reputacja > 40',
      details: 'Zastraszanie właścicieli gruntów to metoda nieetyczna i nielegalna, stosowana przez nieuczciwych deweloperów. Polega na wywieraniu presji poprzez groźby lub wykorzystywanie luk prawnych, aby zmusić właścicieli do sprzedaży po zaniżonych cenach.',
      requiredCorruption: 20,
      targetType: 'project'
    },
    {
      id: 'build_corruption_network',
      name: 'Budowa sieci korupcyjnej',
      description: 'Rozwijaj sieć kontaktów w urzędach i instytucjach kontrolnych, aby ułatwić przyszłe działania.',
      icon: <Network className="h-5 w-5 text-green-600" />,
      riskLevel: 'medium',
      cost: 200000,
      reputation: -10,
      effects: 'Zwiększa poziom sieci korupcyjnej o 10 punktów, obniżając koszty przyszłych nielegalnych działań.',
      requirements: 'Minimum 200 000 PLN',
      details: 'Budowa sieci korupcyjnej to długofalowa inwestycja w nieformalne kontakty z urzędnikami, politykami i przedstawicielami instytucji kontrolnych. Im silniejsza sieć, tym łatwiejsze i tańsze stają się przyszłe nielegalne działania.',
      requiredCorruption: 0,
      targetType: 'company'
    },
    {
      id: 'sabotage_competitors',
      name: 'Sabotaż konkurencji',
      description: 'Zlecenie działań sabotażowych przeciwko konkurencyjnym projektom w regionie.',
      icon: <ShieldAlert className="h-5 w-5 text-orange-600" />,
      riskLevel: 'extreme',
      cost: 150000,
      reputation: -25,
      effects: 'Opóźnia projekty konkurencji w regionie o 3-6 miesięcy.',
      requirements: 'Reputacja > 60 i poziom sieci korupcyjnej > 30',
      details: 'Sabotaż konkurencji to bezpośrednie działania wymierzone w projekty konkurencyjnych firm. Może obejmować manipulowanie konsultacjami społecznymi, sztuczne wywoływanie protestów lub nawet fizyczne uszkodzenia infrastruktury. Niesie wysokie ryzyko wykrycia i poważnych konsekwencji prawnych.',
      requiredCorruption: 40,
      targetType: 'region'
    },
    {
      id: 'create_illegal_database',
      name: 'Stwórz nielegalną bazę danych',
      description: 'Zlecenie stworzenia bazy danych zawierającej poufne informacje o urzędnikach, planach i procedurach.',
      icon: <Lock className="h-5 w-5 text-gray-600" />,
      riskLevel: 'low',
      cost: 75000,
      reputation: -5,
      effects: 'Odblokowuje dodatkowe nielegalne akcje i zwiększa skuteczność istniejących o 20%.',
      requirements: 'Minimum 75 000 PLN',
      details: 'Nielegalna baza danych to zbiór poufnych informacji o urzędnikach, procedurach i lukach prawnych. Jej posiadanie umożliwia bardziej precyzyjne planowanie nielegalnych działań i zwiększa ich skuteczność. Pozyskanie takich danych wymaga zaangażowania osób z dostępem do poufnych informacji.',
      requiredCorruption: 0,
      targetType: 'company'
    }
  ];
  
  // Sprawdza, czy akcja jest dostępna dla gracza
  const isActionAvailable = (action) => {
    // Sprawdzanie podstawowych wymagań
    if (action.requirements.includes('minimum') && player.cash < action.cost) {
      return false;
    }
    
    if (action.requirements.includes('reputacja') && player.reputation < parseInt(action.requirements.match(/reputacja > (\d+)/)[1])) {
      return false;
    }
    
    if (action.requiredCorruption > player.illegals.corruptionNetwork) {
      return false;
    }
    
    // Specyficzne wymagania
    if (action.id === 'falsify_documents' && !player.illegals.hasIllegalDatabase) {
      return false;
    }
    
    if (action.id === 'insider_info' && player.staff.lobbyists.length === 0) {
      return false;
    }
    
    if (action.id === 'create_illegal_database' && player.illegals.hasIllegalDatabase) {
      return false;
    }
    
    return true;
  };
  
  // Wykonuje nielegalną akcję
  const executeIllegalAction = (action) => {
    // Sprawdzamy dostępność raz jeszcze
    if (!isActionAvailable(action)) {
      showNotification('Nie możesz wykonać tej akcji - nie spełniasz wymagań!', 'error');
      return;
    }
    
    // Pobieramy koszt akcji
    if (player.cash < action.cost) {
      showNotification(`Nie masz wystarczających środków (potrzeba ${action.cost.toLocaleString()} PLN)`, 'error');
      return;
    }
    
    // Efekty w zależności od typu akcji
    switch(action.id) {
      case 'create_illegal_database':
        playerDispatch({
          type: 'USE_ILLEGAL_ACTION',
          payload: {
            actionType: action.id,
            target: 'company',
            bribeCost: action.cost,
            corruptionChange: 5,
            updateCorruption: true,
            riskIncrease: 10,
            turn: gameState.turn
          }
        });
        
        // Aktualizujemy posiadanie bazy
        playerDispatch({
          type: 'UPDATE_ILLEGAL_DATABASE',
          payload: {
            hasIllegalDatabase: true
          }
        });
        
        // Aktualizujemy reputację
        playerDispatch({
          type: 'UPDATE_REPUTATION',
          payload: {
            change: action.reputation,
            reason: `Stworzenie nielegalnej bazy danych`,
            turn: gameState.turn
          }
        });
        
        // Dodajemy wydarzenie
        eventsDispatch({
          type: 'ADD_EVENT',
          payload: {
            id: Date.now(),
            type: 'illegal_activity',
            title: 'Stworzenie nielegalnej bazy danych',
            description: 'Stworzyłeś nielegalną bazę danych, która umożliwi Ci bardziej skuteczne planowanie nielegalnych działań.',
            severity: 'warning',
            turn: gameState.turn,
            expires: gameState.turn + 10
          }
        });
        
        showNotification('Stworzyłeś nielegalną bazę danych!', 'success');
        break;
        
      case 'build_corruption_network':
        playerDispatch({
          type: 'USE_ILLEGAL_ACTION',
          payload: {
            actionType: action.id,
            target: 'company',
            bribeCost: action.cost,
            corruptionChange: 10,
            updateCorruption: true,
            riskIncrease: 15,
            turn: gameState.turn
          }
        });
        
        // Aktualizujemy reputację
        playerDispatch({
          type: 'UPDATE_REPUTATION',
          payload: {
            change: action.reputation,
            reason: `Rozbudowa sieci korupcyjnej`,
            turn: gameState.turn
          }
        });
        
        // Dodajemy wydarzenie
        eventsDispatch({
          type: 'ADD_EVENT',
          payload: {
            id: Date.now(),
            type: 'illegal_activity',
            title: 'Rozbudowa sieci korupcyjnej',
            description: 'Rozwinąłeś swoją sieć kontaktów korupcyjnych, co ułatwi Ci przyszłe nielegalne działania.',
            severity: 'warning',
            turn: gameState.turn,
            expires: gameState.turn + 15
          }
        });
        
        showNotification('Rozbudowałeś swoją sieć korupcyjną!', 'success');
        break;
        
      default:
        // Dla pozostałych akcji, które wymagają wyboru celu
        setSelectedAction(action);
    }
  };
  
  // Poziom ryzyka - formatowanie
  const getRiskLevelDisplay = (level) => {
    switch(level) {
      case 'low':
        return <span className="text-green-600 font-medium">Niskie</span>;
      case 'medium':
        return <span className="text-yellow-600 font-medium">Średnie</span>;
      case 'high':
        return <span className="text-orange-600 font-medium">Wysokie</span>;
      case 'extreme':
        return <span className="text-red-600 font-medium">Ekstremalne</span>;
      default:
        return <span className="text-gray-600">Nieznane</span>;
    }
  };
  
  // Renderowanie szczegółów akcji
  const renderActionDetails = (action) => {
    const isAvailable = isActionAvailable(action);
    
    return (
      <div className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex items-start mb-2">
          <div className="mr-3">{action.icon}</div>
          <div className="flex-grow">
            <h3 className="font-bold text-gray-800">{action.name}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </div>
          <div className="ml-2 text-right">
            <div className="text-sm mb-1">Ryzyko: {getRiskLevelDisplay(action.riskLevel)}</div>
            <div className="text-sm">Koszt: <span className="font-medium">{action.cost.toLocaleString()} PLN</span></div>
          </div>
        </div>
        
        <div className="mt-2 space-y-2 text-sm">
          <div><span className="text-gray-600">Efekt:</span> {action.effects}</div>
          <div><span className="text-gray-600">Wymagania:</span> {action.requirements}</div>
          <div><span className="text-gray-600">Wpływ na reputację:</span> <span className="text-red-600">{action.reputation}</span></div>
        </div>
        
        <div className="mt-3">
          <Button
            onClick={() => executeIllegalAction(action)}
            disabled={!isAvailable}
            variant={isAvailable ? "warning" : "disabled"}
            className="w-full"
            icon={<AlertTriangle className="h-4 w-4" />}
          >
            {isAvailable ? "Wykonaj akcję" : "Niedostępne"}
          </Button>
        </div>
      </div>
    );
  };
  
  // Wyświetlamy dane o szarej strefie
  return (
    <div>
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
        <h2 className="text-xl font-bold">Szara strefa</h2>
      </div>
      
      <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
        <p className="text-red-800 text-sm">
          <strong>UWAGA:</strong> Działania w szarej strefie są nielegalne i wiążą się z ryzykiem. 
          Wykrycie może skutkować karami finansowymi, utratą reputacji, a nawet zakończeniem gry.
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-bold mb-2">Twój status:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded p-2 shadow-sm">
            <div className="text-gray-600 text-sm">Sieć korupcyjna:</div>
            <div className="font-medium">{player.illegals.corruptionNetwork}/100</div>
          </div>
          <div className="bg-white rounded p-2 shadow-sm">
            <div className="text-gray-600 text-sm">Ryzyko audytu:</div>
            <div className="font-medium">{player.illegals.auditRisk}%</div>
          </div>
          <div className="bg-white rounded p-2 shadow-sm">
            <div className="text-gray-600 text-sm">Baza danych:</div>
            <div className="font-medium">{player.illegals.hasIllegalDatabase ? "Posiadasz" : "Brak"}</div>
          </div>
          <div className="bg-white rounded p-2 shadow-sm">
            <div className="text-gray-600 text-sm">Łapówki wydane:</div>
            <div className="font-medium">{player.illegals.totalBribes.toLocaleString()} PLN</div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-bold mb-2">Dostępne akcje:</h3>
        <div className="space-y-3">
          {illegalActions.map(action => renderActionDetails(action))}
        </div>
      </div>
      
      {/* Tutaj można dodać więcej elementów, jak historia nielegalnych działań */}
    </div>
  );
};

export default IllegalActionsPanel; 