-- Basic Feature #4: Get fastest lap for a specific race or circuit

-- Query by race_id (specific race)
SELECT 
    CONCAT(d.forename, ' ', d.surname) AS driver_name,
    lt.lap,
    lt.time,
    lt.milliseconds,
    r.name AS race_name,
    r.year,
    r.date,
    c.name AS circuit_name,
    c.city AS circuit_city,
    c.country AS circuit_country
FROM lap_times lt
JOIN drivers d ON d.driverId = lt.driverId
JOIN races r ON r.raceId = lt.raceId
JOIN circuits c ON c.circuitId = r.circuitId
WHERE lt.raceId = 18  -- 2008 Australian Grand Prix
AND lt.milliseconds = (
    SELECT MIN(milliseconds)
    FROM lap_times
    WHERE raceId = 18
);
