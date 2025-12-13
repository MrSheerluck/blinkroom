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
        // Don't create a new connection if one is already open
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return
        }

        // Close existing connection if it's in a bad state
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
            wsRef.current.close()
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
            console.log('Received message:', data.type, data.id || 'no-id')

            if (data.type === 'message_history') {
                // Initial message history
                setUsername(data.username)
                setMessages(data.messages || [])
            } else if (data.type === 'message') {
                // New message - check for duplicates before adding
                setMessages(prev => {
                    // Don't add if message with same ID already exists
                    if (prev.some(msg => msg.id === data.id)) {
                        return prev
                    }
                    return [...prev, data]
                })
            } else if (data.type === 'user_joined') {
                // User joined event - check for recent duplicate
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1]
                    // Skip if last message was same user joining within 1 second
                    if (lastMessage?.type === 'user_joined' &&
                        lastMessage.username === data.username &&
                        new Date(data.timestamp).getTime() - new Date(lastMessage.timestamp).getTime() < 1000) {
                        return prev
                    }
                    return [...prev, data]
                })
            } else if (data.type === 'user_left') {
                // User left event - check for recent duplicate
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1]
                    // Skip if last message was same user leaving within 1 second
                    if (lastMessage?.type === 'user_left' &&
                        lastMessage.username === data.username &&
                        new Date(data.timestamp).getTime() - new Date(lastMessage.timestamp).getTime() < 1000) {
                        return prev
                    }
                    return [...prev, data]
                })
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
            setError('Connection error')
        }

        ws.onclose = () => {
            console.log('WebSocket disconnected')
            setConnectionStatus('disconnected')
            wsRef.current = null

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
                console.log('Cleaning up WebSocket connection')
                wsRef.current.close()
                wsRef.current = null
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