"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type NewsItem = {
	id: string
	title: string
	description: string
	image: string
	link: string
	date?: string
	searchCount?: number
}

export default function NewsDetail() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [newsItem, setNewsItem] = useState<NewsItem | null>(null)

	useEffect(() => {
		const queryData = searchParams.get("data")
		if (queryData) {
			const decodedData = decodeURIComponent(queryData)
			const parsedData = JSON.parse(decodedData)
			console.log("Parsed news item:", parsedData) // Debug the parsed data
			setNewsItem(parsedData)
		}
	}, [searchParams])

	if (!newsItem) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-blue-50 py-12 px-6 mt-16">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-blue-900 mb-6">
					{newsItem.title}
				</h1>
				<img
					src={newsItem.image}
					alt={newsItem.title}
					className="w-full h-64 object-cover rounded-lg mb-6"
					onError={(e) =>
						console.error(
							"Image load error on detail page:",
							newsItem.image,
							e
						)
					} // Debug image load failure
				/>
				<p className="text-gray-700 mb-4">{newsItem.description}</p>
				<p className="text-sm text-gray-500 mb-4">
					{newsItem.date
						? `Date: ${newsItem.date}`
						: "No date available"}
				</p>
				<p className="text-sm text-gray-500 mb-4">
					Search Count: {newsItem.searchCount || 0}
				</p>
				<a
					href={newsItem.link}
					className="text-blue-600 hover:text-blue-800 underline"
				>
					Visit Original Link
				</a>
				<button
					onClick={() => router.back()}
					className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
				>
					Back
				</button>
			</div>
		</div>
	)
}
