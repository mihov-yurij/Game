import React from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { Ship } from "../Ship";

export function PortScene({ shipData, isCraneBroken }) {
  return (
    <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Sky sunPosition={[100, 10, 100]} />
      <OrbitControls enablePan={true} enableZoom={true} />
      
      {/* 3D Корабль */}
      <Ship status={shipData.status} targetX={shipData.targetX} />
      
      {/* 3D Вода */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>
      
      {/* 3D Причал */}
      <mesh position={[0, -0.45, -1]}>
        <boxGeometry args={[10, 0.1, 2]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>

      {/* 3D Портальный Кран */}
      <group position={[0, -0.4, -1.8]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.4, 2, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 2, 0.8]}>
          <boxGeometry args={[0.3, 0.3, 2]} />
          <meshStandardMaterial color={isCraneBroken ? "#ef4444" : "#eab308"} roughness={0.2} />
        </mesh>
      </group>
    </Canvas>
  );
}
