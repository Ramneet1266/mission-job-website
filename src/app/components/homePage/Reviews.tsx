"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"

const reviews = [
	{
		name: "kawaljeet yadav",
		date: "2024-11-06",
		message: "It's been a great and help me a lot",
		stars: 5,
		avatar: "/avatar1.jpg",
	},
	{
		name: "PANKESH KUMAR YADAV",
		date: "2024-10-01",
		message: "Good platform for find teacher job",
		stars: 4.5,
		avatar: "/avatar2.jpg",
	},
	{
		name: "shefali ratnawat",
		date: "2024-09-30",
		message:
			"I have got great response and in working way is systematic and quick.",
		stars: 5,
		avatar: "/avatar3.jpg",
	},
	{
		name: "Anjali Sharma",
		date: "2024-09-10",
		message: "Excellent site for finding jobs quickly.",
		stars: 5,
		avatar: "/avatar4.jpg",
	},
]

export default function Reviews() {
	const [index, setIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prev) => (prev + 2) % reviews.length)
		}, 5000)
		return () => clearInterval(interval)
	}, [])

	const currentPair = [
		reviews[index],
		reviews[(index + 1) % reviews.length],
	]

	return (
		<motion.section
			initial={{ opacity: 0, y: 60 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.5 }} // Trigger when center reaches viewport
			className="bg-white py-12 px-6"
		>
			<section className=" text-center">
				<h2 className="text-2xl md:text-3xl font-semibold text-blue-900 mb-10">
					WHAT PEOPLE ARE SAYING:
				</h2>

				<AnimatePresence mode="wait">
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -50 }}
						transition={{ duration: 0.6 }}
						className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
					>
						{currentPair.map((review, i) => (
							<div
								key={i}
								className="bg-white rounded-xl shadow-md px-6 py-5 text-left"
							>
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-3">
										<img
											src={review.avatar}
											alt={review.name}
											className="w-10 h-10 rounded-full object-cover"
										/>
										<div>
											<p className="font-semibold capitalize text-gray-800">
												{review.name}
											</p>
											<p className="text-sm text-gray-500">
												{review.date}
											</p>
										</div>
									</div>
									<img
										src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
										alt="Google"
										className="w-5 h-5"
									/>
								</div>

								<div className="flex items-center gap-1 text-yellow-400 mb-2">
									{Array.from(
										{ length: Math.floor(review.stars) },
										(_, i) => (
											<Star key={i} fill="currentColor" />
										)
									)}
									{review.stars % 1 !== 0 && (
										<Star
											fill="currentColor"
											className="opacity-50"
										/>
									)}
									<span className="text-blue-500 ml-1">✔</span>
								</div>

								<p className="text-gray-700">{review.message}</p>
							</div>
						))}
					</motion.div>
				</AnimatePresence>

				<button className="mt-10 inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
					🔗 View All Reviews
				</button>
			</section>
		</motion.section>
	)
}
