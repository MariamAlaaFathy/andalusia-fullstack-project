import { NavLink, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleScrollToBusiness = () => {
    const element = document.getElementById("for-business");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("for-business")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <footer className="bg-[#F8F5F2] border-t border-[#EAE3DE] pt-14 pb-10 text-[#555555]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
        <div>
          <img
            src="https://andalusia-academy.com/images/logo/aha-colored-logo.svg"
            alt="Andalusia Academy"
            className="h-14 w-auto"
          />
        </div>

        <div>
          <h4 className="font-bold text-[#333333] text-lg mb-4">Learn</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <NavLink
                to="/Courses"
                className="transition-colors hover:text-[#A16F5E]"
              >
                Courses
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Programs"
                className="transition-colors hover:text-[#A16F5E]"
              >
                Programs
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Careerpath"
                className="transition-colors hover:text-[#A16F5E]"
              >
                Career Paths
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-[#333333] text-lg mb-4">Company</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <button
                type="button"
                onClick={handleScrollToBusiness}
                className="text-left transition-colors hover:text-[#A16F5E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A16F5E]"
              >
                For Business
              </button>
            </li>
            <li>
              <NavLink
                to="/about"
                className="transition-colors hover:text-[#A16F5E]"
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className="transition-colors hover:text-[#A16F5E]"
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-[#333333] text-lg mb-4">Account</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <NavLink
                to="/login"
                className="transition-colors hover:text-[#A16F5E]"
              >
                Log In
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                className="transition-colors hover:text-[#A16F5E]"
              >
                Sign Up
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="col-span-2 sm:col-span-1 min-w-0">
          <h4 className="font-bold text-[#333333] text-lg mb-4">Contact Us</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg
                className="w-4 h-4 text-[#A16F5E] shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <a
                href="tel:01202317780"
                className="hover:text-[#A16F5E] transition-colors"
              >
                01202317780
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-[#A16F5E] shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <a
                href="mailto:andalusiaacadem@andalusia.com"
                className="break-words hover:text-[#A16F5E] transition-colors"
              >
                andalusiaacadem@andalusia.com
              </a>
            </div>

            <div className="flex items-start gap-2.5 leading-relaxed min-w-0">
              <svg
                className="w-4 h-4 text-[#A16F5E] shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <a
                href="https://maps.google.com/?q=39+Khaleel+El-Khayat+Basha,+Abu+an+Nawatir,+Sidi+Gaber,+Alexandria+Governorate"
                target="_blank"
                rel="noopener noreferrer"
                className="break-words hover:text-[#A16F5E] transition-colors"
              >
                39 Khaleel El-Khayat Basha, Abu an Nawatir, Sidi Gaber,
                Alexandria Governorate
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto mt-12 pt-6 border-t border-[#EAE3DE] text-xs text-[#888888] px-4 sm:px-6 lg:px-0 text-center md:text-left">
        © 2026 Andalusia Academy. All rights reserved.
      </div>
    </footer>
  );
}
