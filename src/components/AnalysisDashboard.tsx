import React, { useState } from "react";
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Linkedin,
  Globe,
  AlertTriangle,
  CheckCircle,
  FileText,
  BadgeAlert,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Wrench,
  Lightbulb,
  Printer,
  ChevronDown,
  FileSpreadsheet
} from "lucide-react";
import { ResumeAnalysis } from "../types";

interface AnalysisDashboardProps {
  analysis: ResumeAnalysis;
  onCompareTrigger: () => void;
}

export default function AnalysisDashboard({ analysis, onCompareTrigger }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "keywords" | "verbs" | "recommendations">("overview");

  const score = analysis.atsScore.total;
  const getScoreColor = (sc: number) => {
    if (sc >= 85) return "text-emerald-600 stroke-emerald-600 border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/50 dark:bg-emerald-950/10";
    if (sc >= 70) return "text-[#2563EB] stroke-[#2563EB] border-blue-100 dark:border-blue-950/50 bg-blue-50/50 dark:bg-blue-950/10";
    if (sc >= 50) return "text-amber-600 stroke-amber-600 border-amber-100 dark:border-amber-950/50 bg-amber-50/50 dark:bg-amber-950/10";
    return "text-rose-600 stroke-rose-600 border-rose-100 dark:border-rose-950/50 bg-rose-50/50 dark:bg-rose-950/10";
  };

  const getScoreStatus = (sc: number) => {
    if (sc >= 85) return { text: "Resume Optimized", subtitle: "Excellent ATS compatibility & profile layout", badge: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-350 rounded-md" };
    if (sc >= 70) return { text: "Average Passing Match", subtitle: "Good layout, but requires minor keyword targeting", badge: "bg-blue-100 dark:bg-blue-950/70 text-[#2563EB] dark:text-blue-400 rounded-md border border-blue-200 dark:border-slate-800" };
    if (sc >= 50) return { text: "Critical Gaps Found", subtitle: "Requires section restructuring & verb improvements", badge: "bg-amber-105 dark:bg-amber-950/70 text-amber-800 dark:text-amber-305 rounded-md" };
    return { text: "ATS Rejected Risk", subtitle: "Missing primary segments, formatting is heavily disjointed", badge: "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-350 rounded-md" };
  };

  const status = getScoreStatus(score);

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ResumeIQ Quality Report\n";
    csvContent += `Candidate Name,${analysis.candidateName}\n`;
    csvContent += `ATS Compatibility Score,${analysis.atsScore.total}/100\n`;
    csvContent += `Upload Date,${analysis.uploadDate}\n\n`;

    csvContent += "--- SCORING BREAKDOWN ---\n";
    csvContent += `Contact Info,${analysis.atsScore.contactInfo}/10\n`;
    csvContent += `Education,${analysis.atsScore.education}/15\n`;
    csvContent += `Skills,${analysis.atsScore.skills}/15\n`;
    csvContent += `Projects,${analysis.atsScore.projects}/20\n`;
    csvContent += `Experience,${analysis.atsScore.experience}/20\n`;
    csvContent += `Certifications,${analysis.atsScore.certifications}/10\n`;
    csvContent += `Formatting,${analysis.atsScore.formatting}/10\n\n`;

    csvContent += "--- DETECTED TECHNICAL SKILLS ---\n";
    analysis.skills.technical.forEach((cat) => {
      csvContent += `${cat.category},"${cat.skills.join(", ")}"\n`;
    });
    csvContent += `\n`;

    csvContent += "--- SOFT SKILLS ---\n";
    csvContent += `Soft Skills,"${analysis.skills.soft.join(", ")}"\n\n`;

    csvContent += "--- ACTIONABLE TIPS ---\n";
    analysis.recommendations.forEach((rec, idx) => {
      csvContent += `${idx + 1},"${rec.replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ResumeIQ_Report_${analysis.candidateName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Circular progress calculations
  const strokeRadius = 70;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div id="analysis-dashboard-console" className="space-y-8 animate-fade-in print:p-0">
      
      {/* Top action header */}
      <div id="dashboard-actions-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider block mb-1 font-mono">
            Processed Success
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <User className="w-6 h-6 text-slate-400" />
            {analysis.candidateName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
            File analyzed: <span className="font-mono text-[#2563EB] dark:text-blue-400 font-bold">{analysis.fileName}</span> on {new Date(analysis.uploadDate).toLocaleDateString()}
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap gap-2">
          <button
            id="match-role-action-btn"
            onClick={onCompareTrigger}
            className="px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[#2563EB] hover:bg-blue-705 text-white flex items-center gap-2 shadow-sm transition-all text-white border border-transparent"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Compare Job Match
          </button>
          
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            id="print-reprt-btn"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Visual Contact Card Row */}
      <div id="contact-details-row" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Email</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate select-all">
              {analysis.contactDetails.email || "Not found"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Phone</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate select-all">
              {analysis.contactDetails.phone || "Not found"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Linkedin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">LinkedIn</p>
            <p className="text-xs font-semibold text-slate-850 dark:text-slate-200 truncate select-all">
              {analysis.contactDetails.linkedin || "Not found"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Portfolio / Git</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate select-all">
              {analysis.contactDetails.portfolio || "Not found"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div id="main-stats-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BIG circular ATS score wheel */}
        <div id="score-meter-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-6">
            ATS Compatibility Rating
          </h3>

          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={strokeRadius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="11"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r={strokeRadius}
                className={`transition-all duration-1000 ease-out fill-none ${getScoreColor(score).split(" ")[1]}`}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="square"
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-850 dark:text-white leading-none font-mono">
                {score}
              </span>
              <span className="text-[10.5px] uppercase text-slate-400 dark:text-slate-500 font-bold tracking-tight mt-1">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className={`px-4 py-1 text-xs font-bold inline-block border ${status.badge}`}>
              {status.text}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans max-w-xs">{status.subtitle}</p>
          </div>
        </div>

        {/* Breakdown Scores Panel */}
        <div id="breakdown-scores-panel" className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-slate-850">
            <div>
              <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
                ATS Metric Scoring Breakdown
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-mono">Maximum possible score: 100 points</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#2563EB]" />
          </div>

          <div id="breakdown-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Contact Information (10 points) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100/50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 rounded-lg">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Contact Integrity</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Required markers</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{analysis.atsScore.contactInfo}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">/10</span>
              </div>
            </div>

            {/* Education (15 points) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Academic Match</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Education matches</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{analysis.atsScore.education}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">/15</span>
              </div>
            </div>

            {/* Skills (15 points) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-105/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Skill Grid Volume</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Technical density</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{analysis.atsScore.skills}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">/15</span>
              </div>
            </div>

            {/* Projects (20 points) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100/50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Projects Section</h4>
                  <p className="text-[10px] text-slate-405 dark:text-slate-500">Side achievements</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{analysis.atsScore.projects}</span>
                <span className="text-xs text-slate-400 dark:text-slate-550">/20</span>
              </div>
            </div>

            {/* Experience (20 points) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100/50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Work Experience</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Tenure metrics & depth</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{analysis.atsScore.experience}</span>
                <span className="text-xs text-slate-400 dark:text-slate-550">/20</span>
              </div>
            </div>

            {/* Certifications (10 points) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100/50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Credentials Matched</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Certificates listed</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{analysis.atsScore.certifications}</span>
                <span className="text-xs text-slate-400 dark:text-slate-550">/10</span>
              </div>
            </div>

            {/* Formatting (10 points) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100/50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-455 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Layout Format Quality</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Parsing stability, styling indices</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{analysis.atsScore.formatting}</span>
                <span className="text-xs text-slate-400 dark:text-slate-550">/10</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Section Checker boards */}
      <div id="section-checker" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">
          ATS Section Coverage Audit
        </h3>
        <div id="section-status-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Present Sections */}
          {analysis.sections.present.map((sec, idx) => (
            <div key={`pres-${idx}`} className="p-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-md flex items-center gap-3">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-750 dark:text-slate-200 truncate">{sec}</span>
            </div>
          ))}

          {/* Missing Sections */}
          {analysis.sections.missing.map((sec, idx) => (
            <div key={`miss-${idx}`} className="p-3 border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 rounded-md flex items-center gap-3">
              <BadgeAlert className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-750 dark:text-slate-200 truncate">{sec}</p>
                <p className="text-[9px] font-bold text-rose-500 uppercase tracking-wide">Missing</p>
              </div>
            </div>
          ))}

          {analysis.sections.missing.length === 0 && (
            <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-md flex items-center justify-center col-span-2 text-xs text-slate-450 font-mono">
              Perfect structure coverage index. No mandatory sections missing!
            </div>
          )}
        </div>
      </div>

      {/* Structured Multi-tab Console */}
      <div id="multitabs-console" className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 px-4 pt-4 shrink-0 print:hidden">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3.5 text-xs font-bold leading-none border-b-2 transition-all mr-2 ${
              activeTab === "overview"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Insights Overview
          </button>
          
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-3.5 text-xs font-bold leading-none border-b-2 transition-all mr-2 ${
              activeTab === "skills"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Identified Skills Grid
          </button>
          
          <button
            onClick={() => setActiveTab("keywords")}
            className={`px-4 py-3.5 text-xs font-bold leading-none border-b-2 transition-all mr-2 ${
              activeTab === "keywords"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Keywords Density
          </button>
          
          <button
            onClick={() => setActiveTab("verbs")}
            className={`px-4 py-3.5 text-xs font-bold leading-none border-b-2 transition-all mr-2 ${
              activeTab === "verbs"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Action Verbs
          </button>

          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-4 py-3.5 text-xs font-bold leading-none border-b-2 transition-all ${
              activeTab === "recommendations"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            ATS Suggestions ({analysis.recommendations.length})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          
          {/* Active Tab Overview */}
          {activeTab === "overview" && (
            <div id="overview-tab-panel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                    <CheckCircle className="text-emerald-500 w-4 h-4" />
                    Major Resume Strengths
                  </h4>
                  <ul className="space-y-3">
                    {analysis.strengths.map((str, idx) => (
                      <li key={`str-${idx}`} className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 text-xs text-slate-655 dark:text-slate-300 font-sans border-l-4 border-emerald-600 border border-slate-200 dark:border-slate-800">
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                    <Lightbulb className="text-blue-600 w-4 h-4" />
                    Target High-Impact Tips
                  </h4>
                  <ul className="space-y-3">
                    {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={`rec-hl-${idx}`} className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 text-xs text-slate-655 dark:text-slate-300 font-sans border-l-4 border-[#2563EB] border border-slate-200 dark:border-slate-800">
                        {rec}
                      </li>
                    ))}
                    {analysis.recommendations.length > 3 && (
                      <p className="text-[11px] text-right text-[#2563EB] hover:text-blue-700 font-bold uppercase tracking-wider font-mono cursor-pointer hover:underline pt-2" onClick={() => setActiveTab("recommendations")}>
                        View all {analysis.recommendations.length} recommendations <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
                      </p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab Technical Skills */}
          {activeTab === "skills" && (
            <div id="skills-tab-panel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                    <Wrench className="text-[#2563EB] w-4.5 h-4.5" />
                    Technical Skill Matrix ({analysis.skills.technical.length} categories)
                  </h4>
                  
                  <div className="space-y-4">
                    {analysis.skills.technical.map((cat, idx) => (
                      <div key={`tech-cat-${idx}`} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase block pb-2 border-b border-slate-200 dark:border-slate-850 font-mono">
                          {cat.category}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {cat.skills.map((sk, sIdx) => (
                            <span key={`sk-${sIdx}`} className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-855 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                    <User className="text-purple-600 w-4.5 h-4.5" />
                    Soft Skills & Methods
                  </h4>
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-205 dark:border-slate-850 flex flex-wrap gap-2.5">
                    {analysis.skills.soft.map((sk, idx) => (
                      <span key={`soft-${idx}`} className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-755 dark:text-slate-300 rounded-md flex items-center gap-1.5 shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab Keyword density */}
          {activeTab === "keywords" && (
            <div id="keywords-tab-panel" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Found Keywords Density Indicator */}
                <div>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <TrendingUp className="text-emerald-500 w-4 h-4" />
                      Extracted Keyword Frequency
                    </h4>
                    <span className="text-[10px] bg-emerald-55 dark:bg-emerald-950/40 text-emerald-600 font-bold px-2.5 py-1 rounded-md border border-emerald-100 dark:border-slate-800">
                      Density Computed
                    </span>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {analysis.keywords.found.map((kw, idx) => (
                      <div key={`kw-${idx}`} className="space-y-1 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-md border border-slate-100 dark:border-slate-850/60">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-750 dark:text-slate-250 truncate max-w-xs">{kw.keyword}</span>
                          <div className="text-slate-550 dark:text-slate-405 font-mono">
                            <span className="font-bold text-[#2563EB] dark:text-blue-400">{kw.count} times</span>
                            <span className="mx-1 border-r border-slate-300 dark:border-slate-800"></span>
                            <span>{kw.density}%</span>
                          </div>
                        </div>
                        {/* Bar meter */}
                        <div className="bg-slate-100 dark:bg-slate-800 h-2 rounded-md overflow-hidden">
                          <div
                            className="bg-[#2563EB] h-full transition-all duration-1000"
                            style={{ width: `${Math.min(kw.density * 25, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Targeted Keywords */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                      <AlertTriangle className="text-amber-500 w-4 h-4 animate-bounce" />
                      ATS Critical Missing Terms
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                      Lacking these high-volume terms matching your career level may flag you as unqualified with indexing engines. Re-integrate these:
                    </p>
                    <div className="p-4 bg-amber-50/20 dark:bg-amber-955/10 border border-amber-100 dark:border-amber-900/40 rounded-xl flex flex-wrap gap-2">
                      {analysis.keywords.missing.map((kw, idx) => (
                        <span key={`miss-kw-${idx}`} className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-305 rounded-md">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 font-mono">
                      High Index Cluster Words
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywords.topKeywords.map((kw, idx) => (
                        <span key={`top-kw-${idx}`} className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 rounded-md border border-slate-205 dark:border-slate-800">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Active Tab Action-Verbs */}
          {activeTab === "verbs" && (
            <div id="verbs-tab-panel" className="space-y-6">
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1 font-mono">ATS Dynamic Action-Verb Analysis</p>
                <p className="opacity-90 leading-relaxed">
                  Applicant Tracking Systems assess whether profiles explain accomplishments using strong, proactive results verbs (Designed, Spearheaded, Optimized) versus weak passive verbs (assisted, helped, participated).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strong Verbs */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
                    <CheckCircle className="text-emerald-500 w-4 h-4" />
                    Proactive Verbs Found
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono">These support dynamic impact ratios:</p>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
                    {analysis.actionVerbs.strong.map((v, idx) => (
                      <div key={`strong-v-${idx}`} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-150 dark:border-slate-850">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{v.verb}</span>
                        <span className="bg-emerald-50 dark:bg-emerald-950/75 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                          Used {v.count}x
                        </span>
                      </div>
                    ))}
                    {analysis.actionVerbs.strong.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-2">No proactive action verbs detected.</p>
                    )}
                  </div>
                </div>

                {/* Weak Verbs and Replacements */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
                    <AlertTriangle className="text-rose-500 w-4 h-4" />
                    Passive Verbs Found (Swap Immediately)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono">ATS ranks weak verbs lower. Use these upgrades:</p>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-850 space-y-3">
                    {analysis.actionVerbs.weak.map((v, idx) => (
                      <div key={`weak-v-${idx}`} className={`flex justify-between items-center text-xs pt-3 ${idx === 0 ? "pt-0" : ""}`}>
                        <div>
                          <p className="font-bold text-rose-600 line-through">{v.verb}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Found {v.count} times</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-slate-400 animate-pulse" />
                          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-bold px-2.5 py-1 rounded-md">
                            {v.replacement}
                          </span>
                        </div>
                      </div>
                    ))}
                    {analysis.actionVerbs.weak.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-2">No passive/weak verbs detected. Excellent phrasing!</p>
                    )}
                  </div>
                </div>

              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-2 font-mono">
                  Optimization Guidelines
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  {analysis.actionVerbs.suggestions.map((sug, idx) => (
                    <div key={`verb-sug-${idx}`} className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mb-2 flex gap-2">
                      <span className="text-[#2563EB] font-bold tracking-tight shrink-0">•</span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Active Tab Recommendations */}
          {activeTab === "recommendations" && (
            <div id="recommendations-tab-panel" className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-3 font-mono">
                Complete Action Plan
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                Execute these targeted restructuring guidelines to increase your scoring margins and pass strict resume parsing configurations.
              </p>
              
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={`rec-list-${idx}`} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-250/60 dark:border-slate-850 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <div className="w-6 h-6 rounded-md bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-450 flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      {rec}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
