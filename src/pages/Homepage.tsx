import { useContext } from "react";
import { userContext } from "../types/UserContextType";


function Homepage(){
    const context = useContext(userContext);
    if(!context){
        return null;
    }
    const {user,setUser}= context;
return(
    <div>
        <p>Hi {user.username}</p>
        <p>this is the homepage</p>
    </div>
)

}

export default Homepage;