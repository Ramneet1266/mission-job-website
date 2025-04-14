"use client"
import React, { useEffect, useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { db, collection, getDocs } from "../../lib/firebase"

interface Category {
	id: string
	title: string
	information?: string
	createdAt?: string
}

interface Posting {
	city: string
	jobCompany: string
}

export default function JobSearchPage() {
	const router = useRouter()
	const [categories, setCategories] = useState<Category[]>([])
	const [cities, setCities] = useState<string[]>([])
	const [companies, setCompanies] = useState<string[]>([]) // Changed from designations to companies
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const locationsRef = useRef<HTMLDivElement>(null)
	const companiesRef = useRef<HTMLDivElement>(null) // Changed from designationsRef to companiesRef

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)
				setError(null)

				const categoriesSnapshot = await getDocs(
					collection(db, "categories")
				)
				const categoriesData: Category[] =
					categoriesSnapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					})) as Category[]
				setCategories(categoriesData)

				const citiesSet = new Set<string>()
				const companiesSet = new Set<string>() // Changed from designationsSet to companiesSet

				for (const doc of categoriesSnapshot.docs) {
					const postingsSnapshot = await getDocs(
						collection(db, "categories", doc.id, "posting")
					)
					postingsSnapshot.docs.forEach((postingDoc) => {
						const postingData = postingDoc.data() as Posting
						if (postingData.city) citiesSet.add(postingData.city)
						if (postingData.jobCompany)
							companiesSet.add(postingData.jobCompany) // Changed to jobCompany
					})
				}

				setCities(Array.from(citiesSet))
				setCompanies(Array.from(companiesSet)) // Changed to setCompanies

				if (categoriesData.length === 0)
					setError("No categories found.")
				if (citiesSet.size === 0 && companiesSet.size === 0) {
					setError((prev) =>
						prev ? `${prev} No postings found.` : "No postings found."
					)
				}
			} catch (err) {
				console.error("Error:", err)
				setError("Failed to load data.")
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	const scrollPrev = (
		ref: React.RefObject<HTMLDivElement | null>
	) => {
		if (ref.current) {
			ref.current.scrollBy({ left: -200, behavior: "smooth" })
		}
	}

	const scrollNext = (
		ref: React.RefObject<HTMLDivElement | null>
	) => {
		if (ref.current) {
			ref.current.scrollBy({ left: 200, behavior: "smooth" })
		}
	}
	const navigateWithFilter = (filter: string, value: string) => {
		// Optionally keep localStorage for persistence
		localStorage.setItem(
			"jobFilter",
			JSON.stringify({ [filter]: value })
		)

		// Pass filter as query parameter
		const queryParam = encodeURIComponent(value)
		router.push(`/findjobs?${filter}=${queryParam}`)
	}

	return (
		<div className=" bg-gradient-to-b from-white via-blue-50  py-10 px-4">
			<div className="max-w-7xl mx-auto space-y-12">
				{/* CATEGORIES */}
				<section className="text-center">
					<h2 className="text-2xl font-semibold text-blue-900 mb-4">
						Jobs by Categories
					</h2>
					{loading ? (
						<p className="text-gray-600"></p>
					) : error ? (
						<p className="text-red-600">{error}</p>
					) : categories.length === 0 ? (
						<p className="text-gray-600">No categories available.</p>
					) : (
						<div className="flex flex-wrap justify-center gap-4">
							{categories.map((cat, idx) => (
								<button
									key={idx}
									className="bg-white hover:bg-blue-100 text-blue-800 shadow-md rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
									onClick={() =>
										navigateWithFilter("category", cat.title)
									}
								>
									{cat.title}
								</button>
							))}
						</div>
					)}
				</section>

				{/* LOCATIONS */}
				<section className="relative">
					<h2 className="text-2xl text-center font-semibold text-blue-900 mb-4">
						Jobs by Locations
					</h2>
					{loading ? (
						<p className="text-gray-600 text-center">
							
						</p>
					) : error && cities.length === 0 ? (
						<p className="text-red-600 text-center">
							No locations available.
						</p>
					) : (
						<div className="relative">
							<div
								ref={locationsRef}
								className="flex gap-4 pt-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth px-20"
							>
								{cities.map((city, idx) => (
									<button
										key={idx}
										className="min-w-[180px] bg-white hover:bg-blue-100 text-blue-800 shadow-md rounded-full px-5 py-2 text-sm font-medium transition-all"
										onClick={() => navigateWithFilter("city", city)}
									>
										Teacher jobs in {city}
									</button>
								))}
							</div>
							{/* Arrows */}
							<div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
								<button
									onClick={() => scrollPrev(locationsRef)}
									className="bg-white shadow-md hover:bg-gray-100 p-2 rounded-full"
								>
									<ChevronLeft className="text-blue-800 h-5 w-5" />
								</button>
							</div>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
								<button
									onClick={() => scrollNext(locationsRef)}
									className="bg-white shadow-md hover:bg-gray-100 p-2 rounded-full"
								>
									<ChevronRight className="text-blue-800 h-5 w-5" />
								</button>
							</div>
						</div>
					)}
				</section>

				{/* COMPANIES */}
				<section className="relative">
					<h2 className="text-2xl text-center font-semibold text-blue-900 mb-4">
						Jobs by Schools
					</h2>
					{loading ? (
						<p className="text-gray-600 text-center">
							
						</p>
					) : error && companies.length === 0 ? (
						<p className="text-red-600 text-center">
							No schools available.
						</p>
					) : (
						<div className="relative">
							<div
								ref={companiesRef}
								className="flex gap-4 overflow-x-auto no-scrollbar pt-2 pb-2 scroll-smooth px-20"
							>
								{companies.map((company, idx) => (
									<button
										key={idx}
										className="min-w-[180px] bg-white hover:bg-blue-100 text-blue-800 shadow-md rounded-full px-5 py-2 text-sm font-medium transition-all"
										onClick={() =>
											navigateWithFilter("company", company)
										}
									>
										{company}
									</button>
								))}
							</div>
							{/* Arrows */}
							<div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
								<button
									onClick={() => scrollPrev(companiesRef)}
									className="bg-white shadow-md hover:bg-gray-100 p-2 rounded-full"
								>
									<ChevronLeft className="text-blue-800 h-5 w-5" />
								</button>
							</div>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
								<button
									onClick={() => scrollNext(companiesRef)}
									className="bg-white shadow-md hover:bg-gray-100 p-2 rounded-full"
								>
									<ChevronRight className="text-blue-800 h-5 w-5" />
								</button>
							</div>
						</div>
					)}
				</section>
			</div>
		</div>
	)
}
