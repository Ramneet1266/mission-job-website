"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { db, collection, getDocs } from "../../lib/firebase"

export default function HeroSection() {
	const [categories, setCategories] = useState<string[]>([])
	const [categoryTags, setCategoryTags] = useState<
		Record<string, string[]>
	>({})
	const [cities, setCities] = useState<string[]>([])
	const [query, setQuery] = useState("")
	const [location, setLocation] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<
		string | null
	>(null)
	const [selectedTag, setSelectedTag] = useState<string | null>(null)
	const [showCategoryDropdown, setShowCategoryDropdown] =
		useState(false)
	const [showLocationDropdown, setShowLocationDropdown] =
		useState(false)

	const categoryRef = useRef<HTMLDivElement>(null)
	const locationRef = useRef<HTMLDivElement>(null)
	const router = useRouter()

	useEffect(() => {
		const fetchData = async () => {
			const snapshot = await getDocs(collection(db, "categories"))
			const catSet = new Set<string>()
			const citySet = new Set<string>()
			const tagMap: Record<string, string[]> = {}

			for (const doc of snapshot.docs) {
				const data = doc.data()
				if (data.title) catSet.add(data.title)

				const postingsSnapshot = await getDocs(
					collection(db, "categories", doc.id, "posting")
				)
				const tags: string[] = []
				postingsSnapshot.docs.forEach((postingDoc) => {
					const postingData = postingDoc.data()
					if (postingData.city) citySet.add(postingData.city)
					if (postingData.tags && Array.isArray(postingData.tags)) {
						tags.push(...postingData.tags)
					}
				})
				if (data.title && tags.length > 0) {
					tagMap[data.title] = [...new Set(tags)] // Ensure unique tags per category
				}
			}

			setCategories(Array.from(catSet))
			setCategoryTags(tagMap)
			console.log(categoryTags)

			setCities(Array.from(citySet))
		}
		fetchData()
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				categoryRef.current &&
				!categoryRef.current.contains(event.target as Node)
			) {
				setShowCategoryDropdown(false)
			}
			if (
				locationRef.current &&
				!locationRef.current.contains(event.target as Node)
			) {
				setShowLocationDropdown(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		router.push(
			`/findjobs?query=${encodeURIComponent(
				query
			)}&location=${encodeURIComponent(location)}`
		)
	}

	const filteredCategories = categories.filter((cat) =>
		cat.toLowerCase().includes(query.toLowerCase())
	)

	// Flatten all tags for global filtering
	const allTags = Object.values(categoryTags).flat()
	const filteredTags = allTags.filter((tag) =>
		query ? tag.toLowerCase().includes(query.toLowerCase()) : true
	)

	const filteredCities = cities.filter((city) =>
		city.toLowerCase().includes(location.toLowerCase())
	)

	const handleItemSelect = (item: string, isCategory: boolean) => {
		if (isCategory) {
			setQuery(item)
			setSelectedCategory(item)
			setSelectedTag(null) // Reset tag when selecting a new category
		} else {
			setQuery(item)
			setSelectedTag(item)
			setShowCategoryDropdown(false) // Close only after selecting a tag
		}
	}

	return (
		<section
			style={{ marginTop: "0.5rem" }}
			className="relative z-30 bg-gradient-to-b from-white to-blue-50 py-12 px-6"
		>
			<div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
				<img
					src="/images/image_1.png"
					alt="person"
					className="w-40 lg:w-60"
				/>
				<div className="flex-1 text-center relative">
					<h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-5">
						Search For Jobs
					</h1>
					<form onSubmit={handleSubmit}>
						<div className="relative z-30 bg-white shadow-lg rounded-full overflow-visible flex items-center divide-x divide-gray-300 max-w-4xl mx-auto">
							{/* Category Dropdown */}
							<div className="relative flex-1" ref={categoryRef}>
								<input
									type="text"
									placeholder="Select Category"
									className="px-4 py-3 w-full outline-none text-gray-700 text-sm"
									value={query}
									onFocus={() => setShowCategoryDropdown(true)}
									onChange={(e) => {
										setQuery(e.target.value)
										setShowCategoryDropdown(true)
									}}
								/>
								{showCategoryDropdown && (
									<ul className="absolute z-[9999] left-0 right-0 bg-white max-h-60 overflow-auto shadow-xl border border-gray-300 rounded-md text-sm font-medium text-gray-700 mt-1">
										<h3 className="px-4 py-2 text-sm font-semibold text-black text-left">
											Categories
										</h3>
										{filteredCategories.length > 0 ? (
											filteredCategories.map((cat, idx) => (
												<li
													key={idx}
													onClick={() => handleItemSelect(cat, true)}
													className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors duration-150"
												>
													{cat}
												</li>
											))
										) : query ? null : (
											<li className="px-4 py-2 text-gray-400 italic">
												No match found
											</li>
										)}
										<h4 className="px-4 py-2 text-sm font-semibold text-black text-left">
											Tags
										</h4>
										{selectedCategory &&
										categoryTags[selectedCategory] &&
										categoryTags[selectedCategory].length > 0 ? (
											categoryTags[selectedCategory].map(
												(tag, idx) => (
													<li
														key={idx}
														onClick={() =>
															handleItemSelect(tag, false)
														}
														className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors duration-150"
													>
														{tag}
													</li>
												)
											)
										) : query && filteredTags.length === 0 ? (
											<li className="px-4 py-2 text-gray-400 italic">
												Nothing is found
											</li>
										) : (
											filteredTags.map((tag, idx) => (
												<li
													key={idx}
													onClick={() => handleItemSelect(tag, false)}
													className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors duration-150"
												>
													{tag}
												</li>
											))
										)}
									</ul>
								)}
							</div>

							{/* Location Dropdown */}
							<div className="relative" ref={locationRef}>
								<input
									type="text"
									placeholder="Select Location"
									className="px-4 py-3 outline-none text-gray-700 text-sm"
									value={location}
									onFocus={() => setShowLocationDropdown(true)}
									onChange={(e) => {
										setLocation(e.target.value)
										setShowLocationDropdown(true)
									}}
								/>
								{showLocationDropdown && (
									<ul className="absolute z-[9999] left-0 right-0 bg-white max-h-60 overflow-auto shadow-xl border border-gray-300 rounded-md text-sm font-medium text-gray-700 mt-1">
										{filteredCities.length > 0 ? (
											filteredCities.map((city, idx) => (
												<li
													key={idx}
													onClick={() => {
														setLocation(city)
														setShowLocationDropdown(false)
													}}
													className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors duration-150"
												>
													{city}
												</li>
											))
										) : (
											<li className="px-4 py-2 text-gray-400 italic">
												No match found
											</li>
										)}
									</ul>
								)}
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold"
							>
								Search
							</button>
						</div>
					</form>
				</div>
			</div>
		</section>
	)
}
