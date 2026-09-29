import { useContext } from "react";
import { userContext } from "../types/UserContextType";
import NavBar from "../Components/NavBar";

function Homepage(){
    const context = useContext(userContext);
    if(!context){
        return null;
    }
    const {user}= context; //user = user
return(
    <div>
        <NavBar/>
        <p>Hi {user.username}</p>
        <p>this is the homepage</p>
    </div>
)
}

export default Homepage;