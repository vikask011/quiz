import { motion } from "framer-motion";
import Assess from "./assess";

function Assessment() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">Assessment</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Start your timed test right away with smooth animations like Practice Now
          </p>
        </motion.div>

        {/* Animated container for test content */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Assess />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Assessment;
