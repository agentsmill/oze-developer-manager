import React, { useState } from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { useGameContext } from '../../store/GameContext';
import Button from '../ui/Button';
import { 
  Building, DollarSign, Landmark, ArrowRight, 
  TrendingUp, TrendingDown, BarChart3 
} from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

// Własna ikona banknotów zamiast BanknotesIcon
const MoneyIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const FinancePanel = ({ onClose }) => {
  const { state: player, dispatch: playerDispatch } = usePlayerContext();
  const { state: gameState, showNotification } = useGameContext();
  
  const [selectedBank, setSelectedBank] = useState(null);
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTerm, setLoanTerm] = useState(12);
  
  // Lista dostępnych banków
  const banks = [
    {
      id: 'eco_bank',
      name: 'EcoBank',
      description: 'Bank specjalizujący się w finansowaniu projektów OZE',
      maxLoan: 5000000,
      baseInterestRate: 0.08, // 8%
      reputationBonus: true, // Uwzględnia reputację
      requirementsDescription: 'Wymaga min. 3 projektów i reputacji > 70',
      requiresProjects: 3,
      requiresReputation: 70
    },
    {
      id: 'investment_bank',
      name: 'InvestBank',
      description: 'Duży bank komercyjny z programem dla projektów energetycznych',
      maxLoan: 10000000,
      baseInterestRate: 0.095, // 9.5%
      reputationBonus: true,
      requirementsDescription: 'Wymaga min. 5 projektów i reputacji > 50, lub projektu RTB',
      requiresProjects: 5,
      requiresReputation: 50,
      requiresRTB: true
    },
    {
      id: 'small_bank',
      name: 'LocalBank',
      description: 'Mniejszy bank lokalny, mniej wymagający, ale droższa oferta',
      maxLoan: 2000000,
      baseInterestRate: 0.12, // 12%
      reputationBonus: false,
      requirementsDescription: 'Brak szczególnych wymagań',
      requiresProjects: 0,
      requiresReputation: 0
    },
    {
      id: 'shadow_bank',
      name: 'ShadowFinance',
      description: 'Nieoficjalne źródło finansowania, wysokie odsetki, brak formalności',
      maxLoan: 1500000,
      baseInterestRate: 0.25, // 25%
      reputationBonus: false,
      reputationPenalty: 5, // Korzystanie powoduje spadek reputacji
      requirementsDescription: 'Wymaga poziomu sieci korupcyjnej > 20',
      requiresCorruption: 20
    }
  ];
  
  // Sprawdzamy, czy bank jest dostępny dla gracza
  const isBankAvailable = (bank) => {
    if (bank.requiresProjects > 0 && player.projects.length < bank.requiresProjects) {
      return false;
    }
    
    if (bank.requiresReputation > 0 && player.reputation < bank.requiresReputation) {
      return false;
    }
    
    if (bank.requiresRTB && !player.projects.some(p => p.status === 'ready_to_build')) {
      return false;
    }
    
    if (bank.requiresCorruption && player.illegals.corruptionNetwork < bank.requiresCorruption) {
      return false;
    }
    
    return true;
  };
  
  // Oblicza oprocentowanie dla danego banku i gracza
  const calculateInterestRate = (bank) => {
    let rate = bank.baseInterestRate;
    
    // Bonus za reputację
    if (bank.reputationBonus && player.reputation > 80) {
      rate -= 0.01; // -1% za wysoką reputację
    }
    
    // Bonus za projekty w fazie RTB
    const rtbProjects = player.projects.filter(p => p.status === 'ready_to_build').length;
    if (rtbProjects > 0) {
      rate -= rtbProjects * 0.005; // -0.5% za każdy projekt RTB
    }
    
    // Limit minimalnego oprocentowania
    return Math.max(0.05, rate);
  };
  
  // Oblicza miesięczną ratę kredytu
  const calculateMonthlyPayment = (amount, rate, term) => {
    const monthlyRate = rate / 12;
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
  };
  
  // Zaciąga kredyt
  const takeLoan = () => {
    if (!selectedBank) {
      showNotification('Wybierz bank, aby zaciągnąć kredyt', 'error');
      return;
    }
    
    if (!isBankAvailable(selectedBank)) {
      showNotification('Nie spełniasz wymagań tego banku', 'error');
      return;
    }
    
    if (loanAmount > selectedBank.maxLoan) {
      showNotification(`Maksymalna kwota kredytu to ${selectedBank.maxLoan.toLocaleString()} PLN`, 'error');
      return;
    }
    
    // Sprawdzamy, czy gracz ma już kredyt
    if (player.loans && player.loans.length > 0) {
      showNotification('Możesz mieć tylko jeden aktywny kredyt', 'error');
      return;
    }
    
    // Obliczamy parametry kredytu
    const interestRate = calculateInterestRate(selectedBank);
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
    const totalPayment = monthlyPayment * loanTerm;
    const totalInterest = totalPayment - loanAmount;
    
    // Dodajemy kredyt do stanu gracza
    playerDispatch({
      type: 'ADD_LOAN',
      payload: {
        id: Date.now(),
        bankId: selectedBank.id,
        bankName: selectedBank.name,
        amount: loanAmount,
        remainingAmount: loanAmount,
        interestRate: interestRate,
        term: loanTerm,
        remainingTerm: loanTerm,
        monthlyPayment: monthlyPayment,
        totalInterest: totalInterest,
        totalPayment: totalPayment,
        takenOnTurn: gameState.turn,
        nextPaymentTurn: gameState.turn + 1
      }
    });
    
    // Dodajemy gotówkę
    playerDispatch({
      type: 'UPDATE_CASH',
      payload: loanAmount
    });
    
    // Aktualizujemy metryki ekonomiczne
    playerDispatch({
      type: 'UPDATE_ECONOMIC_METRICS',
      payload: {
        totalLoansTaken: (player.economicMetrics.totalLoansTaken || 0) + loanAmount
      }
    });
    
    // Efekt reputacji dla nieoficjalnych źródeł
    if (selectedBank.reputationPenalty) {
      playerDispatch({
        type: 'UPDATE_REPUTATION',
        payload: {
          change: -selectedBank.reputationPenalty,
          reason: `Zaciągnięcie kredytu w ${selectedBank.name}`,
          turn: gameState.turn
        }
      });
    }
    
    showNotification(`Zaciągnięto kredyt na kwotę ${loanAmount.toLocaleString()} PLN`, 'success');
    setSelectedBank(null);
  };
  
  // Formatuje kwotę pieniężną
  const formatMoney = (amount) => {
    return amount.toLocaleString() + ' PLN';
  };
  
  // Formatuje procent
  const formatPercent = (value) => {
    return (value * 100).toFixed(2) + '%';
  };
  
  // Renderuje pojedynczy bank
  const renderBank = (bank) => {
    const isAvailable = isBankAvailable(bank);
    const interestRate = calculateInterestRate(bank);
    
    return (
      <div 
        key={bank.id}
        className={`border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow ${selectedBank?.id === bank.id ? 'border-blue-500 bg-blue-50' : ''}`}
        onClick={() => isAvailable && setSelectedBank(bank)}
      >
        <div className="flex items-start">
          <div className="mr-3">
            <Building className={`h-6 w-6 ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex-grow">
            <h3 className={`font-bold ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>{bank.name}</h3>
            <p className="text-sm text-gray-600">{bank.description}</p>
            
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Max kredyt:</span>
                <span className="ml-1 font-medium">{formatMoney(bank.maxLoan)}</span>
              </div>
              <div>
                <span className="text-gray-600">Oprocentowanie:</span>
                <span className={`ml-1 font-medium ${interestRate > 0.15 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatPercent(interestRate)}
                </span>
              </div>
            </div>
            
            <div className="mt-1 text-sm">
              <span className="text-gray-600">Wymagania:</span>
              <span className={`ml-1 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? 'Spełnione' : bank.requirementsDescription}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Wyświetlamy panel finansowy
  return (
    <div>
      <div className="flex items-center mb-4">
        <DollarSign className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-bold">Panel finansowy</h2>
      </div>
      
      {/* Podsumowanie finansowe */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-bold mb-3">Twoje finanse</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-600 text-sm">Gotówka:</div>
            <div className="font-bold text-lg text-green-700">{formatMoney(player.cash)}</div>
          </div>
          
          <div>
            <div className="text-gray-600 text-sm">Wartość projektów:</div>
            <div className="font-bold text-lg">{formatMoney(player.economicMetrics.projectsValue || 0)}</div>
          </div>
          
          <div>
            <div className="text-gray-600 text-sm">Przychody:</div>
            <div className="font-bold text-green-700">{formatMoney(player.economicMetrics.totalRevenue || 0)}</div>
          </div>
          
          <div>
            <div className="text-gray-600 text-sm">Wydatki:</div>
            <div className="font-bold text-red-700">{formatMoney(player.economicMetrics.totalExpenses || 0)}</div>
          </div>
        </div>
      </div>
      
      {/* Aktywne kredyty */}
      {player.loans && player.loans.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-bold mb-3">Aktywne kredyty</h3>
          
          {player.loans.map(loan => (
            <div key={loan.id} className="border-b pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{loan.bankName}</span>
                <span className="text-blue-600">{formatMoney(loan.remainingAmount)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Rata miesięczna:</span>
                  <span className="ml-1">{formatMoney(loan.monthlyPayment)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Oprocentowanie:</span>
                  <span className="ml-1">{formatPercent(loan.interestRate)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pozostało rat:</span>
                  <span className="ml-1">{loan.remainingTerm}</span>
                </div>
                <div>
                  <span className="text-gray-600">Następna płatność:</span>
                  <span className="ml-1">Tura {loan.nextPaymentTurn}</span>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Spłacono</span>
                  <span>{Math.round((1 - loan.remainingAmount / loan.amount) * 100)}%</span>
                </div>
                <ProgressBar 
                  value={loan.amount - loan.remainingAmount} 
                  max={loan.amount} 
                  colorClass="bg-green-500" 
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Formularz kredytu */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-bold mb-3">Zaciągnij kredyt</h3>
        
        {selectedBank ? (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-bold text-blue-800">{selectedBank.name}</h4>
              </div>
              <p className="text-sm text-gray-700">{selectedBank.description}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Kwota kredytu</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min={100000}
                  max={selectedBank.maxLoan}
                  step={100000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                  className="flex-grow mr-3"
                />
                <span className="font-medium w-32 text-right">{formatMoney(loanAmount)}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Okres spłaty (miesiące)</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min={3}
                  max={36}
                  step={3}
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                  className="flex-grow mr-3"
                />
                <span className="font-medium w-32 text-right">{loanTerm} mies.</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded mb-4">
              <h4 className="font-medium mb-2">Podsumowanie kredytu</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="text-gray-600">Kwota kredytu:</span>
                  <span className="ml-1 font-medium">{formatMoney(loanAmount)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Okres spłaty:</span>
                  <span className="ml-1 font-medium">{loanTerm} miesięcy</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Oprocentowanie:</span>
                  <span className="ml-1 font-medium">{formatPercent(calculateInterestRate(selectedBank))}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Rata miesięczna:</span>
                  <span className="ml-1 font-medium">
                    {formatMoney(calculateMonthlyPayment(loanAmount, calculateInterestRate(selectedBank), loanTerm))}
                  </span>
                </div>
                <div className="text-sm col-span-2">
                  <span className="text-gray-600">Całkowity koszt kredytu:</span>
                  <span className="ml-1 font-medium text-red-600">
                    {formatMoney(calculateMonthlyPayment(loanAmount, calculateInterestRate(selectedBank), loanTerm) * loanTerm - loanAmount)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={takeLoan}
                variant="success"
                className="flex-1"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Zaciągnij kredyt
              </Button>
              
              <Button
                onClick={() => setSelectedBank(null)}
                variant="secondary"
                className="flex-1"
              >
                Anuluj
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-4">Wybierz bank, aby zaciągnąć kredyt:</p>
            
            <div className="space-y-3">
              {banks.map(renderBank)}
            </div>
          </div>
        )}
      </div>
      
      {/* Statystyki finansowe */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-3 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
          Statystyki finansowe
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-700">Łączne inwestycje:</span>
            <span className="font-medium">{formatMoney(player.economicMetrics.totalInvestment || 0)}</span>
          </div>
          
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-700">Łączne kredyty:</span>
            <span className="font-medium">{formatMoney(player.economicMetrics.totalLoansTaken || 0)}</span>
          </div>
          
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-700">Średni ROI:</span>
            <span className={`font-medium ${(player.economicMetrics.avgROI || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {((player.economicMetrics.avgROI || 0) * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-700">Bilans:</span>
            <span className={`font-medium ${(player.economicMetrics.totalRevenue || 0) > (player.economicMetrics.totalExpenses || 0) ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney((player.economicMetrics.totalRevenue || 0) - (player.economicMetrics.totalExpenses || 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePanel; 