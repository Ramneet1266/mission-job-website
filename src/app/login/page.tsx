"use client"

import { User, Mail, Lock } from "lucide-react"
import { useState, FormEvent } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { auth } from "../lib/firebase"
import {
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
} from "firebase/auth"
import toast from "react-hot-toast"

export default function UserManagementPage() {
	const [email, setEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			if (!email || !password) {
				setError("Email and password are required.")
				return
			}

			await signInWithEmailAndPassword(auth, email, password)
			toast.success("Successfully logged in!")
			setEmail("")
			setPassword("")
			router.push("/")
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err)
			setError(message)
			toast.error(`Failed to login: ${message}`)
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleLogin = async () => {
		setLoading(true)
		setError(null)

		try {
			const provider = new GoogleAuthProvider()
			await signInWithPopup(auth, provider)
			toast.success("Successfully logged in with Google!")
			router.push("/")
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err)
			setError(message)
			toast.error(`Failed to login with Google: ${message}`)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
			>
				<div className="text-center mb-6">
					<h1 className="text-3xl font-bold text-blue-900 flex justify-center items-center gap-2">
						<User className="w-6 h-6" />
						Login
					</h1>
				</div>

				<form onSubmit={handleEmailLogin} className="space-y-4">
					<div>
						<label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
							<Mail className="w-4 h-4" /> Email
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="example@domain.com"
						/>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
							<Lock className="w-4 h-4" /> Password
						</label>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder="••••••••"
						/>
					</div>

					{error && (
						<p className="text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all ${
							loading ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						{loading ? "Processing..." : "Login"}
					</button>
				</form>

				<div className="mt-4">
					<button
						onClick={handleGoogleLogin}
						disabled={loading}
						className={`w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 ${
							loading ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M12.24 10.4V14h3.52c-.15.76-.56 1.43-1.17 1.92l1.92 1.47c1.1-.68 1.96-1.76 2.45-3.13.65-1.85.08-3.96-1.75-5.14-1.67-1.07-3.9-.84-5.37.58l1.4 1.3zm-1.5-1.3c-.9-1.22-2.38-2-4-2-2.76 0-5 2.24-5 5s2.24 5 5 5c1.62 0 3.1-.78 4-2l-1.4-1.3c-.6.8-1.56 1.3-2.6 1.3-1.76 0-3.2-1.44-3.2-3.2s1.44-3.2 3.2-3.2c1.04 0 1.98.5 2.6 1.3l1.4-1.3zm-4.9 2.9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
							/>
						</svg>
						{loading ? "Processing..." : "Sign in with Google"}
					</button>
				</div>
			</motion.div>
		</div>
	)
}
