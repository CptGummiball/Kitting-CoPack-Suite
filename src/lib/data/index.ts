import { flatFileRepository } from './flatfile/repository';
import type { DataRepository } from './types';

// Central data access — swap implementation here
// Currently uses flat-file; can be replaced with MySQL/Firebase
export function getRepository(): DataRepository {
  return flatFileRepository;
}

export const db = getRepository();
