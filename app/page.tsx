import Navbar from '@/components/Navbar'
import HomeContent from '@/components/HomeContent'
import ChatbotWrapper from '@/components/ChatbotWrapper'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HomeContent />
      <ChatbotWrapper screenContext="Trang chủ AnAn Nihongo - Nền tảng học tiếng Nhật trực tuyến" />
    </div>
  )
}
