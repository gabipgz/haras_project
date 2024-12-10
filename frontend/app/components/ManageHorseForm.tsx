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
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <p>Breed: {horseDetails.metadata.breed}</p>
                <p>Birth Date: {new Date(horseDetails.metadata.birthDate).toLocaleDateString()}</p>
                <p>Sex: {horseDetails.metadata.sex}</p>
                <p>Coat Color: {horseDetails.metadata.coatColor}</p>
                <p>Weight: {horseDetails.metadata.weight}</p>
                <p>Height: {horseDetails.metadata.height}</p>
                <p>Registration: {horseDetails.metadata.registrationOrganization}</p>
              </div>

              {/* Pedigree Information */}
              <div>
                <h3 className="font-semibold mb-2">Pedigree</h3>
                <p>Sire ID: {horseDetails.metadata.pedigree.sireId || 'N/A'}</p>
                <p>Sire Name: {horseDetails.metadata.pedigree.sireName || 'N/A'}</p>
                <p>Dam ID: {horseDetails.metadata.pedigree.damId || 'N/A'}</p>
                <p>Dam Name: {horseDetails.metadata.pedigree.damName || 'N/A'}</p>
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h3 className="font-semibold mb-2">Health Information</h3>
              <p>Known Allergies: {horseDetails.metadata.knownAllergies || 'None'}</p>
              <p>Health Conditions: {horseDetails.metadata.knownHealthConditions || 'None'}</p>
              <p>Last Negative Coggins Test: {
                horseDetails.metadata.lastNegativeCogginsTest ? 
                new Date(horseDetails.metadata.lastNegativeCogginsTest).toLocaleDateString() : 
                'N/A'
              }</p>
            </div>

            {/* Medical History */}
            {horseDetails.metadata.medicalHistory.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Medical History</h3>
                <div className="space-y-2">
                  {horseDetails.metadata.medicalHistory.map((record, index) => (
                    <div key={index} className="border p-2 rounded">
                      <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                      <p>Type: {record.type}</p>
                      <p>Description: {record.description}</p>
                      <p>Veterinarian: {record.veterinarian}</p>
                      {record.observations && <p>Observations: {record.observations}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitions */}
            {horseDetails.metadata.competitions && horseDetails.metadata.competitions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Competition History</h3>
                <div className="space-y-2">
                  {horseDetails.metadata.competitions.map((competition, index) => (
                    <div key={index} className="border p-2 rounded">
                      <p>Date: {new Date(competition.date).toLocaleDateString()}</p>
                      <p>Name: {competition.name}</p>
                      <p>Result: {competition.result}</p>
                      {competition.award && <p>Award: {competition.award}</p>}
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
                      className="w-full h-48 object-cover rounded-md"
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
              {horseDetails.messages.map((message, index) => (
                <div key={index} className="space-y-4">
                  {index > 0 && <Separator className="my-4" />}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                    <h4 className="font-semibold mt-1">{message.name}</h4>
                    <p className="mt-1">{message.description}</p>
                  </div>
                  {message.images && message.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {message.images.map((cid, imgIndex) => (
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
              ))}
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