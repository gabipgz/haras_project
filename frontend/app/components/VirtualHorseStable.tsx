'use client'

import { useState, useEffect, Key } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import ImageUpload from './ImageUpload'
import LoadingOverlay from './LoadingOverlay'
import ManageHorseForm from './ManageHorseForm'
import CreateHorseForm from './CreateHorseForm'
import { Horse } from '../types/Horse'

interface Collection {
  tokenId: string;
  name: string;
  symbol: string;
  description: string;
  createdAt: Date;
}

const API_URL = 'http://localhost:3001'

export default function VirtualHorseStable() {
  const [stableInfo, setStableInfo] = useState<{
    name: string;
    symbol: string;
    description: string;
    attributes: { trait_type: string; value: string }[];
  }>({ 
    name: '', 
    symbol: '', 
    description: '', 
    attributes: [] 
  })
  const [horseInfo, setHorseInfo] = useState<Horse>({
    name: '',
    breed: '',
    birthDate: '',
    sex: 'stallion',
    coatColor: '',
    weight: '',
    height: '',
    pedigree: {
      sireId: '',
      damId: '',
      sireName: '',
      damName: '',
    },
    equineReport: [],
    registrationOrganization: '',
    microchipNumber: '',
    currentOwner: '',
    ownershipHistory: [],
    images: [],
    medicalHistory: [],
    competitions: [],
    knownAllergies: '',
    knownHealthConditions: '',
    diet: '',
    housingStatus: 'pasture_full_time',
    lastNegativeCogginsTest: '',
    vaccinations: [],
  })
  const [stableId, setStableId] = useState('')
  const [horseId, setHorseId] = useState('')
  const [alert, setAlert] = useState({ message: '', type: '' })
  const [horseStatus, setHorseStatus] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedStableForHorses, setSelectedStableForHorses] = useState<string | null>(null)
  const [showAddHorseForm, setShowAddHorseForm] = useState(false)
  const [stableHorses, setStableHorses] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('step-1');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [horseImages, setHorseImages] = useState<File[]>([])
  const [equineReports, setEquineReports] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState<string>('')
  const [showManageHorseForm, setShowManageHorseForm] = useState(false)
  const [additionalHorseImages, setAdditionalHorseImages] = useState<File[]>([])
  const [eventNote, setEventNote] = useState('')

  useEffect(() => {
    const credentials = localStorage.getItem('hederaCredentials')
    setIsLoggedIn(!!credentials);
    if (credentials) {
      fetchCollections()
    }
  }, [])

  const fetchCollections = async () => {
    try {
      setIsLoading('Fetching stables...')
      const response = await fetch(`${API_URL}/collection`);
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error fetching collections', 'error');
    } finally {
      setIsLoading('')
    }
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type })
    setTimeout(() => setAlert({ message: '', type: '' }), 5000)
  }

  const makeRequest = async (url: string, method: string, body: any = null) => {
    try {
      if (url.includes('undefined')) {
        throw new Error('Invalid request: URL contains undefined parameters');
      }

      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
      }

      const response = await fetch(url, options)
      const text = await response.text()
      let data: any

      try {
        data = JSON.parse(text)
      } catch (e) {
        data = text
      }

      if (!response.ok) {
        throw new Error(typeof data === 'object' && data.message 
          ? data.message 
          : typeof data === 'string' ? data : 'Unknown error')
      }

      return data
    } catch (error: any) {
      showAlert(`Error: ${error.message}`, 'error')
      throw error
    }
  }

  const handleCreateStable = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const credentials = localStorage.getItem('hederaCredentials')
    if (!credentials) {
      showAlert('Please login first', 'error')
      return
    }

    try {
      setIsLoading('Creating stable...')
      const response = await fetch(`${API_URL}/collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: stableInfo.name,
          symbol: stableInfo.symbol,
          description: stableInfo.description
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create stable')
      }

      const result = await response.json()
      showAlert(`Stable created successfully with ID: ${result.id}`, 'success')
      setStableInfo({
        name: '',
        symbol: '',
        description: '',
        attributes: []
      })
      
      await fetchCollections()
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error creating stable', 'error')
    } finally {
      setIsLoading('')
    }
  }

  const handleAddHorse = async (horseData: Horse, images: File[], reports: File[]) => {

    console.log('horseData', horseData);
    console.log('images', images);
    console.log('reports', reports);

    if (!stableId) {
      showAlert('No stable selected. Please select a stable first.', 'error');
      return;
    }

    try {
      setIsLoading('Adding horse to stable...')

      // Create separate FormData for images and reports
      const imageFormData = new FormData();
      images.forEach((image) => { 
        imageFormData.append('images', image) 
      });

      const equineReportFormData = new FormData();
      reports.forEach((report) => { 
        equineReportFormData.append('files', report) 
      });

      // Upload images and reports
      setIsLoading('Uploading images to IPFS...')
      const [imagesResponse, reportsResponse] = await Promise.all([
        fetch(`${API_URL}/ipfs/uploadImages`, {
          method: 'POST',
          body: imageFormData
        }).then(res => res.json()),
        fetch(`${API_URL}/ipfs/uploadFiles`, {
          method: 'POST',
          body: equineReportFormData
        }).then(res => res.json())
      ]);

      const horseImagesCids = imagesResponse.cids;
      const equineReportsCids = reportsResponse.cids;

      console.log('horseImagesCids', horseImagesCids, imagesResponse);
      console.log('equineReportsCids', equineReportsCids, reportsResponse);
      console.log('horseData', {...horseData, equineReport: equineReportsCids, images: horseImagesCids});

      setIsLoading('Creating horse NFT...');

      const result = await makeRequest(`${API_URL}/nft/${stableId}`, 'POST', {
        ...horseData,
        equineReports: equineReportsCids,
        images: horseImagesCids
      });

      handleSuccessfulHorseCreation(result);
      resetHorseForm();
      
      if (selectedStableForHorses) {
        await handleViewHorses(selectedStableForHorses);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading('');
    }
  };

  const handleSuccessfulHorseCreation = (result: any) => {
    const newHorseId = typeof result === 'string' ? result : result?.id;
    if (!newHorseId) throw new Error('Invalid response format from server');
    
    setHorseId(newHorseId);
    showAlert(`Horse "${horseInfo.name}" added successfully!`, 'success');
  };

  const resetHorseForm = () => {
    setHorseInfo({
      name: '',
      breed: '',
      birthDate: '',
      sex: 'stallion',
      coatColor: '',
      weight: '',
      height: '',
      pedigree: {
        sireId: '',
        damId: '',
        sireName: '',
        damName: '',
      },
      equineReport: [],
      registrationOrganization: '',
      microchipNumber: '',
      currentOwner: '',
      ownershipHistory: [],
      images: [],
      medicalHistory: [],
      competitions: [],
      knownAllergies: '',
      knownHealthConditions: '',
      diet: '',
      housingStatus: 'pasture_full_time',
      lastNegativeCogginsTest: '',
      vaccinations: [],
    });
    setHorseImages([]);
  };

  const handleError = (error: unknown) => {
    showAlert(
      error instanceof Error 
        ? `Error adding horse: ${error.message}` 
        : "An unexpected error occurred while adding the horse", 
      'error'
    );
  };

  const handleCheckHorseStatus = async () => {
    if (!horseId || horseId === 'undefined:undefined') {
      showAlert("No valid horse ID. Please add a horse first.", 'error')
      return
    }
    try {
      setIsLoading('Checking horse status...')
      const result = await makeRequest(`${API_URL}/nft/${horseId}`, 'GET')
      if (result && typeof result === 'object') {
        setHorseStatus(JSON.stringify(result, null, 2));
        showAlert("Horse status retrieved successfully", 'success');
      } else {
        throw new Error("Received invalid data from server")
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('failed to parse entity id')) {
          showAlert("Invalid horse ID format. Please ensure you've added a horse correctly.", 'error')
        } else {
          showAlert(`Error checking horse status: ${error.message}`, 'error')
        }
      } else {
        showAlert("An unexpected error occurred while checking horse status.", 'error')
      }
      setHorseStatus(null);
    } finally {
      setIsLoading('')
    }
  }

  const handleViewHorses = async (stableId: string) => {
    try {
      setIsLoading('Fetching horses...')
      const response = await fetch(`${API_URL}/collection/${stableId}/assets`)
      if (!response.ok) {
        throw new Error('Failed to fetch horses')
      }
      const data = await response.json()
      setStableHorses(data)
      setSelectedStableForHorses(stableId)
      setShowAddHorseForm(false)
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error fetching horses', 'error')
    } finally {
      setIsLoading('')
    }
  }

  const handleManageHorse = (tokenId: string, serialNumber: string) => {
    console.log('Managing horse:', tokenId, serialNumber)
    const fullHorseId = `${tokenId}:${serialNumber}`
    console.log('Full horse ID:', fullHorseId)
    
    setShowAddHorseForm(false)
    
    setHorseId(fullHorseId)
    setShowManageHorseForm(true)
    
    console.log('States after setting:', {
      horseId: fullHorseId,
      showManageHorseForm: true,
      showAddHorseForm: false,
      selectedStableForHorses
    })
  }

  const updateHorseInfo = (field: string, value: string) => {
    setHorseInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateStableInfo = (field: string, value: string) => {
    setStableInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Virtual Horse Stable</CardTitle>
            <CardDescription>Please log in to access your virtual horse stable</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You need to connect your Hedera wallet to use this feature.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showManageHorseForm && horseId) {
    console.log('Attempting to render manage form')
    return (
      <ManageHorseForm 
        horseId={horseId}
        onClose={() => {
          console.log('Closing manage horse form')
          setShowManageHorseForm(false)
          setSelectedStableForHorses(null)
        }}
        onSubmitSuccess={() => {
          console.log('Submit success, closing form')
          setShowManageHorseForm(false)
          if (selectedStableForHorses) {
            handleViewHorses(selectedStableForHorses)
          }
        }}
        showAlert={showAlert}
        setIsLoading={setIsLoading}
      />
    )
  }

  if (showAddHorseForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => setShowAddHorseForm(false)} 
          className="mb-4"
        >
          ← Back to Stables
        </Button>
        
        <CreateHorseForm 
          stableId={stableId}
          onSubmit={handleAddHorse}
        />
      </div>
    )
  }

  if (selectedStableForHorses) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => setSelectedStableForHorses(null)} 
          className="mb-4"
        >
          ← Back to Stables
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stableHorses.map((horse, index) => (
            <Card key={`${horse.tokenId}-${horse.serialNumber}`}>
              <CardHeader>
                <CardTitle>{horse.metadata.name}</CardTitle>
                <CardDescription>
                  Token ID: {horse.tokenId}
                  <br />
                  Serial #: {horse.serialNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{horse.metadata.description}</p>
                {horse.metadata.images && horse.metadata.images.length > 0 && (
                  <div className="space-y-2">
                    {horse.metadata.images.map((cid: any, imgIndex: number) => (
                      <img 
                        key={imgIndex}
                        src={`https://ipfs.io/ipfs/${cid}`}
                        alt={`${horse.metadata.name} - Image ${imgIndex + 1}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(horse.creationTime).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  onClick={() => handleManageHorse(horse.tokenId, horse.serialNumber)}
                  className="mt-4"
                >
                  Manage Horse
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading && <LoadingOverlay message={isLoading} />}

      <h1 className="text-3xl font-bold mb-6">Virtual Horse Stable</h1>

      {alert.message && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Stable</CardTitle>
          <CardDescription>Set up a cozy home for your virtual horses</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateStable} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stableName">Stable Name</Label>
              <Input
                id="stableName"
                placeholder="e.g., Sunnybrook Stables"
                value={stableInfo.name}
                onChange={(e) => updateStableInfo('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stableSymbol">Stable Symbol</Label>
              <Input
                id="stableSymbol"
                placeholder="e.g., SBS"
                value={stableInfo.symbol}
                onChange={(e) => updateStableInfo('symbol', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stableDescription">Stable Description</Label>
              <Textarea
                id="stableDescription"
                placeholder="Describe your stable..."
                value={stableInfo.description}
                onChange={(e) => updateStableInfo('description', e.target.value)}
                required
              />
            </div>
            <Button type="submit">Create Stable</Button>
          </form>
        </CardContent>
      </Card>

      {collections.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Stables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection, index) => {
              return (
                <Card key={`${collection.tokenId}-${index}`}>
                  <CardHeader>
                    <CardTitle>{collection.name}</CardTitle>
                    <CardDescription>{collection.symbol}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{collection.description}</p>
                    <div className="flex justify-between gap-2">
                      <Button 
                        onClick={() => {
                          setStableId(collection.tokenId);
                          setShowAddHorseForm(true);
                        }}
                      >
                        Add Horse
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewHorses(collection.tokenId)}
                      >
                        View Horses
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Horse Management Modal/Form can be added here if needed */}
    </div>
  )
}
