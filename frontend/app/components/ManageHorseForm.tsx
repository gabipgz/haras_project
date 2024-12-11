'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ImageUpload from './ImageUpload'
import { Horse } from '../types/Horse'
import HorseGenealogyTree from './HorseGenealogyTree'

interface HorseDetails {
  tokenId: string
  serialNumber: string
  owner: string
  metadata: Horse
  messages: Array<{
    message: any
    name: string
    description: string
    images?: string[]
    timestamp: string
  }>
  creationTime: string
}

interface ManageHorseFormProps {
  horseId: string
  onClose: () => void
  onSubmitSuccess: () => void
  showAlert: (message: string, type: 'success' | 'error') => void
  setIsLoading: (message: string) => void
}

const API_URL = 'http://localhost:3001'

export default function ManageHorseForm({ 
  horseId, 
  onClose, 
  onSubmitSuccess,
  showAlert,
  setIsLoading 
}: ManageHorseFormProps) {
  const [additionalHorseImages, setAdditionalHorseImages] = useState<File[]>([])
  const [eventNote, setEventNote] = useState('')
  const [horseDetails, setHorseDetails] = useState<HorseDetails | null>(null)

  useEffect(() => {
    const fetchHorseDetails = async () => {
      try {
        setIsLoading('Fetching horse details...')
        const response = await fetch(`${API_URL}/nft/${horseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch horse details')
        }
        const data = await response.json()
        console.log('Fetched horse details:', data)
        setHorseDetails(data)
      } catch (error) {
        showAlert(error instanceof Error ? error.message : 'Error fetching horse details', 'error')
      } finally {
        setIsLoading('')
      }
    }

    fetchHorseDetails()
  }, [horseId])

  const handleRecordEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Recording event for horse:', horseId)
    
    try {
      setIsLoading('Recording event...')
      
      let imageCids: string[] = []
      if (additionalHorseImages.length > 0) {
        const formData = new FormData()
        additionalHorseImages.forEach((image) => {
          formData.append('images', image)
        })

        setIsLoading('Uploading images to IPFS...')
        const ipfsResponse = await fetch(`${API_URL}/ipfs/upload`, {
          method: 'POST',
          body: formData
        })

        if (!ipfsResponse.ok) {
          throw new Error('Failed to upload images to IPFS')
        }

        const { cids } = await ipfsResponse.json()
        imageCids = cids
      }

      const eventData = {
        name: 'Horse Update',
        description: eventNote,
        images: imageCids
      }

      const response = await fetch(`${API_URL}/nft/${horseId}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        throw new Error('Failed to record event')
      }

      showAlert('Horse update recorded successfully!', 'success')
      setEventNote('')
      setAdditionalHorseImages([])
      onSubmitSuccess()
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error recording event', 'error')
    } finally {
      setIsLoading('')
    }
  }

  if (!horseDetails) {
    return <div>Loading horse details...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={onClose} 
        className="mb-4"
      >
        ← Back to Horses
      </Button>

      {/* Horse Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{horseDetails.metadata.name}</CardTitle>
          <CardDescription>
            Token ID: {horseDetails.tokenId}
            <br />
            Serial #: {horseDetails.serialNumber}
            <br />
            Owner: {horseDetails.owner}
            <br />
            Created: {new Date(horseDetails.creationTime).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Basic Information</h3>
                <dl className="space-y-2">
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Breed:</dt>
                    <dd className="text-sm">{horseDetails.metadata.breed}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Birth Date:</dt>
                    <dd className="text-sm">{new Date(horseDetails.metadata.birthDate).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Sex:</dt>
                    <dd className="text-sm">{horseDetails.metadata.sex}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Coat Color:</dt>
                    <dd className="text-sm">{horseDetails.metadata.coatColor}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Weight:</dt>
                    <dd className="text-sm">{horseDetails.metadata.weight}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Height:</dt>
                    <dd className="text-sm">{horseDetails.metadata.height}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Registration:</dt>
                    <dd className="text-sm">{horseDetails.metadata.registrationOrganization}</dd>
                  </div>
                </dl>
              </div>

              {/* Pedigree Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Pedigree</h3>
                <dl className="space-y-2">
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Sire ID:</dt>
                    <dd className="text-sm">{horseDetails.metadata.pedigree.sireId || 'N/A'}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Sire Name:</dt>
                    <dd className="text-sm">{horseDetails.metadata.pedigree.sireName || 'N/A'}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Dam ID:</dt>
                    <dd className="text-sm">{horseDetails.metadata.pedigree.damId || 'N/A'}</dd>
                  </div>
                  <div className="flex items-baseline">
                    <dt className="w-32 text-sm font-medium text-muted-foreground">Dam Name:</dt>
                    <dd className="text-sm">{horseDetails.metadata.pedigree.damName || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Health Information</h3>
              <dl className="space-y-2">
                <div className="flex items-baseline">
                  <dt className="w-32 text-sm font-medium text-muted-foreground">Allergies:</dt>
                  <dd className="text-sm">{horseDetails.metadata.knownAllergies || 'None'}</dd>
                </div>
                <div className="flex items-baseline">
                  <dt className="w-32 text-sm font-medium text-muted-foreground">Conditions:</dt>
                  <dd className="text-sm">{horseDetails.metadata.knownHealthConditions || 'None'}</dd>
                </div>
                <div className="flex items-baseline">
                  <dt className="w-32 text-sm font-medium text-muted-foreground">Last Coggins:</dt>
                  <dd className="text-sm">
                    {horseDetails.metadata.lastNegativeCogginsTest ? 
                      new Date(horseDetails.metadata.lastNegativeCogginsTest).toLocaleDateString() : 
                      'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Medical History */}
            {horseDetails.metadata.medicalHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Medical History</h3>
                <div className="space-y-4">
                  {horseDetails.metadata.medicalHistory.map((record, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="font-medium mt-1">{record.type}</div>
                      <div className="text-sm mt-1">{record.description}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Veterinarian: {record.veterinarian}
                      </div>
                      {record.observations && (
                        <div className="text-sm mt-1 italic">
                          {record.observations}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitions */}
            {horseDetails.metadata.competitions && horseDetails.metadata.competitions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Competition History</h3>
                <div className="space-y-4">
                  {horseDetails.metadata.competitions.map((competition, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(competition.date).toLocaleDateString()}
                      </div>
                      <div className="font-medium mt-1">{competition.name}</div>
                      <div className="text-sm mt-1">Result: {competition.result}</div>
                      {competition.award && (
                        <div className="text-sm text-primary mt-1">
                          Award: {competition.award}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {horseDetails.metadata.images && horseDetails.metadata.images.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {horseDetails.metadata.images.map((cid, index) => (
                    <img 
                      key={index}
                      src={`https://ipfs.io/ipfs/${cid}`}
                      alt={`${horseDetails.metadata.name} - Image ${index + 1}`}
                      className="w-full h-48 object-contain rounded-md bg-gray-100"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Genealogical Tree */}
            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold mb-4">Genealogical Tree</h3>
              <HorseGenealogyTree
                horseId={horseId}
                showAlert={showAlert}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update History Card */}
      {horseDetails.messages && horseDetails.messages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Update History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {horseDetails.messages.map((messageWrapper, index) => {
                const message = messageWrapper.message;
                return (
                  <div key={index} className="space-y-4">
                    {index > 0 && <Separator className="my-4" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                          {message.eventType}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <h4 className="font-semibold mt-2">{message.name}</h4>
                      <p className="mt-1 text-sm">{message.description}</p>
                      {message.data && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md">
                          <div className="text-sm space-y-1">
                            {Object.entries(message.data).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium w-24">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {message.images && message.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {message.images.map((cid: string, imgIndex: number) => (
                          <img 
                            key={imgIndex}
                            src={`https://ipfs.io/ipfs/${cid}`}
                            alt={`Update ${index + 1} - Image ${imgIndex + 1}`}
                            className="w-full h-48 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Update Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Update</CardTitle>
          <CardDescription>Record new information or changes about your horse</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecordEvent} className="space-y-6">
            <div className="space-y-2">
              <Label>Add New Images</Label>
              <ImageUpload 
                maxImages={5}
                onImagesChange={setAdditionalHorseImages}
              />
              <p className="text-sm text-muted-foreground">
                Upload up to 5 new images of your horse
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventNote">Update Note</Label>
              <Textarea
                id="eventNote"
                placeholder="Add notes about your horse's update..."
                value={eventNote}
                onChange={(e) => setEventNote(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
            >
              Record Update
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 