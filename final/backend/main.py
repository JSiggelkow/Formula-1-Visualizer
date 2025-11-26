import random

import mysql.connector
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
from fastf1.ergast import Ergast
from datetime import timedelta
import logging
import json

from consts import *

logging.disable(logging.CRITICAL)  # silence logs from external API calls

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
    query = f"SELECT * FROM drivers WHERE 1=1"
    params = []

    if forename:
        query += f" AND forename LIKE %s"
        params.append(f"{forename}%")
    if surname:
        query += f" AND surname LIKE %s"
        params.append(f"{surname}%")
    if driver_id:
        query += f" AND driverId = %s"
        params.append(driver_id)

    cursor.execute(query, params)

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
            SELECT r.driverId,
                   r.raceId,
                   r.points,
                   r.grid,
                   r.positionText,
                   ra.year,
                   ra.round,
                   c.name                                                   AS circuit_name,
                   c.city,
                   c.country,
                   con.name                                                 AS constructor_name,
                   CONCAT(dtp.teammate_forename, ' ', dtp.teammate_surname) AS teammate
            FROM results r
                     JOIN races ra ON ra.raceId = r.raceId
                     JOIN circuits c ON c.circuitId = ra.circuitId
                     JOIN constructors con ON con.constructorId = r.constructorId
                     LEFT JOIN driver_teammate_pairs dtp # uses a view that has all driver_teammate_pairs for every race
            ON dtp.raceId = r.raceId
                AND dtp.driver_id = r.driverId
            WHERE r.driverId = %s
            ORDER BY ra.year DESC, ra.round DESC \
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
                       r.name                             AS race_name,
                       r.year,
                       r.date,
                       c.name                             AS circuit_name,
                       c.city                             AS circuit_city,
                       c.country                          AS circuit_country
                FROM lap_times lt
                         JOIN drivers d ON d.driverId = lt.driverId
                         JOIN races r ON r.raceId = lt.raceId
                         JOIN circuits c ON c.circuitId = r.circuitId
                WHERE lt.raceId = %s
                  AND lt.milliseconds = (SELECT MIN(milliseconds)
                                         FROM lap_times
                                         WHERE raceId = %s)
                """
        cursor.execute(query, (race_id, race_id))
    else:
        query = """
                SELECT CONCAT(d.forename, ' ', d.surname) AS driver_name,
                       lt.lap,
                       lt.time,
                       lt.milliseconds,
                       r.name                             AS race_name,
                       r.year,
                       r.date,
                       c.name                             AS circuit_name,
                       c.city                             AS circuit_city,
                       c.country                          AS circuit_country
                FROM lap_times lt
                         JOIN drivers d ON d.driverId = lt.driverId
                         JOIN races r ON r.raceId = lt.raceId
                         JOIN circuits c ON c.circuitId = r.circuitId
                WHERE c.circuitId = %s
                  AND lt.milliseconds = (SELECT MIN(lt2.milliseconds)
                                         FROM lap_times lt2
                                                  JOIN races r2 ON r2.raceId = lt2.raceId
                                         WHERE r2.circuitId = %s)
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

    driver_code_to_id = {}  # conversion table used when inserting lap_times

    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    conn.start_transaction()

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
        rows_added['circuits_added'] += 1
        circuit_id = cursor.lastrowid  # new circuit ID generated from insert
    else:
        circuit_id = res['circuitId']  # circuit ID that already exists in DB

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
            rows_added['drivers_added'] += 1
            driver_id = cursor.lastrowid  # new driver ID generated from insert
        else:
            driver_id = res['driverId']  # driver ID that already exists in DB

        driver_code_to_id[driver_data['code']] = driver_id  # store result to use when inserting laptimes

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
            rows_added['constructors_added'] += 1
            ctor_id = cursor.lastrowid  # new ID generated from insert
        else:
            ctor_id = res['constructorId']  # ctor ID that already exists in DB

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
            status_id = res['statusId']  # status ID that already exists in DB

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
        rows_added['results_added'] += 1

    # insert all laptimes
    session = fastf1.get_session(year, round, 'Race')
    session.load(telemetry=False, weather=False)
    laps = session.laps

    lap_rows = []
    for _, lap_data in laps.iterrows():
        driver_id = driver_code_to_id[lap_data["Driver"]]  # this api uses driver code for ID
        lap_number = int(lap_data["LapNumber"])
        lap_time = lap_data["LapTime"]
        if isinstance(lap_time, timedelta):  # don't add NULL laps
            total_ms = int(lap_time.total_seconds() * 1000)
            formatted_time = f"{lap_time.seconds // 60}:{lap_time.seconds % 60:02d}.{lap_time.microseconds // 1000:03d}"
            lap_rows.append((race_id, driver_id, lap_number, formatted_time, total_ms))

    # bulk insert laptimes
    cursor.executemany("""
                       INSERT INTO lap_times (raceId, driverId, lap, time, milliseconds)
                       VALUES (%s, %s, %s, %s, %s)
                       """, lap_rows)

    rows_added['laptimes_added'] = len(lap_rows)

    conn.commit()
    cursor.close()
    conn.close()
    return rows_added

@app.get("/driver-v2")
def get_drivers_v2(search_str: str):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    query = """
    SELECT 
        driverId,
        forename,
        surname,
        nationality,
        MATCH(code, forename, surname, nationality, about) AGAINST (%s IN NATURAL LANGUAGE MODE) as relevance_score,
        LEFT(about, 200) as bio_preview
    FROM drivers 
    WHERE MATCH(code, forename, surname, nationality, about) AGAINST (%s IN NATURAL LANGUAGE MODE)
    ORDER BY relevance_score DESC;
    """
    params = [search_str, search_str]

    cursor.execute(query, params)
    results = cursor.fetchall()
    cursor.close()
    conn.close()

    return results

@app.get("/circuits")
def get_circuits():
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM circuits"
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results


@app.get("/races")
def get_races(year: int = None):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM races"
    if year:
        query += f" WHERE year = {year}"
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results


@app.get("/graph-data/{year}")
def get_graph_data(year):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)

    # Nodes
    cursor.execute("""
                   WITH drivers_in_season AS (SELECT DISTINCT res.driverId   AS driver_id,
                                                              d.code         AS driver_code,
                                                              d.forename     AS forename,
                                                              d.surname      AS surname,
                                                              c.colorPrimary AS ctor_color,
                                                              c.name         AS ctor_name
                                              FROM results res
                                                       JOIN races r ON r.raceId = res.raceId
                                                       JOIN drivers d ON d.driverId = res.driverId
                                                       JOIN constructors c ON res.constructorId = c.constructorId
                                              WHERE r.year = %s)
                   SELECT driver_id, driver_code, forename, surname, ctor_name, ctor_color
                   FROM drivers_in_season;
                   """, (year,))
    drivers = cursor.fetchall()

    # Edges
    cursor.execute("""
                   WITH drivers_in_season AS (SELECT DISTINCT res.driverId
                                              FROM results res
                                                       JOIN races r ON r.raceId = res.raceId
                                              WHERE r.year = %s),
                        edges_raw AS (SELECT DISTINCT LEAST(tp.driver_id, tp.teammate_id)    AS driver_A_id,
                                                      GREATEST(tp.driver_id, tp.teammate_id) AS driver_B_id,
                                                      r.year,
                                                      tp.constructorId,
                                                      c.name                                 AS ctor_name
                                      FROM driver_teammate_pairs tp
                                               JOIN races r ON r.raceId = tp.raceId
                                               JOIN constructors c ON tp.constructorId = c.constructorId
                                      WHERE tp.driver_id IN (SELECT driverId FROM drivers_in_season)
                                        AND tp.teammate_id IN (SELECT driverId FROM drivers_in_season))

                   SELECT driver_A_id,
                          driver_B_id,
                          da.code                      AS driver_A_code,
                          db.code                      AS driver_B_code,
                          JSON_ARRAYAGG(year)          AS years_together,
                          JSON_ARRAYAGG(constructorId) AS constructors,
                          JSON_ARRAYAGG(ctor_name)     AS constructorNames,
                          MAX(year = %s)               AS is_current
                   FROM edges_raw e
                            JOIN drivers da ON da.driverId = e.driver_A_id
                            JOIN drivers db ON db.driverId = e.driver_B_id
                   GROUP BY driver_A_id, driver_B_id, da.code, db.code
                   """, (year, year))
    edges = cursor.fetchall()

    cursor.close()
    conn.close()

    cy_nodes = [
        {"data": {
            "id": driver["driver_id"],
            "code": driver["driver_code"],
            "color": driver["ctor_color"],
            "forename": driver["forename"],
            "surname": driver["surname"],
            "ctor_name": driver["ctor_name"],
        }} for driver in drivers]

    cy_edges = [{
        "data": {
            "id": f"{edge['driver_A_id']}_{edge['driver_B_id']}",
            "source": edge["driver_A_id"],
            "target": edge["driver_B_id"],
            "source_code": edge["driver_A_code"],
            "target_code": edge["driver_B_code"],
            "years": json.loads(edge["years_together"]),
            "constructors": json.loads(edge["constructors"]),
            "constructorNames": json.loads(edge["constructorNames"]),
            "is_current": edge["is_current"]  # true iff drivers were teammates for specified season
        }
    } for edge in edges
    ]

    return cy_nodes + cy_edges

@app.get("/circuits/closest")
def get_closest_circuits(userLat: float, userLng: float):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT 
            circuitId,
            circuitRef,
            name,
            city,
            country,
            lat,
            lng,
            ROUND(
                ST_Distance_Sphere(
                    POINT(lng, lat),
                    POINT(%s, %s)
                ) / 1000,
                2
            ) AS distance_km
        FROM circuits
        ORDER BY distance_km
        LIMIT 10
    """
    
    cursor.execute(query, (userLng, userLat))
    circuits = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return {"circuits": circuits}

def get_who_won_race_question():
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT raceId, name, year FROM races ORDER BY RAND() LIMIT 1")
    race = cursor.fetchone()

    question = f"Who won {race['name']} in {race['year']}?"

    cursor.execute("""
                   SELECT CONCAT(d.forename, ' ', d.surname) AS driver_name
                   FROM results r
                            JOIN drivers d ON d.driverId = r.driverId
                   WHERE r.raceId = %s
                     AND r.positionText = '1' LIMIT 1
                   """, (race['raceId'],))

    winner_row = cursor.fetchone()
    rightAnswer = winner_row['driver_name'] if winner_row else None

    cursor.execute("""
                   SELECT DISTINCT CONCAT(d.forename, ' ', d.surname) AS driver_name
                   FROM results r
                            JOIN drivers d ON d.driverId = r.driverId
                   WHERE r.raceId = %s
                     AND r.positionText != '1'
                   ORDER BY RAND()
                       LIMIT 3
                   """, (race['raceId'],))

    wrongAnswers = [row['driver_name'] for row in cursor.fetchall()]
    return {
        'question': question,
        'rightAnswer': rightAnswer,
        'wrongAnswers': wrongAnswers,
    }

@app.get("/lap-delta-all/{race_id}")
def lap_delta_all(race_id):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)

    # get race name
    query = """
        SELECT 
            name, year
        FROM races
        WHERE raceId = %s
    """
    cursor.execute(query, (race_id,))
    res = cursor.fetchone()
    race_name = str(res['year']) + " " + res['name']

    query = """
        SELECT
            lt.driverId,
            d.forename,
            d.surname,
            lt.lap,
            lt.milliseconds AS lap_ms,
            lt.milliseconds -
                LAG(lt.milliseconds) OVER (
                    PARTITION BY lt.driverId, lt.raceId
                    ORDER BY lt.lap
                ) AS delta_ms
        FROM lap_times lt
        JOIN drivers d ON d.driverId = lt.driverId
        WHERE lt.raceId = %s
        ORDER BY lt.driverId, lt.lap
    """

    cursor.execute(query, (race_id,))
    rows = cursor.fetchall()


    # Group rows by driver
    drivers = {}
    for r in rows:
        driver_id = r["driverId"]

        # get ctor colour
        query = """
            SELECT c.colorPrimary color
            FROM constructors c 
            JOIN results r ON c.constructorId = r.constructorId
            AND r.driverId = %s
            AND r.raceId = %s
        """

        cursor.execute(query, (driver_id, race_id))
        res = cursor.fetchone()
        ctor_color = res['color']
        fullname = f"{r['forename']} {r['surname']}"

        if driver_id not in drivers:
            drivers[driver_id] = {
                "driverId": driver_id,
                "name": fullname,
                "color": ctor_color,
                "laps": [],
                "delta": []
            }

        drivers[driver_id]["laps"].append(r["lap"])

        # convert missing deltas to 0
        drivers[driver_id]["delta"].append(r["delta_ms"] if r["delta_ms"] is not None else 0)

    cursor.close()
    conn.close()

    return {
        "race_id": race_id,
        "race_name": race_name,
        "drivers": list(drivers.values())
    }



def get_driver_nationality_question():
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT driverId, forename, surname, nationality FROM drivers ORDER BY RAND() LIMIT 1;
    """)
    driver = cursor.fetchone()

    full_name = f"{driver['forename']} {driver['surname']}"
    question = f"What is the nationality of {full_name}?"
    right_answer = driver['nationality']

    cursor.execute("""
                   SELECT DISTINCT nationality
                   FROM drivers
                   WHERE nationality != %s
                   ORDER BY RAND()
                       LIMIT 3
                   """, (right_answer,))
    wrong_answers = [row['nationality'] for row in cursor.fetchall()]

    cursor.close()
    conn.close()

    return {
        'question': question,
        'rightAnswer': right_answer,
        'wrongAnswers': wrong_answers,
    }


QUESTION_GENERATORS = [
    get_who_won_race_question,
    get_driver_nationality_question
]

@app.get("/trivia/question")
def get_trivia_question():
    generator = random.choice(QUESTION_GENERATORS)
    return generator()
