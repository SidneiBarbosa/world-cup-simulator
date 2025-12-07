package com.worldcup.sim.dto;

import com.worldcup.sim.model.Team;

public record TeamStats(Team team, int points, int goalDiff, int goalsScored, int fairPlayPoints) implements Comparable<TeamStats> {
    
    @Override
    public int compareTo(TeamStats other) {
        // 1. Points (Higher is better)
        if (this.points != other.points) {
            return other.points - this.points;
        }
        // 2. Goal Difference (Higher is better)
        if (this.goalDiff != other.goalDiff) {
            return other.goalDiff - this.goalDiff;
        }
        // 3. Goals Scored (Higher is better)
        if (this.goalsScored != other.goalsScored) {
            return other.goalsScored - this.goalsScored;
        }
        // 4. Fair Play (Higher is better, e.g., -1 is better than -5)
        return other.fairPlayPoints - this.fairPlayPoints;
    }
}