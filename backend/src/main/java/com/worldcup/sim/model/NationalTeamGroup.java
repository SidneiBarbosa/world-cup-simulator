package com.worldcup.sim.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "national_teams_groups")
@Data
@NoArgsConstructor
public class NationalTeamGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_iso")
    private String teamIso;

    @Column(name = "group_id")
    private String groupId;

    @Column(name = "placement")
    private String placement;

    // Relationship to Team
    @OneToOne
    @JoinColumn(name = "team_iso", referencedColumnName = "iso_code", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Team teamDetails;
}