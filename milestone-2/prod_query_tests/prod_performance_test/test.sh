#!/bin/bash

cd ../../backend
python3 setup_db.py --prod

cd ../prod_query_tests/prod_performance_test
echo "Slow implementation:"
time python3 main_slow.py

cd ../../backend
python3 setup_db.py --prod

echo "Fast implementation:"
cd ../prod_query_tests/prod_performance_test
time python3 main.py