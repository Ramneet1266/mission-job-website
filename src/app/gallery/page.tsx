"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ref, getDownloadURL } from "firebase/storage"
import { collection, getDocs } from "firebase/firestore"
import { storage, db } from "../lib/firebase"
import useSWR from "swr"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

type GalleryItem = {
	id: number
	type: "image" | "video"
	src: string
	alt: string
	title: string
	information: string
	date: string
	searchCount: number
}

// Utility function to fetch data from Firestore
const fetchMediaData = async () => {
	try {
		const items: GalleryItem[] = []

		// Fetch images from Firestore 'images' collection
		const imagesSnapshot = await getDocs(collection(db, "images"))
		imagesSnapshot.forEach((doc) => {
			const data = doc.data()
			const date = data.createdAt
				? new Date(data.createdAt).toISOString().split("T")[0]
				: "1970-01-01"
			const src = data.url || "https://via.placeholder.com/300x200"
			const alt = data.title || doc.id
			const title = data.title || "Untitled"
			const information = data.information || "No description"

			items.push({
				id: Number(doc.id) || items.length + 1,
				type: "image",
				src,
				alt,
				title,
				information,
				date,
				searchCount: data.searchCount || 0,
			})
		})

		// Fetch videos from Firestore 'videos' collection and Storage
		const videosSnapshot = await getDocs(collection(db, "videos"))
		for (const doc of videosSnapshot.docs) {
			const data = doc.data()
			const date = data.createdAt
				? new Date(data.createdAt).toISOString().split("T")[0]
				: "1970-01-01"
			const storagePath =
				data.storagePath || data.url || `videos/${doc.id}.mp4`
			const videoRef = ref(storage, storagePath)
			const src = await getDownloadURL(videoRef).catch((error) => {
				console.error("Failed to get video URL:", error)
				return "https://via.placeholder.com/300x200"
			})
			const alt = data.title || doc.id
			const title = data.title || "Untitled"
			const information = data.information || "No description"

			items.push({
				id: Number(doc.id) || items.length + 1,
				type: "video",
				src,
				alt,
				title,
				information,
				date,
				searchCount: data.searchCount || 0,
			})
		}

		return items
	} catch (error) {
		console.error("Error fetching media:", error)
		throw error
	}
}

export default function GalleryPage() {
	const { t } = useTranslation()
	const [currentPage, setCurrentPage] = useState(1)
	const [filter, setFilter] = useState<
		"latest" | "oldest" | "most" | ""
	>("")
	const [search, setSearch] = useState("")
	const [selectedItem, setSelectedItem] =
		useState<GalleryItem | null>(null)

	// Fetch media data with SWR caching
	const { data: mediaData = [], error } = useSWR(
		"gallery-items",
		fetchMediaData,
		{
			revalidateOnFocus: false,
			refreshInterval: 0,
		}
	)

	const cardsPerPage = 3

	if (error) {
		return (
			<span>
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-red-700 text-lg">
						{t("errorMessage")}
					</div>
				</div>
			</span>
		)
	}

	const filteredData = useMemo(() => {
		let filtered = [...mediaData]

		if (search) {
			filtered = filtered.filter(
				(item) =>
					item.title.toLowerCase().includes(search.toLowerCase()) ||
					item.information
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
	}, [filter, search, mediaData])

	const totalPages = Math.ceil(filteredData.length / cardsPerPage)
	const currentItems = filteredData.slice(
		(currentPage - 1) * cardsPerPage,
		currentPage * cardsPerPage
	)

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
	}

	return (
		<span>
			<div className="py-8 mt-16 px-4 bg-gradient-to-b from-gray-50 to-white">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
						{t("Gallery")}
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
								{t("latest")}
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
								{t("oldest")}
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
								{t("mostSearched")}
							</button>
						</div>

						<input
							type="text"
							placeholder={t("searchPlaceholder")}
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
							{currentItems.map((item) => (
								<motion.div
									key={item.id}
									variants={itemVariants}
									initial="hidden"
									animate="visible"
									exit="hidden"
									className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
								>
									<div className="relative w-full h-56">
										{item.type === "image" ? (
											<img
												src={item.src}
												alt={item.alt}
												className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
												onError={(e) =>
													console.error(
														"Image load error:",
														item.src,
														e
													)
												}
											/>
										) : (
											<video
												className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
												controls
											>
												<source src={item.src} type="video/mp4" />
												<source src={item.src} type="video/webm" />
												<source src={item.src} type="video/ogg" />
												<p className="text-red-500 text-center">
													{t("videoLoadError")}
												</p>
											</video>
										)}
										<button
											onClick={() => setSelectedItem(item)}
											className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all duration-200"
										>
											{t("view")}
										</button>
									</div>
									<div className="p-5">
										<h2 className="text-xl font-semibold text-blue-800 mb-2 line-clamp-2">
											{item.title}
										</h2>
										<p className="text-gray-600 text-sm mb-4 line-clamp-3">
											{item.information}
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
												{item.date || "Unknown"}
											</span>
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>

					{/* Pagination */}
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
											<span>{pageNum}</span>
										</button>
									)
								})}
							</nav>
						</div>
					)}

					{/* Modal for View */}
					<Transition
						appear
						show={selectedItem !== null}
						as={Fragment}
					>
						<Dialog
							as="div"
							className="relative z-50"
							onClose={() => setSelectedItem(null)}
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
											{selectedItem && (
												<>
													<Dialog.Title
														as="h3"
														className="text-xl font-bold text-gray-900 mb-4"
													>
														{selectedItem.title}
													</Dialog.Title>
													<div className="relative w-full h-64">
														{selectedItem.type === "image" ? (
															<img
																src={selectedItem.src}
																alt={selectedItem.alt}
																className="absolute inset-0 w-full h-full object-cover"
															/>
														) : (
															<video
																className="absolute inset-0 w-full h-full object-cover"
																controls
																autoPlay
															>
																<source
																	src={selectedItem.src}
																	type="video/mp4"
																/>
																<source
																	src={selectedItem.src}
																	type="video/webm"
																/>
																<source
																	src={selectedItem.src}
																	type="video/ogg"
																/>
																<p className="text-red-500 text-center">
																	{t("videoLoadError")}
																</p>
															</video>
														)}
													</div>
													<p className="text-sm text-gray-600 mt-4">
														{selectedItem.information}
													</p>
													<div className="flex justify-end mt-4">
														<button
															onClick={() => setSelectedItem(null)}
															className="px-6 py-2 text-lg font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
														>
															{t("close")}
														</button>
													</div>
												</>
											)}
										</Dialog.Panel>
									</Transition.Child>
								</div>
							</div>
						</Dialog>
					</Transition>
				</div>
			</div>
		</span>
	)
}
