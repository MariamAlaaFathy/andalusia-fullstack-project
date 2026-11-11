import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider";
import { NotificationsProvider } from "./context/NotificationsProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <RouterProvider router={router} />
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>,
);
