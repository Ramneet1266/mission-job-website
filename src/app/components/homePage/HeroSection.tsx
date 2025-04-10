"use client"
import { useState } from "react"
import { FaSearchLocation } from "react-icons/fa"
import { MdWorkOutline } from "react-icons/md"
import { FiChevronDown } from "react-icons/fi"

export default function HeroSection() {
	const [experience, setExperience] = useState("Experience")

	return (
		<>
			<section
				style={{ marginTop: "0.5rem" }}
				className="z-10 bg-gradient-to-b from-white to-blue-50 py-12 px-6"
			>
				<div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
					{/* Left Image */}
					<img
						src="/images/image_1.png"
						alt="person"
						className="w-40 lg:w-60"
					/>

					{/* Center Content */}
					<div className="flex-1 text-center">
						<h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6">
							Over 8,00,000 openings delivered perfectly
						</h1>

						<div className="bg-white shadow-lg rounded-full overflow-hidden flex items-center divide-x divide-gray-300 max-w-4xl mx-auto">
							{/* Search Input */}
							<input
								type="text"
								placeholder="Search by Skills, Company or Job Title"
								className="px-4 py-3 flex-1 outline-none text-gray-700"
							/>
							{/* Location Input */}
							<div className="px-4 flex items-center text-gray-500">
								<FaSearchLocation className="mr-2" />
								Location
							</div>
							{/* Experience Dropdown */}
							<div className="px-4 flex items-center text-gray-500 cursor-pointer">
								<MdWorkOutline className="mr-2" />
								{experience}
								<FiChevronDown className="ml-1" />
							</div>
							{/* Search Button */}
							<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold">
								Search
							</button>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
