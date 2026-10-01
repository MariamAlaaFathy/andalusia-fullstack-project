import { NavLink } from "react-router-dom";

function Opening() {
  return (
    <div>
      <section className="flex flex-col md:flex-row md:min-h-screen">
        <div className="w-full md:w-[45%] flex items-center px-5 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#333333] font-['El_Messiri',_serif] leading-[1.05] mb-8">
              Learning the skill.
              <br />
              Follow the path.
              <br />
              Get the job.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-[550px] mb-8">
              Andalusia Academy connects individual courses into structured
              career paths, so every lesson moves you toward something you can
              put on a resume.
            </p>
            <NavLink
              to="/"
              className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-10 py-4 rounded-md text-base transition-colors cursor-pointer shadow-md"
            >
              Explore courses
            </NavLink>
          </div>
        </div>
        <div className="w-full md:w-[55%] h-72 sm:h-[420px] md:h-screen">
          <img
            src="landscape2.jpg"
            alt="Learning at Andalusia Academy"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-4xl font-bold text-[#333333] font-['El_Messiri',_serif] mb-10">
          Explore courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NavLink
            to="/courses/web-development"
            className="border border-gray-200 rounded-xl p-6 min-h-[180px] hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#333333]">
              Web development
            </h3>

            <p className="text-gray-500 mt-3">
              Build modern websites and web applications.
            </p>
          </NavLink>

          <NavLink
            to="/courses/data-ai"
            className="border border-gray-200 rounded-xl p-6 min-h-[180px] hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#333333]">
              Data and AI
            </h3>

            <p className="text-gray-500 mt-3">
              Learn data analysis, AI and machine learning.
            </p>
          </NavLink>

          <NavLink
            to="/courses/design"
            className="border border-gray-200 rounded-xl p-6 min-h-[180px] hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#333333]">Design</h3>

            <p className="text-gray-500 mt-3">
              Develop your UI, UX and visual design skills.
            </p>
          </NavLink>

          <NavLink
            to="/courses/business"
            className="border border-gray-200 rounded-xl p-6 min-h-[180px] hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#333333]">Business</h3>

            <p className="text-gray-500 mt-3">
              Learn practical business skills.
            </p>
          </NavLink>
        </div>
      </section>
    </div>
  );
}

export default Opening;
