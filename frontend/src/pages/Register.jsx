
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  
const handleRegister = async (e) => {
  e.preventDefault();

  if (form.password !== form.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Registration Successful! Redirecting to Login...");
setTimeout(() => {
  navigate("/login");
}, 1000);
    } else {
      alert(data.detail || data.message || "Registration Failed");
    }
  } catch (error) {
    console.error(error);
    alert("Cannot connect to backend");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white w-[450px] p-8 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Join GoServe
        </p>

        <form onSubmit={handleRegister}>

          <input
            name="name"
            placeholder="Full Name"
            className="w-full p-3 mb-4 border rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Mobile Number"
            className="w-full p-3 mb-4 border rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 mb-6 border rounded-xl"
            onChange={handleChange}
            required
          />

          <button
            className="w-full bg-violet-700 text-white p-3 rounded-xl font-bold hover:bg-violet-800"
            type="submit"
          >
            Register
          </button>

        </form>

        <div className="text-center mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-700 font-semibold"
          >
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}
