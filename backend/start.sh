#!/bin/sh
# Script de inicio para Railway
# Usa el puerto proporcionado por Railway o 8000 por defecto

PORT=${PORT:-8000}
exec python -c "import uvicorn; import os; uvicorn.run('app.main:app', host='0.0.0.0', port=int(os.getenv('PORT', 8000)))"
