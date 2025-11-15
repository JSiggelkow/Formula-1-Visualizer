-- Drop all custom indexes created in define_indexes.sql

-- === Indexes for Basic Feature #1: get_drivers ===
ALTER TABLE drivers DROP INDEX idx_drivers_forename_surname;
ALTER TABLE drivers DROP INDEX idx_drivers_surname;

-- === Indexes for Basic Feature #2: get_driver_race_results ===
ALTER TABLE results DROP INDEX idx_results_driver_race;

-- === Indexes for Basic Feature #3: get_race_wins ===
ALTER TABLE races DROP INDEX idx_races_year;
ALTER TABLE results DROP INDEX idx_results_positionText;

-- === Indexes for Basic Feature #4: get_fastest_laps ===
ALTER TABLE lap_times DROP INDEX idx_laptimes_raceId_ms;
ALTER TABLE races DROP INDEX idx_races_circuitId_raceId;
