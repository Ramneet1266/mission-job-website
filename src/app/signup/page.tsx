"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
	User,
	Mail,
	Lock,
	Phone,
	UserPlus,
	FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
	createUserWithEmailAndPassword,
	UserCredential,
} from "firebase/auth"
import { auth, db, storage } from "../lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function Signup() {
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [phone, setPhone] = useState("")
	const [file, setFile] = useState<File | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) {
			setFile(selectedFile)
		}
	}

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			const userCredential: UserCredential =
				await createUserWithEmailAndPassword(auth, email, password)
			const user = userCredential.user

			let fileUrl = ""
			if (file) {
				const storageRef = ref(
					storage,
					`user-files/${user.uid}/${file.name}`
				)
				await uploadBytes(storageRef, file)
				fileUrl = await getDownloadURL(storageRef)
			}

			// Store user details and file URL in Firestore
			await setDoc(doc(db, "users", user.uid), {
				name,
				email,
				phone,
				fileUrl: fileUrl || null,
				createdAt: new Date().toISOString(),
			})

			console.log("User registered with:", user.uid)
			toast.success("Registration successful! Redirecting...", {
				duration: 2000,
			})
			setTimeout(() => {
				router.push("/") // Redirect to homepage
			}, 2000)
		} catch (err: any) {
			setError(err.message || "An error occurred during registration")
			console.error("Registration error:", err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10"
			>
				<h2 className="text-3xl font-bold text-blue-700 mb-1 flex items-center gap-2">
					<UserPlus className="w-6 h-6" /> Create Account
				</h2>
				<p className="text-sm text-gray-500 mb-6">
					Sign up to get started
				</p>

				{error && (
					<div className="text-red-600 text-sm mb-4">{error}</div>
				)}

				<form onSubmit={handleSignup} className="space-y-5">
					<div>
						<label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
							<User className="w-4 h-4" /> Name
						</label>
						<input
							type="text"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="John Doe"
							disabled={loading}
						/>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
							<Mail className="w-4 h-4" /> Email
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="example@domain.com"
							disabled={loading}
						/>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
							<Phone className="w-4 h-4" /> Phone Number
						</label>
						<input
							type="tel"
							required
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="1234567890"
							disabled={loading}
						/>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
							<Lock className="w-4 h-4" /> Password
						</label>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="••••••••"
							disabled={loading}
						/>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
							<FileText className="w-4 h-4" /> Upload File
						</label>
						<input
							type="file"
							onChange={handleFileChange}
							className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							disabled={loading}
						/>
					</div>

					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all disabled:bg-blue-400"
						disabled={loading}
					>
						{loading ? "Signing up..." : "Sign Up"}
					</button>
				</form>

				<p className="text-sm text-center mt-6 text-gray-600">
					Already have an account?{" "}
					<Link
						href="/login"
						className={`text-blue-600 hover:underline ${
							loading ? "pointer-events-none text-gray-400" : ""
						}`}
						onClick={loading ? (e) => e.preventDefault() : undefined}
					>
						Log in
					</Link>
				</p>
			</motion.div>
		</div>
	)
}
