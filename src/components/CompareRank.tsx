import React, { useState } from "react";
import { Sparkles, BarChart3, Trophy, CheckCircle, Search, Award, GraduationCap, Briefcase } from "lucide-react";
import { ResumeAnalysis } from "../types";

interface CompareRankProps {
  resumes: ResumeAnalysis[];
  onSelectResume: (resume: ResumeAnalysis) => void;
}

export default function CompareRank({ resumes, onSelectResume }: CompareRankProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [rankCriteria, setRankCriteria] = useState<"ats" | "skills" | "experience" | "custom">("ats");
  const [customKeyword, setCustomKeyword] = useState("");

  if (resumes.length === 0) {
    return (
      <div id="rank-empty-fallback" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
        <Trophy className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
        <h4 className="font-bold text-slate-800 dark:text-white">Resume Leaderboard is Empty</h4>
        <p className="text-xs text-slate-550 dark:text-slate-400">
          Upload and parse multiple resumes first to compare layouts, rank ATS compatibility scores, and discover matching talent criteria.
        </p>
      </div>
    );
  }

  // Calculate score highlights for each profile depending on ranking criteria
  const getProfileRankScore = (res: ResumeAnalysis) => {
    switch (rankCriteria) {
      case "skills":
        // Calculated by technical skills counted
        const countTech = res.skills.technical.reduce((accum, curr) => accum + curr.skills.length, 0);
        return {
          score: Math.min(countTech * 5, 100),
          label: `${countTech} active skills`
        };
      case "experience":
        // Score on experience section matching + formatting
        const expScore = res.atsScore.experience;
        return {
          score: Math.round((expScore / 20) * 100),
          label: `Experience index: ${expScore}/20`
        };
      case "custom":
        if (!customKeyword.trim()) {
          return { score: res.atsScore.total, label: `ATS score: ${res.atsScore.total}%` };
        }
        // Count keyword occurrence in skill Categories or keywords found
        const kw = customKeyword.toLowerCase().trim();
        let matches = 0;
        res.skills.technical.forEach((cat) => {
          if (cat.category.toLowerCase().includes(kw)) matches += 3;
          cat.skills.forEach((s) => {
            if (s.toLowerCase().includes(kw)) matches += 5;
          });
        });
        res.keywords.found.forEach((f) => {
          if (f.keyword.toLowerCase().includes(kw)) matches += f.count;
        });
        const matchedRatio = Math.min(matches * 8, 100);
        return {
          score: matchedRatio,
          label: `Match index: ${matchedRatio}% for "${customKeyword}"`
        };
      case "ats":
      default:
        return {
          score: res.atsScore.total,
          label: `ATS Health: ${res.atsScore.total}%`
        };
    }
  };

  const rankedProfiles = [...resumes]
    .map((r) => {
      const evaluation = getProfileRankScore(r);
      return {
        ...r,
        rankScore: evaluation.score,
        rankLabel: evaluation.label
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore);

  const getRankMedal = (index: number) => {
    if (index === 0) return "🏆 1st";
    if (index === 1) return "🥈 2nd";
    if (index === 2) return "🥉 3rd";
    return `#${index + 1}`;
  };

  const getPercentageColor = (sc: number) => {
    if (sc >= 85) return "bg-[#2563EB]";
    if (sc >= 70) return "bg-[#2563EB]/80";
    if (sc >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div id="resume-ranking-leaderboard" className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Settings Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Left Toggle buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setRankCriteria("ats")}
            className={`px-4 py-2.5 rounded-md font-semibold transition-all duration-200 ${
              rankCriteria === "ats"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-350 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Rank by ATS Health
          </button>
          
          <button
            onClick={() => setRankCriteria("skills")}
            className={`px-4 py-2.5 rounded-md font-semibold transition-all duration-200 ${
              rankCriteria === "skills"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-350 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Rank by Skill Volume
          </button>
          
          <button
            onClick={() => setRankCriteria("experience")}
            className={`px-4 py-2.5 rounded-md font-semibold transition-all duration-200 ${
              rankCriteria === "experience"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-350 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Rank by Experience Height
          </button>

          <button
            onClick={() => setRankCriteria("custom")}
            className={`px-4 py-2.5 rounded-md font-semibold transition-all duration-200 ${
              rankCriteria === "custom"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-350 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Custom Keyword Matcher
          </button>
        </div>

        {/* Custom query parameters box */}
        {rankCriteria === "custom" ? (
          <div className="relative w-full md:w-64">
            <input
              type="text"
              id="custom-ranking-keyword"
              placeholder="E.g. React, Python, AWS..."
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 p-2.5 text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pr-8 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
          </div>
        ) : (
          <div className="text-xs text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
            Active leaderboard containing {rankedProfiles.length} ranked resumes.
          </div>
        )}
      </div>

      {/* Leaderboard Listings */}
      <div className="space-y-4">
        {rankedProfiles.map((res, index) => (
          <div
            key={res.id}
            id={`leaderboard-${res.id}`}
            onClick={() => onSelectResume(res)}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-[#2563EB] dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Placement tag */}
              <span className={`px-3.5 py-1.5 rounded-md text-xs font-bold leading-none shrink-0 ${
                index === 0
                  ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                  : index === 1
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  : index === 2
                  ? "bg-orange-100 dark:bg-orange-950/70 text-orange-850 dark:text-orange-300"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-500"
              }`}>
                {getRankMedal(index)}
              </span>

              {/* Profile Details summary */}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-850 dark:text-white truncate group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                  {res.candidateName || "Anonymous Resume"}
                </h4>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 truncate mt-1 font-mono">
                  {res.fileName} • {new Date(res.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quality index trackers */}
            <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t border-slate-100 dark:border-slate-850 pt-3 md:pt-0">
              
              {/* Icons overview */}
              <div className="flex gap-4 text-slate-400">
                <div className="flex items-center gap-1" title="Skills counted">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-650 dark:text-slate-300">
                    {res.skills.technical.reduce((a, c) => a + c.skills.length, 0)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1" title="Work experience score">
                  <Briefcase className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-xs font-semibold text-slate-650 dark:text-slate-330">
                    {res.atsScore.experience}/20
                  </span>
                </div>

                <div className="flex items-center gap-1" title="Education score">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-slate-650 dark:text-slate-330">
                    {res.atsScore.education}/15
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div className="text-right space-y-1 shrink-0 w-32">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {res.rankLabel}
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full shrink-0 w-24 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getPercentageColor(res.rankScore)}`}
                      style={{ width: `${res.rankScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-extrabold font-mono text-slate-850 dark:text-white">
                    {res.rankScore}%
                  </span>
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
