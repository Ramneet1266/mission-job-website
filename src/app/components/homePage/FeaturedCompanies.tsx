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
	tags: string[]
}

export default function JobSearchPage() {
	const router = useRouter()
	const [categories, setCategories] = useState<Category[]>([])
	const [cities, setCities] = useState<string[]>([])
	const [tags, setTags] = useState<string[]>([])
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
				const tagsSet = new Set<string>()

				for (const doc of categoriesSnapshot.docs) {
					const postingsSnapshot = await getDocs(
						collection(db, "categories", doc.id, "posting")
					)
					postingsSnapshot.docs.forEach((postingDoc) => {
						const postingData = postingDoc.data() as Posting
						if (postingData.city) citiesSet.add(postingData.city)
						if (postingData.tags && Array.isArray(postingData.tags)) {
							postingData.tags.forEach((tag) => tagsSet.add(tag))
						}
					})
				}

				setCities(Array.from(citiesSet))
				setTags(Array.from(tagsSet))

				if (categoriesData.length === 0)
					setError("No categories found.")
				if (citiesSet.size === 0 && tagsSet.size === 0) {
					setError("No postings found.")
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
		if (!value) return
		let filterData: any = { [filter]: value }
		if (filter === "tags") {
			filterData = { tags: [value] }
		}
		localStorage.setItem("jobFilter", JSON.stringify(filterData))
		const queryParam = encodeURIComponent(value)
		router.push(`/findjobs?${filter}=${queryParam}`)
	}

	const Section = ({
		title,
		items,
		filter,
		loadingText,
		emptyText,
	}: {
		title: string
		items: string[]
		filter: string
		loadingText: string
		emptyText: string
	}) => {
		if (items.length === 0) return null // Don't render the section if there are no items

		return (
			<div>
				<section className="space-y-4">
					<h2 className="text-lg font-semibold text-blue-900 text-center">
						<span>{title}</span>
					</h2>
					{loading ? (
						<p className="text-gray-500 italic text-center">
							<span>{loadingText}</span>
						</p>
					) : error && items.length === 0 ? (
						<p className="text-red-500 text-center">
							<span>{emptyText}</span>
						</p>
					) : (
						<div className="flex flex-wrap gap-2 justify-center">
							{items.map((item, idx) => (
								<button
									key={idx}
									className="bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-800 font-medium rounded-lg px-3 py-1 text-sm shadow-sm transition-all duration-200"
									onClick={() => navigateWithFilter(filter, item)}
								>
									{item}
								</button>
							))}
						</div>
					)}
				</section>
			</div>
		)
	}

	return (
		<div>
			<div className="bg-gradient-to-b from-white via-blue-50 to-white pt-4 px-6">
				<div className="max-w-6xl mx-auto space-y-12">
					<Section
						title="Jobs by Categories"
						items={categories.map((c) => c.title)}
						filter="category"
						loadingText="Loading categories..."
						emptyText="No categories found."
					/>
					<Section
						title="Jobs by Locations"
						items={cities}
						filter="city"
						loadingText="Loading locations..."
						emptyText="No locations found."
					/>
					<Section
						title="Jobs by Sub Categories"
						items={tags}
						filter="tags"
						loadingText="Loading tags..."
						emptyText="No sub categories found."
					/>
				</div>
			</div>
		</div>
	)
}
