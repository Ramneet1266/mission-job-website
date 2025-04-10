"use client"

import { Calendar } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

const blogs = [
	{
		date: "August 24, 2024",
		title:
			"Attracting and Retaining Top Talent: Strategies for Educational...",
		desc: "In today’s competitive landscape, attracting and retaining top talent is crucial for educational institutions aim...",

		image: "/blogs/blog1.png",
	},
	{
		date: "July 24, 2024",
		title: "Identifying Your Strengths for Educational Job Vacancies",
		desc: "In the competitive landscape of educational job vacancies in India, knowing your strengths is not just beneficial b...",

		image: "/blogs/blog2.png",
	},
	{
		date: "July 15, 2024",
		title:
			"Building Your Teacher Profile: A Guide to Building a Standout...",
		desc: "Building Your Teacher Profile: A Guide to Building a Standout Professional Identity...",

		image: "/blogs/blog3.png",
	},
]

export default function Blogs() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 60 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.5 }} // Trigger when center reaches viewport
			className="bg-white py-12 px-6"
		>
			<section className="bg-slate-50 py-16 px-6">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
						News
					</h2>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{blogs.map((blog, idx) => (
							<div
								key={idx}
								className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all"
							>
								<div className="w-full h-48 relative rounded-md overflow-hidden mb-3">
									<Image
										src={blog.image}
										alt={blog.title}
										fill
										className="object-cover"
									/>
								</div>

								<div className="flex items-center text-gray-600 text-sm mb-2">
									<Calendar className="w-4 h-4 mr-2" />
									{blog.date}
								</div>

								<h3 className="font-semibold text-lg text-blue-900 mb-2">
									{blog.title}
								</h3>

								<p className="text-sm text-gray-700 mb-4">
									{blog.desc}
								</p>

								<div className="flex gap-3">
									{[
										"facebook",
										"twitter",
										"linkedin",
										"whatsapp",
									].map((platform) => (
										<a key={platform} href="#">
											<Image
												src={`/icons/${platform}.svg`}
												alt={platform}
												width={20}
												height={20}
												className="hover:scale-110 transition"
											/>
										</a>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</motion.section>
	)
}
