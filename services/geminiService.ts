
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BlockData, Density } from "../types";

const SYSTEM_INSTRUCTION = `
You are "Nego", an AI architect engine that converts natural language descriptions or images into 3D voxel structures (tiny lego-like blocks).
Your goal is to output a JSON structure representing a 3D object built from 1x1x1 blocks.

Rules:
1. The grid is centered at 0,0,0.
2. Use vibrant, lego-like hex color codes (e.g., "#FF0000", "#0000FF", "#FFCC00").
3. If the user asks for a specific object (e.g., "a red heart", "a castle"), approximate its shape with blocks.
4. Ensure the structure is stable (connected) if possible.
5. Output ONLY the JSON data as specified in the schema.
`;

const blockSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    blocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.INTEGER },
          y: { type: Type.INTEGER },
          z: { type: Type.INTEGER },
          color: { type: Type.STRING },
        },
        required: ["x", "y", "z", "color"],
      },
    },
  },
  required: ["blocks"],
};

export const generateBuild = async (
  prompt: string, 
  density: Density,
  imagePart?: { base64: string; mimeType: string }
): Promise<BlockData[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const contents: any = {};
    const parts: any[] = [];

    let densityInstruction = "";
    switch (density) {
      case 'low':
        densityInstruction = "Create a minimalist, simple structure with fewer blocks. Keep coordinates strictly within -5 to 5.";
        break;
      case 'high':
        densityInstruction = "Create a highly detailed, dense, and solid structure with many blocks. You can use a larger coordinate range, up to -12 to 12.";
        break;
      case 'medium':
      default:
        densityInstruction = "Create a standard detailed structure. Keep coordinates generally within -8 to 8.";
        break;
    }

    if (imagePart) {
      parts.push({
        inlineData: {
          data: imagePart.base64,
          mimeType: imagePart.mimeType,
        },
      });
      parts.push({
        text: `Analyze this image and reconstruct it as a 3D voxel sculpture using blocks. Output the block coordinates and colors. ${densityInstruction}`,
      });
    } else {
      parts.push({
        text: `Build instructions: ${prompt}. Create a creative voxel representation. ${densityInstruction}`,
      });
    }
    
    contents.parts = parts;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: blockSchema,
        temperature: 0.4, 
      },
    });

    const text = response.text;
    if (!text) return [];

    const parsed = JSON.parse(text);
    return parsed.blocks || [];

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
