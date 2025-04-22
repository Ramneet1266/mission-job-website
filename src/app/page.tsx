"use client"

import { Component, ReactNode, useEffect } from "react"
import AboutUs from "./components/homePage/AboutUs"
import Blogs from "./components/homePage/Blogs"
import FeaturedCompanies from "./components/homePage/FeaturedCompanies"
import HeroSection from "./components/homePage/HeroSection"
import Reviews from "./components/homePage/Reviews"
import ImageSlider from "./components/homePage/SliderImages"

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

export default function Page() {
	useEffect(() => {
		// Get current reload state from localStorage
		// const reloadState = JSON.parse(
		// 	localStorage.getItem("reloadState") || "{}"
		// )
		// const { reloadCount = 0, visitTimestamp = 0 } = reloadState
		// // Check if this is a new visit (no timestamp or > 5 seconds since last visit)
		// const now = Date.now()
		// const isNewVisit = !visitTimestamp || now - visitTimestamp > 5000 // 5-second threshold
		// if (isNewVisit) {
		// 	// Start new visit: reset to first reload
		// 	localStorage.setItem(
		// 		"reloadState",
		// 		JSON.stringify({ reloadCount: 1, visitTimestamp: now })
		// 	)
		// 	window.location.reload()
		// } else if (reloadCount === 1) {
		// 	// First reload: trigger second reload
		// 	localStorage.setItem(
		// 		"reloadState",
		// 		JSON.stringify({ reloadCount: 2, visitTimestamp })
		// 	)
		// 	window.location.reload()
		// } else if (reloadCount === 2) {
		// 	// Second reload: reset state to stop reloading
		// 	localStorage.setItem(
		// 		"reloadState",
		// 		JSON.stringify({ reloadCount: 0, visitTimestamp })
		// 	)
		// }
		// If reloadCount > 2 or invalid, do nothing to prevent loops
	}, []) // Runs once on page mount

	return (
		<div>
			<ErrorBoundary>
				<div>
					<HeroSection />
					<FeaturedCompanies />
					<div className="notranslate" translate="no">
						<ImageSlider />
					</div>
					<AboutUs />
					<Blogs />
				</div>
			</ErrorBoundary>
		</div>
	)
}
