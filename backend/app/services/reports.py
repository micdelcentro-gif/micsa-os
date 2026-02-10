# MICSA OS - Report Generation Service
from fpdf import FPDF
import io
from datetime import datetime

class DailyReportPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'GRUPO MICSA – REPORTE DIARIO', 0, 1, 'L')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

class ReportService:
    @staticmethod
    def generate_daily_report_pdf(data: dict) -> bytes:
        pdf = DailyReportPDF()
        pdf.add_page()
        pdf.set_font('Arial', '', 11)
        
        # Header Info
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(40, 8, "Proyecto:", 0, 0)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 8, str(data.get('nombre', 'N/A')), 0, 1)

        pdf.set_font('Arial', 'B', 11)
        pdf.cell(40, 8, "Ubicación:", 0, 0)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 8, str(data.get('ubicacion', 'N/A')), 0, 1)

        pdf.set_font('Arial', 'B', 11)
        pdf.cell(40, 8, "Fecha:", 0, 0)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 8, datetime.now().strftime('%d/%m/%Y %H:%M'), 0, 1)
        
        pdf.ln(10)
        
        # Activities
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, "Avances y Actividades:", 0, 1)
        pdf.set_font('Arial', '', 11)
        activities = data.get('activities', [])
        if not activities:
            for _ in range(3):
                pdf.cell(0, 8, "- ____________________________________________", 0, 1)
        else:
            for act in activities:
                pdf.cell(0, 8, f"- {act}", 0, 1)
        pdf.ln(5)

        # Incidents
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, "Incidencias / Riesgos:", 0, 1)
        pdf.set_font('Arial', '', 11)
        incidents = data.get('incidents', [])
        if not incidents:
            for _ in range(2):
                pdf.cell(0, 8, "- ____________________________________________", 0, 1)
        else:
            for inc in incidents:
                pdf.cell(0, 8, f"- {inc}", 0, 1)
        pdf.ln(5)

        # Safety
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, "EPP / Seguridad / Cumplimiento:", 0, 1)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 8, f"- EPP: {'[X]' if data.get('eppOk') else '[ ]'}  - DC3: {'[X]' if data.get('dc3Ok') else '[ ]'}  - Médicos: {'[X]' if data.get('medOk') else '[ ]'}", 0, 1)
        pdf.cell(0, 8, f"- Personal en sitio: {data.get('peopleCount', '___')}", 0, 1)
        pdf.ln(20)

        # Signatures
        curr_y = pdf.get_y()
        pdf.line(10, curr_y, 70, curr_y)
        pdf.set_xy(10, curr_y + 2)
        pdf.cell(60, 10, "Residente MICSA", 0, 0, 'C')
        
        pdf.line(130, curr_y, 190, curr_y)
        pdf.set_xy(130, curr_y + 2)
        pdf.cell(60, 10, "Representante Cliente", 0, 0, 'C')

        return pdf.output()
