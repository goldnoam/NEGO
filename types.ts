export interface BlockData {
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface BuildProject {
  id: string;
  name: string;
  timestamp: number;
  blocks: BlockData[];
}

export enum AppMode {
  BUILDER = 'BUILDER',
  GALLERY = 'GALLERY',
}

export interface GenerationParams {
  prompt?: string;
  imageBase64?: string;
  mimeType?: string;
}
