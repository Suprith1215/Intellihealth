import React, { useState } from 'react';
import { 
  UploadCloud, FileText, Activity, AlertCircle, 
  CheckCircle2, Pill, Search, Stethoscope, Microscope, Video
} from 'lucide-react';
import { analyzeHealthReport, HealthAnalysisResult } from '../services/mockHealthAnalysisService';

const HealthReportAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    // Simulate async ML processing
    const data = await analyzeHealthReport(file);
    setResult(data);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="bg-[#1a1429] border border-white/5 text-white p-8 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold flex items-center mb-2">
            <Stethoscope className="w-8 h-8 mr-3 text-purple-400" />
            AI Medical Report Analyzer
          </h2>
          <p className="text-slate-400 mb-6">
            Upload your blood work or clinical reports. Our NLP & OCR models extract key biomarkers 
            to provide personalized recovery insights and supplement recommendations.
          </p>
          <a 
            href="https://esanjeevani.mohfw.gov.in/#/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-900/30"
          >
            <Video className="w-5 h-5 mr-2" />
            Consult a Doctor (eSanjeevani)
          </a>
        </div>
        <Microscope className="w-16 h-16 text-purple-900/50 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1429] p-6 rounded-xl shadow-sm border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Upload Document</h3>
            
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:bg-white/5'}`}>
              <input 
                type="file" 
                accept=".pdf,.jpg,.png" 
                onChange={handleFileChange}
                className="hidden" 
                id="report-upload"
              />
              <label htmlFor="report-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="text-sm font-medium text-slate-300">
                  {file ? file.name : "Drop PDF or Image here"}
                </span>
                <span className="text-xs text-slate-500 mt-2">Max size: 10MB</span>
              </label>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className={`w-full mt-4 py-3 rounded-lg font-bold text-white transition-all ${
                !file || isAnalyzing 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/30'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <Search className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                </span>
              ) : 'Analyze Report'}
            </button>
          </div>

          <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200 leading-relaxed">
              <strong>Disclaimer:</strong> This tool uses AI for information purposes only. 
              It is not a substitute for professional medical advice.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center bg-[#1a1429] rounded-xl border border-white/5 p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
              <h3 className="text-lg font-semibold text-white">Scanning Document...</h3>
              <p className="text-slate-400 text-sm mt-2">Extracting biomarkers and checking reference ranges</p>
            </div>
          )}

          {!isAnalyzing && !result && (
            <div className="h-full flex flex-col items-center justify-center bg-[#1a1429] rounded-xl border-2 border-dashed border-white/10 p-12 text-slate-500">
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <p>Upload a report to see AI-generated insights.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-[#1a1429] p-6 rounded-xl shadow-sm border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Overall Health Score</h3>
                  <p className="text-slate-400 text-sm">Based on extracted biomarkers</p>
                </div>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center text-xl font-bold text-white bg-purple-900/20">
                    {result.overallScore}
                  </div>
                </div>
              </div>

              {/* Biomarkers */}
              <div className="bg-[#1a1429] rounded-xl shadow-sm border border-white/5 overflow-hidden">
                <div className="bg-white/5 px-6 py-4 border-b border-white/5 font-bold text-white">
                  Key Findings
                </div>
                <div className="divide-y divide-white/5">
                  {result.findings.map((finding, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5">
                      <div className="flex items-center">
                        <Activity className={`w-5 h-5 mr-3 ${finding.status === 'Attention' ? 'text-red-400' : 'text-green-400'}`} />
                        <div>
                          <p className="font-semibold text-slate-200">{finding.parameter}</p>
                          <p className="text-xs text-slate-500">{finding.value} (Ref: {finding.reference})</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        finding.status === 'Attention' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {finding.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-[#1a1429] rounded-xl shadow-sm border border-white/5 overflow-hidden">
                <div className="bg-purple-900/20 px-6 py-4 border-b border-purple-500/20 flex items-center">
                  <Pill className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="font-bold text-purple-200">AI-Suggested Protocol</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="border border-white/10 rounded-lg p-4 bg-white/5">
                      <h4 className="font-bold text-white mb-1">{rec.name}</h4>
                      <p className="text-xs text-purple-400 font-semibold mb-2">{rec.type}</p>
                      <p className="text-sm text-slate-400">{rec.reason}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/5 text-xs text-slate-500 text-center">
                  * Discuss these recommendations with your healthcare provider before starting.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthReportAnalyzer;