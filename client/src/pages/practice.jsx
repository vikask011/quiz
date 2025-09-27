import bgImg from "../assets/images/practice.png";
import Apti from "./apti";

function Practice() {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <img
        src={bgImg}
        alt="background"
        className="absolute top-0 left-0 w-full h-full object-fill"
      />
      <div className="relative z-10">
        <div>
          <Apti />
        </div>
      </div>
    </div>
  );
}

export default Practice;
