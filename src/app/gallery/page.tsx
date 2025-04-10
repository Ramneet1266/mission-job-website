"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type GalleryItem = {
	id: number
	type: "image" | "video"
	src: string
	alt: string
}

const galleryItems: GalleryItem[] = [
	{
		id: 1,
		type: "image",
		src: "https://via.placeholder.com/300x200",
		alt: "Image 1",
	},
	{
		id: 2,
		type: "video",
		src: "https://www.w3schools.com/html/mov_bbb.mp4",
		alt: "Video 1",
	},
	{
		id: 3,
		type: "image",
		src: "https://via.placeholder.com/300x200",
		alt: "Image 2",
	},
	{
		id: 4,
		type: "video",
		src: "https://www.w3schools.com/html/mov_bbb.mp4",
		alt: "Video 2",
	},
	{
		id: 5,
		type: "image",
		src: "https://via.placeholder.com/300x200",
		alt: "Image 3",
	},
]

export default function GalleryPage() {
	const [selectedItem, setSelectedItem] =
		useState<GalleryItem | null>(null)

	const modalVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
		exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
	}

	const images = galleryItems.filter((item) => item.type === "image")
	const videos = galleryItems.filter((item) => item.type === "video")

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
								className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
								onClick={() => setSelectedItem(item)}
							>
								<img
									src={item.src}
									alt={item.alt}
									className="w-full h-48 object-cover"
								/>
								<div className="p-4">
									<p className="text-blue-700 font-medium">
										{item.alt}
									</p>
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
								className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
								onClick={() => setSelectedItem(item)}
							>
								<video className="w-full h-48 object-cover" controls>
									<source src={item.src} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
								<div className="p-4">
									<p className="text-blue-700 font-medium">
										{item.alt}
									</p>
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
									&times;
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
