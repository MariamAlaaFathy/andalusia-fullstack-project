import { useEffect, useState } from "react";
import type { User } from "./types/User";
import { userContext } from "./types/UserContextType";
import Homepage from "./pages/Homepage";

function App() {
  const [user, setUser] = useState<User>(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    return {
      username: "Ali",
      email: "Ali@gmail.com",
      password: 12356,
      ...(accessToken ? { accessToken } : {}),
    };
  });

  useEffect(() => {
    if (user.accessToken) {
      sessionStorage.setItem("accessToken", user.accessToken);
    } else {
      sessionStorage.removeItem("accessToken");
    }
  }, [user.accessToken]);

  return (
    <>
      <userContext.Provider value={{ user, setUser }}>
        <Homepage />
      </userContext.Provider>
    </>
  );
}

export default App;
