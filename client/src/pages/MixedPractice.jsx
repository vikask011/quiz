import bgImg from "../assets/images/practice.png";
import Apti from "./apti";

function MixedPractice() {
  return (
    // 1. Full screen container
    <div className="h-screen w-screen relative overflow-hidden">

      {/* 2. BACKGROUND IMAGE: Render first and use object-cover */}
      <img
        src={bgImg}
        alt="background"
        // Key change: object-cover maintains aspect ratio.
        className="absolute top-0 left-0 w-full h-full object-cover" 
      />

      {/* 3. CONTENT WRAPPER: Sits on top (z-10) and contains all visible elements */}
      <div className="relative z-10 w-full h-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Title Section (properly aligned) */}
        <div className="flex justify-center mb-8 pt-4"> 
          <h1 className="text-5xl font-extrabold text-orange-600 drop-shadow-lg bg-white bg-opacity-80 p-3 rounded-xl">
            Practice
          </h1>
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