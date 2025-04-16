"use client"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { FaBriefcase, FaChevronDown } from "react-icons/fa"
import { User as UserIcon } from "lucide-react"
import {
	auth,
	onAuthStateChanged,
	User,
	signOut,
} from "../lib/firebase"
import { useRouter } from "next/navigation"
import { db } from "../lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function Navbar() {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [user, setUser] = useState<User | null>(null)
	const [userName, setUserName] = useState<string | null>(null)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const router = useRouter()

	// Check auth state and fetch user name from Firestore
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			async (currentUser: User | null) => {
				console.log(
					"NavBar auth state:",
					currentUser ? "Signed in" : "Not signed in"
				)
				setUser(currentUser)
				if (currentUser) {
					// Fetch user name from Firestore
					try {
						const userDoc = await getDoc(
							doc(db, "users", currentUser.uid)
						)
						if (userDoc.exists()) {
							const userData = userDoc.data()
							setUserName(
								userData.name || currentUser.email || "User"
							)
						} else {
							setUserName(currentUser.email || "User")
						}
					} catch (error) {
						console.error("Error fetching user name:", error)
						setUserName(currentUser.email || "User")
					}
				} else {
					setUserName(null)
				}
			}
		)
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
		return () =>
			document.removeEventListener("mousedown", handleClickOutside)
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
						</button>
					</Link>
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
					<div className="flex items-center space-x-4">
						<button
							onClick={handleLogout}
							className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
						>
							<span className="mr-1">🚪</span>Logout
						</button>
						<span className="text-black flex items-center gap-1">
							<UserIcon size={16} />
							{userName}
						</span>
					</div>
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
