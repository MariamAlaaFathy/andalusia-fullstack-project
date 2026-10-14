import { NavLink } from "react-router-dom";

function Opening() {
  return (
    <div>
      <section className="flex flex-col md:flex-row md:min-h-screen">
        <div className="w-full md:w-[45%] flex items-center px-5 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
          <div>
            <h1 className="mb-8 font-['El_Messiri',_serif] text-3xl font-bold leading-[1.05] text-[#333333] sm:text-5xl md:text-6xl">
              Learning the skill.
              <br />
              Follow the path.
              <br />
              Get the job.
            </h1>
            <p className="mb-8 max-w-[550px] text-base leading-relaxed text-gray-600 sm:text-lg">
              Andalusia Academy connects structured programs to career paths,
              so every step moves you toward something you can put on a resume.
            </p>
            <NavLink
              to="/Programs"
              className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-10 py-4 rounded-md text-base transition-colors cursor-pointer shadow-md"
            >
              Explore programs
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
        <h2 className="mb-10 font-['El_Messiri',_serif] text-3xl font-bold text-[#333333] sm:text-4xl">
          Choose your next step
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavLink
            to="/Courses"
            className="border border-gray-200 rounded-xl p-6 min-h-[180px] hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#333333]">
              Courses
            </h3>
            <p className="text-gray-500 mt-3">
              Explore individual courses across web development, backend, and data.
            </p>
          </NavLink>

          <NavLink
            to="/Programs"
            className="border border-gray-200 rounded-xl p-6 min-h-[180px] hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#333333]">
              Programs
            </h3>

            <p className="text-gray-500 mt-3">
              Follow a structured learning plan designed to build practical skills.
            </p>
          </NavLink>

          <NavLink
            to="/Careerpath"
            className="border border-gray-200 rounded-xl p-6 min-h-[180px] hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#333333]">
              Career paths
            </h3>

            <p className="text-gray-500 mt-3">
              Explore the skills and programs connected to your career goals.
            </p>
          </NavLink>
        </div>
      </section>
    </div>
  );
}

export default Opening;
