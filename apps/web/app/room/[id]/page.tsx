"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"


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
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-6">
                {/* Chat messages area */}
                <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-4">
                    <div className="text-center text-zinc-500 mt-20">
                        <p className="text-lg">Chat interface coming in Step 3!</p>
                        <p className="text-sm mt-2">WebSocket connection will be added next</p>
                    </div>
                </div>

                {/* Message input */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Type a message... (WebSocket coming in Step 3)"
                            disabled
                            className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                            disabled
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}