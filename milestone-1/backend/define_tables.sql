-- the individual race drivers
CREATE TABLE drivers (
    driverId INT PRIMARY KEY,
    code VARCHAR(3),                -- identifier (e.g HAM for Lewis Hamilton)
    forename VARCHAR(64) NOT NULL,
    surname VARCHAR(64) NOT NULL,
    dob DATE,
    nationality VARCHAR(64)
);

-- the teams that the drivers race for
CREATE TABLE constructors (
    constructorId INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(64)
);

-- info on the different circuits, which Grand Prix (races) take place at
CREATE TABLE circuits (
    circuitId INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(64),
    country VARCHAR(64)
);

-- individual Grand Prixs
CREATE TABLE races (
    raceId INT PRIMARY KEY,
    year YEAR,
    round INT,              -- round 1 is first race of the year, 2 is second, etc.
    circuitId INT NOT NULL,
    name VARCHAR(255),
    date DATE,
    FOREIGN KEY (circuitId) REFERENCES circuits(circuitId)
);

-- status codes give added context to results (e.g. Finished, Disqualified, Collision)
CREATE TABLE status (
    statusId INT PRIMARY KEY,
    status VARCHAR(64) NOT NULL
);

-- individual race results, specific to a certain driver and race
CREATE TABLE results (
    resultId INT PRIMARY KEY,
    raceId INT NOT NULL,
    driverId INT NOT NULL,
    constructorId INT NOT NULL,
    grid INT,                   -- starting grid position
    positionText VARCHAR(2),    -- finishing position, either numeric or char which stands for:
                                -- D(isqualified), E(xcluded), F(ailed to qualify), N(ot classified), R(etired), W(ithdrawn)
    points INT,                 -- points awarded to driver
    statusId INT,               -- special status code for more context on result (see status table)
    FOREIGN KEY (raceId) REFERENCES races(raceId),
    FOREIGN KEY (driverId) REFERENCES drivers(driverId),
    FOREIGN KEY (constructorId) REFERENCES constructors(constructorId),
    FOREIGN KEY (statusId) REFERENCES status(statusId)
);

-- exact timing for individual laps
CREATE TABLE lap_times (
    raceId INT,
    driverId INT,
    lap INT,            -- lap number
    time VARCHAR(16),   -- formatted time "1:38.109"
    milliseconds FLOAT, -- total milliseconds
    PRIMARY KEY (raceId, driverId, lap)
);
