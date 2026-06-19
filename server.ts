import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Smart progress report generator (conforming strictly to server-side Gemini execution)
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { student, badges, language } = req.body;
      if (!student) {
        return res.status(400).json({ error: "Missing student data" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return structured mock/placeholder report if the API key is not configured yet
        const localizedBackup = {
          en: `Backup Progress Summary for ${student.name}:\n- Attendance: ${student.attendancePercentage}%\n- Merit Points: ${student.meritPoints} (Team ${student.house})\n- Strong academics with grades: ${JSON.stringify(student.academicGrades)}.\n\nKeep up the wonderful efforts in both studies and school house coordinates!`,
          ta: `${student.name} க்கான முன்னேற்ற அறிக்கை:\n- வருகைப்பதிவு: ${student.attendancePercentage}%\n- இல்லப் புள்ளிகள்: ${student.meritPoints} (${student.house} இல்லம்)\n- கல்வி கிரேடுகள்: ${JSON.stringify(student.academicGrades)}.\n\nஉங்கள் கல்வி மற்றும் இல்ல விளையாட்டுகளில் தொடர்ந்து சிறந்து விளங்க வாழ்த்துகிறோம்!`,
          hi: `${student.name} के लिए प्रगति रिपोर्ट:\n- उपस्थिति: ${student.attendancePercentage}%\n- हाउस अंक: ${student.meritPoints} (${student.house} हाउस)\n- शैक्षणिक ग्रेड: ${JSON.stringify(student.academicGrades)}.\n\nपढ़ाई और स्कूल हाउस गतिविधियों में निरंतर उत्कृष्टता बनाए रखें!`,
          ml: `${student.name} എന്ന കുട്ടിയുടെ പുരോഗതി റിപ്പോർട്ട്:\n- ഹാജർ നില: ${student.attendancePercentage}%\n- ഹൗസ് പോയിന്റുകൾ: ${student.meritPoints} (${student.house} ഹൗസ്)\n- ഗ്രേഡുകൾ: ${JSON.stringify(student.academicGrades)}.\n\nപഠനത്തിലും സ്കൂൾ ഹൗസ് പ്രവർത്തനങ്ങളിലും കൂടുതൽ വിജയം കൈവരിക്കാൻ ആശംസിക്കുന്നു!`
        };
        const langCode = (language || "en") as "en" | "ta" | "hi" | "ml";
        const textBackup = localizedBackup[langCode] || localizedBackup["en"];
        return res.json({ report: textBackup });
      }

      // Format prompt for progress tracking report based on requested language
      let prompt = `You are a professional educational counselor at a prestigious school.
      Please generate a beautiful, descriptive, and highly professional student academic progress report cards summary and behavioral analysis.
      
      Student Details:
      - Name: ${student.name}
      - Class: ${student.class}
      - Roll Number: ${student.rollNo}
      - Team House: ${student.house} Team
      - Total Merit House Points: ${student.meritPoints}
      - Attendance Percentage: ${student.attendancePercentage}%
      - Academic Grades by Subject: ${JSON.stringify(student.academicGrades)}
      - Awards & Medals list: ${badges.map((b: any) => b.badgeTitle).join(", ") || "None yet"}

      Please write the progress report in ${language === "ta" ? "Tamil" : language === "hi" ? "Hindi" : language === "ml" ? "Malayalam" : "English"}.
      Include:
      1. A warm, welcoming opening statement tailored for the parents.
      2. Performance review (academics analysis based on their grades and attendance).
      3. Team house contribution highlight (give positive evaluation of how their ${student.house} house points help build school spirit).
      4. Actionable recommendations and steps for next term.
      5. An inspiring closing statement for the student.

      Format the output cleanly using bullet points and professional wording. Keep the report encouraging but honest. Do not use markdown tags other than standard bold/bullet lists.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const reportText = response.text || "Report generation failed. Please try again.";
      res.json({ report: reportText });

    } catch (err: any) {
      console.error("Error generating report via Gemini AI: ", err);
      res.status(500).json({ error: err.message || "Failed to generate progress report" });
    }
  });

  // Serve static assets in Prod / Vite middleware in Dev
  if (!isProd) {
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
    console.log(`EduCRM server booting at http://localhost:${PORT} [Prod: ${isProd}]`);
  });
}

startServer();
