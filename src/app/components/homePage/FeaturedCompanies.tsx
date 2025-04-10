"use client"
import React, { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function JobSearchPage() {
	const categories = [
		{ name: "Teaching", icon: "📚" },
		{ name: "Online Tutoring", icon: "💻" },
		{ name: "Educational Administration", icon: "🏫" },
		{ name: "Curriculum Development", icon: "📝" },
		{ name: "Special Education", icon: "🤝" },
		{ name: "Classroom Management", icon: "👩‍🏫" },
		{ name: "Educational Technology", icon: "🔧" },
		{ name: "Teacher Training", icon: "🎓" },
	]

	const cities = [
		"New York",
		"Los Angeles",
		"Chicago",
		"Houston",
		"Phoenix",
		"Seattle",
		"Miami",
		"Boston",
	]

	const schools = [
		"Harvard University",
		"Stanford School",
		"MIT Academy",
		"Yale Institute",
		"Princeton College",
		"Columbia School",
		"UC Berkeley",
		"Oxford Education",
	]

	const citiesRef = useRef<HTMLDivElement>(null)
	const schoolsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const interval = setInterval(() => {
			scrollNext(citiesRef)
			scrollNext(schoolsRef)
		}, 2000)
		return () => clearInterval(interval)
	}, [])

	const scrollNext = (
		ref: React.RefObject<HTMLDivElement | null>
	) => {
		if (ref.current) {
			const el = ref.current
			const scrollWidth = el.scrollWidth
			const scrollLeft = el.scrollLeft
			const clientWidth = el.clientWidth

			// If near the end, scroll back to start
			if (scrollLeft + clientWidth >= scrollWidth - 10) {
				el.scrollTo({ left: 0, behavior: "smooth" })
			} else {
				el.scrollBy({ left: 200, behavior: "smooth" })
			}
		}
	}

	const scrollPrev = (
		ref: React.RefObject<HTMLDivElement | null>
	) => {
		if (ref.current) {
			ref.current.scrollBy({ left: -200, behavior: "smooth" })
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
			<div className="max-w-7xl mx-auto space-y-10">
				{/* HEADER */}
				<div className="text-center">
					<h1 className="text-3xl font-bold text-blue-900">
						Explore Jobs in Education
					</h1>
					<p className="mt-1 text-gray-600 text-sm">
						From classrooms to curriculum — find your next step in
						education
					</p>
				</div>

				{/* CATEGORIES */}
				<section className="bg-white border border-blue-100 p-6 rounded-2xl shadow">
					<h2 className="text-xl font-semibold text-blue-800 mb-4">
						Popular Categories
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{categories.map((cat, idx) => (
							<div
								key={idx}
								className="group bg-blue-50 hover:bg-blue-100 transition rounded-xl p-4 flex flex-col items-center justify-center shadow-sm"
							>
								<span className="text-2xl mb-2 transition-transform group-hover:scale-110">
									{cat.icon}
								</span>
								<p className="text-center font-medium text-blue-900 text-sm">
									{cat.name}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* CITIES */}
				<section className="relative bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-2xl shadow border border-blue-200">
					<h2 className="text-xl font-semibold text-blue-900 mb-4">
						Top Cities
					</h2>
					<div className="relative">
						<div
							ref={citiesRef}
							className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar pr-6"
						>
							{cities.map((city, idx) => (
								<div
									key={idx}
									className="flex-shrink-0 w-40 bg-white rounded-lg p-3 text-center shadow text-blue-800 text-sm font-medium hover:bg-blue-50 transition"
								>
									{city}
								</div>
							))}
						</div>
						<div className="absolute top-1/2 left-0 -translate-y-1/2">
							<button
								onClick={() => scrollPrev(citiesRef)}
								className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
							>
								<ChevronLeft className="text-blue-700 h-5 w-5" />
							</button>
						</div>
						<div className="absolute top-1/2 right-0 -translate-y-1/2">
							<button
								onClick={() => scrollNext(citiesRef)}
								className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
							>
								<ChevronRight className="text-blue-700 h-5 w-5" />
							</button>
						</div>
					</div>
				</section>

				{/* SCHOOLS */}
				<section className="relative bg-gradient-to-r from-blue-200 to-blue-300 p-6 rounded-2xl shadow border border-blue-300">
					<h2 className="text-xl font-semibold text-blue-900 mb-4">
						Top Schools
					</h2>
					<div className="relative">
						<div
							ref={schoolsRef}
							className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar pr-6"
						>
							{schools.map((school, idx) => (
								<div
									key={idx}
									className="flex-shrink-0 w-56 bg-white rounded-lg p-4 text-center shadow text-blue-900 text-sm font-medium hover:bg-blue-50 transition"
								>
									{school}
								</div>
							))}
						</div>
						<div className="absolute top-1/2 left-0 -translate-y-1/2">
							<button
								onClick={() => scrollPrev(schoolsRef)}
								className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
							>
								<ChevronLeft className="text-blue-800 h-5 w-5" />
							</button>
						</div>
						<div className="absolute top-1/2 right-0 -translate-y-1/2">
							<button
								onClick={() => scrollNext(schoolsRef)}
								className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
							>
								<ChevronRight className="text-blue-800 h-5 w-5" />
							</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}
