CREATE VIEW driver_teammate_pairs AS
SELECT
    r1.raceId,
    r1.constructorId,
    r1.driverId AS driver_id,
    d1.code AS driver_code,
    d1.forename AS driver_forename,
    d1.surname AS driver_surname,
    r2.driverId AS teammate_id,
    d2.code AS teammate_code,
    d2.forename AS teammate_forename,
    d2.surname AS teammate_surname,
    d2.dob AS teammate_dob,
    d2.nationality AS teammate_nationality
FROM results r1
JOIN drivers d1 ON d1.driverId = r1.driverId
LEFT JOIN results r2
    ON r2.raceId = r1.raceId
    AND r2.constructorId = r1.constructorId
    AND r2.driverId != r1.driverId
LEFT JOIN drivers d2 ON d2.driverId = r2.driverId;