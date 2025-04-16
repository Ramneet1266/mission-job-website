"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { db } from "@/app/lib/firebase"
import { FaRegClock, FaRegCommentDots } from "react-icons/fa"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"

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
	const [visibleCount, setVisibleCount] = useState(9)
	const [filter, setFilter] = useState<
		"latest" | "oldest" | "most" | ""
	>("")
	const [search, setSearch] = useState("")
	const [newsData, setNewsData] = useState<NewsItem[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(
		null
	)
	const router = useRouter()

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + 3)
	}

	useEffect(() => {
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

				setNewsData(news)
			} catch (error) {
				console.error("Error fetching news:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchNews()
	}, [])

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

	return (
		<div className="py-8 px-4 bg-gradient-to-b from-gray-50 to-white">
			<h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
				Latest News
			</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
				{filteredNews.slice(0, visibleCount).map((news) => (
					<div
						key={news.id}
						className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
					>
						<div className="relative w-full h-56">
							<img
								src={news.image}
								alt={news.title}
								className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
								onError={(e) =>
									console.error("Image load error:", news.image, e)
								}
							/>
							<button
								onClick={() => setSelectedNews(news)}
								className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all duration-200"
							>
								Read More
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
									<FaRegClock />
									{news.date || "Unknown"}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{visibleCount < filteredNews.length && (
				<div className="flex justify-center mt-8">
					<button
						onClick={handleLoadMore}
						className="bg-blue-700 text-white px-8 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
					>
						Load More
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
											alt="modal-img"
											className="absolute inset-0 w-full h-full object-cover rounded-lg"
										/>
									</div>
									<p className="text-gray-600 text-sm my-6">
										{selectedNews?.description}
									</p>
									<button
										type="button"
										className="w-full rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-all duration-200"
										onClick={() => setSelectedNews(null)}
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
	)
}
