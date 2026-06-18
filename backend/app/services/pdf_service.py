import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
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
        Generates a premium PDF medical risk assessment report.
        """
        os.makedirs(settings.REPORTS_DIR, exist_ok=True)
        pdf_path = os.path.join(settings.REPORTS_DIR, output_filename)
        
        # Create Letter Page Canvas
        c = canvas.Canvas(pdf_path, pagesize=letter)
        width, height = letter
        
        # Color Palette
        primary_color = colors.HexColor("#0d9488")  # Teal
        dark_neutral = colors.HexColor("#1f2937")    # Gray 800
        light_neutral = colors.HexColor("#f3f4f6")   # Gray 100
        border_color = colors.HexColor("#e5e7eb")    # Gray 200
        
        # Risk Badge Colors
        if prediction == "Low Risk":
            badge_bg = colors.HexColor("#d1fae5")
            badge_fg = colors.HexColor("#065f46")
        elif prediction == "Medium Risk":
            badge_bg = colors.HexColor("#fef3c7")
            badge_fg = colors.HexColor("#92400e")
        else:  # High Risk
            badge_bg = colors.HexColor("#fee2e2")
            badge_fg = colors.HexColor("#991b1b")
            
        # Draw Background Decor (Top Header Band)
        c.setFillColor(primary_color)
        c.rect(0, height - 12, width, 12, fill=True, stroke=False)
        
        # Header - Brand & Document Title
        c.setFillColor(primary_color)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(54, height - 50, "CancerGuard AI")
        
        c.setFillColor(dark_neutral)
        c.setFont("Helvetica", 10)
        c.drawRightString(width - 54, height - 40, "AUTOMATED RISK ASSESSMENT REPORT")
        c.drawRightString(width - 54, height - 52, f"Date: {scan_date.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Header Divider
        c.setStrokeColor(border_color)
        c.setLineWidth(1)
        c.line(54, height - 65, width - 54, height - 65)
        
        # Patient Details Section
        c.setFillColor(dark_neutral)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(54, height - 90, "Patient Details")
        
        # Patient Details Grid
        c.setFillColor(light_neutral)
        c.rect(54, height - 165, width - 108, 60, fill=True, stroke=False)
        
        c.setFillColor(dark_neutral)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(70, height - 115, "Full Name:")
        c.drawString(70, height - 135, "Email:")
        c.drawString(340, height - 115, "Age:")
        c.drawString(340, height - 135, "Gender:")
        
        c.setFont("Helvetica", 10)
        c.drawString(140, height - 115, user_info.get("full_name", "N/A"))
        c.drawString(140, height - 135, user_info.get("email", "N/A"))
        c.drawString(390, height - 115, str(user_info.get("age", "N/A")))
        c.drawString(390, height - 135, str(user_info.get("gender", "N/A")).capitalize())
        
        # Assessment Section
        c.setFont("Helvetica-Bold", 14)
        c.drawString(54, height - 200, "Scan Risk Assessment")
        
        # Scan Info Box
        c.setStrokeColor(border_color)
        c.rect(54, height - 320, width - 108, 100, fill=False, stroke=True)
        
        c.setFont("Helvetica-Bold", 11)
        c.drawString(70, height - 235, "Cancer Category:")
        c.drawString(70, height - 265, "Assessment Result:")
        c.drawString(70, height - 295, "Model Confidence:")
        
        c.setFont("Helvetica", 11)
        c.drawString(180, height - 235, cancer_type.replace("_", " ").title())
        
        # Draw Risk Badge
        c.setFillColor(badge_bg)
        # badge width is ~100pt, height 18pt
        c.rect(180, height - 271, 100, 18, fill=True, stroke=False)
        c.setFillColor(badge_fg)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(230, height - 266, prediction)
        
        c.setFillColor(dark_neutral)
        c.setFont("Helvetica", 11)
        c.drawString(180, height - 295, f"{confidence}%")
        
        # Recommendation Section
        c.setFont("Helvetica-Bold", 14)
        c.drawString(54, height - 350, "AI Recommendations")
        
        c.setFillColor(light_neutral)
        c.rect(54, height - 440, width - 108, 70, fill=True, stroke=False)
        
        c.setFillColor(dark_neutral)
        c.setFont("Helvetica-Oblique", 11)
        # Wrap recommendation text
        rec_text = recommendation
        if len(rec_text) > 85:
            # simple split
            line1 = rec_text[:85] + "-" if not rec_text[85].isspace() else rec_text[:85]
            line2 = rec_text[85:].strip()
            c.drawString(70, height - 390, line1)
            c.drawString(70, height - 410, line2)
        else:
            c.drawString(70, height - 400, rec_text)
            
        # Clinical Disclaimer Section (Strictly Required)
        c.setFillColor(colors.HexColor("#fef2f2"))
        c.rect(54, 80, width - 108, 60, fill=True, stroke=True)
        c.setStrokeColor(colors.HexColor("#f87171"))
        c.rect(54, 80, width - 108, 60, fill=False, stroke=True)
        
        c.setFillColor(colors.HexColor("#991b1b"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(70, 120, "IMPORTANT MEDICAL DISCLAIMER:")
        
        c.setFont("Helvetica", 9)
        disclaimer_line1 = "This AI system provides risk assessment only and is not a substitute for professional medical diagnosis."
        disclaimer_line2 = "The predictions generated are assistant insights. Always seek the advice of a qualified healthcare provider."
        c.drawString(70, 105, disclaimer_line1)
        c.drawString(70, 93, disclaimer_line2)
        
        # Footer
        c.setFillColor(colors.HexColor("#9ca3af"))
        c.setFont("Helvetica", 8)
        c.drawString(54, 40, "Report generated automatically by CancerGuard AI platform.")
        c.drawRightString(width - 54, 40, "Page 1 of 1")
        
        c.save()
        return pdf_path
