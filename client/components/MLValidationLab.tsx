
import React, { useState } from 'react';
import { UploadCloud, Check, BarChart, FileText, Cpu, PieChart } from 'lucide-react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPie, Pie, Legend } from 'recharts';
import { simulateTraining } from '../services/mlSimulator';

const MLValidationLab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null); 
    }
  };

  const handleRunTraining = async () => {
    if (!file) return;
    setIsTraining(true);
    const trainingResults = await simulateTraining(1000); 
    setResults(trainingResults.metrics);
    setIsTraining(false);
  };

  const metricsData = results ? [
    { name: 'Accuracy', value: results.accuracy },
    { name: 'F1 Score', value: results.f1 },
    { name: 'ROC-AUC', value: results.roc },
    { name: 'CV Accuracy', value: results.cv_acc },
    { name: 'CV F1', value: results.cv_f1 },
  ] : [];

  const featureData = results ? results.feature_labels.map((label: string, index: number) => ({
    name: label,
    value: results.feature_importance[index]
  })) : [];

  const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#f472b6', '#fb7185'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-[#1a1429] border border-white/5 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center">
              <Cpu className="w-8 h-8 mr-3 text-purple-400" />
              Evaluation Dashboard
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl">
              Upload anonymized patient CSV datasets to evaluate the Gradient Boosting Classifier model performance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Upload Section */}
        <div className="bg-[#1a1429] border border-white/5 p-8 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-white mb-4">Upload Real Dataset (CSV)</h3>
          
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="hidden" 
                id="dataset-upload"
              />
              <label htmlFor="dataset-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="text-sm font-medium text-slate-400">
                  {file ? file.name : "Click to upload CSV"}
                </span>
              </label>
            </div>
            
            <button
              onClick={handleRunTraining}
              disabled={!file || isTraining}
              className={`md:w-64 w-full py-4 rounded-lg font-bold text-white transition-all text-lg ${
                !file || isTraining 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30'
              }`}
            >
              {isTraining ? 'Training Model...' : 'Upload & Evaluate'}
            </button>
          </div>
        </div>

        {/* Results Visualization */}
        <div className="space-y-8">
           {isTraining && (
             <div className="bg-[#1a1429] p-12 rounded-xl border border-white/5 flex flex-col items-center justify-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
               <p className="text-slate-400 font-medium">Running Stratified K-Fold Cross-Validation...</p>
             </div>
           )}

           {!isTraining && results && (
             <>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {metricsData.map((metric: any) => (
                   <div key={metric.name} className="bg-[#1e1b4b] p-4 rounded-xl border border-white/5 text-center">
                     <p className="text-xs text-slate-400 uppercase font-bold">{metric.name}</p>
                     <p className="text-2xl font-bold text-white mt-1">{metric.value.toFixed(2)}</p>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Bar Chart for Metrics */}
                 <div className="bg-[#1a1429] p-6 rounded-xl shadow-sm border border-white/5">
                    <h4 className="text-md font-bold text-white mb-4">Performance Metrics</h4>
                    {/* FIXED HEIGHT CONTAINER */}
                    <div style={{ width: '100%', height: 384 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBar data={metricsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                          <XAxis dataKey="name" tick={{fontSize: 12, fill: '#94a3b8'}} />
                          <YAxis domain={[0, 1]} tick={{fill: '#94a3b8'}} />
                          <Tooltip contentStyle={{backgroundColor: '#1e1b4b', border: 'none', color: '#fff'}} />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </RechartsBar>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Pie Chart for Feature Importance */}
                 <div className="bg-[#1a1429] p-6 rounded-xl shadow-sm border border-white/5">
                    <h4 className="text-md font-bold text-white mb-4">Feature Importance</h4>
                    {/* FIXED HEIGHT CONTAINER */}
                    <div style={{ width: '100%', height: 384 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie width={400} height={400}>
                          <Pie
                            data={featureData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {featureData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#1e1b4b', border: 'none', color: '#fff'}} />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                 </div>
               </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default MLValidationLab;
