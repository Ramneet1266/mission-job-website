"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ref, getDownloadURL } from "firebase/storage"
import { collection, getDocs } from "firebase/firestore"
import { storage, db } from "../lib/firebase"
import useSWR from "swr"

// Utility function to fetch data from Firestore
const fetchMediaData = async () => {
  try {
    const items: GalleryItem[] = []

    // Fetch images from Firestore 'images' collection
    const imagesSnapshot = await getDocs(collection(db, "images"))
    imagesSnapshot.forEach((doc) => {
      const data = doc.data()
      const url =
        data.url || "https://via.placeholder.com/300x200"
      const alt = data.title || doc.id
      const title = data.title || "Untitled"
      const information = data.information || "No description"

      items.push({
        id: items.length + 1,
        type: "image",
        src: url,
        alt,
        title,
        information,
      })
    })

    // Fetch videos from Firestore 'videos' collection and Storage
    const videosSnapshot = await getDocs(collection(db, "videos"))
    for (const doc of videosSnapshot.docs) {
      const data = doc.data()
      const storagePath =
        data.storagePath || data.url || `videos/${doc.id}.mp4` // Fallback path
      const videoRef = ref(storage, storagePath)
      const url = await getDownloadURL(videoRef).catch((error) => {
        console.error("Failed to get video URL:", error)
        return "https://via.placeholder.com/300x200" // Fallback URL on error
      })
      const alt = data.title || doc.id
      const title = data.title || "Untitled"
      const information = data.information || "No description"

      items.push({
        id: items.length + 1,
        type: "video",
        src: url,
        alt,
        title,
        information,
      })
    }

    return items
  } catch (error) {
    console.error("Error fetching media:", error)
    throw error
  }
}

type GalleryItem = {
  id: number
  type: "image" | "video"
  src: string
  alt: string
  title: string
  information: string
}

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [visibleImages, setVisibleImages] = useState(3) // Initial 3 images
  const [visibleVideos, setVisibleVideos] = useState(3) // Initial 3 videos

  // Fetch media data with SWR caching
  const { data, error } = useSWR("gallery-items", fetchMediaData)

  // Handle loading and error states
  useEffect(() => {
    if (data) setLoading(false)
  }, [data])

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  }

  const images = data?.filter((item) => item.type === "image") || []
  const videos = data?.filter((item) => item.type === "video") || []

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-700 text-lg">Loading...</div>
      </div>
    )
  }

  const loadMoreImages = () => setVisibleImages((prev) => prev + 3)
  const loadMoreVideos = () => setVisibleVideos((prev) => prev + 3)

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {images.slice(0, visibleImages).map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative w-full h-56">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                      {item.title}
                    </h2>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {images.length > 3 && visibleImages < images.length && (
            <div className="text-center mt-4">
              <button
                onClick={loadMoreImages}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Load More
              </button>
            </div>
          )}
        </section>

        {/* Videos Section */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Videos
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {videos.slice(0, visibleVideos).map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative w-full h-56 flex items-center justify-center">
                    <video
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      controls
                    >
                      <source src={item.src} type="video/mp4" />
                      <source src={item.src} type="video/webm" />
                      <source src={item.src} type="video/ogg" />
                      <p className="text-red-500 text-center">
                        Video failed to load. Check console for details.
                      </p>
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
                      {item.title}
                    </h2>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {videos.length > 3 && visibleVideos < videos.length && (
            <div className="text-center mt-4">
              <button
                onClick={loadMoreVideos}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Load More
              </button>
            </div>
          )}
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
                    <source src={selectedItem.src} type="video/webm" />
                    <source src={selectedItem.src} type="video/ogg" />
                    <p className="text-red-500 text-center">
                      Video failed to load. Check console for details.
                    </p>
                  </video>
                )}
                <h2 className="text-xl font-semibold text-blue-800 mt-4">
                  {selectedItem.title}
                </h2>
                <p className="text-gray-600 text-sm mt-2">
                  {selectedItem.information}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
