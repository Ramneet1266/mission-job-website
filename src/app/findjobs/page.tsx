"use client"

import React, { useEffect, useState, Component, ReactNode } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronDown, X, ArrowLeft } from "lucide-react"
import { db, collection, getDocs, auth, onAuthStateChanged } from "../lib/firebase"
import { User } from "firebase/auth"
import useSWR from "swr"

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1 className="text-center text-red-600">
          Something went wrong. Please refresh.
        </h1>
      )
    }
    return this.props.children
  }
}

interface Category {
  id: string
  title: string
}

interface Job {
  id: string
  jobTitle: string
  jobCompany: string
  city: string
  state: string
  salary: string
  tags: string[]
  createdAt: string
  imageUrl: string
  jobDescription: string
  address: string
  category: string
  contactEmail: string
  contactNumber: string
  postalCode: string
}

const formatTimeAgo = (createdAt: string) => {
  const now = new Date()
  const posted = new Date(createdAt)
  const diffMs = now.getTime() - posted.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 24) return `Posted ${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  return `Posted ${diffDays} days ago`
}

// Fetcher function for SWR
const fetchJobsAndCategories = async () => {
  const categoriesSnapshot = await getDocs(collection(db, "categories"))
  const categoriesData: Category[] = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title || "Untitled",
  }))

  const allJobs: Job[] = []
  const citiesSet = new Set<string>()
  const statesSet = new Set<string>()
  const companiesSet = new Set<string>()
  const tagsSet = new Set<string>()

  for (const category of categoriesSnapshot.docs) {
    const postingsSnapshot = await getDocs(
      collection(db, "categories", category.id, "posting")
    )
    postingsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      allJobs.push({
        id: doc.id,
        jobTitle: data.jobTitle || "Untitled Job",
        jobCompany: data.jobCompany || "Unknown Company",
        city: data.city || "",
        state: data.state || "",
        salary: data.salary || "Not specified",
        tags: data.tags || [],
        createdAt: data.createdAt || new Date().toISOString(),
        imageUrl: data.imageUrl || "/placeholder.jpg",
        jobDescription: data.jobDescription || "No description available",
        address: data.address || "",
        category: data.category || "Uncategorized",
        contactEmail: data.contactEmail || "",
        contactNumber: data.contactNumber || "",
        postalCode: data.postalCode || "",
      })
      if (data.city) citiesSet.add(data.city)
      if (data.state) statesSet.add(data.state)
      if (data.jobCompany) companiesSet.add(data.jobCompany)
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => tagsSet.add(tag))
      }
    })
  }

  return {
    categories: categoriesData,
    jobs: allJobs,
    cities: Array.from(citiesSet),
    states: Array.from(statesSet),
    companies: Array.from(companiesSet),
    tags: Array.from(tagsSet),
  }
}

export default function JobFilterBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    category: string
    tags: string[]
    city: string
    state: string
    salary: string
    company: string
  }>({
    category: "All",
    tags: [],
    city: "All",
    state: "All",
    salary: "All",
    company: "All",
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableStates, setAvailableStates] = useState<string[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)

  // Use SWR to fetch and cache data
  const { data, error, isLoading } = useSWR("jobsAndCategories", fetchJobsAndCategories, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  // Update state with SWR data
  useEffect(() => {
    if (data) {
      setCategories(data.categories)
      setJobs(data.jobs)
      setAvailableCities(data.cities)
      setAvailableStates(data.states)
      setAvailableCompanies(data.companies)

      const tagFromUrl = searchParams.get("tags")
      const allTags = [...data.tags] // Create a new array to avoid mutating the original
      if (tagFromUrl && !allTags.includes(decodeURIComponent(tagFromUrl))) {
        allTags.push(decodeURIComponent(tagFromUrl))
      }
      setAvailableTags(allTags)
    }
  }, [data, searchParams])

  // Clean up Google Translate hash
  useEffect(() => {
    if (window.location.hash.includes("googtrans")) {
      router.replace(`/findjobs?${searchParams.toString()}`, {
        scroll: false,
      })
      console.log("Removed Google Translate hash on findjobs")
    }
  }, [router, searchParams])

  // Initialize filters from URL parameters with validation
  useEffect(() => {
    const category = searchParams.get("category") || "All"
    const city = searchParams.get("city") || "All"
    const company = searchParams.get("company") || "All"
    const tag = searchParams.get("tags") || null

    setFilters((prev) => ({
      ...prev,
      category:
        category && decodeURIComponent(category) !== "null"
          ? decodeURIComponent(category)
          : "All",
      city:
        city && decodeURIComponent(city) !== "null"
          ? decodeURIComponent(city)
          : "All",
      company:
        company && decodeURIComponent(company) !== "null"
          ? decodeURIComponent(company)
          : "All",
      tags:
        tag && decodeURIComponent(tag) !== "null"
          ? [decodeURIComponent(tag)]
          : [],
    }))
  }, [searchParams])

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "Auth state changed:",
        currentUser ? "Signed in" : "Not signed in"
      )
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Handle removing a search input
  const handleRemoveInput = (key: keyof typeof searchQuery) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete(key)
    router.replace(`/findjobs?${newParams.toString()}`, {
      scroll: false,
    })
  }

  // Handle removing a filter
  const handleRemoveFilter = (key: keyof typeof filters, value?: string) => {
    if (key === "tags" && value) {
      setFilters((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag !== value),
      }))
      const newParams = new URLSearchParams(searchParams.toString())
      const remainingTags = filters.tags.filter((tag) => tag !== value)
      if (remainingTags.length > 0) {
        newParams.set("tags", encodeURIComponent(remainingTags[0]))
      } else {
        newParams.delete("tags")
      }
      router.replace(`/findjobs?${newParams.toString()}`, {
        scroll: false,
      })
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: key === "tags" ? [] : "All",
      }))
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete(key)
      router.replace(`/findjobs?${newParams.toString()}`, {
        scroll: false,
      })
    }
  }

  // Navigate to homepage
  const handleBackToHome = () => {
    router.push("/")
  }

  // Update tags when category changes
  useEffect(() => {
    const filteredJobs =
      filters.category === "All"
        ? jobs
        : jobs.filter((job) => job.category === filters.category)
    const tagsFromJobs = Array.from(
      new Set(filteredJobs.flatMap((job) => job.tags))
    )
    const tagFromUrl = searchParams.get("tags")
    const tags = tagFromUrl
      ? Array.from(new Set([...tagsFromJobs, decodeURIComponent(tagFromUrl)]))
      : tagsFromJobs
    setAvailableTags(tags)
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tags.includes(tag) || tag === tagFromUrl),
    }))
  }, [filters.category, jobs, searchParams])

  // Filter jobs, including searchQuery from URL
  const searchQuery = {
    query: searchParams.get("query") || "",
    location: searchParams.get("location") || "",
    experience: searchParams.get("experience") || "Experience",
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory =
      filters.category === "All" || job.category === filters.category
    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.every((tag) => job.tags.includes(tag))
    const matchesCity = filters.city === "All" || job.city === filters.city
    const matchesState = filters.state === "All" || job.state === filters.state
    const matchesSalary =
      filters.salary === "All" ||
      (filters.salary === "Rs 0 - 20000"
        ? Number.isNaN(parseInt(job.salary.replace("Rs ", "")))
          ? false
          : parseInt(job.salary.replace("Rs ", "")) <= 20000
        : filters.salary === "Rs 20000 - 40000"
        ? Number.isNaN(parseInt(job.salary.replace("Rs ", "")))
          ? false
          : parseInt(job.salary.replace("Rs ", "")) > 20000 &&
            parseInt(job.salary.replace("Rs ", "")) <= 40000
        : Number.isNaN(parseInt(job.salary.replace("Rs ", "")))
        ? false
        : parseInt(job.salary.replace("Rs ", "")) > 40000)
    const matchesCompany =
      filters.company === "All" || job.jobCompany === filters.company

    const query = searchQuery.query.toLowerCase().trim()
    const matchesQuery =
      query === "" ||
      job.category.toLowerCase() === query ||
      job.tags.some((tag) => tag.toLowerCase() === query) ||
      job.jobTitle.toLowerCase().split(" ").includes(query)

    const location = searchQuery.location.toLowerCase().trim()
    const matchesLocation =
      location === "" ||
      job.city.toLowerCase().includes(location) ||
      job.state.toLowerCase().includes(location)

    const experience = searchQuery.experience.toLowerCase().trim()
    const matchesExperience =
      experience === "experience" ||
      job.tags.some((tag) => tag.toLowerCase().includes(experience))

    return (
      matchesCategory &&
      matchesTags &&
      matchesCity &&
      matchesState &&
      matchesSalary &&
      matchesCompany &&
      matchesQuery &&
      matchesLocation &&
      matchesExperience
    )
  })

  // Auto-select first job only if no job is selected or selected job is invalid
  useEffect(() => {
    console.log("Checking auto-select. Current selectedJob:", selectedJob?.id)
    if (!filteredJobs.length) {
      console.log("No jobs, setting selectedJob to null")
      setSelectedJob(null)
      return
    }
    if (
      !selectedJob ||
      !filteredJobs.some((job) => job.id === selectedJob.id)
    ) {
      console.log("Auto-selecting first job:", filteredJobs[0]?.id)
      setSelectedJob({ ...filteredJobs[0] })
    } else {
      console.log("Keeping selected job:", selectedJob.id)
    }
  }, [filteredJobs, selectedJob])

  type FilterKey = keyof typeof filters

  const toggleFilterOption = (filter: FilterKey, value: string) => {
    if (filter === "tags") {
      setFilters((prev) => ({
        ...prev,
        tags: prev.tags.includes(value)
          ? prev.tags.filter((t) => t !== value)
          : [...prev.tags, value],
      }))
      const newParams = new URLSearchParams(searchParams.toString())
      const newTags = filters.tags.includes(value)
        ? filters.tags.filter((t) => t !== value)
        : [...filters.tags, value]
      if (newTags.length > 0) {
        newParams.set("tags", encodeURIComponent(newTags[0]))
      } else {
        newParams.delete("tags")
      }
      router.replace(`/findjobs?${newParams.toString()}`, {
        scroll: false,
      })
    } else {
      setFilters((prev) => ({
        ...prev,
        [filter]: value,
      }))
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set(filter, encodeURIComponent(value))
      router.replace(`/findjobs?${newParams.toString()}`, {
        scroll: false,
      })
    }
    setActiveFilter(null)
  }

  const Tag = ({
    label,
    onRemove,
  }: {
    label: string
    onRemove: () => void
  }) => (
    <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full shadow-sm hover:bg-blue-200 transition-all duration-200">
      <span className="text-sm font-medium">{label}</span>
      <button
        onClick={onRemove}
        className="ml-2 text-blue-600 hover:text-blue-900 transition-colors duration-200"
      >
        <X size={14} />
      </button>
    </div>
  )

  const Section = ({
    title,
    content,
  }: {
    title: string
    content: React.ReactNode
  }) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-1">{title}</h3>
      <div className="text-gray-700">{content}</div>
    </div>
  )

  return (
    <ErrorBoundary>
      <div className="mt-28 min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
        {/* FILTER BAR */}
        <div
          className="border-b-2 border-blue-200 py-4 flex justify-center bg-white shadow-sm sticky top-24 z-60 rounded-b-md notranslate"
          translate="no"
        >
          <div className="flex gap-2 flex-wrap justify-center">
            {(
              [
                {
                  label: "Categories",
                  key: "category",
                  options: ["All", ...categories.map((c) => c.title)],
                },
                {
                  label: "Tags",
                  key: "tags",
                  options: availableTags,
                },
                {
                  label: "Cities",
                  key: "city",
                  options: ["All", ...availableCities],
                },
                {
                  label: "States",
                  key: "state",
                  options: ["All", ...availableStates],
                },
                {
                  label: "Salary",
                  key: "salary",
                  options: [
                    "All",
                    "Rs 0 - 20000",
                    "Rs 20000 - 40000",
                    "Rs 40000+",
                  ],
                },
                {
                  label: "Companies",
                  key: "company",
                  options: ["All", ...availableCompanies],
                },
              ] as const
            ).map((filter) => (
              <div key={filter.label} className="relative">
                <button
                  onClick={() =>
                    setActiveFilter(
                      activeFilter === filter.label ? null : filter.label
                    )
                  }
                  className={`flex items-center gap-1 border-2 border-blue-300 px-3 py-1 rounded-full transition-all duration-200 ${
                    activeFilter === filter.label
                      ? "bg-blue-100 text-blue-800"
                      : "bg-white text-gray-800 hover:bg-blue-50"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                >
                  <span className="font-medium text-sm">{filter.label}</span>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>
                {activeFilter === filter.label && (
                  <div className="absolute left-0 top-full mt-2 w-40 bg-white shadow-md rounded-lg border border-gray-200 z-70">
                    {filter.options.map((option) => (
                      <div
                        key={option}
                        className={`px-3 py-1 text-sm cursor-pointer rounded transition-all duration-200 ${
                          filter.key === "tags"
                            ? filters.tags.includes(option)
                              ? "bg-blue-200 text-blue-900"
                              : "hover:bg-gray-100"
                            : filters[filter.key] === option
                            ? "bg-blue-200 text-blue-900"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleFilterOption(filter.key, option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH INPUT TAGS AND FILTER TAGS */}
        <div
          className="py-3 px-5 bg-white shadow-md rounded-lg flex gap-2 flex-wrap max-h-24 overflow-y-auto notranslate"
          translate="no"
        >
          {searchQuery.query && (
            <Tag
              label={`Query: ${searchQuery.query}`}
              onRemove={() => handleRemoveInput("query")}
            />
          )}
          {searchQuery.location && (
            <Tag
              label={`Location: ${searchQuery.location}`}
              onRemove={() => handleRemoveInput("location")}
            />
          )}
          {searchQuery.experience !== "Experience" && (
            <Tag
              label={`Experience: ${searchQuery.experience}`}
              onRemove={() => handleRemoveInput("experience")}
            />
          )}
          {filters.category !== "All" && (
            <Tag
              label={`Category: ${filters.category}`}
              onRemove={() => handleRemoveFilter("category")}
            />
          )}
          {filters.tags.map((tag) => (
            <Tag
              key={tag}
              label={`Tag: ${tag}`}
              onRemove={() => handleRemoveFilter("tags", tag)}
            />
          ))}
          {filters.city !== "All" && (
            <Tag
              label={`City: ${filters.city}`}
              onRemove={() => handleRemoveFilter("city")}
            />
          )}
          {filters.state !== "All" && (
            <Tag
              label={`State: ${filters.state}`}
              onRemove={() => handleRemoveFilter("state")}
            />
          )}
          {filters.salary !== "All" && (
            <Tag
              label={`Salary: ${filters.salary}`}
              onRemove={() => handleRemoveFilter("salary")}
            />
          )}
          {filters.company !== "All" && (
            <Tag
              label={`Company: ${filters.company}`}
              onRemove={() => handleRemoveFilter("company")}
            />
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex h-full">
          {/* LEFT: JOB LIST */}
          <div className="w-1/2 border-r-2 border-blue-200 overflow-y-auto p-4 space-y-3 bg-white rounded-l-md shadow-md">
            {isLoading ? (
              <p className="text-center text-blue-600 font-medium animate-pulse">
                Loading...
              </p>
            ) : error ? (
              <p className="text-center text-red-600 font-semibold">
                Failed to load jobs.
              </p>
            ) : !data || (data.categories.length === 0 && data.jobs.length === 0) ? (
              <p className="text-center text-gray-500 italic">
                No categories or jobs found.
              </p>
            ) : data.categories.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                No categories found.
              </p>
            ) : data.jobs.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                No jobs found.
              </p>
            ) : filteredJobs.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                No jobs match your filters.
              </p>
            ) : (
              filteredJobs.map((job, index) => (
                <button
                  key={`${job.id}-${index}`}
                  onClick={() => setSelectedJob({ ...job })}
                  className="w-full text-left"
                >
                  <div
                    className={`p-3 rounded-md border border-gray-200 bg-white hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-sm ${
                      selectedJob?.id === job.id
                        ? "border-blue-500 bg-blue-100 ring-1 ring-blue-300"
                        : ""
                    }`}
                  >
                    <h3 className="text-md font-semibold text-blue-800 mb-1">
                      {job.jobTitle}
                    </h3>
                    <p className="text-sm text-gray-700 mb-1">
                      {job.jobCompany}
                    </p>
                    <p className="text-sm text-blue-600 mb-1">{job.salary}</p>
                    <p className="text-xs text-gray-500">{`${job.city}, ${job.state}`}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full hover:bg-blue-200 transition-all duration-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(job.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* RIGHT: JOB DETAILS OR REGISTER */}
          <div className="w-1/2 overflow-y-auto p-4 bg-white rounded-r-md shadow-md">
            {selectedJob ? (
              user ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-blue-900">
                    {selectedJob.jobTitle}
                  </h2>
                  <p className="text-md text-gray-700">
                    {selectedJob.jobCompany}
                  </p>
                  <img
                    src={selectedJob.imageUrl}
                    alt="Job Cover"
                    className="rounded-md w-full h-40 object-cover mb-2"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <p className="text-sm text-blue-600">{selectedJob.salary}</p>
                  <Section
                    title="Location"
                    content={`${selectedJob.city}, ${selectedJob.state}`}
                  />
                  <Section
                    title="Address"
                    content={selectedJob.address || "Not specified"}
                  />
                  <Section
                    title="Category"
                    content={selectedJob.category}
                  />
                  <Section
                    title="Contact"
                    content={`${selectedJob.contactEmail} | ${selectedJob.contactNumber}`}
                  />
                  <Section
                    title="Job Description"
                    content={
                      selectedJob.jobDescription || "No description available"
                    }
                  />
                  <Section
                    title="Preferred Skills"
                    content={
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {selectedJob.tags.map((tag, index) => (
                          <li key={index}>{tag}</li>
                        ))}
                      </ul>
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <p className="text-center text-blue-600 text-md font-medium">
                    Please sign in to view job details
                  </p>
                  <button
                    onClick={() => router.push("/signup")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md text-lg font-semibold"
                  >
                    Register Now
                  </button>
                </div>
              )
            ) : (
              <p className="text-center text-blue-600 text-md font-medium">
                Select a job to view details!
              </p>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}