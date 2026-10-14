import { useContext } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { userContext } from "../types/UserContextType";
import type { formtype } from "../types/formtype";

function Signup() {
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
    register: registerField,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
    control,
  } = useForm<formtype>({ mode: "onChange" });

  const password = useWatch({ control, name: "password" });

  const onSubmit: SubmitHandler<formtype> = async ({
    username,
    email,
    password: submittedPassword,
  }) => {
    if (!context) return;

    clearErrors("root.server");
    try {
      await context.register({
        username,
        email,
        password: submittedPassword,
      });
      navigate(destination, { replace: true });
    } catch (error) {
      setError("root.server", {
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-screen">
        <img
          className="w-full h-full object-cover"
          src="/landscape2.jpg"
          alt="A learner studying"
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

          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className={
              errors.username
                ? "w-full rounded-md border-2 border-red-500 text-red-600"
                : "w-full rounded-md border-2"
            }
            placeholder="Enter a username"
            {...registerField("username", {
              required: "Username is required.",
              minLength: {
                value: 8,
                message: "Username must be at least 8 characters long.",
              },
            })}
          />
          {errors.username && (
            <p className="text-red-600">{errors.username.message}</p>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={
              errors.email
                ? "w-full rounded-md border-2 border-red-500 text-red-600"
                : "w-full rounded-md border-2"
            }
            placeholder="example@email.com"
            {...registerField("email", {
              required: "Email is required.",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email address.",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-600">{errors.email.message}</p>
          )}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={
              errors.password
                ? "w-full rounded-md border-2 border-red-500 text-red-600"
                : "w-full rounded-md border-2"
            }
            placeholder="Enter a password"
            {...registerField("password", {
              required: "Password is required.",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long.",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-600">{errors.password.message}</p>
          )}

          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className={
              errors.confirm
                ? "w-full rounded-md border-2 border-red-500 text-red-600"
                : "w-full rounded-md border-2"
            }
            placeholder="Enter the password again"
            {...registerField("confirm", {
              required: "Please confirm your password.",
              validate: (value) =>
                value === password || "Passwords do not match.",
            })}
          />
          {errors.confirm && (
            <p className="text-red-600">{errors.confirm.message}</p>
          )}

          {errors.root?.server && (
            <p role="alert" className="text-red-600">
              {errors.root.server.message}
            </p>
          )}

          <input
            className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-10 py-4 rounded-md text-base transition-colors cursor-pointer shadow-md disabled:opacity-60"
            type="submit"
            value={isSubmitting ? "Creating account..." : "Sign up"}
            disabled={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
}

export default Signup;
