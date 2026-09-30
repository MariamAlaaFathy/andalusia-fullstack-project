import { useContext, useState } from "react";
import { userContext } from "../types/UserContextType";
import './Navbarcss.css' 
import { NavLink } from "react-router-dom";

function NavBar(){
    const context = useContext(userContext); //give value provided by .provider in app  user and set user in this case 
    const [isloggedin,setIsloggedin] = useState(false);
    if(!context){
        return null;
    }

  
    // const {user,setUser} = context;

    return (
        <div className="box-border">
         
                  <nav className="flex gap-x-5 w-full px-8 py-4 text-[30px]">
                <div >
                     <NavLink to="/Home">Logo</NavLink>   
                </div>


                <div className= " flex justify-end w-full gap-x-10 items-center">
                    {/* <a href="">Hi {user.username}</a> */}
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/About">About</NavLink>
                    <NavLink to= "/contact"> Contact us</NavLink>
                    <NavLink className="border-2 border-[#A16F5E] text-[#A16F5E] hover:bg-[#A16F5E] hover:text-white font-bold px-6 py-3 rounded-md transition-colors cursor-pointer text-sm" to="/signup"> Sign up</NavLink>
                    {
                        !isloggedin && (<NavLink className= "border-2 border-[#A16F5E] text-[#A16F5E] hover:bg-[#A16F5E] hover:text-white font-bold px-6 py-3 rounded-md transition-colors cursor-pointer text-sm" to="/login">Login</NavLink>)
                    }
                </div>
            </nav>
        </div>
        
    )
}

export default NavBar;