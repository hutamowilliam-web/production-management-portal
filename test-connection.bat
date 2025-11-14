@echo off
echo Testing Production Management System Connections...
echo.

echo Testing MySQL Connection...
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway -e "SELECT 'MySQL Connection: SUCCESS' as Status;"
if %errorlevel% neq 0 (
    echo MySQL Connection: FAILED
    pause
    exit /b 1
)

echo.
echo Testing Redis Connection...
redis-cli -u redis://default:yVSmSKMhIrpPADjuQVvdhkPkiVDbAORo@interchange.proxy.rlwy.net:56942 PING
if %errorlevel% neq 0 (
    echo Redis Connection: FAILED
    pause
    exit /b 1
)

echo.
echo All connections successful!
echo.
echo Press any key to continue...
pause > nul