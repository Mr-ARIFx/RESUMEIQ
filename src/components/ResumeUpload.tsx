import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Clipboard } from "lucide-react";
import { ResumeAnalysis } from "../types";

interface ResumeUploadProps {
  onAnalysisSuccess: (analysis: ResumeAnalysis) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function ResumeUpload({ onAnalysisSuccess, isLoading, setIsLoading }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateProgress = () => {
    const steps = [
      "Reading file structure...",
      "Extracting text headers...",
      "Evaluating contact section...",
      "Analyzing action-verb patterns...",
      "Scoring ATS parameters with Gemini...",
      "Finalizing visual report schema..."
    ];
    let index = 0;
    setProgressStep(steps[0]);
    const interval = setInterval(() => {
      index++;
      if (index < steps.length) {
        setProgressStep(steps[index]);
      } else {
        clearInterval(interval);
      }
    }, 2000);
    return interval;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setError(null);
    if (uploadedFile.type !== "application/pdf") {
      setError("ResumeIQ support is currently optimised for PDF (.pdf) format resumes to evaluate layout structure accurately.");
      return;
    }
    if (uploadedFile.size > 12 * 1024 * 1024) {
      setError("File exceeds maximum 12MB threshold. Please upload a smaller size resume.");
      return;
    }
    setFile(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const progressTimer = simulateProgress();

    try {
      let payload: any = {};
      
      if (textMode) {
        if (!pastedText.trim() || pastedText.trim().length < 100) {
          throw new Error("Pasted resume text is too short. Please include full structural text context.");
        }
        payload = {
          fileName: "Pasted Text Profile",
          text: pastedText
        };
      } else {
        if (!file) {
          throw new Error("Please select a valid PDF resume file first.");
        }
        // Base64 Reader
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

        payload = {
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data
        };
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Review parser failure. Please verify document formatting.");
      }

      onAnalysisSuccess(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during scoring.");
    } finally {
      clearInterval(progressTimer);
      setIsLoading(false);
    }
  };

  return (
    <div id="resume-upload-section" className="w-full max-w-3xl mx-auto">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-205 dark:border-slate-800 mb-6 justify-center gap-2">
        <button
          id="upload-pdf-tab"
          type="button"
          onClick={() => { setTextMode(false); setError(null); }}
          className={`px-5 py-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 ${
            !textMode
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload PDF Curriculum
        </button>
        <button
          id="upload-text-tab"
          type="button"
          onClick={() => { setTextMode(true); setError(null); }}
          className={`px-5 py-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 ${
            textMode
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <Clipboard className="w-4 h-4" />
          Paste Plain Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert Box */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-350 rounded-2xl flex gap-3 text-sm animate-fade-in font-sans">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold">Verification Error</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Indicator Spinner Overlay */}
        {isLoading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-150 flex justify-center items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2563EB] animate-pulse" />
                ResumeIQ Deep Analysis is Running
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 h-6 font-mono font-bold tracking-widest uppercase">
                {progressStep}
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-805 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full w-4/5 animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic pt-2">
                Powered by Gemini LLM parsed semantic intelligence. Typically takes a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {!textMode ? (
              /* PDF Drag and Drop Area */
              <div
                id="dropzone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? "border-[#2563EB] bg-[#2563EB]/5 scale-[0.99]"
                    : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-705"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="resume-file-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[#2563EB]/10 dark:bg-slate-850 text-[#2563EB] rounded-lg flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white">
                      Drag & Drop your resume PDF
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      or click to browse local files (Supports PDF format, up to 12MB)
                    </p>
                  </div>

                  {file && (
                    <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-slate-800 dark:text-slate-200 text-xs max-w-full animate-scale-up">
                      <FileText className="w-5 h-5 text-[#2563EB] shrink-0" />
                      <span className="font-semibold truncate max-w-xs md:max-w-md">{file.name}</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Clipboard Text Box Area */
              <div className="space-y-2">
                <label htmlFor="pasted-text-input" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Paste entire plain text from PDF or LinkedIn profile export:
                </label>
                <textarea
                  id="pasted-text-input"
                  rows={10}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your professional experience, summary, education, and skill categories here..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]"
                />
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>Minimum 100 characters required.</span>
                  <span>{pastedText.length} characters</span>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                id="start-analysis-btn"
                type="submit"
                disabled={!textMode ? !file : !pastedText.trim()}
                className={`px-8 py-3 rounded-md font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all duration-300 transform ${
                  (!textMode ? file : pastedText.trim())
                    ? "bg-[#2563EB] hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/10"
                    : "bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Analyze & Estimate ATS Match
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
