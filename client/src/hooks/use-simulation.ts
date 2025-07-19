import { useState, useEffect, useCallback } from 'react';
import { SoulScriptParser, ComponentDeclaration } from '@/lib/soulscript-parser';
import { SoulScriptInterpreter, SimulationLog } from '@/lib/soulscript-interpreter';

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  
  const [parser] = useState(() => new SoulScriptParser());
  const [interpreter] = useState(() => new SoulScriptInterpreter());

  // Simulation loop
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setSimulationTime(prev => prev + 0.016); // 60 FPS
      
      // Update all components
      interpreter.updateAllComponents();
      
      // Update logs
      setLogs(interpreter.getLogs());
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [isRunning, isPaused, interpreter]);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    
    if (simulationTime === 0) {
      interpreter.clearLogs();
      setLogs([]);
    }
  }, [simulationTime, interpreter]);

  const pauseSimulation = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setSimulationTime(0);
    interpreter.reset();
    setLogs([]);
  }, [interpreter]);

  const executeCode = useCallback((code: string) => {
    try {
      const components = parser.parse(code);
      
      components.forEach((component, index) => {
        const instanceName = `${component.name}_${String(index + 1).padStart(3, '0')}`;
        interpreter.createComponent(component, instanceName);
      });
      
      setLogs(interpreter.getLogs());
    } catch (error) {
      console.error('Parse error:', error);
      // Add error to logs
      interpreter.getLogs().push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Parse error: ${error}`
      });
      setLogs(interpreter.getLogs());
    }
  }, [parser, interpreter]);

  return {
    isRunning,
    isPaused,
    simulationTime,
    logs,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    executeCode,
    interpreter
  };
}
