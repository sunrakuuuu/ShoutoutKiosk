'use client';
import { useState, useEffect, useCallback } from 'react';
import { Shoutout } from '@/lib/types';
import { useToast } from './use-toast';

const SHOUTOUTS_KEY = 'ccs-valentine-shoutouts';
const TTL = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

export function useShoutouts() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  const getShoutoutsFromStorage = useCallback((): Shoutout[] => {
    try {
      if (typeof window === 'undefined') return [];
      const item = window.localStorage.getItem(SHOUTOUTS_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Failed to parse shoutouts from localStorage', error);
      return [];
    }
  }, []);

  const saveShoutoutsToStorage = useCallback((shoutoutsToSave: Shoutout[]) => {
    try {
      window.localStorage.setItem(SHOUTOUTS_KEY, JSON.stringify(shoutoutsToSave));
    } catch (error) {
      console.error('Failed to save shoutouts to localStorage', error);
    }
  }, []);
  
  useEffect(() => {
    // Initial load from storage
    const allShoutouts = getShoutoutsFromStorage();
    const now = Date.now();
    const validShoutouts = allShoutouts.filter(s => (now - s.createdAt) < TTL);
    setShoutouts(validShoutouts);
    setInitialized(true);
    
    if(validShoutouts.length < allShoutouts.length){
        saveShoutoutsToStorage(validShoutouts);
    }

    // Listener for other tabs
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === SHOUTOUTS_KEY) {
            setShoutouts(getShoutoutsFromStorage());
        }
    };
    window.addEventListener('storage', handleStorageChange);

    // Periodic purge
    const purgeExpiredShoutouts = () => {
        const currentShoutouts = getShoutoutsFromStorage();
        const now = Date.now();
        const validShoutouts = currentShoutouts.filter(s => (now - s.createdAt) < TTL);
        
        if (validShoutouts.length < currentShoutouts.length) {
          saveShoutoutsToStorage(validShoutouts);
          setShoutouts(validShoutouts); // Update current tab's state
          toast({
            title: "Feed Cleaned",
            description: "Some old shoutouts have been cleared.",
          });
        }
    };
    const intervalId = setInterval(purgeExpiredShoutouts, 60 * 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [getShoutoutsFromStorage, saveShoutoutsToStorage, toast]);
  
  const addShoutout = useCallback((newShoutoutData: Omit<Shoutout, 'id' | 'createdAt'>) => {
    const newShoutout: Shoutout = {
      ...newShoutoutData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    const currentShoutouts = getShoutoutsFromStorage();
    const updatedShoutouts = [newShoutout, ...currentShoutouts];
    saveShoutoutsToStorage(updatedShoutouts);
    setShoutouts(updatedShoutouts); // Update state for current tab immediately
  }, [getShoutoutsFromStorage, saveShoutoutsToStorage]);

  const deleteShoutout = useCallback((shoutoutId: string) => {
    const currentShoutouts = getShoutoutsFromStorage();
    const updatedShoutouts = currentShoutouts.filter(s => s.id !== shoutoutId);
    saveShoutoutsToStorage(updatedShoutouts);
    setShoutouts(updatedShoutouts); // Update state for current tab immediately
     toast({
        title: "Shoutout Deleted",
        description: "The shoutout has been removed.",
      });
  }, [getShoutoutsFromStorage, saveShoutoutsToStorage, toast]);

  return { shoutouts, addShoutout, deleteShoutout, initialized };
}
