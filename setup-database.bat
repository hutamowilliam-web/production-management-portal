@echo off
echo Setting up Production Management Database...
echo.

echo Connecting to MySQL and creating schema...
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway < database/schema.sql
if %errorlevel% neq 0 (
    echo Failed to create database schema
    pause
    exit /b 1
)

echo.
echo Inserting seed data...
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway < database/seed.sql
if %errorlevel% neq 0 (
    echo Failed to insert seed data
    pause
    exit /b 1
)

echo.
echo Database setup completed successfully!
echo.
echo Default admin credentials:
echo Username: admin
echo Password: password
echo.
echo Press any key to continue...
pause > nul