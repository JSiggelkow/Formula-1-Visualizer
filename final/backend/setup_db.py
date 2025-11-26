import argparse
import csv
import mysql.connector
import os

from consts import *
from scraper import WikipediaScraper


# Parse command-line arguments
parser = argparse.ArgumentParser(description="Setup database script")
parser.add_argument("--prod", action="store_true", help="Use production data instead of sample data")
parser.add_argument("--fresh-scrape", action="store_true", help="Force fresh scraping of Wikipedia content (default: use cached)")
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
        if table_name == 'drivers':
            # Initialize scraper for drivers table with separate cache files for prod/sample
            cache_file = f"{data_folder}/scraped_driver_bios_{data_folder}.json"
            scraper = WikipediaScraper(cache_file=cache_file)
            if args.fresh_scrape:
                scraper.scrape_drivers_from_csv(file_path, force_refresh=True)
            else:
                scraper.scrape_drivers_from_csv(file_path, force_refresh=False)
            
            rows = []
            for row in reader:
                row_data = []
                for col in columns:
                    if col == 'about':
                        wiki_url = row.get('url', '')
                        about_text = scraper.get_cached_content(wiki_url)
                        row_data.append(about_text)
                    else:
                        row_data.append(row[col])
                rows.append(tuple(row_data))
        else:
            rows = [tuple(row[col] for col in columns) for row in reader]

    # Bulk insert
    cursor.executemany(query, rows)

print("CSV data imported successfully.")

# Create Indexes from sql file
with open("define_indexes.sql", "r", encoding="utf-8") as f:
    sql_commands = f.read().split(";")
for command in sql_commands:
    if command.strip():
        cursor.execute(command)
conn.commit()
print("Indexes created successfully.")

conn.commit()
cursor.close()
conn.close()

print("Done.")
