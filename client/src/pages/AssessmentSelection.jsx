import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AssessmentSelection = () => {
  const navigate = useNavigate();
  const [selectedPracticeType, setSelectedPracticeType] = useState("adaptive");

  const handleStartPractice = () => {
    if (selectedPracticeType === "traditional") {
      navigate("/traditional/assessment");
    } else {
      navigate("/adaptive/assessment");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Assessment Mode
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your Assessment style to strengthen your skills
          </p>
        </motion.div>

        {/* Main Settings Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 md:p-10 mb-8"
        >
          {/* Assessment Type */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Assessment Type
            </h3>
            <div className="space-y-4">
              {/* Traditional Assessment */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedPracticeType === "traditional"
                    ? "border-blue-400 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25"
                }`}
                onClick={() => setSelectedPracticeType("traditional")}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">🎯</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">
                        Traditional Assessment
                      </h4>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPracticeType === "traditional"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedPracticeType === "traditional" && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Adaptive Assessment */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedPracticeType === "adaptive"
                    ? "border-blue-400 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25"
                }`}
                onClick={() => setSelectedPracticeType("adaptive")}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">🔀</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">
                        Adaptive Assessment
                      </h4>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPracticeType === "adaptive"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedPracticeType === "adaptive" && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartPractice}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex items-center"
            >
              Start Assessment
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentSelection;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// const AssessmentSelection = () => {
//   const navigate = useNavigate();

//   const [selectedPracticeType, setSelectedPracticeType] = useState("adaptive");

//   const handleStartPractice = () => {
//     if (selectedPracticeType === "traditional") {
//       navigate("/traditional/assessment");
//     } else {
//       navigate("/adaptive/assessment");
//     }
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, staggerChildren: 0.1 },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-12"
//         >
//           <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
//             Assessment Mode
//           </h1>
//           <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
//             Choose your Assessment style to strengthen your skills
//           </p>
//         </motion.div>

//         {/* Main Settings Card */}
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 md:p-10 mb-8"
//         >
//           {/* Practice Type */}
//           <motion.div variants={itemVariants} className="mb-8">
//             <h3 className="text-xl font-bold text-gray-900 mb-6">
//               Assessment Type
//             </h3>
//             <div className="space-y-4">
//               {/* Selection-Based Practice */}
//               <motion.div
//                 whileHover={{ scale: 1.01 }}
//                 whileTap={{ scale: 0.99 }}
//                 className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
//                   selectedPracticeType === "traditional"
//                     ? "border-blue-400 bg-blue-50 shadow-md"
//                     : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25"
//                 }`}
//                 onClick={() => setSelectedPracticeType("selection")}
//               >
//                 <div className="flex items-center">
//                   <div className="flex-1">
//                     <div className="flex items-center mb-2">
//                       <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
//                         <span className="text-white text-sm font-bold">🎯</span>
//                       </div>
//                       <h4 className="text-lg font-bold text-gray-900">
//                         Traditional Assessment
//                       </h4>
//                     </div>
//                     <p className="text-gray-600"></p>
//                   </div>
//                   <div className="ml-4">
//                     <div
//                       className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
//                         selectedPracticeType === "traditional"
//                           ? "border-blue-500 bg-blue-500"
//                           : "border-gray-300 bg-white"
//                       }`}
//                     >
//                       {selectedPracticeType === "traditional" && (
//                         <div className="w-3 h-3 bg-white rounded-full"></div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Mixed Practice */}
//               <motion.div
//                 whileHover={{ scale: 1.01 }}
//                 whileTap={{ scale: 0.99 }}
//                 className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
//                   selectedPracticeType === "mixed"
//                     ? "border-blue-400 bg-blue-50 shadow-md"
//                     : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25"
//                 }`}
//                 onClick={() => setSelectedPracticeType("mixed")}
//               >
//                 <div className="flex items-center">
//                   <div className="flex-1">
//                     <div className="flex items-center mb-2">
//                       <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-3">
//                         <span className="text-white text-sm font-bold">🔀</span>
//                       </div>
//                       <h4 className="text-lg font-bold text-gray-900">
//                         Adaptive Assessment
//                       </h4>
//                     </div>
//                     <p className="text-gray-600"></p>
//                   </div>
//                   <div className="ml-4">
//                     <div
//                       className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
//                         selectedPracticeType === "adaptive"
//                           ? "border-blue-500 bg-blue-500"
//                           : "border-gray-300 bg-white"
//                       }`}
//                     >
//                       {selectedPracticeType === "adaptive" && (
//                         <div className="w-3 h-3 bg-white rounded-full"></div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>

//           {/* Start Button */}
//           <motion.div variants={itemVariants} className="flex justify-center">
//             <motion.button
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={handleStartPractice}
//               className="px-12 py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex items-center"
//             >
//               Start Assessment
//             </motion.button>
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default AssessmentSelection;
