# Formula-1-Visualizer

## Development Guide

Note that the following instructions are all given based on a Unix-like command line interface.

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

1. Create a `.env` file in the repo's root, and populate it with the necessary environment variables to connect to the database. The list of environment variables can be found here. (TODO(qianxug): link this once merged)
    - Most likely, just this line is enough:
        ```
        MYSQL_PASSWORD=[your root password]
        ```
2. Run `cd milestone-0/`.
3. Run `python setup_db.py`. This script creates a toy database, a table within the toy database, and inserts data from `toy_dataset.csv` into it.
    - The script has run successfully once you see "Done." printed to the terminal.

### Run the back-end

1. Still from the `milestone-0/` folder, run the back-end locally using `uvicorn main:app --reload`.
2. Visit http://127.0.0.1:8000/docs in your browser. You should see a "Get Toy Data" endpoint displayed.
3. Select the endpoint, click "Try it out", and click "Execute". If all is configured properly, you should see the following data returned via the response body:
    ```json
    [
    {
        "id": 1,
        "name": "Jonas"
    },
    {
        "id": 2,
        "name": "Lena"
    },
    {
        "id": 3,
        "name": "Michelle"
    },
    {
        "id": 4,
        "name": "Miles"
    },
    {
        "id": 5,
        "name": "Qianxu"
    }
    ]
    ```
