import React from 'react';
import { usePlayerContext } from "../../store/PlayerContext";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ChevronRight } from "lucide-react";
import Button from "../ui/Button";

const CompanyFinances = ({ openFinancePanel }) => {
  const { state: player } = usePlayerContext();
  
  // Formatowanie kwoty
  const formatMoney = (amount) => {
    return amount.toLocaleString() + ' PLN';
  };
  
  // Statystki finansowe
  const financialStats = {
    cash: player.cash,
    totalInvestment: player.economicMetrics.totalInvestment || 0,
    totalRevenue: player.economicMetrics.totalRevenue || 0,
    totalExpenses: player.economicMetrics.totalExpenses || 0,
    avgROI: player.economicMetrics.avgROI || 0,
    projectsValue: player.economicMetrics.projectsValue || 0,
    balance: (player.economicMetrics.totalRevenue || 0) - (player.economicMetrics.totalExpenses || 0),
    hasLoans: player.loans && player.loans.length > 0,
    totalLoansAmount: player.loans?.reduce((sum, loan) => sum + loan.remainingAmount, 0) || 0,
  };
  
  return (
    <div className="space-y-6">
      {/* Sekcja główna */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Finanse firmy</h2>
          <Button 
            variant="primary" 
            icon={<CreditCard />}
            onClick={openFinancePanel}
          >
            Kredyty i finansowanie
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <div className="text-sm text-blue-600">Gotówka</div>
            <div className="text-xl font-bold">{formatMoney(financialStats.cash)}</div>
          </div>
          
          <div className="p-4 bg-green-50 rounded">
            <div className="text-sm text-green-600">Całkowite przychody</div>
            <div className="text-xl font-bold">{formatMoney(financialStats.totalRevenue)}</div>
          </div>
          
          <div className="p-4 bg-red-50 rounded">
            <div className="text-sm text-red-600">Całkowite wydatki</div>
            <div className="text-xl font-bold">{formatMoney(financialStats.totalExpenses)}</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded">
            <div className="text-sm text-purple-600">Bilans</div>
            <div className={`text-xl font-bold ${financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(financialStats.balance)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Przychody i koszty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-green-100 mr-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-bold text-lg">Przychody</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Sprzedaż projektów</span>
              <span className="font-medium">{formatMoney(financialStats.totalRevenue)}</span>
            </div>
            
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Wartość projektów</span>
              <span className="font-medium">{formatMoney(financialStats.projectsValue)}</span>
            </div>
            
            {/* Tu można dodać więcej kategorii przychodów */}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-red-100 mr-3">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-bold text-lg">Wydatki</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Inwestycje w projekty</span>
              <span className="font-medium">{formatMoney(financialStats.totalInvestment)}</span>
            </div>
            
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Koszty personelu</span>
              <span className="font-medium">
                {formatMoney(
                  Object.values(player.staff).flat().reduce((sum, staff) => sum + (staff.salary || 0), 0)
                )}
              </span>
            </div>
            
            {financialStats.hasLoans && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Kredyty i pożyczki</span>
                <span className="font-medium">{formatMoney(financialStats.totalLoansAmount)}</span>
              </div>
            )}
            
            {player.illegals.totalBribes > 0 && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Wydatki szarej strefy</span>
                <span className="font-medium">{formatMoney(player.illegals.totalBribes)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Aktywne kredyty */}
      {player.loans && player.loans.length > 0 && (
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg">Aktywne kredyty</h3>
            </div>
            
            <button 
              onClick={openFinancePanel}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>Zarządzaj</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {player.loans.map(loan => (
              <div key={loan.id} className="border p-3 rounded">
                <div className="flex justify-between mb-1">
                  <strong>{loan.bankName}</strong>
                  <span>{formatMoney(loan.remainingAmount)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Pozostało {loan.remainingTerm} rat po {formatMoney(loan.monthlyPayment)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Wskaźniki finansowe */}
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Wskaźniki finansowe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Średni ROI</div>
            <div className={`text-xl font-medium ${financialStats.avgROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(financialStats.avgROI * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Wartość aktywów</div>
            <div className="text-xl font-medium">
              {formatMoney(financialStats.cash + financialStats.projectsValue)}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Zobowiązania</div>
            <div className="text-xl font-medium">
              {formatMoney(financialStats.totalLoansAmount)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Więcej wskaźników i narzędzi finansowych dostępnych w panelu finansowym.
        </div>
      </div>
    </div>
  );
};

export default CompanyFinances; 