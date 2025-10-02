CREATE TABLE drivers (
    driverId INT PRIMARY KEY,
    code VARCHAR(3),
    forename VARCHAR(64) NOT NULL,
    surname VARCHAR(64) NOT NULL,
    dob DATE,
    nationality VARCHAR(64)
);

CREATE TABLE constructors (
    constructorId INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(64)
);

CREATE TABLE circuits (
    circuitId INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(64),
    country VARCHAR(64)
);

CREATE TABLE races (
    raceId INT PRIMARY KEY,
    year YEAR,
    round INT,
    circuitId INT NOT NULL,
    name VARCHAR(255),
    date DATE,
    FOREIGN KEY (circuitId) REFERENCES circuits(circuitId)
);

CREATE TABLE status (
    statusId INT PRIMARY KEY,
    status VARCHAR(64)
);

CREATE TABLE results (
    resultId INT PRIMARY KEY,
    raceId INT NOT NULL,
    driverId INT NOT NULL,
    constructorId INT NOT NULL,
    grid INT,
    positionText VARCHAR(2),
    points INT,
    statusId INT,
    FOREIGN KEY (raceId) REFERENCES races(raceId),
    FOREIGN KEY (driverId) REFERENCES drivers(driverId),
    FOREIGN KEY (constructorId) REFERENCES constructors(constructorId),
    FOREIGN KEY (statusId) REFERENCES status(statusId)
);
