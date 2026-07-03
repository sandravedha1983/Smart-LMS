import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Dolphin3D() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Get parent dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.65); // Sky blue fill
    fillLight.position.set(-5, 3, 3);
    scene.add(fillLight);

    const pointHighlight = new THREE.PointLight(0xffffff, 0.8, 10);
    pointHighlight.position.set(0, 2, 2);
    scene.add(pointHighlight);

    // 5. Materials
    const dolphinMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Slate-like cyan/blue
      roughness: 0.18,
      metalness: 0.15,
      flatShading: false
    });

    const bellyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean slate white
      roughness: 0.25,
      metalness: 0.05,
      flatShading: false
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Slate 900
      roughness: 0.05,
      metalness: 0.9
    });

    // 6. Dolphin Geometries & Meshes
    const dolphinGroup = new THREE.Group();

    // Body (torso)
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const body = new THREE.Mesh(bodyGeo, dolphinMaterial);
    body.scale.set(1, 0.85, 1.85);
    dolphinGroup.add(body);

    // Belly (white bottom half, offset slightly)
    const bellyGeo = new THREE.SphereGeometry(1.1, 32, 32);
    const belly = new THREE.Mesh(bellyGeo, bellyMaterial);
    belly.scale.set(0.9, 0.45, 1.6);
    belly.position.set(0, -0.38, 0.05);
    dolphinGroup.add(belly);

    // Head (placed at front-top)
    const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const head = new THREE.Mesh(headGeo, dolphinMaterial);
    head.position.set(0, 0.25, 1.25);
    dolphinGroup.add(head);

    // Snout (beak)
    const snoutGeo = new THREE.ConeGeometry(0.24, 0.65, 32);
    const snout = new THREE.Mesh(snoutGeo, dolphinMaterial);
    snout.rotation.x = Math.PI / 2 - 0.15;
    snout.position.set(0, 0.08, 1.85);
    dolphinGroup.add(snout);

    // Dorsal Fin (top fin)
    const dorsalGeo = new THREE.ConeGeometry(0.22, 0.75, 32);
    const dorsal = new THREE.Mesh(dorsalGeo, dolphinMaterial);
    dorsal.rotation.x = -Math.PI / 6;
    dorsal.position.set(0, 0.95, -0.15);
    dolphinGroup.add(dorsal);

    // Left Pectoral Fin
    const leftFinGeo = new THREE.ConeGeometry(0.16, 0.65, 32);
    const leftFin = new THREE.Mesh(leftFinGeo, dolphinMaterial);
    leftFin.rotation.set(0.2, 0, -Math.PI / 3);
    leftFin.position.set(-0.95, -0.28, 0.4);
    dolphinGroup.add(leftFin);

    // Right Pectoral Fin (Waving fin)
    const rightFinGeo = new THREE.ConeGeometry(0.16, 0.65, 32);
    const rightFin = new THREE.Mesh(rightFinGeo, dolphinMaterial);
    rightFin.rotation.set(0.2, 0, Math.PI / 3);
    rightFin.position.set(0.95, -0.28, 0.4);
    dolphinGroup.add(rightFin);

    // Tail Joint (tapering cone extending backwards)
    const tailJointGeo = new THREE.ConeGeometry(0.45, 1.1, 32);
    const tailJoint = new THREE.Mesh(tailJointGeo, dolphinMaterial);
    tailJoint.rotation.x = -Math.PI / 2;
    tailJoint.position.set(0, -0.1, -1.6);
    dolphinGroup.add(tailJoint);

    // Tail Flukes (horizontal flat fins at the back)
    const flukeGeo = new THREE.ConeGeometry(0.15, 0.7, 32);
    const flukeL = new THREE.Mesh(flukeGeo, dolphinMaterial);
    flukeL.rotation.set(0, 0, -Math.PI / 2.3);
    flukeL.position.set(-0.35, -0.08, -2.15);
    dolphinGroup.add(flukeL);

    const flukeR = new THREE.Mesh(flukeGeo, dolphinMaterial);
    flukeR.rotation.set(0, 0, Math.PI / 2.3);
    flukeR.position.set(0.35, -0.08, -2.15);
    dolphinGroup.add(flukeR);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMaterial);
    eyeL.position.set(-0.42, 0.45, 1.75);
    dolphinGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMaterial);
    eyeR.position.set(0.42, 0.45, 1.75);
    dolphinGroup.add(eyeR);

    // Adjust entire dolphin orientation so they look friendly/facing camera slightly
    dolphinGroup.rotation.y = -Math.PI / 5;
    dolphinGroup.rotation.x = 0.05;
    scene.add(dolphinGroup);

    // 7. Bubbles Particle System
    const bubblesCount = 16;
    const bubblesGroup = new THREE.Group();
    const bubbles = [];

    for (let i = 0; i < bubblesCount; i++) {
      const radius = Math.random() * 0.08 + 0.03;
      const bubbleGeo = new THREE.SphereGeometry(radius, 8, 8);
      const bubbleMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.3 + 0.15
      });
      const mesh = new THREE.Mesh(bubbleGeo, bubbleMat);

      mesh.position.set(
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 4.5 - 1.0,
        (Math.random() - 0.5) * 4.5
      );

      const speed = Math.random() * 0.015 + 0.008;
      const wobbleSpeed = Math.random() * 2 + 1;
      const wobbleRange = Math.random() * 0.15 + 0.05;

      bubbles.push({
        mesh,
        speed,
        wobbleSpeed,
        wobbleRange,
        initialX: mesh.position.x
      });
      bubblesGroup.add(mesh);
    }
    scene.add(bubblesGroup);

    // 8. Animation loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Dolphin bobbing up & down
      dolphinGroup.position.y = Math.sin(elapsed * 1.8) * 0.2;
      dolphinGroup.rotation.z = Math.sin(elapsed * 0.9) * 0.05;

      // Tail joint flexing
      tailJoint.rotation.z = Math.sin(elapsed * 3.6) * 0.1;
      flukeL.rotation.y = Math.sin(elapsed * 3.6) * 0.08;
      flukeR.rotation.y = Math.sin(elapsed * 3.6) * 0.08;

      // Right Fin Waving Sequence ("Saying Hi")
      // Wave for 1.8 seconds, rest for 2.2 seconds
      const waveCycle = elapsed % 4.0;
      if (waveCycle < 1.8) {
        // High frequency wave rotation on the Z and X axis
        rightFin.rotation.z = Math.PI / 3 + Math.sin(elapsed * 14.0) * 0.45;
        rightFin.rotation.x = Math.sin(elapsed * 14.0) * 0.2;
      } else {
        // Soft breathing motion
        rightFin.rotation.z = Math.PI / 3 + Math.sin(elapsed * 1.8) * 0.08;
        rightFin.rotation.x = 0;
      }

      // Left Fin soft breathing motion
      leftFin.rotation.z = -Math.PI / 3 - Math.sin(elapsed * 1.8) * 0.08;

      // Bubbles rising
      bubbles.forEach((b) => {
        b.mesh.position.y += b.speed;
        b.mesh.position.x = b.initialX + Math.sin(elapsed * b.wobbleSpeed) * b.wobbleRange;

        // Reset bubble when it exits screen top
        if (b.mesh.position.y > 2.5) {
          b.mesh.position.y = -2.5;
          b.mesh.position.x = (Math.random() - 0.5) * 4.5;
          b.initialX = b.mesh.position.x;
        }
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(container);

    // 10. Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      
      // Clean up geometries & materials
      bodyGeo.dispose();
      bellyGeo.dispose();
      headGeo.dispose();
      snoutGeo.dispose();
      dorsalGeo.dispose();
      leftFinGeo.dispose();
      rightFinGeo.dispose();
      tailJointGeo.dispose();
      flukeGeo.dispose();
      eyeGeo.dispose();

      dolphinMaterial.dispose();
      bellyMaterial.dispose();
      eyeMaterial.dispose();
      
      bubbles.forEach((b) => {
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-48 sm:h-56 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full max-w-full block" />
    </div>
  );
}
