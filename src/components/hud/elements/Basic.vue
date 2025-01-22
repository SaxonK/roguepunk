<script setup lang="ts">
  import type { ElementSettings } from '@/utils/types/types';
  import type { PropType } from 'vue';
  import { useKeyStateStore } from '@/utils/stores/keyStates';
  import { storeToRefs } from 'pinia';
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

  const { settings } = defineProps({
    settings: {
      type: Object as PropType<ElementSettings>,
      required: true
    }
  });
  const keyStateStore = useKeyStateStore();

  const basic = ref<HTMLElement | null>(null);
  const { keyStates } = storeToRefs(keyStateStore);
  const unlocked = computed(() => {
    return keyStates.value['Alt'] && settings.draggable ? true : false;
  });

  const onDragStart = (event: DragEvent): void => {
    if(event.target instanceof HTMLElement) {
      event.dataTransfer?.setData('text/plain', event.target.id);
    }
  };
  onMounted(() => {
    if(settings.draggable && basic.value) {
      basic.value.addEventListener('dragstart', onDragStart);
    }
  });
  onBeforeUnmount(() => {
    if(basic.value) {
      basic.value.removeEventListener('dragstart', onDragStart);
    }
  });
</script>

<template>
  <div class="element basic" ref="basic" :id="settings.name" :class="{ 'unlocked': unlocked }" :draggable="unlocked">
    <div class="element-wrapper">
      <span class="value">{{ settings.value }}</span>
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
    transition: all 300ms ease-in-out;
    z-index: 3;
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
</style>