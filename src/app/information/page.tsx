"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
	const [modalPage, setModalPage] = useState(1) // New state for modal pagination
	const [filter, setFilter] = useState<
		"latest" | "oldest" | "most" | ""
	>("")
	const [search, setSearch] = useState("")
	const [cardData, setCardData] = useState<CardItem[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedCard, setSelectedCard] = useState<CardItem | null>(
		null
	)

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
				<div className="text-blue-700 text-lg">Loading...</div>
			</div>
		)
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
	}

	const totalModalPages = Math.ceil(cardData.length / cardsPerPage)
	const modalCards = cardData.slice(
		(modalPage - 1) * cardsPerPage,
		modalPage * cardsPerPage
	)

	return (
		<div className="py-8 mt-18 px-4 bg-gradient-to-b from-gray-50 to-white">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
					Information
				</h1>

				{/* Filters + Search */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
					<div className="space-x-2">
						<button
							onClick={() => {
								setFilter("latest")
								setCurrentPage(1)
							}}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "latest"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							Latest
						</button>
						<button
							onClick={() => {
								setFilter("oldest")
								setCurrentPage(1)
							}}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "oldest"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							Oldest
						</button>
						<button
							onClick={() => {
								setFilter("most")
								setCurrentPage(1)
							}}
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
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
					initial="hidden"
					animate="visible"
				>
					<AnimatePresence>
						{currentCards.map((card) => (
							<motion.div
								key={card.id}
								variants={itemVariants}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
							>
								<div className="relative w-full h-56">
									<img
										src={card.image}
										alt={card.title}
										className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										onError={(e) =>
											console.error(
												"Image load error:",
												card.image,
												e
											)
										}
									/>
									<button
										onClick={() => setSelectedCard(card)}
										className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all duration-200"
									>
										Read More
									</button>
								</div>
								<div className="p-5">
									<h2 className="text-xl font-semibold text-blue-800 mb-2 line-clamp-2">
										{card.title}
									</h2>
									<p className="text-gray-600 text-sm mb-4 line-clamp-3">
										{card.description}
									</p>
									<div className="flex justify-between items-center text-gray-500 text-xs">
										<span className="flex items-center gap-1.5">
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											{card.date || "Unknown"}
										</span>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>

				{/* Pagination for Cards */}
				{totalPages > 1 && (
					<div className="flex justify-center mt-8">
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

				{/* Modal for Read More */}
				<Transition appear show={selectedCard !== null} as={Fragment}>
					<Dialog
						as="div"
						className="relative z-50"
						onClose={() => setSelectedCard(null)}
					>
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<div className="fixed inset-0 bg-black/40" />
						</Transition.Child>

						<div className="fixed inset-0 overflow-y-auto">
							<div className="flex min-h-full items-center justify-center p-4">
								<Transition.Child
									as={Fragment}
									enter="ease-out duration-300"
									enterFrom="opacity-0 scale-95"
									enterTo="opacity-100 scale-100"
									leave="ease-in duration-200"
									leaveFrom="opacity-100 scale-100"
									leaveTo="opacity-0 scale-95"
								>
									<Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
										<Dialog.Title
											as="h3"
											className="text-xl font-bold text-gray-900 mb-4"
										>
											{selectedCard?.title}
										</Dialog.Title>
										<div className="relative w-full h-64">
											<img
												src={selectedCard?.image}
												alt="modal-img"
												className="absolute inset-0 w-full h-full object-cover rounded-lg"
											/>
										</div>
										<p className="text-gray-600 text-sm my-6">
											{selectedCard?.description}
										</p>

										{/* Pagination for Modal */}
										<div className="flex justify-center mt-4 gap-2">
											{Array.from(
												{ length: totalModalPages },
												(_, i) => {
													const pageNum = i + 1
													const isActive = pageNum === modalPage

													return (
														<button
															key={pageNum}
															onClick={() => setModalPage(pageNum)}
															className={`px-4 py-2 text-sm rounded-full border transition ${
																isActive
																	? "bg-blue-700 text-white shadow-md font-semibold"
																	: "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
															}`}
														>
															{pageNum}
														</button>
													)
												}
											)}
										</div>

										<button
											type="button"
											className="w-full rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-all duration-200"
											onClick={() => setSelectedCard(null)}
										>
											Close
										</button>
									</Dialog.Panel>
								</Transition.Child>
							</div>
						</div>
					</Dialog>
				</Transition>
			</div>
		</div>
	)
}
