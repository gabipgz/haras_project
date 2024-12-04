import { Injectable, NotFoundException } from '@nestjs/common';
import { HederaService } from '../hedera/hedera.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { Collection } from '../models/collection.model';
import { CredentialsStoreService } from 'src/hedera/credentials-store.service';

@Injectable()
export class CollectionService {
  constructor(
    private readonly hederaService: HederaService,
    private credentialsStore: CredentialsStoreService
  ) {}

  /**
   * Creates a new NFT collection on the Hedera network.
   * 
   * @param createCollectionDto - The DTO containing the collection details (name, symbol, description).
   * @returns A Promise that resolves to a new Collection object.
   * @throws {Error} If there's an issue creating the collection on the Hedera network.
   */
  async createCollection(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const { name, symbol, description } = createCollectionDto;
    
    // Create the NFT collection on Hedera and get the token ID
    const tokenId = await this.hederaService.createNFTCollection(name, symbol);
    
    // Create and return a new Collection object with the provided details and token ID
    return new Collection({
      token_id: tokenId,
      name,
      symbol,
      metadata: description,
      created_timestamp: new Date().toISOString()
    });
  }

  /**
   * Retrieves all NFT collections from a specific wallet on the Hedera network.
   * 
   */
  async getCollections(): Promise<Collection[]> {
    //get the walletId from the credentials
    const credentials = await this.credentialsStore.getCredentials();
    const walletId = credentials.accountId;
    const collections = await this.hederaService.getCollections(walletId);
    return collections.map(collection => new Collection(collection));
  }


  /**
   * Retrieves information about a specific NFT collection from the Hedera network.
   * 
   * @param collectionId - The unique identifier of the collection to retrieve.
   * @returns A Promise that resolves to a Collection object containing the collection details.
   * @throws {NotFoundException} If the collection with the given ID is not found on the Hedera network.
   */
  async getCollection(collectionId: string): Promise<Collection> {
    try {
      // Fetch the collection information from Hedera
      const info = await this.hederaService.getCollectionInfo(collectionId);
      
      // Create and return a Collection object with the retrieved information
      return new Collection({
        token_id: collectionId,
        name: info.name,
        symbol: info.symbol,
        metadata: info.metadata,
        created_timestamp: info.created_timestamp
      });
    } catch (error) {
      // If the collection is not found, throw a NotFoundException
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }
  }

  /**
   * Retrieves all NFT assets within a specific collection from the Hedera network.
   * 
   * @param collectionId - The unique identifier of the collection to retrieve assets from.
   * @returns A Promise that resolves to an array of NFT information objects.
   */
  async getAssetsInCollection(collectionId: string): Promise<any[]> {
    try {
      // First, get the collection info to know how many NFTs exist
      const collectionInfo = await this.hederaService.getCollectionInfo(collectionId);
      const totalSupply = parseInt(collectionInfo.totalSupply);
      
      if (totalSupply === 0) {
        return [];
      }

      const nfts: any[] = [];
      
      // Fetch each NFT by its serial number (1 to totalSupply)
      for (let serialNumber = 1; serialNumber <= totalSupply; serialNumber++) {
        try {
          const nftInfo = await this.hederaService.getNFTInfo(
            collectionId, 
            serialNumber.toString()
          );
          nfts.push(nftInfo);
        } catch (error) {
          // Log the error but continue with the next NFT
          console.error(`Error fetching NFT ${collectionId}:${serialNumber}:`, error);
          continue;
        }
      }

      return nfts;
    } catch (error) {
      throw new Error(`Failed to fetch NFTs for collection ${collectionId}: ${error.message}`);
    }
  }
}
