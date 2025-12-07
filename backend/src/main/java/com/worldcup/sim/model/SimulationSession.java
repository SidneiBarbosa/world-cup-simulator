package com.worldcup.sim.model;

import com.worldcup.sim.dto.GroupStandings;

import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class SimulationSession implements Serializable {
    private String sessionId;
    private List<MatchResult> matchInputs = new ArrayList<>(); // User's scores
    private List<GroupStandings> standings = new ArrayList<>(); // Calculated tables
    private Map<String, Team> bracketPicks = new HashMap<>(); // User's bracket choices
    private Map<String, String> replacements = new HashMap<>();
}