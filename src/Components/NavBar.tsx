import { useContext, useState } from "react";
import { userContext } from "../types/UserContextType";
import './Navbarcss.css' 
import { NavLink } from "react-router-dom";

function NavBar(){
    const context = useContext(userContext); //give value provided by .provider in app  user and set user in this case 
    const [isloggedin,setIsloggedin] = useState(true);
    if(!context){
        return null;
    }

  
    // const {user,setUser} = context;

    return (
        <div className="box-border">
         
                  <nav className="flex gap-x-5 w-full px-8 py-4 text-[30px]">
                <div >
                    {/* placeholder */}
                  
                     <NavLink to="/Home">Logo</NavLink> 
                   
                    
                </div>

{/* for basic nav bar (in opening page) */}

                <div className= " flex justify-end w-full gap-x-10 items-center">
                    {/* <a href="">Hi {user.username}</a> */}
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/About">About</NavLink>
                    <NavLink to= "/contact"> Contact us</NavLink>
                    <NavLink className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600" to="/signup"> Sign up</NavLink>
                    {
                        !isloggedin && (<NavLink className= "bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600" to="/login">Login</NavLink>)
                    }
                    
                </div>

                
            </nav>
           
        </div>
        
    )

    
          

    

}

export default NavBar;