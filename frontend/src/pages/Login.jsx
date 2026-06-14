
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login Successful!");
        navigate("/");
      } else {
        alert(data.detail || data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white w-[420px] p-8 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold text-center">
          GoServe
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Login to continue
        </p>

        <form onSubmit={handleLogin}>

          <div className="mb-4">
            <label className="font-semibold">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-2 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label className="font-semibold">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-2 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end mb-5">
            <Link
              to="/forgot-password"
              className="text-sm text-violet-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-700 text-white p-3 rounded-xl font-bold hover:bg-violet-800 transition"
          >
            Login
          </button>

        </form>

        <div className="mt-6 text-center text-gray-600">
          New User?{" "}
          <Link
            to="/register"
            className="text-violet-700 font-semibold hover:underline"
          >
            Register
          </Link>
        </div>

      </div>

    </div>
  );
}