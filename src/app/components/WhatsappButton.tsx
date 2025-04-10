// components/WhatsappButton.tsx
"use client"
import { FaWhatsapp } from "react-icons/fa"

export default function WhatsappButton() {
	return (
		<div className="fixed bottom-6 right-6 z-50 group">
			<a
				href="https://wa.me/919876543210" // Replace with your number
				target="_blank"
				rel="noopener noreferrer"
				className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce"
			>
				<FaWhatsapp size={24} />
			</a>
			<span className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-300 shadow">
				Chat with us
			</span>
		</div>
	)
}
