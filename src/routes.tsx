import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const { default: App } = await import("./App");
      return { Component: App };
    },
  },
  {
    path: "/About",
    lazy: async () => {
      const { default: About } = await import("./pages/About");
      return { Component: About };
    },
  },
  {
    path: "/Contact",
    lazy: async () => {
      const { default: Contact } = await import("./pages/Contact");
      return { Component: Contact };
    },
  },
  {
    path: "/Login",
    lazy: async () => {
      const { default: Login } = await import("./pages/Login");
      return { Component: Login };
    },
  },
  {
    path: "/Signup",
    lazy: async () => {
      const { default: Signup } = await import("./pages/Signup");
      return { Component: Signup };
    },
  },
  {
    path: "/forgot",
    lazy: async () => {
      const { default: Forgorpassword } = await import("./pages/Forgorpassword");
      return { Component: Forgorpassword };
    },
  },
  {
    path: "/Courses",
    lazy: async () => {
      const { default: Courses } = await import("./pages/Courses");
      return { Component: Courses };
    },
  },
  {
    path: "/Courses/:courseId",
    lazy: async () => {
      const { default: CourseDetail } = await import("./pages/CourseDetail");
      return { Component: CourseDetail };
    },
  },
  {
    path: "/Apply/:courseId",
    lazy: async () => {
      const { default: Application } = await import("./pages/Application");
      return { Component: Application };
    },
  },
  {
    path: "/Dashboard",
    lazy: async () => {
      const { default: Dashboard } = await import("./pages/Dashboard");
      return { Component: Dashboard };
    },
  },
  {
    path: "/notifications",
    lazy: async () => {
      const { default: Notifications } = await import("./pages/Notifications");
      return { Component: Notifications };
    },
  },
  {
    path: "/LearnerLMS",
    lazy: async () => {
      const { default: LearnerLMS } = await import("./pages/LearnerLMS");
      return { Component: LearnerLMS };
    },
  },
  {
    path: "/InstructorDashboard",
    lazy: async () => {
      const { default: InstructorDashboard } = await import("./pages/InstructorDashboard");
      return { Component: InstructorDashboard };
    },
  },
  {
    path: "/AdminDashboard",
    lazy: async () => {
      const { default: AdminDashboard } = await import("./pages/AdminDashboard");
      return { Component: AdminDashboard };
    },
  },
  {
    path: "/Programs",
    lazy: async () => {
      const { default: Programs } = await import("./pages/Programs");
      return { Component: Programs };
    },
  },
  {
    path: "/Programs/:programId",
    lazy: async () => {
      const { default: Programs } = await import("./pages/Programs");
      return { Component: Programs };
    },
  },
  {
    path: "/Careerpath",
    lazy: async () => {
      const { default: Careerpath } = await import("./pages/Careerpath");
      return { Component: Careerpath };
    },
  },
  {
    path: "/Careerpath/:careerPathId",
    lazy: async () => {
      const { default: Careerpath } = await import("./pages/Careerpath");
      return { Component: Careerpath };
    },
  },
]);

export default router;
