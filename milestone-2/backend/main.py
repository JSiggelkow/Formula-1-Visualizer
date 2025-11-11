import mysql.connector
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from consts import *

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_conn():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,  # TODO: don't use root user for the actual app
        password=MYSQL_PASSWORD,
        port=MYSQL_PORT,
        database=PROD_DB_NAME
    )

    # Basic Feature #1
@app.get("/driver")
def get_drivers(forename: str = None, surname: str = None, driver_id: int = None):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    query = f"SELECT * FROM drivers WHERE 1=1"  # We can also think about using an B*-Tree index on forename und surname
    if forename:
        query += f" AND forename = '{forename}'"  # We can also use the LIKE operator here, but this could slow done the query
    if surname:
        query += f" AND surname = '{surname}'"
    if driver_id:
        query += f" AND driverId = {driver_id}"
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

    # Basic Feature #2
@app.get("/driver-race-results")
def get_driver_race_results(driver_id: int):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    query = """
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
        LEFT JOIN driver_teammate_pairs dtp # uses a view that has all driver_teammate_pairs for every race
            ON dtp.raceId = r.raceId 
            AND dtp.driver_id = r.driverId
        WHERE r.driverId = %s
        ORDER BY ra.year DESC, ra.round DESC
    """
    cursor.execute(query, (driver_id,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

    # Basic Feature #3
@app.get("/race-wins")
def get_race_wins(year: int = None):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    query = (f"SELECT drivers.forename, drivers.surname, COUNT(results.positionText) AS wins "
             f"FROM results JOIN drivers ON drivers.driverId = results.driverId "
             f"JOIN races ON races.raceId = results.raceId "
             f"WHERE races.year = {year} "
             f"AND results.positionText = '1' "
             f"GROUP BY drivers.forename, drivers.surname")
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Basic Feature #4
@app.get("/fastest-lap")
def get_fastest_laps(race_id: int = None, circuit_id: int = None):
    if race_id is None and circuit_id is None:
        return {"error": "Either race_id or circuit_id must be provided"}
    if race_id is not None and circuit_id is not None:
        return {"error": "Only one of race_id or circuit_id can be provided, not both"}

    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)

    if race_id is not None:
        query = """
            SELECT CONCAT(d.forename, ' ', d.surname) AS driver_name,
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
            WHERE lt.raceId = %s
            AND lt.milliseconds = (
                    SELECT MIN(milliseconds)
                    FROM lap_times
                    WHERE raceId = %s
                )
                """
        cursor.execute(query, (race_id, race_id))
    else:
        query = """
            SELECT CONCAT(d.forename, ' ', d.surname) AS driver_name,
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
            WHERE c.circuitId = %s
            AND lt.milliseconds = (
                    SELECT MIN(lt2.milliseconds)
                    FROM lap_times lt2
                    JOIN races r2 ON r2.raceId = lt2.raceId
                    WHERE r2.circuitId = %s
                )
                """
        cursor.execute(query, (circuit_id, circuit_id))

    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results
