"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import Loading from "./components/Loading"
import WhatsappButton from "./components/WhatsappButton"
import "./globals.css"

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const [loading, setLoading] = useState(true)
	const pathname = usePathname()
	const hideLayout = pathname === "/login" || pathname === "/signup"

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false)
		}, 1500)

		return () => clearTimeout(timer)
	}, [])

	return (
		<html lang="en">
			<body>
				{loading ? (
					<Loading />
				) : (
					<>
						{!hideLayout && <Navbar />}
						<div
							className={!hideLayout ? "min-h-screen my-[10px]" : ""}
						>
							{children}
						</div>
						{!hideLayout && <Footer />}
						{!hideLayout && <WhatsappButton />}
					</>
				)}
			</body>
		</html>
	)
}
