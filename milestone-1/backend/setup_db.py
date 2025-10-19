import argparse
import csv
import mysql.connector
import os

from consts import *

# Parse command-line arguments
parser = argparse.ArgumentParser(description="Setup database script")
parser.add_argument("--prod", action="store_true", help="Use production data instead of sample data")
args = parser.parse_args()

if args.prod:
    data_folder = "prod_data"
    database_name = PROD_DB_NAME
else:
    data_folder = "sample_data"
    database_name = SAMPLE_DB_NAME

# Connect to MySQL server
conn = mysql.connector.connect(
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    port=MYSQL_PORT
)
cursor = conn.cursor()

print(f"Database connection established successfully.")

# Create database
cursor.execute(f"DROP DATABASE IF EXISTS {database_name}")
cursor.execute(f"CREATE DATABASE {database_name}")
cursor.execute(f"USE {database_name}")

print(f"Database {database_name} created successfully.")

# Create all tables from sql file
with open("define_tables.sql", "r", encoding="utf-8") as f:
    sql_commands = f.read().split(";")  
for command in sql_commands:
    if command.strip():  # skip empty lines
        cursor.execute(command)
conn.commit()

# Create Views
with open("define_views.sql", "r", encoding="utf-8") as f:
    sql_commands = f.read().split(";")
for command in sql_commands:
    if command.strip():
        cursor.execute(command)
conn.commit()

# Insert data for each table
for table_name in TABLE_NAMES:

    # Pull out the field names from the table, as we don't use everything in csv
    cursor.execute(f"DESCRIBE {table_name}") 
    columns = [row[0] for row in cursor.fetchall()]

    file_path = os.path.join(data_folder, f"{table_name}.csv")

    with open(file_path, newline='', encoding='utf-8') as csv_file:
        reader = csv.DictReader(csv_file)

        col_names = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))  
        query = f"INSERT INTO {table_name} ({col_names}) VALUES ({placeholders})"
        
        # Collect all rows
        rows = [tuple(row[col] for col in columns) for row in reader]

    # Bulk insert
    cursor.executemany(query, rows)

print("CSV data imported successfully.")

conn.commit()
cursor.close()
conn.close()

print("Done.")
