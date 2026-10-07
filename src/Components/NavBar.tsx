import { NavLink } from "react-router-dom";

function NavBar() {
  const isloggedin = false;

  return (
    <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between gap-4">
      <div className="flex-shrink-0">
        <NavLink to="/">
          <img
            src="https://andalusia-academy.com/images/logo/aha-colored-logo.svg"
            alt="Logo"
            className="w-32 h-auto"
          />
        </NavLink>
      </div>

      <div className="w-full sm:w-auto flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2 sm:gap-x-6">
        <NavLink
          to="/"
          className="text-sm sm:text-base lg:text-lg hover:text-[#A16F5E] transition-colors"
        >
          Home
        </NavLink>

        <NavLink
          to="/About"
          className="text-sm sm:text-base lg:text-lg hover:text-[#A16F5E] transition-colors"
        >
          About
        </NavLink>


        <NavLink to="/Courses" className="text-lg hover:text-[#A16F5E] transition-colors" >Courses</NavLink>

        <NavLink to="/Programs" className="text-lg hover:text-[#A16F5E] transition-colors">Programs</NavLink>

        <NavLink to="/Careerpath" className="text-lg hover:text-[#A16F5E] transition-colors">Career Paths</NavLink>

        <NavLink
          to="/contact"
          className="text-sm sm:text-base lg:text-lg hover:text-[#A16F5E] transition-colors"
        >
          Contact us
        </NavLink>

        <NavLink
          to="/signup"
          className="border-2 border-[#A16F5E] text-[#A16F5E] hover:bg-[#A16F5E] hover:text-white font-bold px-4 sm:px-5 py-2 rounded-md transition-colors text-sm sm:text-base"
        >
          Sign up
        </NavLink>

        {!isloggedin && (
          <NavLink
            to="/login"
            className="bg-[#A16F5E] text-white hover:opacity-90 font-bold px-4 sm:px-5 py-2 rounded-md transition-opacity text-sm sm:text-base"
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
