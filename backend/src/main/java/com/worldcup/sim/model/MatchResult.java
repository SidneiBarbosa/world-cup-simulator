package com.worldcup.sim.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class MatchResult {
    @JsonProperty("groupId")
    private String groupId;
    private String teamA;
    private String teamB;
    private int scoreA;
    private int scoreB;
    private boolean isKnockout;
}
