
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BlockData, Theme } from '../types';

interface Scene3DProps {
  blocks: BlockData[];
  exploded: boolean;
  theme: Theme;
  onBlockClick?: (block: BlockData, faceNormal?: THREE.Vector3, isAlt?: boolean) => void;
}

const BlockInstance: React.FC<{ 
  block: BlockData; 
  exploded: boolean; 
  index: number;
  onBlockClick?: (block: BlockData, faceNormal?: THREE.Vector3, isAlt?: boolean) => void;
}> = ({ block, exploded, index, onBlockClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate target positions
  const targetPos = useMemo(() => new THREE.Vector3(block.x, block.y, block.z), [block]);
  
  // Calculate explosion drift vector (randomized for organic feel)
  const explosionParams = useMemo(() => ({
    offset: new THREE.Vector3(
      block.x * 1.5 + (Math.random() - 0.5) * 2, 
      block.y * 1.5 + 5 + Math.random() * 3, // Significant upward drift
      block.z * 1.5 + (Math.random() - 0.5) * 2
    ),
    rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
    rotationSpeed: (Math.random() - 0.5) * 2
  }), [block]);

  const studGeometry = useMemo(() => new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Position Lerp
      const target = exploded ? explosionParams.offset : targetPos;
      // Floating effect when exploded
      if (exploded) {
         target.y += Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
      }
      meshRef.current.position.lerp(target, delta * 2.5);
      
      // Rotation Lerp
      if (exploded) {
        // Rotate continuously when exploded
        meshRef.current.rotateOnAxis(explosionParams.rotationAxis, explosionParams.rotationSpeed * delta);
      } else {
        // Reset rotation smoothly
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 4);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, delta * 4);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 4);
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onBlockClick) {
        // e.face.normal gives us the direction to add a new block if Alt is pressed
        onBlockClick(block, e.face?.normal || new THREE.Vector3(0,1,0), e.altKey);
    }
  };

  return (
    <group ref={meshRef as any} position={[block.x, block.y, block.z]}>
      <mesh 
        castShadow 
        receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { setHovered(false); }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color={block.color} 
            roughness={0.2} 
            metalness={0.1}
            polygonOffset
            polygonOffsetFactor={1} 
            polygonOffsetUnits={1}
            emissive={hovered && !exploded ? '#444' : '#000'}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial color="black" transparent opacity={0.15} />
        </lineSegments>
      </mesh>
      
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow geometry={studGeometry}>
        <meshStandardMaterial 
            color={block.color} 
            roughness={0.2} 
            metalness={0.1} 
            emissive={hovered && !exploded ? '#444' : '#000'}
        />
      </mesh>
    </group>
  );
};

const Model: React.FC<{ 
  blocks: BlockData[]; 
  exploded: boolean; 
  onBlockClick?: (block: BlockData, faceNormal?: THREE.Vector3, isAlt?: boolean) => void;
}> = ({ blocks, exploded, onBlockClick }) => {
  return (
    <group>
      {blocks.map((block, i) => (
        <BlockInstance 
          key={`${block.x}-${block.y}-${block.z}`} 
          block={block} 
          exploded={exploded} 
          index={i}
          onBlockClick={onBlockClick}
        />
      ))}
    </group>
  );
};

export const Scene3D: React.FC<Scene3DProps> = ({ blocks, exploded, theme, onBlockClick }) => {
  const bgColor = theme === 'dark' ? '#0f172a' : '#f0f4f8';

  return (
    <div className={`w-full h-full transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={[bgColor]} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        
        <Center>
            <Model blocks={blocks} exploded={exploded} onBlockClick={onBlockClick} />
        </Center>

        <Environment preset="city" />
        <ambientLight intensity={theme === 'dark' ? 0.7 : 0.5} />
        <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
        />
        <ContactShadows 
            position={[0, -4, 0]} 
            opacity={theme === 'dark' ? 0.3 : 0.5} 
            scale={20} 
            blur={2} 
            far={4.5} 
            color={theme === 'dark' ? '#000000' : '#333333'}
        />
      </Canvas>
    </div>
  );
};
