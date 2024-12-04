export class Collection {
    token_id: string;
    name: string;
    symbol: string;
    metadata: string;
    created_timestamp: string;
  
    constructor(partial: Partial<Collection>) {
      Object.assign(this, partial);
    }
  }