import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const router = createBrowserRouter([
    {
        path:"/",
        element:<App/>,
    },
    {
       path:"/About",
       element:<About/>
    },
    {
        path:"/Contact",
        element:<Contact/> 

    },
    {
        path:"/Login",
        element: <Login/>

    },
    {
         path:"/Signup",
        element:<Signup/>
    }
        // path:"/",
        // element:<App/>,
        // children:[
        //     {
        //         path:"/",
        //         element:<Homepage/>

        //     },
        //     {
        //         path:"/Contact",
        //         element:<Contact/> 
        //     },
        //     {
        //         path:"/About",
        //         element:<About/>
        //      },
        //      {
        //         path:"/Login",
        //         element: <Login/>

        //      },
        //      {
        //         path:"/Signup",
        //         element:<Signup/>
        //      },
        //      {
        //         path:"/Home",
        //         element:<Homepage/>
        //      }
            

        // ]


        
    
   
   

]

);

export default router;