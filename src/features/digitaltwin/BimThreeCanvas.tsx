import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BimDiscipline, BimElement, BimLayerVisibility, BimRenderMode, getElementLayer } from '../../types/bim';
import { LoadedBimScene } from './BimModelLoader';
import { NativeDevice } from '../../services/nativeCapacitor';
import { 
  Maximize2, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Layers, 
  Ruler, 
  Camera, 
  Compass,
  Flame, 
  Box, 
  Sliders, 
  Scissors,
  Footprints,
  Orbit,
  Crosshair,
  Wrench,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  Building2,
  Wind,
  Droplets,
  Zap,
  Cpu,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  SlidersHorizontal,
  CheckSquare
} from 'lucide-react';

interface BimThreeCanvasProps {
  bimScene: LoadedBimScene | null;
  selectedElement: BimElement | null;
  onSelectElement: (element: BimElement | null) => void;
  renderMode: BimRenderMode;
  layerVisibility: BimLayerVisibility;
  onToggleLayer: (layer: keyof BimLayerVisibility) => void;
  onSetAllLayers: (layers: Partial<BimLayerVisibility>) => void;
  visibleDisciplines?: Record<BimDiscipline, boolean>;
  selectedStoreyFilter: number | string | 'all';
  onSelectStorey?: (storey: number | string | 'all') => void;
  clippingYPercent: number; // 0 to 100
  isMeasuring: boolean;
  onMeasureDistance?: (distanceM: number | null) => void;
  onOpenTicket?: (assetId?: string) => void;
  onInspectAsset?: (assetId: string) => void;
  isLightMode?: boolean;
}

export const BimThreeCanvas: React.FC<BimThreeCanvasProps> = ({
  bimScene,
  selectedElement,
  onSelectElement,
  renderMode,
  layerVisibility,
  onToggleLayer,
  onSetAllLayers,
  visibleDisciplines,
  selectedStoreyFilter,
  onSelectStorey,
  clippingYPercent,
  isMeasuring,
  onMeasureDistance,
  onOpenTicket,
  onInspectAsset,
  isLightMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances stored in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const clippingPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 100));
  const selectionOutlineMeshRef = useRef<THREE.BoxHelper | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Space Navigation & Layer Controller State
  const [navMode, setNavMode] = useState<'orbit' | 'walk'>('orbit');
  const [isElementIsolated, setIsElementIsolated] = useState<boolean>(false);
  const [isCopiedGuid, setIsCopiedGuid] = useState<boolean>(false);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const keysPressedRef = useRef<Record<string, boolean>>({});

  // Calculate element counts per building layer
  const layerCounts = useMemo(() => {
    const counts: Record<keyof BimLayerVisibility, number> = {
      walls: 0,
      foundations: 0,
      hvac: 0,
      plumbing: 0,
      electrical: 0,
      equipment: 0,
      spaces: 0
    };
    if (bimScene?.elements) {
      bimScene.elements.forEach(elem => {
        const layer = getElementLayer(elem);
        if (counts[layer] !== undefined) {
          counts[layer]++;
        }
      });
    }
    return counts;
  }, [bimScene]);

  // Count active layers
  const activeLayersCount = useMemo(() => {
    if (!layerVisibility) return 0;
    return Object.values(layerVisibility).filter(Boolean).length;
  }, [layerVisibility]);

  // Measurement points
  const measurePointsRef = useRef<THREE.Vector3[]>([]);
  const measureLineRef = useRef<THREE.Line | null>(null);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);
  const [hoveredElement, setHoveredElement] = useState<BimElement | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Keyboard navigation listener for walkthrough mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code.toLowerCase()] = true;
      keysPressedRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code.toLowerCase()] = false;
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 1. Initialize Three.js Scene, Camera, Renderer, Controls
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isLightMode ? 0xf8fafc : 0x090d16);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(55, 45, 65);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.08; // don't go too far under ground
    controls.minDistance = 2;
    controls.maxDistance = 250;
    controls.target.set(0, 12, 0);
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, isLightMode ? 0.9 : 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.5);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(60, 90, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 250;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-50, 40, -50);
    scene.add(fillLight);

    // Ground Grid & subtle reflective shadow receiver plane
    const gridHelper = new THREE.GridHelper(120, 60, isLightMode ? 0x94a3b8 : 0x1e293b, isLightMode ? 0xe2e8f0 : 0x0f172a);
    gridHelper.position.y = -16.5;
    scene.add(gridHelper);

    const shadowPlaneGeo = new THREE.PlaneGeometry(200, 200);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: isLightMode ? 0.2 : 0.4 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -16.55;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Airflow Particles in HVAC Ducts
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 36;
      particlePositions[p * 3 + 1] = Math.random() * 45 - 10;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 24;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.name = 'AirflowParticles';
    scene.add(particles);
    particlesRef.current = particles;

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Walkthrough / Space Navigation movement
      if (controls && camera) {
        const keys = keysPressedRef.current;
        const speed = keys['shift'] || keys['shiftleft'] ? 24 : 12;

        if (keys['keyw'] || keys['arrowup'] || keys['z']) {
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          camera.position.addScaledVector(forward, speed * delta);
          controls.target.addScaledVector(forward, speed * delta);
        }
        if (keys['keys'] || keys['arrowdown']) {
          const backward = new THREE.Vector3();
          camera.getWorldDirection(backward);
          backward.y = 0;
          backward.normalize().negate();
          camera.position.addScaledVector(backward, speed * delta);
          controls.target.addScaledVector(backward, speed * delta);
        }
        if (keys['keya'] || keys['arrowleft'] || keys['q']) {
          const left = new THREE.Vector3();
          camera.getWorldDirection(left);
          left.y = 0;
          left.cross(camera.up).negate().normalize();
          camera.position.addScaledVector(left, speed * delta);
          controls.target.addScaledVector(left, speed * delta);
        }
        if (keys['keyd'] || keys['arrowright']) {
          const right = new THREE.Vector3();
          camera.getWorldDirection(right);
          right.y = 0;
          right.cross(camera.up).normalize();
          camera.position.addScaledVector(right, speed * delta);
          controls.target.addScaledVector(right, speed * delta);
        }
        if (keys['space']) {
          camera.position.y += speed * delta;
          controls.target.y += speed * delta;
        }
        if (keys['keyc'] || keys['controlleft']) {
          camera.position.y -= speed * delta;
          controls.target.y -= speed * delta;
        }

        controls.update();
      }

      // Animate Airflow particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += 4 * delta;
          if (positions[i * 3] > 20) {
            positions[i * 3] = -20;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !containerRef.current) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW === 0 || newH === 0) return;

      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = newW / newH;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newW, newH);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isLightMode]);

  // 2. Load Model into Scene whenever `bimScene` changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old model if present
    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current = null;
    }

    // Remove old selection box
    if (selectionOutlineMeshRef.current) {
      scene.remove(selectionOutlineMeshRef.current);
      selectionOutlineMeshRef.current = null;
    }

    if (bimScene && bimScene.group) {
      scene.add(bimScene.group);
      currentModelGroupRef.current = bimScene.group;

      // Fit Camera to model bounds
      const box = new THREE.Box3().setFromObject(bimScene.group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      if (controlsRef.current && cameraRef.current) {
        controlsRef.current.target.copy(center);
        cameraRef.current.position.set(center.x + maxDim * 1.2, center.y + maxDim * 0.9, center.z + maxDim * 1.3);
        controlsRef.current.update();
      }
    }
  }, [bimScene]);

  // 3. Apply Discipline Visibility, Render Modes & Isolation Mode
  useEffect(() => {
    if (!currentModelGroupRef.current || !bimScene) return;

    const elementsMap = new Map<string, BimElement>();
    bimScene.elements.forEach(e => elementsMap.set(e.id, e));

    // Calculate clipping plane height
    const box = new THREE.Box3().setFromObject(currentModelGroupRef.current);
    const minY = box.min.y;
    const maxY = box.max.y;
    const currentClipY = minY + ((maxY - minY) * (clippingYPercent / 100));

    clippingPlaneRef.current.constant = currentClipY;

    currentModelGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const bimId = child.userData?.bimId;
        const elem = elementsMap.get(bimId);

        if (elem) {
          // Check isolation mode
          if (isElementIsolated && selectedElement) {
            child.visible = elem.id === selectedElement.id;
            return;
          }

          // Building Layer Visibility (Walls, Foundations, HVAC, Plumbing, Electrical, Equipment, Spaces)
          const layerKey = getElementLayer(elem);
          const isLayerVisible = layerVisibility 
            ? layerVisibility[layerKey] !== false 
            : (visibleDisciplines ? visibleDisciplines[elem.discipline] !== false : true);

          // Storey filter
          let isStoreyVisible = true;
          if (selectedStoreyFilter !== 'all') {
            isStoreyVisible = elem.floor.toString().includes(selectedStoreyFilter.toString());
          }

          child.visible = isLayerVisible && isStoreyVisible;

          // Material Shader Modulations based on Render Mode
          if (child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;

            // Handle clipping plane
            if (renderMode === 'clipping') {
              mat.clippingPlanes = [clippingPlaneRef.current];
              mat.clipShadows = true;
            } else {
              mat.clippingPlanes = [];
            }

            // Render Modes
            if (renderMode === 'wireframe') {
              mat.wireframe = true;
              mat.opacity = 0.85;
              mat.transparent = true;
            } else if (renderMode === 'xray') {
              mat.wireframe = false;
              if (layerKey === 'walls' || layerKey === 'foundations' || elem.discipline === 'structure' || elem.discipline === 'space') {
                mat.transparent = true;
                mat.opacity = 0.12;
              } else {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.emissive = new THREE.Color(0x0284c7);
                mat.emissiveIntensity = 0.3;
              }
            } else if (renderMode === 'thermal') {
              mat.wireframe = false;
              mat.transparent = false;
              // Heatmap shading based on element state / energy
              if (layerKey === 'hvac' || elem.discipline === 'hvac') {
                mat.color = new THREE.Color(0x06b6d4); // Cool cyan
              } else if (layerKey === 'plumbing' || elem.discipline === 'plumbing') {
                mat.color = new THREE.Color(0xef4444); // Warm red
              } else if (elem.status === 'warning') {
                mat.color = new THREE.Color(0xf59e0b); // Warning orange
              } else {
                mat.color = new THREE.Color(0x3b82f6); // Base blue
              }
            } else {
              // Standard PBR
              mat.wireframe = false;
              if (elem.ifcType === 'IfcCurtainWall' || elem.ifcType === 'IfcSpace') {
                mat.transparent = true;
                mat.opacity = 0.3;
              } else if (elem.ifcType === 'IfcSlab') {
                mat.transparent = true;
                mat.opacity = 0.88;
              } else {
                mat.transparent = false;
                mat.opacity = 1.0;
              }
            }

            mat.needsUpdate = true;
          }
        }
      }
    });
  }, [renderMode, layerVisibility, visibleDisciplines, selectedStoreyFilter, clippingYPercent, isElementIsolated, selectedElement, bimScene]);

  // 4. Highlight Selected Element
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !currentModelGroupRef.current) return;

    if (selectionOutlineMeshRef.current) {
      scene.remove(selectionOutlineMeshRef.current);
      selectionOutlineMeshRef.current = null;
    }

    if (selectedElement) {
      let selectedMesh: THREE.Mesh | null = null;
      currentModelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData?.bimId === selectedElement.id) {
          selectedMesh = child;
        }
      });

      if (selectedMesh) {
        // Color based on discipline: walls/structure (emerald), HVAC (cyan), plumbing (blue), electrical (amber), equipment (purple)
        let highlightColor = 0x10b981;
        if (selectedElement.discipline === 'hvac') highlightColor = 0x06b6d4;
        else if (selectedElement.discipline === 'plumbing') highlightColor = 0x3b82f6;
        else if (selectedElement.discipline === 'electrical') highlightColor = 0xf59e0b;
        else if (selectedElement.discipline === 'equipment') highlightColor = 0xa855f7;

        const boxHelper = new THREE.BoxHelper(selectedMesh, new THREE.Color(highlightColor));
        if (boxHelper.material instanceof THREE.LineBasicMaterial) {
          boxHelper.material.linewidth = 3;
        }
        scene.add(boxHelper);
        selectionOutlineMeshRef.current = boxHelper;
      }
    }
  }, [selectedElement]);

  // 5. Raycasting Click & Hover Handlers
  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !currentModelGroupRef.current || !bimScene) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(currentModelGroupRef.current.children, true);

    if (intersects.length > 0) {
      const hit = intersects.find(i => i.object.visible && i.object.userData?.bimId);
      if (hit) {
        const bimId = hit.object.userData.bimId;
        const elem = bimScene.elements.find(e => e.id === bimId);
        if (elem) {
          setHoveredElement(elem);
          setHoverPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
          return;
        }
      }
    }

    setHoveredElement(null);
    setHoverPos(null);
  }, [bimScene]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !currentModelGroupRef.current || !bimScene || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(currentModelGroupRef.current.children, true);

    if (isMeasuring && intersects.length > 0) {
      // 3D Measurement Mode
      const point = intersects[0].point;
      const pts = measurePointsRef.current;

      if (pts.length >= 2) {
        pts.length = 0; // reset
        if (measureLineRef.current) {
          sceneRef.current.remove(measureLineRef.current);
          measureLineRef.current = null;
        }
      }

      pts.push(point);

      if (pts.length === 2) {
        const dist = pts[0].distanceTo(pts[1]);
        setMeasuredDistance(parseFloat(dist.toFixed(2)));
        if (onMeasureDistance) onMeasureDistance(parseFloat(dist.toFixed(2)));

        // Create line
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
        const line = new THREE.Line(lineGeo, lineMat);
        sceneRef.current.add(line);
        measureLineRef.current = line;
      }
      return;
    }

    // Standard Element Selection
    if (intersects.length > 0) {
      const hit = intersects.find(i => i.object.visible && i.object.userData?.bimId);
      if (hit) {
        const bimId = hit.object.userData.bimId;
        const elem = bimScene.elements.find(e => e.id === bimId);
        if (elem) {
          NativeDevice.hapticSelection();
          onSelectElement(elem);
          return;
        }
      }
    }

    // Click on empty space
    if (!isElementIsolated) {
      onSelectElement(null);
    }
  }, [bimScene, isMeasuring, onMeasureDistance, onSelectElement, isElementIsolated]);

  // Focus camera smoothly onto selected element
  const focusOnSelectedElement = () => {
    if (!selectedElement || !currentModelGroupRef.current || !controlsRef.current || !cameraRef.current) return;

    let targetMesh: THREE.Mesh | null = null;
    currentModelGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData?.bimId === selectedElement.id) {
        targetMesh = child;
      }
    });

    if (targetMesh) {
      const box = new THREE.Box3().setFromObject(targetMesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 2);

      controlsRef.current.target.copy(center);
      cameraRef.current.position.set(center.x + maxDim * 2, center.y + maxDim * 1.5, center.z + maxDim * 2);
      controlsRef.current.update();
    }
  };

  // Camera presets
  const setCameraView = (view: 'iso' | 'top' | 'front' | 'right') => {
    if (!controlsRef.current || !cameraRef.current || !currentModelGroupRef.current) return;
    const box = new THREE.Box3().setFromObject(currentModelGroupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    controlsRef.current.target.copy(center);

    if (view === 'iso') {
      cameraRef.current.position.set(center.x + maxDim * 1.2, center.y + maxDim * 0.9, center.z + maxDim * 1.3);
    } else if (view === 'top') {
      cameraRef.current.position.set(center.x, center.y + maxDim * 1.8, center.z + 0.01);
    } else if (view === 'front') {
      cameraRef.current.position.set(center.x, center.y + maxDim * 0.3, center.z + maxDim * 1.8);
    } else if (view === 'right') {
      cameraRef.current.position.set(center.x + maxDim * 1.8, center.y + maxDim * 0.3, center.z);
    }

    controlsRef.current.update();
  };

  const resetCamera = () => {
    setCameraView('iso');
  };

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
      controlsRef.current.autoRotateSpeed = 1.5;
      setIsAutoRotating(controlsRef.current.autoRotate);
    }
  };

  const captureScreenshot = () => {
    if (rendererRef.current && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `BIM-View-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleCopyGuid = () => {
    if (selectedElement?.guid) {
      navigator.clipboard.writeText(selectedElement.guid);
      setIsCopiedGuid(true);
      setTimeout(() => setIsCopiedGuid(false), 2000);
    }
  };

  // Walk navigation helper for UI buttons
  const moveInWalkMode = (dir: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const step = 4;

    if (dir === 'forward') {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, step);
      controls.target.addScaledVector(forward, step);
    } else if (dir === 'back') {
      const backward = new THREE.Vector3();
      camera.getWorldDirection(backward);
      backward.y = 0;
      backward.normalize().negate();
      camera.position.addScaledVector(backward, step);
      controls.target.addScaledVector(backward, step);
    } else if (dir === 'left') {
      const left = new THREE.Vector3();
      camera.getWorldDirection(left);
      left.y = 0;
      left.cross(camera.up).negate().normalize();
      camera.position.addScaledVector(left, step);
      controls.target.addScaledVector(left, step);
    } else if (dir === 'right') {
      const right = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.y = 0;
      right.cross(camera.up).normalize();
      camera.position.addScaledVector(right, step);
      controls.target.addScaledVector(right, step);
    } else if (dir === 'up') {
      camera.position.y += step;
      controls.target.y += step;
    } else if (dir === 'down') {
      camera.position.y -= step;
      controls.target.y -= step;
    }
    controls.update();
  };

  return (
    <div ref={containerRef} className="relative w-full h-[580px] sm:h-[640px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl select-none group">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="w-full h-full cursor-grab active:cursor-grabbing block outline-none"
      />

      {/* Floating 3D Navigation Gizmo & View Controls */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
        {/* Navigation Mode Switcher: Orbit vs Walkthrough */}
        <button
          onClick={() => setNavMode('orbit')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            navMode === 'orbit'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Mode Orbite 360°"
        >
          <Orbit className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Orbite</span>
        </button>
        <button
          onClick={() => setNavMode('walk')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            navMode === 'walk'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Mode Visite des Espaces / Walkthrough (WASD / Touches directionnelles)"
        >
          <Footprints className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Visite Immersion</span>
        </button>

        <div className="w-[1px] h-5 bg-white/10 my-auto" />

        <button
          onClick={() => setCameraView('iso')}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
          title="Vue Isométrique 3D"
        >
          <Box className="w-3.5 h-3.5 text-emerald-400" />
          <span>ISO</span>
        </button>
        <button
          onClick={() => setCameraView('top')}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Vue de Dessus (Plan)"
        >
          TOP
        </button>
        <button
          onClick={() => setCameraView('front')}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Vue de Face (Façade Nord)"
        >
          FACE
        </button>
        <button
          onClick={() => setCameraView('right')}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Vue Profil (Façade Est)"
        >
          EST
        </button>

        <div className="w-[1px] h-5 bg-white/10 my-auto" />

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Recentrer la caméra"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleAutoRotate}
          className={`p-1.5 rounded-lg transition-colors ${
            isAutoRotating ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title="Rotation automatique 3D"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={captureScreenshot}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Exporter Capture d'écran HD"
        >
          <Camera className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-white/10 my-auto" />

        {/* Building Layer Visibility Trigger Button */}
        <button
          onClick={() => setShowLayersMenu(prev => !prev)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            showLayersMenu
              ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Ouvrir le panneau de contrôle des calques 3D (Murs, Fondations, CVC, Fluides, Élec)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Calques 3D</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            showLayersMenu ? 'bg-slate-950/70 text-emerald-300' : 'bg-white/10 text-emerald-400'
          }`}>
            {activeLayersCount}/7
          </span>
          {showLayersMenu ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
        </button>
      </div>

      {/* Floating 3D Scene Layer Visibility Control Panel */}
      {showLayersMenu && (
        <div className="absolute top-16 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] bg-slate-950/95 border border-emerald-500/30 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  Calques & Corps d'État 3D
                </h4>
                <p className="text-[10px] text-slate-400">Filtrage instantané des éléments IFC</p>
              </div>
            </div>
            <button
              onClick={() => setShowLayersMenu(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Layer Isolation Presets */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Préréglages d'isolation</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onSetAllLayers({ walls: true, foundations: true, hvac: true, plumbing: true, electrical: true, equipment: true, spaces: true })}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-[11px] font-medium transition-all text-left flex items-center gap-1.5 border border-white/5"
              >
                <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">Tout afficher</span>
              </button>
              <button
                onClick={() => onSetAllLayers({ walls: false, foundations: true, hvac: true, plumbing: true, electrical: true, equipment: true, spaces: true })}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[11px] font-medium transition-all text-left flex items-center gap-1.5 border border-white/5"
                title="Masque les murs pour visualiser l'ensemble des réseaux techniques MEP intérieurs"
              >
                <Wind className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">Vue Réseaux (Sans Murs)</span>
              </button>
              <button
                onClick={() => onSetAllLayers({ walls: false, foundations: false, hvac: true, plumbing: true, electrical: true, equipment: true, spaces: false })}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 text-[11px] font-medium transition-all text-left flex items-center gap-1.5 border border-white/5"
              >
                <Cpu className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">MEP Technique Seul</span>
              </button>
              <button
                onClick={() => onSetAllLayers({ walls: true, foundations: true, hvac: false, plumbing: false, electrical: false, equipment: false, spaces: false })}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 text-slate-300 text-[11px] font-medium transition-all text-left flex items-center gap-1.5 border border-white/5"
              >
                <Building2 className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Gros Œuvre / Structure</span>
              </button>
            </div>
          </div>

          {/* Granular Layers List */}
          <div className="space-y-1 pt-1 max-h-56 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calques individuels</span>
            
            {/* 1. Murs & Façades (Walls) */}
            <div
              onClick={() => onToggleLayer('walls')}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                layerVisibility.walls
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${layerVisibility.walls ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Murs & Façades</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">IfcWall, IfcCurtainWall</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                  {layerCounts.walls}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  layerVisibility.walls ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* 2. Fondations & Dalles (Structural Foundations) */}
            <div
              onClick={() => onToggleLayer('foundations')}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                layerVisibility.foundations
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${layerVisibility.foundations ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Fondations & Dalles</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">IfcSlab, IfcColumn, IfcFooting</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                  {layerCounts.foundations}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  layerVisibility.foundations ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* 3. Gaines & CVC (HVAC) */}
            <div
              onClick={() => onToggleLayer('hvac')}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                layerVisibility.hvac
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${layerVisibility.hvac ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">CVC & Ventilation (HVAC)</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">IfcDuctSegment, IfcAirTerminal</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                  {layerCounts.hvac}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  layerVisibility.hvac ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* 4. Canalisations & Fluides (Plumbing) */}
            <div
              onClick={() => onToggleLayer('plumbing')}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                layerVisibility.plumbing
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${layerVisibility.plumbing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Plomberie & Fluides</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">IfcPipeSegment, Vannes</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                  {layerCounts.plumbing}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  layerVisibility.plumbing ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* 5. Électricité & TGBT (Electrical) */}
            <div
              onClick={() => onToggleLayer('electrical')}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                layerVisibility.electrical
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${layerVisibility.electrical ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Électricité & Chemins de Câbles</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">IfcCableCarrier, Armoires</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                  {layerCounts.electrical}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  layerVisibility.electrical ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* 6. Équipements Techniques (Equipment) */}
            <div
              onClick={() => onToggleLayer('equipment')}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                layerVisibility.equipment
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${layerVisibility.equipment ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Équipements & Chaufferie</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">IfcChiller, IfcBoiler, IfcPump</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                  {layerCounts.equipment}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  layerVisibility.equipment ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* 7. Espaces & Volumes (Spaces) */}
            <div
              onClick={() => onToggleLayer('spaces')}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                layerVisibility.spaces
                  ? 'bg-slate-900/80 border-slate-700/60 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${layerVisibility.spaces ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Box className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Espaces & Volumes</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">IfcSpace, Pièces</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                  {layerCounts.spaces}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  layerVisibility.spaces ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct One-Click Quick Layer Toggles Bar (Bottom of 3D Scene) */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
        <span className="text-[10px] font-mono font-bold text-slate-400 px-1 hidden sm:inline">Calques :</span>
        
        {/* Quick Walls */}
        <button
          onClick={() => onToggleLayer('walls')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            layerVisibility.walls
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 bg-white/5 border border-transparent line-through'
          }`}
          title="Afficher / Masquer les Murs"
        >
          <Building2 className="w-3 h-3" />
          <span>Murs</span>
        </button>

        {/* Quick Foundations */}
        <button
          onClick={() => onToggleLayer('foundations')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            layerVisibility.foundations
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 bg-white/5 border border-transparent line-through'
          }`}
          title="Afficher / Masquer les Fondations & Structure"
        >
          <Layers className="w-3 h-3" />
          <span>Fondations</span>
        </button>

        {/* Quick HVAC */}
        <button
          onClick={() => onToggleLayer('hvac')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            layerVisibility.hvac
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 bg-white/5 border border-transparent line-through'
          }`}
          title="Afficher / Masquer CVC & Ventilation"
        >
          <Wind className="w-3 h-3" />
          <span>CVC (HVAC)</span>
        </button>

        {/* Quick Plumbing */}
        <button
          onClick={() => onToggleLayer('plumbing')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            layerVisibility.plumbing
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 bg-white/5 border border-transparent line-through'
          }`}
          title="Afficher / Masquer la Plomberie & Fluides"
        >
          <Droplets className="w-3 h-3" />
          <span>Fluides</span>
        </button>

        {/* Quick Electrical */}
        <button
          onClick={() => onToggleLayer('electrical')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            layerVisibility.electrical
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 bg-white/5 border border-transparent line-through'
          }`}
          title="Afficher / Masquer l'Électricité"
        >
          <Zap className="w-3 h-3" />
          <span>Élec</span>
        </button>

        {/* Quick Equipment */}
        <button
          onClick={() => onToggleLayer('equipment')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            layerVisibility.equipment
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 bg-white/5 border border-transparent line-through'
          }`}
          title="Afficher / Masquer les Équipements Techniques"
        >
          <Cpu className="w-3 h-3" />
          <span>Équip.</span>
        </button>
      </div>

      {/* Walkthrough Controls Help & On-screen D-Pad */}
      {navMode === 'walk' && (
        <div className="absolute top-16 left-4 z-10 bg-slate-950/90 border border-emerald-500/30 text-slate-200 p-3 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Footprints className="w-4 h-4" />
            <span>Navigation dans les Espaces</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Utilisez les touches <strong>Z, Q, S, D</strong> ou les <strong>flèches</strong> pour vous déplacer à hauteur des yeux dans les couloirs et sous les réseaux CVC.
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <div className="grid grid-cols-3 gap-1">
              <div />
              <button
                onClick={() => moveInWalkMode('forward')}
                className="p-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-slate-300 font-bold text-xs flex justify-center items-center transition-colors"
                title="Avancer (Z)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <div />
              <button
                onClick={() => moveInWalkMode('left')}
                className="p-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-slate-300 font-bold text-xs flex justify-center items-center transition-colors"
                title="Gauche (Q)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveInWalkMode('back')}
                className="p-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-slate-300 font-bold text-xs flex justify-center items-center transition-colors"
                title="Reculer (S)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveInWalkMode('right')}
                className="p-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-slate-300 font-bold text-xs flex justify-center items-center transition-colors"
                title="Droite (D)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <button
                onClick={() => moveInWalkMode('up')}
                className="px-2 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-slate-300 font-mono text-[10px] font-bold transition-colors"
                title="Monter (+Y)"
              >
                + Haut
              </button>
              <button
                onClick={() => moveInWalkMode('down')}
                className="px-2 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-slate-300 font-mono text-[10px] font-bold transition-colors"
                title="Descendre (-Y)"
              >
                - Bas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Selected Element Action Bar */}
      {selectedElement && (
        <div className="absolute top-4 right-4 z-20 bg-slate-950/90 border border-emerald-500/40 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-full space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 truncate max-w-[200px]">
                  {selectedElement.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <span>{selectedElement.ifcType}</span>
                <span>•</span>
                <span className="text-slate-300 font-semibold">{selectedElement.floor}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyGuid}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                title="Copier GUID IFC"
              >
                {isCopiedGuid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={focusOnSelectedElement}
              className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
              title="Centrer la caméra 3D sur cet élément"
            >
              <Crosshair className="w-3 h-3" />
              <span>Centrer</span>
            </button>
            <button
              onClick={() => setIsElementIsolated(prev => !prev)}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                isElementIsolated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/15 text-slate-300 border-white/10'
              }`}
              title="Isoler ce composant 3D"
            >
              {isElementIsolated ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{isElementIsolated ? 'Désisoler' : 'Isoler'}</span>
            </button>
            <button
              onClick={() => onOpenTicket && onOpenTicket(selectedElement.relatedAssetId || selectedElement.id)}
              className="px-2 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
              title="Créer un Ordre de Travail GMAO"
            >
              <Wrench className="w-3 h-3" />
              <span>GMAO</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Raycast Hover Tooltip */}
      {hoveredElement && hoverPos && !selectedElement && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-950/90 text-white backdrop-blur-md p-2.5 rounded-xl border border-emerald-500/40 shadow-xl text-xs max-w-xs transition-all duration-75"
          style={{
            left: `${Math.min(hoverPos.x + 15, (containerRef.current?.clientWidth || 800) - 240)}px`,
            top: `${Math.min(hoverPos.y + 15, (containerRef.current?.clientHeight || 600) - 120)}px`
          }}
        >
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="truncate">{hoveredElement.name}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between gap-2">
            <span>{hoveredElement.ifcType}</span>
            <span className="text-slate-300 font-bold">{hoveredElement.floor}</span>
          </div>
          {hoveredElement.technicalData?.airflowM3h && (
            <div className="text-[10px] text-cyan-300 font-mono mt-1">
              Débit : {hoveredElement.technicalData.airflowM3h} m³/h
            </div>
          )}
          {hoveredElement.technicalData?.waterTempC && (
            <div className="text-[10px] text-orange-300 font-mono mt-1">
              Temp : {hoveredElement.technicalData.waterTempC}°C
            </div>
          )}
        </div>
      )}

      {/* Measurement Banner */}
      {isMeasuring && (
        <div className="absolute top-16 right-4 z-10 bg-amber-950/90 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 shadow-lg">
          <Ruler className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>
            {measuredDistance !== null ? `Distance : ${measuredDistance} mètres` : 'Cliquez sur 2 points 3D pour mesurer'}
          </span>
        </div>
      )}

      {/* Section Plane / Clipping Indicator */}
      {renderMode === 'clipping' && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/80 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 shadow-lg">
          <Scissors className="w-4 h-4 text-cyan-400" />
          <span>Plan de Coupe : {clippingYPercent}%</span>
        </div>
      )}

      {/* Bottom Right Badge: Engine Status */}
      <div className="absolute bottom-3 right-4 z-10 pointer-events-none flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>Three.js WebGL & web-ifc Engine</span>
      </div>
    </div>
  );
};
