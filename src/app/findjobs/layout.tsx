import { ReactNode, Suspense } from "react"
import FullScreenLoader from "../components/loaders/loaders/full-screen-loader"

export default function UserLayout({
	children,
}: {
	children: ReactNode
}) {
	return (
		<Suspense fallback={<FullScreenLoader />}>{children}</Suspense>
	)
}
