
import React, { useState, useEffect } from 'react';
import {
  Folder, FileCode, ChevronRight, ChevronDown,
  Save, Download, Cpu, Layers, Box, Terminal,
  Activity, Database, BrainCircuit, Share2,
  FileJson, FileType, FileText, Image as ImageIcon,
  Layout as LayoutIcon, Lock
} from 'lucide-react';
import { FileNode, INITIAL_PROJECT_STRUCTURE } from '../services/mockFileSystem';
import { useToast } from '../contexts/ToastContext';

// --- Sub-components for internal use ---

const getFileIcon = (filename: string, className: string = "w-4 h-4 mr-2") => {
  const ext = filename.split('.').pop();
  switch (ext) {
    case 'tsx':
    case 'ts':
      return <FileCode className={`${className} text-blue-400`} />;
    case 'py':
      return <Terminal className={`${className} text-yellow-400`} />;
    case 'json':
      return <FileJson className={`${className} text-orange-400`} />;
    case 'md':
      return <FileText className={`${className} text-slate-400`} />;
    case 'css':
      return <FileType className={`${className} text-sky-300`} />;
    case 'png':
    case 'jpg':
    case 'svg':
      return <ImageIcon className={`${className} text-purple-400`} />;
    case 'pkl':
    case 'bin':
    case 'h5':
      return <Database className={`${className} text-emerald-400`} />;
    case 'lock':
      return <Lock className={`${className} text-red-400`} />;
    default:
      return <FileCode className={`${className} text-slate-500`} />;
  }
};

const FileTreeItem: React.FC<{
  node: FileNode;
  depth: number;
  activeFile: string | null;
  currentPath: string[];
  onSelect: (node: FileNode, path: string[]) => void;
}> = ({ node, depth, activeFile, currentPath, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder';
  const nodePath = [...currentPath, node.name];

  // Auto-expand if active file is inside this folder (simple heuristic could be added here if needed)
  // For now, manual toggle.

  const handleClick = () => {
    if (isFolder) setIsOpen(!isOpen);
    else onSelect(node, nodePath);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center py-1.5 px-2 cursor-pointer transition-colors border-l-2 select-none ${activeFile === node.name && !isFolder
            ? 'bg-slate-800 border-teal-500 text-teal-400'
            : 'border-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white'
          }`}
        style={{ paddingLeft: `${depth * 12 + 10}px` }}
      >
        <span className="mr-1 opacity-70">
          {isFolder ? (
            isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : (
            <span className="w-3 h-3 block" />
          )}
        </span>
        {isFolder ? <Folder className="w-4 h-4 mr-2 text-indigo-400 fill-indigo-400/20" /> : getFileIcon(node.name)}
        <span className="text-sm truncate font-medium">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div className="animate-fade-in-down">
          {node.children.map((child, idx) => (
            <FileTreeItem
              key={idx}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              currentPath={nodePath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MLModelCard: React.FC<{
  title: string;
  algorithm: string;
  accuracy: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, algorithm, accuracy, description, icon }) => (
  <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-teal-500 transition-colors group">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-slate-900 rounded-lg group-hover:bg-teal-900/30 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-mono text-teal-400 bg-teal-900/20 px-2 py-1 rounded">
        Acc: {accuracy}
      </span>
    </div>
    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
    <p className="text-xs text-blue-400 font-mono mb-3">{algorithm}</p>
    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
  </div>
);

// --- Main Developer Hub ---

const DeveloperHub: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'code' | 'ml'>('code');
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [activeBreadcrumbs, setActiveBreadcrumbs] = useState<string[]>([]);
  const [codeContent, setCodeContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Initialize with app.py selected
  useEffect(() => {
    const backend = INITIAL_PROJECT_STRUCTURE.find(n => n.name === 'backend');
    const appPy = backend?.children?.find(n => n.name === 'app.py');
    if (appPy) handleFileSelect(appPy, ['backend', 'app.py']);
  }, []);

  const handleFileSelect = (node: FileNode, path: string[]) => {
    if (node.content !== undefined) {
      setActiveFile(node);
      setActiveBreadcrumbs(path);
      setCodeContent(node.content);
      setIsDirty(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodeContent(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsDirty(false);
    showToast(`Saved changes to ${activeFile?.name}`, "success");
  };

  const handleDownload = () => {
    showToast("Downloading project-source-code.zip...", "info");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-teal-500" />
          <span className="font-bold tracking-wide">Developer Console</span>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">Admin Access</span>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${activeTab === 'code' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Code Explorer
          </button>
          <button
            onClick={() => setActiveTab('ml')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${activeTab === 'ml' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ML Models Showcase
          </button>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Project
        </button>
      </header>

      {/* Main Content Area */}
      {activeTab === 'code' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - File Explorer */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="p-3 bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 flex items-center">
              <LayoutIcon className="w-3 h-3 mr-2" /> Project Files
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {INITIAL_PROJECT_STRUCTURE.map((node, idx) => (
                <FileTreeItem
                  key={idx}
                  node={node}
                  depth={0}
                  activeFile={activeFile?.name || null}
                  currentPath={[]}
                  onSelect={handleFileSelect}
                />
              ))}
            </div>
          </aside>

          {/* Code Editor */}
          <main className="flex-1 flex flex-col bg-slate-950 relative">
            {activeFile ? (
              <>
                {/* Editor Tabs/Header with Breadcrumbs */}
                <div className="h-10 bg-slate-900 flex items-center px-4 border-b border-slate-800 justify-between">
                  <div className="flex items-center text-sm text-slate-400">
                    {activeBreadcrumbs.map((crumb, index) => {
                      const isLast = index === activeBreadcrumbs.length - 1;
                      return (
                        <React.Fragment key={index}>
                          <div className={`flex items-center ${isLast ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                            {!isLast ? (
                              <Folder className="w-3 h-3 mr-1.5 opacity-70" />
                            ) : (
                              getFileIcon(crumb, "w-3 h-3 mr-1.5")
                            )}
                            <span>{crumb}</span>
                          </div>
                          {index < activeBreadcrumbs.length - 1 && (
                            <ChevronRight className="w-3 h-3 mx-1 text-slate-700" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-500 mr-3 px-2 py-0.5 bg-slate-800 rounded">{activeFile.language || 'text'}</span>
                    {isDirty && <span className="flex items-center text-xs text-teal-400"><div className="w-2 h-2 rounded-full bg-teal-500 mr-2"></div> Unsaved</span>}
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-end pt-6 pr-2 text-slate-600 text-xs font-mono select-none">
                    {Array.from({ length: 30 }).map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
                  </div>
                  <textarea
                    value={codeContent}
                    onChange={handleCodeChange}
                    className="w-full h-full bg-[#0d1117] text-slate-300 font-mono text-sm pl-16 pt-6 p-6 resize-none outline-none leading-6 custom-scrollbar"
                    spellCheck="false"
                  />

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-6 right-6 flex space-x-3">
                    {isDirty && (
                      <button
                        onClick={() => {
                          setCodeContent(activeFile.content || '');
                          setIsDirty(false);
                        }}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded shadow-lg hover:bg-slate-700 transition-colors text-sm"
                      >
                        Discard
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      className={`flex items-center px-5 py-2 rounded shadow-lg transition-all transform hover:scale-105 ${isDirty
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      disabled={!isDirty}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <Box className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a file to view code</p>
              </div>
            )}
          </main>
        </div>
      ) : (
        /* ML Showcase Tab */
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                  AI Intelligence Layer
                </span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                The AddictiveCare platform is powered by a sophisticated ensemble of 8 machine learning models,
                orchestrated to provide real-time risk assessment and personalized recovery pathways.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MLModelCard
                title="Relapse Prediction"
                algorithm="Random Forest Classifier"
                accuracy="92.4%"
                description="Analyzes 50+ weighted features (sleep, stress, location) to predict relapse probability in real-time."
                icon={<Activity className="w-6 h-6 text-red-400" />}
              />
              <MLModelCard
                title="Behavioral Clustering"
                algorithm="K-Means Clustering (3D)"
                accuracy="Silhouette: 0.78"
                description="Segments users into 5 distinct personas using 3D vector space analysis of psychometric data."
                icon={<Share2 className="w-6 h-6 text-purple-400" />}
              />
              <MLModelCard
                title="Addiction Severity"
                algorithm="Decision Tree (CART)"
                accuracy="89.1%"
                description="Hierarchical rule-based classification to determine addiction severity (Mild/Moderate/Severe)."
                icon={<Database className="w-6 h-6 text-green-400" />}
              />
              <MLModelCard
                title="Trend Forecasting"
                algorithm="ARIMA (Time-Series)"
                accuracy="MAE: 0.42"
                description="Predicts future craving intensity trends based on historical logging data."
                icon={<Activity className="w-6 h-6 text-yellow-400" />}
              />
              <MLModelCard
                title="Sentiment Analysis"
                algorithm="BERT Transformer"
                accuracy="F1: 0.91"
                description="NLP pipeline to detect emotional polarity in journal entries and chat logs."
                icon={<BrainCircuit className="w-6 h-6 text-pink-400" />}
              />
              <MLModelCard
                title="Recovery Stage"
                algorithm="Logistic Regression"
                accuracy="86.5%"
                description="Classifies user readiness based on the Transtheoretical Model of Change."
                icon={<Layers className="w-6 h-6 text-blue-400" />}
              />
              <MLModelCard
                title="GPS Trigger Detection"
                algorithm="Geospatial Rules Engine"
                accuracy="100%"
                description="Real-time coordinate matching against a database of high-risk location types."
                icon={<Activity className="w-6 h-6 text-teal-400" />}
              />
              <MLModelCard
                title="Plan Personalization"
                algorithm="Reinforcement Learning"
                accuracy="Adaptive"
                description="Dynamic adjustment of daily tasks based on user completion rates and mood feedback."
                icon={<Cpu className="w-6 h-6 text-orange-400" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperHub;
