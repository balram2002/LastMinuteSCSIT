"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, User, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Get user initials for avatar (if user exists and has a name)
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : ""

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest(".profile-dropdown")) {
      setIsDropdownOpen(false)
    }
  }

  // Add event listener for clicking outside
  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-gray-900 bg-opacity-20 backdrop-filter backdrop-blur-2xl border-b border-gray-700/30 fixed top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BookOpen className="w-8 h-8 text-green-400" />
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text tracking-tight">
              lastMinuteSCSIT
            </span>
            <span className="text-xs text-gray-200 -mt-1">Previous Year Question Papers</span>
          </div>
        </div>
        <nav className="flex items-center space-x-6">
          <a
            href="/"
            className="relative text-gray-200 text-lg font-semibold hover:text-green-400 transition-colors duration-300 group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="/scsit/courses"
            className="relative text-gray-200 text-lg font-semibold hover:text-green-400 transition-colors duration-300 group"
          >
            Courses
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="/upload"
            className="relative text-gray-200 text-lg font-semibold hover:text-green-400 transition-colors duration-300 group"
          >
            Upload
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          {user ? (
            <div className="relative profile-dropdown">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDropdown}
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              >
                {initials || <User className="w-6 h-6" />}
              </motion.button>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 mt-2 w-64 bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-lg shadow-lg border border-gray-700 z-10 p-4"
                >
                  <div className="flex flex-col items-center space-y-2 border-b border-gray-700 pb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {initials || <User className="w-8 h-8" />}
                    </div>
                    <span className="text-white font-semibold">{user.name || "User"}</span>
                    <span className="text-gray-300 text-sm">{user.email || "No email provided"}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setIsDropdownOpen(false)
                      navigate("/")
                    }}
                    className="w-full px-4 py-2 mt-2 text-left text-gray-200 hover:text-green-400 hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Login
            </motion.button>
          )}
        </nav>
      </div>
    </motion.header>
  )
}

export default Header