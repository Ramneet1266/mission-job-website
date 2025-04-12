"use client"
import React, { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { db, collection, getDocs } from "../lib/firebase"

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

export default function JobFilterBar() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: "All",
    tags: [] as string[],
    city: "All",
    state: "All",
    salary: "All",
    company: "All",
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableStates, setAvailableStates] = useState<string[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data and check for navigation filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from Firestore...")
        setLoading(true)
        setError(null)

        const categoriesSnapshot = await getDocs(collection(db, "categories"))
        const categoriesData: Category[] = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        }))
        setCategories(categoriesData)

        const allJobs: Job[] = []
        const citiesSet = new Set<string>()
        const statesSet = new Set<string>()
        const companiesSet = new Set<string>()
        for (const category of categoriesSnapshot.docs) {
          const postingsSnapshot = await getDocs(
            collection(db, "categories", category.id, "posting")
          )
          postingsSnapshot.docs.forEach((doc) => {
            const data = doc.data()
            allJobs.push({
              id: doc.id,
              jobTitle: data.jobTitle,
              jobCompany: data.jobCompany,
              city: data.city,
              state: data.state,
              salary: data.salary,
              tags: data.tags || [],
              createdAt: data.createdAt,
              imageUrl: data.imageUrl,
              jobDescription: data.jobDescription,
              address: data.address,
              category: data.category,
              contactEmail: data.contactEmail,
              contactNumber: data.contactNumber,
              postalCode: data.postalCode,
            })
            if (data.city) citiesSet.add(data.city)
            if (data.state) statesSet.add(data.state)
            if (data.jobCompany) companiesSet.add(data.jobCompany)
          })
        }
        setJobs(allJobs)
        setSelectedJob(allJobs[0] || null)
        setAvailableCities(Array.from(citiesSet))
        setAvailableStates(Array.from(statesSet))
        setAvailableCompanies(Array.from(companiesSet))

        // Prepopulate filters from navigation
        const savedFilter = localStorage.getItem("jobFilter")
        if (savedFilter) {
          const parsedFilter = JSON.parse(savedFilter)
          setFilters((prev) => ({
            ...prev,
            category: parsedFilter.category || "All",
            city: parsedFilter.city || "All",
            company: parsedFilter.company || "All",
          }))
          localStorage.removeItem("jobFilter") // Clear after use
        }

        // Set initial tags
        const allTags = Array.from(new Set(allJobs.flatMap((job) => job.tags)))
        setAvailableTags(allTags)

        if (categoriesData.length === 0) setError("No categories found.")
        if (allJobs.length === 0) setError((prev) => prev ? `${prev} No jobs found.` : "No jobs found.")
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load jobs.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Update tags when category changes
  useEffect(() => {
    const filteredJobs = filters.category === "All" ? jobs : jobs.filter((job) => job.category === filters.category)
    const tags = Array.from(new Set(filteredJobs.flatMap((job) => job.tags)))
    setAvailableTags(tags)
    setFilters((prev) => ({ ...prev, tags: [] })) // Reset tags
  }, [filters.category, jobs])

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = filters.category === "All" || job.category === filters.category
    const matchesTags = filters.tags.length === 0 || filters.tags.every((tag) => job.tags.includes(tag))
    const matchesCity = filters.city === "All" || job.city === filters.city
    const matchesState = filters.state === "All" || job.state === filters.state
    const matchesSalary = filters.salary === "All" || (
      filters.salary === "Rs 0 - 20000" ? parseInt(job.salary.replace("Rs ", "")) <= 20000 :
      filters.salary === "Rs 20000 - 40000" ? parseInt(job.salary.replace("Rs ", "")) > 20000 && parseInt(job.salary.replace("Rs ", "")) <= 40000 :
      parseInt(job.salary.replace("Rs ", "")) > 40000
    )
    const matchesCompany = filters.company === "All" || job.jobCompany === filters.company
    return matchesCategory && matchesTags && matchesCity && matchesState && matchesSalary && matchesCompany
  })

  const toggleFilterOption = (filter: string, value: string) => {
    if (filter === "tags") {
      setFilters((prev) => ({
        ...prev,
        tags: prev.tags.includes(value) ? prev.tags.filter((t) => t !== value) : [...prev.tags, value],
      }))
    } else {
      setFilters((prev) => ({ ...prev, [filter]: value }))
      setActiveFilter(null)
    }
  }

  return (
    <div className="mt-24 h-[calc(100vh-6rem)]">
      {/* FILTER BAR */}
      <div className="border-b py-4 flex justify-center bg-white z-10 sticky top-0 shadow-sm">
        <div className="flex gap-2 flex-wrap justify-center">
          {[
            { label: "Categories", key: "category", options: ["All", ...categories.map((c) => c.title)] },
            { label: "Tags", key: "tags", options: availableTags },
            { label: "Cities", key: "city", options: ["All", ...availableCities] },
            { label: "States", key: "state", options: ["All", ...availableStates] },
            { label: "Salary", key: "salary", options: ["All", "Rs 0 - 20000", "Rs 20000 - 40000", "Rs 40000+"] },
            { label: "Companies", key: "company", options: ["All", ...availableCompanies] },
          ].map((filter) => (
            <div key={filter.label} className="relative">
              <button
                onClick={() => setActiveFilter(activeFilter === filter.label ? null : filter.label)}
                className={`flex items-center gap-1 border px-4 py-2 rounded-full transition-colors ${
                  activeFilter === filter.label ? "border-blue-500 text-blue-600 bg-blue-100" : "border-gray-300 text-gray-700 bg-white"
                } hover:bg-blue-50`}
              >
                {filter.label}
                <ChevronDown size={16} />
              </button>
              {activeFilter === filter.label && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-20">
                  {filter.options.map((option) => (
                    <div
                      key={option}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        filter.key === "tags"
                          ? filters.tags.includes(option) ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                          : filters[filter.key as keyof typeof filters] === option ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
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

      {/* MAIN CONTENT */}
      <div className="flex h-full">
        {/* LEFT: JOB LIST */}
        <div className="w-1/2 border-r overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <p className="text-center text-gray-600">Loading jobs...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-center text-gray-600">No jobs match your filters.</p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`p-4 rounded-md border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  selectedJob?.id === job.id ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <h3 className="text-lg font-semibold text-blue-800">{job.jobTitle}</h3>
                <p className="text-sm text-gray-600">{job.jobCompany}</p>
                <p className="text-sm mt-1 text-gray-700">{job.salary}</p>
                <p className="text-sm text-gray-500">{`${job.city}, ${job.state}`}</p>
                <div className="flex gap-2 mt-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(job.createdAt)}</p>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: JOB DETAILS */}
        <div className="w-1/2 overflow-y-auto p-8 bg-white">
          {selectedJob && (
            <>
              <img
                src={selectedJob.imageUrl}
                alt="Job Cover"
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h2 className="text-2xl font-bold mb-1 text-blue-800">{selectedJob.jobTitle}</h2>
              <p className="text-gray-700 mb-4 font-medium">{selectedJob.jobCompany}</p>
              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span>{selectedJob.salary}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{`${selectedJob.city}, ${selectedJob.state}`}</p>
              <p className="text-sm text-gray-500 mb-2">{selectedJob.address}</p>
              <p className="text-sm mb-4">
                <span className="font-medium text-gray-700">Category:</span> {selectedJob.category}
              </p>
              <p className="text-sm mb-4">
                <span className="font-medium text-gray-700">Contact:</span> {selectedJob.contactEmail} | {selectedJob.contactNumber}
              </p>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Job Description</h3>
                <p className="text-sm text-gray-700">{selectedJob.jobDescription}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Qualifications</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Bachelor’s degree in related field (assumed).</li>
                  <li>Experience in relevant industry (assumed).</li>
                </ul>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Preferred Skills</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {selectedJob.tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              </div>
              <a href="#" className="text-blue-600 underline text-sm mb-4 block">
                Login to check your skill match score
              </a>
              <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                Quick Apply
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}