"use client"

import { useEffect, useState, useRef, useCallback } from 'react'

interface Message {
    type: 'message' | 'user_joined' | 'user_left' | 'message_history'
    id?: string
    username: string
    contents?: string
    timestamp: string
    messages?: Message[]
}

interface UseWebSocketReturn {
    messages: Message[]
    sendMessage: (content: string) => void
    username: string | null
    connectionStatus: 'connecting' | 'connected' | 'disconnected'
    error: string | null
}

export function useWebSocket(roomId: string): UseWebSocketReturn {
    const [messages, setMessages] = useState<Message[]>([])
    const [username, setUsername] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
    const [error, setError] = useState<string | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return
        }

        setConnectionStatus('connecting')
        setError(null)

        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${roomId}`
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
            console.log('WebSocket connected')
            setConnectionStatus('connected')
            setError(null)
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === 'message_history') {
                // Initial message history
                setUsername(data.username)
                setMessages(data.messages || [])
            } else if (data.type === 'message') {
                // New message
                setMessages(prev => [...prev, data])
            } else if (data.type === 'user_joined') {
                // User joined event
                setMessages(prev => [...prev, data])
            } else if (data.type === 'user_left') {
                // User left event
                setMessages(prev => [...prev, data])
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
            setError('Connection error')
        }

        ws.onclose = () => {
            console.log('WebSocket disconnected')
            setConnectionStatus('disconnected')

            // Attempt to reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('Attempting to reconnect...')
                connect()
            }, 3000)
        }

        wsRef.current = ws
    }, [roomId])

    useEffect(() => {
        connect()

        // Cleanup on unmount
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [connect])

    const sendMessage = useCallback((content: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ contents: content }))
        } else {
            console.error('WebSocket is not connected')
        }
    }, [])

    return {
        messages,
        sendMessage,
        username,
        connectionStatus,
        error
    }
}