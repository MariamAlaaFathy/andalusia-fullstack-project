import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import type { forgortype } from "../types/forgortype";

function Forgorpassword() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<forgortype>({ criteriaMode: "all" });

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
                <form
                    className="flex w-full max-w-xl flex-col gap-5"
                    onSubmit={handleSubmit((data) => console.log(data))}
                >
                    <NavLink className="text-sm hover:text-red-500" to="/Login">
                        Go back to login
                    </NavLink>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Password Recovery
                        </h1>
                        <p className="text-base text-gray-600">
                            Enter the email address associated with your account.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-gray-800" htmlFor="email">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            aria-invalid={Boolean(errors.email)}
                            className={
                                errors.email
                                    ? "w-full rounded-md border-2 border-red-500 px-4 py-3 text-red-600 outline-none focus:ring-2 focus:ring-red-200"
                                    : "w-full rounded-md border-2 border-gray-300 px-4 py-3 outline-none focus:border-[#A16F5E] focus:ring-2 focus:ring-[#A16F5E]/20"
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
                            <p className="text-sm text-red-600" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <button
                        className="w-full rounded-md bg-[#A16F5E] px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-[#8d5e4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A16F5E]"
                        type="submit"
                    >
                        Recover Password
                    </button>
                </form>
            </div>
        </main>
    );
}

export default Forgorpassword;