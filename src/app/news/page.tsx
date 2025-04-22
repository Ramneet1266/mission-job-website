"use client"
import React, { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"

// Type for news items
type NewsItem = {
	id: string
	title: string
	description: string
	image: string
	link: string
	date?: string
	searchCount?: number
}

export default function News() {
	const { t } = useTranslation()
	const [currentPage, setCurrentPage] = useState(1)
	const [filter, setFilter] = useState<
		"latest" | "oldest" | "most" | ""
	>("")
	const [search, setSearch] = useState("")
	const [newsData, setNewsData] = useState<NewsItem[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(
		null
	)
	const [visibleNewsCount, setVisibleNewsCount] = useState(3)

	const cardsPerPage = 3

	// Fetch data from Firestore and use SWR for caching
	const fetchNews = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "news"))
			const news: NewsItem[] = []
			querySnapshot.forEach((doc) => {
				const data = doc.data()
				const date = data.createdAt
					? new Date(data.createdAt).toISOString().split("T")[0]
					: undefined
				news.push({
					id: doc.id,
					title: data.title || "Untitled",
					description: data.information || "No description",
					image:
						data.url || "https://source.unsplash.com/400x300/?news",
					link: "#",
					date: date,
					searchCount: data.searchCount || 0,
				})
			})
			return news
		} catch (error) {
			console.error("Error fetching news:", error)
		}
	}

	// Using SWR for caching the fetched news data
	const { data, error } = useSWR("news", fetchNews, {
		revalidateOnFocus: false,
	})

	useEffect(() => {
		if (data) {
			setNewsData(data)
			setLoading(false)
		}
	}, [data])

	const filteredNews = useMemo(() => {
		let filtered = [...newsData]

		if (search) {
			filtered = filtered.filter(
				(item) =>
					item.title.toLowerCase().includes(search.toLowerCase()) ||
					item.description
						.toLowerCase()
						.includes(search.toLowerCase())
			)
		}

		if (filter === "latest") {
			filtered.sort(
				(a, b) =>
					new Date(b.date || "").getTime() -
					new Date(a.date || "").getTime()
			)
		} else if (filter === "oldest") {
			filtered.sort(
				(a, b) =>
					new Date(a.date || "").getTime() -
					new Date(b.date || "").getTime()
			)
		} else if (filter === "most") {
			filtered.sort(
				(a, b) => (b.searchCount ?? 0) - (a.searchCount ?? 0)
			)
		}

		return filtered
	}, [filter, search, newsData])
	const totalPages = Math.ceil(filteredNews.length / cardsPerPage)
	const currentCards = filteredNews.slice(
		(currentPage - 1) * cardsPerPage,
		currentPage * cardsPerPage
	)
	const currentNews = filteredNews.slice(0, visibleNewsCount)

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-blue-700 text-lg">{t("Loading...")}</div>
			</div>
		)
	}

	return (
		<div className="py-8 mt-18 px-4 bg-gradient-to-b from-gray-50 to-white">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
					{t("News")}
				</h1>

				{/* Filter & Search */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
					<div className="space-x-2">
						<button
							onClick={() => {
								setFilter("latest")
							}}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "latest"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							{t("	Latest")}
						</button>
						<button
							onClick={() => {
								setFilter("oldest")
							}}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "oldest"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							{t("Oldest")}
						</button>
						<button
							onClick={() => {
								setFilter("most")
							}}
							className={`px-4 py-2 rounded-lg border text-sm font-medium ${
								filter === "most"
									? "bg-blue-700 text-white"
									: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
							}`}
						>
							{t("Most Searched")}
						</button>
					</div>

					<input
						type="text"
						placeholder="Search news..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
						}}
						className="w-full md:w-1/3 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* News Cards */}
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
					initial="hidden"
					animate="visible"
				>
					<AnimatePresence>
						{currentNews.map((news) => (
							<motion.div
								key={news.id}
								variants={itemVariants}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
							>
								<div className="relative w-full h-56">
									<img
										src={news.image}
										alt={news.title}
										className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										onError={(e) =>
											console.error(
												"Image load error:",
												news.image,
												e
											)
										}
									/>
									<button
										onClick={() => setSelectedNews(news)}
										className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all duration-200"
									>
										{t("		Read More")}
									</button>
								</div>
								<div className="p-5">
									<h2 className="text-xl font-semibold text-blue-800 mb-2 line-clamp-2">
										{news.title}
									</h2>
									<p className="text-gray-600 text-sm mb-4 line-clamp-3">
										{news.description}
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
											{news.date || "Unknown"}
										</span>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>

				{/* Show More Button */}
				{filteredNews.length > visibleNewsCount && (
					<div className="flex justify-center mt-8">
						<button
							onClick={() =>
								setVisibleNewsCount(visibleNewsCount + cardsPerPage)
							}
							className="px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
						>
							{t("Show More")}
						</button>
					</div>
				)}

				{/* Modal for Read More */}
				<Transition appear show={selectedNews !== null} as={Fragment}>
					<Dialog
						as="div"
						className="relative z-50"
						onClose={() => setSelectedNews(null)}
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
											{selectedNews?.title}
										</Dialog.Title>
										<div className="relative w-full h-64">
											<img
												src={selectedNews?.image}
												alt={selectedNews?.title}
												className="absolute inset-0 w-full h-full object-cover"
											/>
										</div>
										<p className="text-sm text-gray-600 mt-4">
											{selectedNews?.description}
										</p>
										<div className="flex justify-end mt-4">
											<button
												onClick={() => setSelectedNews(null)}
												className="px-6 py-2 text-lg font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
											>
												{t("Close")}
											</button>
										</div>
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
