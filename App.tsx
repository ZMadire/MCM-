import React, { useState, useRef } from 'react';
import { analyzeMathProblem } from './services/geminiService';
import { AnalysisResult } from './types';
import { BrainIcon, ChartIcon, AlertIcon, UploadIcon, FileIcon, TrashIcon } from './components/Icons';
import VariableTable from './components/VariableTable';
import ApproachCard from './components/ApproachCard';
import * as mammoth from 'mammoth';

interface AttachedFile {
  name: string;
  type: 'pdf' | 'docx';
  base64?: string; // Only for PDF
}

export const App: React.FC = () => {
  const [problemText, setProblemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Handle PDF
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachedFile({
          name: file.name,
          type: 'pdf',
          base64: base64String
        });
      };
      reader.readAsDataURL(file);
    } 
    // Handle Word (.docx)
    else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            setProblemText(prev => prev ? prev + "\n\n" + result.value : result.value);
            // We don't attach the file object for DOCX because we extracted the text directly
            // But we can show a success message or just let the text appear
          } catch (err) {
            console.error(err);
            setError("Failed to read Word document. Please copy the text manually.");
          }
        };
        reader.readAsArrayBuffer(file);
    } else {
      setError("Unsupported file format. Please upload PDF or Word (.docx) files.");
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const handleAnalyze = async () => {
    if (!problemText.trim() && !attachedFile) {
        setError("Please enter the problem text or upload a PDF file.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeMathProblem(problemText, attachedFile?.base64);
      setResult(data);
    } catch (err) {
      setError("An error occurred while analyzing the problem. Please check your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <BrainIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700">
              ModelMinds
            </h1>
          </div>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            Documentation
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Intro / Input Section */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Master Your Math Modeling Competition
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Upload your problem file (PDF/Word) or paste the text below. Our AI will analyze key variables, identify the problem type, and suggest 3 distinct approaches.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200 p-1 overflow-hidden mb-12">
            
          {/* File Upload Area */}
          <div className="px-6 pt-6 pb-2">
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
            />
            
            {!attachedFile ? (
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer group"
                 >
                    <UploadIcon className="w-8 h-8 mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="font-semibold text-sm">Click to upload PDF or Word file</span>
                    <span className="text-xs text-slate-400 mt-1">.pdf, .docx supported</span>
                 </button>
            ) : (
                <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                            <FileIcon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 truncate block">{attachedFile.name}</span>
                            <span className="text-xs text-indigo-600 font-medium uppercase">{attachedFile.type.toUpperCase()} Attached</span>
                        </div>
                    </div>
                    <button 
                        onClick={removeFile}
                        className="p-2 hover:bg-white hover:text-red-500 rounded-lg transition-colors text-slate-400"
                        title="Remove file"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
          </div>

          <div className="px-6 py-2 relative">
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>
             <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder={attachedFile ? "Add any specific questions or additional context here..." : "Paste your problem description here..."}
                className="w-full h-32 py-4 resize-y outline-none text-slate-700 placeholder:text-slate-400 text-lg focus:bg-slate-50/50 transition-colors rounded-lg"
            />
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              AI-Powered Analysis
            </span>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || (!problemText.trim() && !attachedFile)}
              className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg transform active:scale-95 ${
                isLoading || (!problemText.trim() && !attachedFile)
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </span>
              ) : (
                'Analyze Problem'
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-10 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start gap-3">
             <AlertIcon className="w-5 h-5 mt-0.5 shrink-0" />
             <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && !isLoading && (
          <div className="animate-fade-in space-y-10">
            
            {/* 1. Overview */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                 <div>
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase mb-3">
                      {result.problemType}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900">{result.title}</h2>
                 </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-slate-800 mb-2">Executive Summary</h3>
                  <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertIcon className="w-4 h-4 text-amber-500" /> Key Challenges
                  </h3>
                  <ul className="space-y-2">
                    {result.keyChallenges.map((challenge, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span> {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

               <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-3">Core Assumptions</h3>
                   <div className="flex flex-wrap gap-2">
                    {result.assumptions.map((asm, i) => (
                      <span key={i} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-lg text-sm">
                        {asm}
                      </span>
                    ))}
                   </div>
               </div>
            </section>

            {/* 2. Variables */}
            <section>
              <VariableTable variables={result.variables} />
            </section>

            {/* 3. Strategies / Approaches */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <ChartIcon className="text-indigo-600 w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-900">Proposed Solution Strategies</h2>
              </div>
              <div className="grid grid-cols-1 gap-8">
                {result.approaches.map((approach, idx) => (
                  <ApproachCard key={idx} approach={approach} index={idx} />
                ))}
              </div>
            </section>

            {/* 4. Conclusion */}
            <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">Coach's Final Recommendation</h3>
              <p className="text-indigo-100 leading-relaxed text-lg">
                {result.conclusion}
              </p>
            </section>

          </div>
        )}
      </main>
    </div>
  );
};