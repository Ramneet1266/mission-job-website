"use client";

import { Component, ReactNode } from "react";
import AboutUs from "./components/homePage/AboutUs";
import Blogs from "./components/homePage/Blogs";
import FeaturedCompanies from "./components/homePage/FeaturedCompanies";
import HeroSection from "./components/homePage/HeroSection";
import Reviews from "./components/homePage/Reviews";
import ImageSlider from "./components/homePage/SliderImages";

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1 className="text-center text-red-600">Something went wrong. Please refresh.</h1>;
    }
    return this.props.children;
  }
}

export default function Page() {
  return (
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
  );
}
