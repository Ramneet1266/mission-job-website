"use client"
import React, { useRef } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { db, collection, getDocs } from "../../lib/firebase"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Category {
  id: string
  title: string
  information?: string
  createdAt?: string
}

interface Posting {
  city: string
  jobCompany: string
  tags: string[]
}

// Firebase data fetching function for SWR
const fetchCategoriesData = async () => {
  const categoriesSnapshot = await getDocs(collection(db, "categories"))
  const categoriesData: Category[] = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[]

  const citiesSet = new Set<string>()
  const companiesSet = new Set<string>()
  const tagsSet = new Set<string>()

  // Fetch postings for cities, companies, and tags
  for (const doc of categoriesSnapshot.docs) {
    const postingsSnapshot = await getDocs(
      collection(db, "categories", doc.id, "posting")
    )
    postingsSnapshot.docs.forEach((postingDoc) => {
      const postingData = postingDoc.data() as Posting
      if (postingData.city) citiesSet.add(postingData.city)
      if (postingData.jobCompany)
        companiesSet.add(postingData.jobCompany)
      if (postingData.tags && Array.isArray(postingData.tags)) {
        postingData.tags.forEach((tag) => tagsSet.add(tag))
      }
    })
  }

  return {
    categories: categoriesData,
    cities: Array.from(citiesSet),
    companies: Array.from(companiesSet),
    tags: Array.from(tagsSet),
  }
}

export default function JobSearchPage() {
  const router = useRouter()

  // Use SWR to fetch data
  const { data, error, isLoading } = useSWR("jobSearchData", fetchCategoriesData)

  const navigateWithFilter = (filter: string, value: string) => {
    if (!value) return
    let filterData: any = { [filter]: value }
    if (filter === "tags") {
      filterData = { tags: [value] }
    }
    localStorage.setItem("jobFilter", JSON.stringify(filterData))
    const queryParam = encodeURIComponent(value)
    router.push(`/findjobs?${filter}=${queryParam}`)
  }

  const Section = ({
    title,
    items,
    filter,
    loadingText,
    emptyText,
    buttonLabel,
  }: {
    title: string
    items: string[]
    filter: string
    loadingText: string
    emptyText: string
    buttonLabel?: (val: string) => string
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
      if (!scrollRef.current) return
      const scrollAmount = 250
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }

    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-blue-900 text-center">
          {title}
        </h2>
        {isLoading ? (
          <p className="text-gray-500 italic text-center">{loadingText}</p>
        ) : error || !items.length ? (
          <p className="text-red-500 text-center">{emptyText}</p>
        ) : (
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-blue-600 shadow-md rounded-full p-1 z-10 hover:bg-blue-100"
            >
              <ChevronLeft size={20} />
            </button>
            <div
              ref={scrollRef}
              className="flex overflow-x-auto space-x-2 scrollbar-hide px-8"
            >
              {items.map((item, idx) => (
                <button
                  key={idx}
                  className="flex-shrink-0 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-800 font-medium rounded-lg px-3 py-1 text-sm shadow-sm transition-all duration-200"
                  onClick={() => navigateWithFilter(filter, item)}
                >
                  {buttonLabel ? buttonLabel(item) : item}
                </button>
              ))}
            </div>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-blue-600 shadow-md rounded-full p-1 z-10 hover:bg-blue-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </section>
    )
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="bg-gradient-to-b from-white via-blue-50 to-white pt-4 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <Section
          title="Jobs by Categories"
          items={data?.categories.map((c) => c.title) || []}
          filter="category"
          loadingText=""
          emptyText="No categories found."
        />
        <Section
          title="Jobs by Locations"
          items={data?.cities || []}
          filter="city"
          loadingText=""
          emptyText="No locations found."
          buttonLabel={(city) => `Teacher jobs in ${city}`}
        />
        <Section
          title="Jobs by Sub Categories"
          items={data?.tags || []}
          filter="tags"
          loadingText=""
          emptyText="No tags found."
          buttonLabel={(tag) => `${tag}`}
        />
      </div>
    </div>
  )
}
