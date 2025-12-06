"use client"

import dynamic from 'next/dynamic'
import { ChatbotSkeleton } from './skeletons'

// Lazy load the heavy Chatbot component (26KB)
const Chatbot = dynamic(() => import('./Chatbot'), {
    loading: () => <ChatbotSkeleton />,
    ssr: false,
})

interface ChatbotWrapperProps {
    screenContext?: string
}

export default function ChatbotWrapper({ screenContext }: ChatbotWrapperProps) {
    return <Chatbot screenContext={screenContext} />
}
