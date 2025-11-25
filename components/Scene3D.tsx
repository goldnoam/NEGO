import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BlockData, Theme } from '../types';

interface Scene3DProps {
  blocks: BlockData[];
  exploded: boolean;
  theme: Theme;
}

const BlockInstance: React.FC<{ block: BlockData; exploded: boolean; index: number }> = ({ block, exploded, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = new THREE.Vector3(block.x, block.y, block.z);
  const explodedPos = new THREE.Vector3(block.x * 1.5, block.y * 1.5, block.z * 1.5);

  const studGeometry = useMemo(() => new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const target = exploded ? explodedPos : targetPos;
      meshRef.current.position.lerp(target, delta * 3);
      
      if (exploded) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + index) * 0.1;
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime + index) * 0.1;
      } else {
        meshRef.current.rotation.set(0,0,0);
      }
    }
  });

  return (
    <group ref={meshRef as any} position={[block.x, block.y, block.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color={block.color} 
            roughness={0.2} 
            metalness={0.1}
            polygonOffset
            polygonOffsetFactor={1} 
            polygonOffsetUnits={1}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial color="black" transparent opacity={0.1} />
        </lineSegments>
      </mesh>
      
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow geometry={studGeometry}>
        <meshStandardMaterial color={block.color} roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  );
};

const Model: React.FC<{ blocks: BlockData[]; exploded: boolean }> = ({ blocks, exploded }) => {
  return (
    <group>
      {blocks.map((block, i) => (
        <BlockInstance 
          key={`${i}-${block.x}-${block.y}-${block.z}`} 
          block={block} 
          exploded={exploded} 
          index={i}
        />
      ))}
    </group>
  );
};

export const Scene3D: React.FC<Scene3DProps> = ({ blocks, exploded, theme }) => {
  const bgColor = theme === 'dark' ? '#0f172a' : '#f0f4f8'; // slate-900 vs slate-50

  return (
    <div className={`w-full h-full transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={[bgColor]} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        
        <Center>
            <Model blocks={blocks} exploded={exploded} />
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
