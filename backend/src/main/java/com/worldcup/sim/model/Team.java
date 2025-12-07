package com.worldcup.sim.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "national_teams") // <--- THIS WAS MISSING
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Team {

    @Id
    @Column(name = "iso_code") // Ensure this matches DB column
    private String isoCode;

    private String name;
    private String confederation;
    private Double strength;
}