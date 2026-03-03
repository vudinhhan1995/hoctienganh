@echo off
REM Setup script for hoctienganh application using Conda

echo ========================================
echo Setting up Hoctienganh Environment
echo ========================================

REM Create conda environment
echo Creating conda environment...
conda env create -f environment.yml

REM Activate environment
echo Activating environment...
call conda activate hoctienganh

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
cd ..

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
cd ..

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Set up PostgreSQL and update server/.env
echo 2. Run: cd server ^&^& npx prisma migrate dev
echo 3. Run backend: cd server ^&^& npm run dev
echo 4. Run frontend: cd client ^&^& npm run dev
echo.
