export type AreaStatus = "ACTIVA" | "INACTIVA";

export interface Area {
  id: number | string;
  name: string;
  acronym: string;
  status: AreaStatus;
  createdAt: string;
  updatedAt: string;
}

interface AreaResponse {
  count: number;
  next: string;
  previous: string;
  results: Area[];
}

export { Area, AreaResponse, AreaStatus };