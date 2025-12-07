package com.worldcup.sim.dto;

import lombok.Data;
import java.util.List;

@Data
public class SimulationRequest {
    private List<GroupStandings> groups;
    private boolean manualMode;
}
