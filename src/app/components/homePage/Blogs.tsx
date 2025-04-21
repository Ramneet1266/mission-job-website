"use client"

import { useState, useEffect, useMemo, Fragment, useRef } from "react"
import useSWR from "swr"
import { collection, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { db } from "@/app/lib/firebase"
import { FaRegClock } from "react-icons/fa"
import { Dialog, Transition } from "@headlessui/react"

type NewsItem = {
  id: string
  title: string
  description: string
  image: string
  link: string
  date?: string
  searchCount?: number
}

// Fetcher function for SWR
const fetchNews = async () => {
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
      image: data.url || "https://source.unsplash.com/400x300/?news",
      link: "#",
      date: date,
      searchCount: data.searchCount || 0,
    })
  })
  return news
}

export default function News() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { data: newsData, error, isLoading } = useSWR("newsData", fetchNews)

  const router = useRouter()

  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return

    const container = sliderRef.current
    const card = container.querySelector("div.card") as HTMLElement
    if (!card) return

    const scrollAmount = card.offsetWidth * 3 + 24 // Adjusted gap (6 * 4 = 24px for gap-6)
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
    setIsPaused(true) // Pause auto-scroll on manual interaction
    setTimeout(() => setIsPaused(false), 5000) // Resume after 5 seconds
  }

  const autoScroll = () => {
    if (!sliderRef.current || isPaused) return

    const container = sliderRef.current
    const card = container.querySelector("div.card") as HTMLElement
    if (!card) return

    const scrollAmount = card.offsetWidth * 3 + 24 // Adjusted gap
    const maxScrollLeft = container.scrollWidth - container.clientWidth

    if (container.scrollLeft + scrollAmount >= maxScrollLeft) {
      container.scrollTo({ left: 0, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (!sliderRef.current || !newsData || newsData.length === 0) return

    intervalRef.current = setInterval(autoScroll, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [newsData?.length, isPaused])

  // Check if data is undefined
  if (isLoading || !newsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-700 text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">Error loading news</div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
          Latest News
        </h1>

        {/* Navigation Buttons */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            onClick={() => scrollSlider("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10"
          >
            ←
          </button>
          <button
            onClick={() => scrollSlider("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10"
          >
            →
          </button>

          {/* News Cards Container */}
          <div
            ref={sliderRef}
            className="flex overflow-x-auto gap-6 scroll-smooth no-scrollbar pb-4"
          >
            {newsData.map((news) => (
              <div
                key={news.id}
                className="card flex-shrink-0 w-full sm:w-[300px] md:w-[350px] lg:w-[400px] bg-white shadow-md rounded-xl overflow-hidden group transition hover:shadow-xl"
              >
                <div className="relative h-56 w-full">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setSelectedNews(news)}
                    className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all"
                  >
                    Read More
                  </button>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-blue-800 line-clamp-2 mb-1">
                    {news.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {news.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <FaRegClock className="mr-1" />
                    {news.date || "Unknown"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
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
                    <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
                      {selectedNews?.title}
                    </Dialog.Title>
                    <img
                      src={selectedNews?.image}
                      alt="modal"
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                    <p className="text-gray-600 text-sm mb-6">
                      {selectedNews?.description}
                    </p>
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
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
    </div>
  )
}
