export interface PublicApiEntry {
  API: string;
  Description: string;
  Auth: string;
  HTTPS: boolean;
  Cors: string;
  Link: string;
  Category: string;
}

export interface PublicApiResponse {
  count: number;
  entries: PublicApiEntry[];
}
