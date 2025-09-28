require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow your Vite dev server
app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN || 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection
(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI or MONGO_URI is not set. Please define it in server/.env');
      process.exit(1);
    }
    const mongooseOpts = {};
    if (process.env.MONGODB_DB) {
      mongooseOpts.dbName = process.env.MONGODB_DB;
    }
    await mongoose.connect(mongoUri, mongooseOpts);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
})();

// User model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    photoUrl: { type: String, default: '' }, // can store external URL or data URL
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// Result model
const resultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    correct: { type: Number, required: true, min: 0 },
    wrong: { type: Number, required: true, min: 0 },
    avgTimeSec: { type: Number, required: true, min: 0 }, // average time per question (seconds)
    questions: [
      {
        questionNumber: Number,
        question: String,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        timeTaken: Number,
        difficulty: String,
      },
    ],
  },
  { timestamps: true }
);

const Result = mongoose.model('Result', resultSchema);

// Helpers
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, gender = '', photoUrl = '' } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name || '', email, passwordHash, gender, photoUrl });

    const token = generateToken(user._id.toString());
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, gender: user.gender, photoUrl: user.photoUrl },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id.toString());
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, gender: user.gender, photoUrl: user.photoUrl } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('_id name email gender photoUrl createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile (name, email, gender, photoUrl)
app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const { name, email, gender, photoUrl } = req.body;
    const updates = {};
    if (typeof name === 'string') updates.name = name.trim();
    if (typeof email === 'string') updates.email = email.toLowerCase().trim();
    if (typeof gender === 'string') updates.gender = gender;
    if (typeof photoUrl === 'string') updates.photoUrl = photoUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No changes provided' });
    }

    const updated = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select('_id name email gender photoUrl');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    return res.json({ user: { id: updated._id, name: updated.name, email: updated.email, gender: updated.gender, photoUrl: updated.photoUrl } });
  } catch (err) {
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Record a test result
app.post('/api/results', auth, async (req, res) => {
  try {
    let { totalQuestions, correct, wrong, avgTimeSec, questions = [] } = req.body;
    totalQuestions = Number(totalQuestions);
    correct = Number(correct);
    avgTimeSec = Number(avgTimeSec);

    if (!Number.isFinite(totalQuestions) || !Number.isFinite(correct) || !Number.isFinite(avgTimeSec)) {
      return res.status(400).json({ message: 'Invalid numbers' });
    }
    if (totalQuestions < 1 || correct < 0 || correct > totalQuestions || avgTimeSec < 0) {
      return res.status(400).json({ message: 'Out of bounds values' });
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

    console.log('Saved result', result._id.toString(), 'for user', req.user.userId);
    return res.status(201).json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Summary for dashboard
app.get('/api/results/summary', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const [summary] = await Result.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$correct' },
          totalWrong: { $sum: '$wrong' },
          avgTimeSec: { $avg: '$avgTimeSec' },
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
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// History list
app.get('/api/results/history', auth, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const history = await Result.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('totalQuestions correct wrong avgTimeSec createdAt');

    return res.json({ history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get one detailed result (must be after static routes like /history)
app.get('/api/results/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid result id' });
    }
    const result = await Result.findOne({ _id: id, userId: req.user.userId });
    if (!result) return res.status(404).json({ message: 'Result not found' });
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
