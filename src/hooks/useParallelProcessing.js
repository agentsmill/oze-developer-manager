import { useState, useEffect } from 'react';
import { useGameContext } from '../store/GameContext';
import { usePlayerContext } from '../store/PlayerContext';

/**
 * Hook do zarządzania równoległymi procesami w projektach
 * @returns {Object} - Obiekt z funkcjami i stanem do zarządzania równoległymi procesami
 */
const useParallelProcessing = () => {
  const { state: gameState, dispatch: gameDispatch } = useGameContext();
  const { state: playerState, dispatch: playerDispatch } = usePlayerContext();
  const [parallelTasks, setParallelTasks] = useState([]);

  // Pobieramy konfigurację równoległych procesów
  const { enabled, maxParallelTasks } = gameState.parallelProcessing;

  // Efekt do aktualizacji zadań równoległych
  useEffect(() => {
    if (enabled) {
      // Aktualizujemy listę zadań równoległych na podstawie projektów gracza
      const activeTasks = playerState.projects
        .filter(project => project.parallelTasks && project.parallelTasks.length > 0)
        .flatMap(project => project.parallelTasks.map(task => ({
          ...task,
          projectId: project.id,
          projectName: project.name
        })));
      
      setParallelTasks(activeTasks);
    }
  }, [playerState.projects, enabled]);

  /**
   * Funkcja do rozpoczęcia równoległego zadania w projekcie
   * @param {string} projectId - ID projektu
   * @param {string} taskType - Typ zadania (np. 'environmental_study', 'grid_analysis', 'community_consultation')
   * @param {number} duration - Czas trwania zadania w turach
   * @param {number} cost - Koszt zadania
   * @param {function} onComplete - Funkcja wywoływana po zakończeniu zadania
   * @returns {boolean} - Czy udało się rozpocząć zadanie
   */
  const startParallelTask = (projectId, taskType, duration, cost, onComplete) => {
    // Sprawdzamy czy równoległe procesy są włączone
    if (!enabled) return false;
    
    // Sprawdzamy czy gracz ma wystarczająco środków
    if (playerState.cash < cost) return false;
    
    // Sprawdzamy czy nie przekroczono limitu równoległych zadań dla projektu
    const projectTasks = parallelTasks.filter(task => task.projectId === projectId);
    if (projectTasks.length >= 2) return false; // Maksymalnie 2 równoległe zadania na projekt
    
    // Sprawdzamy czy nie przekroczono globalnego limitu równoległych zadań
    if (parallelTasks.length >= maxParallelTasks) return false;
    
    // Tworzymy nowe zadanie
    const newTask = {
      id: `task-${Date.now()}`,
      projectId,
      type: taskType,
      startTurn: gameState.turn,
      duration,
      progress: 0,
      cost,
      completed: false,
      onComplete
    };
    
    // Dodajemy zadanie do projektu
    playerDispatch({
      type: 'ADD_PROJECT_PARALLEL_TASK',
      payload: {
        projectId,
        task: newTask
      }
    });
    
    // Pobieramy koszt zadania
    playerDispatch({
      type: 'UPDATE_CASH',
      payload: -cost
    });
    
    return true;
  };

  /**
   * Funkcja do aktualizacji postępu równoległych zadań
   * Wywoływana co turę
   */
  const updateParallelTasks = () => {
    if (!enabled || parallelTasks.length === 0) return;
    
    // Aktualizujemy wszystkie aktywne zadania
    playerState.projects.forEach(project => {
      if (!project.parallelTasks || project.parallelTasks.length === 0) return;
      
      const updatedTasks = project.parallelTasks.map(task => {
        // Jeśli zadanie jest już zakończone, nie aktualizujemy go
        if (task.completed) return task;
        
        // Obliczamy nowy postęp
        const progressIncrement = 100 / task.duration;
        const newProgress = Math.min(100, task.progress + progressIncrement);
        const isCompleted = newProgress >= 100;
        
        // Jeśli zadanie zostało zakończone, wywołujemy callback
        if (isCompleted && task.onComplete) {
          task.onComplete(project.id);
        }
        
        return {
          ...task,
          progress: newProgress,
          completed: isCompleted
        };
      });
      
      // Aktualizujemy zadania w projekcie
      playerDispatch({
        type: 'UPDATE_PROJECT_PARALLEL_TASKS',
        payload: {
          projectId: project.id,
          tasks: updatedTasks
        }
      });
    });
  };

  /**
   * Funkcja do anulowania równoległego zadania
   * @param {string} projectId - ID projektu
   * @param {string} taskId - ID zadania
   * @returns {boolean} - Czy udało się anulować zadanie
   */
  const cancelParallelTask = (projectId, taskId) => {
    const project = playerState.projects.find(p => p.id === projectId);
    if (!project || !project.parallelTasks) return false;
    
    const task = project.parallelTasks.find(t => t.id === taskId);
    if (!task) return false;
    
    // Zwracamy część kosztów (50%)
    const refundAmount = Math.floor(task.cost * 0.5);
    playerDispatch({
      type: 'UPDATE_CASH',
      payload: refundAmount
    });
    
    // Usuwamy zadanie z projektu
    playerDispatch({
      type: 'REMOVE_PROJECT_PARALLEL_TASK',
      payload: {
        projectId,
        taskId
      }
    });
    
    return true;
  };

  /**
   * Funkcja do włączania/wyłączania równoległych procesów
   * @param {boolean} value - Czy równoległe procesy mają być włączone
   */
  const toggleParallelProcessing = (value) => {
    gameDispatch({
      type: 'SET_PARALLEL_PROCESSING',
      payload: {
        enabled: value
      }
    });
  };

  /**
   * Funkcja do ustawiania maksymalnej liczby równoległych zadań
   * @param {number} value - Maksymalna liczba równoległych zadań
   */
  const setMaxParallelTasks = (value) => {
    gameDispatch({
      type: 'SET_PARALLEL_PROCESSING',
      payload: {
        maxParallelTasks: value
      }
    });
  };

  return {
    parallelTasks,
    enabled,
    maxParallelTasks,
    startParallelTask,
    updateParallelTasks,
    cancelParallelTask,
    toggleParallelProcessing,
    setMaxParallelTasks
  };
};

export default useParallelProcessing; 