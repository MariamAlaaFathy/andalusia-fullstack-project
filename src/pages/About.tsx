import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const values = [
    {
      title: "Practical Learning",
      description:
        "Every course is built around real-world projects, giving you skills you can immediately apply in your job or portfolio.",
    },
    {
      title: "Expert Mentorship",
      description:
        "Learn directly from industry practitioners who bring active experience and guidance to your learning journey.",
    },
    {
      title: "Structured Growth",
      description:
        "Clear learning paths remove the guesswork, letting you focus on step-by-step progress towards your career goals.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F2] font-sans text-[#333333] flex flex-col justify-between">
      <div>
        <NavBar />

        <section className="bg-white border-b border-[#F2EDE9] py-12 sm:py-16 px-4 sm:px-6 lg:px-0">
          <div className="max-w-[1180px] mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['El_Messiri',_serif]">
              About Andalusia Academy
            </h1>
            <p className="text-[#666666] text-lg max-w-[700px] mx-auto leading-relaxed">
              Empowering learners across the region with structured career
              paths, hands-on technical training, and industry-aligned skills.
            </p>
          </div>
        </section>

        <section className="max-w-[1180px] mx-auto my-12 sm:my-16 px-4 sm:px-6 lg:px-0">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#F2EDE9] shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 font-['El_Messiri',_serif]">
                Our Mission
              </h2>
              <p className="text-[#666666] text-base leading-relaxed mb-4">
                Andalusia Academy was created to bridge the gap between academic
                education and practical industry demands. We provide accessible,
                high-quality learning experiences designed to take you from
                foundational concepts to market-ready expertise.
              </p>
              <p className="text-[#666666] text-base leading-relaxed">
                Whether you are stepping into tech for the first time,
                upskilling for a promotion, or training an engineering team, our
                programs adapt to your goals.
              </p>
            </div>
            <div className="flex-1 w-full h-[260px] bg-[#B57B65] rounded-xl flex items-center justify-center p-8 text-white text-center">
              <div>
                <p className="text-4xl font-bold font-['El_Messiri',_serif] mb-2">
                  One Academy.
                </p>
                <p className="text-xl font-light text-[#F5E6E0]">
                  Every Learning Moment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1180px] mx-auto mb-16 sm:mb-20 px-4 sm:px-6 lg:px-0">
          <h2 className="text-3xl font-bold mb-8 font-['El_Messiri',_serif] text-center md:text-left">
            Why Learn With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-[#F2EDE9] shadow-xs hover:border-[#A16F5E] transition-colors"
              >
                <h3 className="text-xl font-bold mb-3 font-['El_Messiri',_serif]">
                  {item.title}
                </h3>
                <p className="text-[#666666] text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border-t border-[#F2EDE9] py-16 px-4 text-center">
          <div className="max-w-[700px] mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-['El_Messiri',_serif]">
              Ready to start your journey?
            </h2>
            <p className="text-[#666666] mb-8">
              Explore our full course catalog or create an account to begin
              learning today.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-8 py-3.5 rounded-md transition-colors cursor-pointer text-sm shadow-md"
            >
              Get Started Free
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
