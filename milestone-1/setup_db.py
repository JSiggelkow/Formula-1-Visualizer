import csv
import mysql.connector

from consts import *

# Connect to MySQL server
conn = mysql.connector.connect(
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password='password',
    port=MYSQL_PORT
)
cursor = conn.cursor()

print("Database connection established successfully.")

# Create database
cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
cursor.execute(f"CREATE DATABASE {DB_NAME}")
cursor.execute(f"USE {DB_NAME}")

print(f"Database ${DB_NAME} created successfully.")


# Create all tables from sql file
with open("define_tables.sql", "r", encoding="utf-8") as f:
    sql_commands = f.read().split(";")  
for command in sql_commands:
    if command.strip():  # skip empty lines
        cursor.execute(command)
conn.commit()

# Insert data for each table
for table_name in TABLE_NAMES:

    # Pull out the field names from the table, as we don't use everything in csv
    cursor.execute(f"DESCRIBE {table_name}") 
    columns = [row[0] for row in cursor.fetchall()]

    file_path = "data/" + table_name + ".csv"
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
