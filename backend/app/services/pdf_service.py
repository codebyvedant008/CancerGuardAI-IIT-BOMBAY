import os
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from app.config import settings

class PDFService:
    @staticmethod
    def generate_report(
        user_info: dict,
        scan_date: datetime,
        cancer_type: str,
        prediction: str,
        confidence: float,
        recommendation: str,
        output_filename: str
    ) -> str:
        """
        Generates a premium PDF medical risk assessment report using Platypus.
        """
        os.makedirs(settings.REPORTS_DIR, exist_ok=True)
        pdf_path = os.path.join(settings.REPORTS_DIR, output_filename)
        
        # Setup Document
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=colors.HexColor("#0d9488"),
            spaceAfter=6
        )
        
        header_right_style = ParagraphStyle(
            'HeaderRight',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor("#1f2937"),
            alignment=TA_RIGHT
        )
        
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.HexColor("#1f2937"),
            spaceBefore=15,
            spaceAfter=10
        )
        
        # Header Table
        header_data = [
            [
                Paragraph("CancerGuard AI", title_style),
                Paragraph("<b>CONFIDENTIAL CLINICAL REPORT</b><br/>" + f"Date: {scan_date.strftime('%Y-%m-%d %H:%M')}", header_right_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[250, 250])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        
        elements.append(header_table)
        elements.append(HRFlowable(width="100%", color=colors.HexColor("#e5e7eb"), thickness=1, spaceBefore=10, spaceAfter=20))
        
        # Mock Scan ID
        scan_id = output_filename.split('.')[0][-8:].upper() if '.' in output_filename else str(uuid.uuid4())[-8:].upper()
        
        # Patient Details Section
        elements.append(Paragraph("Patient Demographics", section_heading))
        
        patient_data = [
            ["Full Name:", user_info.get("full_name", "N/A"), "Patient ID:", f"PT-{scan_id}"],
            ["Email:", user_info.get("email", "N/A"), "Scan ID:", f"SCN-{scan_id}"],
            ["Age:", str(user_info.get("age", "N/A")), "Gender:", str(user_info.get("gender", "N/A")).capitalize()],
        ]
        
        patient_table = Table(patient_data, colWidths=[80, 170, 80, 170])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#1f2937")),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTNAME', (3, 0), (3, -1), 'Helvetica'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0"))
        ]))
        elements.append(patient_table)
        
        # Clinical Assessment
        elements.append(Paragraph("Diagnostic AI Assessment", section_heading))
        
        # Risk color
        if prediction == "Low Risk":
            risk_color = colors.HexColor("#059669")
        elif prediction == "Medium Risk":
            risk_color = colors.HexColor("#d97706")
        else:
            risk_color = colors.HexColor("#dc2626")
            
        risk_style = ParagraphStyle(
            'RiskStyle',
            fontName='Helvetica-Bold',
            fontSize=12,
            textColor=risk_color
        )
        
        assessment_data = [
            ["Cancer Category:", cancer_type.replace("_", " ").title()],
            ["AI Probability Score:", f"{confidence}%"],
            ["Risk Classification:", Paragraph(prediction, risk_style)]
        ]
        
        assessment_table = Table(assessment_data, colWidths=[150, 350])
        assessment_table.setStyle(TableStyle([
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#475569")),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('LINEBELOW', (0, 0), (-1, -2), 0.5, colors.HexColor("#e2e8f0")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1"))
        ]))
        elements.append(assessment_table)
        
        # Recommendations
        elements.append(Paragraph("AI Recommendations", section_heading))
        
        rec_style = ParagraphStyle(
            'RecStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#334155")
        )
        
        rec_data = [[Paragraph(recommendation, rec_style)]]
        rec_table = Table(rec_data, colWidths=[500])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('PADDING', (0, 0), (-1, -1), 15),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0"))
        ]))
        elements.append(rec_table)
        
        # Physician Notes
        elements.append(Paragraph("Attending Physician Notes", section_heading))
        notes_data = [["\n\n\n"]]
        notes_table = Table(notes_data, colWidths=[500])
        notes_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
            ('BACKGROUND', (0, 0), (-1, -1), colors.white)
        ]))
        elements.append(notes_table)
        
        elements.append(Spacer(1, 40))
        
        # Signature
        sig_data = [
            ["___________________________", ""],
            ["Reviewing Physician Signature", f"Date: ____________"]
        ]
        sig_table = Table(sig_data, colWidths=[250, 250])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#475569"))
        ]))
        elements.append(sig_table)
        
        elements.append(Spacer(1, 40))
        
        # Medical Disclaimer
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            textColor=colors.HexColor("#991b1b"),
            alignment=TA_CENTER
        )
        
        disclaimer_text = (
            "IMPORTANT MEDICAL DISCLAIMER: This AI system provides risk assessment only "
            "and is not a substitute for professional medical diagnosis. The predictions generated "
            "are assistant insights. Always seek the advice of a qualified healthcare provider."
        )
        
        disc_data = [[Paragraph(disclaimer_text, disclaimer_style)]]
        disc_table = Table(disc_data, colWidths=[500])
        disc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#f87171")),
            ('PADDING', (0, 0), (-1, -1), 10)
        ]))
        elements.append(disc_table)
        
        # Build Document
        doc.build(elements)
        
        return pdf_path
