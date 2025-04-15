"use client"
import { motion } from "framer-motion"

export default function AboutUs() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 60 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.5 }} // Trigger when center reaches viewport
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
								With over 25 years of expertise in recruitment and
								placements, our core team at Eduvacancy is dedicated
								to transforming the hiring process in the education
								sector. We offer a wide range of career opportunities,
								from leadership roles such as Principal and Vice
								Principal, to teaching positions like PRT, TGT, and
								IIT/NEET coaches. Additionally, we provide roles in
								administrative support, marketing, and freelance
								positions, along with Teacher Training and Career
								Counseling services.
							</p>
							<p>
								Our mission is to streamline the hiring and job search
								process for educational institutions and candidates
								worldwide, ensuring that the right talent meets the
								right opportunity. At Eduvacancy, we are committed to
								excellence in education sector recruitment.
							</p>
						</div>

						<div className="w-full h-auto rounded-xl overflow-hidden shadow-xl">
							<video
								src="/video/about.mp4"
								controls
								className="w-full h-full object-cover rounded-xl"
							></video>
						</div>
					</div>
				</div>
			</section>
		</motion.section>
	)
}
