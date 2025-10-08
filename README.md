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
- `docker compose up` (use `-d` to run in background)

### View the frontend
- visit http://localhost:5173 in your browser

### Test the API
- visit http://localhost:8000/docs in your browser
- you can test the API endpoints.

### Connect to the database
- `docker compose exec db mysql -u root -p`
- enter your root password when prompted
- test the connection by running the following commands:
- `use f1db;`
- `select * from drivers;`

### Stop the containers
- `docker compose down`

### Important notes
- The database uses a mapped volume for persistence. Deleting the volume will remove all database data.
- The database is not exposed to the host machine.
- Ensure no other service is using port 8000 or port 5173.

### Helpful commands
- `docker compose up --build --force-recreate` to rebuild the images and recreate the containers

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

### Populate a toy database

1. Create a `.env` file in the repo's root, and populate it with the necessary environment variables to connect to the database. The list of environment variables can be found [here](https://github.com/JSiggelkow/Formula-1-Visualizer/blob/main/milestone-0/consts.py#L7-L10).
    - Most likely, just this line is enough:
        ```
        MYSQL_PASSWORD=[your root password]
        ```
2. Run `cd milestone-1/backend/`.
3. Run `python setup_db.py`. This script creates a toy database, a table within the toy database, and inserts data from `toy_dataset.csv` into it.
    - The script has run successfully once you see "Done." printed to the terminal.

### Run the back-end

1. Still from the `milestone-1/backend/` folder, run the back-end locally using `uvicorn main:app --reload`.
2. Visit http://127.0.0.1:8000/docs in your browser. You should see a different endpoints displayed.
3. Try out the endpoints.

### Run the front-end

1. From the `milestone-1/frontend/` folder, run `npm install` if needed.
2. Run `npm run dev`.
3. Go to `http://127.0.0.1:5173`.