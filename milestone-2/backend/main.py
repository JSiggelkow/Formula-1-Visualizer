import mysql.connector
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
from fastf1.ergast import Ergast
from datetime import timedelta
import logging

from consts import *

logging.disable(logging.CRITICAL) # silence logs from external API calls

app = FastAPI(debug=True)

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

# Basic Feature #5
# Looks up what the most recent race is in the DB, then attempts to get info for the next race
#   - just one race at a time for now, because updating many at a time can be expensive
@app.get("/get-next-race")
def update_latest_race() -> dict[str, int]:
    rows_added = {
        "year": 0,
        "round": 0,
        "circuits_added": 0,
        "races_added": 0,
        "drivers_added": 0,
        "constructors_added": 0,
        "results_added": 0,
        "status_added": 0,
        "laptimes_added": 0
    }

    driver_code_to_id = {} # conversion table used when inserting lap_times

    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)

    # first, find most recent race in DB
    cursor.execute("""
        SELECT year, round
        FROM races
        ORDER BY year DESC, round DESC
        LIMIT 1
    """)

    latest_race = cursor.fetchone()
    latest_year = latest_race['year']
    latest_round = latest_race['round']

    ergast_api = Ergast()

    # check if there is another race in the same season
    year = latest_year
    round = latest_round + 1
    race_data = ergast_api.get_race_results(season=year, round=round, result_type='raw')

    # otherwise, move to first round of next season
    if not race_data:
        year = latest_year + 1
        round = 1
        race_data = ergast_api.get_race_results(season=year, round=round, result_type='raw')

    # if not available, no update
    if not race_data:
        return rows_added

    race_data = race_data[0]
    rows_added['year'] = year
    rows_added['round'] = round

    # look up circuit by circuitId (api) witch matches circuitRef (our db)
    # check if circuit exists in DB
    circuit_data = race_data['Circuit']
    cursor.execute("SELECT circuitId FROM circuits WHERE circuitRef = %s", 
                   (circuit_data['circuitId'],))
    res = cursor.fetchone()

    # if circuit does not exist in DB, insert it
    if not res:
        cursor.execute("""
            INSERT INTO circuits (circuitRef, name, city, country, lat, lng)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            circuit_data['circuitId'],
            circuit_data['circuitName'],
            circuit_data['Location']['locality'],
            circuit_data['Location']['country'],
            circuit_data['Location']['lat'],
            circuit_data['Location']['long']
        ))
        conn.commit()
        rows_added['circuits_added'] += 1
        circuit_id = cursor.lastrowid  # new circuit ID generated from insert
    else:
        circuit_id = res['circuitId'] # circuit ID that already exists in DB
    
    # insert new race
    cursor.execute("""
        INSERT INTO races (year, round, circuitId, name, date)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        year,
        round,
        circuit_id,
        race_data['raceName'],
        race_data['date']
    ))
    conn.commit()
    rows_added['races_added'] += 1
    race_id = cursor.lastrowid  # new raceID generated from insert

    # insert data from each result
    for result_data in race_data['Results']:

        # check if driver exists in DB, if not insert
        driver_data = result_data['Driver']
        cursor.execute("SELECT driverId FROM drivers WHERE driverRef = %s",
                       (driver_data['driverId'],))
        res = cursor.fetchone()

        # if driver does not exist in DB, insert them
        if not res:
            cursor.execute("""
                INSERT INTO drivers (driverRef, code, forename, surname, dob, nationality)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                driver_data['driverId'],
                driver_data['code'],
                driver_data['givenName'],
                driver_data['familyName'],
                driver_data['dateOfBirth'],
                driver_data['nationality'],
            ))
            conn.commit()
            rows_added['drivers_added'] += 1
            driver_id = cursor.lastrowid  # new driver ID generated from insert
        else:
            driver_id = res['driverId'] # driver ID that already exists in DB

        driver_code_to_id[driver_data['code']] = driver_id # store result to use when inserting laptimes

        # check if ctor exists in DB, if not insert
        ctor_data = result_data['Constructor']
        cursor.execute("SELECT constructorId FROM constructors WHERE constructorRef = %s", 
                       (ctor_data['constructorId'],))
        res = cursor.fetchone()

        # if ctor does not exist in DB, insert them
        if not res:
            cursor.execute("""
                INSERT INTO constructors (constructorRef, name, nationality)
                VALUES (%s, %s, %s)
            """, (
                ctor_data['constructorId'],
                ctor_data['name'],
                ctor_data['nationality'],
            ))
            conn.commit()
            rows_added['constructors_added'] += 1
            ctor_id = cursor.lastrowid  # new ID generated from insert
        else:
            ctor_id = res['constructorId'] # ctor ID that already exists in DB
        

        # check if status exists in DB, if not insert
        cursor.execute("SELECT statusId FROM status WHERE status = %s", 
                       (result_data['status'],))
        res = cursor.fetchone()

        # if status does not exist in DB, insert it
        if not res:
            cursor.execute("""
                INSERT INTO status (status)
                VALUES (%s)
            """, (
                result_data['status'],
            ))
            conn.commit()
            rows_added['status_added'] += 1
            status_id = cursor.lastrowid  # new ID generated from insert
        else:
            status_id = res['statusId'] # status ID that already exists in DB


        # insert result
        cursor.execute("""
            INSERT INTO results (raceId, driverId, constructorId, grid, 
                                positionText, points, statusId)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            race_id,
            driver_id,
            ctor_id,
            result_data['grid'],
            result_data['positionText'],
            result_data['points'],
            status_id
        ))
        conn.commit()
        rows_added['results_added'] += 1

    # insert all laptimes  TODO: figure out how to make this faster
    # session = fastf1.get_session(year, round, 'Race')
    # session.load(telemetry=False, weather=False)
    # laps = session.laps

    # for _, lap_data in laps.iterrows():
    #     driver_id = driver_code_to_id[lap_data["Driver"]] # this api uses driver code for ID
    #     lap_number = int(lap_data["LapNumber"])
    #     lap_time = lap_data["LapTime"]
    #     if isinstance(lap_time, timedelta):
    #         total_ms = int(lap_time.total_seconds() * 1000)
    #         formatted_time = f"{lap_time.seconds // 60}:{lap_time.seconds % 60:02d}.{lap_time.microseconds // 1000:03d}"
    #     else:
    #         total_ms = 0
    #         formatted_time = "NULL"

    #     cursor.execute("""
    #         INSERT INTO lap_times (raceId, driverId, lap, time, milliseconds)
    #         VALUES (%s, %s, %s, %s, %s)
    #     """, (
    #         race_id,
    #         driver_id,
    #         lap_number,
    #         formatted_time,
    #         total_ms
    #     ))

    #     rows_added['laptimes_added'] += 1

    conn.commit()
    cursor.close()
    conn.close()
    return rows_added
