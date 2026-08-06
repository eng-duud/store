"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function Hero3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(6, 6, 6);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 4, 25);
    blueLight.position.set(-5, 2, 4);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 4, 25);
    purpleLight.position.set(5, -2, 4);
    scene.add(purpleLight);

    // 3. Root Group for Parallax
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // ─── PRODUCT 1: SMARTPHONE (Top Left) ─────────────────
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(-3.2, 0.8, -0.5);
    phoneGroup.rotation.set(0.2, 0.4, -0.1);

    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.15 });
    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.0, 0.18), phoneMat);
    phoneGroup.add(phoneBody);

    const screenMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.7, roughness: 0.1 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 2.85), screenMat);
    screen.position.z = 0.1;
    phoneGroup.add(screen);

    const phoneRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.025, 16, 80),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 0.8 })
    );
    phoneRing.rotation.x = Math.PI / 3;
    phoneGroup.add(phoneRing);
    rootGroup.add(phoneGroup);

    // ─── PRODUCT 2: HEADPHONES (Top Right) ────────────────
    const headphonesGroup = new THREE.Group();
    headphonesGroup.position.set(3.2, 0.9, -0.5);
    headphonesGroup.rotation.set(-0.2, -0.4, 0.1);

    const earCupMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.75, roughness: 0.2 });
    const earLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.35, 32), earCupMat);
    earLeft.rotation.z = Math.PI / 2;
    earLeft.position.set(-1.1, 0, 0);

    const earRight = earLeft.clone();
    earRight.position.set(1.1, 0, 0);
    headphonesGroup.add(earLeft, earRight);

    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.07, 16, 80, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8, roughness: 0.2 })
    );
    headband.position.set(0, 0.2, 0);
    headphonesGroup.add(headband);

    const ledRingLeft = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.03, 16, 40),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0xa855f7, emissiveIntensity: 1 })
    );
    ledRingLeft.rotation.y = Math.PI / 2;
    ledRingLeft.position.set(-1.28, 0, 0);
    const ledRingRight = ledRingLeft.clone();
    ledRingRight.position.set(1.28, 0, 0);
    headphonesGroup.add(ledRingLeft, ledRingRight);
    rootGroup.add(headphonesGroup);

    // ─── PRODUCT 3: BEAUTY BOTTLE (Bottom Left) ───────────
    const beautyGroup = new THREE.Group();
    beautyGroup.position.set(-2.4, -1.8, 0.2);
    beautyGroup.rotation.set(0.1, 0.3, 0.15);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf472b6,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      reflectivity: 0.9,
    });
    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 2.0, 32), glassMat);
    beautyGroup.add(bottleBody);

    const bottleCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.5, 32),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
    );
    bottleCap.position.y = 1.25;
    beautyGroup.add(bottleCap);

    // Floating cosmetic bubbles
    const bubbleGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, emissive: 0xf472b6, emissiveIntensity: 0.5 });
    for (let i = 0; i < 6; i++) {
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      const a = (i / 6) * Math.PI * 2;
      bubble.position.set(Math.cos(a) * 1.4, Math.sin(a * 2) * 0.6, Math.sin(a) * 1.4);
      beautyGroup.add(bubble);
    }
    rootGroup.add(beautyGroup);

    // ─── PRODUCT 4: SMART WATCH (Bottom Right) ────────────
    const watchGroup = new THREE.Group();
    watchGroup.position.set(2.4, -1.8, 0.2);
    watchGroup.rotation.set(-0.15, -0.3, -0.1);

    const watchBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.22, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 })
    );
    watchGroup.add(watchBody);

    const watchScreen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.88, 0.88, 0.04, 32),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 })
    );
    watchScreen.position.y = 0.12;
    watchGroup.add(watchScreen);

    const strapTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 1.4, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    strapTop.position.set(0, 1.3, 0);
    const strapBottom = strapTop.clone();
    strapBottom.position.set(0, -1.3, 0);
    watchGroup.add(strapTop, strapBottom);
    rootGroup.add(watchGroup);

    // ─── 5. FLOATING PARTICLE FIELD ───────────────────────
    const particleCount = 300;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 18;
      posArray[i + 1] = (Math.random() - 0.5) * 16;
      posArray[i + 2] = (Math.random() - 0.5) * 14;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.65,
    });
    const particlePoints = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlePoints);

    // ─── 6. INTERACTION & ANIMATION LOOP ──────────────────
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) / windowHalfX;
      mouseY = (e.clientY - windowHalfY) / windowHalfY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Continuous Floating Animations on individual 3D products
      phoneGroup.position.y = 0.8 + Math.sin(t * 1.2) * 0.15;
      phoneGroup.rotation.y += 0.008;

      headphonesGroup.position.y = 0.9 + Math.cos(t * 1.4) * 0.15;
      headphonesGroup.rotation.y -= 0.007;

      beautyGroup.position.y = -1.8 + Math.sin(t * 1.5 + 1) * 0.15;
      beautyGroup.rotation.y += 0.009;

      watchGroup.position.y = -1.8 + Math.cos(t * 1.3 + 2) * 0.15;
      watchGroup.rotation.y -= 0.008;

      phoneRing.rotation.z = t * 0.4;
      particlePoints.rotation.y = t * 0.02;

      // Smooth Parallax Scene Rotation based on Mouse Move
      rootGroup.rotation.y += (mouseX * 0.25 - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (-mouseY * 0.25 - rootGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div ref={containerRef} className="h-full w-full opacity-90 transition-opacity duration-700" />
    </div>
  );
}
