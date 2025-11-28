import LoadingSpinner from '@/components/LoadingSpinner'

export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <LoadingSpinner text="Đang tải hồ sơ..." />
        </div>
    )
}
