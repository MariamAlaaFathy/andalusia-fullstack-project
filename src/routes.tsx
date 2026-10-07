import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Programs from "./pages/Programs";
import Careerpath from "./pages/Careerpath";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/About",
    element: <About />,
  },
  {
    path: "/Contact",
    element: <Contact />,
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/Signup",
    element: <Signup />,
  },
  {
    path: "/Courses",
    element: <Courses />,
  },
  {
    path: "/Courses/:courseId",
    element: <CourseDetail />,
  },
  {
    path: "/Programs",
    element: <Programs />,
  },
  {
    path: "/Programs/:programId",
    element: <Programs />,
  },
  {
    path: "/Careerpath",
    element: <Careerpath />,
  },
  {
    path: "/Careerpath/:careerPathId",
    element: <Careerpath />,
  }
]);

export default router;
