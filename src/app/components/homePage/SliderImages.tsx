"use client"
import { db } from "@/app/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ImageSlider = () => {
	const [images, setImages] = useState<string[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)

	useEffect(() => {
		const fetchImages = async () => {
			const querySnapshot = await getDocs(collection(db, "images"))
			const imgUrls = querySnapshot.docs.map((doc) => doc.data().url)
			setImages(imgUrls)
		}

		fetchImages()
	}, [])

	useEffect(() => {
		const slideInterval = setInterval(() => {
			setCurrentIndex(
				(prevIndex) => (prevIndex + 1) % Math.ceil(images.length / 4)
			)
		}, 3000)

		return () => clearInterval(slideInterval)
	}, [images.length])

	const renderGrid = (index: number) => {
		const startIndex = index * 4
		const endIndex = startIndex + 4
		return images.slice(startIndex, endIndex).map((url, idx) => (
			<div key={idx} className="w-full">
				<img
					src={url}
					alt={`Slide image ${startIndex + idx}`}
					className="w-full h-64 object-cover border-4 border-white rounded-[1rem] transition-transform duration-300 hover:scale-105"
				/>
			</div>
		))
	}

	const goToPrevious = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0
				? Math.ceil(images.length / 4) - 1
				: prevIndex - 1
		)
	}

	const goToNext = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex + 1) % Math.ceil(images.length / 4)
		)
	}

	return (
		<div className="w-full bg-blue-50 py-10 mt-[25px] flex items-center justify-center relative " >
			<div className="relative w-full max-w-[90vw] mx-auto">
				<div className="overflow-hidden">
					<div
						className="flex transition-transform duration-700 ease-in-out"
						style={{
							transform: `translateX(-${currentIndex * 100}%)`,
						}}
					>
						{[...Array(Math.ceil(images.length / 4))].map(
							(_, idx) => (
								<div key={idx} className="min-w-full">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{renderGrid(idx)}
									</div>
								</div>
							)
						)}
					</div>
				</div>

				{/* Navigation Arrows */}
				<button
					onClick={goToPrevious}
					className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
				>
					<ChevronLeft className="w-6 h-6 text-gray-800" />
				</button>
				<button
					onClick={goToNext}
					className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
				>
					<ChevronRight className="w-6 h-6 text-gray-800" />
				</button>
			</div>
		</div>
	)
}

export default ImageSlider
