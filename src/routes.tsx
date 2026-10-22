import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgorpassword from "./pages/Forgorpassword";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Programs from "./pages/Programs";
import Careerpath from "./pages/Careerpath";
import Application from "./pages/Application";
import Dashboard from "./pages/Dashboard";
import LearnerLMS from "./pages/LearnerLMS";
import InstructorDashboard from "./pages/InstructorDashboard";

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
    path:"/forgot",
    element:<Forgorpassword/>
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
    path: "/Apply/:courseId",
    element: <Application />,
  },
  {
    path: "/Dashboard",
    element: <Dashboard />,
  },
  {
    path: "/LearnerLMS",
    element: <LearnerLMS />,
  },
  {
    path: "/InstructorDashboard",
    element: <InstructorDashboard />,
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
