export function LessonSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50 animate-pulse">
            <div className="flex">
                {/* Sidebar skeleton */}
                <div className="w-80 bg-white border-r border-zinc-200 h-screen p-4 hidden lg:block">
                    <div className="h-6 bg-zinc-200 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-zinc-100 rounded"></div>
                        ))}
                    </div>
                </div>

                {/* Main content skeleton */}
                <div className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Video placeholder */}
                        <div className="aspect-video bg-zinc-200 rounded-xl mb-6"></div>

                        {/* Title */}
                        <div className="h-8 bg-zinc-200 rounded w-2/3 mb-3"></div>
                        <div className="h-4 bg-zinc-100 rounded w-1/3 mb-6"></div>

                        {/* Content */}
                        <div className="space-y-3">
                            <div className="h-4 bg-zinc-100 rounded w-full"></div>
                            <div className="h-4 bg-zinc-100 rounded w-5/6"></div>
                            <div className="h-4 bg-zinc-100 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function CourseSkeleton() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6">
                    <div className="h-5 bg-zinc-200 rounded w-16 mb-3"></div>
                    <div className="h-6 bg-zinc-200 rounded w-2/3 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-zinc-100 rounded w-1/2"></div>
                        <div className="h-4 bg-zinc-100 rounded w-1/3"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ChatbotSkeleton() {
    return (
        <div className="fixed bottom-4 right-4 w-14 h-14 bg-indigo-100 rounded-full animate-pulse"></div>
    )
}

export function NavbarSkeleton() {
    return (
        <nav className="h-14 border-b border-zinc-100 bg-white animate-pulse">
            <div className="zen-container flex items-center justify-between h-full">
                <div className="h-8 w-32 bg-zinc-200 rounded"></div>
                <div className="flex gap-4">
                    <div className="h-8 w-20 bg-zinc-100 rounded"></div>
                    <div className="h-8 w-8 bg-zinc-100 rounded-full"></div>
                </div>
            </div>
        </nav>
    )
}
