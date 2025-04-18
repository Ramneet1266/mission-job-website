"use client"

import AboutUs from "./components/homePage/AboutUs"
import Blogs from "./components/homePage/Blogs"
import FeaturedCompanies from "./components/homePage/FeaturedCompanies"
import HeroSection from "./components/homePage/HeroSection"
import Reviews from "./components/homePage/Reviews"
import ImageSlider from "./components/homePage/SliderImages"

export default function page() {
	return (
		<>
			<HeroSection />
			<FeaturedCompanies />
			<ImageSlider />
			<AboutUs />
			<Blogs />
		</>
	)
}
