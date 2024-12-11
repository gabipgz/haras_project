import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { HederaService } from '../hedera/hedera.service';
import { CreateNFTDto } from '../dto/create-nft.dto';
import { UpdateNFTDto } from '../dto/update-nft.dto';

@Injectable()
export class NFTService {
  private readonly logger = new Logger(NFTService.name);

  constructor(private readonly hederaService: HederaService) {}

  /**
   * Creates a new NFT in the specified collection.
   * @param collectionId The ID of the collection to mint the NFT in.
   * @param createNFTDto The DTO containing NFT creation details.
   * @returns A promise that resolves to the newly created NFT ID.
   */
  async createNFT(collectionId: string, createNFTDto: CreateNFTDto): Promise<string> {
    this.logger.log(`Creating Horse NFT in collection: ${collectionId}`);

    // Construct the complete metadata object
    const metadata = {
      name: createNFTDto.name,
      breed: createNFTDto.breed,
      birthDate: createNFTDto.birthDate,
      sex: createNFTDto.sex,
      coatColor: createNFTDto.coatColor,
      weight: createNFTDto.weight,
      height: createNFTDto.height,
      pedigree: createNFTDto.pedigree,
      equineReport: createNFTDto.equineReport,
      registrationOrganization: createNFTDto.registrationOrganization,
      microchipNumber: createNFTDto.microchipNumber,
      currentOwner: createNFTDto.currentOwner,
      ownershipHistory: createNFTDto.ownershipHistory,
      images: createNFTDto.images,
      medicalHistory: createNFTDto.medicalHistory,
      competitions: createNFTDto.competitions,
      knownAllergies: createNFTDto.knownAllergies,
      knownHealthConditions: createNFTDto.knownHealthConditions,
      diet: createNFTDto.diet,
      housingStatus: createNFTDto.housingStatus,
      lastNegativeCogginsTest: createNFTDto.lastNegativeCogginsTest,
      vaccinations: createNFTDto.vaccinations,
      createdAt: new Date().toISOString(),
    };

    this.logger.debug('Horse metadata:', metadata);

    try {
      // Create a topic for this horse's event history
      const topicId = await this.hederaService.createTopic(`Horse NFT Topic - ${collectionId}`);
      
      // Add the topic ID to metadata for future reference
      const metadataWithTopic = { ...metadata, topicId };
      
      // Create an immutable file with the metadata
      const fileId = await this.hederaService.createImmutableFile(metadataWithTopic);
      
      // Mint the NFT with the metadata file
      const serialNumber = await this.hederaService.mintNFT(collectionId, fileId);
      
      const nftId = `${collectionId}:${serialNumber}`;
      this.logger.log(`Horse NFT created successfully: ${nftId}`);
      
      // Create initial event for horse creation
      await this.writeEvent(nftId, {
        name: 'Horse Created',
        description: `Horse ${metadata.name} was registered in the system`,
        timestamp: new Date().toISOString(),
        eventType: 'CREATION',
        data: {
          name: metadata.name,
          breed: metadata.breed,
          birthDate: metadata.birthDate,
          sex: metadata.sex,
        }
      });

      return nftId;
    } catch (error) {
      this.logger.error(`Error creating Horse NFT: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves information about a specific NFT.
   * @param nftId The ID of the NFT to retrieve information for.
   * @returns A promise that resolves to the NFT information.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  async getNFTInfo(nftId: string): Promise<any> {
    const [collectionId, serialNumber] = this.parseNftId(nftId);
    
    try {
      const nftInfo = await this.hederaService.getNFTInfo(collectionId, serialNumber);
      this.logger.log(`Retrieved info for NFT: ${nftId}`);
      
      // If metadata is a string, try to parse it as JSON
      if (typeof nftInfo.metadata === 'string') {
        try {
          nftInfo.metadata = JSON.parse(nftInfo.metadata);
        } catch (error) {
          this.logger.warn(`Failed to parse metadata as JSON for NFT ${nftId}`);
        }
      }
      
      return nftInfo;
    } catch (error) {
      this.logger.error(`Error retrieving NFT info: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Writes an event to the NFT's associated topic.
   * @param nftId The ID of the NFT to write the event for.
   * @param message The event message to write.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  async writeEvent(nftId: string, message: {
    name: string;
    description: string;
    timestamp?: string;
    eventType?: string;
    data?: any;
  }): Promise<void> {
    const [collectionId, serialNumber] = this.parseNftId(nftId);

    this.logger.log(`Writing event to Horse NFT: ${nftId}`);
    this.logger.debug('Event message:', message);

    try {
      const currentInfo = await this.getNFTInfo(nftId);
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      };

      await this.hederaService.submitMessage(
        currentInfo.metadata.topicId, 
        JSON.stringify(messageWithTimestamp)
      );
      this.logger.log(`Event written successfully to Horse NFT: ${nftId}`);
    } catch (error) {
      this.logger.error(`Error writing event to Horse NFT: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves the history of events for a specific NFT.
   * @param nftId The ID of the NFT to retrieve history for.
   * @returns A promise that resolves to an array of historical events.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  async getNFTHistory(nftId: string): Promise<any[]> {
    const [collectionId, serialNumber] = this.parseNftId(nftId);

    this.logger.log(`Retrieving history for NFT: ${nftId}`);

    try {
      const currentInfo = await this.getNFTInfo(nftId);
      const messages = await this.hederaService.getMessagesFromMirrorNode(currentInfo.metadata.topicId);

      this.logger.log(`Retrieved ${messages.length} historical events for NFT: ${nftId}`);
      return messages.map(msg => msg.message);
    } catch (error) {
      this.logger.error(`Error retrieving NFT history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Parses an NFT ID into its collection ID and serial number components.
   * @param nftId The NFT ID to parse.
   * @returns An array containing the collection ID and serial number.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  private parseNftId(nftId: string): [string, string] {
    const [collectionId, serialNumber] = nftId.split(':');
    if (!collectionId || !serialNumber) {
      this.logger.error(`Invalid NFT ID format: ${nftId}`);
      throw new NotFoundException('Invalid NFT ID format');
    }
    return [collectionId, serialNumber];
  }
}
