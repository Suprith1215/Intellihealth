export interface Biomarker {
  parameter: string;
  value: string;
  reference: string;
  status: 'Normal' | 'Attention';
}

export interface MedicationRec {
  name: string;
  type: 'Supplement' | 'Medication' | 'Lifestyle';
  reason: string;
}

export interface HealthAnalysisResult {
  overallScore: number;
  findings: Biomarker[];
  recommendations: MedicationRec[];
}

export const analyzeHealthReport = (file: File): Promise<HealthAnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock Logic: In a real app, this would send the file to Python/Flask
      // containing Tesseract OCR and BioBERT for extraction.
      
      resolve({
        overallScore: 78,
        findings: [
          { 
            parameter: "ALT (Liver Enzyme)", 
            value: "55 U/L", 
            reference: "7-56 U/L", 
            status: "Normal" 
          },
          { 
            parameter: "Cortisol (Stress Hormone)", 
            value: "22 mcg/dL", 
            reference: "6-23 mcg/dL", 
            status: "Attention" 
          },
          { 
            parameter: "Vitamin D (25-OH)", 
            value: "18 ng/mL", 
            reference: "20-50 ng/mL", 
            status: "Attention" 
          },
          { 
            parameter: "Magnesium", 
            value: "1.6 mg/dL", 
            reference: "1.7-2.2 mg/dL", 
            status: "Attention" 
          }
        ],
        recommendations: [
          {
            name: "Ashwagandha KSM-66",
            type: "Supplement",
            reason: "Indicated for high Cortisol levels to reduce stress response and improve sleep quality."
          },
          {
            name: "Vitamin D3 + K2",
            type: "Supplement",
            reason: "Deficiency detected (18 ng/mL). Essential for mood regulation and immune health."
          },
          {
            name: "Magnesium Glycinate",
            type: "Supplement",
            reason: "Low magnesium levels contribute to anxiety and muscle tension. Glycinate form is best for relaxation."
          },
          {
            name: "Milk Thistle (Silymarin)",
            type: "Supplement",
            reason: "Proactive liver support, as ALT levels are near the upper limit of the normal range."
          }
        ]
      });
    }, 2500); // 2.5s simulated processing delay
  });
};