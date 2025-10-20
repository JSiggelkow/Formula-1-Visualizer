-- Basic Feature #3: Get race wins by drivers for a specific year

SELECT 
    drivers.forename, 
    drivers.surname, 
    COUNT(results.positionText) AS wins 
FROM results 
JOIN drivers ON drivers.driverId = results.driverId 
JOIN races ON races.raceId = results.raceId 
WHERE races.year = 2008  -- 2008 season
AND results.positionText = '1' 
GROUP BY drivers.forename, drivers.surname
ORDER BY wins DESC;
