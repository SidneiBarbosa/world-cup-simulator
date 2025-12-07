package com.worldcup.sim.repository;

import com.worldcup.sim.model.NationalTeamGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NationalTeamGroupRepository extends JpaRepository<NationalTeamGroup, Long> {
    
    // Standard sorting
    List<NationalTeamGroup> findAllByOrderByGroupIdAscPlacementAsc();

    // NEW: Simple finder to locate the placeholder (e.g., "EUA")
    NationalTeamGroup findByTeamIso(String teamIso);
}