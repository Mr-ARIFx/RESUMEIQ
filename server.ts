import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { DBStore, ResumeAnalysis, JobMatchResult } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 15MB limit for large base64 file payloads
app.use(express.json({ limit: "15mb" }));

// Initialize Local JSON database
const dbDir = path.join(process.cwd(), "database");
const dbPath = path.join(dbDir, "resume_db.json");

function readDB(): DBStore {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      const initialData: DBStore = { resumes: [], jobMatches: [] };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Database reading error, using in-memory fallback:", err);
    return { resumes: [], jobMatches: [] };
  }
}

function writeDB(data: DBStore) {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Database writing error:", err);
  }
}

// Lazy Gemini Client Initialization
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it under Settings > Secrets.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Robust fallback & retry capability for Gemini API requests
async function generateContentWithRetry(
  ai: GoogleGenAI,
  primaryModel: string,
  contents: any,
  config: any,
  maxRetries = 3
): Promise<any> {
  // Broad list of models to try in case of heavy traffic/503 errors
  const modelsToTry = [
    primaryModel,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview"
  ];
  let lastError: any = null;

  for (const model of modelsToTry) {
    console.log(`[Gemini API] Attempting content generation with model: ${model}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: config,
        });
        console.log(`[Gemini API] Success with model: ${model} on attempt: ${attempt}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || String(err);
        console.warn(`[Gemini API] Attempt ${attempt} failed with model ${model}: ${errMsg}`);
        
        // If we hit a 503 or overload, retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.log(`[Gemini API] Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    console.log(`[Gemini API] Model ${model} exhausted all attempts. Checking next fallback model...`);
  }

  throw lastError || new Error("All model fallback pathways exhausted.");
}

// Resume Analysis Schema for Structured output
const resumeAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    candidateName: { type: Type.STRING, description: "Full name of the candidate. If not found, use Unknown Candidate" },
    contactDetails: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING, description: "Candidate email or empty if not found" },
        phone: { type: Type.STRING, description: "Candidate phone or empty if not found" },
        linkedin: { type: Type.STRING, description: "Candidate LinkedIn profile link or empty if not found" },
        portfolio: { type: Type.STRING, description: "Candidate personal portfolio or GitHub link or empty if not found" }
      },
      required: ["email", "phone", "linkedin", "portfolio"]
    },
    atsScore: {
      type: Type.OBJECT,
      properties: {
        contactInfo: { type: Type.INTEGER, description: "Score out of 10. Max 10 if standard email, phone, and linkedin are present." },
        education: { type: Type.INTEGER, description: "Score out of 15. Max 15 if relevant college/degrees are present." },
        skills: { type: Type.INTEGER, description: "Score out of 15. Max 15 if modern technical and soft skills are present." },
        projects: { type: Type.INTEGER, description: "Score out of 20. Max 20 if detailed structured side projects are present." },
        experience: { type: Type.INTEGER, description: "Score out of 20. Max 20 if employment experience, internships or relevant work history is present with detailed bullets." },
        certifications: { type: Type.INTEGER, description: "Score out of 10. Max 10 if modern certifications, online courses or awards are listed." },
        formatting: { type: Type.INTEGER, description: "Score out of 10. Max 10 if sections are well organized, easy to parse, clean." },
        total: { type: Type.INTEGER, description: "Sum of all sections score, strictly equal to formatting+certifications+experience+projects+skills+education+contactInfo" }
      },
      required: ["contactInfo", "education", "skills", "projects", "experience", "certifications", "formatting", "total"]
    },
    sections: {
      type: Type.OBJECT,
      properties: {
        present: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Standard sections found from: Contact Information, Education, Skills, Projects, Experience, Certifications, Achievements, Languages" },
        missing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sections NOT present in resume from: Contact Information, Education, Skills, Projects, Experience, Certifications, Achievements, Languages" }
      },
      required: ["present", "missing"]
    },
    skills: {
      type: Type.OBJECT,
      properties: {
        technical: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "E.g. Languages, Frontend, Backend, Tools & Devops, Databases" },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["category", "skills"]
          }
        },
        soft: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Soft skills found (e.g. Leadership, Teamwork, Agile, Remote collaboration)" }
      },
      required: ["technical", "soft"]
    },
    keywords: {
      type: Type.OBJECT,
      properties: {
        found: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              count: { type: Type.INTEGER },
              density: { type: Type.NUMBER, description: "Frequency / total estimated words as percentage like 1.5 for 1.5%" }
            },
            required: ["keyword", "count", "density"]
          }
        },
        missing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important ATS terms or industry keywords missing for their domain" },
        topKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Main 5-8 descriptive key-terms found" }
      },
      required: ["found", "missing", "topKeywords"]
    },
    actionVerbs: {
      type: Type.OBJECT,
      properties: {
        strong: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              verb: { type: Type.STRING, description: "Action verbs found like Built, Designed, Developed, Optimized, Integrated" },
              count: { type: Type.INTEGER }
            },
            required: ["verb", "count"]
          }
        },
        weak: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              verb: { type: Type.STRING, description: "Weak verbs found like Worked on, Assisted, Helped, Tried" },
              count: { type: Type.INTEGER },
              replacement: { type: Type.STRING, description: "Strong alternative action verb to replacement" }
            },
            required: ["verb", "count", "replacement"]
          }
        },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detailed optimization feedback for writing verbs" }
      },
      required: ["strong", "weak", "suggestions"]
    },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concrete, actionable tips to boost ATS score (e.g. include GitHub links, replace weak impact statements with Metrics)" },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core professional highlights found in this resume" },
    resumeText: { type: Type.STRING, description: "Clean plain-text extraction of all textual details parsed from the resume" }
  },
  required: [
    "candidateName",
    "contactDetails",
    "atsScore",
    "sections",
    "skills",
    "keywords",
    "actionVerbs",
    "recommendations",
    "strengths",
    "resumeText"
  ]
};

// API Endpoint to Analyze Resume
app.post("/api/analyze", async (req, res) => {
  try {
    const { fileName, fileType, fileData, text } = req.body;

    if (!text && !fileData) {
      return res.status(400).json({ error: "No content provided. Please upload a PDF or paste text." });
    }

    // Lazy load first to capture configuration error clearly
    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }

    let contents: any[] = [];
    let promptMsg = `
      You are an elite Resume Parser and ATS Specialist.
      Analyze the attached resume file (or provided text description) and extract metadata, keywords, scores, action verbs, and structure.
      Generate a thorough breakdown following the requested responseSchema.
      In your keyword analysis, compute exact or realistic keyword counts and densities (e.g. 1.2 for 1.2% density).
      Provide actionable formatting and content suggestions. Make sure you extract candidate contact parameters if present.
    `;

    if (fileData) {
      // PDF or file uploaded
      const base64Data = fileData.replace(/^data:application\/pdf;base64,/, "");
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: fileType || "application/pdf"
        }
      });
      contents.push(promptMsg);
    } else {
      // Plain text paste
      contents.push(promptMsg + `\n\n=== RESUME TEXT ===\n${text}`);
    }

    const response = await generateContentWithRetry(
      ai,
      "gemini-3.5-flash",
      contents,
      {
        responseMimeType: "application/json",
        responseSchema: resumeAnalysisSchema
      }
    );

    const parsedJson = JSON.parse(response.text || "{}");
    
    // Save to locally synchronized DB
    const db = readDB();
    const newAnalysis: ResumeAnalysis = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: fileName || "Pasted Text Resume",
      uploadDate: new Date().toISOString(),
      ...parsedJson
    };

    db.resumes.unshift(newAnalysis);
    writeDB(db);

    return res.json(newAnalysis);
  } catch (error: any) {
    console.error("Analysis API failed:", error);
    return res.status(500).json({ error: `Analysis failed: ${error.message}` });
  }
});

// Job Description Comparison Schema
const jobMatchSchema = {
  type: Type.OBJECT,
  properties: {
    jobTitle: { type: Type.STRING, description: "Identified Job Title from Job Description" },
    matchScore: { type: Type.INTEGER, description: "Estimated ATS alignment score out of 100 based on matching keyword skills" },
    matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills present in both Job Description and Resume" },
    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills requested in Job Description but missing in Resume" },
    keywordOverlap: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Common industry keywords found in both" },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Crucial keywords from Job Description missing in Resume" },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concrete additions and section modifications to improve alignment" }
  },
  required: [
    "jobTitle",
    "matchScore",
    "matchedSkills",
    "missingSkills",
    "keywordOverlap",
    "missingKeywords",
    "suggestions"
  ]
};

// API Endpoint to Match Resume against Job Description
app.post("/api/job-match", async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: "Missing resumeId or jobDescription." });
    }

    const db = readDB();
    const resume = db.resumes.find((r) => r.id === resumeId);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found." });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }

    const promptText = `
      You are an expert career consultant.
      Compare the following Resume with the Job Description.
      Calculate the match percentage, extract overlapping/missing skills and keywords, and outline optimized changes needed in the resume to pass the ATS filter for this role.

      === RESUME TEXT ===
      ${resume.resumeText || JSON.stringify(resume.skills)}

      === JOB DESCRIPTION ===
      ${jobDescription}
    `;

    const response = await generateContentWithRetry(
      ai,
      "gemini-3.5-flash",
      promptText,
      {
        responseMimeType: "application/json",
        responseSchema: jobMatchSchema
      }
    );

    const matchData = JSON.parse(response.text || "{}");

    const newMatchResult: JobMatchResult = {
      id: Math.random().toString(36).substr(2, 9),
      resumeId,
      createdAt: new Date().toISOString(),
      ...matchData
    };

    db.jobMatches.push(newMatchResult);
    writeDB(db);

    return res.json(newMatchResult);
  } catch (error: any) {
    console.error("Job Match API failed:", error);
    return res.status(500).json({ error: `Job match failed: ${error.message}` });
  }
});

// API Endpoint to Get Resume History
app.get("/api/history", (req, res) => {
  try {
    const db = readDB();
    return res.json(db);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Endpoint to Delete a Resume Report
app.delete("/api/history/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();

    db.resumes = db.resumes.filter((r) => r.id !== id);
    db.jobMatches = db.jobMatches.filter((m) => m.resumeId !== id);

    writeDB(db);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API Live Server & Vite Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
