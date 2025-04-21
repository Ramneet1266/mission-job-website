"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import Loading from "./components/Loading"
import WhatsappButton from "./components/WhatsappButton"
import "./globals.css"
import { Toaster } from "react-hot-toast"

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const [loading, setLoading] = useState(true)
	const pathname = usePathname()
	const hideLayout = pathname === "/login" || pathname === "/signup"

	// Load Google Translate Script
	useEffect(() => {
		const addGoogleTranslateScript = () => {
			if (!document.getElementById("google-translate-script")) {
				const script = document.createElement("script")
				script.id = "google-translate-script"
				script.src =
					"//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
				script.async = true
				document.body.appendChild(script)
			}
		}

		// Initialize Google Translate
		;(window as any).googleTranslateElementInit = () => {
			if (document.getElementById("google_translate_element")) {
				new (window as any).google.translate.TranslateElement(
					{
						pageLanguage: "en",
						includedLanguages: "en,hi",
						layout: (window as any).google.translate.TranslateElement
							.InlineLayout.SIMPLE,
					},
					"google_translate_element"
				)
			}
		}

		addGoogleTranslateScript()

		// Cleanup script on component unmount
		return () => {
			const script = document.getElementById(
				"google-translate-script"
			)
			if (script) {
				script.remove()
			}
			// Remove Google Translate widget
			const translateElement = document.getElementById(
				"google_translate_element"
			)
			if (translateElement) {
				translateElement.innerHTML = ""
			}
		}
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 500)
		return () => clearTimeout(timer)
	}, [])

	return (
		<html lang="en">
			<body>
				{/* Google Translate widget container */}
				<div
					id="google_translate_element"
					style={{
						position: "fixed",
						top: 18,
						right: 10,
						zIndex: 1000,
					}}
				/>

				{loading ? (
					<Loading />
				) : (
					<>
						{!hideLayout && <Navbar />}
						<div
							className={!hideLayout ? "min-h-screen my-[10px]" : ""}
						>
							{children}
							<Toaster position="top-right" />
						</div>
						{!hideLayout && <Footer />}
						{!hideLayout && <WhatsappButton />}
					</>
				)}
			</body>
		</html>
	)
}
