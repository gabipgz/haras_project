'use client'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { isLoggedIn, accountId, clearLoginState } = useAuth()

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {       
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      localStorage.removeItem('hederaCredentials')
      clearLoginState()
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src="/assets/haras_logo.png"
            alt="Haras Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-2xl font-bold">HARAS</span>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">{accountId}</span>
            </div>
            <Button 
              variant="outline"
              onClick={handleLogout}
              size="sm"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
} 