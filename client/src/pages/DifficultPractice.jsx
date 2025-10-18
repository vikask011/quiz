import { useState } from "react";
import DiffAssess from "./difficultassess.jsx";
import {
  percentageQuestions,
  profitLossQuestions,
  interestQuestions,
  ratioProportionQuestions,
  agesQuestions,
  permuteCombQuestions,
  logarithmQuestions,
  algebraQuestions,
  ARITHMETIC,
  algebra,
  NumberSeries,
  VARC,
} from "../assets/dataset/quiz-data.js";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Scale,
  Clock,
  BookOpen,
  ArrowRight,
  Trophy,
  Target,
  Shuffle,
  Activity,
  Variable,
  Hash,
  FunctionSquare,
} from "lucide-react";

function DifficultPractice() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Assessment configuration
  const newAssess = [
    {
      id: "permute-combination",
      title: "Permutations & Combinations",
      description:
        "Master counting principles, arrangements, and selection problems",
      questions: permuteCombQuestions,
      icon: Shuffle,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-600",
      difficulty: "Intermediate to Advanced",
      estimatedTime: "20-25 mins",
      totalQuestions: Object.values(permuteCombQuestions).flat().length,
    },
    {
      id: "logarithm",
      title: "Logarithms",
      description:
        "Solve logarithmic equations, properties, and exponential relationships",
      questions: logarithmQuestions,
      icon: Activity,
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
      textColor: "text-pink-600",
      difficulty: "Advanced",
      estimatedTime: "25-30 mins",
      totalQuestions: Object.values(logarithmQuestions).flat().length,
    },
    {
      id: "algebra",
      title: "Algebra",
      description:
        "Work with equations, inequalities, polynomials, and algebraic expressions",
      questions: algebraQuestions,
      icon: Variable,
      color: "from-teal-500 to-teal-600",
      bgColor: "from-teal-50 to-teal-100",
      borderColor: "border-teal-200",
      textColor: "text-teal-600",
      difficulty: "Beginner to Advanced",
      estimatedTime: "20-30 mins",
      totalQuestions: Object.values(algebraQuestions).flat().length,
    },
    {
      id: "arithmetic",
      title: "Arithmetic",
      description:
        "Practice fundamental operations, number properties, and mental math",
      questions: ARITHMETIC,
      icon: Hash,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "from-cyan-50 to-cyan-100",
      borderColor: "border-cyan-200",
      textColor: "text-cyan-600",
      difficulty: "Beginner to Intermediate",
      estimatedTime: "15-20 mins",
      totalQuestions: Object.values(ARITHMETIC).flat().length,
    },
    {
      id: "algebra-advanced",
      title: "Advanced Algebra",
      description:
        "Tackle complex algebraic problems, systems of equations, and functions",
      questions: algebra,
      icon: FunctionSquare,
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      textColor: "text-amber-600",
      difficulty: "Advanced",
      estimatedTime: "30-35 mins",
      totalQuestions: Object.values(algebra).flat().length,
    },
    {
      id: "number-series",
      title: "Number Series",
      description: "Work with numbers, and their real-world applications",
      questions: NumberSeries,
      icon: Scale,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
      difficulty: "Beginner to Intermediate",
      estimatedTime: "15-20 mins",
      totalQuestions: Object.values(NumberSeries).flat().length,
    },
    {
      id: "varc",
      title: "Verbal Ability",
      description:
        "Solve verbal ability related problems including grammar, vocabulary.",
      questions: VARC,
      icon: Clock,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      difficulty: "Beginner to Intermediate",
      estimatedTime: "15-20 mins",
      totalQuestions: Object.values(VARC).flat().length,
    },
  ];

  const assessmentTypes = [
    {
      id: "percentage",
      title: "Percentage Problems",
      description:
        "Master percentage calculations, discounts, and basic percentage operations",
      questions: percentageQuestions,
      icon: Calculator,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      difficulty: "Beginner to Advanced",
      estimatedTime: "15-20 mins",
      totalQuestions: Object.values(percentageQuestions).flat().length,
    },
    {
      id: "profit-loss",
      title: "Profit & Loss",
      description:
        "Calculate profit margins, loss percentages, and cost price scenarios",
      questions: profitLossQuestions,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      difficulty: "Intermediate",
      estimatedTime: "20-25 mins",
      totalQuestions: Object.values(profitLossQuestions).flat().length,
    },
    {
      id: "interest",
      title: "Simple & Compound Interest",
      description:
        "Solve problems involving simple interest, compound interest, and time value of money",
      questions: interestQuestions,
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      difficulty: "Intermediate to Advanced",
      estimatedTime: "25-30 mins",
      totalQuestions: Object.values(interestQuestions).flat().length,
    },
    {
      id: "ratio-proportion",
      title: "Ratio & Proportion",
      description:
        "Work with ratios, proportions, and their real-world applications",
      questions: ratioProportionQuestions,
      icon: Scale,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
      difficulty: "Beginner to Intermediate",
      estimatedTime: "15-20 mins",
      totalQuestions: Object.values(ratioProportionQuestions).flat().length,
    },
    {
      id: "ages",
      title: "Age Problems",
      description:
        "Solve age-related word problems and time-based calculations",
      questions: agesQuestions,
      icon: Clock,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      difficulty: "Beginner to Intermediate",
      estimatedTime: "15-20 mins",
      totalQuestions: Object.values(agesQuestions).flat().length,
    },
  ];

  // If an assessment is selected, render the Assess component
  if (selectedAssessment) {
    return (
      <div className="h-screen w-screen relative">
        <div className="relative z-10">
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => setSelectedAssessment(null)}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-200 transition-all duration-300"
            >
              ← Back to Selection
            </button>
          </div>
          <DiffAssess
            questionsData={selectedAssessment.questions}
            assessmentTitle={selectedAssessment.title}
            assessmentSubtitle={selectedAssessment.description}
          />
        </div>
      </div>
    );
  }

  // Render assessment selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Choose Your Assessment
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select a topic to test your knowledge and improve your aptitude
              skills
            </p>
          </div>

          {/* Assessment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {newAssess.map((assessment) => {
              const IconComponent = assessment.icon;
              return (
                <div
                  key={assessment.id}
                  className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${assessment.borderColor} overflow-hidden group cursor-pointer transform hover:scale-105`}
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  {/* Card Header */}
                  <div
                    className={`bg-gradient-to-r ${assessment.bgColor} p-6 relative`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${assessment.color} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight
                        className={`w-6 h-6 ${assessment.textColor} group-hover:translate-x-1 transition-transform duration-300`}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {assessment.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {assessment.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Questions:
                        </span>
                        <span className="font-semibold text-gray-800">
                          {assessment.totalQuestions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-semibold text-gray-800">
                          {assessment.estimatedTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Level:</span>
                        <span
                          className={`font-semibold ${assessment.textColor}`}
                        >
                          {assessment.difficulty}
                        </span>
                      </div>
                    </div>

                    <button
                      className={`w-full mt-6 bg-gradient-to-r ${assessment.color} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      Start Assessment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-2xl font-bold py-6">Additional Resources</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {assessmentTypes.map((assessment) => {
              const IconComponent = assessment.icon;
              return (
                <div
                  key={assessment.id}
                  className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${assessment.borderColor} overflow-hidden group cursor-pointer transform hover:scale-105`}
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  {/* Card Header */}
                  <div
                    className={`bg-gradient-to-r ${assessment.bgColor} p-6 relative`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${assessment.color} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight
                        className={`w-6 h-6 ${assessment.textColor} group-hover:translate-x-1 transition-transform duration-300`}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {assessment.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {assessment.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Questions:
                        </span>
                        <span className="font-semibold text-gray-800">
                          {assessment.totalQuestions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-semibold text-gray-800">
                          {assessment.estimatedTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Level:</span>
                        <span
                          className={`font-semibold ${assessment.textColor}`}
                        >
                          {assessment.difficulty}
                        </span>
                      </div>
                    </div>

                    <button
                      className={`w-full mt-6 bg-gradient-to-r ${assessment.color} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      Start Assessment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                How It Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Select Topic
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose from 5 different aptitude topics based on your learning
                  goals
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Take Assessment
                </h3>
                <p className="text-gray-600 text-sm">
                  Answer questions of varying difficulty levels at your own pace
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Get Results
                </h3>
                <p className="text-gray-600 text-sm">
                  Receive detailed performance analysis and downloadable reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DifficultPractice;

// import Assess from "./assess";
// import {
//   percentageQuestions,
//   profitLossQuestions,
//   interestQuestions,
//   ratioProportionQuestions,
//   agesQuestions,
// } from "../assets/dataset/quiz-data.js";

// function Assessment() {
//   return (
//     <div className="h-screen w-screen relative">
//       <div className="relative z-10">
//         <div>
//           <Assess percentageQuestions={percentageQuestions} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Assessment;
