"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prevData) => ({ ...prevData, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsError(false)
    setIsLoading(true)

    try {
      // Call Strapi registration endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      )

      // Handle successful registration
      // console.log("Registration successful:", response.data)
      router.push("/login")
    } catch (error) {
      setIsError(true)
      // Handle different error scenarios
      if (error.response) {
        const strapiError = error.response.data.error
        setErrorMessage(strapiError.message || "Registration failed. Please try again.")
      } else if (error.request) {
        // No response received
        setErrorMessage("Network error. Please check your connection.")
      } else {
        // Other errors
        setErrorMessage("An unexpected error occurred.")
      }
      toast.error("Registration failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }


  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-full bg-gray-800 text-gray-100 border-gray-700 max-w-[350px] md:max-w-md z-20 mb-20 sm:mb-0">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-3 text-violet-500">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
            </span>
            Register
          </CardTitle>
          <CardDescription className="text-gray-400">Create a new account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isError && <div className="text-red-500 text-sm mb-4">{errorMessage}</div>}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                required
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500 pr-10"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 "
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 bg-transparent" /> : <Eye className="h-4 w-4 bg-transparent" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-violet-500 hover:bg-[#6A2FD9] text-white" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>

            <p className="text-sm text-center text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-violet-500 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

