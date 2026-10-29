import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FitnessCanvas3DProps {
  interactive?: boolean;
  className?: string;
}

export const FitnessCanvas3D: React.FC<FitnessCanvas3DProps> = ({
  interactive = true,
  className = 'w-full h-full min-h-[380px]',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Root Group for interactive rotation
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 4, 12);
    emeraldLight.position.set(3, 3, 2);
    scene.add(emeraldLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 4, 12);
    cyanLight.position.set(-3, 2, -1);
    scene.add(cyanLight);

    const indigoLight = new THREE.PointLight(0x6366f1, 3, 10);
    indigoLight.position.set(0, -2, 2);
    scene.add(indigoLight);

    // Materials
    const glowEmeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });

    const glowCyanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.7,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9,
    });

    // 1. Stylized Athletic Humanoid Runner (Joints and Limbs)
    const runnerGroup = new THREE.Group();
    rootGroup.add(runnerGroup);
    runnerGroup.position.y = -0.5;

    // Head
    const headGeo = new THREE.IcosahedronGeometry(0.24, 2);
    const head = new THREE.Mesh(headGeo, glowCyanMat);
    head.position.set(0, 2.3, 0.1);
    runnerGroup.add(head);

    // Torso / Core
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.8, 8);
    const torso = new THREE.Mesh(torsoGeo, glowEmeraldMat);
    torso.position.set(0, 1.5, 0);
    torso.rotation.x = 0.2; // slight athletic forward lean
    runnerGroup.add(torso);

    // Glowing Heart / Energy Core
    const coreGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const coreMesh = new THREE.Mesh(coreGeo, jointMat);
    coreMesh.position.set(0, 1.55, 0.15);
    runnerGroup.add(coreMesh);

    // Hip joint
    const hipGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const hip = new THREE.Mesh(hipGeo, glowEmeraldMat);
    hip.position.set(0, 1.05, -0.05);
    runnerGroup.add(hip);

    // Legs: Left Leg (forward stride) & Right Leg (trailing stride)
    const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.6, 8);
    const lowerLegGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.6, 8);
    const sphereJoint = new THREE.SphereGeometry(0.07, 12, 12);

    // Left Thigh & Shin
    const leftThigh = new THREE.Mesh(legGeo, glowCyanMat);
    const leftKnee = new THREE.Mesh(sphereJoint, jointMat);
    const leftShin = new THREE.Mesh(lowerLegGeo, glowEmeraldMat);
    runnerGroup.add(leftThigh, leftKnee, leftShin);

    // Right Thigh & Shin
    const rightThigh = new THREE.Mesh(legGeo, glowCyanMat);
    const rightKnee = new THREE.Mesh(sphereJoint, jointMat);
    const rightShin = new THREE.Mesh(lowerLegGeo, glowEmeraldMat);
    runnerGroup.add(rightThigh, rightKnee, rightShin);

    // Arms: Left Arm (back) & Right Arm (forward)
    const armGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.5, 8);
    const forearmGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.5, 8);

    const leftBicep = new THREE.Mesh(armGeo, glowCyanMat);
    const leftElbow = new THREE.Mesh(sphereJoint, jointMat);
    const leftForearm = new THREE.Mesh(forearmGeo, glowEmeraldMat);
    runnerGroup.add(leftBicep, leftElbow, leftForearm);

    const rightBicep = new THREE.Mesh(armGeo, glowCyanMat);
    const rightElbow = new THREE.Mesh(sphereJoint, jointMat);
    const rightForearm = new THREE.Mesh(forearmGeo, glowEmeraldMat);
    runnerGroup.add(rightBicep, rightElbow, rightForearm);

    // 2. Concentric 3D Activity Rings (Steps, Hydration, Energy)
    const createActivityRing = (radius: number, tubeRadius: number, colorHex: number, tiltX: number, tiltZ: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, tubeRadius, 16, 80);
      const ringMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 1.2, 0);
      ring.rotation.x = tiltX;
      ring.rotation.z = tiltZ;
      rootGroup.add(ring);
      return ring;
    };

    const ringSteps = createActivityRing(1.6, 0.025, 0x10b981, Math.PI / 2.3, 0.2);
    const ringHydration = createActivityRing(1.9, 0.02, 0x06b6d4, Math.PI / 2.8, -0.4);
    const ringCalories = createActivityRing(2.2, 0.018, 0x6366f1, Math.PI / 2.0, 0.6);

    // 3. Floating Step Energy Particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = Math.random() * 3 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      velocities[i] = 0.005 + Math.random() * 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // 4. Subtle Base Platform (Frosted Glass Disc)
    const platformGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.08, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.9,
      transparent: true,
      opacity: 0.6,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.55;
    rootGroup.add(platform);

    // Interactive Drag / Parallax
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0.3;
    let targetRotationX = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        targetRotationY += deltaX * 0.008;
        prevMouseX = e.clientX;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth inertia rotation
      rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.05;

      // Auto rotation when not dragging
      if (!isDragging) {
        targetRotationY += 0.004;
      }

      // Rotate activity rings at variable speeds
      ringSteps.rotation.y = elapsedTime * 0.4;
      ringHydration.rotation.y = -elapsedTime * 0.3;
      ringCalories.rotation.y = elapsedTime * 0.2;

      // Pulse Energy Core
      const pulse = 1 + Math.sin(elapsedTime * 4) * 0.15;
      coreMesh.scale.set(pulse, pulse, pulse);

      // Procedural Runner Leg & Arm Kinematics (Simulating dynamic running gait)
      const runCycle = elapsedTime * 4.5;
      const legStride = Math.sin(runCycle);
      const legStrideCos = Math.cos(runCycle);

      // Left leg
      leftThigh.position.set(-0.18, 0.75 + Math.sin(runCycle) * 0.08, legStride * 0.25);
      leftThigh.rotation.x = legStride * 0.7;
      leftKnee.position.set(-0.18, 0.45, legStride * 0.35);
      leftShin.position.set(-0.18, 0.18, legStride * 0.25 - 0.1);
      leftShin.rotation.x = Math.max(0, -legStride * 0.9);

      // Right leg (opposite phase)
      rightThigh.position.set(0.18, 0.75 - Math.sin(runCycle) * 0.08, -legStride * 0.25);
      rightThigh.rotation.x = -legStride * 0.7;
      rightKnee.position.set(0.18, 0.45, -legStride * 0.35);
      rightShin.position.set(0.18, 0.18, -legStride * 0.25 - 0.1);
      rightShin.rotation.x = Math.max(0, legStride * 0.9);

      // Arms (contralateral to legs)
      leftBicep.position.set(-0.35, 1.6, -legStride * 0.2);
      leftBicep.rotation.x = -legStride * 0.8;
      leftElbow.position.set(-0.4, 1.4, -legStride * 0.3);
      leftForearm.position.set(-0.4, 1.2, -legStride * 0.15 + 0.1);
      leftForearm.rotation.x = -legStride * 0.5 + 0.5;

      rightBicep.position.set(0.35, 1.6, legStride * 0.2);
      rightBicep.rotation.x = legStride * 0.8;
      rightElbow.position.set(0.4, 1.4, legStride * 0.3);
      rightForearm.position.set(0.4, 1.2, legStride * 0.15 + 0.1);
      rightForearm.rotation.x = legStride * 0.5 + 0.5;

      // Slight head bounce
      head.position.y = 2.3 + Math.sin(runCycle * 2) * 0.03;

      // Particle floating animation
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i) + velocities[i];
        if (y > 3) {
          y = -0.5;
        }
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      headGeo.dispose();
      torsoGeo.dispose();
      coreGeo.dispose();
      hipGeo.dispose();
      legGeo.dispose();
      lowerLegGeo.dispose();
      sphereJoint.dispose();
      armGeo.dispose();
      forearmGeo.dispose();
      particleGeo.dispose();
      platformGeo.dispose();
      glowEmeraldMat.dispose();
      glowCyanMat.dispose();
      jointMat.dispose();
      particleMat.dispose();
      platformMat.dispose();
    };
  }, [interactive]);

  return (
    <div className={`relative ${className} flex items-center justify-center overflow-hidden`}>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-wider text-slate-400/80 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50 pointer-events-none select-none flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Interactive 3D Kinetic Runner • Drag to Orbit
      </div>
    </div>
  );
};
