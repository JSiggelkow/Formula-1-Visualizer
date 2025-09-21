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
