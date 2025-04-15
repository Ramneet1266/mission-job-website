"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { db } from "../lib/firebase"

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
	const router = useRouter()

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + 3)
	}

	// Fetch data from Firestore
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
							data.url || "https://source.unsplash.com/400x300/?news", // Use full URL from Firestore
						link: "#",
						date: date,
						searchCount: data.searchCount || 0,
					})
				})

				console.log("Fetched news data with images:", news) // Debug log with images
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

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				
			</div>
		)
	}

	const handleReadMore = (newsItem: NewsItem) => {
		if (!newsItem || !newsItem.id) {
			console.error("Invalid news item:", newsItem)
			return
		}
		const queryString = `?data=${encodeURIComponent(
			JSON.stringify(newsItem)
		)}`
		router.push(
			`/news/${encodeURIComponent(newsItem.id)}${queryString}`
		)
	}

	return (
		<div className="min-h-screen bg-blue-50 py-12 px-6 mt-16">
			<h1 className="text-4xl font-bold text-center text-blue-900 mb-10">
				Latest News
			</h1>

			{/* Filter & Search */}
			<div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
				<div className="space-x-2">
					<button
						onClick={() => setFilter("latest")}
						className={`px-4 py-2 rounded-lg border text-sm font-medium ${
							filter === "latest"
								? "bg-blue-700 text-white"
								: "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
						}`}
					>
						Latest
					</button>
					<button
						onClick={() => setFilter("oldest")}
						className={`px-4 py-2 rounded-lg border text-sm font-medium ${
							filter === "oldest"
								? "bg-blue-700 text-white"
								: "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
						}`}
					>
						Oldest
					</button>
					<button
						onClick={() => setFilter("most")}
						className={`px-4 py-2 rounded-lg border text-sm font-medium ${
							filter === "most"
								? "bg-blue-700 text-white"
								: "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
						}`}
					>
						Most Searched
					</button>
				</div>

				<input
					type="text"
					placeholder="Search news..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value)
						setVisibleCount(9)
					}}
					className="w-full md:w-1/3 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			{/* News Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
				{filteredNews.slice(0, visibleCount).map((news) => (
					<div
						key={news.id}
						className="bg-white shadow-lg rounded-xl overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
					>
						<img
							src={news.image}
							alt={news.title}
							className="w-full h-48 object-cover"
							onError={(e) =>
								console.error("Image load error:", news.image, e)
							} // Debug image load failure
						/>
						<div className="p-5">
							<h2 className="text-xl font-semibold text-blue-700 mb-2">
								{news.title}
							</h2>
							<p className="text-gray-600 mb-4">{news.description}</p>
							<button
								onClick={() => handleReadMore(news)}
								className="inline-block text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 transition-all"
							>
								Read More
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Load More */}
			{visibleCount < filteredNews.length && (
				<div className="flex justify-center mt-10">
					<button
						onClick={handleLoadMore}
						className="bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all shadow-md hover:scale-105"
					>
						Show More
					</button>
				</div>
			)}
		</div>
	)
}
