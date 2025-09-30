import { Link } from "react-router-dom";
import Apti from "./apti";

function MixedPractice() {
  return (
    // 1. Full screen container with white background
    <div className="h-screen w-screen relative overflow-hidden bg-white">
      {/* 2. CONTENT WRAPPER */}
      <div className="relative z-10 w-full h-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 pt-4">
          {/* Title */}
          <h1 className="text-5xl font-extrabold text-orange-600 drop-shadow-lg bg-white p-3 rounded-xl">
            Practice
          </h1>

          {/* ✅ Back Button */}
          <Link
            to="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
          >
            ← Back
          </Link>
        </div>

        {/* Apti Component */}
        <div>
          <Apti />
        </div>

      </div>
    </div>
  );
}

export default MixedPractice;
