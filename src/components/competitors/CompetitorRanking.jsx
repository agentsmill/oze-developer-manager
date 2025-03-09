import React from "react";

const CompetitorRanking = ({ ranking }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-bold text-lg mb-3">Ranking deweloperów OZE</h3>
      
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-center p-2">Miejsce</th>
            <th className="text-left p-2">Firma</th>
            <th className="text-center p-2">Moc RTB</th>
            <th className="text-center p-2">Portfel projektów</th>
            <th className="text-right p-2">Udział w rynku</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {ranking.map((company, index) => {
            const isPlayer = company.id === "player";
            const marketShare = (company.rtbPower / ranking.reduce((sum, c) => sum + c.rtbPower, 0) * 100).toFixed(1);
            
            return (
              <tr key={company.id} className={`${isPlayer ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <td className="text-center p-2 font-medium">{index + 1}</td>
                <td className="p-2">
                  {isPlayer ? (
                    <div className="font-bold text-blue-600">{company.name}</div>
                  ) : (
                    company.name
                  )}
                </td>
                <td className="text-center p-2">{company.rtbPower.toLocaleString()} MW</td>
                <td className="text-center p-2">{company.power.toLocaleString()} MW</td>
                <td className="text-right p-2">
                  <div className="flex items-center justify-end">
                    <div>{marketShare}%</div>
                    <div className="ml-2 w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isPlayer ? 'bg-blue-500' : 'bg-gray-500'}`} 
                        style={{width: `${marketShare}%`}}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompetitorRanking; 