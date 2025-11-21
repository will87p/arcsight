@echo off
echo ========================================
echo   Adicionar pasta packages ao GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando se Git esta instalado...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Git nao encontrado no PATH!
    echo.
    echo SOLUCAO:
    echo 1. Abra o GitHub Desktop
    echo 2. Clique com botao direito na pasta do projeto
    echo 3. Ou use: Add file -^> Upload files no GitHub
    echo.
    pause
    exit /b 1
)

echo Git encontrado! ^_^
echo.

echo Adicionando pasta packages...
git add packages/

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao adicionar packages/
    echo Verifique se a pasta packages existe!
    pause
    exit /b 1
)

echo.
echo Pasta packages adicionada com sucesso!
echo.
echo Status atual:
git status

echo.
echo ========================================
echo   PROXIMOS PASSOS:
echo ========================================
echo.
echo 1. Execute: git commit -m "Add packages directory"
echo 2. Execute: git push
echo.
echo OU use o GitHub Desktop para fazer commit e push.
echo.
pause

