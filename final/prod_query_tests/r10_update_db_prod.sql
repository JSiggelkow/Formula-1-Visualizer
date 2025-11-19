-- ============================================================
-- Basic Feature #5 Test File: 200 Inserts 
-- 40 drivers, 40 constructors, 40 circuits, 40 races, 40 results
-- ============================================================

-- Output BEFORE insert
SELECT * FROM drivers ORDER BY driverId DESC LIMIT 200;
SELECT * FROM constructors ORDER BY constructorId DESC LIMIT 200;
SELECT * FROM circuits ORDER BY circuitId DESC LIMIT 200;
SELECT * FROM races ORDER BY raceId DESC LIMIT 200;
SELECT * FROM results ORDER BY resultId DESC LIMIT 200;

-- ============================================================
-- 1. INSERT DRIVERS (40 rows)
-- ============================================================
INSERT INTO drivers (driverRef, code, forename, surname, dob, nationality) VALUES
('test_driver_1',  'T01', 'Forename1', 'Surname1', '1990-01-01', 'Country'),
('test_driver_2',  'T02', 'Forename2', 'Surname2', '1990-01-02', 'Country'),
('test_driver_3',  'T03', 'Forename3', 'Surname3', '1990-01-03', 'Country'),
('test_driver_4',  'T04', 'Forename4', 'Surname4', '1990-01-04', 'Country'),
('test_driver_5',  'T05', 'Forename5', 'Surname5', '1990-01-05', 'Country'),
('test_driver_6',  'T06', 'Forename6', 'Surname6', '1990-01-06', 'Country'),
('test_driver_7',  'T07', 'Forename7', 'Surname7', '1990-01-07', 'Country'),
('test_driver_8',  'T08', 'Forename8', 'Surname8', '1990-01-08', 'Country'),
('test_driver_9',  'T09', 'Forename9', 'Surname9', '1990-01-09', 'Country'),
('test_driver_10', 'T10', 'Forename10','Surname10','1990-01-10','Country'),
('test_driver_11', 'T11', 'Forename11','Surname11','1990-01-11','Country'),
('test_driver_12', 'T12', 'Forename12','Surname12','1990-01-12','Country'),
('test_driver_13', 'T13', 'Forename13','Surname13','1990-01-13','Country'),
('test_driver_14', 'T14', 'Forename14','Surname14','1990-01-14','Country'),
('test_driver_15', 'T15', 'Forename15','Surname15','1990-01-15','Country'),
('test_driver_16', 'T16', 'Forename16','Surname16','1990-01-16','Country'),
('test_driver_17', 'T17', 'Forename17','Surname17','1990-01-17','Country'),
('test_driver_18', 'T18', 'Forename18','Surname18','1990-01-18','Country'),
('test_driver_19', 'T19', 'Forename19','Surname19','1990-01-19','Country'),
('test_driver_20', 'T20', 'Forename20','Surname20','1990-01-20','Country'),
('test_driver_21', 'T21', 'Forename21','Surname21','1990-01-21','Country'),
('test_driver_22', 'T22', 'Forename22','Surname22','1990-01-22','Country'),
('test_driver_23', 'T23', 'Forename23','Surname23','1990-01-23','Country'),
('test_driver_24', 'T24', 'Forename24','Surname24','1990-01-24','Country'),
('test_driver_25', 'T25', 'Forename25','Surname25','1990-01-25','Country'),
('test_driver_26', 'T26', 'Forename26','Surname26','1990-01-26','Country'),
('test_driver_27', 'T27', 'Forename27','Surname27','1990-01-27','Country'),
('test_driver_28', 'T28', 'Forename28','Surname28','1990-01-28','Country'),
('test_driver_29', 'T29', 'Forename29','Surname29','1990-01-29','Country'),
('test_driver_30', 'T30', 'Forename30','Surname30','1990-01-30','Country'),
('test_driver_31', 'T31', 'Forename31','Surname31','1990-01-31','Country'),
('test_driver_32', 'T32', 'Forename32','Surname32','1990-02-01','Country'),
('test_driver_33', 'T33', 'Forename33','Surname33','1990-02-02','Country'),
('test_driver_34', 'T34', 'Forename34','Surname34','1990-02-03','Country'),
('test_driver_35', 'T35', 'Forename35','Surname35','1990-02-04','Country'),
('test_driver_36', 'T36', 'Forename36','Surname36','1990-02-05','Country'),
('test_driver_37', 'T37', 'Forename37','Surname37','1990-02-06','Country'),
('test_driver_38', 'T38', 'Forename38','Surname38','1990-02-07','Country'),
('test_driver_39', 'T39', 'Forename39','Surname39','1990-02-08','Country'),
('test_driver_40', 'T40', 'Forename40','Surname40','1990-02-09','Country');

-- ============================================================
-- 2. INSERT CONSTRUCTORS (40 rows)
-- ============================================================
INSERT INTO constructors (constructorRef, name, nationality) VALUES
('test_ctor_1',  'Constructor1', 'Country'),
('test_ctor_2',  'Constructor2', 'Country'),
('test_ctor_3',  'Constructor3', 'Country'),
('test_ctor_4',  'Constructor4', 'Country'),
('test_ctor_5',  'Constructor5', 'Country'),
('test_ctor_6',  'Constructor6', 'Country'),
('test_ctor_7',  'Constructor7', 'Country'),
('test_ctor_8',  'Constructor8', 'Country'),
('test_ctor_9',  'Constructor9', 'Country'),
('test_ctor_10', 'Constructor10','Country'),
('test_ctor_11', 'Constructor11','Country'),
('test_ctor_12', 'Constructor12','Country'),
('test_ctor_13', 'Constructor13','Country'),
('test_ctor_14', 'Constructor14','Country'),
('test_ctor_15', 'Constructor15','Country'),
('test_ctor_16', 'Constructor16','Country'),
('test_ctor_17', 'Constructor17','Country'),
('test_ctor_18', 'Constructor18','Country'),
('test_ctor_19', 'Constructor19','Country'),
('test_ctor_20', 'Constructor20','Country'),
('test_ctor_21', 'Constructor21','Country'),
('test_ctor_22', 'Constructor22','Country'),
('test_ctor_23', 'Constructor23','Country'),
('test_ctor_24', 'Constructor24','Country'),
('test_ctor_25', 'Constructor25','Country'),
('test_ctor_26', 'Constructor26','Country'),
('test_ctor_27', 'Constructor27','Country'),
('test_ctor_28', 'Constructor28','Country'),
('test_ctor_29', 'Constructor29','Country'),
('test_ctor_30', 'Constructor30','Country'),
('test_ctor_31', 'Constructor31','Country'),
('test_ctor_32', 'Constructor32','Country'),
('test_ctor_33', 'Constructor33','Country'),
('test_ctor_34', 'Constructor34','Country'),
('test_ctor_35', 'Constructor35','Country'),
('test_ctor_36', 'Constructor36','Country'),
('test_ctor_37', 'Constructor37','Country'),
('test_ctor_38', 'Constructor38','Country'),
('test_ctor_39', 'Constructor39','Country'),
('test_ctor_40', 'Constructor40','Country');

-- ============================================================
-- 3. INSERT CIRCUITS (40 rows)
-- ============================================================
INSERT INTO circuits (circuitRef, name, city, country, lat, lng) VALUES
('test_circuit_1', 'Circuit1',  'City1',  'Country', 1.1, 1.1),
('test_circuit_2', 'Circuit2',  'City2',  'Country', 2.2, 2.2),
('test_circuit_3', 'Circuit3',  'City3',  'Country', 3.3, 3.3),
('test_circuit_4', 'Circuit4',  'City4',  'Country', 4.4, 4.4),
('test_circuit_5', 'Circuit5',  'City5',  'Country', 5.5, 5.5),
('test_circuit_6', 'Circuit6',  'City6',  'Country', 6.6, 6.6),
('test_circuit_7', 'Circuit7',  'City7',  'Country', 7.7, 7.7),
('test_circuit_8', 'Circuit8',  'City8',  'Country', 8.8, 8.8),
('test_circuit_9', 'Circuit9',  'City9',  'Country', 9.9, 9.9),
('test_circuit_10','Circuit10', 'City10', 'Country', 10.1, 10.1),
('test_circuit_11','Circuit11', 'City11', 'Country', 11.1, 11.1),
('test_circuit_12','Circuit12', 'City12', 'Country', 12.1, 12.1),
('test_circuit_13','Circuit13', 'City13', 'Country', 13.1, 13.1),
('test_circuit_14','Circuit14', 'City14', 'Country', 14.1, 14.1),
('test_circuit_15','Circuit15', 'City15', 'Country', 15.1, 15.1),
('test_circuit_16','Circuit16', 'City16', 'Country', 16.1, 16.1),
('test_circuit_17','Circuit17', 'City17', 'Country', 17.1, 17.1),
('test_circuit_18','Circuit18', 'City18', 'Country', 18.1, 18.1),
('test_circuit_19','Circuit19', 'City19', 'Country', 19.1, 19.1),
('test_circuit_20','Circuit20', 'City20', 'Country', 20.1, 20.1),
('test_circuit_21','Circuit21', 'City21', 'Country', 21.1, 21.1),
('test_circuit_22','Circuit22', 'City22', 'Country', 22.1, 22.1),
('test_circuit_23','Circuit23', 'City23', 'Country', 23.1, 23.1),
('test_circuit_24','Circuit24', 'City24', 'Country', 24.1, 24.1),
('test_circuit_25','Circuit25', 'City25', 'Country', 25.1, 25.1),
('test_circuit_26','Circuit26', 'City26', 'Country', 26.1, 26.1),
('test_circuit_27','Circuit27', 'City27', 'Country', 27.1, 27.1),
('test_circuit_28','Circuit28', 'City28', 'Country', 28.1, 28.1),
('test_circuit_29','Circuit29', 'City29', 'Country', 29.1, 29.1),
('test_circuit_30','Circuit30', 'City30', 'Country', 30.1, 30.1),
('test_circuit_31','Circuit31', 'City31', 'Country', 31.1, 31.1),
('test_circuit_32','Circuit32', 'City32', 'Country', 32.1, 32.1),
('test_circuit_33','Circuit33', 'City33', 'Country', 33.1, 33.1),
('test_circuit_34','Circuit34', 'City34', 'Country', 34.1, 34.1),
('test_circuit_35','Circuit35', 'City35', 'Country', 35.1, 35.1),
('test_circuit_36','Circuit36', 'City36', 'Country', 36.1, 36.1),
('test_circuit_37','Circuit37', 'City37', 'Country', 37.1, 37.1),
('test_circuit_38','Circuit38', 'City38', 'Country', 38.1, 38.1),
('test_circuit_39','Circuit39', 'City39', 'Country', 39.1, 39.1),
('test_circuit_40','Circuit40', 'City40', 'Country', 40.1, 40.1);

-- ============================================================
-- 4. INSERT RACES (40 rows)
-- ============================================================
INSERT INTO races (year, round, circuitId, name, date) VALUES
(2030, 1, 1, 'Race1', '2030-01-01'),
(2030, 2, 2, 'Race2', '2030-01-02'),
(2030, 3, 3, 'Race3', '2030-01-03'),
(2030, 4, 4, 'Race4', '2030-01-04'),
(2030, 5, 5, 'Race5', '2030-01-05'),
(2030, 6, 6, 'Race6', '2030-01-06'),
(2030, 7, 7, 'Race7', '2030-01-07'),
(2030, 8, 8, 'Race8', '2030-01-08'),
(2030, 9, 9, 'Race9', '2030-01-09'),
(2030, 10, 10, 'Race10', '2030-01-10'),
(2030, 11, 11, 'Race11', '2030-01-11'),
(2030, 12, 12, 'Race12', '2030-01-12'),
(2030, 13, 13, 'Race13', '2030-01-13'),
(2030, 14, 14, 'Race14', '2030-01-14'),
(2030, 15, 15, 'Race15', '2030-01-15'),
(2030, 16, 16, 'Race16', '2030-01-16'),
(2030, 17, 17, 'Race17', '2030-01-17'),
(2030, 18, 18, 'Race18', '2030-01-18'),
(2030, 19, 19, 'Race19', '2030-01-19'),
(2030, 20, 20, 'Race20', '2030-01-20'),
(2030, 21, 21, 'Race21', '2030-01-21'),
(2030, 22, 22, 'Race22', '2030-01-22'),
(2030, 23, 22, 'Race23', '2030-01-23'),
(2030, 24, 24, 'Race24', '2030-01-24'),
(2030, 25, 25, 'Race25', '2030-01-25'),
(2030, 26, 26, 'Race26', '2030-01-26'),
(2030, 27, 27, 'Race27', '2030-01-27'),
(2030, 28, 28, 'Race28', '2030-01-28'),
(2030, 29, 29, 'Race29', '2030-01-29'),
(2030, 30, 30, 'Race30', '2030-01-30'),
(2030, 31, 31, 'Race31', '2030-01-31'),
(2030, 32, 32, 'Race32', '2030-02-01'),
(2030, 33, 33, 'Race33', '2030-02-02'),
(2030, 34, 34, 'Race34', '2030-02-03'),
(2030, 35, 35, 'Race35', '2030-02-04'),
(2030, 36, 36, 'Race36', '2030-02-05'),
(2030, 37, 37, 'Race37', '2030-02-06'),
(2030, 38, 38, 'Race38', '2030-02-07'),
(2030, 39, 39, 'Race39', '2030-02-08'),
(2030, 40, 40, 'Race40', '2030-02-09');

-- ============================================================
-- 5. INSERT RESULTS (40 rows)
-- ============================================================
INSERT INTO results (raceId, driverId, constructorId, grid, positionText, points, statusId) VALUES
(1, 1, 1, 1, '1', 25, 1),
(2, 2, 2, 1, '1', 25, 1),
(3, 3, 3, 1, '1', 25, 1),
(4, 4, 4, 1, '1', 25, 1),
(5, 5, 5, 1, '1', 25, 1),
(6, 6, 6, 1, '1', 25, 1),
(7, 7, 7, 1, '1', 25, 1),
(8, 8, 8, 1, '1', 25, 1),
(9, 9, 9, 1, '1', 25, 1),
(10, 10, 10, 1, '1', 25, 1),
(11, 11, 11, 1, '1', 25, 1),
(12, 12, 12, 1, '1', 25, 1),
(13, 13, 13, 1, '1', 25, 1),
(14, 14, 14, 1, '1', 25, 1),
(15, 15, 15, 1, '1', 25, 1),
(16, 16, 16, 1, '1', 25, 1),
(17, 17, 17, 1, '1', 25, 1),
(18, 18, 18, 1, '1', 25, 1),
(19, 19, 19, 1, '1', 25, 1),
(20, 20, 20, 1, '1', 25, 1),
(21, 21, 21, 1, '1', 25, 1),
(22, 22, 22, 1, '1', 25, 1),
(23, 23, 23, 1, '1', 25, 1),
(24, 24, 24, 1, '1', 25, 1),
(25, 25, 25, 1, '1', 25, 1),
(26, 26, 26, 1, '1', 25, 1),
(27, 27, 27, 1, '1', 25, 1),
(28, 28, 28, 1, '1', 25, 1),
(29, 29, 29, 1, '1', 25, 1),
(30, 30, 30, 1, '1', 25, 1),
(31, 31, 31, 1, '1', 25, 1),
(32, 32, 32, 1, '1', 25, 1),
(33, 33, 33, 1, '1', 25, 1),
(34, 34, 34, 1, '1', 25, 1),
(35, 35, 35, 1, '1', 25, 1),
(36, 36, 36, 1, '1', 25, 1),
(37, 37, 37, 1, '1', 25, 1),
(38, 38, 38, 1, '1', 25, 1),
(39, 39, 39, 1, '1', 25, 1),
(40, 40, 40, 1, '1', 25, 1);

-- Output AFTER insert
SELECT * FROM drivers ORDER BY driverId DESC LIMIT 200;
SELECT * FROM constructors ORDER BY constructorId DESC LIMIT 200;
SELECT * FROM circuits ORDER BY circuitId DESC LIMIT 200;
SELECT * FROM races ORDER BY raceId DESC LIMIT 200;
SELECT * FROM results ORDER BY resultId DESC LIMIT 200;