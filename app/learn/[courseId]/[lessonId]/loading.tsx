import LoadingSpinner from "@/components/LoadingSpinner"

export default function LessonLoading() {
    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header Skeleton */}
            <header className="h-14 border-b border-border/40 flex items-center px-4 shrink-0 bg-card/50 backdrop-blur-sm">
                <div className="h-8 w-8 bg-muted rounded-lg animate-pulse mr-3" />
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content with Cute Spinner */}
                <main className="flex-1 bg-black/5 flex items-center justify-center relative">
                    <LoadingSpinner text="Đang chuẩn bị bài học..." />
                </main>

                {/* Sidebar Skeleton */}
                <aside className="w-80 h-full bg-card border-l border-border/40 shrink-0 hidden lg:block">
                    <div className="p-3 border-b border-border/40 h-14 flex items-center">
                        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="p-2 space-y-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-10 w-full bg-muted/30 rounded animate-pulse" />
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    )
}
