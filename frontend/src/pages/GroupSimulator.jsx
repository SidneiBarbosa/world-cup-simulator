import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamFlag from '../components/TeamFlag.jsx';

const GroupSimulator = () => {
  const [dbGroups, setDbGroups] = useState({});
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionId = localStorage.getItem('sim_session_id');
        const res = await axios.get('http://localhost:8080/api/sim/groups', {
            headers: { 'X-Session-ID': sessionId } 
        });
        
        const groupsData = res.data.groups || {};
        const scheduleData = res.data.schedule || [];

        setDbGroups(groupsData);
        generateMatchList(groupsData, scheduleData);
        generateZeroStandings(groupsData);
        setLoading(false);
      } catch (err) {
        console.error("Backend Error:", err);
        setError("Could not connect to Backend at http://localhost:8080");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
        const timer = setTimeout(() => { simulate(); }, 300); 
        return () => clearTimeout(timer);
    }
  }, [matches]);

  const generateZeroStandings = (groupsData) => {
    if (!groupsData) return;
    const initialStandings = Object.keys(groupsData).sort().map(groupId => {
      const rawTeams = groupsData[groupId] || [];
      const sortedTeams = [...rawTeams].sort((a, b) => 
        (a.teamDetails?.name || "").localeCompare(b.teamDetails?.name || "")
      );
      return {
        groupId: groupId,
        teams: sortedTeams.map(t => ({
          team: { name: t.teamDetails?.name || "TBD", isoCode: t.teamDetails?.isoCode || "?" },
          points: 0, goalDiff: 0, goalsScored: 0
        }))
      };
    });
    setStandings(initialStandings);
  };

  const generateMatchList = (groupsData, scheduleData) => {
    if (!groupsData || !scheduleData) return;
    const newMatches = scheduleData.map(fixture => {
        const groupTeams = groupsData[fixture.groupId] || [];
        const teamAObj = groupTeams.find(t => t.placement === fixture.teamAPlaceholder)?.teamDetails;
        const teamBObj = groupTeams.find(t => t.placement === fixture.teamBPlaceholder)?.teamDetails;

        return {
            id: fixture.id,
            matchNumber: fixture.matchNumber,
            groupId: fixture.groupId,
            venue: fixture.venue,
            date: fixture.matchDate,
            time: fixture.matchTime,
            // Use ISO Code for Display
            teamA: teamAObj?.isoCode || '?', nameA: teamAObj?.name || 'TBD',
            teamB: teamBObj?.isoCode || '?', nameB: teamBObj?.name || 'TBD',
            scoreA: '', scoreB: ''
        };
    });
    setMatches(newMatches);
  };

  const handleScoreChange = (groupId, matchIndexInGroup, field, value) => {
    const updated = [...matches];
    const groupMatchesIndices = updated
        .map((m, i) => ({ ...m, originalIndex: i }))
        .filter(m => m.groupId === groupId);
    const targetMatch = groupMatchesIndices[matchIndexInGroup];
    if (!targetMatch) return;

    let cleanValue = value;
    if (value !== '' && parseInt(value) < 0) cleanValue = '0';
    updated[targetMatch.originalIndex][field] = cleanValue;
    setMatches(updated);
  };

  const simulate = async () => {
    const sessionId = localStorage.getItem('sim_session_id');
    if (!sessionId) return;
    const activeMatches = matches.filter(m => m.scoreA !== '' && m.scoreB !== '');
    const payload = activeMatches.map(m => ({
        groupId: m.groupId,
        teamA: m.teamA, teamB: m.teamB,
        scoreA: parseInt(m.scoreA), scoreB: parseInt(m.scoreB)
    }));

    try {
        const res = await axios.post('http://localhost:8080/api/sim/update-groups', payload, {
            headers: { 'X-Session-ID': sessionId }
        });
        setStandings(prevStandings => {
            const newStandings = [...prevStandings];
            res.data.standings.forEach(updatedGroup => {
                const groupIdx = newStandings.findIndex(g => g.groupId === updatedGroup.groupId);
                if (groupIdx !== -1) {
                    const existingGroupTeams = newStandings[groupIdx].teams;
                    const mergedTeams = existingGroupTeams.map(existingTeam => {
                        const freshStats = updatedGroup.teams.find(t => t.team.isoCode === existingTeam.team.isoCode);
                        return freshStats || { ...existingTeam, points: 0, goalDiff: 0, goalsScored: 0 };
                    });
                    mergedTeams.sort((a, b) => {
                        if (b.points !== a.points) return b.points - a.points;
                        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
                        if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;
                        return a.team.name.localeCompare(b.team.name);
                    });
                    newStandings[groupIdx] = { ...newStandings[groupIdx], teams: mergedTeams };
                }
            });
            return newStandings;
        });
    } catch (e) { console.error(e); }
  };

  const randomizeAll = () => {
    const updated = matches.map(m => ({
      ...m, scoreA: Math.floor(Math.random() * 4), scoreB: Math.floor(Math.random() * 4)
    }));
    setMatches(updated);
  };

  if (loading) return <div className="p-20 text-center text-xl">Loading...</div>;
  if (error) return <div className="p-20 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">FIFA World Cup Simulator</h1>
        <button onClick={randomizeAll} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 font-semibold">
            Auto-Fill
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {Object.keys(dbGroups || {}).sort().map(groupId => {
            const groupTable = standings.find(s => s.groupId === groupId);
            const groupMatches = matches.filter(m => m.groupId === groupId);
            if (!groupTable) return null;

            return (
                <div key={groupId} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-gray-800">Group {groupId}</h2>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{groupMatches.length} Matches</span>
                    </div>

                    <div className="flex flex-col md:flex-row h-72">
                        {/* LEFT: TABLE */}
                        <div className="md:w-1/2 border-r border-gray-100 p-4 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="text-left py-2 pl-2">Team</th>
                                        <th className="text-center w-8">Pts</th>
                                        <th className="text-center w-8">GD</th>
                                        <th className="text-center w-8">GF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupTable.teams.map((t, i) => (
                                        <tr key={i} className={`border-b last:border-0 ${i < 2 ? 'bg-green-50/70' : ''}`}>
                                            <td className="py-2 pl-2 font-semibold text-gray-700 flex items-center gap-2">
                                                <span className={`w-5 h-5 flex items-center justify-center text-[10px] rounded-full ${i < 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                    {i+1}
                                                </span>
                                                <TeamFlag isoCode={t.team.isoCode} className="w-5 h-3.5" />
                                                <span className="truncate w-24">{t.team.name}</span>
                                            </td>
                                            <td className="text-center font-bold text-black">{t.points}</td>
                                            <td className="text-center text-gray-500">{t.goalDiff}</td>
                                            <td className="text-center text-gray-500">{t.goalsScored}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* RIGHT: MATCHES */}
                        <div className="md:w-1/2 p-4 bg-gray-50/30 overflow-y-auto">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider sticky top-0 bg-gray-50/30 backdrop-blur-sm z-10 pb-2">Schedule</h3>
                            <div className="space-y-3">
                                {groupMatches.map((m, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                                        <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold mb-2 border-b pb-1">
                                            <span>{m.date} • {m.time ? m.time.substring(0,5) : ''}</span>
                                            <span className="truncate max-w-[150px]">{m.venue}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {/* Team A (3 Letters) */}
                                            <div className="w-20 text-right font-bold text-gray-700 flex items-center justify-end gap-2">
                                                {m.teamA} <TeamFlag isoCode={m.teamA} className="w-5 h-3.5" />
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <input type="number" min="0" placeholder="-" className="w-8 h-7 text-center border rounded font-bold text-sm"
                                                    value={m.scoreA} onChange={(e) => handleScoreChange(groupId, idx, 'scoreA', e.target.value)} />
                                                <span className="text-gray-300 text-xs">—</span>
                                                <input type="number" min="0" placeholder="-" className="w-8 h-7 text-center border rounded font-bold text-sm"
                                                    value={m.scoreB} onChange={(e) => handleScoreChange(groupId, idx, 'scoreB', e.target.value)} />
                                            </div>

                                            {/* Team B (3 Letters) */}
                                            <div className="w-20 text-left font-bold text-gray-700 flex items-center justify-start gap-2">
                                                <TeamFlag isoCode={m.teamB} className="w-5 h-3.5" /> {m.teamB}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default GroupSimulator;