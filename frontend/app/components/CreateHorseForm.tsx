'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import ImageUpload from './ImageUpload'
import { Horse } from '../types/Horse'
import { coatColors } from '../constants/coatColors'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import FileUpload from './FileUpload'

interface CreateHorseFormProps {
  stableId: string
  onSubmit: (horseData: Horse, images: File[], equineReports: File[]) => Promise<void>
}

export default function CreateHorseForm({ stableId, onSubmit }: CreateHorseFormProps) {
  const [open, setOpen] = useState(false)
  const [horseInfo, setHorseInfo] = useState<Horse>({
    name: '',
    breed: '',
    birthDate: '',
    sex: 'stallion',
    coatColor: '',
    pedigree: {
      sireId: '',
      damId: '',
      sireName: '',
      damName: '',
    },
    currentOwner: '',
    ownershipHistory: [],
    images: [],
    equineReport: [],
    medicalHistory: [],
    competitions: [],
    vaccinations: [],
  })
  const [horseImages, setHorseImages] = useState<File[]>([])
  const [equineReports, setEquineReports] = useState<File[]>([])
  const [date, setDate] = useState<Date>()

  const updateImmutableHorseInfo = (field: keyof Horse, value: any) => {
    setHorseInfo(prev => ({ ...prev, [field]: value }))
  }

  const updateMutableHorseInfo = (field: keyof Horse, value: any) => {
    setHorseInfo(prev => ({ ...prev, [field]: value }))
  }

  const updatePedigreeInfo = (field: keyof Horse['pedigree'], value: string) => {
    setHorseInfo(prev => ({
      ...prev,
      pedigree: {
        ...prev.pedigree,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(horseInfo, horseImages, equineReports)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create New Horse Profile</CardTitle>
          <CardDescription>
            Fill out the form below to create a comprehensive profile for your horse. 
            Fields marked with an asterisk (*) are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pedigree">Pedigree</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horseName" className="text-base font-semibold">
                    Horse Name*
                  </Label>
                  <Input
                    id="horseName"
                    value={horseInfo.name}
                    onChange={(e) => updateImmutableHorseInfo('name', e.target.value)}
                    required
                    className="h-11"
                    placeholder="Official registered name of the horse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed" className="text-base font-semibold">
                    Breed*
                  </Label>
                  <Input
                    id="breed"
                    value={horseInfo.breed}
                    onChange={(e) => updateImmutableHorseInfo('breed', e.target.value)}
                    required
                    placeholder="e.g., Thoroughbred, Arabian, Quarter Horse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-base font-semibold">
                    Sex*
                  </Label>
                  <Select 
                    value={horseInfo.sex} 
                    onValueChange={(value) => updateImmutableHorseInfo('sex', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select horse's sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stallion">Stallion</SelectItem>
                      <SelectItem value="mare">Mare</SelectItem>
                      <SelectItem value="gelding">Gelding</SelectItem>
                      <SelectItem value="colt">Colt</SelectItem>
                      <SelectItem value="filly">Filly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-base font-semibold">
                    Birth Date*
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={horseInfo.birthDate}
                    onChange={(e) => updateImmutableHorseInfo('birthDate', e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Select the horse's date of birth
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coatColor" className="text-base font-semibold">
                    Coat Color*
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-11"
                      >
                        {horseInfo.coatColor && coatColors
                          ? coatColors.find((color) => color.value === horseInfo.coatColor)?.label
                          : "Select coat color..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search coat colors..." />
                        <CommandList>
                          <CommandEmpty>No coat color found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {coatColors.map((color) => (
                              <CommandItem
                                key={color.value}
                                onSelect={() => {
                                  updateImmutableHorseInfo('coatColor', color.value)
                                  setOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    horseInfo.coatColor === color.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {color.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-base font-semibold">
                    Height
                  </Label>
                  <Input
                    id="height"
                    value={horseInfo.height}
                    onChange={(e) => updateMutableHorseInfo('height', e.target.value)}
                    placeholder="Height in hands (e.g., 15.2)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter height in hands (1 hand = 4 inches)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-base font-semibold">
                    Weight
                  </Label>
                  <Input
                    id="weight"
                    value={horseInfo.weight}
                    onChange={(e) => updateMutableHorseInfo('weight', e.target.value)}
                    placeholder="Weight in kilograms (e.g., 500)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter weight in kilograms
                  </p>
                </div>
              </div>

              {/* Horse Photos Section */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base font-semibold">Horse Photos</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload up to 5 high-quality photos. Include different angles and distinctive markings.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {horseImages.length}/5 photos
                  </div>
                </div>
                <ImageUpload 
                  maxImages={5}
                  onImagesChange={setHorseImages}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Recommended views: front, both sides, and any distinctive markings</li>
                    <li>Maximum file size: 5MB per image</li>
                    <li>Accepted formats: JPG, PNG</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="text-base font-semibold" htmlFor="equineReport">Initial Equine Report*</Label>
                <FileUpload
                  maxFiles={3}
                  templatePdfPath="/assets/HorseIdentificationForm.pdf"
                  templateLabel="Horse Identification Form (PDF)"
                  onFilesChange={(files) => { setEquineReports(files) }}
                />
                <p className="text-sm text-muted-foreground">
                  Please download and fill out the template, then upload the completed form along with any supporting documents (up to 3 files total)
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="registrationOrganization" className="text-base font-semibold">
                  Registration Organization
                </Label>
                <Input
                  id="registrationOrganization"
                  value={horseInfo.registrationOrganization}
                  onChange={(e) => updateImmutableHorseInfo('registrationOrganization', e.target.value)}
                  placeholder="e.g., Jockey Club, AQHA, APHA"
                />
                <p className="text-sm text-muted-foreground">
                  Organization where the horse is registered
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="microchipNumber" className="text-base font-semibold">
                  Microchip Number
                </Label>
                <Input
                  id="microchipNumber"
                  value={horseInfo.microchipNumber}
                  onChange={(e) => updateImmutableHorseInfo('microchipNumber', e.target.value)}
                  placeholder="15-digit ISO microchip number"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the horse's microchip identification number
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentOwner" className="text-base font-semibold">
                  Current Owner*
                </Label>
                <Input
                  id="currentOwner"
                  value={horseInfo.currentOwner}
                  onChange={(e) => updateMutableHorseInfo('currentOwner', e.target.value)}
                  required
                  placeholder="Full legal name of current owner"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the current owner's full legal name as it appears on registration documents
                </p>
              </div>
            </TabsContent>

            {/* Pedigree Tab */}
            <TabsContent value="pedigree" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sireId">Sire NFT ID</Label>
                  <Input
                    id="sireId"
                    placeholder="token_id:serial_number"
                    value={horseInfo.pedigree.sireId}
                    onChange={(e) => updatePedigreeInfo('sireId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sireName">Sire Name</Label>
                  <Input
                    id="sireName"
                    placeholder="Father's name"
                    value={horseInfo.pedigree.sireName}
                    onChange={(e) => updatePedigreeInfo('sireName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="damId">Dam NFT ID</Label>
                  <Input
                    id="damId"
                    placeholder="token_id:serial_number"
                    value={horseInfo.pedigree.damId}
                    onChange={(e) => updatePedigreeInfo('damId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="damName">Dam Name</Label>
                  <Input
                    id="damName"
                    placeholder="Mother's name"
                    value={horseInfo.pedigree.damName}
                    onChange={(e) => updatePedigreeInfo('damName', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Medical Tab */}
            <TabsContent value="medical" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="knownAllergies">Known Allergies</Label>
                  <Textarea
                    id="knownAllergies"
                    placeholder="List any known allergies"
                    value={horseInfo.knownAllergies}
                    onChange={(e) => updateMutableHorseInfo('knownAllergies', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="knownHealthConditions">Known Health Conditions</Label>
                  <Textarea
                    id="knownHealthConditions"
                    placeholder="List any known health conditions"
                    value={horseInfo.knownHealthConditions}
                    onChange={(e) => updateMutableHorseInfo('knownHealthConditions', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastCogginsTest">Last Negative Coggins Test</Label>
                  <Input
                    type="date"
                    id="lastCogginsTest"
                    value={horseInfo.lastNegativeCogginsTest}
                    onChange={(e) => updateMutableHorseInfo('lastNegativeCogginsTest', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vaccinations</Label>
                  {horseInfo.vaccinations?.map((vaccination, index) => (
                    <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
                      <span>{vaccination.date} - {vaccination.disease} ({vaccination.route})</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newVaccinations = [...(horseInfo.vaccinations || [])];
                          newVaccinations.splice(index, 1);
                          updateMutableHorseInfo('vaccinations', newVaccinations);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="date"
                      placeholder="Date"
                      id="vaccinationDate"
                    />
                    <Input
                      placeholder="Disease"
                      id="vaccinationDisease"
                    />
                    <Select onValueChange={(value) => document.getElementById('vaccinationRoute')?.setAttribute('value', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Route" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IM">Intramuscular (IM)</SelectItem>
                        <SelectItem value="IN">Intranasal (IN)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      className="col-span-3"
                      onClick={() => {
                        const date = (document.getElementById('vaccinationDate') as HTMLInputElement).value;
                        const disease = (document.getElementById('vaccinationDisease') as HTMLInputElement).value;
                        const route = (document.getElementById('vaccinationRoute') as HTMLInputElement).value as 'IM' | 'IN';
                        
                        if (date && disease && route) {
                          updateMutableHorseInfo('vaccinations', [
                            ...(horseInfo.vaccinations || []),
                            { date, disease, route }
                          ]);
                        }
                      }}
                    >
                      Add Vaccination
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Additional Tab */}
            <TabsContent value="additional" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Ownership History</Label>
                {horseInfo.ownershipHistory.map((ownership, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
                    <span>{ownership.ownerId}: {ownership.fromDate} - {ownership.toDate || 'Present'}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newHistory = [...horseInfo.ownershipHistory];
                        newHistory.splice(index, 1);
                        updateMutableHorseInfo('ownershipHistory', newHistory);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Owner ID"
                    id="ownershipId"
                  />
                  <Input
                    type="date"
                    placeholder="From Date"
                    id="ownershipFromDate"
                  />
                  <Input
                    type="date"
                    placeholder="To Date (optional)"
                    id="ownershipToDate"
                  />
                  <Button
                    type="button"
                    className="col-span-3"
                    onClick={() => {
                      const ownerId = (document.getElementById('ownershipId') as HTMLInputElement).value;
                      const fromDate = (document.getElementById('ownershipFromDate') as HTMLInputElement).value;
                      const toDate = (document.getElementById('ownershipToDate') as HTMLInputElement).value;
                      
                      if (ownerId && fromDate) {
                        updateMutableHorseInfo('ownershipHistory', [
                          ...horseInfo.ownershipHistory,
                          { ownerId, fromDate, toDate }
                        ]);
                      }
                    }}
                  >
                    Add Ownership Record
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Competitions</Label>
                {horseInfo.competitions?.map((competition, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
                    <span>{competition.date} - {competition.name}: {competition.result}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newCompetitions = [...(horseInfo.competitions || [])];
                        newCompetitions.splice(index, 1);
                        updateMutableHorseInfo('competitions', newCompetitions);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Date"
                    id="competitionDate"
                  />
                  <Input
                    placeholder="Competition Name"
                    id="competitionName"
                  />
                  <Input
                    placeholder="Result"
                    id="competitionResult"
                  />
                  <Input
                    placeholder="Award (optional)"
                    id="competitionAward"
                  />
                  <Button
                    type="button"
                    className="col-span-2"
                    onClick={() => {
                      const date = (document.getElementById('competitionDate') as HTMLInputElement).value;
                      const name = (document.getElementById('competitionName') as HTMLInputElement).value;
                      const result = (document.getElementById('competitionResult') as HTMLInputElement).value;
                      const award = (document.getElementById('competitionAward') as HTMLInputElement).value;
                      
                      if (date && name && result) {
                        updateMutableHorseInfo('competitions', [
                          ...(horseInfo.competitions || []),
                          { date, name, result, award }
                        ]);
                      }
                    }}
                  >
                    Add Competition
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Save Draft</Button>
          <Button type="submit">Create Horse Profile</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

