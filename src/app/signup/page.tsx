"use client"
import { useState } from "react"
import { User, Mail, Lock, Phone, UserPlus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
export default function Signup() {
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [phone, setPhone] = useState("")

	const handleSignup = (e: React.FormEvent) => {
		e.preventDefault()
		console.log("Signing up with:", { name, email, password, phone })
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10"
			>
				{/* <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10"> */}
				<h2 className="text-3xl font-bold text-blue-700 mb-1 flex items-center gap-2">
					<UserPlus className="w-6 h-6" /> Create Account
				</h2>
				<p className="text-sm text-gray-500 mb-6">
					Sign up to get started
				</p>

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
						/>
					</div>

					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
					>
						Sign Up
					</button>
				</form>

				<p className="text-sm text-center mt-6 text-gray-600">
					Already have an account?{" "}
					<Link
						href="/login"
						className="text-blue-600 hover:underline"
					>
						Log in
					</Link>
				</p>
				{/* </div> */}
			</motion.div>
		</div>
	)
}
