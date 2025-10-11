require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CORS: allow your Vite dev server
app.use(
  cors({
    origin: ["http://localhost:5173", "https://quiz-jmux.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection
(async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error(
        "MONGODB_URI or MONGO_URI is not set. Please define it in server/.env"
      );
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
})();

// User model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    photoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Result model
const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    totalQuestions: { type: Number, required: true, min: 1 },
    correct: { type: Number, required: true, min: 0 },
    wrong: { type: Number, required: true, min: 0 },
    avgTimeSec: { type: Number, required: true, min: 0 },
    questions: [
      {
        questionNumber: Number,
        question: String,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        timeTaken: Number,
        difficulty: String,
        fundamentals: [String],
      },
    ],
    aiSummary: { type: String, default: "" },
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);

// Helpers
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [, token] = header.split(" ");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, gender = "", photoUrl = "" } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || "",
      email,
      passwordHash,
      gender,
      photoUrl,
    });

    const token = generateToken(user._id.toString());
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        photoUrl: user.photoUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id.toString());
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        photoUrl: user.photoUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Current user
app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "_id name email gender photoUrl createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update profile
app.put("/api/user/profile", auth, async (req, res) => {
  try {
    const { name, email, gender, photoUrl } = req.body;
    const updates = {};
    if (typeof name === "string") updates.name = name.trim();
    if (typeof email === "string") updates.email = email.toLowerCase().trim();
    if (typeof gender === "string") updates.gender = gender;
    if (typeof photoUrl === "string") updates.photoUrl = photoUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No changes provided" });
    }

    const updated = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select("_id name email gender photoUrl");

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        gender: updated.gender,
        photoUrl: updated.photoUrl,
      },
    });
  } catch (err) {
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Record a test result
app.post("/api/results", auth, async (req, res) => {
  try {
    let {
      totalQuestions,
      correct,
      wrong,
      avgTimeSec,
      questions = [],
    } = req.body;
    totalQuestions = Number(totalQuestions);
    correct = Number(correct);
    avgTimeSec = Number(avgTimeSec);

    if (
      !Number.isFinite(totalQuestions) ||
      !Number.isFinite(correct) ||
      !Number.isFinite(avgTimeSec)
    ) {
      return res.status(400).json({ message: "Invalid numbers" });
    }
    if (
      totalQuestions < 1 ||
      correct < 0 ||
      correct > totalQuestions ||
      avgTimeSec < 0
    ) {
      return res.status(400).json({ message: "Out of bounds values" });
    }
    wrong = totalQuestions - correct;

    const result = await Result.create({
      userId: req.user.userId,
      totalQuestions,
      correct,
      wrong,
      avgTimeSec,
      questions,
    });

    console.log(
      "Saved result",
      result._id.toString(),
      "for user",
      req.user.userId
    );
    return res.status(201).json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Generate AI summary for a result
app.post("/api/results/:id/summary", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid result id" });
    }

    const result = await Result.findOne({ _id: id, userId: req.user.userId });
    if (!result) return res.status(404).json({ message: "Result not found" });

    if (result.aiSummary) {
      return res.json({ summary: result.aiSummary });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const difficultyStats = result.questions.reduce((acc, q) => {
      const key = q.difficulty || 'unknown';
      if (!acc[key]) acc[key] = { total: 0, correct: 0 };
      acc[key].total++;
      if (q.isCorrect) acc[key].correct++;
      return acc;
    }, {});

    // Aggregate performance by fundamentals/topics
    const fundamentalStats = result.questions.reduce((acc, q) => {
      const tags = Array.isArray(q.fundamentals) ? q.fundamentals : [];
      tags.forEach((tag) => {
        const t = String(tag).toLowerCase();
        if (!acc[t]) acc[t] = { total: 0, correct: 0, avgTime: 0, times: [] };
        acc[t].total++;
        if (q.isCorrect) acc[t].correct++;
        if (q.timeTaken) acc[t].times.push(q.timeTaken);
      });
      return acc;
    }, {});

    // Calculate average time per topic
    Object.values(fundamentalStats).forEach(stat => {
      if (stat.times.length > 0) {
        stat.avgTime = stat.times.reduce((sum, time) => sum + time, 0) / stat.times.length / 1000; // convert to seconds
      }
    });

    const topicPerformance = Object.entries(fundamentalStats)
      .map(([tag, s]) => {
        const accPct = s.total ? ((s.correct / s.total) * 100).toFixed(1) : '0.0';
        const timeInfo = s.avgTime > 0 ? `, avg: ${s.avgTime.toFixed(1)}s` : '';
        return {
          topic: tag,
          accuracy: parseFloat(accPct),
          text: `- ${tag.charAt(0).toUpperCase() + tag.slice(1)}: ${s.correct}/${s.total} correct (${accPct}%)${timeInfo}`
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy); // sort by accuracy ascending (weakest first)

    const weakestTopics = topicPerformance.slice(0, 2).map(t => t.topic);
    const strongestTopics = topicPerformance.slice(-2).map(t => t.topic).reverse();
    
    const topicLines = topicPerformance.map(t => t.text).join('\n');

    const difficultyLines = Object.entries(difficultyStats)
      .map(([diff, s]) => {
        const accPct = s.total ? ((s.correct / s.total) * 100).toFixed(1) : '0.0';
        return `- ${String(diff).replace('_',' ')}: ${s.correct}/${s.total} correct (${accPct}%)`;
      })
      .join('\n');

    const overallAccuracy = ((result.correct / result.totalQuestions) * 100);
    const timePerformance = result.avgTimeSec > 60 ? 'slow' : result.avgTimeSec > 30 ? 'moderate' : 'fast';
    
    const prompt = `You are a learning coach analyzing a student's quiz performance. Provide actionable feedback in simple language (140-200 words).

Performance Overview:
- ${result.correct}/${result.totalQuestions} questions correct (${overallAccuracy.toFixed(1)}% accuracy)
- Average time per question: ${result.avgTimeSec.toFixed(1)} seconds

Topic Performance (sorted by weakness):
${topicLines || '- No specific topic data available'}

Strongest areas: ${strongestTopics.join(', ') || 'Not enough data'}
Weakest areas: ${weakestTopics.join(', ') || 'Not enough data'}

Write your response with this structure:
1. One encouraging sentence about overall performance
2. • Strengths: List 1-2 strongest topics/skills they should maintain
3. • Areas to improve: List 1-2 specific weakest topics that need focus
4. • Study strategy: Give one specific tip based on their time performance (${timePerformance}) and accuracy pattern
5. End with one concrete next step they can take today

Be encouraging but honest. Focus on specific topics (like "application", "grasping", "retention") rather than difficulty levels. Make suggestions actionable and motivating.`;

    let summary = '';
    try {
      const aiResult = await model.generateContent(prompt);
      summary = aiResult.response.text();
      
      if (!summary || summary.trim().length < 50) {
        throw new Error('Generated summary too short or empty');
      }
    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      
      // Fallback summary based on performance data
      const overallAccuracy = ((result.correct / result.totalQuestions) * 100);
      const performanceLevel = overallAccuracy >= 80 ? 'excellent' : 
                              overallAccuracy >= 60 ? 'good' : 
                              overallAccuracy >= 40 ? 'fair' : 'needs improvement';
      
      const weakTopics = weakestTopics.slice(0, 2);
      const strongTopics = strongestTopics.slice(0, 2);
      
      summary = `Your overall performance shows ${performanceLevel} results with ${result.correct}/${result.totalQuestions} questions correct (${overallAccuracy.toFixed(1)}% accuracy).\n\n` +
                `• Strengths: You performed well in ${strongTopics.length > 0 ? strongTopics.join(' and ') : 'several areas'}.\n` +
                `• Areas to improve: Focus on ${weakTopics.length > 0 ? weakTopics.join(' and ') : 'reviewing incorrect answers'}.\n` +
                `• Time management: You averaged ${result.avgTimeSec.toFixed(1)} seconds per question.\n\n` +
                `Next step: Review the questions you got wrong and practice similar problems in your weaker topic areas.`;
    }

    result.aiSummary = summary;
    await result.save();

    return res.json({ summary });
  } catch (err) {
    console.error("AI Summary Error:", err);
    return res.status(500).json({ 
      message: "Unable to generate performance summary. Please try again later." 
    });
  }
});

// Summary for dashboard
app.get("/api/results/summary", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const [summary] = await Result.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          totalQuestions: { $sum: "$totalQuestions" },
          totalCorrect: { $sum: "$correct" },
          totalWrong: { $sum: "$wrong" },
          avgTimeSec: { $avg: "$avgTimeSec" },
        },
      },
    ]);

    const data = summary || {
      totalAssessments: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalWrong: 0,
      avgTimeSec: 0,
    };

    return res.json({ summary: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// History list
app.get("/api/results/history", auth, async (req, res) => {
  try {
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit, 10) || 20)
    );
    const history = await Result.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("totalQuestions correct wrong avgTimeSec createdAt");

    return res.json({ history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get one detailed result
app.get("/api/results/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid result id" });
    }
    const result = await Result.findOne({ _id: id, userId: req.user.userId });
    if (!result) return res.status(404).json({ message: "Result not found" });
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});