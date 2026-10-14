import { useContext } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { userContext, type Credentials } from "../types/UserContextType";

function Login() {
  const context = useContext(userContext);
  const navigate = useNavigate();
  const location = useLocation();
  const requestedDestination = (
    location.state as { from?: unknown } | null
  )?.from;
  const destination =
    typeof requestedDestination === "string" &&
    requestedDestination.startsWith("/") &&
    !requestedDestination.startsWith("//")
      ? requestedDestination
      : "/";
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ mode: "onChange" });

  const onSubmit: SubmitHandler<Credentials> = async (credentials) => {
    if (!context) return;

    clearErrors("root.server");
    try {
      await context.login(credentials);
      navigate(destination, { replace: true });
    } catch (error) {
      setError("root.server", {
        message:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-64 md:h-screen">
        <img
          className="w-full h-full object-cover"
          src="/landscape2.jpg"
          alt="A learner studying"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center">
        <form
          className="w-full flex flex-col gap-5 px-6 py-10 md:px-12 lg:px-20 text-[30px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <NavLink className="hover:text-red-500" to="/">
            Go back to Homepage
          </NavLink>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={
              errors.email
                ? "w-full border-2 rounded-md border-red-500 text-red-600"
                : "w-full border-2 rounded-md"
            }
            placeholder="example@email.com"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email address.",
              },
            })}
          />
          {errors.email && (
            <p className="text-base text-red-600">{errors.email.message}</p>
          )}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={
              errors.password
                ? "w-full border-2 rounded-md border-red-500 text-red-600"
                : "w-full border-2 rounded-md"
            }
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required.",
            })}
          />
          {errors.password && (
            <p className="text-base text-red-600">{errors.password.message}</p>
          )}

          {errors.root?.server && (
            <p role="alert" className="text-base text-red-600">
              {errors.root.server.message}
            </p>
          )}

          <NavLink className="hover:text-red-500" to="/forgot">
            Forgot password?
          </NavLink>
          <input
            className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-10 py-4 rounded-md text-base transition-colors cursor-pointer shadow-md disabled:opacity-60"
            type="submit"
            value={isSubmitting ? "Logging in..." : "Log in"}
            disabled={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
}

export default Login;
