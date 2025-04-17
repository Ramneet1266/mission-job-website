"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ref, listAll, getDownloadURL } from "firebase/storage"
import { storage } from "../lib/firebase"

type GalleryItem = {
	id: number
	type: "image" | "video"
	src: string
	alt: string
}

export default function GalleryPage() {
	const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
	const [selectedItem, setSelectedItem] =
		useState<GalleryItem | null>(null)
	const [loading, setLoading] = useState(true)

	// Fetch images and videos from Firebase Storage
	useEffect(() => {
		const fetchMedia = async () => {
			try {
				const items: GalleryItem[] = []

				// Fetch images from galleryImages folder
				const imagesRef = ref(storage, "galleryImages")
				const imageList = await listAll(imagesRef)
				for (const itemRef of imageList.items) {
					const url = await getDownloadURL(itemRef)
					items.push({
						id: items.length + 1,
						type: "image",
						src: url,
						alt: itemRef.name,
					})
				}

				// Fetch videos from videos folder
				const videosRef = ref(storage, "videos")
				const videoList = await listAll(videosRef)
				for (const itemRef of videoList.items) {
					const url = await getDownloadURL(itemRef)
					items.push({
						id: items.length + 1,
						type: "video",
						src: url,
						alt: itemRef.name,
					})
				}

				setGalleryItems(items)
			} catch (error) {
				console.error("Error fetching media:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchMedia()
	}, [])

	const modalVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
		exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
	}

	const images = galleryItems.filter((item) => item.type === "image")
	const videos = galleryItems.filter((item) => item.type === "video")

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-blue-700 text-lg">Loading...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-b mt-18 from-blue-50 to-white pt-10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h1 className="text-4xl font-extrabold text-blue-900 text-center mb-10">
					Gallery
				</h1>

				{/* Images Section */}
				<section className="mb-12">
					<h2 className="text-2xl font-semibold text-blue-800 mb-4">
						Images
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{images.map((item) => (
							<div
								key={item.id}
								className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
							>
								<div className="relative w-full h-56">
									<img
										src={item.src}
										alt={item.alt}
										className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										onError={(e) =>
											console.error("Image load error:", item.src, e)
										}
									/>
									<button
										onClick={() => setSelectedItem(item)}
										className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all duration-200"
									>
										View
									</button>
								</div>
								<div className="p-5">
									<h2 className="text-xl font-semibold text-blue-800 mb-2 line-clamp-2">
										{item.alt}
									</h2>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Videos Section */}
				<section>
					<h2 className="text-2xl font-semibold text-blue-800 mb-4">
						Videos
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{videos.map((item) => (
							<div
								key={item.id}
								className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
							>
								<div className="relative w-full h-56">
									<video className="absolute inset-0 w-full h-full object-scale-down transition-transform duration-300 group-hover:scale-105">
										<source src={item.src} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
									<button
										onClick={() => setSelectedItem(item)}
										className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all duration-200"
									>
										View
									</button>
								</div>
								<div className="p-5">
									<h2 className="text-xl font-semibold text-blue-800 mb-2 line-clamp-2">
										{item.alt}
									</h2>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Modal */}
				<AnimatePresence>
					{selectedItem && (
						<motion.div
							className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
							onClick={() => setSelectedItem(null)}
							initial="hidden"
							animate="visible"
							exit="exit"
							variants={modalVariants}
						>
							<motion.div
								className="bg-white rounded-lg p-6 max-w-4xl w-full relative"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									className="absolute top-4 right-4 text-blue-700 text-2xl font-bold hover:text-blue-900"
									onClick={() => setSelectedItem(null)}
								>
									×
								</button>
								{selectedItem.type === "image" ? (
									<img
										src={selectedItem.src}
										alt={selectedItem.alt}
										className="w-full h-auto max-h-[80vh] object-contain"
									/>
								) : (
									<video
										className="w-full h-auto max-h-[80vh] object-contain"
										controls
										autoPlay
									>
										<source src={selectedItem.src} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
								)}
								<p className="text-blue-700 mt-4 text-center">
									{selectedItem.alt}
								</p>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
