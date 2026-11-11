import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { userContext } from "../types/UserContextType";
import { notificationsContext } from "../context/NotificationsContext";

function NavBar() {
  const context = useContext(userContext);
  const notifications = useContext(notificationsContext);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    if (!context) return;
    setLogoutError("");
    try {
      await context.logout();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Could not log out cleanly.",
      );
    }
  }

  return (
    <nav className="mx-auto flex w-full max-w-[1300px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <NavLink to="/" className="shrink-0 self-center sm:self-auto">
        <span className="sr-only">Andalusia Academy home</span>
          <img
            src="https://andalusia-academy.com/images/logo/aha-colored-logo.svg"
            alt=""
            className="h-auto w-32"
          />
      </NavLink>

      <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:w-auto sm:justify-end sm:gap-x-5">
        <NavLink
          to="/"
          className="text-sm transition-colors hover:text-[#A16F5E] sm:text-base"
        >
          Home
        </NavLink>

        <NavLink
          to="/About"
          className="text-sm transition-colors hover:text-[#A16F5E] sm:text-base"
        >
          About
        </NavLink>

        <NavLink
          to="/Courses"
          className="text-sm transition-colors hover:text-[#A16F5E] sm:text-base"
        >
          Courses
        </NavLink>

        <NavLink
          to="/Programs"
          className="text-sm transition-colors hover:text-[#A16F5E] sm:text-base"
        >
          Programs
        </NavLink>

        <NavLink
          to="/Careerpath"
          className="text-sm transition-colors hover:text-[#A16F5E] sm:text-base"
        >
          Career Paths
        </NavLink>

        <NavLink
          to="/contact"
          className="text-sm transition-colors hover:text-[#A16F5E] sm:text-base"
        >
          Contact us
        </NavLink>

        {context?.user ? (
          <>
            {context.user.role === "Admin" ? (
              <NavLink
                to="/AdminDashboard"
                className="text-sm font-semibold text-[#8f5640] transition-colors hover:text-[#A16F5E] sm:text-base"
              >
                Admin
              </NavLink>
            ) : context.user.role === "Instructor" ? (
              <NavLink
                to="/InstructorDashboard"
                className="text-sm font-semibold text-[#8f5640] transition-colors hover:text-[#A16F5E] sm:text-base"
              >
                Teaching
              </NavLink>
            ) : context.user.role === "Content Manager" ? (
              <NavLink
                to="/ContentManager"
                className="text-sm font-semibold text-[#8f5640] transition-colors hover:text-[#A16F5E] sm:text-base"
              >
                Content
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/Dashboard"
                  className="text-sm font-semibold text-[#8f5640] transition-colors hover:text-[#A16F5E] sm:text-base"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/LearnerLMS"
                  className="text-sm font-semibold text-[#8f5640] transition-colors hover:text-[#A16F5E] sm:text-base"
                >
                  My learning
                </NavLink>
              </>
            )}
            {context.user.role === "Admin" && (
              <NavLink
                to="/ContentManager"
                className="text-sm font-semibold text-[#8f5640] transition-colors hover:text-[#A16F5E] sm:text-base"
              >
                Content
              </NavLink>
            )}
            {context.user.role === "Learner" && (
              <NavLink
                to="/notifications"
                aria-label={`Notifications${notifications?.unreadCount ? `, ${notifications.unreadCount} unread` : ""}`}
                title="Notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#765f52] transition-colors hover:bg-[#f1e0d6] hover:text-[#8f5640] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"
                  />
                </svg>
                {!!notifications?.unreadCount && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-[#a55335] px-1 text-center text-xs font-bold leading-5 text-white"
                  >
                    {notifications.unreadCount > 99
                      ? "99+"
                      : notifications.unreadCount}
                  </span>
                )}
              </NavLink>
            )}
            <span className="text-sm sm:text-base">
              Hi, {context.user.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-[#A16F5E] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:px-5 sm:text-base"
            >
              Log out
            </button>
          </>
        ) : context?.isLoading ? (
          <span className="text-sm sm:text-base" role="status">
            Checking session...
          </span>
        ) : (
          <>
            <NavLink
              to="/signup"
              className="border-2 border-[#A16F5E] text-[#A16F5E] hover:bg-[#A16F5E] hover:text-white font-bold px-4 sm:px-5 py-2 rounded-md transition-colors text-sm sm:text-base"
            >
              Sign up
            </NavLink>

            <NavLink
              to="/login"
              className="rounded-md bg-[#A16F5E] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:px-5 sm:text-base"
            >
              Login
            </NavLink>
          </>
        )}
      </div>
      {logoutError && (
        <p role="alert" className="text-center text-sm text-red-600">
          {logoutError}
        </p>
      )}
    </nav>
  );
}

export default NavBar;
