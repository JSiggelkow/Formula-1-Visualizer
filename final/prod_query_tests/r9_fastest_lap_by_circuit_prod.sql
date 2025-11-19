-- Basic Feature #4: Get fastest lap for a specific race or circuit

-- Query by circuit_id (fastest across all races at this circuit)
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
WHERE c.circuitId = 2  -- Sepang International Circuit
AND lt.milliseconds = (
    SELECT MIN(lt2.milliseconds)
    FROM lap_times lt2
    JOIN races r2 ON r2.raceId = lt2.raceId
    WHERE r2.circuitId = 2
);
