"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import WhatsappButton from "./components/WhatsappButton"
import "./globals.css"
import { Toaster } from "react-hot-toast"

// Extend Window interface for TypeScript
interface Window {
	google: {
		translate: {
			TranslateElement: any
			InlineLayout: {
				SIMPLE: string
			}
		}
	}
	googleTranslateElementInit: () => void
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const pathname = usePathname()
	const hideLayout = pathname === "/login" || pathname === "/signup"
	const [translateReady, setTranslateReady] = useState(false)

	// Load Google Translate Script with delay
	useEffect(() => {
		const timer = setTimeout(() => {
			if (!document.getElementById("google-translate-script")) {
				const script = document.createElement("script")
				script.id = "google-translate-script"
				script.src =
					"//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
				script.async = true
				document.body.appendChild(script)
				;(window as any).googleTranslateElementInit = () => {
					new (window as any).google.translate.TranslateElement(
						{
							pageLanguage: "en",
							includedLanguages: "en,hi",
							layout: (window as any).google.translate
								.TranslateElement.InlineLayout.SIMPLE,
							autoDisplay: false,
						},
						"google_translate_element"
					)
					setTranslateReady(true)
				}
			} else {
				setTranslateReady(true)
			}
		}, 1000) // Delay by 1 second
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
						display: translateReady ? "block" : "none",
					}}
				/>

				<>
					{!hideLayout && (
						<span>
							<Navbar />
						</span>
					)}
					<div
						className={!hideLayout ? "min-h-screen my-[10px]" : ""}
					>
						<span>{children}</span>
						<Toaster
							position="top-right"
							containerClassName="notranslate"
						/>
					</div>
					{!hideLayout && (
						<span>
							<Footer />
						</span>
					)}
					{!hideLayout && (
						<span>
							<WhatsappButton />
						</span>
					)}
				</>
			</body>
		</html>
	)
}
