"use client"

import AboutUs from "./components/homePage/AboutUs"
import Blogs from "./components/homePage/Blogs"
import FeaturedCompanies from "./components/homePage/FeaturedCompanies"
import HeroSection from "./components/homePage/HeroSection"
import Reviews from "./components/homePage/Reviews"

export default function page() {
	return (
		<>
			<HeroSection />
			<FeaturedCompanies />
			<AboutUs />
			<Blogs />
		</>
	)
}
