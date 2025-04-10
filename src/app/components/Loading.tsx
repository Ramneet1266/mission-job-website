"use client"

export default function Loading() {
	return (
		<div className="flex items-center justify-center h-screen bg-[#1b1f23] text-white">
			<div className="flex flex-col items-center space-y-4">
				<div className="relative w-16 h-16">
					<div className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping"></div>
					<div className="relative w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/50">
						<div className="w-6 h-6 bg-white rounded-full animate-bounce"></div>
					</div>
				</div>
				<p className="text-xl font-semibold text-blue-200 animate-pulse tracking-wide">
					Loading your experience...
				</p>
			</div>
		</div>
	)
}
