import { NavLink } from "react-router-dom";

function NavBar() {
  const isloggedin = false;

  return (
    <div>
      <nav className="flex gap-x-5 w-full px-8 py-4 text-[30px]">
        <div>
          <NavLink to="/">Logo</NavLink>
        </div>

        <div className="flex justify-end w-full gap-x-10 items-center">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/About">About</NavLink>
          <NavLink to="/contact"> Contact us</NavLink>
          <NavLink
            className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600"
            to="/signup"
          >
            Sign up
          </NavLink>
          {!isloggedin && (
            <NavLink
              className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600"
              to="/login"
            >
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
