import React, { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  TrendingUp,
  History,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertOctagon,
  Trophy,
  ArrowRight
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";
import ResumeUpload from "./components/ResumeUpload";
import AnalysisDashboard from "./components/AnalysisDashboard";
import JobMatch from "./components/JobMatch";
import HistoryList from "./components/HistoryList";
import CompareRank from "./components/CompareRank";
import { ResumeAnalysis, JobMatchResult } from "./types";

export default function App() {
  const [view, setView] = useState<"landing" | "upload" | "dashboard" | "jobmatch" | "history" | "ranking">("landing");
  const [resumes, setResumes] = useState<ResumeAnalysis[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync DB on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setApiError(null);
      const res = await fetch("/api/history");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronise report logs.");
      }
      setResumes(data.resumes || []);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to connect to backend api.");
    }
  };

  const handleAnalysisSuccess = (newAnalysis: ResumeAnalysis) => {
    setSelectedResume(newAnalysis);
    setResumes((prev) => [newAnalysis, ...prev]);
    setView("dashboard");
  };

  const handleDeleteResume = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to remove analysis report.");
      }
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResume?.id === id) {
        setSelectedResume(null);
      }
    } catch (err: any) {
      alert(`Deletion error: ${err.message}`);
    }
  };

  const handleSelectResumeFromHistory = (resume: ResumeAnalysis) => {
    setSelectedResume(resume);
    setView("dashboard");
  };

  return (
    <div id="resumeiq-client-app" className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">
      
      {/* Global API Connection Warning */}
      {apiError && (
        <div className="bg-[#1E293B] border-b border-blue-500/30 text-white text-xs py-2.5 text-center font-semibold font-mono flex items-center justify-center gap-2 px-4 print:hidden animate-slide-up">
          <AlertOctagon className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>Notice: {apiError}. ResumeIQ will use local/cached mock details where appropriate until API key is loaded in Secrets.</span>
        </div>
      )}

      {/* Main SaaS Navigation Navbar */}
      <header id="app-navbar" className="sticky top-0 z-50 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 p-4 transition-all duration-300 print:hidden">
        <div id="nav-container" className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Branding */}
          <div
            id="brand-mark"
            onClick={() => setView("landing")}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase leading-none text-slate-900 dark:text-white italic">
                Resume<span className="text-[#2563EB]">IQ</span>
              </h1>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 tracking-widest block uppercase mt-0.5 font-mono">
                ATS OPTIMIZATION HUB
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setView("landing")}
              className={`px-4 py-2 rounded-md transition-all ${
                view === "landing" ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-755"
              }`}
            >
              Overview
            </button>
            <button
              id="nav-scan-link"
              onClick={() => setView("upload")}
              className={`px-4 py-2 rounded-md transition-all ${
                view === "upload" ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Scan Resume
            </button>
            {selectedResume && (
              <button
                id="nav-dashboard-link"
                onClick={() => setView("dashboard")}
                className={`px-4 py-2 rounded-md transition-all ${
                  view === "dashboard" ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Active Dashboard
              </button>
            )}
            <button
              id="nav-match-link"
              onClick={() => setView("jobmatch")}
              className={`px-4 py-2 rounded-md transition-all ${
                view === "jobmatch" ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Job Descriptor Matching
            </button>
            <button
              id="nav-history-link"
              onClick={() => setView("history")}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                view === "history" ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              History
              {resumes.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#2563EB] text-[9.5px] font-bold font-mono">
                  {resumes.length}
                </span>
              )}
            </button>
            <button
              id="nav-ranking-link"
              onClick={() => setView("ranking")}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                view === "ranking" ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Rank Comparison
            </button>
          </nav>

          {/* Theme Toggler + CTA Button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              id="ct-launch-action-btn"
              onClick={() => setView("upload")}
              className="hidden sm:inline-flex px-5 py-2 bg-[#2563EB] text-white rounded-md text-xs font-semibold items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-500/15 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Scan Now
            </button>
          </div>

        </div>
      </header>

      {/* Main Page Container */}
      <main id="app-content-body" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {/* VIEW LANDING PAGE */}
        {view === "landing" && (
          <div id="landing-page-parent" className="space-y-16 animate-fade-in py-6">
            
            {/* HERO SECTION */}
            <div id="landing-hero" className="text-center space-y-6 max-w-3xl mx-auto py-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB]/10 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/30 rounded-md text-[#2563EB] dark:text-blue-400 text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Career Optimization</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Evaluate & Tailor Your Resume for <span className="text-[#2563EB] italic">ATS Systems</span>
              </h2>

              <p className="text-sm md:text-base text-slate-650 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                ResumeIQ uses advanced language understanding to crawl structures, calculate standard scoring brackets, diagnose formatting friction, list missing keywords, and match profile highlights with strict ATS parser specifications in seconds.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                <button
                  id="hero-launch-primary"
                  onClick={() => setView("upload")}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#2563EB] hover:bg-blue-755 text-white rounded-md font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]"
                >
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  Analyze Your Resume File
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <button
                  id="hero-compare-jobs"
                  onClick={() => setView("jobmatch")}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all border-b-2"
                >
                  Match Job Postings
                </button>
              </div>

              {/* Mini counters */}
              <div className="pt-8 flex flex-wrap justify-center gap-6 md:gap-10 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>105% Secure File Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Interactive Skill-Gap Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>PDF & Word Format Ready</span>
                </div>
              </div>
            </div>

            {/* BENTO FEATURE SERVICES ROW */}
            <div id="bento-features-row" className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white tracking-tight">
                  Comprehensive Suite of Evaluation Tooling
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 uppercase tracking-widest font-mono">Everything needed to optimize resume visibility</p>
              </div>

              <div id="bento-grid-wrapper" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bento Item 1: ATS Scoring */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-full"></div>
                  <div className="w-12 h-12 bg-[#2563EB]/10 dark:bg-slate-850 text-[#2563EB] rounded-lg flex items-center justify-center relative">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Strict Scoring Breakdown</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                      Evaluate individual point segments including structure formatting, experience depth, projects, contact parameters, and certifications.
                    </p>
                  </div>
                </div>

                {/* Bento Item 2: Skill Extraction */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-full"></div>
                  <div className="w-12 h-12 bg-[#2563EB]/10 dark:bg-slate-850 text-[#2563EB] rounded-lg flex items-center justify-center relative">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Interactive Skill-Grid Matrix</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                      Automatically map and classify technical disciplines, tool chains, soft methods, linguistic structures, and academic credentials.
                    </p>
                  </div>
                </div>

                {/* Bento Item 3: Job Description Matching */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-full"></div>
                  <div className="w-12 h-12 bg-[#2563EB]/10 dark:bg-slate-850 text-[#2563EB] rounded-lg flex items-center justify-center relative">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Role-Tailored Matching</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                      Paste job requirements to compare overlaps, identify critical missing terms, and generate targeted phrasings immediately.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* DIRECT DIRECTORY HIGHLIGHT CARD */}
            {resumes.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Active Resumes in History</h4>
                  <p className="text-xs text-slate-450 dark:text-slate-500">You already have {resumes.length} processed profiles ready to match.</p>
                </div>
                <button
                  onClick={() => setView("history")}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/10"
                >
                  Browse Reports Archive <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* VIEW FILE UPLOAD */}
        {view === "upload" && (
          <div className="py-6 space-y-4">
            <div className="text-center space-y-1 max-w-xl mx-auto mb-4">
              <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none">
                ATS Document Evaluator
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Drag-and-drop secure PDF or paste plain LinkedIn exports to start processing.
              </p>
            </div>
            
            <ResumeUpload
              onAnalysisSuccess={handleAnalysisSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        )}

        {/* VIEW ACTIVE ANALYSIS DASHBOARD */}
        {view === "dashboard" && selectedResume && (
          <div className="py-2">
            <AnalysisDashboard
              analysis={selectedResume}
              onCompareTrigger={() => setView("jobmatch")}
            />
          </div>
        )}

        {/* VIEW JOB DESCRIPTION MATCH */}
        {view === "jobmatch" && (
          <div className="py-4">
            <JobMatch
              resumes={resumes}
              selectedResumeId={selectedResume?.id || (resumes[0]?.id || "")}
              onMatchComplete={(matchVal) => {
                // Squelch state or expand history if needed
              }}
            />
          </div>
        )}

        {/* VIEW HISTORIC ANALYSIS SUMMARY DIRECTORIES */}
        {view === "history" && (
          <div className="py-4">
            <HistoryList
              resumes={resumes}
              onSelectResume={handleSelectResumeFromHistory}
              onDeleteResume={handleDeleteResume}
              selectedResumeId={selectedResume?.id || ""}
            />
          </div>
        )}

        {/* VIEW RANKING COMPARISONS */}
        {view === "ranking" && (
          <div className="py-4">
            <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
              <h3 className="text-2xl font-black text-slate-850 dark:text-white">
                Resume Placement ranking board
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Compare multiple parsed summaries, rank candidates, and search by skill clusters.
              </p>
            </div>
            
            <CompareRank
              resumes={resumes}
              onSelectResume={handleSelectResumeFromHistory}
            />
          </div>
        )}

      </main>

      {/* Modern Compact SaaS Footer */}
      <footer id="app-footer" className="bg-white dark:bg-[#0B1329] border-t border-slate-200/55 dark:border-slate-850 py-8 text-center text-xs text-slate-400 dark:text-slate-550 print:hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-widest text-[10px]">
            ResumeIQ © 2026. Made with Precision Layouts.
          </p>
        </div>
      </footer>

    </div>
  );
}
