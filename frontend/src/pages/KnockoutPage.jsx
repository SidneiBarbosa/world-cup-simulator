import { useState, useEffect } from 'react'; // <--- Remove "React,"
import axios from 'axios';

const KnockoutPage = () => {
  // Mock data to prevent crash if backend is empty
  const [rounds, setRounds] = useState({
    "R32": [],
    "R16": [],
    "QF": [],
    "SF": [],
    "FINAL": []
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    // In a real scenario, fetch this from: axios.get('/api/sim/bracket');
    // For now, we initialize a simple structure
    const initialR32 = [
      { id: '1', teamA: { name: 'Brazil' }, teamB: { name: 'TBD' }, winner: null, nextMatchId: '9' },
      { id: '2', teamA: { name: 'France' }, teamB: { name: 'Poland' }, winner: null, nextMatchId: '9' },
      { id: '3', teamA: { name: 'Argentina' }, teamB: { name: 'Mexico' }, winner: null, nextMatchId: '10' },
      { id: '4', teamA: { name: 'England' }, teamB: { name: 'USA' }, winner: null, nextMatchId: '10' },
    ];
    
    // Initialize empty slots for next rounds
    const initialR16 = [
      { id: '9', teamA: { name: 'Winner 1' }, teamB: { name: 'Winner 2' }, winner: null, nextMatchId: '13' },
      { id: '10', teamA: { name: 'Winner 3' }, teamB: { name: 'Winner 4' }, winner: null, nextMatchId: '13' }
    ];

    setRounds(prev => ({ ...prev, R32: initialR32, R16: initialR16 }));
  }, []);

  const handleMatchClick = (match, roundKey) => {
    if (match.winner) return; // Already played
    setSelectedMatch({ ...match, roundKey });
    setModalOpen(true);
  };

  const advanceTeam = (team) => {
    // 1. Mark winner in current match
    const currentRoundKey = selectedMatch.roundKey;
    const updatedCurrentRound = rounds[currentRoundKey].map(m => 
      m.id === selectedMatch.id ? { ...m, winner: team } : m
    );

    // 2. Propagate to next match
    let nextRoundKey = "";
    if (currentRoundKey === "R32") nextRoundKey = "R16";
    else if (currentRoundKey === "R16") nextRoundKey = "QF";

    let updatedNextRound = [...rounds[nextRoundKey]];
    
    if (selectedMatch.nextMatchId && rounds[nextRoundKey]) {
      updatedNextRound = rounds[nextRoundKey].map(m => {
        if (m.id === selectedMatch.nextMatchId) {
          // Determine if we are updating Team A or Team B slot
          // Simple logic: If match ID is odd/even or based on index. 
          // For this MVP, we just fill the first "Winner" slot we find.
          const isTeamA = m.teamA.name.startsWith("Winner");
          return {
            ...m,
            teamA: isTeamA ? team : m.teamA,
            teamB: !isTeamA ? team : m.teamB
          };
        }
        return m;
      });
    }

    setRounds(prev => ({
      ...prev,
      [currentRoundKey]: updatedCurrentRound,
      [nextRoundKey]: updatedNextRound || []
    }));
    setModalOpen(false);
  };

  // --- UI Components ---
  const MatchBox = ({ match, round }) => (
    <div 
      onClick={() => handleMatchClick(match, round)}
      className={`
        border-2 rounded p-2 mb-4 w-48 bg-white shadow-sm cursor-pointer transition-all
        ${match.winner ? 'border-green-500 opacity-75' : 'border-gray-300 hover:border-blue-500'}
      `}
    >
      <div className={`p-1 flex justify-between ${match.winner === match.teamA ? 'font-bold text-green-700' : ''}`}>
        <span>{match.teamA?.name || 'TBD'}</span>
      </div>
      <div className="border-t my-1"></div>
      <div className={`p-1 flex justify-between ${match.winner === match.teamB ? 'font-bold text-green-700' : ''}`}>
        <span>{match.teamB?.name || 'TBD'}</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 overflow-x-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-10">Knockout Stage</h1>
      
      <div className="flex flex-row gap-12 justify-center">
        {/* Round of 32 */}
        <div className="flex flex-col justify-around">
            <h3 className="text-center font-bold mb-4 text-gray-500">Round of 32</h3>
            {rounds.R32.map(m => <MatchBox key={m.id} match={m} round="R32" />)}
        </div>

        {/* Connector Lines (Visual Only - Simplified) */}
        <div className="w-8 border-r-2 border-dashed border-gray-300 h-full mt-20"></div>

        {/* Round of 16 */}
        <div className="flex flex-col justify-around">
            <h3 className="text-center font-bold mb-4 text-gray-500">Round of 16</h3>
            {rounds.R16.map(m => <MatchBox key={m.id} match={m} round="R16" />)}
        </div>
      </div>

      {/* Simple Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Who wins?</h2>
            <button 
              onClick={() => advanceTeam(selectedMatch.teamA)}
              className="w-full bg-blue-600 text-white p-2 mb-2 rounded hover:bg-blue-700"
            >
              {selectedMatch.teamA.name}
            </button>
            <button 
              onClick={() => advanceTeam(selectedMatch.teamB)}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {selectedMatch.teamB.name}
            </button>
            <button onClick={() => setModalOpen(false)} className="mt-4 text-sm text-gray-500 underline w-full text-center">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnockoutPage;