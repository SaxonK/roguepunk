import type { KeyStates } from '@/utils/types/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useKeyStateStore = defineStore('keyState', () => {
  let eventListenerMounted: boolean = false;
  const keyStates = ref<KeyStates>({
    'Alt': false
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!event.repeat) {
      keyStates.value[event.key] = true;
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    keyStates.value[event.key] = false;
  };
  const attachEventListener = () => {
    if (!eventListenerMounted) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      eventListenerMounted = true;
    }
  };
  const detachEventListener = () => {
    if (eventListenerMounted) {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      eventListenerMounted = false;
    }
  };

  return {
    keyStates,
    attachEventListener,
    detachEventListener,
  };
});