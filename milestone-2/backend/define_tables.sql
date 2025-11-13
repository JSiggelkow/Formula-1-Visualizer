-- the individual race drivers
CREATE TABLE drivers (
    driverId INT PRIMARY KEY AUTO_INCREMENT,
    driverRef VARCHAR(64) UNIQUE NOT NULL,   -- unique string used to match results from FastF1 API
    code VARCHAR(3),                         -- identifier (e.g HAM for Lewis Hamilton)
    forename VARCHAR(64) NOT NULL,
    surname VARCHAR(64) NOT NULL,
    dob DATE NOT NULL,
    nationality VARCHAR(64) NOT NULL
);

-- the teams that the drivers race for
CREATE TABLE constructors (
    constructorId INT PRIMARY KEY AUTO_INCREMENT,
    constructorRef VARCHAR(64) UNIQUE NOT NULL, -- unique string used to match results from FastF1 API
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(64) NOT NULL
);

-- info on the different circuits, which Grand Prix (races) take place at
CREATE TABLE circuits (
    circuitId INT PRIMARY KEY AUTO_INCREMENT,
    circuitRef VARCHAR(64) UNIQUE NOT NULL, -- unique string used to match results from FastF1 API
    name VARCHAR(255) NOT NULL,
    city VARCHAR(64) NOT NULL,
    country VARCHAR(64) NOT NULL,
    lat FLOAT(10, 6) NOT NULL, -- latitude
    lng FLOAT(10, 6) NOT NULL  -- longitude
);

-- individual Grand Prixs
CREATE TABLE races (
    raceId INT PRIMARY KEY AUTO_INCREMENT,
    year YEAR NOT NULL,
    round INT NOT NULL,              -- round 1 is first race of the year, 2 is second, etc.
    circuitId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    UNIQUE (year, round),            -- no two races can be the same round of the same year
    FOREIGN KEY (circuitId) REFERENCES circuits(circuitId)
);

-- status codes give added context to results (e.g. Finished, Disqualified, Collision)
CREATE TABLE status (
    statusId INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(64) UNIQUE NOT NULL
);

-- individual race results, specific to a certain driver and race
CREATE TABLE results (
    resultId INT PRIMARY KEY AUTO_INCREMENT,
    raceId INT NOT NULL,
    driverId INT NOT NULL,
    constructorId INT NOT NULL,
    grid INT NOT NULL,                   -- starting grid position
    positionText VARCHAR(2) NOT NULL,    -- finishing position, either numeric or char which stands for:
                                         -- D(isqualified), E(xcluded), F(ailed to qualify), N(ot classified), R(etired), W(ithdrawn)
    points INT NOT NULL,                 -- points awarded to driver
    statusId INT NOT NULL,               -- special status code for more context on result (see status table)
    FOREIGN KEY (raceId) REFERENCES races(raceId),
    FOREIGN KEY (driverId) REFERENCES drivers(driverId),
    FOREIGN KEY (constructorId) REFERENCES constructors(constructorId),
    FOREIGN KEY (statusId) REFERENCES status(statusId)
);

-- exact timing for individual laps
CREATE TABLE lap_times (
    raceId INT NOT NULL,
    driverId INT NOT NULL,
    lap INT NOT NULL,            -- lap number
    time VARCHAR(16) NOT NULL,   -- formatted time e.g. "1:38.109"
    milliseconds INT NOT NULL,   -- total milliseconds e.g. 98109
    PRIMARY KEY (raceId, driverId, lap)
);