import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BlockData } from '../types';

interface Scene3DProps {
  blocks: BlockData[];
  exploded: boolean;
  screenshotRef?: React.MutableRefObject<string | null>;
}

const BlockInstance: React.FC<{ block: BlockData; exploded: boolean; index: number }> = ({ block, exploded, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = new THREE.Vector3(block.x, block.y, block.z);
  const explodedPos = new THREE.Vector3(block.x * 1.5, block.y * 1.5, block.z * 1.5);

  // Simple stud geometry on top
  const studGeometry = useMemo(() => new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth lerp for explosion effect
      const target = exploded ? explodedPos : targetPos;
      meshRef.current.position.lerp(target, delta * 3);
      
      // Slight floating animation if exploded
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
      {/* Main block body */}
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
        {/* Edges for that cartoon look */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial color="black" transparent opacity={0.1} />
        </lineSegments>
      </mesh>
      
      {/* Stud on top */}
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

export const Scene3D: React.FC<Scene3DProps> = ({ blocks, exploded }) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-300">
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={['#f0f4f8']} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        
        <Center>
            <Model blocks={blocks} exploded={exploded} />
        </Center>

        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
        />
        <ContactShadows position={[0, -4, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
};
