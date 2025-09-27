import bgImg from "../assets/images/assess.jpg";
import Assess from "./assess";

function Assessment() {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <img
        src={bgImg}
        alt="background"
        className="absolute top-0 left-0 w-full h-full object-fill"
      />
      <div className="relative z-10">
        <div>
          <Assess />
        </div>
      </div>
    </div>
  );
}

export default Assessment;
