"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { db, collection, getDocs } from "../../lib/firebase"

export default function HeroSection() {
	const [categories, setCategories] = useState<string[]>([])
	const [cities, setCities] = useState<string[]>([])
	const [query, setQuery] = useState("")
	const [location, setLocation] = useState("")
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

			for (const doc of snapshot.docs) {
				const data = doc.data()
				if (data.title) catSet.add(data.title)

				const postingsSnapshot = await getDocs(
					collection(db, "categories", doc.id, "posting")
				)
				postingsSnapshot.docs.forEach((postingDoc) => {
					const postingData = postingDoc.data()
					if (postingData.city) citySet.add(postingData.city)
				})
			}

			setCategories(Array.from(catSet))
			setCities(Array.from(citySet))
		}
		fetchData()
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (
				categoryRef.current &&
				!categoryRef.current.contains(event.target)
			) {
				setShowCategoryDropdown(false)
			}
			if (
				locationRef.current &&
				!locationRef.current.contains(event.target)
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
		cat.toLowerCase().startsWith(query.toLowerCase())
	)

	const filteredCities = cities.filter((city) =>
		city.toLowerCase().startsWith(location.toLowerCase())
	)

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
										{filteredCategories.length > 0 ? (
											filteredCategories.map((cat, idx) => (
												<li
													key={idx}
													onClick={() => {
														setQuery(cat)
														setShowCategoryDropdown(false)
													}}
													className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors duration-150"
												>
													{cat}
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
