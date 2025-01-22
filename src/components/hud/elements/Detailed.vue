<script setup lang="ts">
  import type { ElementSettings } from '@/utils/types/types';
  import type { PropType } from 'vue';
  import { useKeyStateStore } from '@/utils/stores/keyStates';
  import { storeToRefs } from 'pinia';
  import { computed, onBeforeUnmount, onMounted, ref, toRefs } from 'vue';

  const { settings } = defineProps({
    settings: {
      type: Object as PropType<ElementSettings>,
      required: true
    }
  });
  const keyStateStore = useKeyStateStore();
  const detailed = ref<HTMLElement | null>(null);
  const { keyStates } = storeToRefs(keyStateStore);
  const { value, maxValue } = toRefs(settings);

  const unlocked = computed(() => {
    return keyStates.value['Alt'] && settings.draggable ? true : false;
  });

  const progress = computed(() => {
    const max = maxValue.value ?? 1;
    if(typeof value.value === 'number') return (value.value / max) * 100;
    return 0;
  });

  const onDragStart = (event: DragEvent): void => {
    if(event.target instanceof HTMLElement) {
      event.dataTransfer?.setData('text/plain', event.target.id);
    }
  };
  onMounted(() => {
    if(settings.draggable && detailed.value) {
      detailed.value.addEventListener('dragstart', onDragStart);
    }
  });
  onBeforeUnmount(() => {
    if(detailed.value) {
      detailed.value.removeEventListener('dragstart', onDragStart);
    }
  });
</script>

<template>
  <div class="element detailed" ref="detailed" :id="settings.name" :class="{ 'unlocked': unlocked }" :draggable="unlocked">
    <div class="element-wrapper">
      <span class="label name">{{ settings.name }}:</span>
      <div class="value">{{ value }}</div>
      <div class="divider">/</div>
      <div class="max-value">{{ maxValue }}</div>
      <div class="value-change">{{ 0 }}</div>
      <div class="background-progress" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<style lang="css" scoped>
  .element {
    position: relative;
    border-radius: 6px;
    font-size: 12px;
    font-family: "Knewave", system-ui;
    font-weight: 100;
    font-style: normal;
    -webkit-user-select: none;  
    -moz-user-select: none;    
    -ms-user-select: none;      
    user-select: none;
    z-index: 1;
  }
  .element.hidden {
    visibility: hidden;
    opacity: 0;
  }
  .element.hidden.unlocked {
    visibility: visible;
    opacity: 0.25;
  }
  .element.unlocked {
    cursor: pointer;
  }
  .element.unlocked::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    width: 100%;
    height: 100%;
    padding: 2px;
    border-radius: 0;
    border: 2px dotted rgba(255, 255, 0, 0.75); 
  }
  .element .element-wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    overflow: hidden;
  }
  .element .element-wrapper * {
    z-index: 1;
  }
  .background-progress {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    transition: all 600ms ease-out;
    z-index: 0;
  }
  .value-change {
    visibility: hidden;
    opacity: 0;
    transition: all 600ms ease-out;
  }
  .value-change.visible {
    visibility: visible;
    opacity: 1;
  }
</style>