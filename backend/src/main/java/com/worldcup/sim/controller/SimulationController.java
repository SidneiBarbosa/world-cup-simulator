package com.worldcup.sim.controller;

import com.worldcup.sim.model.*; // Import all models
import com.worldcup.sim.repository.*;
import com.worldcup.sim.service.TournamentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sim")
@CrossOrigin(origins = "*")
public class SimulationController {

    private final TournamentService service;
    private final TeamRepository teamRepo;
    private final NationalTeamGroupRepository groupRepo;
    private final MatchScheduleRepository scheduleRepo;

    public SimulationController(TournamentService service, TeamRepository teamRepo, 
                                NationalTeamGroupRepository groupRepo, MatchScheduleRepository scheduleRepo) {
        this.service = service;
        this.teamRepo = teamRepo;
        this.groupRepo = groupRepo;
        this.scheduleRepo = scheduleRepo;
    }

    @GetMapping("/start")
    public Map<String, String> startSession() {
        return Map.of("sessionId", UUID.randomUUID().toString());
    }

    // UPDATED: Now requires Session ID to know WHICH user is asking
    @GetMapping("/groups")
    public Map<String, Object> getGroupsData(@RequestHeader(value = "X-Session-ID", required = false) String sessionId) {
        
        // 1. Load the "Template" Groups from DB (Contains Placeholders like 'EUA')
        List<NationalTeamGroup> rawList = groupRepo.findAllByOrderByGroupIdAscPlacementAsc();

        // 2. If User has a session, apply their specific replacements
        if (sessionId != null) {
            SimulationSession session = service.getSession(sessionId);
            Map<String, String> userSwaps = session.getReplacements();

            // Loop through DB list and swap teams in MEMORY (not DB)
            for (NationalTeamGroup groupEntry : rawList) {
                String currentIso = groupEntry.getTeamIso();
                if (userSwaps.containsKey(currentIso)) {
                    String realTeamIso = userSwaps.get(currentIso);
                    
                    // Fetch real team details to populate name/flag
                    Team realTeam = teamRepo.findById(realTeamIso).orElse(null);
                    
                    // Swap the data just for this response
                    groupEntry.setTeamIso(realTeamIso);
                    groupEntry.setTeamDetails(realTeam);
                }
            }
        }

        // 3. Group and Return
        Map<String, List<NationalTeamGroup>> groups = rawList.stream()
                .collect(Collectors.groupingBy(NationalTeamGroup::getGroupId));

        List<MatchSchedule> schedule = scheduleRepo.findAllByOrderByMatchDateAscMatchTimeAsc();

        return Map.of("groups", groups, "schedule", schedule);
    }

    @PostMapping("/update-groups")
    public SimulationSession updateGroups(
            @RequestHeader("X-Session-ID") String sessionId,
            @RequestBody List<MatchResult> matches) {
        return service.updateMatches(sessionId, matches);
    }

    // UPDATED: Saves to Redis, NOT SQL
    @PostMapping("/playoffs/resolve")
    public ResponseEntity<String> resolvePlayoff(
            @RequestHeader("X-Session-ID") String sessionId, 
            @RequestBody Map<String, String> payload) {
        
        String placeholder = payload.get("placeholderIso");
        String winner = payload.get("winnerIso");
        
        System.out.println("Session " + sessionId + ": Swapping " + placeholder + " with " + winner);

        // Save to Redis Session
        service.addReplacement(sessionId, placeholder, winner);
        
        return ResponseEntity.ok("Saved to Session");
    }
}