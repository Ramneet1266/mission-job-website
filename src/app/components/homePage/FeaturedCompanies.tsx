"use client"
import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
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

export default function JobSearchPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [companies, setCompanies] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
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
                const tagsSet = new Set<string>()

                for (const doc of categoriesSnapshot.docs) {
                    const postingsSnapshot = await getDocs(
                        collection(db, "categories", doc.id, "posting")
                    )
                    postingsSnapshot.docs.forEach((postingDoc) => {
                        const postingData = postingDoc.data() as Posting
                        if (postingData.city) citiesSet.add(postingData.city)
                        if (postingData.jobCompany) companiesSet.add(postingData.jobCompany)
                        if (postingData.tags && Array.isArray(postingData.tags)) {
                            postingData.tags.forEach(tag => tagsSet.add(tag))
                        }
                    })
                }

                setCities(Array.from(citiesSet))
                setCompanies(Array.from(companiesSet))
                setTags(Array.from(tagsSet))

                if (categoriesData.length === 0) setError("No categories found.")
                if (citiesSet.size === 0 && companiesSet.size === 0 && tagsSet.size === 0) {
                    setError((prev) =>
                        prev ? `${prev} No postings found.` : "No postings found."
                    )
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
                <h2 className="text-lg font-semibold text-blue-900 text-center">{title}</h2>
                {loading ? (
                    <p className="text-gray-500 italic text-center">{loadingText}</p>
                ) : error && items.length === 0 ? (
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

    return (
        <div className="bg-gradient-to-b from-white via-blue-50 to-white pt-8 px-6">
            <div className="max-w-6xl mx-auto space-y-12">
                <Section
                    title="Jobs by Categories"
                    items={categories.map((c) => c.title)}
                    filter="category"
                    loadingText=""
                    emptyText=""
                />
                <Section
                    title="Jobs by Locations"
                    items={cities}
                    filter="city"
                    loadingText=""
                    emptyText=""
                    buttonLabel={(city) => `Teacher jobs in ${city}`}
                />
                <Section
                    title="Jobs by Sub Categories"
                    items={tags}
                    filter="tags"
                    loadingText=""
                    emptyText=""
                    buttonLabel={(tag) => `${tag}`}
                />
            </div>
        </div>
    )
}
