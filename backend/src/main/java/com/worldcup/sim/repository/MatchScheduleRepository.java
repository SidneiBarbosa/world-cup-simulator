package com.worldcup.sim.repository;

import com.worldcup.sim.model.MatchSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MatchScheduleRepository extends JpaRepository<MatchSchedule, Long> {
    List<MatchSchedule> findAllByOrderByMatchDateAscMatchTimeAsc();
}