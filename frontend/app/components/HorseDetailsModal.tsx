import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HorseDetailsModalProps {
  horse: {
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
  } | null
  isOpen: boolean
  onClose: () => void
}

export default function HorseDetailsModal({ horse, isOpen, onClose }: HorseDetailsModalProps) {
  if (!horse) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{horse.metadata.name}</DialogTitle>
          <DialogDescription>
            ID: {horse.tokenId}:{horse.serialNumber}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {/* Main Image */}
            {horse.metadata.images && horse.metadata.images[0] && (
              <div className="w-full h-64 relative">
                <img
                  src={`https://ipfs.io/ipfs/${horse.metadata.images[0]}`}
                  alt={horse.metadata.name}
                  className="w-full h-full object-contain rounded-lg bg-muted"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <p>Breed: {horse.metadata.breed}</p>
                <p>Birth Date: {new Date(horse.metadata.birthDate).toLocaleDateString()}</p>
                <p>Sex: {horse.metadata.sex}</p>
                <p>Coat Color: {horse.metadata.coatColor}</p>
                {horse.metadata.weight && <p>Weight: {horse.metadata.weight}</p>}
                {horse.metadata.height && <p>Height: {horse.metadata.height}</p>}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Registration</h3>
                <p>Current Owner: {horse.metadata.currentOwner}</p>
                {horse.metadata.registrationOrganization && (
                  <p>Registration: {horse.metadata.registrationOrganization}</p>
                )}
              </div>
            </div>

            {/* Pedigree Information */}
            <div>
              <h3 className="font-semibold mb-2">Pedigree</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>Sire: {horse.metadata.pedigree.sireName || 'Unknown'}</p>
                  {horse.metadata.pedigree.sireId && (
                    <p className="text-sm text-muted-foreground">ID: {horse.metadata.pedigree.sireId}</p>
                  )}
                </div>
                <div>
                  <p>Dam: {horse.metadata.pedigree.damName || 'Unknown'}</p>
                  {horse.metadata.pedigree.damId && (
                    <p className="text-sm text-muted-foreground">ID: {horse.metadata.pedigree.damId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {horse.metadata.images && horse.metadata.images.length > 1 && (
              <div>
                <h3 className="font-semibold mb-2">Additional Images</h3>
                <div className="grid grid-cols-3 gap-2">
                  {horse.metadata.images.slice(1).map((cid, index) => (
                    <img
                      key={index}
                      src={`https://ipfs.io/ipfs/${cid}`}
                      alt={`${horse.metadata.name} - Image ${index + 2}`}
                      className="w-full h-24 object-contain rounded-md bg-muted"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 