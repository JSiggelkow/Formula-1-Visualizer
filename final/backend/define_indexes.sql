-- === Indexes for Basic Feature #1: get_drivers ===

-- Optimizes queries filtering by both forename AND surname together.
CREATE INDEX idx_drivers_forename_surname ON drivers (forename, surname);

-- Optimizes queries filtering only by surname.
CREATE INDEX idx_drivers_surname ON drivers (surname);

-- === Indexes for Basic Feature #2: get_driver_race_results ===

-- Optimizes the query's join plan by covering the filter on `driverId` and the `raceId` join key
CREATE INDEX idx_results_driver_race ON results (driverId, raceId);

-- === Indexes for Basic Feature #3: get_race_wins ===

-- Speeds up filtering by a specific year (WHERE races.year = ...).
CREATE INDEX idx_races_year ON races (year);

-- Speeds up filtering for first-place finishes (WHERE results.positionText = '1').
CREATE INDEX idx_results_positionText ON results (positionText);

-- === Indexes for Basic Feature #4: get_fastest_laps ===

-- This is a covering index for the subquery that finds the fastest lap for a given race.
CREATE INDEX idx_laptimes_raceId_ms ON lap_times (raceId, milliseconds);

-- This is a covering index for the subquery that finds all races for a specific circuit.
CREATE INDEX idx_races_circuitId_raceId ON races (circuitId, raceId);

-- === Indexes for Advanced Feature #1: natural_language_driver_queries ===

-- Composite full-text index for searching across basic driver fields and bio content
CREATE FULLTEXT INDEX idx_fulltext ON drivers (code, forename, surname, nationality, about);
