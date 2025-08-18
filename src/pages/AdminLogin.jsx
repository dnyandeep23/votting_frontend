"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import LanguageSelector from "../components/LanguageSelector"
import { api } from "@/lib/api"

export default function AdminLogin() {
  const { t } = useLanguage()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ identifier: "", password: "", rememberMe: false })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { 
    if (isAuthenticated) navigate("/party-management") 
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (localStorage.getItem("rememberAdmin") === "true") {
      setFormData(p => ({ 
        ...p, 
        identifier: localStorage.getItem("adminIdentifier") || "", 
        rememberMe: true 
      }))
    }
  }, [])

  const validate = () => {
    const e = {}
    if (!formData.identifier.trim()) e.identifier = t("identifierRequired") || "Username or email is required"
    if (!formData.password.trim()) e.password = t("passwordRequired") || "Password is required"
    else if (formData.password.length < 6) e.password = t("passwordTooShort") || "Password must be at least 6 characters"
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setIsLoading(true)
    setErrors({})

    try {
      // Call the API with identifier (can be username or email)
      const response = await api.adminSignIn({
        identifier: formData.identifier.trim(),
        password: formData.password
      })

      console.log("API response:", response)
      console.log("API response:", response)

      if (response) {
        console.log("Login successful:", response.data)
        // Handle remember me functionality
        if (formData.rememberMe) {
          localStorage.setItem("rememberAdmin", "true")
          localStorage.setItem("adminIdentifier", formData.identifier)
        } else {
          localStorage.removeItem("rememberAdmin")
          localStorage.removeItem("adminIdentifier")
        }

        // Use the login function from AuthContext
        await login({
          adminId: response.adminId,
          username: response.admin.username,
          email: response.admin.email,
          role: response.admin.role
        })

        navigate("/party-management", { replace: true })
      } else {
        setErrors({ general: response.error || t("loginFailed") || "Login failed" })
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ 
        general: error.message || t("serverError") || "Server error. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const update = ({ target: { name, value, type, checked } }) => {
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }))
    if (errors.general) setErrors(p => ({ ...p, general: "" }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-green-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">⚙️</div>
      </div>

      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <Link to="/" className="text-gray-600 hover:text-gray-800">← {t("backToHome") || "Back"}</Link>
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center text-white">
          <div className="text-4xl mb-2">🇮🇳</div>
          <h1 className="text-2xl font-bold mb-1">{t("adminLoginTitle") || "Admin Login"}</h1>
          <p className="text-orange-100 text-sm">{t("secureAdminAccess") || "Secure Access"}</p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-pulse">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="identifier">
              {t("usernameEmail") || "Username / Email"}
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              disabled={isLoading}
              value={formData.identifier}
              onChange={update}
              placeholder={t("enterUsernameOrEmail") || "Enter username or email"}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                errors.identifier ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.identifier && <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="password">
              {t("password") || "Password"}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isLoading}
                value={formData.password}
                onChange={update}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                  errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              <button 
                type="button" 
                disabled={isLoading} 
                onClick={() => setShowPassword(v => !v)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                name="rememberMe" 
                checked={formData.rememberMe} 
                onChange={update} 
                disabled={isLoading} 
                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-sm">{t("rememberMe") || "Remember me"}</span>
            </label>
            <button 
              type="button" 
              disabled={isLoading} 
              onClick={() => alert(t("contactAdmin") || "Contact admin for password reset")} 
              className="text-sm text-orange-600 hover:text-orange-800"
            >
              {t("forgotPassword") || "Forgot?"}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium focus:ring-4 focus:ring-orange-200 disabled:opacity-50 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 border-b-2 border-white mr-2 rounded-full" />
                {t("loggingIn") || "Logging in…"}
              </span>
            ) : (
              <>🔐 {t("loginButton") || "Login"}</>
            )}
          </button>
        </form>

        <div className="px-6 pb-6">
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-1 animate-ping" />
              {t("secureConnection") || "Secure"}
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-1" />
              {t("encrypted") || "Encrypted"}
            </span>
          </div>
          <div className="mt-4 text-center">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              ✓ {t("eciApproved") || "ECI Approved"}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center border-t">
          <button 
            type="button" 
            onClick={() => alert(t("termsConditionsText") || "Terms and Conditions")} 
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            {t("termsConditions") || "Terms & Conditions"}
          </button>
        </div>
      </div>
    </div>
  )
}
