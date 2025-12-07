package com.worldcup.sim.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "match_schedule")
@Data
@NoArgsConstructor
public class MatchSchedule {
    @Id
    private Long id;

    @Column(name = "match_number")
    private Integer matchNumber;

    @Column(name = "group_id")
    private String groupId;

    @Column(name = "team_a_placeholder")
    private String teamAPlaceholder; // e.g. "C1"

    @Column(name = "team_b_placeholder")
    private String teamBPlaceholder; // e.g. "C2"

    private String venue;
    
    @Column(name = "match_date")
    private LocalDate matchDate;

    @Column(name = "match_time")
    private LocalTime matchTime;
}