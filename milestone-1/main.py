import mysql.connector
from fastapi import FastAPI

from consts import *

app = FastAPI()

def get_db_conn():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER, # TODO: don't use root user for the actual app
        password=MYSQL_PASSWORD,
        port=MYSQL_PORT,
        database=DB_NAME
    )

@app.get("/toy-data")
def get_toy_data():
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM {TABLE_NAME}")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

if __name__ == '__main__':
    conn = get_db_conn()
    cursor = conn.cursor(dictionary=True)

    # Show Hamilton's finishing positions in the British Grand Prix from 2015-2020
    cursor.execute(f"SELECT races.year, results.positionText \
                     FROM drivers NATURAL JOIN races NATURAL JOIN results \
                     WHERE surname = 'Hamilton' AND races.name = 'British Grand Prix' \
                                                AND 2015 <= races.year AND races.year <= 2020")
    results = cursor.fetchall()
    print("year\tresult")
    for col in results:
        print(f"{col['year']}\t{col['positionText']}")
    cursor.close()
    conn.close()