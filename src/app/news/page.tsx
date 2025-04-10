"use client"

import { useMemo, useState } from "react"

type NewsItem = {
	id: number
	title: string
	description: string
	image: string
	link: string
	date?: string
	searchCount?: number
}

const newsData: NewsItem[] = [
	{
		id: 1,
		title: "AI Revolutionizing Healthcare",
		description:
			"AI is transforming diagnostics, patient care, and medical research.",
		image: "https://source.unsplash.com/400x300/?healthcare,ai",
		link: "#",
		date: "2025-04-01",
		searchCount: 50,
	},
	{
		id: 2,
		title: "SpaceX Launches New Rocket",
		description:
			"SpaceX launched its new rocket from Cape Canaveral.",
		image: "https://source.unsplash.com/400x300/?spacex,rocket",
		link: "#",
		date: "2025-03-20",
		searchCount: 80,
	},
	{
		id: 3,
		title: "Climate Change and Its Impact",
		description:
			"Global warming is changing ecosystems and weather patterns.",
		image: "https://source.unsplash.com/400x300/?climate,environment",
		link: "#",
		date: "2024-12-15",
		searchCount: 40,
	},
	{
		id: 4,
		title: "Quantum Physics Breakthrough",
		description:
			"Quantum experiments are reshaping our understanding of reality.",
		image: "https://source.unsplash.com/400x300/?quantum,science",
		link: "#",
		date: "2025-02-10",
		searchCount: 95,
	},
	{
		id: 5,
		title: "Tech in Education",
		description: "E-learning is revolutionizing education globally.",
		image:
			"https://source.unsplash.com/400x300/?education,technology",
		link: "#",
		date: "2024-10-05",
		searchCount: 60,
	},
	{
		id: 6,
		title: "Stock Market Volatility",
		description: "Markets fluctuate as global tensions rise.",
		image: "https://source.unsplash.com/400x300/?finance,stock",
		link: "#",
		date: "2025-01-30",
		searchCount: 45,
	},
	{
		id: 7,
		title: "Ocean Cleanup Efforts",
		description:
			"Innovative solutions are helping clean up the oceans.",
		image: "https://source.unsplash.com/400x300/?ocean,cleanup",
		link: "#",
		date: "2023-11-01",
		searchCount: 25,
	},
	{
		id: 8,
		title: "Electric Cars Expansion",
		description: "EV companies are growing across continents.",
		image: "https://source.unsplash.com/400x300/?electric,car",
		link: "#",
		date: "2025-03-10",
		searchCount: 100,
	},
	{
		id: 9,
		title: "Mars Exploration Mission",
		description: "Rovers continue their journey across Mars.",
		image: "https://source.unsplash.com/400x300/?mars,rover",
		link: "#",
		date: "2024-09-10",
		searchCount: 30,
	},
	{
		id: 10,
		title: "Cybersecurity Trends",
		description: "Learn the latest threats in the digital world.",
		image: "https://source.unsplash.com/400x300/?cybersecurity,tech",
		link: "#",
		date: "2025-01-01",
		searchCount: 70,
	},
	{
		id: 11,
		title: "Smart Cities of the Future",
		description: "Cities are getting smarter and more connected.",
		image: "https://source.unsplash.com/400x300/?smartcity,future",
		link: "#",
		date: "2023-08-25",
		searchCount: 35,
	},
	{
		id: 12,
		title: "Biotech Startups Rise",
		description: "Biotech firms are gaining traction in medicine.",
		image: "https://source.unsplash.com/400x300/?biotech,lab",
		link: "#",
		date: "2025-04-03",
		searchCount: 55,
	},
]

export default function News() {
	const [visibleCount, setVisibleCount] = useState(9)
	const [filter, setFilter] = useState<
		"latest" | "oldest" | "most" | ""
	>("")
	const [search, setSearch] = useState("")

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + 3)
	}

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
					new Date(b.date!).getTime() - new Date(a.date!).getTime()
			)
		} else if (filter === "oldest") {
			filtered.sort(
				(a, b) =>
					new Date(a.date!).getTime() - new Date(b.date!).getTime()
			)
		} else if (filter === "most") {
			filtered.sort(
				(a, b) => (b.searchCount ?? 0) - (a.searchCount ?? 0)
			)
		}

		return filtered
	}, [filter, search])

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
						/>
						<div className="p-5">
							<h2 className="text-xl font-semibold text-blue-700 mb-2">
								{news.title}
							</h2>
							<p className="text-gray-600 mb-4">{news.description}</p>
							<a
								href={news.link}
								className="inline-block text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 transition-all"
							>
								Read More
							</a>
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
