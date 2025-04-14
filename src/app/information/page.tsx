"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"

type CardItem = {
	id: number
	image: string
	title: string
	description: string
	date: string
	searchCount: number
}

export default function Information() {
	const [currentPage, setCurrentPage] = useState(1)
	const [filter, setFilter] = useState<
		"latest" | "oldest" | "most" | ""
	>("")
	const [search, setSearch] = useState("")
	const [cardData, setCardData] = useState<CardItem[]>([])
	const [loading, setLoading] = useState(true)

	const cardsPerPage = 3

	// Fetch data from Firestore
	useEffect(() => {
		const fetchCards = async () => {
			try {
				const querySnapshot = await getDocs(
					collection(db, "information")
				)
				const cards: CardItem[] = []

				querySnapshot.forEach((doc) => {
					const data = doc.data()
					const date = new Date(data.createdAt)
						.toISOString()
						.split("T")[0] // Convert to YYYY-MM-DD

					cards.push({
						id: Number(doc.id) || cards.length + 1, // Use document ID or incremental ID
						image: data.url || "https://via.placeholder.com/300x200", // Use url as image
						title: data.title || "Untitled",
						description: data.information || "No description",
						date: date || "1970-01-01",
						searchCount: data.searchCount || 0, // Default to 0 if not present
					})
				})

				setCardData(cards)
			} catch (error) {
				console.error("Error fetching cards:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchCards()
	}, [])

	const filteredData = useMemo(() => {
		let filtered = [...cardData]

		if (search) {
			filtered = filtered.filter(
				(card) =>
					card.title.toLowerCase().includes(search.toLowerCase()) ||
					card.description
						.toLowerCase()
						.includes(search.toLowerCase())
			)
		}

		if (filter === "latest") {
			filtered.sort(
				(a, b) =>
					new Date(b.date).getTime() - new Date(a.date).getTime()
			)
		} else if (filter === "oldest") {
			filtered.sort(
				(a, b) =>
					new Date(a.date).getTime() - new Date(b.date).getTime()
			)
		} else if (filter === "most") {
			filtered.sort((a, b) => b.searchCount - a.searchCount)
		}

		return filtered
	}, [filter, search, cardData])

	const totalPages = Math.ceil(filteredData.length / cardsPerPage)
	const currentCards = filteredData.slice(
		(currentPage - 1) * cardsPerPage,
		currentPage * cardsPerPage
	)

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Loading information...</p>
			</div>
		)
	}

	return (
		<div className="min-h-screen mt-18 bg-blue-50 py-10 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
					Information
				</h1>

				{/* Filters + Search */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
					<div className="space-x-2">
						<button
							onClick={() => setFilter("latest")}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "latest"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							Latest
						</button>
						<button
							onClick={() => setFilter("oldest")}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "oldest"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							Oldest
						</button>
						<button
							onClick={() => setFilter("most")}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "most"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							Most Searched
						</button>
					</div>

					<input
						type="text"
						placeholder="Search information..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setCurrentPage(1)
						}}
						className="w-full md:w-1/3 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Card Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{currentCards.map((card) => (
						<div
							key={card.id}
							className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col"
						>
							<img
								src={card.image}
								alt={card.title}
								className="rounded-md w-full h-40 object-cover mb-4"
							/>
							<h2 className="text-lg font-semibold text-blue-900 mb-2">
								{card.title}
							</h2>
							<p className="text-sm text-gray-700 flex-1">
								{card.description}
							</p>
							<button className="mt-4 text-sm font-medium text-blue-700 hover:underline self-start">
								Read More →
							</button>
						</div>
					))}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center mt-10">
						<nav
							className="inline-flex gap-2"
							aria-label="Pagination"
						>
							{Array.from({ length: totalPages }, (_, i) => {
								const pageNum = i + 1
								const isActive = pageNum === currentPage

								return (
									<button
										key={pageNum}
										onClick={() => setCurrentPage(pageNum)}
										className={`px-4 py-2 text-sm rounded-full border transition ${
											isActive
												? "bg-blue-700 text-white shadow-md font-semibold"
												: "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
										}`}
									>
										{pageNum}
									</button>
								)
							})}
						</nav>
					</div>
				)}
			</div>
		</div>
	)
}
