
import { NavLink } from "react-router-dom";

function NavBar() {
  const isloggedin = false;

  return (
    <nav className="w-full px-8 py-4 flex items-center">
      
     
      <div className="flex-shrink-0">
        <NavLink to="/">
          <img
            src="https://andalusia-academy.com/images/logo/aha-colored-logo.svg"
            alt="Logo"
            className="w-32 h-auto"
          />
        </NavLink>
      </div>

    
      <div className="ml-auto flex items-center gap-x-8">

        <NavLink
          to="/"
          className="text-lg hover:text-[#A16F5E] transition-colors"
        >
          Home
        </NavLink>

        <NavLink
          to="/About"
          className="text-lg hover:text-[#A16F5E] transition-colors"
        >
          About
        </NavLink>

        <NavLink
          to="/contact"
          className="text-lg hover:text-[#A16F5E] transition-colors"
        >
          Contact us
        </NavLink>

        <NavLink
          to="/signup"
          className="border-2 border-[#A16F5E] text-[#A16F5E] hover:bg-[#A16F5E] hover:text-white font-bold px-5 py-2 rounded-md transition-colors"
        >
          Sign up
        </NavLink>

        {!isloggedin && (
          <NavLink
            to="/login"
            className="bg-[#A16F5E] text-white hover:opacity-90 font-bold px-5 py-2 rounded-md transition-opacity"
          >
            Login
          </NavLink>
        )}

      </div>
    </nav>
  );
}

export default NavBar;

