import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sensorStore, updateSensor, getSensors, cleanupSensors } from '../sensor-store';
import { LiveSensor } from '@/app/api/sensors/types';

describe('sensor-store', () => {
  beforeEach(() => {
    sensorStore.clear();
  });

  const mockSensor: LiveSensor = {
    id: 'test-drone',
    name: 'Test Drone',
    type: 'drone',
    status: 'active',
    telemetry: { lat: 50, lng: 0 },
    source: 'test',
    last_seen: new Date().toISOString()
  };

  it('should store and retrieve sensors', () => {
    updateSensor(mockSensor);
    const sensors = getSensors();
    expect(sensors).toHaveLength(1);
    expect(sensors[0].id).toBe('test-drone');
  });

  it('should update existing sensors', () => {
    updateSensor(mockSensor);
    const updated = { ...mockSensor, name: 'Updated Name' };
    updateSensor(updated);
    expect(getSensors()[0].name).toBe('Updated Name');
  });

  it('should cleanup stale sensors', () => {
    // Note: updateSensor automatically overwrites last_seen with now.
    // To test cleanup, we must bypass updateSensor or change the logic.
    // For testing, let's manually set the value in the store.
    const staleId = 'stale';
    sensorStore.set(staleId, {
      ...mockSensor,
      id: staleId,
      last_seen: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    });

    updateSensor(mockSensor);

    expect(getSensors()).toHaveLength(2);

    cleanupSensors();
    const active = getSensors();
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('test-drone');
  });
});
