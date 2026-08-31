# ArcGIS Feature Gap Analysis & Open-Source Modernization Roadmap

## Focus: Aerial Surveillance & Drone Operations

---

## Executive Summary

This report delivers a technical feature gap analysis comparing the **OSINT Platform** with the **Esri ArcGIS Ecosystem** (ArcGIS Online, ArcGIS Pro, ArcGIS Image Analyst, ArcGIS Velocity, Site Scan for ArcGIS, and ArcGIS Field Maps), specifically through the lens of **aerial surveillance, drone operations, and Full Motion Video (FMV) intelligence**.

While the current Next.js/MapLibre OSINT Platform offers lightweight WebGL-rendered entity tracking, live sensor status monitoring (`/api/sensors`), and multi-layer OSINT overlays, it lacks native photogrammetry processing, MISB-compliant telemetry decoding, 3D mesh streaming, server-side spatial analytics, and computer vision object tracking.

This document outlines these critical feature gaps and provides an **actionable, open-source architectural roadmap** to modernize the platform into an enterprise-grade, self-hosted aerial reconnaissance grid.

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

## Conclusion

By implementing this open-source modernization roadmap, the **OSINT Platform** will transition from a lightweight situational dashboard into a comprehensive, enterprise-ready **Aerial Reconnaissance & Drone Operations Grid**. This upgrade bridges all major gaps identified in the Esri ArcGIS ecosystem—including Full Motion Video (FMV) KLV processing, photogrammetry, 3D terrain streaming, server-side spatial analytics, and edge AI tracking—while maintaining a self-hosted, modular, and cost-effective footprint.
