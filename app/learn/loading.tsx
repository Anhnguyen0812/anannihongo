import LoadingSpinner from '@/components/LoadingSpinner'

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 flex items-center justify-center">
            <LoadingSpinner text="Đang tải khóa học..." />
        </div>
    )
}
