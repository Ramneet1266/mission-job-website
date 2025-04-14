"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Mail, LogIn } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation" // For Next.js 13+ app directory
import toast from "react-hot-toast" // Import toast
import {
	signInWithEmailAndPassword,
	signInWithPopup,
	UserCredential,
} from "firebase/auth"
import { auth, provider } from "../lib/firebase"

export default function Login() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const router = useRouter() // Initialize router for redirection

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			const userCredential: UserCredential =
				await signInWithEmailAndPassword(auth, email, password)
			console.log("Logged in with:", userCredential.user)
			// Show success toast
			toast.success("Login successful!", {
				duration: 3000, // Toast duration in milliseconds
			})
			// Redirect to homepage after a short delay to show toast
			setTimeout(() => {
				router.push("/")
			}, 2000) // Match the toast duration
		} catch (err: any) {
			setError(err.message || "An error occurred during login")
			console.error("Login error:", err)
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleLogin = async () => {
		setLoading(true)
		setError(null)

		try {
			const userCredential: UserCredential = await signInWithPopup(
				auth,
				provider
			)
			console.log("Logged in with Google:", userCredential.user)
			// Show success toast
			toast.success("Login successful! Redirecting...", {
				duration: 2000, // Toast duration in milliseconds
			})
			// Redirect to homepage after a short delay to show toast
			setTimeout(() => {
				router.push("/")
			}, 2000) // Match the toast duration
		} catch (err: any) {
			setError(err.message || "An error occurred during Google login")
			console.error("Google login error:", err)
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
				<h2 className="text-3xl font-bold text-blue-900 mb-1 flex items-center gap-2">
					<LogIn className="w-6 h-6" /> Welcome Back
				</h2>
				<p className="text-sm text-gray-500 mb-6">
					Login to access our website
				</p>

				{error && (
					<div className="text-red-600 text-sm mb-4">{error}</div>
				)}

				<form onSubmit={handleLogin} className="space-y-5">
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

					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all disabled:bg-blue-400"
						disabled={loading}
					>
						{loading ? "Logging in..." : "Login"}
					</button>

					{/* Google Login */}
					<button
						onClick={handleGoogleLogin}
						className="w-full flex items-center justify-center gap-3 border border-blue-300 py-2 mb-5 rounded-md hover:bg-blue-50 transition disabled:opacity-50"
						disabled={loading}
					>
						<Image
							src="data:image/png;base64,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"
							alt="Google icon"
							width={20}
							height={20}
						/>
						<span className="text-sm text-gray-700 font-medium">
							Continue with Google
						</span>
					</button>
				</form>

				<p className="text-sm text-center mt-6 text-gray-600">
					Don’t have an account?{" "}
					<Link
						href="/signup"
						className={`text-blue-800 hover:underline ${
							loading ? "pointer-events-none text-gray-400" : ""
						}`}
						onClick={loading ? (e) => e.preventDefault() : undefined}
					>
						Sign up
					</Link>
				</p>
			</motion.div>
		</div>
	)
}
