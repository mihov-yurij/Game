import React, { useRef } from 'react';
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Ship({ status, targetX }) {
  const shipRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (shipRef.current) {
      shipRef.current.position.x = THREE.MathUtils.lerp(shipRef.current.position.x, targetX, 0.05);
      shipRef.current.position.y = Math.sin(time * 2) * 0.1;
    }
  });

  const getStatusColor = () => {
    if (status === "Demurrage") return "#ef4444";
    if (status === "Unloading") return "#eab308";
    return "#22c55e";
  };

  return (
    <group ref={shipRef} position={[targetX, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[3, 1, 1.2]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>
      <mesh position={[1, 0.8, 0]}>
        <boxGeometry args={[0.8, 0.8, 1]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={getStatusColor()} />
      </mesh>
    </group>
  );
}
