"use client";

import { Suspense, useEffect, useState } from "react";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { loginToGetAuthToken } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_PATH, ADMIN_SECRET_KEY } from "@/utils/env";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const secretKey = searchParams.get("sk");
    if (secretKey !== ADMIN_SECRET_KEY) {
      router.replace("/");
      return;
    }
    setIsAuthorized(true);
  }, [router, searchParams]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = await loginToGetAuthToken(formData.username, formData.password);

      if (data && (data.access || data.token)) {
        toast.success("Login successful!");
        login(data);
      }

      router.push(`${ADMIN_PATH}/courses`);
    } catch (error) {
      toast.error(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Learnesia Admin</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    className={`w-5 h-5 transition-colors ${errors.username ? "text-rose-400" : "text-slate-400 group-focus-within:text-black"}`}
                  />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border transition-all rounded-xl focus:ring-4 focus:ring-black/10 focus:bg-white outline-none ${
                    errors.username
                      ? "border-rose-200 focus:border-rose-500"
                      : "border-slate-200 focus:border-black"
                  }`}
                  placeholder="admin_user"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-xs font-medium text-rose-500 ml-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 mb-2 ml-1 block">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className={`w-5 h-5 transition-colors ${errors.password ? "text-rose-400" : "text-slate-400 group-focus-within:text-black"}`}
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-12 py-3.5 bg-slate-50 border transition-all rounded-xl focus:ring-4 focus:ring-black/10 focus:bg-white outline-none ${
                    errors.password
                      ? "border-rose-200 focus:border-rose-500"
                      : "border-slate-200 focus:border-black"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs font-medium text-rose-500 ml-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-white hover:text-black transition-all focus:outline-none focus:ring-4 focus:ring-black/30 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_12px_rgb(79,70,229,0.2)]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Sign In to Admin</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
