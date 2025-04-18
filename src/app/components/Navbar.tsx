"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { User as UserIcon, LogOut } from "lucide-react"
import {
	auth,
	onAuthStateChanged,
	User,
	signOut,
	db,
} from "../lib/firebase"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage"

export default function Navbar() {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [user, setUser] = useState<User | null>(null)
	const [userName, setUserName] = useState<string | null>(null)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const router = useRouter()

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			async (currentUser) => {
				setUser(currentUser)
				if (currentUser) {
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

	const handleLogout = async () => {
		try {
			await signOut(auth)
			router.push("/")
		} catch (error) {
			console.error("Logout error:", error)
		}
	}

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (!file || !user) return

		const storage = getStorage()
		const storageRef = ref(
			storage,
			`user-files/${user.uid}/${file.name}`
		)

		try {
			await uploadBytes(storageRef, file)
			const downloadURL = await getDownloadURL(storageRef)

			const userDocRef = doc(db, "users", user.uid)
			await updateDoc(userDocRef, { fileUrl: downloadURL })

			alert("Resume uploaded successfully!")
		} catch (error) {
			console.error("Error uploading file:", error)
			alert("Failed to upload resume. Please try again.")
		}
	}

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 shadow-md backdrop-blur-md px-4 md:px-8 py-3">
			<div className="flex flex-wrap justify-between items-center gap-y-2">
				{/* Left - Logo & Nav Links */}
				<div className="flex items-center space-x-6">
					<Link
						href="/"
						className="text-2xl md:text-3xl font-bold text-blue-700"
					>
						Mission<span className="text-blue-400">●</span>Job
					</Link>

					<div className="hidden md:flex space-x-5 font-medium text-sm text-black">
						<Link href="/" className="hover:text-blue-600 transition">
							Home
						</Link>
						<Link
							href="/gallery"
							className="hover:text-blue-600 transition"
						>
							Gallery
						</Link>
						<Link
							href="/findjobs"
							className="hover:text-blue-600 transition"
						>
							Find Jobs
						</Link>
						<Link
							href="/information"
							className="hover:text-blue-600 transition"
						>
							Information
						</Link>
						<Link
							href="/news"
							className="hover:text-blue-600 transition"
						>
							News
						</Link>
					</div>
				</div>

				{/* Right - Auth Options */}
				<div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm font-medium">
					{user ? (
						<>
							<input
								type="file"
								accept=".pdf,.doc,.docx"
								ref={fileInputRef}
								className="hidden"
								onChange={handleFileChange}
							/>
							<button
								onClick={handleUploadClick}
								className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition"
							>
								📄 Upload Resume
							</button>

							<button
								onClick={handleLogout}
								className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition flex items-center"
							>
								<LogOut size={16} className="mr-2" />
								Logout
							</button>

							<span className="flex items-center gap-1 text-black">
								<UserIcon size={16} />
								{userName}
							</span>
							<div className="ml-30"></div>
						</>
					) : (
						<>
							<Link
								href="/login"
								className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition"
							>
								👤 Login
							</Link>
							<Link
								href="/signup"
								className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition"
							>
								🔗 Register
							</Link>
							<div className="ml-30"></div>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}
