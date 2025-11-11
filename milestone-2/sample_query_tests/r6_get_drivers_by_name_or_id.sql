-- Basic Feature #1: Get drivers by forename, surname, or driver_id

-- Get all drivers with the forename 'Mark'
SELECT * FROM drivers 
WHERE forename = 'Mark';

-- Get driver with driverId 17
SELECT * FROM drivers 
WHERE driverId = 17;
