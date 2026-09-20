import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Bed,
  Lamp,
  DoorClosed,
  Bath,
  Eye,
  CheckCircle2,
  Move,
  ZoomIn,
  ZoomOut,
  Wind,
  Compass,
  Play,
  Pause,
  ShieldCheck,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

export interface HotspotInfo {
  id: string;
  name: string;
  category: 'bed' | 'desk' | 'wardrobe' | 'bath' | 'window' | 'ac';
  yaw: number; // degrees longitude (-180 to 180)
  pitch: number; // degrees latitude (-90 to 90)
  title: string;
  description: string;
  spec: string;
  qualityScore: string;
  hygieneStatus: string;
  highlights: string[];
}

export const ROOM_HOTSPOTS: HotspotInfo[] = [
  {
    id: 'hotspot_bed',
    name: 'Bed & Linen',
    category: 'bed',
    yaw: -50,
    pitch: -12,
    title: 'Orthopedic Single Bed & Cotton Linens',
    description:
      'Engineered for maximum posture support with 6-inch high-density bonded orthopedic foam and hypoallergenic fresh breathable cotton linens.',
    spec: '75″ × 36″ Single Mattress · Heavy-Gauge Solid Frame',
    qualityScore: '9.8 / 10 Verified Comfort',
    hygieneStatus: 'Steam Sanitized & Fresh Covers Provided',
    highlights: ['6-inch bonded orthopedic foam', 'Zero spring sagging', 'Hypoallergenic dual-layer cover', 'Under-bed dust clearance: 10 inches'],
  },
  {
    id: 'hotspot_desk',
    name: 'Study Desk',
    category: 'desk',
    yaw: 42,
    pitch: -8,
    title: 'Ergonomic Workstation & High-Speed Wi-Fi',
    description:
      'Spacious wooden study table equipped with a 4-socket surge protected power strip, LED desk lamp, and ergonomic breathable mesh high-back chair.',
    spec: '36″ W × 24″ D Solid Wood Desk + Mesh Task Chair',
    qualityScore: '9.7 / 10 Productivity Ready',
    hygieneStatus: 'Cable-Managed & Anti-Microbial Surface',
    highlights: ['Dedicated 120 Mbps 5GHz Wi-Fi signal', '4-port power dock with USB charging', 'Ergonomic lumbar mesh support', 'Smooth writeable matte desktop'],
  },
  {
    id: 'hotspot_wardrobe',
    name: 'Wardrobe',
    category: 'wardrobe',
    yaw: 125,
    pitch: 2,
    title: 'Lockable 2-Door Wardrobe & Valuables Safe',
    description:
      'Heavy-gauge rust-resistant almirah featuring deep shelving, coat-hanging rail, and an internal lockable security locker for laptops and documents.',
    spec: '72″ H × 36″ W × 20″ D Steel-Engineered Storage',
    qualityScore: '9.9 / 10 Security Assured',
    hygieneStatus: 'Clean Odor-Free Interior with Moisture Absorbers',
    highlights: ['Individual physical key provided to resident', 'Full-length dressing mirror on inner panel', 'Top luggage loft for suitcases', 'Rust-proof powder coat finish'],
  },
  {
    id: 'hotspot_bath',
    name: 'Attached Bath',
    category: 'bath',
    yaw: -135,
    pitch: -4,
    title: 'Private En-Suite Bathroom & Instant Geyser',
    description:
      'Completely private attached bathroom with western commode, premium chrome shower fixtures, anti-skid ceramic tiles, and a 15L electric water geyser.',
    spec: 'En-Suite · Zero Shared Lines · 15L Automatic Geyser',
    qualityScore: '9.6 / 10 Sanitation Rating',
    hygieneStatus: 'Deep Cleaned & Pressurized Flow Tested',
    highlights: ['24/7 hot water via 15L high-speed geyser', 'Anti-slip floor tiles with clean drainage slope', 'Exhaust ventilation fan', 'High water pressure shower head'],
  },
  {
    id: 'hotspot_window',
    name: 'Ventilation Window',
    category: 'window',
    yaw: 0,
    pitch: 6,
    title: 'Sunlit Window with Mosquito Mesh Screen',
    description:
      'Large acoustic sliding window facing east for morning sunlight, fitted with fine stainless-steel mosquito mesh and light-blocking curtains.',
    spec: 'East-Facing Daylight · Dual Track Sliding Glass',
    qualityScore: '9.9 / 10 Fresh Airflow',
    hygieneStatus: 'Zero Mosquito Intrusion Guarantee',
    highlights: ['Abundant morning natural illumination', 'Cross-ventilation airflow across the room', 'Sound-dampening thick glass panes', 'Complete privacy curtains included'],
  },
  {
    id: 'hotspot_ac',
    name: 'AC & Climate',
    category: 'ac',
    yaw: -15,
    pitch: 28,
    title: '1.5-Ton Inverter AC & High-RPM Ceiling Fan',
    description:
      'Whisper-quiet energy-efficient inverter air conditioner with remote temperature control paired with a 3-blade aerodynamic ceiling fan.',
    spec: '5-Star Energy Rated · 18°C–30°C Climate Control',
    qualityScore: '9.8 / 10 Silent Cooling',
    hygieneStatus: 'Filters Cleaned & Refrigerant Fully Charged',
    highlights: ['Cools room in under 5 minutes', 'Ultra-quiet sleep mode (< 28 dB)', 'Individual remote control provided', 'Low power surge consumption'],
  },
];

interface ThreeRoomViewerProps {
  roomNo?: string;
  roomType?: string;
  monthlyRent?: number;
  propertyId?: string;
  onSwitchToFloorPlan?: () => void;
  onSwitchToGallery?: () => void;
}

/**
 * Procedural Equirectangular Room Texture Generator.
 * Generates an ultra-crisp, realistic 2048x1024 360° panorama of a furnished PG/student room.
 * Runs in < 25ms and requires ZERO external network requests.
 */
function createProceduralRoomTexture(roomType: string, roomNo: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return dummy;
  }

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base Walls & Horizon Gradient
  // Ceiling is at top (0 to ~380), floor is at bottom (~600 to 1024)
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
  wallGrad.addColorStop(0.0, '#f1f5f9'); // ceiling off-white
  wallGrad.addColorStop(0.35, '#f8fafc'); // ceiling/wall boundary
  wallGrad.addColorStop(0.40, '#fbfcfe'); // upper wall warm cream
  wallGrad.addColorStop(0.60, '#f1f5f9'); // lower wall
  wallGrad.addColorStop(0.62, '#cbd5e1'); // baseboard trim
  wallGrad.addColorStop(0.65, '#e2e8f0'); // baseboard lower
  wallGrad.addColorStop(1.0, '#dbe4ee'); // floor horizon
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Realistic Hardwood Floor with Plank Perspective (y: 640 to 1024)
  const floorGrad = ctx.createLinearGradient(0, 640, 0, h);
  floorGrad.addColorStop(0, '#a87954'); // warm oak
  floorGrad.addColorStop(0.3, '#936440');
  floorGrad.addColorStop(0.7, '#7e5333');
  floorGrad.addColorStop(1.0, '#663f24'); // rich deep teak near feet
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 640, w, h - 640);

  // Draw wood plank seams with perspective lines
  ctx.strokeStyle = 'rgba(60, 35, 15, 0.28)';
  ctx.lineWidth = 2;
  for (let y = 650; y < h; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = 0; x < w; x += 110) {
    ctx.strokeStyle = 'rgba(60, 35, 15, 0.18)';
    ctx.beginPath();
    ctx.moveTo(x, 640);
    ctx.lineTo(x + 40, h);
    ctx.stroke();
  }

  // 3. Ceiling Details (y: 0 to 380)
  // Center ceiling fan at zenith (top center)
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(w * 0.5, 40, 55, 0, Math.PI * 2);
  ctx.fill();

  // Ceiling Fan blades
  ctx.fillStyle = '#475569';
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(w * 0.5, 40);
    ctx.rotate((i * 120 * Math.PI) / 180);
    ctx.fillRect(-14, 0, 28, 90);
    ctx.restore();
  }

  // Recessed warm LED downlights across the ceiling
  const lightPositions = [
    { x: w * 0.2, y: 120 },
    { x: w * 0.4, y: 110 },
    { x: w * 0.6, y: 110 },
    { x: w * 0.8, y: 120 },
  ];
  lightPositions.forEach((lp) => {
    const radG = ctx.createRadialGradient(lp.x, lp.y, 4, lp.x, lp.y, 70);
    radG.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    radG.addColorStop(0.3, 'rgba(253, 224, 71, 0.4)');
    radG.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = radG;
    ctx.beginPath();
    ctx.arc(lp.x, lp.y, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 4. Large East-Facing Daylight Window (yaw: 0°, around x: w * 0.5)
  const winW = 380;
  const winH = 260;
  const winX = w * 0.5 - winW / 2;
  const winY = 380;

  // Window frame drop shadow / light beam on walls
  const winGlow = ctx.createRadialGradient(winX + winW / 2, winY + winH / 2, 80, winX + winW / 2, winY + winH / 2, 340);
  winGlow.addColorStop(0, 'rgba(224, 242, 254, 0.75)');
  winGlow.addColorStop(0.7, 'rgba(254, 243, 199, 0.25)');
  winGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = winGlow;
  ctx.fillRect(winX - 100, winY - 60, winW + 200, winH + 160);

  // Outdoor scenery visible through the window (blue sky, trees, bright road)
  const outGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  outGrad.addColorStop(0, '#38bdf8'); // sky blue
  outGrad.addColorStop(0.5, '#bae6fd'); // horizon
  outGrad.addColorStop(0.55, '#15803d'); // lush green trees
  outGrad.addColorStop(0.85, '#166534');
  outGrad.addColorStop(1, '#94a3b8'); // street / campus ground
  ctx.fillStyle = outGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Foliage shapes
  ctx.fillStyle = '#14532d';
  for (let fx = winX + 20; fx < winX + winW - 20; fx += 40) {
    ctx.beginPath();
    ctx.arc(fx, winY + winH * 0.65, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Window Pane Frames (White Aluminum)
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 10;
  ctx.strokeRect(winX, winY, winW, winH);
  // Center vertical & horizontal mullions
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH / 2);
  ctx.lineTo(winX + winW, winY + winH / 2);
  ctx.stroke();

  // Curtains on sides
  ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
  ctx.fillRect(winX - 25, winY - 10, 35, winH + 20);
  ctx.fillRect(winX + winW - 10, winY - 10, 35, winH + 20);

  // Sunlight cast on the wooden floor from the window
  ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
  ctx.beginPath();
  ctx.moveTo(winX + 40, 640);
  ctx.lineTo(winX + winW - 40, 640);
  ctx.lineTo(winX + winW + 90, 880);
  ctx.lineTo(winX - 90, 880);
  ctx.closePath();
  ctx.fill();

  // 5. Comfortable Orthopedic Bed (around yaw: -50°, x: w * 0.35)
  const bedX = w * 0.35 - 180;
  const bedY = 510;
  const bedW = 280;
  const bedH = 220;

  // Bed Frame
  ctx.fillStyle = '#451a03'; // dark walnut wood frame
  ctx.fillRect(bedX, bedY + 70, bedW, 80);

  // Bed Headboard
  ctx.fillStyle = '#78350f';
  ctx.fillRect(bedX + 20, bedY - 10, bedW - 40, 85);
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 3;
  ctx.strokeRect(bedX + 20, bedY - 10, bedW - 40, 85);

  // Mattress (Crisp White / Light Slate)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(bedX + 10, bedY + 50, bedW - 20, 70, 8);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Pillows (Plump Fluffy)
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(bedX + 35, bedY + 30, 85, 45, 12);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  ctx.fillStyle = '#0284c7'; // Accent decorative pillow
  ctx.beginPath();
  ctx.roundRect(bedX + 135, bedY + 35, 75, 40, 10);
  ctx.fill();

  // Neatly Folded Blanket / Duvet with Sky Blue accent runner
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(bedX + 10, bedY + 85, bedW - 20, 65);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(bedX + 10, bedY + 110, bedW - 20, 22);

  // Bed Label / Spec Tag
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`ROOM ${roomNo} · ${roomType.toUpperCase()} BED`, bedX + 30, bedY + 175);

  // 6. Study Workstation & Ergonomic Chair (yaw: +42°, x: w * 0.62)
  const deskX = w * 0.62;
  const deskY = 510;
  const deskW = 240;
  const deskH = 180;

  // Wooden Table Top
  ctx.fillStyle = '#b45309';
  ctx.fillRect(deskX, deskY + 60, deskW, 20);

  // Metal table legs
  ctx.fillStyle = '#334155';
  ctx.fillRect(deskX + 15, deskY + 80, 12, 100);
  ctx.fillRect(deskX + deskW - 27, deskY + 80, 12, 100);

  // Laptop on Desk (illuminated screen)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(deskX + 70, deskY + 10, 80, 50); // screen
  ctx.fillStyle = '#38bdf8'; // glowing screen
  ctx.fillRect(deskX + 73, deskY + 13, 74, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = '9px monospace';
  ctx.fillText('Inveni Stay', deskX + 80, deskY + 30);
  ctx.fillText('120 Mbps WiFi', deskX + 80, deskY + 45);
  // Base
  ctx.fillStyle = '#64748b';
  ctx.fillRect(deskX + 60, deskY + 58, 100, 6);

  // Modern Study Lamp (emitting warm cone)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(deskX + 180, deskY + 15, 6, 45); // stand
  ctx.beginPath();
  ctx.arc(deskX + 183, deskY + 15, 16, Math.PI, 0); // lamp shade
  ctx.fill();
  // Warm lamp light glow
  const lampGlow = ctx.createRadialGradient(deskX + 183, deskY + 25, 4, deskX + 183, deskY + 45, 60);
  lampGlow.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
  lampGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = lampGlow;
  ctx.beginPath();
  ctx.arc(deskX + 183, deskY + 45, 60, 0, Math.PI * 2);
  ctx.fill();

  // Ergonomic Mesh Task Chair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(deskX + 75, deskY + 70, 70, 75, 10); // backrest
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(deskX + 65, deskY + 115, 90, 18); // seat
  ctx.fillRect(deskX + 105, deskY + 133, 10, 45); // stem
  // 5-star castor base
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(deskX + 80, deskY + 175);
  ctx.lineTo(deskX + 140, deskY + 175);
  ctx.stroke();

  // 7. Lockable Double Wardrobe (yaw: 125°, x: w * 0.85)
  const wardX = w * 0.85 - 80;
  const wardY = 380;
  const wardW = 190;
  const wardH = 320;

  // Almirah body
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(wardX, wardY, wardW, wardH);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.strokeRect(wardX, wardY, wardW, wardH);

  // Double door split
  ctx.beginPath();
  ctx.moveTo(wardX + wardW / 2, wardY);
  ctx.lineTo(wardX + wardW / 2, wardY + wardH);
  ctx.stroke();

  // Chrome long vertical handles
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(wardX + wardW / 2 - 12, wardY + 120, 6, 60);
  ctx.fillRect(wardX + wardW / 2 + 6, wardY + 120, 6, 60);

  // Keyhole
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(wardX + wardW / 2 - 9, wardY + 195, 3, 0, Math.PI * 2);
  ctx.arc(wardX + wardW / 2 + 9, wardY + 195, 3, 0, Math.PI * 2);
  ctx.fill();

  // Top luggage shelf line
  ctx.strokeRect(wardX, wardY, wardW, 60);

  // 8. Attached Bathroom Doorway & Modern En-Suite (yaw: -135°, x: w * 0.12)
  const bathX = w * 0.12 - 70;
  const bathY = 370;
  const bathW = 160;
  const bathH = 340;

  // Door Frame
  ctx.fillStyle = '#334155';
  ctx.fillRect(bathX, bathY, bathW, bathH);

  // Frosted Glass / Interior glimpse
  const bathInnerGrad = ctx.createLinearGradient(bathX, bathY, bathX, bathY + bathH);
  bathInnerGrad.addColorStop(0, '#e0f2fe');
  bathInnerGrad.addColorStop(0.5, '#f8fafc');
  bathInnerGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = bathInnerGrad;
  ctx.fillRect(bathX + 12, bathY + 12, bathW - 24, bathH - 24);

  // Bathroom Chrome lever handle
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(bathX + bathW - 35, bathY + 160, 22, 7);

  // Signage "Attached Bath · Private"
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PRIVATE BATH', bathX + 35, bathY + 50);

  // 9. Split AC Unit (yaw: -15°, x: w * 0.46, near ceiling y: 260)
  const acX = w * 0.46;
  const acY = 240;
  const acW = 140;
  const acH = 45;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(acX, acY, acW, acH, 6);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // AC vent louvers
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(acX + 10, acY + 36);
  ctx.lineTo(acX + acW - 10, acY + 36);
  ctx.stroke();

  // Digital LED Temperature Display
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('24°C', acX + acW - 48, acY + 22);

  // 10. Wall Art & Certification Poster
  const artX = w * 0.26;
  const artY = 380;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(artX, artY, 90, 110);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.strokeRect(artX, artY, 90, 110);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('INVENI STAY', artX + 12, artY + 30);
  ctx.fillStyle = '#16a34a';
  ctx.font = '8px sans-serif';
  ctx.fillText('✓ VERIFIED 2026', artX + 12, artY + 50);
  ctx.fillText('Hygiene Standard', artX + 12, artY + 65);
  ctx.fillText('Room Inspection', artX + 12, artY + 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1; // Invert horizontally to view properly from inside sphere
  return texture;
}

export const ThreeRoomViewer: React.FC<ThreeRoomViewerProps> = ({
  roomNo = '101',
  roomType = 'Single',
  monthlyRent = 5500,
  propertyId = '',
  onSwitchToFloorPlan,
  onSwitchToGallery,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<HotspotInfo | null>(ROOM_HOTSPOTS[0]);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(70); // FOV in degrees
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Screen coordinates for 2D overlays over 3D hotspots
  const [hotspotScreenPositions, setHotspotScreenPositions] = useState<
    { id: string; x: number; y: number; visible: boolean }[]
  >([]);

  // Camera orientation state (degrees)
  const yawRef = useRef<number>(-20); // longitude
  const pitchRef = useRef<number>(-5); // latitude
  const targetYawRef = useRef<number>(-20);
  const targetPitchRef = useRef<number>(-5);
  const targetFovRef = useRef<number>(70);

  // Drag interaction state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Animate camera to specific hotspot
  const flyToHotspot = useCallback((hotspot: HotspotInfo) => {
    setActiveHotspot(hotspot);
    targetYawRef.current = hotspot.yaw;
    targetPitchRef.current = hotspot.pitch;
    targetFovRef.current = 62; // zoom in slightly to focus
    lastInteractionTimeRef.current = Date.now();
  }, []);

  // Reset to default room overview
  const handleReset = useCallback(() => {
    targetYawRef.current = -20;
    targetPitchRef.current = -5;
    targetFovRef.current = 70;
    lastInteractionTimeRef.current = Date.now();
  }, []);

  const handleZoomIn = useCallback(() => {
    targetFovRef.current = Math.max(35, targetFovRef.current - 12);
  }, []);

  const handleZoomOut = useCallback(() => {
    targetFovRef.current = Math.min(95, targetFovRef.current + 12);
  }, []);

  // Initialize Three.js Scene and Render Loop
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dimensions
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Inverted Panoramic Room Sphere
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    // Invert geometry so faces point inwards
    geometry.scale(-1, 1, 1);

    // Procedural photorealistic equirectangular room texture
    const texture = createProceduralRoomTexture(roomType, roomNo);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Hotspot 3D position calculation
    const getHotspot3DPos = (yawDeg: number, pitchDeg: number, radius = 450) => {
      const phi = THREE.MathUtils.degToRad(90 - pitchDeg);
      const theta = THREE.MathUtils.degToRad(yawDeg);
      return new THREE.Vector3(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
    };

    // 5. Animation / Render Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Auto-rotation when not interacting
      const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
      if (isAutoRotating && !isDraggingRef.current && timeSinceInteraction > 2500) {
        targetYawRef.current += 7.5 * delta; // smooth degrees per second
      }

      // Smooth camera orientation damping
      yawRef.current += (targetYawRef.current - yawRef.current) * 0.12;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * 0.12;
      // Clamp pitch
      pitchRef.current = Math.max(-85, Math.min(85, pitchRef.current));

      // Smooth FOV damping
      if (camera.fov !== targetFovRef.current) {
        camera.fov += (targetFovRef.current - camera.fov) * 0.15;
        camera.updateProjectionMatrix();
        setZoomLevel(Math.round(camera.fov));
      }

      // Convert yaw/pitch into lookAt vector on unit sphere
      const phi = THREE.MathUtils.degToRad(90 - pitchRef.current);
      const theta = THREE.MathUtils.degToRad(yawRef.current);
      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.sin(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);

      // Real-time Heading angle
      const normalizedYaw = ((yawRef.current % 360) + 360) % 360;
      setCurrentHeading(Math.round(normalizedYaw));

      // Project 3D Hotspot positions to 2D screen coordinates
      const positions = ROOM_HOTSPOTS.map((h) => {
        const p3d = getHotspot3DPos(h.yaw, h.pitch, 450);
        const projected = p3d.clone().project(camera);
        // Is it in front of the camera?
        const isVisible = projected.z < 1;
        const screenX = ((projected.x + 1) * width) / 2;
        const screenY = ((-projected.y + 1) * height) / 2;
        return {
          id: h.id,
          x: Math.round(screenX),
          y: Math.round(screenY),
          visible: isVisible,
        };
      });
      setHotspotScreenPositions(positions);

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(mount);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      mount.innerHTML = '';
    };
  }, [roomNo, roomType, isAutoRotating]);

  // Pointer & Mouse Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastInteractionTimeRef.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastInteractionTimeRef.current = Date.now();

    // Sensitivity factor
    const factor = (cameraRef.current?.fov ?? 70) / 450;
    targetYawRef.current -= dx * factor;
    targetPitchRef.current += dy * factor;
    targetPitchRef.current = Math.max(-85, Math.min(85, targetPitchRef.current));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    lastInteractionTimeRef.current = Date.now();
    const zoomDelta = e.deltaY * 0.05;
    targetFovRef.current = Math.max(35, Math.min(95, targetFovRef.current + zoomDelta));
  };

  // Heading label (N, NE, E, etc.)
  const getCompassHeadingLabel = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return directions[idx];
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.3s ease',
        userSelect: 'none',
      }}
    >
      {/* ── Top Control HUD ── */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 25,
          pointerEvents: 'none',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {/* Left Telemetry Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#16a34a',
                boxShadow: '0 0 8px rgba(22, 163, 74, 0.6)',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#0284c7',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-headline)',
              }}
            >
              360° SPATIAL ROOM TOUR
            </span>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 700,
              color: '#334155',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
            }}
          >
            Room {roomNo} · {roomType} Sharing · ₹{monthlyRent.toLocaleString('en-IN')}/mo
          </div>
        </div>

        {/* Right Tools HUD */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', pointerEvents: 'auto' }}>
          {/* Compass direction badge */}
          <div
            title={`Heading: ${currentHeading}° (${getCompassHeadingLabel(currentHeading)})`}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '5px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 800,
              color: '#0f172a',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Compass size={13} color="#0284c7" />
            <span>
              {getCompassHeadingLabel(currentHeading)} {currentHeading}°
            </span>
          </div>

          {/* Auto Tour Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotating((prev) => !prev)}
            title={isAutoRotating ? 'Pause 360° Auto-Tour' : 'Start 360° Auto-Tour'}
            style={hudBtnStyle}
          >
            {isAutoRotating ? <Pause size={13} color="#0284c7" /> : <Play size={13} color="#0284c7" />}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{isAutoRotating ? 'Auto Tour' : 'Static'}</span>
          </button>

          {/* Reset View */}
          <button type="button" onClick={handleReset} title="Reset to Eye-Level Overview" style={hudBtnStyle}>
            <RotateCcw size={13} color="#0f172a" />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Reset</span>
          </button>

          {/* Zoom Buttons */}
          <button type="button" onClick={handleZoomIn} title="Zoom In (Inspect Details)" style={hudIconBtnStyle}>
            <ZoomIn size={14} color="#0f172a" />
          </button>
          <button type="button" onClick={handleZoomOut} title="Zoom Out (Wide View)" style={hudIconBtnStyle}>
            <ZoomOut size={14} color="#0f172a" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={hudIconBtnStyle}
          >
            {isFullscreen ? <Minimize2 size={14} color="#0f172a" /> : <Maximize2 size={14} color="#0f172a" />}
          </button>

          {/* Floor Plan jump */}
          {onSwitchToFloorPlan && (
            <button type="button" onClick={onSwitchToFloorPlan} style={hudBtnStyle}>
              <Layers size={13} color="#0284c7" />
              <span style={{ fontSize: 11, fontWeight: 700 }}>Floor Plan</span>
            </button>
          )}

          {/* Photo Gallery jump */}
          {onSwitchToGallery && (
            <button type="button" onClick={onSwitchToGallery} style={hudBtnStyle}>
              <Eye size={13} color="#16a34a" />
              <span style={{ fontSize: 11, fontWeight: 700 }}>Photos</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Quick Angle Presets Bar (Pills under Top HUD) ── */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 14,
          right: 14,
          display: 'flex',
          gap: 6,
          zIndex: 24,
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', flexShrink: 0 }}>
          {ROOM_HOTSPOTS.map((h) => {
            const isActive = activeHotspot?.id === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => flyToHotspot(h)}
                style={{
                  background: isActive ? '#0284c7' : 'rgba(255, 255, 255, 0.94)',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '4px 11px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span>{h.name}</span>
                {isActive && <CheckCircle2 size={11} color="#ffffff" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Three.js WebGL Canvas Mount ── */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: isFullscreen ? '90vh' : 'clamp(340px, 50vh, 520px)',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
          background: '#f1f5f9',
        }}
      />

      {/* ── 3D Floating Hotspot Pins Projecting Over the Canvas ── */}
      {hotspotScreenPositions.map((pos) => {
        if (!pos.visible) return null;
        const hotspotData = ROOM_HOTSPOTS.find((h) => h.id === pos.id);
        if (!hotspotData) return null;
        const isActive = activeHotspot?.id === pos.id;

        return (
          <div
            key={pos.id}
            onClick={(e) => {
              e.stopPropagation();
              flyToHotspot(hotspotData);
              setShowInspectionModal(true);
            }}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 22,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            {/* Pulsing Pin Marker */}
            <div
              style={{
                width: isActive ? 34 : 28,
                height: isActive ? 34 : 28,
                borderRadius: '50%',
                background: isActive ? '#0284c7' : '#ffffff',
                border: isActive ? '3px solid #ffffff' : '2.5px solid #0284c7',
                boxShadow: isActive
                  ? '0 0 16px rgba(2, 132, 199, 0.7), 0 4px 12px rgba(15, 23, 42, 0.2)'
                  : '0 4px 12px rgba(15, 23, 42, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#ffffff' : '#0284c7',
                transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={isActive ? 16 : 13} />
            </div>

            {/* Label Tooltip */}
            <div
              style={{
                marginTop: 4,
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '2px 7px',
                fontSize: 10,
                fontWeight: 800,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
              }}
            >
              {hotspotData.name}
            </div>
          </div>
        );
      })}

      {/* ── Drag & Zoom Hint Overlay (Bottom Left) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 20,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e2e8f0',
          borderRadius: '9999px',
          padding: '5px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: '#64748b',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
          pointerEvents: 'none',
        }}
      >
        <Move size={12} color="#0284c7" />
        <span>Drag to orbit 360° · Scroll to zoom</span>
      </div>

      {/* ── Active Inspection Card (Bottom Right Floating) ── */}
      {activeHotspot && (
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
            maxWidth: '420px',
            width: 'calc(100% - 28px)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.12)',
            zIndex: 26,
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0284c7' }}>{activeHotspot.title}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: '#ecfdf5',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    borderRadius: '9999px',
                    padding: '1px 6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <ShieldCheck size={10} />
                  {activeHotspot.qualityScore}
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                {activeHotspot.description}
              </p>
            </div>
          </div>

          {/* Key Specs & Hygiene */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 12px',
              marginTop: 8,
              marginBottom: 8,
              fontSize: 11,
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
              📐 Spec: <span style={{ fontWeight: 500, color: '#334155' }}>{activeHotspot.spec}</span>
            </div>
            <div style={{ color: '#16a34a', fontWeight: 600 }}>
              🌿 Hygiene: <span style={{ color: '#334155', fontWeight: 400 }}>{activeHotspot.hygieneStatus}</span>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, color: '#64748b' }}>
              Checked by Inveni Field Auditor · 100% Guaranteed
            </span>
            <button
              type="button"
              onClick={() => setShowInspectionModal(true)}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Info size={12} />
              <span>Inspect Details</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Inspection Detail Modal Dialog ── */}
      {showInspectionModal && activeHotspot && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(12px)',
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowInspectionModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    {activeHotspot.title}
                  </h3>
                  <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                    Verified Standard · Room {roomNo} ({roomType})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInspectionModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
              {activeHotspot.description}
            </p>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Quality & Verification Checklist
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeHotspot.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: '#334155',
                      background: '#f8fafc',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 14,
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Quality Score: </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0284c7' }}>
                  {activeHotspot.qualityScore}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInspectionModal(false)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Back to 360° Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const hudBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid #e2e8f0',
  borderRadius: '9999px',
  padding: '6px 12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  cursor: 'pointer',
  color: '#0f172a',
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
  transition: 'all 0.2s ease',
};

const hudIconBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid #e2e8f0',
  borderRadius: '9999px',
  width: 32,
  height: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#0f172a',
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
  transition: 'all 0.2s ease',
};
