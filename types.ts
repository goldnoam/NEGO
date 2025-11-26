
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
  originalPrompt: string;
  originalImage?: string;
}

export enum AppMode {
  BUILDER = 'BUILDER',
  GALLERY = 'GALLERY',
}

export interface GenerationParams {
  prompt?: string;
  imageBase64?: string;
  mimeType?: string;
  density: Density;
}

export type Theme = 'light' | 'dark';
export type Density = 'low' | 'medium' | 'high';
