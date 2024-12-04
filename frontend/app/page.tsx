'use client'
import { useState } from 'react'
import HederaLogin from './components/HederaLogin'
import VirtualHorseStable from './components/VirtualHorseStable'

export default function Home() {
  const [loginStateChanged, setLoginStateChanged] = useState(false)

  const handleLoginStatusChange = (isLoggedIn: boolean) => {
    setLoginStateChanged(!loginStateChanged)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <HederaLogin onLoginStatusChange={handleLoginStatusChange} />
      <VirtualHorseStable key={loginStateChanged.toString()} />
    </main>
  )
}