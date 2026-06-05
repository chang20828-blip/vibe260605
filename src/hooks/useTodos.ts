import { useState, useEffect, useCallback } from 'react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tag: string;
  createdAt: string;
}

const STORAGE_KEY = 'seoul-todos';
const DATE_KEY = 'seoul-todos-date';

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const today = getTodayString();
    const savedDate = localStorage.getItem(DATE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (savedDate !== today) {
      localStorage.setItem(DATE_KEY, today);
      localStorage.removeItem(STORAGE_KEY);
    } else if (raw) {
      try {
        setTodos(JSON.parse(raw));
      } catch {
        // corrupt data — start fresh
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, isLoaded]);

  const addTodo = useCallback((text: string, tag: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    setTodos(prev => [
      ...prev,
      {
        id: generateId(),
        text: trimmed,
        completed: false,
        tag,
        createdAt: new Date().toISOString(),
      },
    ]);
    return true;
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo, isLoaded };
}
