"use client"

export default function Loading() {
	return (
		<div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
			<div className="flex flex-col items-center space-y-6">
				<div className="relative w-20 h-20">
					<div className="absolute inset-0 rounded-full bg-blue-400 opacity-70 animate-ping"></div>
					<div className="relative w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-400/50">
						<div className="w-8 h-8 bg-white rounded-full animate-bounce shadow-md shadow-blue-200"></div>
					</div>
				</div>
				<div className="w-48 h-4 bg-blue-300 rounded-full animate-pulse"></div>
				<div className="w-32 h-4 bg-blue-500 rounded-full animate-pulse delay-200"></div>
			</div>
		</div>
	)
}
