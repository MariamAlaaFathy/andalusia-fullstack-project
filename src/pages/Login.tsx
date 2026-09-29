import { useForm, type SubmitHandler } from "react-hook-form";
import type { formtype } from "../types/formtype";
import "./forms.css";
import { NavLink } from "react-router-dom";

function Login(){
    const {register,handleSubmit,formState:{errors}} = useForm<formtype>({criteriaMode:"all", mode:"onChange"});
    const onSubmit: SubmitHandler<formtype>=(data)=>{
        console.log(data);
    }
    return(
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-64 md:h-screen">
              <img className= "w-full h-full object-cover " src="public/landscape2.jpg"/>  
            </div>
            <form className="flex flex-col gap-5 px-40 py-30 text-[30px] md:shrink-0" onSubmit= {handleSubmit(onSubmit)}>
                <NavLink className="hover:text-red-500" to="/">Go back to Homepage</NavLink>
                <label>Username: </label>
                <input className={ errors.username ? "border-2 border-red-500 text-red-600": "w-full border-2 rounded-md"} placeholder="enter username"  {...register("username",{required:"username is required",minLength:{value: 8, message:"username should atleast be 8 characters long"}})} ></input>
                {
                    errors.username && Object.values(errors.username.types ?? {}).map((error,index)=><p className="text-red-600" key={index}>{error}</p>)
                }
                {/* must add logic if username doesnt exist since this is login */}
                <label>Email: </label>
                <input className={errors.email ? "border-2 border-red-500 text-red-600" :"w-full border-2 rounded-md"} placeholder="example@email.com" {...register("email",{required:"email is required", pattern: {value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ , message: "email is invalid"}})}></input> 
                {
                    errors.email && Object.values(errors.email.types ?? {}).map((error,index)=> <p className="text-red-600" key={index}>{error}</p>)
                }
                <label>Password: </label>
                <input className={errors.password ? "border-2 border-red-500 text-red-600": "w-full border-2 rounded-md"} type="password" placeholder="enter password here"  {...register("password",{required:"password is required", minLength: {value:8 , message:"password should be 8 characters long"}})}></input>
                {
                    errors.password && Object.values(errors.password.types ?? {}).map((error, index)=> <p className="text-red-600" key={index}>{error}</p>)
                }

                <input className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600" type="submit" value="Log in"></input>
            </form>
        </div>
    )
}

export default Login;