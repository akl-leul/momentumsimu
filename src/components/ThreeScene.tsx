import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { SimulationState, SimulationParams } from '@/lib/physics';

interface ThreeSceneProps {
  state: SimulationState;
  params: SimulationParams;
}

export const ThreeScene = ({ state, params }: ThreeSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    doorAGroup: THREE.Group;
    doorBGroup: THREE.Group;
    slidingMass: THREE.Mesh;
    gridHelper: THREE.GridHelper;
    hingeA: THREE.Mesh;
    hingeB: THREE.Mesh;
  } | null>(null);

  // Orbit controls state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraDistance = useRef(6);
  const cameraAngleX = useRef(0);
  const cameraAngleY = useRef(0.5);

  const updateCameraPosition = useCallback(() => {
    if (!sceneRef.current) return;
    const { camera } = sceneRef.current;
    
    const x = cameraDistance.current * Math.sin(cameraAngleX.current) * Math.cos(cameraAngleY.current);
    const y = cameraDistance.current * Math.sin(cameraAngleY.current) + 1.5;
    const z = cameraDistance.current * Math.cos(cameraAngleX.current) * Math.cos(cameraAngleY.current);
    
    camera.position.set(x, y, z);
    camera.lookAt(0, 1.2, 0);
  }, []);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 1.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0xc8d4e0, 0xdce4ec);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Materials
    const doorMaterialA = new THREE.MeshStandardMaterial({
      color: 0x0088cc,
      metalness: 0.2,
      roughness: 0.5,
      emissive: 0x004466,
      emissiveIntensity: 0.1,
    });

    const doorMaterialB = new THREE.MeshStandardMaterial({
      color: 0xf5a623,
      metalness: 0.2,
      roughness: 0.5,
      emissive: 0x663300,
      emissiveIntensity: 0.1,
    });

    const hingeMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a6574,
      metalness: 0.8,
      roughness: 0.2,
    });

    const massMaterial = new THREE.MeshStandardMaterial({
      color: 0xe53935,
      metalness: 0.4,
      roughness: 0.4,
      emissive: 0x660000,
      emissiveIntensity: 0.15,
    });

    // Door dimensions
    const doorHeight = 2.2;
    const doorThickness = 0.08;
    const doorSpacing = 2.5;

    // Door A (Sliding Mass) - Group
    const doorAGroup = new THREE.Group();
    doorAGroup.position.set(-doorSpacing / 2, 0, 0);

    const doorAGeometry = new THREE.BoxGeometry(params.doorWidth, doorHeight, doorThickness);
    const doorA = new THREE.Mesh(doorAGeometry, doorMaterialA);
    doorA.position.set(params.doorWidth / 2, doorHeight / 2 + 0.1, 0);
    doorA.castShadow = true;
    doorA.receiveShadow = true;
    doorAGroup.add(doorA);

    // Sliding mass track
    const trackGeometry = new THREE.BoxGeometry(params.finalRadius - params.initialRadius + 0.1, 0.02, 0.06);
    const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x778899 });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.position.set(
      (params.initialRadius + params.finalRadius) / 2,
      doorHeight / 2 + 0.1,
      doorThickness / 2 + 0.02
    );
    doorAGroup.add(track);

    // Sliding mass
    const massGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const slidingMass = new THREE.Mesh(massGeometry, massMaterial);
    slidingMass.position.set(
      params.initialRadius,
      doorHeight / 2 + 0.1,
      doorThickness / 2 + 0.02
    );
    slidingMass.castShadow = true;
    doorAGroup.add(slidingMass);

    // Hinge A
    const hingeGeometry = new THREE.CylinderGeometry(0.05, 0.05, doorHeight + 0.3, 16);
    const hingeA = new THREE.Mesh(hingeGeometry, hingeMaterial);
    hingeA.position.set(0, doorHeight / 2 + 0.1, 0);
    doorAGroup.add(hingeA);

    scene.add(doorAGroup);

    // Door B (Standard) - Group
    const doorBGroup = new THREE.Group();
    doorBGroup.position.set(doorSpacing / 2, 0, 0);

    const doorBGeometry = new THREE.BoxGeometry(params.doorWidth, doorHeight, doorThickness);
    const doorB = new THREE.Mesh(doorBGeometry, doorMaterialB);
    doorB.position.set(params.doorWidth / 2, doorHeight / 2 + 0.1, 0);
    doorB.castShadow = true;
    doorB.receiveShadow = true;
    doorBGroup.add(doorB);

    // Hinge B
    const hingeB = new THREE.Mesh(hingeGeometry, hingeMaterial);
    hingeB.position.set(0, doorHeight / 2 + 0.1, 0);
    doorBGroup.add(hingeB);

    scene.add(doorBGroup);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8eef4,
      metalness: 0,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Labels
    const createLabel = (text: string, position: THREE.Vector3, color: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 64;
      const context = canvas.getContext('2d')!;
      context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      context.font = 'bold 28px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText(text, 256, 42);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(2.5, 0.3, 1);
      return sprite;
    };

    const labelA = createLabel('Door A (Sliding Mass)', new THREE.Vector3(-doorSpacing / 2, 2.8, 0), 0x0077aa);
    const labelB = createLabel('Door B (Standard)', new THREE.Vector3(doorSpacing / 2, 2.8, 0), 0xd9850e);
    scene.add(labelA);
    scene.add(labelB);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      doorAGroup,
      doorBGroup,
      slidingMass,
      gridHelper,
      hingeA,
      hingeB,
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Mouse controls for orbit
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      
      cameraAngleX.current += deltaX * 0.01;
      cameraAngleY.current = Math.max(0.1, Math.min(1.4, cameraAngleY.current + deltaY * 0.01));
      
      updateCameraPosition();
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance.current = Math.max(3, Math.min(15, cameraDistance.current + e.deltaY * 0.01));
      updateCameraPosition();
    };

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const element = renderer.domElement;
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseUp);
    element.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', handleResize);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseUp);
      element.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [params.doorWidth, params.initialRadius, params.finalRadius, updateCameraPosition]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Update door rotations and sliding mass position
  useEffect(() => {
    if (!sceneRef.current) return;

    const { doorAGroup, doorBGroup, slidingMass } = sceneRef.current;

    // Update door rotations (rotate around hinge axis)
    doorAGroup.rotation.y = state.doorA.angle;
    doorBGroup.rotation.y = state.doorB.angle;

    // Update sliding mass position
    const doorHeight = 2.2;
    const doorThickness = 0.08;
    slidingMass.position.set(
      state.doorA.massRadius,
      doorHeight / 2 + 0.1,
      doorThickness / 2 + 0.02
    );
  }, [state.doorA.angle, state.doorB.angle, state.doorA.massRadius]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-simulationBg rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ minHeight: '400px' }}
    />
  );
};
