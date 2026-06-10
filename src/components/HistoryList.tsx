import React from "react";
import { Calendar, Trash2, ArrowUpRight, BarChart3, User, Mail, Globe, Layers } from "lucide-react";
import { ResumeAnalysis } from "../types";

interface HistoryListProps {
  resumes: ResumeAnalysis[];
  onSelectResume: (resume: ResumeAnalysis) => void;
  onDeleteResume: (id: string) => Promise<void>;
  selectedResumeId: string;
}

export default function HistoryList({ resumes, onSelectResume, onDeleteResume, selectedResumeId }: HistoryListProps) {
  
  const getScoreBadgeColor = (sc: number) => {
    if (sc >= 85) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455 border-emerald-100/50 dark:border-emerald-900/30";
    if (sc >= 70) return "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-455 border-blue-105/50 dark:border-blue-900/30";
    if (sc >= 50) return "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-455 border-amber-100/50 dark:border-amber-900/30";
    return "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border-rose-100/50 dark:border-rose-900/30";
  };

  return (
    <div id="analysis-history-section" className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-850 dark:text-white">
            Resume Analysis History Directory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select, view, export, or audit your stored candidate profiles.
          </p>
        </div>
        <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3.5 py-1 rounded-md text-[#2563EB] dark:text-blue-400 border border-slate-200 dark:border-slate-700">
          Total: {resumes.length} profiles
        </span>
      </div>

      {resumes.length === 0 ? (
        <div id="no-history-placeholder" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 h-64 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-sm">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-655" />
          <h4 className="font-bold text-slate-800 dark:text-slate-300 text-sm">
            History Directory is Empty
          </h4>
          <p className="text-xs text-slate-450 dark:text-slate-450 max-w-sm">
            You haven't parsed or scored any resumes yet. Upload a PDF or paste text profile above to populate reports here.
          </p>
        </div>
      ) : (
        <div id="reports-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map((report) => {
            const isSelected = report.id === selectedResumeId;
            return (
              <div
                key={report.id}
                id={`report-card-${report.id}`}
                className={`group border rounded-2xl p-5 bg-white dark:bg-slate-900 transition-all duration-300 relative ${
                  isSelected
                    ? "border-[#2563EB] shadow-md shadow-blue-500/5 ring-1 ring-[#2563EB]/10"
                    : "border-slate-205 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                {/* Score badge at the corner */}
                <div className={`absolute top-5 right-5 border px-3 py-1 rounded-md text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 ${getScoreBadgeColor(report.atsScore.total)}`}>
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>ATS {report.atsScore.total}%</span>
                </div>

                <div className="space-y-4">
                  {/* Name and File */}
                  <div className="pr-20 min-w-0">
                    <h4 className="text-sm font-bold text-slate-850 dark:text-white truncate flex items-center gap-2 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      {report.candidateName || "Unknown Profile"}
                    </h4>
                    <p className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-slate-500 truncate mt-1">
                      {report.fileName}
                    </p>
                  </div>

                  {/* Date details */}
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Scored {new Date(report.uploadDate).toLocaleDateString()}</span>
                  </div>

                  {/* Skills tags preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {report.skills.soft.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[9.5px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                        {s}
                      </span>
                    ))}
                    {report.skills.technical[0]?.skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="bg-blue-50/50 dark:bg-slate-950 text-[#2563EB] dark:text-blue-400 text-[9.5px] font-semibold px-2 py-0.5 rounded border border-blue-100/50 dark:border-slate-850">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Action bottom area */}
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-850 pt-3.5 text-xs">
                    <button
                      onClick={() => onSelectResume(report)}
                      className={`flex items-center gap-1 font-bold ${
                        isSelected
                          ? "text-[#2563EB] dark:text-blue-400Underline"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      View Consolidated Report
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`delete-report-${report.id}`}
                      onClick={(e) => { e.stopPropagation(); onDeleteResume(report.id); }}
                      className="p-1.5 opacity-70 hover:opacity-100 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900 rounded-md transition-all"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
