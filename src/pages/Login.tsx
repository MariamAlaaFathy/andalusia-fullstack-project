import { useForm, type SubmitHandler } from "react-hook-form";

import type { formtype } from "../types/formtype";

import { NavLink } from "react-router-dom";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formtype>({ criteriaMode: "all", mode: "onChange" });

  const onSubmit: SubmitHandler<formtype> = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-screen">
        <img
          className="w-full h-full object-cover"
          src="public/landscape2.jpg"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center">
        <form
          className="w-full max-w-2xl flex flex-col gap-4 sm:gap-5 px-5 sm:px-8 md:px-10 lg:px-16 py-8 sm:py-10 text-base sm:text-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <NavLink className="hover:text-red-500" to="/">
            Go back to Homepage
          </NavLink>

          <label>Username: </label>

          <input
            className={
              errors.username
                ? "border-2 border-red-500 text-red-600"
                : "w-full border-2 rounded-md"
            }
            placeholder="enter username"
            {...register("username", {
              required: "username is required",
              minLength: {
                value: 8,
                message: "username should atleast be 8 characters long",
              },
            })}
          />

          {errors.username &&
            Object.values(errors.username.types ?? {}).map((error, index) => (
              <p className="text-red-600" key={index}>
                {error}
              </p>
            ))}

          {/* must add logic if username doesnt exist since this is login */}

          <label>Email: </label>

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
                message: "email is invalid",
              },
            })}
          />

          {errors.email &&
            Object.values(errors.email.types ?? {}).map((error, index) => (
              <p className="text-red-600" key={index}>
                {error}
              </p>
            ))}

          <label>Password: </label>

          <input
            className={
              errors.password
                ? "border-2 border-red-500 text-red-600"
                : "w-full border-2 rounded-md"
            }
            type="password"
            placeholder="enter password here"
            {...register("password", {
              required: "password is required",
              minLength: {
                value: 8,
                message: "password should be 8 characters long",
              },
            })}
          />

          {errors.password &&
            Object.values(errors.password.types ?? {}).map((error, index) => (
              <p className="text-red-600" key={index}>
                {error}
              </p>
            ))}

          <input
            className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-10 py-4 rounded-md text-base transition-colors cursor-pointer shadow-md"
            type="submit"
            value="Log in"
          />
        </form>
      </div>
    </div>
  );
}

export default Login;
