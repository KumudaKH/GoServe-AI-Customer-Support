
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Password reset link will be sent.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white w-[420px] p-8 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold text-center">
          Forgot Password
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Enter your registered email
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter Email"
            className="w-full p-3 border rounded-xl mb-5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className="w-full bg-violet-700 text-white p-3 rounded-xl font-bold"
            type="submit"
          >
            Send Reset Link
          </button>

        </form>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="text-violet-700 font-semibold"
          >
            Back to Login
          </Link>
        </div>

      </div>

    </div>
  );
}
