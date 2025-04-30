"use client"

import React, {
	useEffect,
	useState,
	Component,
	ReactNode,
} from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronDown, X, ArrowLeft, Download } from "lucide-react"
import {
	db,
	collection,
	getDocs,
	auth,
	onAuthStateChanged,
} from "../lib/firebase"
import { User } from "firebase/auth"
import useSWR, { SWRConfiguration } from "swr"
import { useTranslation } from "react-i18next"
import { TFunction } from "i18next"

// Error Boundary Component
class ErrorBoundary extends Component<
	{ children: ReactNode; t: TFunction<"translation", undefined> },
	{ hasError: boolean }
> {
	state = { hasError: false }

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	render() {
		if (this.state.hasError) {
			return (
				<h1 className="text-center text-red-700 text-lg">
					{this.props.t("errorBoundary")}
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

interface JobsAndCategories {
	categories: Category[]
	jobs: Job[]
	cities: string[]
	states: string[]
	companies: string[]
	tags: string[]
}

const formatJobDate = (createdAt: string) => {
	try {
		const date = new Date(createdAt)
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	} catch (error) {
		console.error("Error formatting date:", error)
		return "Unknown Date"
	}
}

const fetchJobsAndCategories =
	async (): Promise<JobsAndCategories> => {
		const categoriesSnapshot = await getDocs(
			collection(db, "categories")
		)
		const categoriesData: Category[] = categoriesSnapshot.docs.map(
			(doc) => ({
				id: doc.id,
				title: doc.data().title || "Untitled",
			})
		)

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
					jobTitle: data.jobTitle || "Title Not Specified",
					jobCompany: data.jobCompany || "",
					city: data.city || "",
					state: data.state || "",
					salary: data.salary || "",
					tags: data.tags || [],
					createdAt:
						data.createdAt?.toDate?.().toISOString() ||
						new Date().toISOString(),
					imageUrl: data.imageUrl || "",
					jobDescription: data.jobDescription || "",
					address: data.address || "",
					category: data.category || "",
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
	const { t } = useTranslation()
	const searchParams = useSearchParams()
	const router = useRouter()
	const [jobs, setJobs] = useState<Job[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [selectedJob, setSelectedJob] = useState<Job | null>(null)
	const [activeFilter, setActiveFilter] = useState<string | null>(
		null
	)
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
	const [availableCompanies, setAvailableCompanies] = useState<
		string[]
	>([])
	const [user, setUser] = useState<User | null>(null)
	const [sortOrder, setSortOrder] = useState<
		"default" | "latest" | "oldest"
	>("default")
	const [copied, setCopied] = useState(false)

	const swrConfig: SWRConfiguration<JobsAndCategories> = {
		revalidateOnFocus: false,
		dedupingInterval: 60000,
	}

	const { data, error, isLoading } = useSWR<JobsAndCategories>(
		"jobsAndCategories",
		fetchJobsAndCategories,
		swrConfig
	)

	useEffect(() => {
		if (data) {
			setCategories(data.categories || [])
			setJobs(data.jobs || [])
			setAvailableCities(data.cities || [])
			setAvailableStates(data.states || [])
			setAvailableCompanies(data.companies || [])

			const tagFromUrl = searchParams?.get("tags")
			const allTags = [...(data.tags || [])]
			if (
				tagFromUrl &&
				!allTags.includes(decodeURIComponent(tagFromUrl))
			) {
				allTags.push(decodeURIComponent(tagFromUrl))
			}
			setAvailableTags(allTags)
		}
	}, [data, searchParams])

	useEffect(() => {
		if (window.location.hash.includes("googtrans")) {
			router.replace(`/findjobs?${searchParams?.toString() || ""}`, {
				scroll: false,
			})
			console.log("Removed Google Translate hash on findjobs")
		}
	}, [router, searchParams])

	useEffect(() => {
		const category = searchParams?.get("category") || "All"
		const city = searchParams?.get("city") || "All"
		const company = searchParams?.get("company") || "All"
		const tag = searchParams?.get("tags") || null

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

	const handleRemoveInput = (key: keyof typeof searchQuery) => {
		const newParams = new URLSearchParams(
			searchParams?.toString() || ""
		)
		newParams.delete(key)
		router.replace(`/findjobs?${newParams.toString()}`, {
			scroll: false,
		})
	}

	const handleRemoveFilter = (
		key: keyof typeof filters,
		value?: string
	) => {
		if (key === "tags" && value) {
			setFilters((prev) => ({
				...prev,
				tags: prev.tags.filter((tag) => tag !== value),
			}))
			const newParams = new URLSearchParams(
				searchParams?.toString() || ""
			)
			const remainingTags = filters.tags.filter(
				(tag) => tag !== value
			)
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
			const newParams = new URLSearchParams(
				searchParams?.toString() || ""
			)
			newParams.delete(key)
			router.replace(`/findjobs?${newParams.toString()}`, {
				scroll: false,
			})
		}
	}

	const handleBackToHome = () => {
		router.push("/")
	}

	useEffect(() => {
		const filteredJobs =
			filters.category === "All"
				? jobs
				: jobs.filter((job) => job.category === filters.category)
		const tagsFromJobs = Array.from(
			new Set(filteredJobs.flatMap((job) => job.tags))
		)
		const tagFromUrl = searchParams?.get("tags")
		const tags = tagFromUrl
			? Array.from(
					new Set([...tagsFromJobs, decodeURIComponent(tagFromUrl)])
			  )
			: tagsFromJobs
		setAvailableTags(tags)
		setFilters((prev) => ({
			...prev,
			tags: prev.tags.filter(
				(tag) => tags.includes(tag) || tag === tagFromUrl
			),
		}))
	}, [filters.category, jobs, searchParams])

	const searchQuery = {
		query: searchParams?.get("query") || "",
		location: searchParams?.get("location") || "",
		experience: searchParams?.get("experience") || "Experience",
	}

	const filteredJobs = jobs
		.filter((job) => {
			const matchesCategory =
				filters.category === "All" ||
				job.category === filters.category
			const matchesTags =
				filters.tags.length === 0 ||
				filters.tags.every((tag) => job.tags.includes(tag))
			const matchesCity =
				filters.city === "All" || job.city === filters.city
			const matchesState =
				filters.state === "All" || job.state === filters.state
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
				filters.company === "All" ||
				job.jobCompany === filters.company

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
		.sort((a, b) => {
			const getDate = (createdAt: string | any): number => {
				if (!createdAt) return 0
				if (typeof createdAt === "string") {
					const date = new Date(createdAt)
					return isNaN(date.getTime()) ? 0 : date.getTime()
				}
				if (createdAt?.toDate) {
					return createdAt.toDate().getTime()
				}
				return 0
			}

			const dateA = getDate(a.createdAt)
			const dateB = getDate(b.createdAt)

			if (sortOrder === "latest") {
				return dateB - dateA
			} else if (sortOrder === "oldest") {
				return dateA - dateB
			} else {
				return dateB - dateA
			}
		})

	useEffect(() => {
		if (!filteredJobs.length) {
			setSelectedJob(null)
			return
		}
		if (
			!selectedJob ||
			!filteredJobs.some((job) => job.id === selectedJob.id)
		) {
			setSelectedJob({ ...filteredJobs[0] })
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
			const newParams = new URLSearchParams(
				searchParams?.toString() || ""
			)
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
			const newParams = new URLSearchParams(
				searchParams?.toString() || ""
			)
			newParams.set(filter, encodeURIComponent(value))
			router.replace(`/findjobs?${newParams.toString()}`, {
				scroll: false,
			})
		}
		setActiveFilter(null)
	}

	const handleDownloadImage = (imageUrl: string) => {
		window.open(imageUrl, "_blank")
	}

	const generateJobDescriptionMessage = (job: Job) => {
		const fields = [
			job.jobTitle && `**${t("Job Title")}:** ${job.jobTitle}`,
			job.jobCompany && `**${t("Company")}:** ${job.jobCompany}`,
			job.salary &&
				job.salary.trim() !== "" &&
				`**${t("Salary")}:** ${job.salary}`,
			(job.city || job.state) &&
				`**${t("Location")}:** ${job.city}${
					job.state ? `, ${job.state}` : ""
				}`,
			job.address && `**${t("Address")}:** ${job.address}`,
			job.jobDescription &&
				`**${t("Description")}:** ${job.jobDescription}`,
			job.contactEmail && `**${t("Email")}:** ${job.contactEmail}`,
			job.contactNumber && `**${t("Phone")}:** ${job.contactNumber}`,
			job.imageUrl && `**${t("Image")}:** ${job.imageUrl}`,
			job.tags.length > 0 &&
				`**${t("Skills")}:** ${job.tags.join(", ")}`,
		].filter(Boolean) // Remove empty fields

		return fields.join("\n")
	}

	const handleShare = (
		platform: "whatsapp" | "facebook" | "linkedin" | "instagram",
		job: Job
	) => {
		const message = generateJobDescriptionMessage(job)

		switch (platform) {
			case "whatsapp":
				window.open(
					`https://api.whatsapp.com/send?text=${encodeURIComponent(
						message
					)}`,
					"_blank"
				)
				break
			case "facebook":
				navigator.clipboard.writeText(message).then(() => {
					setCopied(true)
					setTimeout(() => setCopied(false), 2000)
					window.open(
						"https://www.facebook.com/sharer/sharer.php?u=",
						"_blank"
					)
					alert(
						t(
							"Please paste the copied job description into the Facebook post"
						)
					)
				})
				break
			case "linkedin":
				navigator.clipboard.writeText(message).then(() => {
					setCopied(true)
					setTimeout(() => setCopied(false), 2000)
					window.open(
						"https://www.linkedin.com/feed/?shareActive=true",
						"_blank"
					)
					alert(
						t(
							"Please paste the copied job description into the LinkedIn post"
						)
					)
				})
				break
			case "instagram":
				navigator.clipboard.writeText(message).then(() => {
					setCopied(true)
					setTimeout(() => setCopied(false), 2000)
					window.open("https://www.instagram.com", "_blank")
					alert(
						t(
							"Please paste the copied job description into an Instagram post or story"
						)
					)
				})
				break
		}
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
			<h3 className="text-lg font-semibold text-blue-900 mb-1">
				{title}
			</h3>
			<div className="text-gray-700">{content}</div>
		</div>
	)

	return (
		<span>
			<div className="mt-16 min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
				<ErrorBoundary t={t}>
					<div className="max-w-7xl mx-auto">
						<h1 className="text-4xl pt-6 font-extrabold text-center text-blue-900 mb-8">
							{t("Find Jobs")}
						</h1>

						<div
							className="border-b-2 border-blue-200 py-4 bg-white shadow-sm sticky top-24 z-60 rounded-b-md flex items-center justify-between px-6"
							translate="no"
						>
							<div className="flex gap-2">
								{[
									{ label: t("Default"), value: "default" },
									{ label: t("Latest"), value: "latest" },
									{ label: t("Oldest"), value: "oldest" },
								].map((sortOption) => (
									<button
										key={sortOption.value}
										onClick={() =>
											setSortOrder(
												sortOption.value as
													| "default"
													| "latest"
													| "oldest"
											)
										}
										className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 shadow-sm ${
											sortOrder === sortOption.value
												? "bg-blue-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800"
										} focus:outline-none focus:ring-2 focus:ring-blue-400`}
									>
										{sortOption.label}
									</button>
								))}
							</div>

							<div className="flex gap-2 flex-wrap justify-center">
								{(
									[
										{
											label: t("Categories"),
											key: "category",
											options: [
												"All",
												...categories.map((c) => c.title),
											],
										},
										{
											label: t("Tags"),
											key: "tags",
											options: availableTags,
										},
										{
											label: t("Cities"),
											key: "city",
											options: ["All", ...availableCities],
										},
										{
											label: t("States"),
											key: "state",
											options: ["All", ...availableStates],
										},
										{
											label: t("Salary"),
											key: "salary",
											options: [
												"All",
												"Rs 0 - 20000",
												"Rs 20000 - 40000",
												"Rs 40000+",
											],
										},
										{
											label: t("Companies"),
											key: "company",
											options: ["All", ...availableCompanies],
										},
									] as const
								).map((filter) => (
									<div key={filter.label} className="relative">
										<button
											onClick={() =>
												setActiveFilter(
													activeFilter === filter.label
														? null
														: filter.label
												)
											}
											className={`flex items-center gap-1 border-2 border-blue-300 px-3 py-1 rounded-full transition-all duration-200 ${
												activeFilter === filter.label
													? "bg-blue-100 text-blue-800"
													: "bg-white text-gray-800 hover:bg-blue-50"
											} focus:outline-none focus:ring-2 focus:ring-blue-400`}
										>
											<span className="font-medium text-sm">
												{filter.label}
											</span>
											<ChevronDown
												size={16}
												className="text-gray-600"
											/>
										</button>
										{activeFilter === filter.label && (
											<div className="absolute left-0 top-full mt-2 w-40 max-h-48 overflow-y-auto bg-white shadow-md rounded-lg border border-gray-200 z-70">
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
														onClick={() =>
															toggleFilterOption(filter.key, option)
														}
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

						<div
							className="py-3 px-5 bg-white shadow-md rounded-lg flex gap-2 flex-wrap max-h-24 overflow-y-auto notranslate"
							translate="no"
						>
							{searchQuery.query && (
								<Tag
									label={`${t("query")}: ${searchQuery.query}`}
									onRemove={() => handleRemoveInput("query")}
								/>
							)}
							{searchQuery.location && (
								<Tag
									label={`${t("location")}: ${searchQuery.location}`}
									onRemove={() => handleRemoveInput("location")}
								/>
							)}
							{searchQuery.experience !== "Experience" && (
								<Tag
									label={`${t("experience")}: ${
										searchQuery.experience
									}`}
									onRemove={() => handleRemoveInput("experience")}
								/>
							)}
							{filters.category !== "All" && (
								<Tag
									label={`${t("category")}: ${filters.category}`}
									onRemove={() => handleRemoveFilter("category")}
								/>
							)}
							{filters.tags.map((tag) => (
								<Tag
									key={tag}
									label={`${t("tag")}: ${tag}`}
									onRemove={() => handleRemoveFilter("tags", tag)}
								/>
							))}
							{filters.city !== "All" && (
								<Tag
									label={`${t("city")}: ${filters.city}`}
									onRemove={() => handleRemoveFilter("city")}
								/>
							)}
							{filters.state !== "All" && (
								<Tag
									label={`${t("state")}: ${filters.state}`}
									onRemove={() => handleRemoveFilter("state")}
								/>
							)}
							{filters.salary !== "All" && (
								<Tag
									label={`${t("salary")}: ${filters.salary}`}
									onRemove={() => handleRemoveFilter("salary")}
								/>
							)}
							{filters.company !== "All" && (
								<Tag
									label={`${t("company")}: ${filters.company}`}
									onRemove={() => handleRemoveFilter("company")}
								/>
							)}
						</div>

						<div className="flex h-[calc(100vh-4rem)] mt-4">
							<div className="w-1/2 border-r-2 border-blue-200 overflow-y-auto p-4 space-y-3 bg-white rounded-l-md shadow-md">
								{isLoading ? (
									<p className="text-center text-blue-700 text-lg font-medium animate-pulse">
										{t("Loading")}
									</p>
								) : error ? (
									<p className="text-center text-red-700 text-lg font-semibold">
										{t("errorMessage")}
									</p>
								) : !data ||
								  (data.categories.length === 0 &&
										data.jobs.length === 0) ? (
									<p className="text-center text-gray-500 text-lg italic">
										{t("noCategoriesOrJobs")}
									</p>
								) : data.categories.length === 0 ? (
									<p className="text-center text-gray-500 text-lg italic">
										{t("noCategories")}
									</p>
								) : data.jobs.length === 0 ? (
									<p className="text-center text-gray-500 text-lg italic">
										{t("noJobs")}
									</p>
								) : filteredJobs.length === 0 ? (
									<p className="text-center text-gray-500 text-lg italic">
										{t("noMatchingJobs")}
									</p>
								) : (
									filteredJobs.map((job, index) => (
										<button
											key={`${job.id}-${index}`}
											onClick={() => setSelectedJob({ ...job })}
											className="w-full text-left"
										>
											<div
												className={`p-3 rounded-md border border-gray-200 bg-white hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-sm relative ${
													selectedJob?.id === job.id
														? "border-blue-500 bg-blue-100 ring-1 ring-blue-300"
														: ""
												}`}
											>
												<h3 className="text-md font-semibold text-blue-800 mb-1 relative z-10">
													{job.jobTitle}
												</h3>
												<div className="relative">
													<div className="space-y-1">
														<p className="text-sm text-gray-700 mb-1">
															{job.jobCompany}
														</p>
														<p className="text-sm text-blue-600 mb-1">
															{job.salary}
														</p>
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
															{formatJobDate(job.createdAt)}
														</p>
													</div>
													{!user && (
														<div className="absolute inset-0 bg-white bg-opacity-70 rounded-md flex items-center justify-center z-10">
															<button
																onClick={() => router.push("/signup")}
																className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md text-sm font-semibold"
															>
																{t("Register Now To See Description")}
															</button>
														</div>
													)}
												</div>
											</div>
										</button>
									))
								)}
							</div>

							<div className="w-1/2 overflow-y-auto p-4 bg-white rounded-r-md shadow-md">
								{selectedJob ? (
									user ? (
										(() => {
											const fields = {
												jobTitle: selectedJob.jobTitle,
												jobCompany: selectedJob.jobCompany,
												salary: selectedJob.salary,
												location: `${selectedJob.city}, ${selectedJob.state}`,
												address: selectedJob.address,
												category: selectedJob.category,
												contact: `${selectedJob.contactEmail} | ${selectedJob.contactNumber}`,
												jobDescription: selectedJob.jobDescription,
												tags:
													selectedJob.tags.length > 0
														? selectedJob.tags
														: null,
											}

											const allFieldsEmptyExceptImage =
												!Object.values(fields).some(
													(field) =>
														field &&
														(!Array.isArray(field) ||
															field.length > 0)
												)

											return (
												<div className="space-y-3">
													{fields.jobTitle && (
														<h2 className="text-xl font-bold text-blue-900">
															{fields.jobTitle}
														</h2>
													)}
													{fields.jobCompany && (
														<p className="text-md text-gray-700">
															{fields.jobCompany}
														</p>
													)}
													{selectedJob.imageUrl && (
														<div className="relative">
															<img
																src={selectedJob.imageUrl}
																alt="Job Cover"
																className={`rounded-md h-auto w-full object-cover mb-2 ${
																	allFieldsEmptyExceptImage
																		? "h-full"
																		: "h-40"
																}`}
															/>
															<button
																onClick={() =>
																	handleDownloadImage(
																		selectedJob.imageUrl
																	)
																}
																className="absolute top-2 right-2 p-2 cursor-pointer bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-200 hover:opacity-80"
																title={t("Open Image")}
															>
																<Download
																	size={20}
																	className="text-blue-600"
																/>
															</button>
														</div>
													)}
													{fields.salary &&
														fields.salary.trim() !== "" && (
															<Section
																title={t("salary")}
																content={fields.salary}
															/>
														)}
													<div className="flex gap-2 mt-2">
														<button
															onClick={() =>
																handleShare("whatsapp", selectedJob)
															}
															className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200"
															title={t("Share on WhatsApp")}
														>
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.134.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.669-.916-.983-.247-.314-.476-.558-.67-.588-.197-.03-.373-.03-.571-.03s-.518.074-.792.347c-.273.273-1.041.867-1.041 2.114s1.066 2.447 1.215 2.645c.149.198 2.095 3.196 5.077 4.487.708.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.099-.347-.347-.644-.496zM12 20.5c-4.687 0-8.5-3.813-8.5-8.5S7.313 3.5 12 3.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5zm0-18A9.5 9.5 0 002.5 12a9.5 9.5 0 009.5 9.5 9.5 9.5 0 009.5-9.5A9.5 9.5 0 0012 2.5z" />
															</svg>
														</button>
														<button
															onClick={() =>
																handleShare("facebook", selectedJob)
															}
															className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200"
															title={t("Share on Facebook")}
														>
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
															</svg>
														</button>
														<button
															onClick={() =>
																handleShare("linkedin", selectedJob)
															}
															className="p-2 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-all duration-200"
															title={t("Share on LinkedIn")}
														>
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.85-3.037-1.85 0-2.133 1.448-2.133 2.944v5.662H9.354V9.5h3.414v1.56h.048c.475-.898 1.637-1.85 3.37-1.85 3.602 0 4.262 2.37 4.262 5.456v6.786zM5.337 8.433c-1.144 0-2.063-.92-2.063-2.056 0-1.135.92-2.056 2.063-2.056 1.135 0 2.056.921 2.056 2.056 0 1.136-.921 2.056-2.056 2.056zm1.778 12.019H3.56V9.5h3.555v11.952zM22.225 0H1.771C.792 0 0 .792 0 1.771v20.458C0 23.208.792 24 1.771 24h20.454c.979 0 1.771-.792 1.771-1.771V1.771C24 .792 23.208 0 22.225 0z" />
															</svg>
														</button>
														<button
															onClick={() =>
																handleShare("instagram", selectedJob)
															}
															className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all duration-200 relative"
															title={t("Share on Instagram")}
														>
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.627.074-3.355.406-4.64 1.691-1.285 1.285-1.616 3.013-1.691 4.64-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.074 1.627.406 3.355 1.691 4.64 1.285 1.285 3.013 1.616 4.64 1.691 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.627-.074 3.355-.406 4.64-1.691 1.285-1.285 1.616-3.013 1.691-4.64.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.074-1.627-.406-3.355-1.691-4.64-1.285-1.285-3.013-1.616-4.64-1.691-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.404 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.441s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.441-1.441-1.441z" />
															</svg>
															{copied && (
																<span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
																	{t("Copied!")}
																</span>
															)}
														</button>
													</div>
													{fields.location &&
														fields.location !== ", " && (
															<Section
																title={t("location")}
																content={fields.location}
															/>
														)}
													{fields.address && (
														<Section
															title={t("address")}
															content={fields.address}
														/>
													)}
													{fields.category && (
														<Section
															title={t("category")}
															content={fields.category}
														/>
													)}
													{fields.contact &&
														fields.contact !== " | " && (
															<Section
																title={t("contact")}
																content={fields.contact}
															/>
														)}
													{fields.jobDescription && (
														<Section
															title={t("jobDescription")}
															content={fields.jobDescription}
														/>
													)}
													{fields.tags && (
														<Section
															title={t("preferredSkills")}
															content={
																<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
																	{selectedJob.tags.map(
																		(tag, index) => (
																			<li key={index}>{tag}</li>
																		)
																	)}
																</ul>
															}
														/>
													)}
												</div>
											)
										})()
									) : (
										<div className="flex flex-col items-center justify-center h-full space-y-4">
											<p className="text-center text-blue-700 text-lg font-medium">
												{t("Please Sign In To See Full Description")}
											</p>
											<button
												onClick={() => router.push("/signup")}
												className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md text-lg font-semibold"
											>
												{t("Register Now ")}
											</button>
										</div>
									)
								) : (
									<p className="text-center text-blue-700 text-lg font-medium">
										{t("Select Job")}
									</p>
								)}
							</div>
						</div>
					</div>
				</ErrorBoundary>
			</div>
		</span>
	)
}
