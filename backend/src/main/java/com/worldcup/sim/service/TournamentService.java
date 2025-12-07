package com.worldcup.sim.service;

import com.worldcup.sim.dto.GroupStandings;
import com.worldcup.sim.dto.TeamStats;
import com.worldcup.sim.model.MatchResult;
import com.worldcup.sim.model.SimulationSession;
import com.worldcup.sim.model.Team;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class TournamentService {

    private final RedisTemplate<String, Object> redisTemplate;

    public TournamentService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public SimulationSession getSession(String sessionId) {
        String key = "sim:" + sessionId;
        SimulationSession session = (SimulationSession) redisTemplate.opsForValue().get(key);
        if (session == null) {
            session = new SimulationSession();
            session.setSessionId(sessionId);
            redisTemplate.opsForValue().set(key, session, 24, TimeUnit.HOURS);
        }
        return session;
    }

    // NEW METHOD: Adds a replacement (e.g. EUA -> ITA) to the session
    public void addReplacement(String sessionId, String placeholder, String winner) {
        SimulationSession session = getSession(sessionId);
        if (session.getReplacements() == null) {
            session.setReplacements(new HashMap<>());
        }
        session.getReplacements().put(placeholder, winner);
        
        // Save update to Redis
        redisTemplate.opsForValue().set("sim:" + sessionId, session);
    }

    public SimulationSession updateMatches(String sessionId, List<MatchResult> matches) {
        SimulationSession session = getSession(sessionId);
        session.setMatchInputs(matches);
        
        List<GroupStandings> standings = calculateGroupStageLogic(matches);
        session.setStandings(standings);
        
        redisTemplate.opsForValue().set("sim:" + sessionId, session);
        return session;
    }

    private List<GroupStandings> calculateGroupStageLogic(List<MatchResult> matches) {
        Map<String, Map<String, TeamStats>> groupMap = new HashMap<>();

        for (MatchResult match : matches) {
            String currentGroup = match.getGroupId();
            if (currentGroup == null || currentGroup.isEmpty()) currentGroup = "Unknown";
            processMatchStats(groupMap, currentGroup, match.getTeamA(), match.getTeamB(), match.getScoreA(), match.getScoreB());
        }

        List<GroupStandings> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, TeamStats>> entry : groupMap.entrySet()) {
            List<TeamStats> teams = new ArrayList<>(entry.getValue().values());
            Collections.sort(teams); 
            result.add(new GroupStandings(entry.getKey(), teams));
        }
        result.sort(Comparator.comparing(GroupStandings::groupId));
        return result;
    }
    
    private void processMatchStats(Map<String, Map<String, TeamStats>> groupMap, String groupId, String teamA, String teamB, int scoreA, int scoreB) {
        groupMap.putIfAbsent(groupId, new HashMap<>());
        Map<String, TeamStats> stats = groupMap.get(groupId);

        stats.putIfAbsent(teamA, new TeamStats(new Team(teamA, teamA, "N/A", 0.0), 0, 0, 0, 0));
        stats.putIfAbsent(teamB, new TeamStats(new Team(teamB, teamB, "N/A", 0.0), 0, 0, 0, 0));

        TeamStats sA = stats.get(teamA);
        TeamStats sB = stats.get(teamB);

        int ptsA = 0, ptsB = 0;
        if (scoreA > scoreB) ptsA = 3;
        else if (scoreB > scoreA) ptsB = 3;
        else { ptsA = 1; ptsB = 1; }

        stats.put(teamA, new TeamStats(sA.team(), sA.points() + ptsA, sA.goalDiff() + (scoreA - scoreB), sA.goalsScored() + scoreA, 0));
        stats.put(teamB, new TeamStats(sB.team(), sB.points() + ptsB, sB.goalDiff() + (scoreB - scoreA), sB.goalsScored() + scoreB, 0));
    }
}