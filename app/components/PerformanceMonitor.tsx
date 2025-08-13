import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { hp, scale, wp } from '../utils/responsive';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  frameRate: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showMetrics?: boolean;
}

export default function PerformanceMonitor({ enabled = false, showMetrics = false }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    frameRate: 60,
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const renderStartTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();

    const measureRenderTime = () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Measure frame rate
    const measureFrameRate = () => {
      frameCount.current++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const frameRate = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        setMetrics(prev => ({ ...prev, frameRate }));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      requestAnimationFrame(measureFrameRate);
    };

    // Start measuring
    const timeoutId = setTimeout(measureRenderTime, 0);
    const animationId = requestAnimationFrame(measureFrameRate);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  if (!enabled || !showMetrics) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.metric}>Render: {metrics.renderTime.toFixed(2)}ms</Text>
      <Text style={styles.metric}>FPS: {metrics.frameRate}</Text>
      {metrics.memoryUsage && (
        <Text style={styles.metric}>Memory: {metrics.memoryUsage.toFixed(1)}MB</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: hp(10),
    right: wp(5),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: scale(8),
    borderRadius: scale(4),
    zIndex: 1000,
  },
  metric: {
    color: '#fff',
    fontSize: scale(8),
    fontFamily: 'monospace',
    marginBottom: scale(2),
  },
});
