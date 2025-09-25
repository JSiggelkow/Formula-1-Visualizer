import csv
import mysql.connector

from consts import *

# Connect to MySQL server
conn = mysql.connector.connect(
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    port=MYSQL_PORT
)
cursor = conn.cursor()

print("Database connection established successfully.")

# Create database
cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
cursor.execute(f"USE {DB_NAME}")

print(f"Database ${DB_NAME} created or already exists.")

# Create table
cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        id INT PRIMARY KEY,
        name VARCHAR(255)
    )
""")

print(f"Table {TABLE_NAME} created or already exists.")

# Read CSV and insert data
with open(CSV_FILE, newline='', encoding='utf-8') as csv_file:
    reader = csv.DictReader(csv_file)
    for row in reader:
        cursor.execute(
            f"INSERT INTO {TABLE_NAME} (id, name) VALUES ({int(row['id'])}, \"{row['name']}\") ON DUPLICATE KEY UPDATE name = VALUES(name)"
        )

print("CSV data imported or updated successfully.")

conn.commit()
cursor.close()
conn.close()

print("Done.")
