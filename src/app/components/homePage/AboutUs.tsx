"use client"
import { motion } from "framer-motion"

export default function AboutUs() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 60 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.5 }}
			className="py-16 px-6"
		>
			<section className="bg-white pb-10 px-8 shadow-lg">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-semibold text-center text-blue-900 mb-12">
						About Us
					</h2>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="text-gray-700 space-y-6 leading-relaxed text-justify">
							<p>
								Mission Job is a dynamic new platform dedicated to reshaping the job search and recruitment experience—starting with the education sector and expanding beyond. Born from a vision to simplify and humanize the hiring process, Mission Job is here to connect passionate individuals with meaningful career opportunities.
							</p>
							<p>
								We specialize in educational roles ranging from teaching and administrative positions to leadership, training, and freelance opportunities. Whether you're a fresh graduate or an experienced professional, we are committed to helping you find roles that match your skills, goals, and aspirations.
							</p>
						</div>

						<div className="text-gray-700 space-y-6 leading-relaxed text-justify">
							<p>
								As a startup, our strength lies in agility, innovation, and a deep understanding of what today’s institutions and job seekers truly need. At Mission Job, we’re not just filling vacancies—we’re building futures.
							</p>
							<p>
								Join us on our journey to create a smarter, more personalized approach to hiring. With Mission Job, your next opportunity is not just a click away—it’s a mission worth pursuing.
							</p>
						</div>
					</div>
				</div>
			</section>
		</motion.section>
	)
}
