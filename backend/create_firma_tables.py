#!/usr/bin/env python3
"""
Script para crear las tablas del sistema de firmas electrónicas
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base, engine
from app.models.firma_electronica import DocumentoFirma, Firmante, HistorialFirma

def create_firma_tables():
    """Crear tablas de firmas electrónicas"""
    print("🔧 Creando tablas del sistema de firmas electrónicas...")
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente:")
        print("   - documentos_firma")
        print("   - firmantes")
        print("   - historial_firmas")
        print("\n📁 Directorio de almacenamiento: docs/firmas_electronicas/")
        
        # Create storage directory
        os.makedirs("docs/firmas_electronicas", exist_ok=True)
        print("✅ Directorio de almacenamiento creado")
        
        print("\n🎉 Sistema de firmas electrónicas listo para usar!")
        print("\n📖 Consulta docs/FIRMAS_ELECTRONICAS.md para más información")
        
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_firma_tables()
