import { useNavigate } from "react-router-dom";

export default function ForBusinessSection() {
  const navigate = useNavigate();
  return (
    <div
      id="for-business"
      className="max-w-[1180px] mx-auto my-12 sm:my-16 px-4 sm:px-6 lg:px-0 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12"
    >
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl font-bold text-[#333333] mb-5 font-['El_Messiri',_serif]">
          For business
        </h2>
        <p className="text-[#666666] text-base leading-relaxed mb-8 max-w-[500px] mx-auto md:mx-0">
          Upskill your team with cohort pricing, progress reporting and a
          dedicated account contact.
        </p>
        <button
          className="border-2 border-[#A16F5E] text-[#A16F5E] hover:bg-[#A16F5E] hover:text-white font-bold px-6 py-3 rounded-md transition-colors cursor-pointer text-sm"
          onClick={() => navigate("/contact")}
        >
          Talk to our team
        </button>
      </div>
      <div className="flex-1 w-full h-[320px] rounded-2xl overflow-hidden shadow-sm border border-[#F2EDE9]">
        <img
          src="https://api.andalusia-academy.com/storage/AHA-EG/home-sliders/June2026/TptYKO0SkgH01vFsvQmWwfY0LFawHmACY1TO0Qhz.webp"
          alt="For Business Banner"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
