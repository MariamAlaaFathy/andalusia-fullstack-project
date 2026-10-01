import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[850px] mx-auto my-24 text-center px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-5 font-['El_Messiri',_serif]">
        Ready to start your path?
      </h2>
      <p className="text-[#666666] text-lg mb-10 max-w-[650px] mx-auto">
        Create a free account and browse the full catalog in minutes.
      </p>
      <button
        onClick={() => navigate("/signup")}
        className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-10 py-4 rounded-md text-base transition-colors cursor-pointer shadow-md"
      >
        Get started free
      </button>
    </div>
  );
}
