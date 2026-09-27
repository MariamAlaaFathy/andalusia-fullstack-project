import { useState} from 'react'
import NavBar from './Components/NavBar'
import type { User } from './types/User';
import { userContext } from './types/UserContextType';

import { Outlet} from 'react-router-dom';
function App() {
  // const [user,setUser] = useState({name:"Ali",age: 22,job:"developer"});
  const [user,setUser] = useState<User>({
    username:"Ali",
    email:"Ali@gmail.com",
    password:12356
  })
 
   

  return (
    <>
      <userContext.Provider value={{user,setUser}}>
        <NavBar/>
        <Outlet/>
      </userContext.Provider>
   

      
    </>
  )
}

export default App
