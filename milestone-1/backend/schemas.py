from pydantic import BaseModel
from typing import List, Optional

# this is not used right now, revisit after figuring out if it acc helps to use pydantic
# also figure out if its better to use for user inputs instead of query results

class Driver(BaseModel):
    driverId: int
    driverRef: str
    number: Optional[int] = None
    code: Optional[str] = None
    forename: str
    surname: str
    dob: str
    nationality: str
    url: str


class DriverRaceResults(BaseModel):
    # Results table fields
    points: Optional[float] = None
    grid: Optional[int] = None
    positionText: Optional[str] = None
    # Race table fields
    year: int
    round: int
    # Circuit table fields
    circuit_name: str
    city: str
    country: str
    # Constructor table fields
    constructor_name: str
    # Teammate info
    teammate_name: Optional[str] = None

class RaceWins(BaseModel):
    forename: str
    surname: str
    wins: int

