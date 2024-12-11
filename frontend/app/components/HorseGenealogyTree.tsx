import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import HorseDetailsModal from './HorseDetailsModal'
import { ChevronRight } from "lucide-react"

interface HorseNode {
  tokenId: string
  serialNumber: string
  metadata: {
    name: string
    breed: string
    sex: string
    birthDate: string
    coatColor: string
    weight?: string
    height?: string
    images: string[]
    pedigree: {
      sireId?: string
      damId?: string
      sireName?: string
      damName?: string
    }
    registrationOrganization?: string
    currentOwner: string
  }
}

interface HorseGenealogyTreeProps {
  horseId: string
  showAlert: (message: string, type: 'success' | 'error') => void
  setIsLoading: (message: string) => void
}

const API_URL = 'http://localhost:3001'

// Add new types for better type safety
type ParentType = 'sire' | 'dam'
type LoadingState = { [key: string]: boolean }

interface FetchQueueItem {
  id: string
  depth: number
}

export default function HorseGenealogyTree({ horseId, showAlert, setIsLoading }: HorseGenealogyTreeProps) {
  // Add memoization for performance
  const [horse, setHorse] = useState<HorseNode | null>(null)
  const [selectedHorse, setSelectedHorse] = useState<HorseNode | null>(null)
  const [parents, setParents] = useState<{ [key: string]: HorseNode }>({})
  const [fetchedIds, setFetchedIds] = useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})
  const [error, setError] = useState<string | null>(null)

  // Improved queue-based fetching with better error handling and rate limiting
  const fetchParentsQueue = async (queue: FetchQueueItem[], maxDepth: number = 3) => {
    const processedIds = new Set<string>()
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    
    for (const { id, depth } of queue) {
      if (depth > maxDepth || processedIds.has(id) || fetchedIds.has(id)) continue
      
      try {
        setLoadingStates(prev => ({ ...prev, [id]: true }))
        
        // Add small delay between requests to prevent rate limiting
        await delay(100)
        
        const response = await fetch(`${API_URL}/nft/${id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        processedIds.add(id)
        
        setParents(prev => ({ ...prev, [id]: data }))
        setFetchedIds(prev => new Set(prev).add(id))
        
        // Add parents to queue with validation
        const { sireId, damId } = data.metadata.pedigree
        if (sireId && typeof sireId === 'string') {
          queue.push({ id: sireId, depth: depth + 1 })
        }
        if (damId && typeof damId === 'string') {
          queue.push({ id: damId, depth: depth + 1 })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error fetching horse ${id}:`, errorMessage)
        setError(`Failed to fetch ancestor ${id}`)
        showAlert(`Error fetching ancestor details for ${id}`, 'error')
      } finally {
        setLoadingStates(prev => ({ ...prev, [id]: false }))
      }
    }
  }

  // Modify renderHorseCard to remove expand button
  const renderHorseCard = (horseData: HorseNode, isBaseHorse: boolean = false) => (
    <Card 
      className={`w-40 cursor-pointer transition-all ${
        loadingStates[`${horseData.tokenId}:${horseData.serialNumber}`] 
          ? 'opacity-50' 
          : 'hover:shadow-lg'
      }`}
      onClick={() => setSelectedHorse(horseData)}
    >
      <CardContent className="p-2">
        <div className="text-center">
          {horseData.metadata.images && horseData.metadata.images[0] && (
            <div className="mb-1">
              <img 
                src={`https://ipfs.io/ipfs/${horseData.metadata.images[0]}`}
                alt={horseData.metadata.name}
                className="w-10 h-10 object-contain rounded-full mx-auto bg-muted"
              />
            </div>
          )}
          <h4 className="font-semibold text-sm">{horseData.metadata.name}</h4>
          <p className="text-xs text-muted-foreground">{horseData.metadata.breed}</p>
          <p className="text-xs text-muted-foreground">{horseData.metadata.sex}</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderUnknownCard = (name?: string, role?: string) => (
    <Card className="w-40 mb-4">
      <CardContent className="p-2">
        <div className="text-center">
          <div className="mb-1">
            <div className="w-10 h-10 bg-muted rounded-full mx-auto flex items-center justify-center">
              <span className="text-xl text-muted-foreground">?</span>
            </div>
          </div>
          <h4 className="font-semibold text-sm">{name || 'Unknown'}</h4>
          <p className="text-xs text-muted-foreground">{role || 'Unknown'}</p>
        </div>
      </CardContent>
    </Card>
  )

  // Improved renderBranch with better type checking
  const renderBranch = (horseId?: string, horseName?: string, role: ParentType | 'Unknown' = 'Unknown') => {
    if (!horseId || !parents[horseId]) {
      return renderUnknownCard(horseName, role)
    }

    const currentHorse = parents[horseId]
    const { sireId, damId } = currentHorse.metadata.pedigree
    
    return (
      <div className="flex flex-col items-center">
        {renderHorseCard(currentHorse)}
        
        {(sireId || damId) && (
          <div className="flex gap-10 mt-16">
            <div className="flex flex-col items-center">
              {renderBranch(sireId, currentHorse.metadata.pedigree.sireName, 'sire')}
            </div>
            <div className="flex flex-col items-center">
              {renderBranch(damId, currentHorse.metadata.pedigree.damName, 'dam')}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Modify useEffect to fetch all generations at once
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const initializeTree = async () => {
      if (!horseId || horseId.includes('undefined')) return
      
      try {
        setIsLoading('Loading horse details...')
        const response = await fetch(`${API_URL}/nft/${horseId}`, {
          signal: controller.signal
        })
        
        if (!response.ok) throw new Error('Failed to fetch horse details')
        if (!mounted) return
        
        const data = await response.json()
        setHorse(data)
        
        // Initialize all generations
        const queue: FetchQueueItem[] = []
        if (data.metadata.pedigree.sireId) {
          queue.push({ id: data.metadata.pedigree.sireId, depth: 0 })
        }
        if (data.metadata.pedigree.damId) {
          queue.push({ id: data.metadata.pedigree.damId, depth: 0 })
        }
        
        await fetchParentsQueue(queue, 3) // Fetch all generations up to depth 3
      } catch (error: any) {
        if (error.name === 'AbortError') return
        console.error('Error fetching horse:', error)
        showAlert('Error fetching horse details', 'error')
      } finally {
        if (mounted) setIsLoading('')
      }
    }

    initializeTree()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [horseId])

  if (!horse) return null

  return (
    <div className="w-full py-4">
      <div className="max-w-[900px] mx-auto p-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Main Horse at the top */}
            <div className="flex justify-center mb-8">
              {renderHorseCard(horse, true)}
            </div>

            {/* Parents Level */}
            <div className="flex justify-center gap-20">
              {/* Sire Branch */}
              <div className="relative">
                {renderBranch(horse.metadata.pedigree.sireId, horse.metadata.pedigree.sireName, 'sire')}
              </div>

              {/* Dam Branch */}
              <div className="relative">
                {renderBranch(horse.metadata.pedigree.damId, horse.metadata.pedigree.damName, 'dam')}
              </div>
            </div>
          </div>
        </div>

        <HorseDetailsModal
          horse={selectedHorse}
          isOpen={!!selectedHorse}
          onClose={() => setSelectedHorse(null)}
        />
      </div>
    </div>
  )
} 