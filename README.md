# Formula-1-Visualizer

## Development Guide

Note that the following instructions are all given based on a Unix-like command line interface.

The Setup description is split into two parts:
- Setup in containerized environment (Docker)
- Setup on you local machine

## Setup with Docker

Docker lets you run the database, backend, and frontend in isolated containers.
This keeps your local environment deps from interfering and avoids port conflicts with other services on your machine.

### Prerequisites
- [Docker](https://docs.docker.com/desktop/setup/install/mac-install/)
- I recommend using Docker Desktop for managing Containers (I think the desktop App does not work on linux)

### Environment
- Create a `.env` in the repo's root and add a MySQL password to it:
- `MYSQL_PASSWORD=[your root password]`

### Start the containers
- `docker compose up --build --force-recreate` (use `-d` to run in background)

### View the frontend
- visit http://localhost:5173 in your browser

### Test the API
- visit http://localhost:8000/docs in your browser
- you can test the API endpoints.

### Connect to the database
- `docker compose exec db mysql -u root -p`
- enter your root password when prompted
- test the connection by running the following commands:
    - `USE f1db_sample;`
    - `SELECT * FROM drivers;`

### Stop the containers
- `docker compose down`

### Important notes
- The database uses a mapped volume for persistence. Deleting the volume will remove all database data.
- The database is not exposed to the host machine.
- Ensure no other service is using port 8000 or port 5173.

### Helpful commands
- `docker compose up --build --force-recreate` to rebuild the images and recreate the containers
- `docker exec -it db mysql -u root -p` to exec into the database container and run queries

## Setup on your local machine

### Prerequisites

1. You have installed [MySQL](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/) and [Python](https://wiki.python.org/moin/BeginnersGuide/Download).
2. You have made note of the root password you set in the MySQL installation process.
3. You are in the root directory of this repo.

### Start & connect to the database server
Run `mysql -u root -p` in a terminal. Enter your root password when prompted.
- If you are using Windows, and it's struggling to find the `mysql` command, you may need to [manually add `mysql.exe` to system PATH](https://dev.mysql.com/doc/mysql-windows-excerpt/5.7/en/mysql-installation-windows-path.html).

You're set once you see an interface similar to the following:
```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 39
Server version: 8.0.43 MySQL Community Server - GPL

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

Feel free to type in a simple query like `SHOW DATABASES;` to test further.

### Set up Python dependencies

1. Create a Python virtual environment in the repo's root: `python -m venv venv`.
2. Activate the virtual environment you just created by running `source [path to the activation script]`.
    - This may look like `source venv/Scripts/activate` for Windows, or `source venv/bin/activate` for MacOS/Linux.
3. Run `which python` and confirm that "venv" is somewhere in the outputted path.
4. Install dependencies by running `pip install -r requirements.txt`. This might take a while.

### Populate databases

1. Create a `.env` file in the repo's root, and populate it with the necessary environment variables to connect to the database. The list of environment variables can be found [here](https://github.com/JSiggelkow/Formula-1-Visualizer/blob/main/milestone-0/consts.py#L7-L10).
    - Creating a ```MYSQL_PASSWORD``` is mandatory. The others are optional.:
        ```
        MYSQL_PASSWORD=[your root password]
        ```
2. Run `cd milestone-2/backend/`.
3. Run `python setup_db.py`. This script creates a sample database with data loaded from `milestone-2/backend/sample_data`, which is a subset of the production data.
    - The script has run successfully once you see "Done." printed to the terminal.
4. Optionally, if you plan to try the application, run `python setup_db.py --prod` to populate the production database.

### Run the back-end

1. Still from the `milestone-2/backend/` folder, run the back-end locally using `uvicorn main:app --reload`.
2. Visit http://127.0.0.1:8000/docs in your browser. You should see different endpoints displayed.
3. Try out the endpoints.

### Run the front-end

1. In a new terminal session, run `cd milestone-2/frontend/ && npm install`.
2. Run `npm run dev`.
3. Go to http://127.0.0.1:5173 in your browser.

## Testing out the application

### Prerequisites
1. You have created and populated the **production database**. Note that this should already be done if you set up with Docker.
2. Your back-end and front-end servers are both running.

### Supported features
You can visit http://127.0.0.1:5173 and try out any of the following features:
- **Basic feature #1 (R6):** When you type in a driver's name into the main search bar, a list of autocomplete suggestions pop up under the search bar.
- **Basic feature #2 (R7):** If you click on any of the suggested names, you will be taken to a new page with that driver's details, including basic personal information and a paginated list of their race results over the years.
- **Basic feature #3 (R8):** Back on the home page, you can scroll down to the "Season Winners" card, specify a year, and view all of the race winners from that year.
- **Basic feature #4 (R9):** Using the "Fastest Lap" card, you can toggle between the "By Race" and "By Circuit" search options. You can search for the fastest lap by selecting a year and race name, or by selecting a circuit name.
- **Basic feature #5 (R10):** Click on the red "Get Next Race" button to trigger an update. This will look up the next chronological race that is not currently in the database and will add all relevant data from that race. It will then report how many rows were added to each table.

## Evaluating query performance

### R6 - R9
You can manually evaluate the performance following these steps:
1. Connect to the database and select the production database: `USE f1db;`
2. Execute the contents of [`define_temp_indexes.sql`](https://github.com/JSiggelkow/Formula-1-Visualizer/blob/main/milestone-2/prod_query_tests/prod_performance_test/define_temp_indexes.sql). The comment at the top of the file explains why this is necessary.
3. Execute the contents of [`drop_indexes.sql`](https://github.com/JSiggelkow/Formula-1-Visualizer/blob/main/milestone-2/prod_query_tests/prod_performance_test/drop_indexes.sql) to remove performance optimizations.
4. Run each production query in [`prod_query_tests/`](https://github.com/JSiggelkow/Formula-1-Visualizer/tree/main/milestone-2/prod_query_tests) with `EXPLAIN ANALYZE`. Record the last value of the `time` field shown at the root of the execution plan. For example, this shows that the query took 0.475 ms to complete:
    ```
    mysql> EXPLAIN ANALYZE SELECT * FROM drivers WHERE forename = 'Mark';
    +---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | EXPLAIN                                                                                                                                                                                                 |
    +---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | -> Filter: (drivers.forename = 'Mark')  (cost=87.3 rows=86.1) (actual time=0.182..0.475 rows=3 loops=1)
        -> Table scan on drivers  (cost=87.3 rows=861) (actual time=0.174..0.432 rows=861 loops=1)
    |
    +---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    1 row in set (0.00 sec)
    ```
    
    These values are query execution times _without_ performance optimizations.
5. Execute the contents of [`define_indexes.sql`](https://github.com/JSiggelkow/Formula-1-Visualizer/blob/main/milestone-2/backend/define_indexes.sql) to add back performance optimizations.
    - Please make sure to complete this step to restore the production database state.
6. Execute the contents of [`drop_temp_indexes.sql`](https://github.com/JSiggelkow/Formula-1-Visualizer/blob/main/milestone-2/prod_query_tests/prod_performance_test/drop_temp_indexes.sql). 
7. Repeat step 3. This time, the recorded values are query execution times _with_ performance optimizations.
8. Compare the performance side by side for each production query.

### R10
Run [this script](https://github.com/JSiggelkow/Formula-1-Visualizer/blob/main/milestone-2/prod_query_tests/prod_performance_test/test.sh) to automatically evaluate the performance difference.
