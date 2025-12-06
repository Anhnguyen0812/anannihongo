"use client"

import Chatbot from './Chatbot'

interface ChatbotWrapperProps {
    screenContext?: string
}

export default function ChatbotWrapper({ screenContext }: ChatbotWrapperProps) {
    return <Chatbot screenContext={screenContext} />
}
