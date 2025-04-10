"use client"
import Image from "next/image"
import { FaMapMarkerAlt } from "react-icons/fa"

const jobList = [
	{
		title: "PGT Computer Science Teacher",
		school: "Don Bosco Public School",
		location: "Nainital, India",
		logo: "/logos/donbosco.png",
	},
	{
		title: "PGT Chemistry Teacher",
		school: "Don Bosco Public School",
		location: "Nainital, India",
		logo: "/logos/donbosco.png",
	},
	{
		title: "PGT Biology Teacher",
		school: "INDORE PUBLIC SCHOOL – SANWER CAMPUS",
		location: "Ujjain, India",
		logo: "/logos/indorepublic.png",
	},
	{
		title: "Center Head at The First School",
		school: "The First School",
		location: "Chennai, India",
		logo: "/logos/firstschool.png",
	},
	{
		title: "Center Head at The First School",
		school: "The First School",
		location: "Chennai, India",
		logo: "/logos/firstschool.png",
	},
]

export default function FeaturedCompanies() {
	return (
		<section className="bg-white py-12 px-6">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-3xl font-bold text-center text-blue-900">
					FEATURED JOBS
				</h2>
				<p className="text-center text-gray-500 mb-10 text-sm">
					'Review jobs, apply and interact directly with the schools'
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{jobList.map((job, idx) => (
						<div
							key={idx}
							className="bg-white border border-blue-200 rounded-xl p-6 shadow hover:shadow-lg transition duration-200"
						>
							<div className="flex items-center mb-4">
								<div className="w-14 h-14 relative mr-4 shrink-0">
									<Image
										src={job.logo}
										alt={`${job.school} Logo`}
										layout="fill"
										className="rounded-md object-contain"
									/>
								</div>
								<div>
									<h3 className="font-semibold text-blue-900">
										{job.title}
									</h3>
									<p className="text-sm text-gray-600">
										{job.school}
									</p>
								</div>
							</div>
							<div className="flex items-center text-sm text-blue-600">
								<FaMapMarkerAlt className="mr-1" />
								{job.location}
							</div>
						</div>
					))}
				</div>

				<div className="flex items-center justify-center mt-12">
					<div className="flex-grow border-t border-gray-300 mx-4"></div>

					<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full shadow transition">
						Find All Jobs <span className="ml-1">🔍</span>
					</button>

					<div className="flex-grow border-t border-gray-300 mx-4"></div>
				</div>
			</div>
		</section>
	)
}
