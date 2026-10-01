import { useState } from "react";
import type { User } from "./types/User";
import { userContext } from "./types/UserContextType";
import Homepage from "./pages/Homepage";

function App() {
  const [user, setUser] = useState<User>({
    username: "Ali",
    email: "Ali@gmail.com",
    password: 12356,
  });

  return (
    <>
      <userContext.Provider value={{ user, setUser }}>
        <Homepage />
      </userContext.Provider>
    </>
  );
}

export default App;
