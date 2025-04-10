"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const jobs = Array.from({ length: 9 }, (_, i) => ({
	id: i + 1,
	title: "Java Fullstack Developer",
	company: "Company name confidential",
	experience: "7 - 14 Years",
	location: "Gurugram, Hyderabad, Noida",
	salary: "INR 11 - 26 LPA",
	tags: ["Early Applicant", "Quick Apply"],
	posted: "21 hours ago",
	industry: "Information Technology",
	coverImage:
		"https://source.unsplash.com/800x300/?technology,office", // Add a real image URL if needed
	responsibilities: [
		"Design and develop scalable web applications.",
		"Collaborate with cross-functional teams.",
		"Ensure performance, quality, and responsiveness.",
	],
	qualifications: [
		"Bachelor’s degree in Computer Science or related field.",
		"7+ years of software development experience.",
		"Strong knowledge of Java and Spring Boot.",
	],
	skills: [
		"Fullstack development (React, Node.js)",
		"AWS & Docker",
		"Agile methodologies",
	],
}))

const filters = [
	{
		label: "Location",
		options: [
			"Remote",
			"New York",
			"San Francisco",
			"Austin",
			"Seattle",
		],
	},
	{
		label: "Experience",
		options: ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"],
	},
	{
		label: "Salary",
		options: ["$30k - $50k", "$50k - $100k", "$100k+"],
	},
	{
		label: "Function",
		options: [
			"Engineering",
			"Marketing",
			"Design",
			"Sales",
			"Support",
		],
	},
	{ label: "Industry", options: ["Tech", "Finance", "Healthcare"] },
	{ label: "Role", options: ["Frontend", "Backend", "Fullstack"] },
	{
		label: "Job Type",
		options: ["Full Time", "Part Time", "Contract"],
	},
	{
		label: "Job Freshness",
		options: ["Last 24 hours", "Last 7 days", "Last 30 days"],
	},
]

export default function JobFilterBar() {
	const [selectedJob, setSelectedJob] = useState(jobs[0])
	const [activeFilter, setActiveFilter] = useState<string | null>(
		null
	)
	const [selectedOptions, setSelectedOptions] = useState<
		Record<string, string[]>
	>({})

	const toggleOption = (label: string, option: string) => {
		setSelectedOptions((prev) => {
			const current = prev[label] || []
			const updated = current.includes(option)
				? current.filter((o) => o !== option)
				: [...current, option]
			return { ...prev, [label]: updated }
		})
	}

	const isSelected = (label: string, option: string) =>
		selectedOptions[label]?.includes(option)

	return (
		<div className="mt-24 h-[calc(100vh-6rem)]">
			{/* FILTER BAR */}
			<div className="border-b py-4 flex justify-center bg-white z-10 sticky top-0 shadow-sm">
				<div className="flex gap-2 flex-wrap justify-center">
					{filters.map((filter) => (
						<div key={filter.label} className="relative">
							<button
								onClick={() =>
									setActiveFilter(
										activeFilter === filter.label
											? null
											: filter.label
									)
								}
								className={`flex items-center gap-1 border px-4 py-2 rounded-full transition-colors ${
									activeFilter === filter.label
										? "border-blue-500 text-blue-600 bg-blue-100"
										: "border-gray-300 text-gray-700 bg-white"
								} hover:bg-blue-50`}
							>
								{filter.label}
								<ChevronDown size={16} />
							</button>
							{activeFilter === filter.label && (
								<div className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-20">
									{filter.options.map((option) => (
										<div
											key={option}
											className={`px-4 py-2 text-sm cursor-pointer ${
												isSelected(filter.label, option)
													? "bg-blue-100 text-blue-600 font-medium"
													: "hover:bg-blue-50"
											}`}
											onClick={() =>
												toggleOption(filter.label, option)
											}
										>
											{option}
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* MAIN CONTENT */}
			<div className="flex h-full">
				{/* LEFT: JOB LIST */}
				<div className="w-1/2 border-r overflow-y-auto p-4 space-y-4 bg-gray-50">
					{jobs.map((job) => (
						<div
							key={job.id}
							className={`p-4 rounded-md border transition-all duration-200 cursor-pointer hover:shadow-md ${
								selectedJob?.id === job.id
									? "border-blue-600 bg-blue-50"
									: "border-gray-300 bg-white"
							}`}
							onClick={() => setSelectedJob(job)}
						>
							<h3 className="text-lg font-semibold text-blue-800">
								{job.title}
							</h3>
							<p className="text-sm text-gray-600">{job.company}</p>
							<p className="text-sm mt-1 text-gray-700">
								{job.experience} • {job.salary}
							</p>
							<p className="text-sm text-gray-500">{job.location}</p>
							<div className="flex gap-2 mt-2">
								{job.tags.map((tag) => (
									<span
										key={tag}
										className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
									>
										{tag}
									</span>
								))}
							</div>
							<p className="text-xs text-gray-400 mt-1">
								{job.posted}
							</p>
						</div>
					))}
				</div>

				{/* RIGHT: JOB DETAILS */}
				<div className="w-1/2 overflow-y-auto p-8 bg-white">
					{selectedJob && (
						<>
							{/* COVER IMAGE */}
							<img
								src={selectedJob.coverImage}
								alt="Job Cover"
								className="rounded-xl mb-6 w-full h-48 object-cover"
							/>

							<h2 className="text-2xl font-bold mb-1 text-blue-800">
								{selectedJob.title}
							</h2>
							<p className="text-gray-700 mb-4 font-medium">
								{selectedJob.company}
							</p>

							<div className="flex gap-4 text-sm text-gray-600 mb-4">
								<span>{selectedJob.experience}</span>
								<span>{selectedJob.salary}</span>
							</div>

							<p className="text-sm text-gray-500 mb-2">
								{selectedJob.location}
							</p>
							{selectedJob.industry && (
								<p className="text-sm mb-4">
									<span className="font-medium text-gray-700">
										Industry:
									</span>{" "}
									{selectedJob.industry}
								</p>
							)}

							{/* SECTIONS */}
							<div className="mb-6">
								<h3 className="font-semibold text-gray-800 mb-2">
									Key Responsibilities
								</h3>
								<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
									{selectedJob.responsibilities?.map(
										(item, index) => (
											<li key={index}>{item}</li>
										)
									)}
								</ul>
							</div>

							<div className="mb-6">
								<h3 className="font-semibold text-gray-800 mb-2">
									Qualifications
								</h3>
								<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
									{selectedJob.qualifications?.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							</div>

							<div className="mb-6">
								<h3 className="font-semibold text-gray-800 mb-2">
									Preferred Skills
								</h3>
								<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
									{selectedJob.skills?.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							</div>

							<a
								href="#"
								className="text-blue-600 underline text-sm mb-4 block"
							>
								Login to check your skill match score
							</a>

							<button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
								Quick Apply
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
