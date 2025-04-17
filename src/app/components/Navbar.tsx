"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { User as UserIcon } from "lucide-react"
import {
	auth,
	onAuthStateChanged,
	User,
	signOut,
	db,
} from "../lib/firebase"
import { useRouter } from "next/navigation"
import {
	doc,
	getDoc,
	updateDoc,
} from "firebase/firestore"
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
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setUser(currentUser)
			if (currentUser) {
				try {
					const userDoc = await getDoc(doc(db, "users", currentUser.uid))
					if (userDoc.exists()) {
						const userData = userDoc.data()
						setUserName(userData.name || currentUser.email || "User")
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
		})
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

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file || !user) return

		const storage = getStorage()
		const storageRef = ref(storage, `user-files/${user.uid}/${file.name}`)

		try {
			await uploadBytes(storageRef, file)
			const downloadURL = await getDownloadURL(storageRef)

			const userDocRef = doc(db, "users", user.uid)
			await updateDoc(userDocRef, {
				fileUrl: downloadURL,
			})

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
		<nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-transparent shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-b-2xl backdrop-blur-md">
			{/* Left - Logo + Links */}
			<div className="flex items-center space-x-8">
				<Link href="/" className="text-3xl font-bold text-blue-700 cursor-pointer">
					Mission<span className="text-blue-400">●</span>Job
				</Link>

				<div className="flex space-x-6 font-medium text-black">
					<Link href="/" className="hover:text-blue-600 transition cursor-pointer">
						Home
					</Link>
					<Link href="/gallery" className="hover:text-blue-600 transition cursor-pointer">
						Gallery
					</Link>
					<div className="relative" ref={dropdownRef}>
						<Link href="/findjobs">
							<button
								onClick={() => setIsDropdownOpen((prev) => !prev)}
								className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition"
							>
								Find Jobs
							</button>
						</Link>
					</div>
					<Link href="/information" className="hover:text-blue-600 transition cursor-pointer">
						Information
					</Link>
					<Link href="/news" className="hover:text-blue-600 transition cursor-pointer">
						News
					</Link>
				</div>
			</div>

			{/* Right - Auth Buttons */}
			<div className="flex items-center space-x-3 font-medium">
				{user ? (
					<div className="flex items-center space-x-3">
						{/* Upload Resume */}
						<>
							<input
								type="file"
								accept=".pdf,.doc,.docx"
								ref={fileInputRef}
								style={{ display: "none" }}
								onChange={handleFileChange}
							/>
							<button
								onClick={handleUploadClick}
								className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition text-sm"
							>
								📄 Upload Resume
							</button>
						</>

						{/* Logout */}
						<button
							onClick={handleLogout}
							className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition text-sm"
						>
							🚪 Logout
						</button>

						{/* Username */}
						<span className="text-black flex items-center gap-1 text-sm">
							<UserIcon size={16} />
							{userName}
						</span>
					</div>
				) : (
					<>
						<Link
							href="/login"
							className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition text-sm"
						>
							👤 Login
						</Link>
						<Link
							href="/signup"
							className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md border border-blue-300 hover:bg-blue-200 transition text-sm"
						>
							🔗 Register
						</Link>
					</>
				)}
			</div>
		</nav>
	)
}
