import sqlite3
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Añadir el path actual para poder importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.proyecto import Proyecto
from app.models.empleado import Empleado, EmpleadoDocumento
from app.core.config import settings

# Rutas de las bases de datos
LEGACY_DB = "../legacy/reporte-digital/backend/database/micsa.db"
MODERN_DB_URL = settings.DATABASE_URL

def migrate():
    # Conexiones
    conn_legacy = sqlite3.connect(LEGACY_DB)
    conn_legacy.row_factory = sqlite3.Row
    cursor_legacy = conn_legacy.cursor()

    engine = create_engine(MODERN_DB_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    print("🚀 Iniciando migración de datos legacy...")

    # 1. Migrar Proyectos
    project_mapping = {} # legacy_id -> modern_uuid
    cursor_legacy.execute("SELECT * FROM projects")
    legacy_projects = cursor_legacy.fetchall()
    
    print(f"📦 Migrando {len(legacy_projects)} proyectos...")
    for lp in legacy_projects:
        # Verificar si ya existe por nombre para evitar duplicados
        existing = session.query(Proyecto).filter(Proyecto.nombre == lp['name']).first()
        if existing:
            project_mapping[lp['id']] = existing.id
            print(f"  - Proyecto '{lp['name']}' ya existe, saltando...")
            continue

        new_id = str(uuid.uuid4())
        proyecto = Proyecto(
            id=new_id,
            nombre=lp['name'],
            status=lp['status'].upper() if lp['status'] else "ACTIVE",
            created_at=None # Dejar que use el default o mapear si es necesario
        )
        session.add(proyecto)
        project_mapping[lp['id']] = new_id
        print(f"  + Proyecto '{lp['name']}' migrado.")

    session.commit()

    # 2. Migrar Empleados
    employee_mapping = {} # legacy_id -> modern_uuid
    cursor_legacy.execute("SELECT * FROM employees")
    legacy_employees = cursor_legacy.fetchall()

    print(f"👥 Migrando {len(legacy_employees)} empleados...")
    for le in legacy_employees:
        # Verificar si ya existe por RFC o nombre
        existing = session.query(Empleado).filter(Empleado.nombre == le['name']).first()
        if existing:
            employee_mapping[le['id']] = existing.id
            print(f"  - Empleado '{le['name']}' ya existe, saltando...")
            continue

        new_id = str(uuid.uuid4())
        le_dict = dict(le)
        empleado = Empleado(
            id=new_id,
            nombre=le_dict['name'],
            puesto=le_dict['position'],
            rfc=le_dict['rfc'],
            nss=le_dict['nss'],
            curp=le_dict['curp'],
            telefono=le_dict['phone'],
            email=le_dict['email'],
            contacto_emergencia=le_dict['emergency_contact'],
            activo=bool(le_dict['active']),
            proyecto_id=project_mapping.get(le_dict['project_id']),
            salario=le_dict['salary'] or 0.0,
            banco=le_dict['bank'],
            cuenta_clabe=le_dict['account_info'],
            imss_activo=bool(le_dict.get('imss_activo', 1)),
            estatus_repse=le_dict.get('estatus_repse', 'VERDE')
        )
        session.add(empleado)
        employee_mapping[le['id']] = new_id
        print(f"  + Empleado '{le['name']}' migrado.")

    session.commit()

    # 3. Migrar Documentos de Empleados
    cursor_legacy.execute("SELECT * FROM employee_documents")
    legacy_docs = cursor_legacy.fetchall()

    print(f"📄 Migrando {len(legacy_docs)} documentos...")
    for ld in legacy_docs:
        # Verificar si el empleado existe en la nueva DB
        new_emp_id = employee_mapping.get(ld['employee_id'])
        if not new_emp_id:
            continue

        doc = EmpleadoDocumento(
            id=str(uuid.uuid4()),
            empleado_id=new_emp_id,
            tipo_documento=ld['document_type'],
            nombre_archivo=ld['filename'],
            nombre_original=ld['original_name'],
            ruta_archivo=ld['file_path']
        )
        session.add(doc)

    session.commit()
    print("✅ Migración completada con éxito.")

    conn_legacy.close()
    session.close()

if __name__ == "__main__":
    migrate()
