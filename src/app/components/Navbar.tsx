"use client"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { FaBriefcase, FaChevronDown } from "react-icons/fa"
import { auth, onAuthStateChanged, User, signOut } from "../lib/firebase"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      console.log("NavBar auth state:", currentUser ? "Signed in" : "Not signed in")
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      console.log("Logged out successfully")
      router.push("/") // Redirect to home
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-transparent shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-b-2xl backdrop-blur-md">
      {/* Left - Logo */}
      <div className="flex items-center">
        <Link
          href="/"
          className="text-3xl font-bold text-blue-700 cursor-pointer"
        >
          Mission<span className="text-blue-400">●</span>Job
        </Link>
      </div>

      {/* Center - Nav Links */}
      <div className="absolute left-1/2 transform -translate-x-1/2 space-x-6 font-medium text-black flex items-center">
        <Link
          href="/"
          className="hover:text-blue-600 transition cursor-pointer"
        >
          Home
        </Link>
        <Link
          href="/gallery"
          className="hover:text-blue-600 transition cursor-pointer"
        >
          Gallery
        </Link>

        {/* Dropdown - Find Jobs */}
        <div className="relative" ref={dropdownRef}>
          <Link href="/findjobs">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition"
            >
              <span>Find Jobs</span>
              {/* <FaChevronDown
                className={`text-sm transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              /> */}
            </button>
          </Link>
          {/* {isDropdownOpen && (
            <div className="absolute top-full mt-2 bg-white rounded-md shadow-lg py-2 w-80 z-10">
              <Link
                href="/jobs/location"
                className="block px-4 py-2 hover:bg-blue-100 text-black"
              >
                Jobs by Location
              </Link>
              <Link
                href="/jobs/designation"
                className="block px-4 py-2 hover:bg-blue-100 text-black"
              >
                Jobs by Designation
              </Link>
            </div>
          )} */}
        </div>

        <Link
          href="/information"
          className="hover:text-blue-600 transition cursor-pointer"
        >
          Information
        </Link>
        <Link
          href="/news"
          className="hover:text-blue-600 transition cursor-pointer"
        >
          News
        </Link>
      </div>

      {/* Right - Auth Buttons */}
      <div className="flex items-center space-x-4 font-medium">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <span className="mr-1">🚪</span>Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="border border-blue-700 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition"
            >
              <span className="mr-1">👤</span>Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <span className="mr-1">🔗</span>Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}