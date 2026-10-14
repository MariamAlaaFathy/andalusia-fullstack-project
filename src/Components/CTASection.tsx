import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[850px] mx-auto my-16 sm:my-24 text-center px-4">
      <h2 className="mb-5 font-['El_Messiri',_serif] text-3xl font-bold text-[#333333] sm:text-4xl md:text-5xl">
        Ready to start your path?
      </h2>
      <p className="mx-auto mb-10 max-w-[650px] text-base text-[#666666] sm:text-lg">
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
