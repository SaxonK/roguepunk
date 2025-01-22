<script setup lang="ts">
  import type { ElementSettings } from '@/utils/types/types';
  import type { PropType } from 'vue';
  import { useKeyStateStore } from '@/utils/stores/keyStates';
  import { storeToRefs } from 'pinia';
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import Basic from '@/components/hud/elements/Basic.vue';
  import Detailed from '@/components/hud/elements/Detailed.vue';
  import Progressbar from '@/components/hud/elements/Progressbar.vue';
  import Container from '@/components/hud/elements/Container.vue';

  const { settings } = defineProps({
    settings: {
      type: Object as PropType<ElementSettings>,
      required: true
    }
  });
  const keyStateStore = useKeyStateStore();
  const components = {
    Basic,
    Container,
    Detailed,
    Progressbar
  };

  const container = ref<HTMLElement | null>(null);
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
    if(settings.draggable && container.value) {
      container.value.addEventListener('dragstart', onDragStart);
    }
  });
  onBeforeUnmount(() => {
    if(container.value) {
      container.value.removeEventListener('dragstart', onDragStart);
    }
  });
</script>

<template>
  <div class="container" ref="container" :id="settings.name" :class="{ 'unlocked': unlocked }" :style="{ flexDirection: settings.direction === null ? 'unset' : settings.direction }" :draggable="unlocked">
    <component
      v-for="element in (settings.value as ElementSettings[])"
      :is="components[element.type]"
      :key="element.name"
      :settings="element"
    />
  </div>
</template>

<style lang="css" scoped>
  .container {
    display: flex;
    position: relative;
    width: fit-content;
    gap: 4px;
  }
  .container.hidden {
    visibility: hidden;
    opacity: 0;
  }
  .container.hidden.unlocked {
    visibility: visible;
    opacity: 0.25;
  }
  .container.unlocked {
    cursor: pointer;
  }
  .container.unlocked::before {
    content: "";
    position: absolute;
    display: block;
    top: -4px;
    left: -4px;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    border-radius: 0;
    border: 2px dotted rgba(255, 255, 0, 0.75);
  }
</style>