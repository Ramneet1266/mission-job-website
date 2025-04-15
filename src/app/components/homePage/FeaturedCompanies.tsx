"use client"
import React, { useEffect, useState } from "react"
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
	const [companies, setCompanies] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

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
				const companiesSet = new Set<string>()

				for (const doc of categoriesSnapshot.docs) {
					const postingsSnapshot = await getDocs(
						collection(db, "categories", doc.id, "posting")
					)
					postingsSnapshot.docs.forEach((postingDoc) => {
						const postingData = postingDoc.data() as Posting
						if (postingData.city) citiesSet.add(postingData.city)
						if (postingData.jobCompany)
							companiesSet.add(postingData.jobCompany)
					})
				}

				setCities(Array.from(citiesSet))
				setCompanies(Array.from(companiesSet))

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

	const navigateWithFilter = (filter: string, value: string) => {
		localStorage.setItem(
			"jobFilter",
			JSON.stringify({ [filter]: value })
		)
		const queryParam = encodeURIComponent(value)
		router.push(`/findjobs?${filter}=${queryParam}`)
	}

	const Section = ({
		title,
		items,
		filter,
		loadingText,
		emptyText,
		buttonLabel,
	}: {
		title: string
		items: string[]
		filter: string
		loadingText: string
		emptyText: string
		buttonLabel?: (val: string) => string
	}) => (
		<section className="space-y-4">
			{loading ? (
				<p className="text-gray-500 italic">{loadingText}</p>
			) : error && items.length === 0 ? (
				<p className="text-red-500">{emptyText}</p>
			) : (
				<div className="flex items-center gap-3">
					<h2 className="text-xl font-semibold text-blue-900 mr-4">
						{title}
					</h2>
					{items.slice(0, 5).map((item, idx) => (
						<button
							key={idx}
							className="bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-800 font-medium rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-200"
							onClick={() => navigateWithFilter(filter, item)}
						>
							{buttonLabel ? buttonLabel(item) : item}
						</button>
					))}
				</div>
			)}
		</section>
	)

	return (
		<div className="bg-gradient-to-b from-white via-blue-50 to-white pt-12 px-6">
			<div className="max-w-6xl mx-auto space-y-12">
				<Section
					title="Jobs by Categories"
					items={categories.map((c) => c.title)}
					filter="category"
					loadingText="Loading categories..."
					emptyText="No categories available."
				/>

				<Section
					title="Jobs by Locations"
					items={cities}
					filter="city"
					loadingText="Loading locations..."
					emptyText="No locations available."
					buttonLabel={(city) => `Teacher jobs in ${city}`}
				/>

				<Section
					title="Jobs by Schools"
					items={companies}
					filter="company"
					loadingText="Loading schools..."
					emptyText="No schools available."
				/>
			</div>
		</div>
	)
}
