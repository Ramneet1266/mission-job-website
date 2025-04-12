"use client"
import React, { useEffect, useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { db, collection, getDocs } from "../../lib/firebase"

interface Category {
  id: string
  title: string
  information?: string
  createdAt?: string
}

interface Posting {
  city: string
  jobCompany: string
}

export default function JobSearchPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const citiesRef = useRef<HTMLDivElement>(null)
  const schoolsRef = useRef<HTMLDivElement>(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...")
        setLoading(true)
        setError(null)

        const categoriesSnapshot = await getDocs(collection(db, "categories"))
        const categoriesData: Category[] = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
        setCategories(categoriesData)

        const citiesSet = new Set<string>()
        const companiesSet = new Set<string>()
        for (const doc of categoriesSnapshot.docs) {
          const postingsSnapshot = await getDocs(
            collection(db, "categories", doc.id, "posting")
          )
          postingsSnapshot.docs.forEach((postingDoc) => {
            const postingData = postingDoc.data() as Posting
            if (postingData.city) citiesSet.add(postingData.city)
            if (postingData.jobCompany) companiesSet.add(postingData.jobCompany)
          })
        }
        setCities(Array.from(citiesSet))
        setCompanies(Array.from(companiesSet))

        if (categoriesData.length === 0) setError("No categories found.")
        if (citiesSet.size === 0 && companiesSet.size === 0) {
          setError((prev) => prev ? `${prev} No postings found.` : "No postings found.")
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      scrollNext(citiesRef)
      scrollNext(schoolsRef)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const scrollNext = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const el = ref.current
      const scrollWidth = el.scrollWidth
      const scrollLeft = el.scrollLeft
      const clientWidth = el.clientWidth
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: 200, behavior: "smooth" })
      }
    }
  }

  const scrollPrev = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  // Navigate with filter
  const navigateWithFilter = (filter: string, value: string) => {
    localStorage.setItem("jobFilter", JSON.stringify({ [filter]: value }))
    router.push("/findjobs")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900">Explore Jobs in Education</h1>
          <p className="mt-1 text-gray-600 text-sm">
            From classrooms to curriculum — find your next step in education
          </p>
        </div>

        {/* CATEGORIES */}
        <section className="bg-white border border-blue-100 p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Categories</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading categories...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-600">No categories available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="group bg-blue-50 hover:bg-blue-100 transition rounded-xl p-3 flex flex-col items-center justify-center shadow-sm cursor-pointer"
                  onClick={() => navigateWithFilter("category", cat.title)}
                >
                  <span className="text-xl mb-1 transition-transform group-hover:scale-110">📚</span>
                  <p className="text-center font-medium text-blue-900 text-xs">{cat.title}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CITIES */}
        <section className="relative bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-2xl shadow border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Top Cities</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading cities...</p>
          ) : error && cities.length === 0 ? (
            <p className="text-center text-red-600">No cities available.</p>
          ) : (
            <div className="relative">
              <div ref={citiesRef} className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar pr-6">
                {cities.map((city, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-40 bg-white rounded-lg p-3 text-center shadow text-blue-800 text-sm font-medium hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => navigateWithFilter("city", city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2">
                <button
                  onClick={() => scrollPrev(citiesRef)}
                  className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
                >
                  <ChevronLeft className="text-blue-700 h-5 w-5" />
                </button>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <button
                  onClick={() => scrollNext(citiesRef)}
                  className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
                >
                  <ChevronRight className="text-blue-700 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* SCHOOLS */}
        <section className="relative bg-gradient-to-r from-blue-200 to-blue-300 p-6 rounded-2xl shadow border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Schools</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading companies...</p>
          ) : error && companies.length === 0 ? (
            <p className="text-center text-red-600">No companies available.</p>
          ) : (
            <div className="relative">
              <div ref={schoolsRef} className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar pr-6">
                {companies.map((company, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-56 bg-white rounded-lg p-4 text-center shadow text-blue-900 text-sm font-medium hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => navigateWithFilter("company", company)}
                  >
                    {company}
                  </div>
                ))}
              </div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2">
                <button
                  onClick={() => scrollPrev(schoolsRef)}
                  className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
                >
                  <ChevronLeft className="text-blue-800 h-5 w-5" />
                </button>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <button
                  onClick={() => scrollNext(schoolsRef)}
                  className="bg-white p-1.5 rounded-full shadow hover:bg-blue-100"
                >
                  <ChevronRight className="text-blue-800 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}