-- =============================================
-- 1. DROP EXISTING TABLES (Clean Slate)
-- =============================================
DROP TABLE IF EXISTS national_teams_groups CASCADE;
DROP TABLE IF EXISTS playoff_teams CASCADE;
DROP TABLE IF EXISTS national_teams CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- =============================================
-- 2. CREATE TABLES
-- =============================================

-- Table: Groups
CREATE TABLE groups (
    id CHAR(1) PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

-- Table: National Teams
CREATE TABLE national_teams (
    iso_code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    confederation VARCHAR(10),
    strength DECIMAL(5, 2) DEFAULT 50.0
);

-- Table: National Teams Groups (With new 'placement' column)
CREATE TABLE national_teams_groups (
    id SERIAL PRIMARY KEY,
    team_iso VARCHAR(3) NOT NULL,
    group_id CHAR(1) NOT NULL,
    placement VARCHAR(3) NOT NULL, -- Stores 'C1', 'C2', etc.
    FOREIGN KEY (team_iso) REFERENCES national_teams(iso_code),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    UNIQUE (team_iso),
    UNIQUE (group_id, placement) -- Ensures no two teams have 'C1' in the same group
);

-- Table: Playoff Teams (Bracket Slots)
CREATE TABLE playoff_teams (
    match_id VARCHAR(10) PRIMARY KEY,
    round_name VARCHAR(20),
    home_slot_desc VARCHAR(50),
    away_slot_desc VARCHAR(50)
);

-- =============================================
-- 3. INSERT DATA (Group C Only)
-- =============================================

-- Insert Group C
INSERT INTO groups (id, name) VALUES ('C', 'Group C');

-- Insert National Teams (Only the 4 requested)
INSERT INTO national_teams (iso_code, name, confederation, strength) VALUES
('BRA', 'Brazil', 'CONMEBOL', 90.0),
('MAR', 'Morocco', 'CAF', 83.0),
('HAI', 'Haiti', 'CONCACAF', 65.0),
('SCO', 'Scotland', 'UEFA', 74.0);

-- Insert Mapping with Placement (C1, C2, C3, C4)
INSERT INTO national_teams_groups (team_iso, group_id, placement) VALUES
('BRA', 'C', 'C1'),
('MAR', 'C', 'C2'),
('HAI', 'C', 'C3'),
('SCO', 'C', 'C4');

-- Insert Basic Playoff Bracket Structure (Empty for now, ready for usage)
INSERT INTO playoff_teams (match_id, round_name, home_slot_desc, away_slot_desc) VALUES
('R32_1', 'Round of 32', 'Winner Group C', '3rd Place Group A/B/F'),
('R32_2', 'Round of 32', 'Runner-up Group C', 'Runner-up Group A');