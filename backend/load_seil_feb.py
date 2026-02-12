import os
import uuid
import shutil
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import zipfile

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.compliance import ComplianceExpediente
from app.core.config import settings

INBOX_ROOT = "/Users/jordangonzalez/Downloads/Project Manager/micsa-os/inbox_documentos/SEIL EXPEDIENTE"
PAGOS_FEB_DIR = os.path.join(INBOX_ROOT, "PAGOS FEB 2025 Seil. 3/MICSA")
UPLOAD_BASE_DIR = "/Users/jordangonzalez/Downloads/Project Manager/micsa-os/docs/compliance_seil"

def zip_folder(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                zipf.write(os.path.join(root, file), 
                           os.path.relpath(os.path.join(root, file), 
                           os.path.join(folder_path, '..')))

def load_seil_feb():
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    print("📁 Iniciando carga de expediente SEIL OC-44638 (Febrero 2025)...")

    # 1. Definiciones base
    oc_number = "44638"
    nombre_proyecto = "Clarios - Reubicación Conveyor"
    mes_curso = "Febrero 2025"
    safe_oc = oc_number.replace("/", "_").replace(" ", "_")

    # 2. Buscar o crear expediente
    db_exp = session.query(ComplianceExpediente).filter(ComplianceExpediente.oc_number == oc_number).first()
    if not db_exp:
        db_exp = ComplianceExpediente(
            id=str(uuid.uuid4()),
            oc_number=oc_number,
            nombre_proyecto=nombre_proyecto,
            mes_curso=mes_curso,
            status="ABIERTO",
            documents={
                "01_CXP_Y_POLIZA": {"reporte_cxp": None, "poliza_contable": None},
                "02_FACTURA": {"factura_pdf": None, "factura_xml": None, "captura_correo": None},
                "03_VERIFICACION_FISCAL": {"verificacion_sat": None},
                "04_ORDEN_DE_COMPRA": {"po_firmada": None},
                "05_HOJA_DE_ACEPTACION": {"hoja_aceptacion": None},
                "06_CONTRATO": {"contrato_firmado": None},
                "07_NOMINAS_Y_SEGURIDAD_SOCIAL": {"nominas": None, "pago_seguro": None, "caratula_imss": None, "sua": None},
                "08_IMPUESTOS": {"pago_isr": None, "acuse_isr": None, "pago_iva": None, "acuse_iva": None, "pago_isn": None},
                "09_OPINIONES_POSITIVAS": {"opinion_imss": None, "opinion_infonavit": None, "opinion_sat": None}
            }
        )
        session.add(db_exp)
    
    current_docs = db_exp.documents or {}

    # 3. Preparar Folder de Nóminas
    nominas_folder = os.path.join(PAGOS_FEB_DIR, "NOMINAS")
    dest_nominas_folder = os.path.join(UPLOAD_BASE_DIR, safe_oc, "07_NOMINAS_Y_SEGURIDAD_SOCIAL")
    os.makedirs(dest_nominas_folder, exist_ok=True)
    nominas_zip = os.path.join(dest_nominas_folder, "NOMINAS_FEBRERO_2025.zip")
    
    if os.path.exists(nominas_folder):
        print("  📦 Comprimiendo carpetas de nóminas...")
        zip_folder(nominas_folder, nominas_zip)
        if "07_NOMINAS_Y_SEGURIDAD_SOCIAL" not in current_docs:
            current_docs["07_NOMINAS_Y_SEGURIDAD_SOCIAL"] = {}
        current_docs["07_NOMINAS_Y_SEGURIDAD_SOCIAL"]["nominas"] = nominas_zip

    # 4. Mapeo de archivos
    file_mappings = [
        (os.path.join(INBOX_ROOT, "OC 44638.pdf"), "04_ORDEN_DE_COMPRA", "po_firmada"),
        (os.path.join(INBOX_ROOT, "2C888770-F77A-4083-B9F4-18FBCC0C4A53 (1) (2).pdf"), "02_FACTURA", "factura_pdf"),
        (os.path.join(INBOX_ROOT, "Complete_con_Docusign_SUBCONT_Monajes_e_Izaj (4).pdf"), "06_CONTRATO", "contrato_firmado"),
        (os.path.join(INBOX_ROOT, "Hoja liberacion semana 2.pdf"), "05_HOJA_DE_ACEPTACION", "hoja_aceptacion"),
        (os.path.join(PAGOS_FEB_DIR, "SUA FEB 2025.pdf"), "07_NOMINAS_Y_SEGURIDAD_SOCIAL", "sua"),
        (os.path.join(PAGOS_FEB_DIR, "PAGO IMSS.pdf"), "07_NOMINAS_Y_SEGURIDAD_SOCIAL", "pago_seguro"),
        (os.path.join(PAGOS_FEB_DIR, "PA273595610_EMA.pdf"), "07_NOMINAS_Y_SEGURIDAD_SOCIAL", "caratula_imss"),
        (os.path.join(PAGOS_FEB_DIR, "ISN FEBRERO 2025.pdf"), "08_IMPUESTOS", "pago_isn"),
        (os.path.join(PAGOS_FEB_DIR, "OPINION IMSS.pdf"), "09_OPINIONES_POSITIVAS", "opinion_imss"),
        (os.path.join(PAGOS_FEB_DIR, "CSF INFONAVIT.pdf"), "09_OPINIONES_POSITIVAS", "opinion_infonavit"),
        (os.path.join(PAGOS_FEB_DIR, "OPINION DE CUMPLIMIENTO.pdf"), "09_OPINIONES_POSITIVAS", "opinion_sat")
    ]

    for src_path, category, field in file_mappings:
        if os.path.exists(src_path):
            dest_folder = os.path.join(UPLOAD_BASE_DIR, safe_oc, category)
            os.makedirs(dest_folder, exist_ok=True)
            dest_filename = f"{field}_{os.path.basename(src_path)}"
            dest_path = os.path.join(dest_folder, dest_filename)
            shutil.copy2(src_path, dest_path)
            
            if category not in current_docs:
                current_docs[category] = {}
            current_docs[category][field] = dest_path
            print(f"  ✅ Cargado: {category}/{field}")
        else:
            print(f"  ⚠️ No encontrado: {src_path}")

    # 5. Guardar cambios y actualizar flags
    db_exp.documents = current_docs
    db_exp.phase_1_ready = True
    db_exp.phase_2_ready = True
    db_exp.phase_3_ready = True
    db_exp.phase_4_ready = True
    
    session.merge(db_exp)
    session.commit()
    print(f"🚀 Expediente OC-44638 integrado exitosamente. ID: {db_exp.id}")
    session.close()

if __name__ == "__main__":
    load_seil_feb()
