  export interface Horse {
    name: string
    breed: string
    birthDate: string
    sex: 'stallion' | 'mare' | 'gelding' | 'colt' | 'filly'
    coatColor: string
    weight?: string
    height?: string
    pedigree: {
      sireId?: string
      damId?: string
      sireName?: string
      damName?: string
    }
    equineReport?: string[]
    registrationOrganization?: string
    microchipNumber?: string
    currentOwner: string
    ownershipHistory: Array<{
      ownerId: string
      fromDate: string
      toDate?: string
    }>
    images: string[]
    medicalHistory: Array<{
      date: string
      type: 'vaccine' | 'exam' | 'treatment'
      description: string
      veterinarian: string
      observations?: string
    }>
    competitions?: Array<{
      date: string
      name: string
      result: string
      award?: string
    }>
    knownAllergies?: string
    knownHealthConditions?: string
    diet?: string
    housingStatus?: 'pasture_full_time' | 'stalled_full_time' | 'turned_out_part_time'
    lastNegativeCogginsTest?: string
    vaccinations?: Array<{
      disease: string
      date: string
      route: 'IM' | 'IN'
    }>
  }