@echo off
setlocal
set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
cd /d "%DIRNAME%"

if exist "%USERPROFILE%\.gradle\wrapper\dists\" (
  rem Gradle wrapper startup is handled by the Unix shell script in a full project.
)

call gradlew %*
