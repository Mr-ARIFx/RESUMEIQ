import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle, Layers, Check, AlertCircle, Wrench, RefreshCw } from "lucide-react";
import { ResumeAnalysis, JobMatchResult } from "../types";

interface JobMatchProps {
  resumes: ResumeAnalysis[];
  selectedResumeId: string;
  onMatchComplete: (result: JobMatchResult) => void;
}

export default function JobMatch({ resumes, selectedResumeId, onMatchComplete }: JobMatchProps) {
  const [activeResumeId, setActiveResumeId] = useState(selectedResumeId);
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedResumeId) {
      setActiveResumeId(selectedResumeId);
    }
  }, [selectedResumeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsMatching(true);

    try {
      if (!activeResumeId) {
        throw new Error("Please select a target resume first.");
      }
      if (!jobDescription.trim() || jobDescription.trim().length < 50) {
        throw new Error("Job description is too short. Please paste a thorough JD description.");
      }

      const response = await fetch("/api/job-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeId: activeResumeId,
          jobDescription
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed during job description match evaluation.");
      }

      setMatchResult(data);
      onMatchComplete(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during job comparison.");
    } finally {
      setIsMatching(false);
    }
  };

  const getMatchColor = (sc: number) => {
    if (sc >= 80) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900";
    if (sc >= 60) return "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900";
    if (sc >= 40) return "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900";
    return "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900";
  };

  return (
    <div id="job-description-matcher-section" className="w-full max-w-4xl mx-auto space-y-8 animate-scale-up">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-center max-w-2xl mx-auto space-y-2">
        <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-850 dark:text-white">
          Job Description Keyword Alignment
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Paste any targeted job opening. Our AI engine will conduct a skill-gap analysis, map missing requirements, and formulate immediate resume updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form panel */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Resume Selector */}
            <div className="space-y-1.5">
              <label htmlFor="active-resume-selector" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Base Resume
              </label>
              <select
                id="active-resume-selector"
                value={activeResumeId}
                onChange={(e) => { setActiveResumeId(e.target.value); setMatchResult(null); setError(null); }}
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-205 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="">-- Choose Resume --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.candidateName} ({r.fileName.length > 20 ? r.fileName.substr(0, 20) + "..." : r.fileName})
                  </option>
                ))}
              </select>
            </div>

            {/* Job Description Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="jd-pasted-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Job description
              </label>
              <textarea
                id="jd-pasted-input"
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full qualifications, responsibilities, and skills list here..."
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Error indicators */}
            {error && (
              <div className="p-3 bg-rose-50/50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 rounded-md text-[11px] flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 font-bold" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="compare-calculate-btn"
              type="submit"
              disabled={isMatching || !activeResumeId || !jobDescription.trim()}
              className={`w-full py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
                isMatching
                  ? "bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                  : activeResumeId && jobDescription.trim()
                  ? "bg-[#2563EB] hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {isMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calculating Alignment...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Extract Skill Match Score
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results matching console details */}
        <div className="md:col-span-2 space-y-6">
          {matchResult ? (
            <div id="job-match-results-pane" className="space-y-6 animate-fade-in">
              {/* Core Score Banner */}
              <div className={`p-6 border rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm ${getMatchColor(matchResult.matchScore)}`}>
                <div className="w-24 h-24 rounded-full border-4 border-current flex items-center justify-center shrink-0">
                  <span className="text-3xl font-extrabold font-mono">{matchResult.matchScore}%</span>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-none block opacity-85 font-mono">
                    JD Match Ratio
                  </span>
                  <h4 className="text-lg font-bold text-slate-850 dark:text-white pb-1 border-b border-white/20">
                    {matchResult.jobTitle || "Role Profile Evaluation"}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-sans opacity-95 pt-1">
                    Your profile matches or partially highlights several key skill requirements searched by recruiter algorithms. Review recommendations below.
                  </p>
                </div>
              </div>

              {/* Skill Matrix Overlaps */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Matched skills */}
                  <div>
                    <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Overlaying Skills Matched
                    </h5>
                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/20 rounded-xl min-h-24">
                      {matchResult.matchedSkills.map((sk, idx) => (
                        <span key={`matched-sk-${idx}`} className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-350 rounded-md">
                          {sk}
                        </span>
                      ))}
                      {matchResult.matchedSkills.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic text-center w-full py-4">No skill matches detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing skills */}
                  <div>
                    <h5 className="text-xs font-bold text-rose-605 dark:text-rose-455 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Critical Missing Skills
                    </h5>
                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-rose-50/20 dark:bg-rose-955/10 border border-rose-100/40 dark:border-rose-900/20 rounded-xl min-h-24">
                      {matchResult.missingSkills.map((sk, idx) => (
                        <span key={`missing-sk-${idx}`} className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-350 rounded-md">
                          {sk}
                        </span>
                      ))}
                      {matchResult.missingSkills.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic text-center w-full py-4">No missing critical skills detected.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Keyword Comparison */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Common Overlapping Keywords */}
                  <div>
                    <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 font-mono">
                      Keywords Overlapped
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.keywordOverlap.map((kw, idx) => (
                        <span key={`kw-ov-${idx}`} className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 rounded border border-slate-200 dark:border-slate-700">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 font-mono">
                      Missing JD Keywords
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missingKeywords.map((kw, idx) => (
                        <span key={`kw-miss-${idx}`} className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-350 rounded">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Direct suggestions action list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Tailored Optimization Plan
                </h5>
                <div className="space-y-3">
                  {matchResult.suggestions.map((sug, idx) => (
                    <div key={`sug-list-${idx}`} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                      <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500 flex items-center justify-center font-extrabold shrink-0 text-[10px]">
                        {idx + 1}
                      </div>
                      <div>{sug}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div id="job-match-placeholder" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-96 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-sm">
              <Layers className="w-10 h-10 text-slate-350 dark:text-slate-600 animate-pulse" />
              <h4 className="font-bold text-slate-800 dark:text-slate-300 text-sm">
                No job matching analyzed yet
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm">
                Select your analyzed resume file from history, paste your target job application posting text, and click "Extract Skill Match" to discover potential skill gaps.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
