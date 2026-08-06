"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type ScenePreset = "phone" | "headphones" | "beauty" | "smartwatch";

interface PresetItem {
  id: ScenePreset;
  label: string;
  icon: string;
  color: string;
}

const PRESETS: PresetItem[] = [
  { id: "phone", label: "إلكترونيات وجوالات", icon: "📱", color: "#3b82f6" },
  { id: "headphones", label: "صوتيات وسماعات", icon: "🎧", color: "#8b5cf6" },
  { id: "beauty", label: "عناية شخصية وجمال", icon: "🧴", color: "#ec4899" },
  { id: "smartwatch", label: "ساعات ذكية", icon: "⌚", color: "#f59e0b" },
];

export function Hero3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<ScenePreset>("phone");
  const [autoRotate, setAutoRotate] = useState(true);

  const activePresetRef = useRef(activePreset);
  activePresetRef.current = activePreset;

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const bluePointLight = new THREE.PointLight(0x3b82f6, 3, 20);
    bluePointLight.position.set(-4, -2, 3);
    scene.add(bluePointLight);

    const accentPointLight = new THREE.PointLight(0xf59e0b, 3, 20);
    accentPointLight.position.set(4, 3, 2);
    scene.add(accentPointLight);

    // 3. Main Product Root Group
    const productGroup = new THREE.Group();
    scene.add(productGroup);

    // 4. Create procedural 3D Meshes for each preset
    const presetGroups: Record<ScenePreset, THREE.Group> = {
      phone: new THREE.Group(),
      headphones: new THREE.Group(),
      beauty: new THREE.Group(),
      smartwatch: new THREE.Group(),
    };

    // ─── A. PHONE SCENE ──────────────────────────────────
    const phoneMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.15,
    });
    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.7, 0.22), phoneMat);
    presetGroups.phone.add(phoneBody);

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6,
      roughness: 0.1,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 3.5), screenMat);
    screen.position.z = 0.12;
    presetGroups.phone.add(screen);

    const cameraBumpMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
    const cameraBump = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.1), cameraBumpMat);
    cameraBump.position.set(-0.5, 1.2, -0.12);
    presetGroups.phone.add(cameraBump);

    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 0.8 });
    const phoneRing = new THREE.Mesh(ringGeo, ringMat);
    phoneRing.rotation.x = Math.PI / 3;
    presetGroups.phone.add(phoneRing);

    // ─── B. HEADPHONES SCENE ─────────────────────────────
    const earCupMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.2 });
    const earCupLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.4, 32), earCupMat);
    earCupLeft.rotation.z = Math.PI / 2;
    earCupLeft.position.set(-1.3, 0, 0);

    const earCupRight = earCupLeft.clone();
    earCupRight.position.set(1.3, 0, 0);
    presetGroups.headphones.add(earCupLeft, earCupRight);

    const headbandMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8, roughness: 0.2 });
    const headband = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.08, 16, 100, Math.PI), headbandMat);
    headband.position.set(0, 0.2, 0);
    presetGroups.headphones.add(headband);

    const ledRingMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0xa855f7, emissiveIntensity: 1 });
    const ledRingLeft = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.03, 16, 50), ledRingMat);
    ledRingLeft.rotation.y = Math.PI / 2;
    ledRingLeft.position.set(-1.51, 0, 0);
    const ledRingRight = ledRingLeft.clone();
    ledRingRight.position.set(1.51, 0, 0);
    presetGroups.headphones.add(ledRingLeft, ledRingRight);

    // ─── C. BEAUTY BOTTLE SCENE ──────────────────────────
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf472b6,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      reflectivity: 0.9,
    });
    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 2.4, 32), glassMat);
    presetGroups.beauty.add(bottleBody);

    const goldCapMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 });
    const bottleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 32), goldCapMat);
    bottleCap.position.y = 1.5;
    presetGroups.beauty.add(bottleCap);

    // Orbiting cosmetic bubbles
    const bubbleGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, emissive: 0xf472b6, emissiveIntensity: 0.6 });
    for (let i = 0; i < 8; i++) {
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      const angle = (i / 8) * Math.PI * 2;
      bubble.position.set(Math.cos(angle) * 1.8, (Math.sin(angle * 2) * 0.8), Math.sin(angle) * 1.8);
      presetGroups.beauty.add(bubble);
    }

    // ─── D. SMART WATCH SCENE ───────────────────────────
    const watchBodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const watchBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.25, 32), watchBodyMat);
    presetGroups.smartwatch.add(watchBody);

    const watchScreenMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.7 });
    const watchScreen = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.05, 32), watchScreenMat);
    watchScreen.position.y = 0.13;
    presetGroups.smartwatch.add(watchScreen);

    const strapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const strapTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.12), strapMat);
    strapTop.position.set(0, 1.6, 0);
    const strapBottom = strapTop.clone();
    strapBottom.position.set(0, -1.6, 0);
    presetGroups.smartwatch.add(strapTop, strapBottom);

    // Add all preset groups into productGroup
    Object.values(presetGroups).forEach((group) => productGroup.add(group));

    // 5. Particles Field
    const particleCount = 250;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = (Math.random() - 0.5) * 16;
      posArray[i + 2] = (Math.random() - 0.5) * 16;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.6,
    });
    const particlePoints = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlePoints);

    // 6. Interaction & Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

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
      const elapsedTime = clock.getElapsedTime();

      // Update preset visibility
      const current = activePresetRef.current;
      (Object.keys(presetGroups) as ScenePreset[]).forEach((key) => {
        const grp = presetGroups[key];
        if (key === current) {
          grp.visible = true;
          grp.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
        } else {
          grp.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.08);
          if (grp.scale.x < 0.05) grp.visible = false;
        }
      });

      // Rotation & Parallax
      if (autoRotateRef.current) {
        productGroup.rotation.y += 0.008;
      }

      targetRotationY = mouseX * 0.4;
      targetRotationX = mouseY * 0.4;

      productGroup.rotation.x += (targetRotationX - productGroup.rotation.x) * 0.05;
      productGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.08;

      // Rotate extra rings & particles
      phoneRing.rotation.z = elapsedTime * 0.5;
      particlePoints.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
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
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="h-full w-full opacity-90 transition-opacity duration-700" />

      {/* Preset Switcher Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full border border-border/60 bg-card/70 p-1.5 shadow-elevated backdrop-blur-md max-w-[95vw] overflow-x-auto scrollbar-none">
        {PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-xs transition-colors ml-1 cursor-pointer",
            autoRotate ? "bg-primary/20 text-primary border-primary/40" : "text-muted-foreground hover:bg-accent"
          )}
          title={autoRotate ? "إيقاف الدوران التلقائي" : "تشغيل الدوران التلقائي"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={autoRotate ? "animate-spin" : ""}
            style={{ animationDuration: "6s" }}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
