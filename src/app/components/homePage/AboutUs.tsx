"use client"
import { motion } from "framer-motion"
export default function AboutUs() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 60 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.5 }} // Trigger when center reaches viewport
			className="bg-white py-12 px-6"
		>
			<section className="bg-white py-16 px-6">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
						About Us
					</h2>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
						<div className="text-gray-800 space-y-5 leading-relaxed text-justify">
							<p>
								Our core team, boasting over 25 years of experience in
								recruitment, placements, and understanding the
								dynamics of the education space, is committed to
								simplifying the hiring process in this sector. At
								Eduvacancy, you can find a wide range of job
								opportunities, including positions for Principal and
								Vice Principal, Director, Chancellor and Vice
								Chancellor, CTO, CXO, BDM, BDE, Inside Sales, Teaching
								roles, PRT, TGT, IIT/NEET coaches, Academic staff,
								Admission Counselor, Administrative and Non-Teaching
								positions, Vocational Subject experts, Digital
								Marketing and Graphic Designing professionals, as well
								as Work From Home and Freelance opportunities. We also
								provide Teacher Training and Career Counseling
								services.
							</p>
							<p>
								Our mission is to streamline the hiring and job search
								process for educational institutions and candidates
								across India and worldwide, ensuring that the right
								talent meets the right opportunity. Join Eduvacancy
								today and experience the best in education sector
								recruitment.
							</p>
						</div>

						<div className="w-full h-auto rounded-xl overflow-hidden shadow-lg">
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
