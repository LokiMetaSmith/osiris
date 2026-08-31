# ArcGIS Feature Gap Analysis & Open-Source Modernization Roadmap

## Focus: Aerial Surveillance & Drone Operations

---

## Executive Summary

This report delivers a technical feature gap analysis comparing the **OSINT Platform** with the **Esri ArcGIS Ecosystem** (ArcGIS Online, ArcGIS Pro, ArcGIS Image Analyst, ArcGIS Velocity, Site Scan for ArcGIS, and ArcGIS Field Maps), specifically through the lens of **aerial surveillance, drone operations, and Full Motion Video (FMV) intelligence**.

While the current Next.js/MapLibre OSINT Platform offers lightweight WebGL-rendered entity tracking, live sensor status monitoring (`/api/sensors`), and multi-layer OSINT overlays, it lacks native photogrammetry processing, MISB-compliant telemetry decoding, 3D mesh streaming, server-side spatial analytics, and computer vision object tracking.

This document outlines these critical feature gaps, provides an **actionable, open-source architectural roadmap**, and details an **expansive, step-by-step implementation TODO list** to transform the platform into an enterprise-grade, self-hosted aerial reconnaissance grid.

---

## 1. Current OSINT Platform Baseline

The OSINT Platform provides foundational geospatial awareness with the following aerial surveillance primitives:

* **Live Sensor Telemetry (`/api/sensors`)**: In-memory singleton store (`sensor-store.ts`) accepting HTTP POST updates for drone position (`lat`, `lng`, `alt`), heading (`0-360°`), speed, and battery status.
* **Map Rendering (`OsintMap.tsx`)**: MapLibre GL JS WebGL map displaying rotated drone markers based on heading and rendering altitude labels.
* **Stream Linking**: Ability to link HLS/WebRTC video streams to camera and sensor markers, launching basic video playback in the UI (`CameraViewer.tsx`).
* **Multi-Domain Intelligence Layers**: 16+ overlays including OpenSky commercial/military aviation tracks, USGS seismic data, FIRMS thermal anomalies, and satellite positions.

---

## 2. Detailed Feature Gap Analysis

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         FEATURE GAP DOMAIN SUMMARY                              │
├───────────────────────────────┬───────────────────────────────┬──────────────────┤
│ Capabilities Domain           │ ArcGIS Ecosystem              │ OSINT Platform   │
├───────────────────────────────┼───────────────────────────────┼──────────────────┤
│ 1. Full Motion Video (FMV)    │ Native MISB ST 0601 / 0903    │ Static point +   │
│    & MISB KLV Telemetry       │ Frame-by-frame geo-projection │ video stream link│
├───────────────────────────────┼───────────────────────────────┼──────────────────┤
│ 2. Photogrammetry & 3D        │ Drone2Map & Site Scan         │ 2D Vector &      │
│    Reality Capture            │ Orthomosaics, Point Clouds    │ Building Heights │
├───────────────────────────────┼───────────────────────────────┼──────────────────┤
│ 3. 3D Terrain & Scenes        │ 3D Scene Services (I3S)       │ 2D Pseudo-globe /│
│    Visualization              │ Global Elevation Models       │ Flat Mercator    │
├───────────────────────────────┼───────────────────────────────┼──────────────────┤
│ 4. Real-Time Telemetry &      │ GeoEvent Server / Velocity    │ UI-level JS      │
│    Spatial Analytics          │ Server Geofence & Spatial Join│ Client Filter    │
├───────────────────────────────┼───────────────────────────────┼──────────────────┤
│ 5. Computer Vision &          │ Image Analyst AI Models       │ Text-based AI    │
│    Aerial Object Detection    │ Automated Vehicle/Ship Track  │ Prompt Assistant │
├───────────────────────────────┼───────────────────────────────┼──────────────────┤
│ 6. Field Operations &         │ Field Maps / Survey123        │ Web-only         │
│    Offline Synchronization    │ Disconnected Offline Sync     │ Constant Online  │
└───────────────────────────────┴───────────────────────────────┴──────────────────┤
```

---

### Gap 1: Full Motion Video (FMV) & Sensor Metadata [CRITICAL GAP]

#### ArcGIS Capability
* **MISB Metadata Parsing**: ArcGIS Pro (Image Analyst Extension) decodes **MISB ST 0601** (UAS Datalink Local Set) and **MISB ST 0903** (VMTI - Video Moving Target Indicator) KLV (Key-Length-Value) metadata embedded directly in MPEG-TS video streams.
* **Dynamic Footprint Projection**: Dynamically projects the drone camera's ground footprint, sensor center, optical pitch/roll/yaw, slant range, and field of view (FOV) trapezoid onto 2D and 3D maps in real-time.
* **Target Bounding Box Georeferencing**: Converts pixel-space video moving target indicators (VMTI) into georeferenced map coordinates.

#### OSINT Platform State
* Sensor telemetry (`lat`, `lng`, `heading`, `alt`) and video stream URL (`stream_url`) are disconnected.
* The map renders a 2D point icon; there is no dynamic camera FOV footprint, target bounding box projection, or frame-synchronized metadata decoding.

---

### Gap 2: Drone Photogrammetry & 3D Reality Capture

#### ArcGIS Capability
* **End-to-End Photogrammetry**: **ArcGIS Drone2Map** and **Site Scan for ArcGIS** process raw overlapping geotagged drone images (EO/IR).
* **Derivatives Generation**: Automatically builds calibrated True Orthomosaics, Digital Surface Models (DSMs), Digital Terrain Models (DTMs), dense 3D Point Clouds (`.LAS`/`.LAZ`), and textured 3D meshes (`.SLPK` Scene Layer Packages or OGC 3D Tiles).

#### OSINT Platform State
* No image ingestion or bundle adjustment photogrammetry pipeline.
* Cannot ingest raw aerial surveys to produce custom high-resolution map tiles or point clouds.

---

### Gap 3: 3D Terrain & Scene Visualization

#### ArcGIS Capability
* **OGC & I3S 3D Scene Streaming**: Streams multi-gigabyte 3D city models, BIM datasets, and high-resolution elevation surfaces via OGC 3D Tiles and Esri I3S standards.
* **3D Analytics**: Conducts line-of-sight calculations, viewshed analysis, 3D volumetric measurements, and terrain profile extraction.

#### OSINT Platform State
* Uses MapLibre GL JS with basic 2D Mercator or pseudo-globe projection.
* 3D support is restricted to vector building extrusions based on flat heights (`render_height`). No raster elevation DEM terrain model or 3D point cloud rendering.

---

### Gap 4: Real-Time Telemetry & Spatial Analytics

#### ArcGIS Capability
* **ArcGIS Velocity & GeoEvent Server**: Ingests tens of thousands of telemetry events per second via MQTT, WebSockets, Kafka, and REST.
* **Dynamic Server-Side Analytics**: Runs continuous spatial queries: dynamic geofencing (triggering alerts when drones enter/exit restricted airspace), spatial joins, proximity buffers, and anomaly detection.

#### OSINT Platform State
* Uses an in-memory `Map<string, LiveSensor>` in Next.js Node runtime (`sensor-store.ts`).
* Analytics are limited to client-side array filtering in React components. No spatial indexing, server-side geofencing firehose, or event-driven alert triggers.

---

### Gap 5: Computer Vision & Edge AI Integration

#### ArcGIS Capability
* **Spatial Machine Learning**: Native deep learning framework integration (YOLO, Faster R-CNN, Segment Anything Model) for automated object detection in aerial feeds.
* **Automated Tracking**: Detects and classifies vehicles, vessels, aircraft, thermal hotspots, and personnel, publishing tracks as live map layers.

#### OSINT Platform State
* Text-only AI analyst interface (`AiAnalyst.tsx`) calling LLM APIs.
* No computer vision models or frame processing on incoming video streams.

---

### Gap 6: Field Operations & Offline Sync

#### ArcGIS Capability
* **ArcGIS Field Maps & Survey123**: Allows field operators and drone pilots to operate fully disconnected from the internet.
* **Bi-directional Sync**: Edits, telemetry, and observations are queued locally in SQLite/mobile geodatabases and automatically synchronized upon reconnecting.

#### OSINT Platform State
* Web application relying on continuous network connectivity to load MapLibre tiles and API endpoints. No service worker offline caching or local-first database queue.

---

## 3. Comprehensive Feature Comparison Matrix

| Feature / Domain | Esri ArcGIS Ecosystem | OSINT Platform (Current) | Target OSINT Modernization |
| :--- | :--- | :--- | :--- |
| **Telemetry Ingestion** | MISB ST 0601 / MQTT / Kafka | REST POST (`/api/sensors`) | WebSockets + NATS / Kafka |
| **FMV Metadata Decoding** | MISB ST 0601 KLV & ST 0903 VMTI | None (Static URL link) | Node `klv-parser` + WebRTC |
| **Camera Footprint** | Dynamic FOV Ground Trapezoid | Static point with heading | GeoJSON FOV Polygon Overlay |
| **Photogrammetry** | ArcGIS Drone2Map / Site Scan | None | NodeODM (OpenDroneMap API) |
| **3D Rendering** | I3S & 3D Tiles, Elevation DEM | 2D Vector Extrusions | MapLibre v3 DEM / CesiumJS 3D Tiles |
| **Geofencing & Alerts** | ArcGIS Velocity Server Rules | Client-side JS Filter | PostGIS + Turf.js + Redis Pub/Sub |
| **Computer Vision AI** | Integrated Deep Learning SDK | LLM Text Chatbot | Python YOLOv8 / ONNX Microservice |
| **Offline Capability** | Disconnected Field Sync | Online Web Client | PWA + IndexedDB / RxDB Sync |
| **Data Security & Certs** | FedRAMP Moderate, ISO 27001 | Self-hosted / Keyless | Role-Based Access + SSRF Guard |

---

## 4. Actionable Open-Source Architecture Modernization Roadmap

To transform the Next.js/MapLibre OSINT Platform into a high-performance aerial surveillance suite, we propose a 5-phase modular architecture using open-source technologies.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                 OPEN-SOURCE MODERNIZATION ARCHITECTURE MAP                       │
└──────────────────────────────────────────────────────────────────────────────────┘

   ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
   │ Live Drone /   │      │ Raw Aerial     │      │ Field Operator │
   │ RTSP Feed      │      │ Image Set      │      │ Mobile Device  │
   └───────┬────────┘      └───────┬────────┘      └───────┬────────┘
           │                       │                       │
           ▼                       ▼                       ▼
┌───────────────────────┐ ┌─────────────────┐   ┌───────────────────────┐
│ Phase 1: FMV Stream   │ │ Phase 2: NodeODM│   │ Phase 5: PWA &        │
│ WebRTC + KLV Parser   │ │ Photogrammetry  │   │ Offline Local First   │
└──────────┬────────────┘ └────────┬────────┘   └──────────┬────────────┘
           │                       │                       │
           ▼                       ▼                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Spatial Engine & Telemetry Firehose                                     │
│ PostGIS + Redis Pub/Sub + Turf.js Geofencing                                     │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Edge CV Microservice (Python YOLOv8 / ONNX)                             │
│ Detects Vehicles / Vessels / Targets → Generates Live Target Layers              │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ OSINT Platform Frontend (Next.js 16 + MapLibre GL v3 / CesiumJS)                 │
│ - Live 3D Terrain & Footprint Mapping                                            │
│ - Real-Time Target Bounding Box Overlays                                         │
│ - Synchronized Video & Telemetry Playback                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Full Motion Video (FMV) & MISB KLV Metadata Pipeline

* **Objective**: Ingest live RTSP/SRT drone feeds, decode embedded MISB ST 0601 KLV metadata, and project dynamic sensor FOV footprints onto the map.
* **Architecture**:
  1. **Streaming Proxy**: Deploy a **MediaMTX** (RTSP/WebRTC server) microservice to ingest RTSP feeds from drones.
  2. **Metadata Extraction**: Use a Node.js parser (`klv-parser` or `ts-klv`) to demux MPEG-TS streams and extract sensor latitude, longitude, altitude, sensor roll/pitch/yaw, and horizontal FOV.
  3. **Frontend Footprint Projection**: Compute ground intersection polygon coordinates using spherical trigonometry (`Turf.js`) and render the dynamic FOV trapezoid live in `OsintMap.tsx`.

```typescript
// Conceptual KLV Footprint Calculation
import * as turf from '@turf/turf';

export function calculateCameraFootprint(
  sensorLat: number,
  sensorLng: number,
  altMeters: number,
  headingDeg: number,
  pitchDeg: number,
  hfovDeg: number
) {
  // Compute center distance based on pitch and altitude
  const slantRange = altMeters / Math.sin((Math.abs(pitchDeg) * Math.PI) / 180);
  const centerDistanceKm = (slantRange * Math.cos((Math.abs(pitchDeg) * Math.PI) / 180)) / 1000;

  const sensorPoint = turf.point([sensorLng, sensorLat]);
  const centerPoint = turf.destination(sensorPoint, centerDistanceKm, headingDeg);

  // Compute 4 corners of camera field-of-view trapezoid
  const halfFov = hfovDeg / 2;
  const leftCorner = turf.destination(sensorPoint, centerDistanceKm * 1.2, headingDeg - halfFov);
  const rightCorner = turf.destination(sensorPoint, centerDistanceKm * 1.2, headingDeg + halfFov);

  return turf.polygon([[
    [sensorLng, sensorLat],
    leftCorner.geometry.coordinates,
    centerPoint.geometry.coordinates,
    rightCorner.geometry.coordinates,
    [sensorLng, sensorLat]
  ]]);
}
```

---

### Phase 2: Photogrammetry & 3D Reality Engine

* **Objective**: Ingest aerial survey image sets and convert them into orthomosaics and 3D Tiles.
* **Architecture**:
  1. **Processing Backend**: Connect the platform to a self-hosted **NodeODM (OpenDroneMap)** instance via REST API.
  2. **Job Queue**: When drone operators upload a zip of geotagged images, dispatch an asynchronous task to NodeODM (`/task/new`).
  3. **Tile Publishing**: NodeODM generates COGs (Cloud Optimized GeoTIFFs) and OGC 3D Tiles. Expose these via a local tile service and display them in the OSINT Map as custom raster/3D layers.

---

### Phase 3: 3D Terrain & Scene Visualization Upgrade

* **Objective**: Upgrade map visualization to support global elevation DEMs and 3D Tile streaming.
* **Architecture**:
  1. **MapLibre GL JS v3 Terrain**: Configure MapLibre v3 with MapTiler or AWS Terrarium RGB elevation DEM tiles for true 3D terrain representation:
     ```typescript
     map.addSource('terrain-dem', {
       type: 'raster-dem',
       url: 'https://dem-tiles-url/tiles.json',
       tileSize: 256
     });
     map.setTerrain({ source: 'terrain-dem', exaggeration: 1.5 });
     ```
  2. **CesiumJS Hybrid Engine**: For complex 3D photogrammetry mesh inspection, embed a dedicated 3D scene tab powered by **CesiumJS**, enabling seamless 3D point cloud and mesh analysis alongside MapLibre 2D/3D maps.

---

### Phase 4: High-Throughput Spatial Analytics & Geofencing

* **Objective**: Enable server-side geofencing, dynamic speed alerts, and spatial correlation.
* **Architecture**:
  1. **Message Broker**: Introduce **Redis Pub/Sub** or **NATS** for real-time telemetry distribution.
  2. **PostGIS Backend**: Persist telemetry points in a **PostgreSQL + PostGIS** database.
  3. **Server-Side Geofencing**: Execute spatial trigger queries when telemetry updates arrive:
     ```sql
     -- Server-side PostGIS Geofence Check
     SELECT g.id, g.name, g.risk_level
     FROM no_fly_zones g
     WHERE ST_Contains(g.geom, ST_SetSRID(ST_MakePoint($lng, $lat), 4369));
     ```

---

### Phase 5: Edge Computer Vision (CV) Microservice

* **Objective**: Automate target detection and classification in live aerial video feeds.
* **Architecture**:
  1. **Inference Service**: Build a lightweight Python FastAPI microservice running **YOLOv8** or **ONNX Runtime** with CUDA/TensorRT acceleration.
  2. **Frame Processing**: Sample incoming RTSP/WebRTC video frames, perform detection for `car`, `truck`, `vessel`, `aircraft`, and `person`.
  3. **Target Track Publishing**: Push bounding boxes paired with geo-coordinates (via MISB KLV projection) to the frontend via WebSockets, rendering live bounding box target tracks over the map.

---

### Phase 6: PWA & Disconnected Field Mesh

* **Objective**: Enable full offline operation for field pilots.
* **Architecture**:
  1. **PWA Conversion**: Add Next.js Progressive Web App configuration (`@ducanh2912/next-pwa`) with Service Workers caching map tiles and static assets.
  2. **Local-First Database**: Use **IndexedDB** paired with **RxDB** or **PouchDB** to queue telemetry updates, observations, and field reports offline, auto-syncing with the central server upon network restoration.

---

## 5. Strategic Implementation Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         IMPLEMENTATION TIMELINE                                 │
├─────────────────┬──────────────────────────────────┬─────────────────────────────┤
│ Phase           │ Deliverable                      │ Primary Tech Stack          │
├─────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ Phase 1 (Q1)    │ MISB KLV Parsing & Dynamic FOV   │ MediaMTX, klv-parser, Turf  │
│ Phase 2 (Q2)    │ OpenDroneMap Photogrammetry Sync │ NodeODM, COG Tile Server    │
│ Phase 3 (Q2)    │ MapLibre v3 3D DEM & CesiumJS    │ MapLibre v3, CesiumJS       │
│ Phase 4 (Q3)    │ PostGIS & Redis Telemetry Firehose│ PostGIS, Redis, WebSockets  │
│ Phase 5 (Q3)    │ Edge Computer Vision Tracking    │ Python, YOLOv8, ONNX        │
│ Phase 6 (Q4)    │ PWA & Disconnected Offline Mesh  │ Service Workers, RxDB       │
└─────────────────┴──────────────────────────────────┴─────────────────────────────┘
```

---

## 6. Detailed Implementation TODO List

This comprehensive TODO list provides an actionable, itemized engineering plan broken down into 6 key implementation phases. Each task includes specific engineering requirements, targeted source locations, tech dependencies, and concrete acceptance criteria.

---

### Phase 1: Full Motion Video (FMV) & MISB ST 0601 / 0903 Metadata Pipeline

- [x] **1.1 Deploy MediaMTX RTSP/WebRTC Video Proxy Microservice**
  - **Goal**: Establish a low-latency WebRTC/RTSP media relay for live drone video ingestion.
  - **Tech Stack**: MediaMTX (Go), Docker, WebRTC, RTSP.
  - **Target Files**: `docker-compose.yml`, `nginx/nginx.conf`, `src/app/api/media-proxy/route.ts`.
  - **Subtasks**:
    - [x] Add `mediamtx` service definition to `docker-compose.yml` with port forwardings (8554 RTSP, 8889 WebRTC).
    - [x] Configure Nginx reverse proxy rules for WebRTC signaling (`/mediamtx/`).
    - [x] Add health-check API endpoint `/api/media-proxy/health` in Next.js to verify media stream status.
  - **Acceptance Criteria**: RTSP feed published to `rtsp://localhost:8554/drone1` is converted into a zero-latency WebRTC stream accessible in the browser.

- [x] **1.2 Implement MISB ST 0601 / ST 0903 KLV Metadata Demuxer**
  - **Goal**: Parse Key-Length-Value (KLV) metadata from MPEG-TS drone streams into JSON telemetry payloads.
  - **Tech Stack**: Node.js, `klv-parser`, `fluent-ffmpeg`, TypeScript.
  - **Target Files**: `src/lib/fmv/klv-parser.ts`, `src/app/api/sensors/fmv/route.ts`.
  - **Subtasks**:
    - [x] Create `src/lib/fmv/klv-parser.ts` to decode ST 0601 tags (Tag 5: Sensor Lat, Tag 6: Sensor Lng, Tag 7: Sensor True Alt, Tag 13: Sensor Pitch, Tag 14: Sensor Roll, Tag 15: Sensor Yaw, Tag 16: Horizontal FOV).
    - [x] Implement VMTI ST 0903 tag parsing for target bounding box coordinates and target classifications.
    - [x] Emit parsed KLV metadata as WebSocket events to `/api/sensors/fmv`.
  - **Acceptance Criteria**: MPEG-TS stream containing MISB metadata outputs structured JSON telemetry objects at 30 Hz.

- [x] **1.3 Build Real-Time Dynamic Camera Footprint Projection Engine**
  - **Goal**: Calculate and project the ground intersection trapezoid (FOV polygon) for drone cameras.
  - **Tech Stack**: `@turf/turf`, MapLibre GL JS, WebGL.
  - **Target Files**: `src/lib/fmv/footprint-calculator.ts`, `src/components/OsintMap.tsx`.
  - **Subtasks**:
    - [x] Implement `calculateCameraFootprint()` in `src/lib/fmv/footprint-calculator.ts` using altitude, sensor pitch, roll, heading, and horizontal FOV.
    - [x] Add a `fmv-footprint` GeoJSON source and semi-transparent fill layer to `OsintMap.tsx`.
    - [x] Bind real-time FOV coordinates to map render loop for smooth 60fps polygon motion.
  - **Acceptance Criteria**: Drone movement and camera gimbal rotation dynamically update a highlighted trapezoidal ground footprint on the map.

- [x] **1.4 Develop FMV Video Player HUD & Synchronized Map Footprint UI**
  - **Goal**: Create an integrated video HUD with crosshair telemetry overlay and synchronized map crosshairs.
  - **Tech Stack**: React 19, `hls.js`, Framer Motion, Lucide Icons.
  - **Target Files**: `src/components/FmvViewer.tsx`, `src/components/CameraViewer.tsx`.
  - **Subtasks**:
    - [x] Extend `CameraViewer.tsx` or build `FmvViewer.tsx` with overlay HUD elements (pitch, roll, altitude, speed, grid ref).
    - [x] Implement click-on-video to map ground lookup: clicking a pixel in the video HUD moves the map pointer to the corresponding ground coordinate.
    - [x] Add a toggle button for "Lock Map View to Camera Center".
  - **Acceptance Criteria**: Operators can view the live feed with telemetry HUD and see the camera crosshair tracked on the map in real-time.

---

### Phase 2: Drone Photogrammetry & 3D Reality Engine Integration

- [x] **2.1 Integrate NodeODM (OpenDroneMap) REST API Client**
  - **Goal**: Connect the platform to a self-hosted NodeODM photogrammetry processing service.
  - **Tech Stack**: NodeODM (OpenDroneMap), Node.js, `axios`/`fetch`.
  - **Target Files**: `src/lib/photogrammetry/nodeodm-client.ts`, `.env.example`.
  - **Subtasks**:
    - [x] Define `NODEODM_URL` and `NODEODM_TOKEN` environment variables in `.env.example`.
    - [x] Create `src/lib/photogrammetry/nodeodm-client.ts` with methods: `createTask()`, `getTaskStatus()`, `downloadAsset()`, `cancelTask()`.
    - [x] Add error handling and retry logic for long-running photogrammetry jobs (10+ min runtime).
  - **Acceptance Criteria**: Successful REST handshake with NodeODM `/info` endpoint confirming processing capacity.

- [x] **2.2 Implement Geotagged Image Upload & Job Queue Pipeline**
  - **Goal**: Allow users to drag-and-drop raw geotagged drone JPEG/TIFF image sets for background processing.
  - **Tech Stack**: Next.js App Router API, Multer/Formidable, Redis/BullMQ.
  - **Target Files**: `src/app/api/photogrammetry/upload/route.ts`, `src/app/api/photogrammetry/jobs/route.ts`.
  - **Subtasks**:
    - [x] Build `/api/photogrammetry/upload` endpoint accepting multi-file zip archive uploads.
    - [x] Parse EXIF GPS tags (`GPSLatitude`, `GPSLongitude`, `GPSAltitude`) to pre-validate bounding box coverage.
    - [x] Create background job status tracker in `src/lib/photogrammetry/job-store.ts`.
  - **Acceptance Criteria**: Uploading a 50-image drone survey triggers a processing job with progress percentages reported via polling API.

- [x] **2.3 Build Cloud-Optimized GeoTIFF (COG) & 3D Tiles Local Tile Server**
  - **Goal**: Host generated orthomosaics and 3D Tiles locally for MapLibre/Cesium rendering.
  - **Tech Stack**: `tippecanoe`, `gdal`, Node.js static server.
  - **Target Files**: `src/app/api/tiles/ortho/[jobId]/{z}/{x}/{y}/route.ts`, `src/app/api/tiles/3dtiles/[jobId]/route.ts`.
  - **Subtasks**:
    - [x] Build dynamic tile handler serving COG raster tiles to MapLibre raster sources.
    - [x] Build OGC 3D Tiles (`tileset.json` + `.b3dm`) static file handler for 3D textured mesh streaming.
  - **Acceptance Criteria**: Finished NodeODM job outputs high-resolution orthomosaic tiles rendered seamless over the basemap.

- [x] **2.4 Build Photogrammetry Management Panel in UI**
  - **Goal**: Provide UI controls to manage photogrammetry jobs, toggle orthomosaics, and inspect DSM layers.
  - **Tech Stack**: React 19, Lucide React, CSS Modules.
  - **Target Files**: `src/components/PhotogrammetryPanel.tsx`, `src/components/LayerPanel.tsx`.
  - **Subtasks**:
    - [x] Create `PhotogrammetryPanel.tsx` with tabs: "New Survey", "Active Jobs", "Completed Orthos".
    - [x] Add opacity sliders and blend mode selectors for overlaying orthomosaics on satellite imagery.
    - [x] Integrate survey boundary outlines on `OsintMap.tsx`.
  - **Acceptance Criteria**: Users can toggle custom orthomosaic layers on/off and adjust transparency over standard satellite basemaps.

---

### Phase 3: 3D Terrain Elevation & Dual Map Engine Upgrade

- [x] **3.1 Upgrade MapLibre GL JS to v3+ with Raster DEM Elevation**
  - **Goal**: Enable true 3D terrain elevation rendering across the global map.
  - **Tech Stack**: MapLibre GL JS v3+, AWS Terrarium / MapTiler Terrain RGB tiles.
  - **Target Files**: `package.json`, `src/components/OsintMap.tsx`.
  - **Subtasks**:
    - [x] Upgrade `maplibre-gl` dependency to `^5.0.0` or latest v3+ release.
    - [x] Configure `raster-dem` source pointing to open RGB terrain tiles (`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`).
    - [x] Add UI pitch/bearing controls and terrain exaggeration toggles (1.0x - 2.5x).
  - **Acceptance Criteria**: Tilting map pitch reveals physical mountain ranges, valleys, and terrain elevation contouring.

- [x] **3.2 Integrate CesiumJS Engine for Photogrammetry Meshes & Point Clouds**
  - **Goal**: Provide a dedicated 3D scene engine for dense point clouds (`.las`/`.laz`) and textured 3D meshes.
  - **Tech Stack**: CesiumJS, `resium` or custom React Cesium container.
  - **Target Files**: `src/components/CesiumScene.tsx`, `src/app/page.tsx`.
  - **Subtasks**:
    - [x] Create `src/components/CesiumScene.tsx` initialized with Cesium World Terrain and Ion/open tile sources.
    - [x] Add camera sync bridge: switching between 2D MapLibre and 3D Cesium maintains camera position and orientation.
    - [x] Add OGC 3D Tileset loader for NodeODM photogrammetry outputs.
  - **Acceptance Criteria**: Users can switch seamlessly between MapLibre 2D/3D map view and CesiumJS 3D mesh inspection view.

- [x] **3.3 Develop 3D Line-of-Sight & Viewshed Spatial Analytics Tooling**
  - **Goal**: Provide interactive line-of-sight analysis between drone sensor positions and ground targets.
  - **Tech Stack**: Turf.js, Cesium Analytics API / MapLibre QueryRenderedFeatures.
  - **Target Files**: `src/lib/analytics/viewshed.ts`, `src/components/ViewshedPanel.tsx`.
  - **Subtasks**:
    - [x] Create ray-casting viewshed utility in `src/lib/analytics/viewshed.ts` sampling terrain elevation along sightlines.
    - [x] Render green (visible) / red (obstructed) line-of-sight vectors between drone marker and clicked ground target.
    - [x] Calculate 360° viewshed coverage radius based on drone altitude and terrain obstacles.
  - **Acceptance Criteria**: Clicking any ground location draws a color-coded line showing whether line-of-sight is blocked by terrain hilltops or structures.

---

### Phase 4: High-Throughput Spatial Analytics, Geofencing & Telemetry Firehose

- [x] **4.1 Migrate Telemetry Storage to PostgreSQL + PostGIS Database**
  - **Goal**: Replace in-memory sensor store with a persistent, spatially-indexed PostGIS database.
  - **Tech Stack**: PostgreSQL 16, PostGIS 3.4, Prisma / Kysely ORM.
  - **Target Files**: `src/lib/db/schema.sql`, `src/lib/sensor-store.ts`, `docker-compose.yml`.
  - **Subtasks**:
    - [x] Add `postgres` service with PostGIS extensions to `docker-compose.yml`.
    - [x] Create relational schema: `sensors`, `telemetry_history`, `geofences`, `alerts`, `target_tracks`.
    - [x] Refactor `src/lib/sensor-store.ts` to execute spatial queries (`ST_SetSRID`, `ST_MakePoint`, `ST_DWithin`).
  - **Acceptance Criteria**: All drone telemetry updates are saved with spatial geometry indexes and sub-millisecond query performance.

- [x] **4.2 Build Redis Pub/Sub & WebSocket Live Telemetry Firehose**
  - **Goal**: Stream thousands of concurrent telemetry events to frontend clients with low latency.
  - **Tech Stack**: Redis Pub/Sub, Node `ws` / WebSockets, Next.js Custom Server or Edge WebSocket Handler.
  - **Target Files**: `src/lib/socket/server.ts`, `src/lib/socket/client.ts`, `src/app/api/sensors/stream/route.ts`.
  - **Subtasks**:
    - [x] Configure Redis client in `src/lib/redis.ts` for publish/subscribe channel management.
    - [x] Implement WebSocket server broadcasting `telemetry_update`, `geofence_alert`, and `cv_track` topics.
    - [x] Connect `OsintMap.tsx` data hooks to WebSocket stream with automatic reconnection logic.
  - **Acceptance Criteria**: Telemetry updates posted to `/api/sensors` are received by client browsers over WebSockets within 15ms.

- [x] **4.3 Build Server-Side Dynamic Geofencing & Airspace Violation Alerting Engine**
  - **Goal**: Automatically trigger warning alerts when drones enter restricted airspaces or deviate from flight plans.
  - **Tech Stack**: PostGIS (`ST_Contains`, `ST_Buffer`), Turf.js, WebPush / Toast Alerts.
  - **Target Files**: `src/lib/geofence/engine.ts`, `src/components/LiveAlerts.tsx`.
  - **Subtasks**:
    - [x] Implement geofence evaluation service in `src/lib/geofence/engine.ts`.
    - [x] Create UI geofence creator tool allowing operators to draw No-Fly Zones (NFZ) directly on the map.
    - [x] Publish high-priority warning alerts to `LiveAlerts.tsx` when a drone breaches a boundary.
  - **Acceptance Criteria**: Crossing a drawn No-Fly Zone polygon immediately triggers a red banner warning in the UI with sound alert.

---

### Phase 5: Edge Computer Vision (CV) Target Detection Microservice

- [ ] **5.1 Develop Python FastAPI + YOLOv8 / ONNX Inference Microservice**
  - **Goal**: Run automated vehicle, vessel, aircraft, and personnel detection on live drone video frames.
  - **Tech Stack**: Python 3.11, FastAPI, YOLOv8 (Ultralytics), ONNX Runtime, OpenCV.
  - **Target Files**: `services/cv-inference/main.py`, `services/cv-inference/Dockerfile`.
  - **Subtasks**:
    - [ ] Create standalone `services/cv-inference` directory with FastAPI server endpoints `/detect/frame` and `/detect/stream`.
    - [ ] Load pre-trained `yolov8n.pt` / `yolov8s-visdrone.pt` (VisDrone aerial dataset tuned model).
    - [ ] Add GPU/TensorRT detection pipeline returning bounding boxes `[x1, y1, x2, y2, confidence, class]`.
  - **Acceptance Criteria**: Inference microservice processes 30fps 1080p video frames with sub-20ms latency per frame.

- [ ] **5.2 Implement VMTI Target Geolocation & Map Layer Publishing**
  - **Goal**: Map pixel bounding boxes from aerial video onto georeferenced ground coordinates.
  - **Tech Stack**: Python, NumPy, MISB ST 0903, WebSockets.
  - **Target Files**: `services/cv-inference/geolocate.py`, `src/app/api/cv/tracks/route.ts`.
  - **Subtasks**:
    - [ ] Calculate ground target latitude/longitude by ray-casting pixel offsets through camera intrinsic matrix and MISB KLV pose data.
    - [ ] Assign persistent target track IDs using SORT / ByteTrack multi-object tracking algorithm.
    - [ ] Publish GeoJSON target tracks (`cv-targets` layer) over Redis Pub/Sub to the frontend.
  - **Acceptance Criteria**: Detected vehicles on video feed appear as labeled target markers moving synchronously on the map layer.

- [ ] **5.3 Integrate Bounding Box Overlays into Video HUD UI**
  - **Goal**: Render animated detection bounding boxes directly on top of the live video player component.
  - **Tech Stack**: HTML5 Canvas / SVG Overlay, React 19, Framer Motion.
  - **Target Files**: `src/components/CvBoundingBoxOverlay.tsx`, `src/components/FmvViewer.tsx`.
  - **Subtasks**:
    - [ ] Build canvas overlay `CvBoundingBoxOverlay.tsx` overlaid precisely on HTML5 video element.
    - [ ] Color-code bounding boxes by class: Red (Military/Target), Yellow (Vehicle), Cyan (Vessel), Green (Person).
    - [ ] Add confidence threshold slider (0% - 100%) in UI settings.
  - **Acceptance Criteria**: Video player displays real-time color-coded bounding boxes tracking moving objects with low jitter.

---

### Phase 6: Progressive Web App (PWA) & Disconnected Offline Field Mesh

- [ ] **6.1 Configure PWA Service Workers & Offline Tile Caching**
  - **Goal**: Allow field operators to load maps and core tools without internet access.
  - **Tech Stack**: `@ducanh2912/next-pwa`, Service Workers, Cache API.
  - **Target Files**: `next.config.ts`, `public/manifest.json`, `src/lib/pwa/sw.ts`.
  - **Subtasks**:
    - [ ] Install and configure Next.js PWA module in `next.config.ts`.
    - [ ] Build vector tile caching rule saving basemap z/x/y tiles within pre-selected operational areas.
    - [ ] Add PWA installation banner and offline status indicator in `GlobalStatusBar.tsx`.
  - **Acceptance Criteria**: Disconnecting network connectivity allows refreshing the application and rendering cached map regions seamlessly.

- [ ] **6.2 Build Local-First IndexedDB Store with RxDB / PouchDB**
  - **Goal**: Store field observations, telemetry logs, and survey reports locally on client devices.
  - **Tech Stack**: IndexedDB, RxDB / PouchDB, TypeScript.
  - **Target Files**: `src/lib/offline/db.ts`, `src/lib/offline/sync-engine.ts`.
  - **Subtasks**:
    - [ ] Create local IndexedDB database schema for offline telemetry and field notes.
    - [ ] Wrap API fetchers with local-first cache-then-network strategy.
    - [ ] Queue outgoing POST requests (`/api/sensors`, field observations) in local offline sync table.
  - **Acceptance Criteria**: Submitting a sensor update while offline saves it to IndexedDB without throwing network errors.

- [ ] **6.3 Build Bi-Directional Offline Sync Engine**
  - **Goal**: Automatically flush queued field data to the central server when network connection is restored.
  - **Tech Stack**: Network Information API, RxDB Sync Plugin, Node.js API handlers.
  - **Target Files**: `src/lib/offline/sync-engine.ts`, `src/components/GlobalStatusBar.tsx`.
  - **Subtasks**:
    - [ ] Monitor `window.addEventListener('online')` and `navigator.onLine` state changes.
    - [ ] Implement conflict resolution strategy (Last-Write-Wins / Vector Clocks) for synced telemetry entries.
    - [ ] Display offline queue sync progress indicator in `GlobalStatusBar.tsx` (e.g., "Syncing 14 queued reports...").
  - **Acceptance Criteria**: Reconnecting internet automatically pushes all queued offline observations to the server with zero data loss.

---

## Conclusion

By executing this detailed implementation plan, the **OSINT Platform** will systematically eliminate all capability gaps relative to the Esri ArcGIS ecosystem. The platform will evolve into a state-of-the-art, modular, self-hosted **Aerial Surveillance & Reconnaissance Engine**, delivering Full Motion Video (FMV) metadata projection, automated photogrammetry, 3D scene visualization, high-throughput spatial analytics, computer vision object tracking, and local-first offline operation.
