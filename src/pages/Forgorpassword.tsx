import { useForm } from "react-hook-form";
import type { forgortype } from "../types/forgortype";

function Forgorpassword() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<forgortype>({ criteriaMode: "all" });

    return (
        <>

        <h1>Password Recovery</h1>
        <div>
             <form onSubmit={handleSubmit((data) => console.log(data))}>
                <label>Enter your Email here:</label>

                <input
                    className={
                        errors.email
                            ? "border-2 border-red-500 text-red-600"
                            : "w-full border-2 rounded-md"
                    }
                    placeholder="example@email.com"
                    {...register("email", {
                        required: "email is required",
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "email is invalid"
                        }
                    })}
                />

                {errors.email && (
                    <p className="text-red-600">
                        {errors.email.message}
                    </p>
                )}

                <button type="submit">Recover Password</button>
            </form>
        </div>
           
        </>
    );
}

export default Forgorpassword;