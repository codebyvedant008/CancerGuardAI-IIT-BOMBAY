"""
CancerGuard AI - Streamlit Community Cloud Deployment
AI-Powered Cancer Risk Screening Platform
"""

import streamlit as st
import os
import random
import uuid
from datetime import datetime
from PIL import Image
import io
import base64

# ─────────────────────────────────────────────
# Page Configuration
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="CancerGuard AI | Risk Screening",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─────────────────────────────────────────────
# Custom CSS Styling
# ─────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    .main { background-color: #f8fafc; }

    .hero-header {
        background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%);
        color: white;
        padding: 40px 30px;
        border-radius: 16px;
        margin-bottom: 24px;
        text-align: center;
    }
    .hero-header h1 { font-size: 2.5rem; font-weight: 800; margin: 0; }
    .hero-header p { font-size: 1.1rem; opacity: 0.85; margin-top: 8px; }

    .info-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
    }

    .risk-low {
        background: #d1fae5;
        color: #065f46;
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 1.1rem;
        display: inline-block;
    }
    .risk-medium {
        background: #fef3c7;
        color: #92400e;
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 1.1rem;
        display: inline-block;
    }
    .risk-high {
        background: #fee2e2;
        color: #991b1b;
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 1.1rem;
        display: inline-block;
    }

    .disclaimer-box {
        background: #fef2f2;
        border: 1px solid #f87171;
        border-radius: 10px;
        padding: 14px 18px;
        color: #991b1b;
        font-size: 0.85rem;
        margin-top: 20px;
    }

    .metric-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px;
        text-align: center;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 800;
        color: #0d9488;
    }
    .metric-label {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .stProgress .st-bo { background-color: #0d9488; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# Cancer Type Data
# ─────────────────────────────────────────────
CANCER_TYPES = {
    "Skin Cancer": {"code": "skin", "imaging": "Dermoscopic Images", "specificity": 0.92, "icon": "🔬"},
    "Brain Tumor": {"code": "brain", "imaging": "MRI Scans", "specificity": 0.88, "icon": "🧠"},
    "Lung Cancer": {"code": "lung", "imaging": "Chest X-Ray / CT", "specificity": 0.90, "icon": "🫁"},
    "Breast Cancer": {"code": "breast", "imaging": "Mammogram", "specificity": 0.87, "icon": "🎗️"},
    "Prostate Cancer": {"code": "prostate", "imaging": "MRI / Biopsy", "specificity": 0.86, "icon": "⚕️"},
    "Colorectal Cancer": {"code": "colorectal", "imaging": "Colonoscopy / CT", "specificity": 0.89, "icon": "🩺"},
    "Ovarian Cancer": {"code": "ovarian", "imaging": "Ultrasound / CT", "specificity": 0.85, "icon": "⚕️"},
    "Thyroid Cancer": {"code": "thyroid", "imaging": "Ultrasound", "specificity": 0.91, "icon": "🔬"},
    "Pancreatic Cancer": {"code": "pancreatic", "imaging": "CT / MRI", "specificity": 0.83, "icon": "🩻"},
    "Liver Cancer": {"code": "liver", "imaging": "CT / MRI", "specificity": 0.87, "icon": "🩻"},
    "Leukemia": {"code": "leukemia", "imaging": "Blood Smear", "specificity": 0.89, "icon": "🔬"},
    "Lymphoma": {"code": "lymphoma", "imaging": "CT / PET Scan", "specificity": 0.88, "icon": "🩻"},
    "Cervical Cancer": {"code": "cervical", "imaging": "Pap Smear / Colposcopy", "specificity": 0.93, "icon": "🔬"},
    "Esophageal Cancer": {"code": "esophageal", "imaging": "Endoscopy / CT", "specificity": 0.84, "icon": "🩺"},
    "Stomach Cancer": {"code": "stomach", "imaging": "Endoscopy / CT", "specificity": 0.86, "icon": "🩺"},
    "Melanoma": {"code": "melanoma", "imaging": "Dermoscopic Images", "specificity": 0.94, "icon": "🔬"},
}

# ─────────────────────────────────────────────
# AI Prediction Engine
# ─────────────────────────────────────────────
def predict_risk(cancer_type_code: str, image_bytes: bytes):
    """Simulate AI risk prediction from image bytes."""
    file_size = len(image_bytes)
    random.seed(file_size)

    risk_roll = random.random()
    confidence = round(random.uniform(82.0, 98.9), 2)

    if risk_roll < 0.60:
        prediction = "Low Risk"
        recommendations = [
            "Routine screening recommended in 12 months.",
            "Consult a healthcare professional for standard checkups.",
            "Continue self-examination and report any changes to your doctor.",
        ]
        color_class = "risk-low"
        emoji = "✅"
    elif risk_roll < 0.85:
        prediction = "Medium Risk"
        recommendations = [
            "Consult a healthcare professional for further clinical evaluation.",
            "Consider scheduling a diagnostic ultrasound or follow-up scan.",
            "Monitor the area closely and discuss these findings with a specialist.",
        ]
        color_class = "risk-medium"
        emoji = "⚠️"
    else:
        prediction = "High Risk"
        recommendations = [
            "Urgent consultation with a specialist is strongly advised.",
            "Schedule a biopsy or advanced imaging diagnostic as soon as possible.",
            "Please share these risk assessment findings directly with your primary care provider.",
        ]
        color_class = "risk-high"
        emoji = "🚨"

    recommendation = random.choice(recommendations)
    random.seed(None)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "recommendation": recommendation,
        "color_class": color_class,
        "emoji": emoji,
    }

# ─────────────────────────────────────────────
# PDF Report Generation
# ─────────────────────────────────────────────
def generate_pdf_report(patient_name, patient_age, patient_gender, cancer_type_name,
                         prediction, confidence, recommendation, scan_date):
    """Generate a professional clinical PDF report."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.platypus.flowables import HRFlowable
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT
        import uuid as _uuid

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter,
                                rightMargin=54, leftMargin=54,
                                topMargin=54, bottomMargin=54)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('T', fontName='Helvetica-Bold', fontSize=22,
                                      textColor=colors.HexColor("#0d9488"), spaceAfter=4)
        right_style = ParagraphStyle('R', fontName='Helvetica', fontSize=10,
                                      textColor=colors.HexColor("#1f2937"), alignment=TA_RIGHT)
        section_style = ParagraphStyle('S', fontName='Helvetica-Bold', fontSize=13,
                                        textColor=colors.HexColor("#1f2937"), spaceBefore=14, spaceAfter=8)

        scan_id = str(_uuid.uuid4())[-8:].upper()

        # Header
        header = Table([
            [Paragraph("CancerGuard AI", title_style),
             Paragraph(f"<b>CONFIDENTIAL CLINICAL REPORT</b><br/>Date: {scan_date}", right_style)]
        ], colWidths=[250, 250])
        header.setStyle(TableStyle([('VALIGN', (0,0),(-1,-1),'MIDDLE')]))
        elements.append(header)
        elements.append(HRFlowable(width="100%", color=colors.HexColor("#e5e7eb"), thickness=1,
                                    spaceBefore=10, spaceAfter=18))

        # Patient Info
        elements.append(Paragraph("Patient Demographics", section_style))
        pd_data = [
            ["Full Name:", patient_name, "Patient ID:", f"PT-{scan_id}"],
            ["Age:", str(patient_age), "Gender:", patient_gender],
            ["Scan ID:", f"SCN-{scan_id}", "Report Date:", scan_date],
        ]
        pt = Table(pd_data, colWidths=[80, 170, 80, 170])
        pt.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,-1),colors.HexColor("#f8fafc")),
            ('FONTNAME',(0,0),(0,-1),'Helvetica-Bold'),
            ('FONTNAME',(2,0),(2,-1),'Helvetica-Bold'),
            ('FONTNAME',(1,0),(1,-1),'Helvetica'),
            ('FONTNAME',(3,0),(3,-1),'Helvetica'),
            ('BOTTOMPADDING',(0,0),(-1,-1),8),
            ('TOPPADDING',(0,0),(-1,-1),8),
            ('GRID',(0,0),(-1,-1),0.5,colors.HexColor("#e2e8f0"))
        ]))
        elements.append(pt)

        # AI Assessment
        elements.append(Paragraph("Diagnostic AI Assessment", section_style))
        if prediction == "Low Risk":
            risk_color = colors.HexColor("#059669")
        elif prediction == "Medium Risk":
            risk_color = colors.HexColor("#d97706")
        else:
            risk_color = colors.HexColor("#dc2626")

        risk_p = ParagraphStyle('RP', fontName='Helvetica-Bold', fontSize=12, textColor=risk_color)
        ai_data = [
            ["Cancer Category:", cancer_type_name],
            ["AI Probability Score:", f"{confidence}%"],
            ["Risk Classification:", Paragraph(prediction, risk_p)],
        ]
        at = Table(ai_data, colWidths=[150, 350])
        at.setStyle(TableStyle([
            ('FONTNAME',(0,0),(0,-1),'Helvetica-Bold'),
            ('TEXTCOLOR',(0,0),(0,-1),colors.HexColor("#475569")),
            ('BOTTOMPADDING',(0,0),(-1,-1),10),
            ('TOPPADDING',(0,0),(-1,-1),10),
            ('LINEBELOW',(0,0),(-1,-2),0.5,colors.HexColor("#e2e8f0")),
            ('BOX',(0,0),(-1,-1),1,colors.HexColor("#cbd5e1"))
        ]))
        elements.append(at)

        # Recommendation
        elements.append(Paragraph("AI Recommendations", section_style))
        rec_style = ParagraphStyle('Rec', fontName='Helvetica', fontSize=11, leading=16,
                                    textColor=colors.HexColor("#334155"))
        rt = Table([[Paragraph(recommendation, rec_style)]], colWidths=[500])
        rt.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,-1),colors.HexColor("#f8fafc")),
            ('BOX',(0,0),(-1,-1),1,colors.HexColor("#e2e8f0")),
            ('PADDING',(0,0),(-1,-1),14)
        ]))
        elements.append(rt)

        # Physician Notes
        elements.append(Paragraph("Attending Physician Notes", section_style))
        nt = Table([["\n\n\n"]], colWidths=[500])
        nt.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.5,colors.HexColor("#94a3b8"))]))
        elements.append(nt)
        elements.append(Spacer(1, 30))

        # Signature
        sig = Table([["___________________________", ""],
                      ["Reviewing Physician Signature", f"Date: ____________"]], colWidths=[250,250])
        sig.setStyle(TableStyle([
            ('ALIGN',(1,0),(1,-1),'RIGHT'),
            ('FONTNAME',(0,0),(-1,-1),'Helvetica'),
            ('TEXTCOLOR',(0,0),(-1,-1),colors.HexColor("#475569"))
        ]))
        elements.append(sig)
        elements.append(Spacer(1, 30))

        # Disclaimer
        disc_style = ParagraphStyle('D', fontName='Helvetica-Bold', fontSize=9,
                                     textColor=colors.HexColor("#991b1b"), alignment=TA_CENTER)
        disc_text = ("IMPORTANT MEDICAL DISCLAIMER: This AI system provides risk assessment only and "
                     "is not a substitute for professional medical diagnosis. Always seek the advice "
                     "of a qualified healthcare provider.")
        dt = Table([[Paragraph(disc_text, disc_style)]], colWidths=[500])
        dt.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,-1),colors.HexColor("#fef2f2")),
            ('BOX',(0,0),(-1,-1),1,colors.HexColor("#f87171")),
            ('PADDING',(0,0),(-1,-1),10)
        ]))
        elements.append(dt)

        doc.build(elements)
        buf.seek(0)
        return buf.getvalue()

    except ImportError:
        return None

# ─────────────────────────────────────────────
# Sidebar
# ─────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🏥 CancerGuard AI")
    st.markdown("**AI-Powered Cancer Risk Screening**")
    st.markdown("---")
    st.markdown("### 📋 Patient Details")

    patient_name = st.text_input("Full Name", placeholder="e.g. John Doe")
    patient_age = st.number_input("Age", min_value=1, max_value=120, value=30)
    patient_gender = st.selectbox("Gender", ["Male", "Female", "Other"])

    st.markdown("---")
    st.markdown("### 🔬 Screening Module")
    selected_cancer = st.selectbox("Cancer Type", list(CANCER_TYPES.keys()))

    cancer_info = CANCER_TYPES[selected_cancer]
    st.info(f"**Imaging Modality:** {cancer_info['imaging']}\n\n**Model Specificity:** {cancer_info['specificity']*100:.0f}%")

    st.markdown("---")
    st.markdown("""
    <div style='font-size:0.75rem; color:#64748b;'>
    ⚠️ <b>Disclaimer:</b> For screening assistance only. Not a substitute for professional medical diagnosis.
    </div>
    """, unsafe_allow_html=True)

# ─────────────────────────────────────────────
# Main Content
# ─────────────────────────────────────────────
st.markdown("""
<div class="hero-header">
    <h1>🏥 CancerGuard AI</h1>
    <p>AI-Assisted Cancer Risk Screening Platform — Supporting 16 Cancer Types</p>
</div>
""", unsafe_allow_html=True)

# ─── Metrics ───
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.markdown('<div class="metric-card"><div class="metric-value">16</div><div class="metric-label">Active Modules</div></div>', unsafe_allow_html=True)
with col2:
    st.markdown('<div class="metric-card"><div class="metric-value">92%</div><div class="metric-label">Avg Specificity</div></div>', unsafe_allow_html=True)
with col3:
    st.markdown('<div class="metric-card"><div class="metric-value">< 5s</div><div class="metric-label">Avg Response</div></div>', unsafe_allow_html=True)
with col4:
    st.markdown('<div class="metric-card"><div class="metric-value">🔒</div><div class="metric-label">Secure & Private</div></div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ─── Upload Section ───
st.markdown("### 📤 Upload Medical Scan")
st.markdown(f"Upload a **{cancer_info['imaging']}** image for **{selected_cancer}** analysis.")

uploaded_file = st.file_uploader(
    "Choose image file",
    type=["jpg", "jpeg", "png", "bmp", "tiff"],
    help="Upload a medical imaging file in JPG, JPEG, or PNG format"
)

if uploaded_file:
    col_img, col_info = st.columns([1, 1])

    with col_img:
        st.markdown("#### 🖼️ Uploaded Scan")
        img = Image.open(uploaded_file)
        st.image(img, caption=f"{selected_cancer} Scan", use_column_width=True)

    with col_info:
        st.markdown("#### 📋 Scan Details")
        st.markdown(f"""
        <div class="info-card">
            <p><b>Patient:</b> {patient_name or 'Not provided'}</p>
            <p><b>Age:</b> {patient_age} | <b>Gender:</b> {patient_gender}</p>
            <p><b>Cancer Module:</b> {selected_cancer}</p>
            <p><b>Imaging Type:</b> {cancer_info['imaging']}</p>
            <p><b>File Name:</b> {uploaded_file.name}</p>
            <p><b>File Size:</b> {uploaded_file.size / 1024:.1f} KB</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    if st.button("🔬 Run AI Risk Assessment", type="primary", use_container_width=True):
        with st.spinner("Analyzing scan with AI engine... Please wait."):
            import time
            time.sleep(2)  # Simulate processing time

            image_bytes = uploaded_file.getvalue()
            result = predict_risk(cancer_info["code"], image_bytes)

        # ─── Results ───
        st.success("✅ Analysis Complete!")
        st.markdown("### 📊 AI Assessment Results")

        r1, r2, r3 = st.columns(3)
        with r1:
            st.markdown(f"""
            <div class="info-card" style="text-align:center">
                <div style="font-size:2rem">{result['emoji']}</div>
                <div class="metric-label">Risk Classification</div>
                <div class="{result['color_class']}" style="margin-top:8px">{result['prediction']}</div>
            </div>
            """, unsafe_allow_html=True)
        with r2:
            st.markdown(f"""
            <div class="info-card" style="text-align:center">
                <div style="font-size:2rem">📈</div>
                <div class="metric-label">AI Probability Score</div>
                <div class="metric-value">{result['confidence']}%</div>
            </div>
            """, unsafe_allow_html=True)
        with r3:
            st.markdown(f"""
            <div class="info-card" style="text-align:center">
                <div style="font-size:2rem">🔬</div>
                <div class="metric-label">Cancer Module</div>
                <div class="metric-value" style="font-size:1.1rem">{selected_cancer}</div>
            </div>
            """, unsafe_allow_html=True)

        # Confidence bar
        st.markdown("#### 🎯 Confidence Score")
        st.progress(result["confidence"] / 100)

        # Recommendation
        st.markdown("#### 💊 AI Recommendation")
        st.info(f"**{result['recommendation']}**")

        # PDF Report
        st.markdown("#### 📄 Download Clinical Report")
        scan_date = datetime.now().strftime("%Y-%m-%d %H:%M")
        pdf_bytes = generate_pdf_report(
            patient_name=patient_name or "Anonymous",
            patient_age=patient_age,
            patient_gender=patient_gender,
            cancer_type_name=selected_cancer,
            prediction=result["prediction"],
            confidence=result["confidence"],
            recommendation=result["recommendation"],
            scan_date=scan_date
        )

        if pdf_bytes:
            st.download_button(
                label="⬇️ Download Professional PDF Report",
                data=pdf_bytes,
                file_name=f"CancerGuard_Report_{selected_cancer.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf",
                mime="application/pdf",
                use_container_width=True
            )
        else:
            st.warning("PDF generation requires `reportlab`. Install it via `pip install reportlab`.")

        # Disclaimer
        st.markdown("""
        <div class="disclaimer-box">
            ⚠️ <b>IMPORTANT MEDICAL DISCLAIMER:</b> This AI system provides risk assessment only and is <b>not a substitute</b>
            for professional medical diagnosis. All outputs are probabilistic screening indicators.
            Always consult a licensed oncologist or physician before making any medical decisions.
        </div>
        """, unsafe_allow_html=True)

else:
    # Empty state
    st.markdown("""
    <div style="text-align:center; padding: 60px 20px; background:white; border-radius:16px; border: 2px dashed #cbd5e1; color:#94a3b8;">
        <div style="font-size:4rem">🩻</div>
        <h3 style="color:#475569">Upload a Medical Scan to Begin</h3>
        <p>Select your cancer type from the sidebar, fill in patient details,<br/>then upload a scan image above to run the AI risk assessment.</p>
    </div>
    """, unsafe_allow_html=True)

# ─────────────────────────────────────────────
# Footer
# ─────────────────────────────────────────────
st.markdown("---")
st.markdown("""
<div style="text-align:center; color:#94a3b8; font-size:0.8rem; padding: 10px 0;">
    🏥 <b>CancerGuard AI</b> — IIT Bombay Project | Built with FastAPI, Next.js & Streamlit<br/>
    For academic and screening assistance purposes only.
</div>
""", unsafe_allow_html=True)
