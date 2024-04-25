import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AbstractDatabaseService<EntryModel> {
  protected abstract firebaseUrl: string;

  public async createEntry(entry: EntryModel): Promise<EntryModel> {
    return null;
  }
}
