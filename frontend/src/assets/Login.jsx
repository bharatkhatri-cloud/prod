import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { fetchToLogin } from '../reduxStore/authentication/userAuthSlice';
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const Login = ({ loggedIn, isLoggedIn }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    role: "",
    password: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLoginData = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await dispatch(fetchToLogin({ loginDetails: formData })).unwrap();
      loggedIn(response.dhaDbTkn, response.user.role);
      setLoading(false);
      <Navigate to="/" /> // Redirect on successful login
    } catch (error) {
      console.error("Error in login", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-teal-950 to-emerald-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Container Card */}
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 transition-all duration-300">
        
        {/* Left Side: Brand Panel (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-800 to-teal-950 p-12 text-white flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-start gap-4">
            {/* Elegant Leaf Logo */}
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
              <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 8a7 7 0 0 1-7 10Z" />
                <path d="M9 22v-4" />
                <path d="M11 15c-3-2.5-3.5-5.5-3.5-5.5" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                Dharaksha
              </h2>
              <p className="text-emerald-300 font-medium text-sm tracking-widest uppercase">
                Ecosolutions
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Pioneering Sustainability</h3>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Replacing single-use packaging like thermocol with biodegradable alternatives made from crop stubble.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-900/50 py-1.5 px-3 rounded-full border border-emerald-500/20 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            100% Biodegradable & Sustainable
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          
          {/* Mobile Brand Header */}
          <div className="flex md:hidden flex-col items-center mb-8">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 mb-3">
              <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 8a7 7 0 0 1-7 10Z" />
                <path d="M9 22v-4" />
                <path d="M11 15c-3-2.5-3.5-5.5-3.5-5.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Dharaksha</h1>
            <p className="text-emerald-600 font-semibold text-xs uppercase tracking-wider">Ecosolutions</p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Please sign in to access your portal</p>
          </div>

          <form onSubmit={handleLoginData} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button type="button" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline focus:outline-none">
                No account? Contact admin.
              </button>
            </div>

            {/* Submit Button */}
            {loading ? (
              <div className="w-full flex justify-center bg-gradient-to-r from-emerald-600 to-teal-700 py-3 rounded-xl">
                <Loading />
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                disabled={loading}
              >
                Sign In
              </button>
            )}
          </form>

          {/* Footer Branding Info */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400">
              Welcome to Dharaksha Ecosolutions
            </p>
            <p className="text-xs mt-1">
              <a
                href="https://github.com/ankit76350"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 hover:text-red-700 transition-colors duration-150"
              >
                Developed & Maintained by Ankit Kumar.
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};


export default Login;


