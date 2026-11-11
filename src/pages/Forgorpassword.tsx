import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { authApi } from "../services/authApi";
import type { forgortype } from "../types/forgortype";

type NewPasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

function Forgorpassword() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resetEmail = searchParams.get("email")?.trim() ?? "";
  const loginEmail = (location.state as { email?: unknown } | null)?.email;
  const email =
    resetEmail ||
    (typeof loginEmail === "string" ? loginEmail.trim() : "");
  const token = searchParams.get("token")?.trim() ?? "";
  const hasResetToken = searchParams.has("token");
  const hasValidResetLink = Boolean(resetEmail && token);
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<forgortype>({
    criteriaMode: "all",
    defaultValues: { email },
  });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    control: passwordControl,
    formState: { errors: passwordErrors },
  } = useForm<NewPasswordForm>({ criteriaMode: "all" });
  const newPassword = useWatch({
    control: passwordControl,
    name: "newPassword",
  });

  async function requestReset(data: forgortype) {
    setIsSending(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const result = await authApi.requestPasswordReset(data.email.trim());
      setSuccessMessage(result.message);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The password reset request could not be sent.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function resetPassword(data: NewPasswordForm) {
    setIsResetting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const result = await authApi.resetPassword({
        email,
        token,
        newPassword: data.newPassword,
      });
      setSuccessMessage(result.message);
      setResetComplete(true);
      navigate("/forgot", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your password could not be reset.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full h-48 sm:h-64 md:h-screen md:w-1/2">
        <img
          className="h-full w-full object-cover"
          src="/landscape2.jpg"
          alt="A learner studying"
        />
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 md:w-1/2 md:px-10 lg:px-16">
        <section className="flex w-full max-w-xl flex-col gap-5">
          <NavLink className="text-sm hover:text-red-500" to="/Login">
            Go back to login
          </NavLink>

          {resetComplete ? (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Password reset complete
              </h1>
              <p role="status" className="rounded-md bg-green-50 p-4 text-sm text-green-800">
                {successMessage}
              </p>
              <Link
                className="inline-flex justify-center rounded-md bg-[#A16F5E] px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-[#8d5e4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A16F5E]"
                to="/Login"
              >
                Sign in with your new password
              </Link>
            </div>
          ) : hasResetToken && !hasValidResetLink ? (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Invalid reset link
              </h1>
              <p role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                This password reset link is incomplete. Request a new one to continue.
              </p>
              <Link className="font-semibold text-[#8d5e4f] underline" to="/forgot">
                Request a new reset link
              </Link>
            </div>
          ) : hasValidResetLink ? (
            <form
              className="flex flex-col gap-5"
              onSubmit={handlePasswordSubmit(resetPassword)}
              noValidate
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Choose a new password
                </h1>
                <p className="text-base text-gray-600">
                  Resetting the password for {email}.
                </p>
              </div>

              {errorMessage && (
                <p role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-800" htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordErrors.newPassword)}
                  className="w-full rounded-md border-2 border-gray-300 px-4 py-3 outline-none focus:border-[#A16F5E] focus:ring-2 focus:ring-[#A16F5E]/20"
                  {...registerPassword("newPassword", {
                    required: "A new password is required.",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long.",
                    },
                    maxLength: {
                      value: 128,
                      message: "Password must be no more than 128 characters long.",
                    },
                  })}
                />
                {passwordErrors.newPassword && (
                  <p role="alert" className="text-sm text-red-600">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-800" htmlFor="confirm-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordErrors.confirmPassword)}
                  className="w-full rounded-md border-2 border-gray-300 px-4 py-3 outline-none focus:border-[#A16F5E] focus:ring-2 focus:ring-[#A16F5E]/20"
                  {...registerPassword("confirmPassword", {
                    required: "Please confirm your new password.",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match.",
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <p role="alert" className="text-sm text-red-600">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                className="w-full rounded-md bg-[#A16F5E] px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-[#8d5e4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A16F5E] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isResetting}
              >
                {isResetting ? "Resetting password…" : "Reset password"}
              </button>
            </form>
          ) : (
            <form
              className="flex flex-col gap-5"
              onSubmit={handleEmailSubmit(requestReset)}
              noValidate
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Password Recovery
                </h1>
                <p className="text-base text-gray-600">
                  Enter the email address associated with your account.
                </p>
              </div>

              {errorMessage && (
                <p role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p role="status" className="rounded-md bg-green-50 p-4 text-sm text-green-800">
                  {successMessage}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-800" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(emailErrors.email)}
                  className={
                    emailErrors.email
                      ? "w-full rounded-md border-2 border-red-500 px-4 py-3 text-red-600 outline-none focus:ring-2 focus:ring-red-200"
                      : "w-full rounded-md border-2 border-gray-300 px-4 py-3 outline-none focus:border-[#A16F5E] focus:ring-2 focus:ring-[#A16F5E]/20"
                  }
                  placeholder="example@email.com"
                  {...registerEmail("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
                {emailErrors.email && (
                  <p className="text-sm text-red-600" role="alert">
                    {emailErrors.email.message}
                  </p>
                )}
              </div>

              <button
                className="w-full rounded-md bg-[#A16F5E] px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-[#8d5e4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A16F5E] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSending}
              >
                {isSending ? "Sending…" : "Recover Password"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default Forgorpassword;
