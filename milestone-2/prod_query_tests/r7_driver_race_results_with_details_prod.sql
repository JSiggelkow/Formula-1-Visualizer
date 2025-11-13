-- Basic Feature #2: Get driver's race results with circuit, constructor, and teammate info

SELECT
    r.driverId,
    r.raceId,
    r.points, 
    r.grid, 
    r.positionText,
    ra.year, 
    ra.round,
    c.name AS circuit_name, 
    c.city, 
    c.country,
    con.name AS constructor_name,
    CONCAT(dtp.teammate_forename, ' ', dtp.teammate_surname) AS teammate
FROM results r
JOIN races ra ON ra.raceId = r.raceId
JOIN circuits c ON c.circuitId = ra.circuitId
JOIN constructors con ON con.constructorId = r.constructorId
LEFT JOIN driver_teammate_pairs dtp 
    ON dtp.raceId = r.raceId 
    AND dtp.driver_id = r.driverId
WHERE r.driverId = 1  -- Lewis Hamilton
ORDER BY ra.year DESC, ra.round DESC;
