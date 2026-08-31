/**
 * MISB ST 0601 UAS Datalink Local Set & ST 0903 VMTI KLV Metadata Parser
 */

export interface MisbST0601Telemetry {
  timestamp?: number;             // Tag 2: Microseconds since UNIX epoch
  platformDesignator?: string;    // Tag 10
  sensorLatitude?: number;        // Tag 5: -90 to +90 degrees
  sensorLongitude?: number;       // Tag 6: -180 to +180 degrees
  sensorTrueAltitude?: number;    // Tag 7: meters (-900 to +19000)
  sensorPitch?: number;           // Tag 13: -20 to +20 degrees (or -90 to +90 in ST0601.8+)
  sensorRoll?: number;            // Tag 14: -50 to +50 degrees
  sensorYaw?: number;             // Tag 15: 0 to 360 degrees (relative azimuth / heading)
  horizontalFov?: number;         // Tag 16: 0 to 180 degrees
  verticalFov?: number;           // Tag 17: 0 to 180 degrees
  targetLatitude?: number;        // Tag 18: -90 to +90 degrees
  targetLongitude?: number;       // Tag 19: -180 to +180 degrees
  targetElevation?: number;       // Tag 20: meters
  slantRange?: number;            // Tag 21: meters (0 to 5,000,000)
  vmtiTargets?: VmtiTarget[];     // Tag 74: ST 0903 VMTI targets
  rawTags?: Record<number, Uint8Array>;
}

export interface VmtiTarget {
  targetId: number;
  centroidX: number; // Pixel X or normalized offset
  centroidY: number; // Pixel Y or normalized offset
  bboxWidth?: number;
  bboxHeight?: number;
  targetLat?: number;
  targetLng?: number;
  targetClass?: string;
  confidence?: number;
}

// ST 0601 Universal Key: 06 0E 2B 34 02 0B 01 01 0E 01 03 01 01 00 00 00
export const ST0601_UNIVERSAL_KEY = new Uint8Array([
  0x06, 0x0e, 0x2b, 0x34, 0x02, 0x0b, 0x01, 0x01,
  0x0e, 0x01, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00
]);

/**
 * Decode BER (Basic Encoding Rules) length bytes.
 */
export function decodeBerLength(buffer: Uint8Array, offset: number): { length: number; bytesRead: number } {
  if (offset >= buffer.length) return { length: 0, bytesRead: 0 };

  const initial = buffer[offset];
  if ((initial & 0x80) === 0) {
    // Short form (1 byte)
    return { length: initial, bytesRead: 1 };
  }

  // Long form
  const numBytes = initial & 0x7f;
  let length = 0;
  for (let i = 0; i < numBytes; i++) {
    if (offset + 1 + i >= buffer.length) break;
    length = (length << 8) | buffer[offset + 1 + i];
  }
  return { length, bytesRead: 1 + numBytes };
}

/**
 * Encodes a integer into BER short or long form.
 */
export function encodeBerLength(length: number): Uint8Array {
  if (length < 128) {
    return new Uint8Array([length]);
  }
  const bytes: number[] = [];
  let temp = length;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp >>= 8;
  }
  bytes.unshift(0x80 | bytes.length);
  return new Uint8Array(bytes);
}

/**
 * Map raw int value into floating point range
 */
function mapRange(value: number, minVal: number, maxVal: number, rawMin: number, rawMax: number): number {
  return minVal + ((value - rawMin) * (maxVal - minVal)) / (rawMax - rawMin);
}

/**
 * Parses raw Uint8Array Buffer containing KLV metadata packet.
 */
export function parseMisbST0601(buffer: Uint8Array): MisbST0601Telemetry {
  const result: MisbST0601Telemetry = { rawTags: {} };
  let offset = 0;

  // Check Universal Key if present
  let hasKey = true;
  if (buffer.length >= 16) {
    for (let i = 0; i < 16; i++) {
      if (buffer[i] !== ST0601_UNIVERSAL_KEY[i]) {
        hasKey = false;
        break;
      }
    }
  } else {
    hasKey = false;
  }

  if (hasKey) {
    offset += 16;
    const ber = decodeBerLength(buffer, offset);
    offset += ber.bytesRead;
  }

  // Parse local set tags
  while (offset < buffer.length) {
    const tag = buffer[offset++];
    if (offset >= buffer.length) break;

    const lenBer = decodeBerLength(buffer, offset);
    offset += lenBer.bytesRead;
    const len = lenBer.length;

    if (offset + len > buffer.length) break;
    const valueBytes = buffer.subarray(offset, offset + len);
    offset += len;

    result.rawTags![tag] = valueBytes;

    const dataView = new DataView(valueBytes.buffer, valueBytes.byteOffset, valueBytes.byteLength);

    switch (tag) {
      case 2: // Precision Timestamp (8 bytes uint64)
        if (len === 8) {
          const high = dataView.getUint32(0, false);
          const low = dataView.getUint32(4, false);
          result.timestamp = Math.floor((high * 4294967296 + low) / 1000); // Microseconds to milliseconds
        }
        break;

      case 5: // Sensor Latitude (4 bytes int32) -90 to +90
        if (len === 4) {
          const raw = dataView.getInt32(0, false);
          result.sensorLatitude = mapRange(raw, -90, 90, -2147483648, 2147483647);
        }
        break;

      case 6: // Sensor Longitude (4 bytes int32) -180 to +180
        if (len === 4) {
          const raw = dataView.getInt32(0, false);
          result.sensorLongitude = mapRange(raw, -180, 180, -2147483648, 2147483647);
        }
        break;

      case 7: // Sensor True Altitude (2 bytes uint16) -900 to +19000m
        if (len === 2) {
          const raw = dataView.getUint16(0, false);
          result.sensorTrueAltitude = mapRange(raw, -900, 19000, 0, 65535);
        }
        break;

      case 10: // Platform Designator (String)
        result.platformDesignator = new TextDecoder('utf-8').decode(valueBytes);
        break;

      case 13: // Sensor Pitch (2 bytes int16) -20 to +20 or -90 to +90
        if (len === 2) {
          const raw = dataView.getInt16(0, false);
          result.sensorPitch = mapRange(raw, -90, 90, -32768, 32767);
        }
        break;

      case 14: // Sensor Roll (2 bytes int16) -50 to +50
        if (len === 2) {
          const raw = dataView.getInt16(0, false);
          result.sensorRoll = mapRange(raw, -50, 50, -32768, 32767);
        }
        break;

      case 15: // Sensor Yaw / Azimuth (2 bytes uint16) 0 to 360 deg
        if (len === 2) {
          const raw = dataView.getUint16(0, false);
          result.sensorYaw = mapRange(raw, 0, 360, 0, 65535);
        }
        break;

      case 16: // Sensor Horizontal FOV (2 bytes uint16) 0 to 180 deg
        if (len === 2) {
          const raw = dataView.getUint16(0, false);
          result.horizontalFov = mapRange(raw, 0, 180, 0, 65535);
        }
        break;

      case 17: // Sensor Vertical FOV (2 bytes uint16) 0 to 180 deg
        if (len === 2) {
          const raw = dataView.getUint16(0, false);
          result.verticalFov = mapRange(raw, 0, 180, 0, 65535);
        }
        break;

      case 18: // Target Latitude (4 bytes int32)
        if (len === 4) {
          const raw = dataView.getInt32(0, false);
          result.targetLatitude = mapRange(raw, -90, 90, -2147483648, 2147483647);
        }
        break;

      case 19: // Target Longitude (4 bytes int32)
        if (len === 4) {
          const raw = dataView.getInt32(0, false);
          result.targetLongitude = mapRange(raw, -180, 180, -2147483648, 2147483647);
        }
        break;

      case 20: // Target Elevation (2 bytes uint16)
        if (len === 2) {
          const raw = dataView.getUint16(0, false);
          result.targetElevation = mapRange(raw, -900, 19000, 0, 65535);
        }
        break;

      case 21: // Slant Range (4 bytes uint32) 0 to 5,000,000 m
        if (len === 4) {
          const raw = dataView.getUint32(0, false);
          result.slantRange = mapRange(raw, 0, 5000000, 0, 4294967295);
        }
        break;
    }
  }

  return result;
}

/**
 * Encodes a JSON telemetry object back into a valid MISB ST 0601 Uint8Array packet.
 */
export function encodeMisbST0601(telemetry: MisbST0601Telemetry): Uint8Array {
  const valueBuffers: Uint8Array[] = [];

  const addTag = (tag: number, data: Uint8Array) => {
    const ber = encodeBerLength(data.length);
    const tagBuf = new Uint8Array(1 + ber.length + data.length);
    tagBuf[0] = tag;
    tagBuf.set(ber, 1);
    tagBuf.set(data, 1 + ber.length);
    valueBuffers.push(tagBuf);
  };

  if (telemetry.sensorLatitude !== undefined) {
    const raw = Math.round(mapRange(telemetry.sensorLatitude, -2147483648, 2147483647, -90, 90));
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setInt32(0, raw, false);
    addTag(5, buf);
  }

  if (telemetry.sensorLongitude !== undefined) {
    const raw = Math.round(mapRange(telemetry.sensorLongitude, -2147483648, 2147483647, -180, 180));
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setInt32(0, raw, false);
    addTag(6, buf);
  }

  if (telemetry.sensorTrueAltitude !== undefined) {
    const raw = Math.round(mapRange(telemetry.sensorTrueAltitude, 0, 65535, -900, 19000));
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setUint16(0, raw, false);
    addTag(7, buf);
  }

  if (telemetry.sensorPitch !== undefined) {
    const raw = Math.round(mapRange(telemetry.sensorPitch, -32768, 32767, -90, 90));
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setInt16(0, raw, false);
    addTag(13, buf);
  }

  if (telemetry.sensorRoll !== undefined) {
    const raw = Math.round(mapRange(telemetry.sensorRoll, -32768, 32767, -50, 50));
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setInt16(0, raw, false);
    addTag(14, buf);
  }

  if (telemetry.sensorYaw !== undefined) {
    const raw = Math.round(mapRange(telemetry.sensorYaw, 0, 65535, 0, 360));
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setUint16(0, raw, false);
    addTag(15, buf);
  }

  if (telemetry.horizontalFov !== undefined) {
    const raw = Math.round(mapRange(telemetry.horizontalFov, 0, 65535, 0, 180));
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setUint16(0, raw, false);
    addTag(16, buf);
  }

  // Concatenate local set
  let totalLen = 0;
  valueBuffers.forEach(b => totalLen += b.length);
  const localSetBuf = new Uint8Array(totalLen);
  let pos = 0;
  valueBuffers.forEach(b => {
    localSetBuf.set(b, pos);
    pos += b.length;
  });

  const berLen = encodeBerLength(localSetBuf.length);
  const packet = new Uint8Array(16 + berLen.length + localSetBuf.length);
  packet.set(ST0601_UNIVERSAL_KEY, 0);
  packet.set(berLen, 16);
  packet.set(localSetBuf, 16 + berLen.length);

  return packet;
}
