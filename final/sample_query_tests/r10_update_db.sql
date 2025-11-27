-- Basic Feature #5: Update DB with latest race information
-- NOTE: for these tests, dummy data is used. Real implementation gets data via API call

-- Output before insert
SELECT * FROM drivers
ORDER BY driverId DESC
LIMIT 3;

SELECT * FROM constructors
ORDER BY constructorId DESC
LIMIT 3;

SELECT * FROM circuits
ORDER BY circuitId DESC
LIMIT 3;

SELECT * FROM races
ORDER BY raceId DESC
LIMIT 3;

SELECT * FROM results
ORDER BY resultId DESC
LIMIT 3;

-- Inserts
-- insert new driver
INSERT INTO drivers (driverRef, code, forename, surname, dob, nationality, about)
VALUES ('new_driver', 'NWD', 'new', 'driver','2000-01-01', 'Canadian', 'This is a new driver added for testing purposes.');
-- insert new constructor
INSERT INTO constructors (constructorRef, name, nationality, colorPrimary, colorSecondary)
VALUES ('new_ctor', 'New Constructor', 'Canadian', "#FFFFFF", "#000000");
-- insert new circuit
INSERT INTO circuits (circuitRef, name, city, country, lat, lng)
VALUES ('ring_rd', 'Ring Road', 'Waterloo', 'Ontario', 99.9, -10.0);
-- insert new race
INSERT INTO races (year, round, circuitId, name, date)
VALUES (2026, 1, 1, 'Waterloo Grand Prix', '2025-12-12');
-- insert new result
INSERT INTO results (raceId, driverId, constructorId, grid, 
                    positionText, points, statusId)
VALUES (18,1,1,1,'1',25,1);

-- Output after insert
SELECT * FROM drivers
ORDER BY driverId DESC
LIMIT 3;

SELECT * FROM constructors
ORDER BY constructorId DESC
LIMIT 3;

SELECT * FROM circuits
ORDER BY circuitId DESC
LIMIT 3;

SELECT * FROM races
ORDER BY raceId DESC
LIMIT 3;

SELECT * FROM results
ORDER BY resultId DESC
LIMIT 3;