'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from '../context/AuthContext'

interface HederaCredentials {
  accountId: string;
  privateKey: string;
}

interface HederaLoginProps {
  onLoginStatusChange?: (isLoggedIn: boolean) => void;
}

export default function HederaLogin({ onLoginStatusChange }: HederaLoginProps) {
  const { setLoginState } = useAuth()
  const [credentials, setCredentials] = useState<HederaCredentials>({
    accountId: '',
    privateKey: ''
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alert, setAlert] = useState({ message: '', type: '' as 'success' | 'error' })

  useEffect(() => {
    // Check if credentials exist in local storage on component mount
    const storedCredentials = localStorage.getItem('hederaCredentials')
    if (storedCredentials) {
      const parsedCredentials = JSON.parse(storedCredentials)
      setCredentials(parsedCredentials)
      
      // Initialize backend with stored credentials
      fetch(`http://localhost:3001/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: storedCredentials,
      })
      .then(response => {
        if (response.ok) {
          setIsLoggedIn(true)
          onLoginStatusChange?.(true)
        } else {
          // If backend initialization fails, clear local storage
          localStorage.removeItem('hederaCredentials')
          setIsLoggedIn(false)
          onLoginStatusChange?.(false)
          setCredentials({ accountId: '', privateKey: '' })
        }
      })
      .catch(() => {
        // If request fails, clear local storage
        localStorage.removeItem('hederaCredentials')
        setIsLoggedIn(false)
        onLoginStatusChange?.(false)
        setCredentials({ accountId: '', privateKey: '' })
      })
    }
  }, [])

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type })
    setTimeout(() => setAlert({ message: '', type: 'success' }), 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!credentials.accountId || !credentials.privateKey) {
      showAlert('Please fill in all fields', 'error')
      return
    }

    // Validate Hedera account ID format (0.0.xxxxx)
    if (!credentials.accountId.match(/^\d+\.\d+\.\d+$/)) {
      showAlert('Invalid Hedera account ID format', 'error')
      return
    }

    try {
      // First, call the backend login endpoint
      const response = await fetch(`http://localhost:3001/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Failed to set credentials on server');
      }

      // If successful, store in localStorage
      localStorage.setItem('hederaCredentials', JSON.stringify(credentials))
      setIsLoggedIn(true)
      setLoginState(credentials.accountId)
      onLoginStatusChange?.(true)
      showAlert('Successfully logged in', 'success')
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error storing credentials', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`http://localhost:3001/auth/logout`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to logout on server');
      }

      localStorage.removeItem('hederaCredentials');
      setCredentials({ accountId: '', privateKey: '' });
      setIsLoggedIn(false);
      onLoginStatusChange?.(false)
      showAlert('Successfully logged out', 'success');
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error logging out', 'error');
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${isLoggedIn ? 'max-w-xs' : ''}`}>
      {!isLoggedIn ? (
        <>
          <CardHeader>
            <CardTitle>Hedera TESTNET Wallet Login</CardTitle>
            <CardDescription>
              Enter your Hedera TESTNET account credentials to interact with the network
            </CardDescription>
          </CardHeader>

          <CardContent>
            {alert.message && (
              <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="mb-4">
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input
                  id="accountId"
                  placeholder="0.0.12345"
                  value={credentials.accountId}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    accountId: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key</Label>
                <Input
                  id="privateKey"
                  type="password"
                  placeholder="Enter your private key"
                  value={credentials.privateKey}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    privateKey: e.target.value
                  }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </>
      ) : (
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm text-muted-foreground truncate">
                {credentials.accountId}
              </span>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="sm"
              className="px-2"
            >
              Logout
            </Button>
          </div>

          {alert.message && (
            <Alert 
              variant={alert.type === 'success' ? 'default' : 'destructive'} 
              className="mt-2"
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  )
}