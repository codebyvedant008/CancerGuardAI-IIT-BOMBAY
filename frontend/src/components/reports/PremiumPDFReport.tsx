import React, { forwardRef } from 'react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';

interface PremiumPDFReportProps {
  scan: any;
  patient: any;
  insights: any;
  metadata: any;
}

const ss = (obj: React.CSSProperties): React.CSSProperties => obj;

const PremiumPDFReport = forwardRef<HTMLDivElement, PremiumPDFReportProps>(
  ({ scan, patient, insights, metadata }, ref) => {
    const reportDate   = format(new Date(), 'MMMM dd, yyyy');
    const reportTime   = format(new Date(), 'h:mm a');
    const reportId     = `CGR-${(scan?.prediction?.id || scan?.id || 'XXXX').toUpperCase().slice(0, 8)}`;
    const confidence   = scan?.prediction?.confidence ?? 0;
    const riskLabel    = scan?.prediction?.prediction_label ?? 'Unknown';
    const cancerType   = (scan?.cancer_type ?? 'unknown').replace(/_/g, ' ');
    const patientName  = patient?.full_name ?? 'N/A';
    const patientId    = `PT-${(patient?.id ?? '0000').toString().toUpperCase().slice(0, 6)}`;
    const scanDate     = scan?.created_at ? format(new Date(scan.created_at), 'dd MMM yyyy') : 'N/A';
    const imageSrc     = scan?.image_path ? `http://localhost:8000/api/scans/image/${scan.image_path}` : null;

    const isHigh  = riskLabel.toLowerCase().includes('high') || riskLabel.toLowerCase().includes('malignant');
    const isMed   = riskLabel.toLowerCase().includes('medium') || riskLabel.toLowerCase().includes('moderate');
    const rClr    = isHigh ? '#DC2626' : isMed ? '#D97706' : '#059669';
    const rBg     = isHigh ? '#FEF2F2' : isMed ? '#FFFBEB' : '#F0FDF4';
    const rBorder = isHigh ? '#FECACA' : isMed ? '#FDE68A' : '#86EFAC';
    const rBadge  = isHigh ? 'HIGH PRIORITY' : isMed ? 'OBSERVATION' : 'LOW RISK — NORMAL';
    const healthScore = isHigh ? Math.round(100 - confidence) : isMed ? 65 : Math.round(confidence);
    const circumference = 2 * Math.PI * 42;
    const dashOffset = circumference - (confidence / 100) * circumference;

    const ROW = (label: string, value: string, last = false) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
        <span style={{ fontSize: '8.5px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '9.5px', color: '#1E293B', fontWeight: 700 }}>{value}</span>
      </div>
    );

    const CARD = (label: string, value: string, color: string) => (
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '7.5px', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '1.2px' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '9px', color: '#475569', lineHeight: 1.55 }}>{value}</p>
      </div>
    );

    return (
      <div className="pdf-print-content" ref={ref}
        style={ss({ width: '210mm', background: '#FFFFFF', fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#1E293B' })}>

        {/* ═══ HEADER ═══ */}
        <div style={ss({ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 65%,#134E4A 100%)', padding: '20px 28px 14px' })}>
          <div style={ss({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <div style={ss({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 })}>
                <div style={ss({ width: 28, height: 28, background: 'linear-gradient(135deg,#14B8A6,#06B6D4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span style={ss({ fontSize: 20, fontWeight: 900, color: '#FFF', letterSpacing: -0.5 })}>CancerGuard AI</span>
                <span style={ss({ fontSize: 8, fontWeight: 700, color: '#14B8A6', background: 'rgba(20,184,166,0.15)', padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(20,184,166,0.3)', letterSpacing: 1 })}>VERIFIED</span>
              </div>
              <p style={ss({ color: '#94A3B8', fontSize: 8, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', margin: 0 })}>AI-Powered Cancer Diagnostic Report</p>
            </div>
            <div style={ss({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 })}>
              <div style={ss({ background: 'white', padding: 5, borderRadius: 6 })}><QRCode value={`https://cancerguard.ai/verify/${reportId}`} size={56} /></div>
              <div style={ss({ textAlign: 'right' })}>
                <p style={ss({ margin: 0, fontSize: 7.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.5 })}>Report ID</p>
                <p style={ss({ margin: 0, fontSize: 9, fontWeight: 700, color: '#94A3B8', fontFamily: 'monospace' })}>{reportId}</p>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div style={ss({ display: 'flex', gap: 24, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' })}>
            {[['Date', reportDate], ['Time', reportTime], ['Engine', 'CG-Net v2.1 + Gemini'], ['Classification', 'Confidential Medical']].map(([l, v]) => (
              <div key={l}>
                <p style={ss({ margin: '0 0 1px', fontSize: 7, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.5 })}>{l}</p>
                <p style={ss({ margin: 0, fontSize: 9, fontWeight: 600, color: '#CBD5E1' })}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ BODY ═══ */}
        <div style={ss({ padding: '16px 28px 0', background: '#F8FAFC' })}>

          {/* Patient + Scan row */}
          <div style={ss({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 })}>
            {[
              { title: 'Patient Information', rows: [['Full Name', patientName], ['Patient ID', patientId], ['Scan Date', scanDate], ['Facility', 'CancerGuard Network'], ['Physician', metadata.specialist]] },
              { title: 'Scan Details', rows: [['Scan Type', cancerType.toUpperCase() + ' Screening'], ['Body Region', metadata.region], ['AI Engine', 'CG-Net v3 + Gemini'], ['Modality', 'Deep Learning'], ['Report ID', reportId]] },
            ].map(({ title, rows }) => (
              <div key={title} style={ss({ background: '#FFF', borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden' })}>
                <div style={ss({ background: '#1E293B', padding: '7px 14px' })}>
                  <p style={ss({ margin: 0, color: '#94A3B8', fontSize: 7.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' })}>{title}</p>
                </div>
                <div style={ss({ padding: '8px 14px' })}>
                  {rows.map(([l, v], i) => ROW(l, v, i === rows.length - 1))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Result */}
          <div style={ss({ background: rBg, border: `1.5px solid ${rBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 20 })}>
            {/* Ring gauge */}
            <div style={ss({ position: 'relative', width: 100, height: 100, flexShrink: 0 })}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke={rClr} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}/>
              </svg>
              <div style={ss({ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })}>
                <span style={ss({ fontSize: 18, fontWeight: 900, color: rClr, lineHeight: 1 })}>{confidence}%</span>
                <span style={ss({ fontSize: 7, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 })}>Confidence</span>
              </div>
            </div>

            <div style={ss({ flex: 1 })}>
              <span style={ss({ display: 'inline-block', background: rClr, color: 'white', fontSize: 7.5, fontWeight: 800, padding: '1.5px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 })}>{rBadge}</span>
              <h2 style={ss({ fontSize: 26, fontWeight: 900, color: rClr, margin: '0 0 5px', letterSpacing: -0.5 })}>{riskLabel}</h2>
              <p style={ss({ fontSize: 9.5, color: '#475569', lineHeight: 1.55, margin: '0 0 10px' })}>
                {insights?.medical_summary || `The CancerGuard AI neural network analyzed the ${cancerType} scan and generated this risk classification.`}
              </p>
              <div style={ss({ display: 'flex', gap: 10, alignItems: 'center' })}>
                <div style={ss({ textAlign: 'center', background: 'white', padding: '5px 12px', borderRadius: 7, border: `1px solid ${rBorder}` })}>
                  <p style={ss({ margin: 0, fontSize: 15, fontWeight: 900, color: rClr })}>{confidence}%</p>
                  <p style={ss({ margin: 0, fontSize: 7, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' })}>AI Confidence</p>
                </div>
                <div style={ss({ textAlign: 'center', background: 'white', padding: '5px 12px', borderRadius: 7, border: `1px solid ${rBorder}` })}>
                  <p style={ss({ margin: 0, fontSize: 15, fontWeight: 900, color: rClr })}>{healthScore}/100</p>
                  <p style={ss({ margin: 0, fontSize: 7, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' })}>Health Score</p>
                </div>
                {imageSrc && (
                  <div style={ss({ background: 'white', padding: 2, borderRadius: 7, border: `1px solid ${rBorder}`, lineHeight: 0 })}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt="Scan" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 5, display: 'block' }}/>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gemini Analysis */}
          {insights && (
            <>
              <div style={ss({ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 })}>
                <div style={ss({ width: 16, height: 16, background: 'linear-gradient(135deg,#14B8A6,#06B6D4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27z"/></svg>
                </div>
                <p style={ss({ margin: 0, fontSize: 9, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 1.5 })}>Google Gemini Medical Analysis</p>
                <div style={ss({ height: 1, flex: 1, background: '#E2E8F0' })}/>
              </div>

              <div style={ss({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 })}>
                {CARD('Clinical Interpretation', insights.clinical_interpretation, '#14B8A6')}
                {CARD('Patient-Friendly Explanation', insights.patient_friendly_explanation, '#6366F1')}
              </div>
              <div style={ss({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 })}>
                {CARD('Preventive Advice', insights.preventive_advice, '#059669')}
                {CARD('Lifestyle Recommendations', insights.lifestyle_recommendations, '#D97706')}
                {CARD('Suggested Follow-Up', insights.suggested_follow_up, '#64748B')}
              </div>
            </>
          )}

          {/* Risk Factors + Doctor Questions */}
          <div style={ss({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 })}>
            <div style={ss({ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 })}>
              <p style={ss({ margin: '0 0 7px', fontSize: 7.5, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: 1.2 })}>Known Risk Factors</p>
              {(metadata.factors || []).map((f: string, i: number) => (
                <div key={i} style={ss({ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 })}>
                  <div style={ss({ width: 5, height: 5, borderRadius: '50%', background: rClr, flexShrink: 0 })}/>
                  <span style={ss({ fontSize: 9, color: '#475569', fontWeight: 500 })}>{f}</span>
                </div>
              ))}
            </div>
            {insights?.questions_to_discuss ? (
              <div style={ss({ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 10 })}>
                <p style={ss({ margin: '0 0 7px', fontSize: 7.5, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: 1.2 })}>Questions for Your Doctor</p>
                {insights.questions_to_discuss.split('\n').filter((q: string) => q.trim()).slice(0, 3).map((q: string, i: number) => (
                  <div key={i} style={ss({ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 4 })}>
                    <span style={ss({ fontSize: 9, color: '#D97706', fontWeight: 900, flexShrink: 0 })}>›</span>
                    <span style={ss({ fontSize: 9, color: '#92400E', fontWeight: 500, lineHeight: 1.45 })}>{q.replace(/^[•\-]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            ) : <div/>}
          </div>

          {/* Disclaimer */}
          <div style={ss({ background: '#1E293B', borderRadius: 8, padding: '10px 16px', marginBottom: 0 })}>
            <p style={ss({ margin: '0 0 4px', fontSize: 7.5, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 2 })}>⚠ Strict Medical Disclaimer</p>
            <p style={ss({ margin: 0, fontSize: 8.5, color: '#94A3B8', lineHeight: 1.55 })}>
              This report is generated by an Artificial Intelligence system and is intended for informational purposes ONLY. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional. CancerGuard AI makes no warranties regarding prediction accuracy.
            </p>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={ss({ background: '#0F172A', padding: '10px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 })}>
          <span style={ss({ fontSize: 11, fontWeight: 900, color: '#CBD5E1' })}>CancerGuard AI <span style={{ fontSize: 8.5, color: '#475569', marginLeft: 6 }}>v2.1.0-prod</span></span>
          <span style={ss({ fontSize: 8.5, color: '#475569', fontFamily: 'monospace' })}>{reportId} · {reportDate} · cancerguard.ai</span>
          <span style={ss({ fontSize: 8.5, color: '#475569' })}>Page 1 of 1</span>
        </div>
      </div>
    );
  }
);

PremiumPDFReport.displayName = 'PremiumPDFReport';
export default PremiumPDFReport;
