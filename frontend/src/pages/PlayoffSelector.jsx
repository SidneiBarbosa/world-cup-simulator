import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Flag from '../components/Flag.jsx';

const PlayoffSelector = () => {
  const navigate = useNavigate();
  
  const playoffPaths = [
    {
      id: "EUA", name: "Europe A", target: "Group B",
      teams: [
        { iso: "ITA", name: "Italy" }, { iso: "NIR", name: "N. Ireland" },
        { iso: "WAL", name: "Wales" }, { iso: "BIH", name: "Bosnia" }
      ]
    },
    {
      id: "EUB", name: "Europe B", target: "Group F",
      teams: [
        { iso: "UKR", name: "Ukraine" }, { iso: "SWE", name: "Sweden" },
        { iso: "POL", name: "Poland" }, { iso: "ALB", name: "Albania" }
      ]
    },
    {
      id: "EUC", name: "Europe C", target: "Group D",
      teams: [
        { iso: "TUR", name: "Turkey" }, { iso: "ROU", name: "Romania" },
        { iso: "SVK", name: "Slovakia" }, { iso: "KOS", name: "Kosovo" }
      ]
    },
    {
      id: "EUD", name: "Europe D", target: "Group A",
      teams: [
        { iso: "CZE", name: "Czechia" }, { iso: "IRL", name: "Ireland" },
        { iso: "DEN", name: "Denmark" }, { iso: "MKD", name: "N. Macedonia" }
      ]
    },
    {
      id: "IC1", name: "Intercontinental 1", target: "Group K",
      teams: [
        { iso: "COD", name: "DR Congo" }, { iso: "JAM", name: "Jamaica" },
        { iso: "NCL", name: "New Caledonia" }
      ]
    },
    {
      id: "IC2", name: "Intercontinental 2", target: "Group I",
      teams: [
        { iso: "BOL", name: "Bolivia" }, { iso: "SUR", name: "Suriname" },
        { iso: "IRQ", name: "Iraq" }
      ]
    }
  ];

  const [selections, setSelections] = useState({});

  const handleSelect = (pathId, iso) => {
    setSelections(prev => ({ ...prev, [pathId]: iso }));
  };

  const confirmSelection = async () => {
    if (Object.keys(selections).length < playoffPaths.length) {
      alert("Please select a winner for every playoff path!");
      return;
    }

    const sessionId = localStorage.getItem('sim_session_id');
    if (!sessionId) {
        alert("Session ID missing. Please refresh the page.");
        return;
    }

    try {
      // Loop through selections and save to Redis via Backend
      for (const [pathId, winnerIso] of Object.entries(selections)) {
        await axios.post('https://world-cup-simulator-pied.vercel.app/api/sim/playoffs/resolve', {
            placeholderIso: pathId,
            winnerIso: winnerIso
        }, {
            headers: { 'X-Session-ID': sessionId } 
        });
      }
      alert("Playoff Selections Saved to Session!");
      navigate('/groups');
    } catch (e) {
      console.error(e);
      alert("Failed to save selections. Is the backend running?");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Playoff Qualifiers</h1>
      <p className="text-center text-gray-500 mb-10">Select the winners to complete your personal bracket.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playoffPaths.map((path) => (
          <div key={path.id} className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-lg text-blue-700">{path.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    To {path.target}
                </span>
            </div>
            
            <div className="space-y-2">
              {path.teams.map((team) => (
                <label 
                    key={team.iso} 
                    className={`flex items-center p-3 rounded cursor-pointer border transition-all
                    ${selections[path.id] === team.iso 
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                        : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <input 
                    type="radio" 
                    name={path.id} 
                    value={team.iso}
                    onChange={() => handleSelect(path.id, team.iso)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex items-center gap-2">
                      <Flag isoCode={team.iso} className="w-6 h-4 shadow-sm" />
                      <span className="font-medium text-gray-700">{team.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button 
            onClick={confirmSelection}
            className="bg-green-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-green-700 font-bold text-xl transition-transform transform hover:scale-105"
        >
            Confirm & Go to Groups
        </button>
      </div>
    </div>
  );
};

export default PlayoffSelector;