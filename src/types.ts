export interface ATSBreakdown {
  contactInfo: number;     // max 10
  education: number;       // max 15
  skills: number;          // max 15
  projects: number;        // max 20
  experience: number;      // max 20
  certifications: number;  // max 10
  formatting: number;      // max 10
  total: number;           // max 100
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface KeywordMatch {
  keyword: string;
  count: number;
  density: number; // as percentage, e.g. 2.4
}

export interface ActionVerbDetail {
  verb: string;
  count: number;
  type: 'strong' | 'weak';
  replacement?: string;
}

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  uploadDate: string;
  candidateName: string;
  contactDetails: {
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
  };
  atsScore: ATSBreakdown;
  sections: {
    present: string[];
    missing: string[];
  };
  skills: {
    technical: SkillCategory[];
    soft: string[];
  };
  keywords: {
    found: KeywordMatch[];
    missing: string[];
    topKeywords: string[];
  };
  actionVerbs: {
    strong: ActionVerbDetail[];
    weak: ActionVerbDetail[];
    suggestions: string[];
  };
  recommendations: string[];
  strengths: string[];
  resumeText: string;
}

export interface JobMatchResult {
  id: string;
  resumeId: string;
  jobTitle: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordOverlap: string[];
  missingKeywords: string[];
  suggestions: string[];
  createdAt: string;
}

export interface DBStore {
  resumes: ResumeAnalysis[];
  jobMatches: JobMatchResult[];
}
