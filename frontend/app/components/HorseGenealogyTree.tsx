import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import HorseDetailsModal from './HorseDetailsModal'

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
  level?: number
  maxLevels?: number
  showAlert: (message: string, type: 'success' | 'error') => void
  setIsLoading: (message: string) => void
}

const API_URL = 'http://localhost:3001'

export default function HorseGenealogyTree({ 
  horseId, 
  level = 0, 
  maxLevels = 3,
  showAlert,
  setIsLoading 
}: HorseGenealogyTreeProps) {
  const [horse, setHorse] = useState<HorseNode | null>(null)
  const [sire, setSire] = useState<HorseNode | null>(null)
  const [dam, setDam] = useState<HorseNode | null>(null)
  const [selectedHorse, setSelectedHorse] = useState<HorseNode | null>(null)

  useEffect(() => {
    const fetchHorse = async () => {
      try {
        if (!horseId || horseId.includes('undefined')) return

        const response = await fetch(`${API_URL}/nft/${horseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch horse details')
        }
        const data = await response.json()
        setHorse(data)

        // Fetch parents if we haven't reached max levels
        if (level < maxLevels) {
          if (data.metadata.pedigree.sireId) {
            const sireResponse = await fetch(`${API_URL}/nft/${data.metadata.pedigree.sireId}`)
            if (sireResponse.ok) {
              const sireData = await sireResponse.json()
              setSire(sireData)
            }
          }

          if (data.metadata.pedigree.damId) {
            const damResponse = await fetch(`${API_URL}/nft/${data.metadata.pedigree.damId}`)
            if (damResponse.ok) {
              const damData = await damResponse.json()
              setDam(damData)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching horse:', error)
      }
    }

    fetchHorse()
  }, [horseId, level, maxLevels])

  if (!horse) return null

  const getConnectorStyle = (position: 'left' | 'right') => {
    const baseStyle = "absolute h-8 border-t-2 border-gray-300 w-8"
    return position === 'left' 
      ? `${baseStyle} -left-8 top-1/2` 
      : `${baseStyle} -right-8 top-1/2`
  }

  return (
    <div className="relative">
      <div className="flex justify-center">
        <Card 
          className={`w-48 ${level > 0 ? 'mx-4' : 'mx-0'} cursor-pointer hover:shadow-lg transition-shadow`}
          onClick={() => setSelectedHorse(horse)}
        >
          <CardContent className="p-4">
            <div className="text-center">
              {horse.metadata.images && horse.metadata.images[0] && (
                <div className="mb-2">
                  <img 
                    src={`https://ipfs.io/ipfs/${horse.metadata.images[0]}`}
                    alt={horse.metadata.name}
                    className="w-16 h-16 object-contain rounded-full mx-auto bg-muted"
                  />
                </div>
              )}
              <h4 className="font-semibold">{horse.metadata.name}</h4>
              <p className="text-sm text-muted-foreground">{horse.metadata.breed}</p>
              <p className="text-xs text-muted-foreground">{horse.metadata.sex}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {level < maxLevels && (
        <div className="mt-8">
          <div className="flex justify-center gap-32">
            {/* Sire Branch */}
            <div className="relative">
              {horse.metadata.pedigree.sireId && sire ? (
                <HorseGenealogyTree
                  horseId={horse.metadata.pedigree.sireId}
                  level={level + 1}
                  maxLevels={maxLevels}
                  showAlert={showAlert}
                  setIsLoading={setIsLoading}
                />
              ) : (
                horse.metadata.pedigree.sireName && (
                  <Card className="w-48">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="mb-2">
                          <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                            <span className="text-2xl text-muted-foreground">?</span>
                          </div>
                        </div>
                        <h4 className="font-semibold">{horse.metadata.pedigree.sireName}</h4>
                        <p className="text-sm text-muted-foreground">Sire</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>

            {/* Dam Branch */}
            <div className="relative">
              {horse.metadata.pedigree.damId && dam ? (
                <HorseGenealogyTree
                  horseId={horse.metadata.pedigree.damId}
                  level={level + 1}
                  maxLevels={maxLevels}
                  showAlert={showAlert}
                  setIsLoading={setIsLoading}
                />
              ) : (
                horse.metadata.pedigree.damName && (
                  <Card className="w-48">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="mb-2">
                          <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                            <span className="text-2xl text-muted-foreground">?</span>
                          </div>
                        </div>
                        <h4 className="font-semibold">{horse.metadata.pedigree.damName}</h4>
                        <p className="text-sm text-muted-foreground">Dam</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <HorseDetailsModal
        horse={selectedHorse}
        isOpen={!!selectedHorse}
        onClose={() => setSelectedHorse(null)}
      />
    </div>
  )
} 