"use client"
import { useState } from "react"

const newsData = [
	{
		id: 1,
		title: "AI Revolutionizing Healthcare",
		description:
			"AI is transforming diagnostics, patient care, and medical research.",
		image: "https://source.unsplash.com/400x300/?healthcare,ai",
		link: "#",
	},
	{
		id: 2,
		title: "SpaceX Launches New Rocket",
		description:
			"SpaceX launched its new rocket from Cape Canaveral.",
		image: "https://source.unsplash.com/400x300/?spacex,rocket",
		link: "#",
	},
	{
		id: 3,
		title: "Climate Change and Its Impact",
		description:
			"Global warming is changing ecosystems and weather patterns.",
		image: "https://source.unsplash.com/400x300/?climate,environment",
		link: "#",
	},
	{
		id: 4,
		title: "Quantum Physics Breakthrough",
		description:
			"Quantum experiments are reshaping our understanding of reality.",
		image: "https://source.unsplash.com/400x300/?quantum,science",
		link: "#",
	},
	{
		id: 5,
		title: "Tech in Education",
		description: "E-learning is revolutionizing education globally.",
		image:
			"https://source.unsplash.com/400x300/?education,technology",
		link: "#",
	},
	{
		id: 6,
		title: "Stock Market Volatility",
		description: "Markets fluctuate as global tensions rise.",
		image: "https://source.unsplash.com/400x300/?finance,stock",
		link: "#",
	},
	{
		id: 7,
		title: "Ocean Cleanup Efforts",
		description:
			"Innovative solutions are helping clean up the oceans.",
		image: "https://source.unsplash.com/400x300/?ocean,cleanup",
		link: "#",
	},
	{
		id: 8,
		title: "Electric Cars Expansion",
		description: "EV companies are growing across continents.",
		image: "https://source.unsplash.com/400x300/?electric,car",
		link: "#",
	},
	{
		id: 9,
		title: "Mars Exploration Mission",
		description: "Rovers continue their journey across Mars.",
		image: "https://source.unsplash.com/400x300/?mars,rover",
		link: "#",
	},
	{
		id: 10,
		title: "Cybersecurity Trends",
		description: "Learn the latest threats in the digital world.",
		image: "https://source.unsplash.com/400x300/?cybersecurity,tech",
		link: "#",
	},
	{
		id: 11,
		title: "Smart Cities of the Future",
		description: "Cities are getting smarter and more connected.",
		image: "https://source.unsplash.com/400x300/?smartcity,future",
		link: "#",
	},
	{
		id: 12,
		title: "Biotech Startups Rise",
		description: "Biotech firms are gaining traction in medicine.",
		image: "https://source.unsplash.com/400x300/?biotech,lab",
		link: "#",
	},
]

export default function News() {
	const initialCount = 9
	const loadMoreCount = 3
	const [visibleCount, setVisibleCount] = useState(initialCount)

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + loadMoreCount)
	}

	return (
		<div className="min-h-screen bg-blue-50 py-12 px-6 mt-16">
			<h1 className="text-4xl font-bold text-center text-blue-900 mb-10">
				Latest News
			</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
				{newsData.slice(0, visibleCount).map((news) => (
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
			{visibleCount < newsData.length && (
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
