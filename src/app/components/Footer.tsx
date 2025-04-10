"use client"
import { FaLinkedin, FaInstagram, FaGoogle } from "react-icons/fa"

export default function Footer() {
	return (
		<footer className="bg-[#2b2d31] text-white py-12 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
					{/* Explore */}
					<div>
						<h3 className="uppercase font-bold text-lg relative inline-block mb-4">
							EXPLORE
							<span className="block w-10 h-1 bg-blue-500 mt-1 rounded-full" />
						</h3>
						<ul className="space-y-2 text-gray-300">
							<li className="hover:text-white transition">
								<a href="#">For Job Seekers</a>
							</li>
							<li className="hover:text-white transition">
								<a href="#">For Schools</a>
							</li>
							<li className="hover:text-white transition">
								<a href="#">About Us</a>
							</li>
						</ul>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="uppercase font-bold text-lg relative inline-block mb-4">
							QUICK LINKS
							<span className="block w-10 h-1 bg-blue-500 mt-1 rounded-full" />
						</h3>
						<ul className="space-y-2 text-gray-300">
							<li className="hover:text-white transition">
								<a href="#">How it Works</a>
							</li>
							<li className="hover:text-white transition">
								<a href="#">Browse Jobs</a>
							</li>
							<li className="hover:text-white transition">
								<a href="#">Contact Us</a>
							</li>
						</ul>
					</div>

					{/* Follow */}
					<div>
						<h3 className="uppercase font-bold text-lg relative inline-block mb-4">
							FOLLOW
							<span className="block w-10 h-1 bg-blue-500 mt-1 rounded-full" />
						</h3>
						<ul className="space-y-2 text-gray-300">
							<li className="flex items-center gap-2 hover:text-white transition">
								<FaLinkedin /> Linkedin
							</li>
							<li className="flex items-center gap-2 hover:text-white transition">
								<FaInstagram /> Instagram
							</li>
							<li className="flex items-center gap-2 hover:text-white transition">
								<FaGoogle /> Google
							</li>
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h3 className="uppercase font-bold text-lg relative inline-block mb-4">
							CONTACT
							<span className="block w-10 h-1 bg-blue-500 mt-1 rounded-full" />
						</h3>
						<ul className="space-y-2 text-gray-300">
							<li>hello@teachersrecruiter.in</li>
							<li>+91 – 90 390 32383</li>
						</ul>
					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-gray-600 mt-10 pt-6 text-center text-sm text-gray-400 space-y-2">
					<p>
						Privacy Policy | Terms Conditions & Refund Policy | Fraud
						Alert
					</p>
					<p>Teachers Recruiter © 2025, All Right Reserved.</p>
				</div>
			</div>
		</footer>
	)
}
