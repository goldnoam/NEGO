import { BlockData } from "../types";

// Very basic OBJ export simulation
export const exportToOBJ = (blocks: BlockData[], name: string) => {
  let objContent = "# Nego Generated 3D Object\n";
  let vertexCount = 1;

  // A simple 1x1x1 cube definition relative to center
  const cubeVertices = [
    // Front
    [-0.5, -0.5,  0.5], [ 0.5, -0.5,  0.5], [ 0.5,  0.5,  0.5], [-0.5,  0.5,  0.5],
    // Back
    [-0.5, -0.5, -0.5], [-0.5,  0.5, -0.5], [ 0.5,  0.5, -0.5], [ 0.5, -0.5, -0.5],
  ];
  
  // Faces (indices 1-based)
  // This is a simplified mesh export (not optimized for shared vertices for simplicity)
  // Actually, for an OBJ of separate cubes, we just iterate blocks
  
  blocks.forEach(block => {
      // Vertices for this block
      cubeVertices.forEach(v => {
          objContent += `v ${block.x + v[0]} ${block.y + v[1]} ${block.z + v[2]}\n`;
      });
  });

  // Faces
  blocks.forEach((_, i) => {
      const offset = i * 8;
      // Front
      objContent += `f ${offset+1} ${offset+2} ${offset+3} ${offset+4}\n`;
      // Back
      objContent += `f ${offset+8} ${offset+7} ${offset+6} ${offset+5}\n`;
      // Top
      objContent += `f ${offset+4} ${offset+3} ${offset+7} ${offset+6}\n`;
      // Bottom
      objContent += `f ${offset+1} ${offset+5} ${offset+8} ${offset+2}\n`;
      // Right
      objContent += `f ${offset+2} ${offset+8} ${offset+7} ${offset+3}\n`;
      // Left
      objContent += `f ${offset+5} ${offset+1} ${offset+4} ${offset+6}\n`;
  });

  const blob = new Blob([objContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.obj`;
  a.click();
  URL.revokeObjectURL(url);
};

export const generateInstructions = (blocks: BlockData[], name: string) => {
  // Group by Y (layers)
  const layers: Record<number, BlockData[]> = {};
  blocks.forEach(b => {
    if (!layers[b.y]) layers[b.y] = [];
    layers[b.y].push(b);
  });

  const sortedY = Object.keys(layers).map(Number).sort((a,b) => a - b);
  
  let text = `NEGO Build Instructions for "${name}"\n\n`;
  text += `Total Blocks: ${blocks.length}\n`;
  text += `(C) Noam Gold AI 2025\n\n`;

  sortedY.forEach((y, index) => {
      text += `Step ${index + 1} (Layer Height ${y}):\n`;
      layers[y].forEach(b => {
          text += ` - Place ${b.color} block at X:${b.x}, Z:${b.z}\n`;
      });
      text += "\n";
  });

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_instructions.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
