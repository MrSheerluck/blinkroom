"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRoom = async () => {
    setIsCreating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      const data = await response.json()
      console.log('Room created:', data)

      router.push(`/room/${data.id}`)
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

            {/* Top NavBar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-zinc-800 px-4 sm:px-10 py-3">
              <div className="flex items-center gap-4">
                <div className="size-6 text-white">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">BlinkRoom</h2>
              </div>
              <div className="flex flex-1 justify-end gap-8">
                <div className="flex items-center gap-9">
                  <Link
                    className="flex items-center gap-2 text-white text-sm font-medium leading-normal hover:text-zinc-400 transition-colors"
                    href="https://github.com/MrSheerluck/blinkroom"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </Link>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow">
              <div className="@container">
                <div className="flex flex-col gap-6 px-4 py-16 text-center @[864px]:py-24">
                  <div className="flex flex-col gap-4 items-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-2xl">
                      Private Conversations that Disappear.
                    </h1>
                    <h2 className="text-zinc-400 text-base font-normal leading-normal @[480px]:text-lg @[480px]:font-normal @[480px]:leading-normal max-w-2xl">
                      BlinkRoom offers <strong>free</strong>, <strong>anonymous</strong>, and <strong>end-to-end encrypted</strong> chat rooms that are automatically deleted after 24 hours. No sign-up required.
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handleCreateRoom}
                      disabled={isCreating}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-white text-black text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="truncate">
                        {isCreating ? "Creating..." : "Create a Chat Session"}
                      </span>
                    </button>
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-zinc-800 text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-zinc-700 transition-colors">
                      <span className="truncate">Join a Chat Session</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Core Features Section */}
              <section className="px-4 py-16">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-4">
                    Built for Privacy. Designed for Simplicity.
                  </h2>
                  <p className="text-zinc-400 text-center text-base md:text-lg mb-12 max-w-2xl mx-auto">
                    We believe in your right to private conversations. BlinkRoom is engineered with core principles to protect your anonymity and data.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Complete Anonymity */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-2">Complete Anonymity</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          No accounts. No sign-ups. No personal data collected. Your identity remains private.
                        </p>
                      </div>
                    </div>

                    {/* E2E Encryption */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-2">E2E Encryption</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          All messages are end-to-end encrypted. Not even we can read your conversations.
                        </p>
                      </div>
                    </div>

                    {/* Auto-Destructive */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-2">Auto-Destructive</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Every chat room and its contents are automatically and permanently deleted after 24 hours.
                        </p>
                      </div>
                    </div>

                    {/* Open & Transparent */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-2">Open & Transparent</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Our code is open source and available on GitHub for anyone to audit and verify our privacy claims.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            {/* Footer */}
            <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-solid border-zinc-800 px-4 sm:px-10 py-6 mt-10">
              <p className="text-sm text-zinc-500">© 2026 BlinkRoom. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="#">Terms of Service</Link>
                <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="#">Privacy Policy</Link>
                <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="#">GitHub</Link>
              </div>
            </footer>

          </div>
        </div>
      </div>
    </div>
  )
}