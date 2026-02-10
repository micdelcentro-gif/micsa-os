# 🚀 MICSA OS - Sistema ERP Industrial Completo

Sistema ERP propietario para gestión integral de empresa industrial.

## 🏗️ Arquitectura (Monorepo)

- **Frontend**: Vite + React + TypeScript (ubicado en `./frontend`)
- **Backend**: FastAPI (Python) (ubicado en `./backend`)
- **Legacy**: Sistema de reportes original y scripts de utilidad (ubicado en `./legacy`)
- **Base de Datos**: PostgreSQL / SQLite (opcional)
- **Deploy**: Docker Compose (Gestiona Frontend, Backend y DB)

## ⚡ Inicio Rápido (All-in-One)

### Con Docker (Recomendado)

```bash
# 1. Copiar variables de entorno
cp backend/.env.example backend/.env

# 2. Levantar servicios
docker-compose up -d

# 3. Verificar
curl http://localhost:8000/health

# 4. Acceder a la API
open http://localhost:8000/api/v1/docs
```

### Sin Docker

```bash
# 1. Configurar entorno
cp backend/.env.example backend/.env

# 2. Instalar PostgreSQL (Homebrew en Mac)
brew install postgresql@15
brew services start postgresql

# 3. Crear base de datos
createdb micsa_os

# 4. Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# 5. Instalar dependencias
cd backend
pip install -r requirements.txt

# 6. Ejecutar
uvicorn app.main:app --reload --port 8000
```

## 📦 Módulos

- ✅ Core / Seguridad
- ✅ CRM / Comercial
- ✅ Cotización Inteligente
- ✅ Project Manager Industrial
- ✅ EHS / CSC / ISO
- ✅ Finanzas
- ✅ Contabilidad
- ✅ Almacén / Herramientas
- ✅ RRHH / Personal
- ✅ Documentos

## 📚 Documentación

- API: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## 🔐 Variables de Entorno

Editar `backend/.env`:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/micsa_os
SECRET_KEY=your-secret-key-here
EMPRESA_NOMBRE=Montajes e Izajes del Centro Industrial Contractor SA de CV
```

## 📞 Soporte

Sistema desarrollado para MICSA  
Versión 1.0.0
correlo
quiero todoi el sistema funcionando
