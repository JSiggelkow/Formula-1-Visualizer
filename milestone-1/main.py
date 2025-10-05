import mysql.connector
from fastapi import FastAPI

from consts import *

app = FastAPI()


def get_db_conn():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,  # TODO: don't use root user for the actual app
        password=MYSQL_PASSWORD,
        port=MYSQL_PORT,
        database=DB_NAME
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
    return results

    # Basic Feature #2
@app.get("/driver-race-results")
def get_driver_race_results(driver_id: int):
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    query = (f"SELECT results.points, results.grid, results.positionText, "
             f"races.year, races.round, "
             f"circuits.name AS circuit_name, circuits.city, circuits.country, "
             f"constructors.name AS constructor_name, "
             f"teammateName.name AS teammate_name "
             f"FROM results "
             f"JOIN races ON races.raceId = results.raceId "
             f"JOIN circuits ON circuits.circuitId = races.circuitId "
             f"JOIN constructors ON constructors.constructorId = results.constructorId "
             f"JOIN drivers ON drivers.driverId = results.driverId "
             f"LEFT JOIN (SELECT CONCAT(d1.forename, ' ', d1.surname) AS name, "
             f"           r2.raceId, r2.constructorId "
             f"           FROM drivers d1 "
             f"           JOIN results r2 ON r2.driverId = d1.driverId) AS teammateName "
             f"ON teammateName.raceId = results.raceId "
             f"AND teammateName.constructorId = results.constructorId "
             f"AND teammateName.name != CONCAT(drivers.forename, ' ', drivers.surname) "
             f"WHERE results.driverId = {driver_id}")
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
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
    return results
