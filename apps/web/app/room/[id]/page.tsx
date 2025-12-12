"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useWebSocket } from "@/hooks/useWebSocket"


interface RoomDetail {
    id: string
    created_at: string
    expires_at: string
    is_active: boolean
    is_expired: boolean
}


export default function RoomPage() {
    const params = useParams()
    const roomId = params.id as string

    const [room, setRoom] = useState<RoomDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<string>("")
    const [messageInput, setMessageInput] = useState("")

    // WebSocket hook
    const { messages, sendMessage, username, connectionStatus } = useWebSocket(roomId)

    // Ref for auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])


    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`)

                if (response.status === 404) {
                    setError('Room not found')
                    return
                }
                if (response.status === 410) {
                    setError('This room has expired')
                    return
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch room')
                }

                const data = await response.json()
                setRoom(data)
            } catch (err) {
                console.error('Error fetching room:', err)
                setError('Failed to load room')
            } finally {
                setLoading(false)
            }
        }

        fetchRoom()
    }, [roomId])

    // Calculate time remaining
    useEffect(() => {
        if (!room) return

        const updateTimeRemaining = () => {
            const now = new Date()
            const expiresAt = new Date(room.expires_at)
            const diff = expiresAt.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining("Expired")
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
        }

        updateTimeRemaining()
        const interval = setInterval(updateTimeRemaining, 1000)

        return () => clearInterval(interval)
    }, [room])

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (messageInput.trim() && connectionStatus === 'connected') {
            sendMessage(messageInput)
            setMessageInput("")
        }
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="text-white text-2xl">
                    Loading...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="text-center">
                    <h1 className="text-white text-3xl font-bold mb-4">{error}</h1>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-black">
            {/* Header */}
            <header className="border-b border-zinc-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="size-6 text-white">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    clipRule="evenodd"
                                    d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h2 className="text-white text-lg font-bold">BlinkRoom</h2>
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="text-sm text-zinc-400">
                            Room: <span className="text-white font-mono font-semibold">{roomId}</span>
                        </div>
                        <div className="text-sm text-zinc-400">
                            Expires in: <span className="text-blue-400 font-semibold">{timeRemaining}</span>
                        </div>
                        {username && (
                            <div className="text-sm text-zinc-400">
                                You are: <span className="text-green-400 font-semibold">{username}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                                    connectionStatus === 'connecting' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`} />
                            <span className="text-xs text-zinc-500 capitalize">{connectionStatus}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-6">
                {/* Chat messages area */}
                <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-4 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="text-center text-zinc-500 mt-20">
                            <p className="text-lg">No messages yet</p>
                            <p className="text-sm mt-2">Be the first to say something!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, index) => {
                                if (msg.type === 'user_joined') {
                                    return (
                                        <div key={index} className="text-center text-zinc-500 text-sm">
                                            <span className="text-green-400">{msg.username}</span> joined the room
                                        </div>
                                    )
                                }
                                if (msg.type === 'user_left') {
                                    return (
                                        <div key={index} className="text-center text-zinc-500 text-sm">
                                            <span className="text-red-400">{msg.username}</span> left the room
                                        </div>
                                    )
                                }
                                if (msg.type === 'message') {
                                    const isOwnMessage = msg.username === username
                                    return (
                                        <div key={msg.id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-md ${isOwnMessage ? 'bg-blue-600' : 'bg-zinc-800'} rounded-lg px-4 py-2`}>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className={`font-semibold text-sm ${isOwnMessage ? 'text-blue-100' : 'text-zinc-300'}`}>
                                                        {msg.username}
                                                    </span>
                                                    <span className="text-xs text-zinc-400">
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-white">{msg.contents}</p>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connecting..."}
                            disabled={connectionStatus !== 'connected'}
                            className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={connectionStatus !== 'connected' || !messageInput.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}