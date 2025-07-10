// src/pages/auth/Signin.js
import React, { useState } from "react";
import { loginUser } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        setError("Please enter both username and password");
        setIsLoading(false);
        return;
      }

      const response = await loginUser({ username, password });

      if (!response.data?.token) {
        setError("Authentication failed. No token received.");
        setIsLoading(false);
        return;
      }

      // Call login with the response data
      login(response.data);
      
      // Show welcome message with name (falls back to username if name not available)
      const displayName = response.data.name || response.data.username || 'User';
      toast.success(`Welcome back, ${displayName}!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect based on permissions
      const { roles = [], permissions = [] } = response.data;
      
      if (permissions.includes('dashboard_view')) {
        navigate("/dashboard");
      } else if (permissions.includes('inventory_view')) {
        navigate("/inventory");
      } else if (permissions.includes('pos_access')) {
        navigate("/pos");
      } else if (roles.includes('ADMIN') || roles.includes('MANAGER')) {
        navigate("/dashboard");
      } else if (roles.includes('CASHIER')) {
        navigate("/pos");
      } else if (roles.includes('RECEIVING_CLERK')) {
        navigate("/inventory");
      } else {
        navigate("/profile");
      }

    } catch (err) {
      setIsLoading(false);
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("Login failed. Please try again later.");
      }
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Image Section - Now responsive */}
      <div className="w-full md:w-1/2 h-48 md:h-auto bg-gray-800 order-first md:order-none">
        <img
          src="./basket.jpg"
          alt="Login illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Peak Uniforms MIS</h2>
            <p className="text-gray-600 mb-8">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? "bg-blue-400" : "bg-blue-600"} text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;