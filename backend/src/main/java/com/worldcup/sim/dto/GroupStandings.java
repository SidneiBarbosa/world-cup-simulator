package com.worldcup.sim.dto;

import com.worldcup.sim.model.Team;
import java.util.List;

public record GroupStandings(String groupId, List<TeamStats> teams) {}
