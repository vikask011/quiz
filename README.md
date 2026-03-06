# Adaptive Quiz Assessment Platform

A comprehensive full-stack quiz and assessment platform built with the MERN stack, featuring adaptive testing algorithms, AI-powered performance analysis, and detailed progress tracking.

## Overview

This platform provides an intelligent quiz system designed to assess and improve cognitive abilities through adaptive testing methodologies. The system dynamically adjusts question difficulty based on user performance, provides AI-generated insights, and tracks progress over time.

## Key Features

### 1. Adaptive Assessment System
- Dynamic difficulty adjustment based on real-time performance
- Intelligent question selection algorithm
- Progressive difficulty levels: Very Easy → Easy → Moderate → Difficult
- Maximum 30 questions per adaptive test
- Automatic level progression after 2 consecutive correct answers

### 2. Multiple Assessment Modes
- **Adaptive Assessment**: AI-driven difficulty adjustment
- **Traditional Assessment**: Fixed difficulty testing
- **Selection-Based Assessment**: Topic-specific testing
- **Practice Mode**: Mixed practice and difficult practice options

### 3. AI-Powered Performance Analysis
- Integration with Google Gemini AI for intelligent result analysis
- Personalized performance insights
- Topic-wise strength and weakness identification
- Time management analysis
- Actionable improvement recommendations

### 4. Comprehensive Progress Tracking
- Detailed test history with timestamps
- Question-by-question performance breakdown
- Overall statistics dashboard
- Average time per question tracking
- Correctness percentage by difficulty level

### 5. User Authentication & Profiles
- Secure JWT-based authentication
- User registration and login
- Profile management
- Password encryption using bcrypt
- Session persistence

### 6. Rich Question Database
- Over 29,000 questions across multiple difficulty levels
- Topics include:
  - Permutation and Combination
  - Logical Reasoning
  - Quantitative Aptitude
  - And more
- Each question includes:
  - Multiple choice options
  - Detailed explanations
  - Fundamental concepts tags
  - Difficulty classification

### 7. Advanced UI/UX
- Responsive design with Tailwind CSS
- Smooth animations using Framer Motion
- Real-time timer display
- Interactive progress indicators
- PDF result export capability
- Clean, modern interface

## Tech Stack

### Frontend (Client)
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool and dev server |
| React Router DOM | Client-side routing |
| Axios | HTTP client for API calls |
| Framer Motion | Animations and transitions |
| Tailwind CSS | Styling framework |
| Lucide React | Icon library |
| jsPDF | PDF generation for results |
| html2canvas | Screenshot capture for PDFs |

### Backend (Server)
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Google Generative AI | AI-powered analysis |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variable management |

## Project Structure

```
quiz/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── assets/
│   │   │   ├── dataset/      # Question database
│   │   │   └── images/       # Application images
│   │   ├── context/          # React context (Auth)
│   │   ├── lib/              # API utilities
│   │   ├── pages/            # Page components
│   │   │   ├── Homepage.jsx
│   │   │   ├── AdaptiveAssess.jsx
│   │   │   ├── auth.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── ResultDetail.jsx
│   │   │   └── ... (other pages)
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                    # Backend application
    ├── server.js             # Main server file
    ├── package.json
    └── .env                  # Environment variables (not in repo)
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique, required),
  passwordHash: String (required),
  gender: String (enum: male, female, other),
  photoUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Result Model
```javascript
{
  userId: ObjectId (ref: User),
  totalQuestions: Number,
  correct: Number,
  wrong: Number,
  avgTimeSec: Number,
  questions: [{
    questionNumber: Number,
    question: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number,
    difficulty: String,
    fundamentals: [String]
  }],
  aiSummary: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### User Management
- `PUT /api/user/profile` - Update user profile (protected)

### Results & Analytics
- `POST /api/results` - Save test result (protected)
- `GET /api/results/history` - Get user's test history (protected)
- `GET /api/results/summary` - Get overall statistics (protected)
- `GET /api/results/:id` - Get specific result details (protected)
- `POST /api/results/:id/summary` - Generate AI summary for result (protected)

### Health Check
- `GET /api/health` - Server health status

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/MaheshN1821/hackathon.git
cd hackathon
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend server:
```bash
npm start
# or for development with auto-restart
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Update the API endpoints in the following files if needed:
- `src/context/AuthContext.jsx`
- `src/lib/api.js`
- `src/pages/*.jsx`

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd client
npm run build
npm run preview
```

## Adaptive Testing Algorithm

The platform implements an intelligent adaptive testing algorithm:

1. **Initial Level**: All users start at "very_easy"
2. **Progression Logic**: 
   - Advance to next level after 2 consecutive correct answers
   - Drop back one level after 2 consecutive wrong answers
3. **Level Sequence**: very_easy → easy → moderate → difficult
4. **Question Limit**: Maximum 30 questions per test
5. **Dynamic Selection**: Questions are randomly selected from available pool at current difficulty
6. **History Tracking**: Previously asked questions are tracked to avoid repetition

## AI Analysis Features

The platform uses Google Gemini AI to provide:
- Performance trends analysis
- Topic-wise performance breakdown
- Time management insights
- Difficulty progression tracking
- Personalized improvement recommendations
- Strengths and weaknesses identification

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication with 7-day expiry
- Protected API routes with authentication middleware
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- MongoDB injection prevention through Mongoose

## Deployment

### Frontend (Vercel)
The frontend is deployed on Vercel at: `https://quiz-jmux.vercel.app`

Configuration in `client/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Backend (Vercel)
The backend is deployed on Vercel at: `https://quiz-woad-pi.vercel.app`

Configuration in `server/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/server.js" }
  ]
}
```

## Future Enhancements

- Mobile application (React Native)
- Real-time multiplayer quiz mode
- Leaderboard system
- Certificate generation
- Admin dashboard for question management
- Integration with educational platforms
- Video explanations for questions
- Voice-based quiz mode
- Gamification with badges and achievements
- Social sharing features
- Advanced analytics with charts and graphs
- Custom quiz creation by users
- Timed challenge mode
- Group study sessions
- Performance comparison with peers

## Performance Optimizations

- Lazy loading of routes
- Optimized database queries with indexes
- Token-based authentication to reduce server load
- Client-side caching of user data
- Efficient state management with React Context
- Minimized bundle size with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Google Generative AI for intelligent analysis
- MongoDB for robust database solutions
- Vercel for seamless deployment
- The open-source community for excellent libraries and tools

## Contact

For questions or support, please contact the development team.

---

**Built with ❤️ by Team Warriors**
