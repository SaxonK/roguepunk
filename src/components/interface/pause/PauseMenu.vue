<script setup lang="ts">
  import type { InterfaceTypes } from '@/utils/types/types';
  import OverlayMenu from '../generic/OverlayMenu.vue';
  import Actions from './Actions.vue';

  const { visibility } = defineProps({
    visibility: {
      type: Boolean,
      required: true
    }
  });
  const emit = defineEmits(['hide', 'quit']);
  const hide = (name: InterfaceTypes): void => {
    emit('hide', name);
  };
  const quit = (name: InterfaceTypes): void => {
    emit('quit', name);
  };
</script>
<template>
  <OverlayMenu title="Pause" :visibility="visibility">
    <Actions @resume="hide('pauseMenu')" @quit="quit('pauseMenu')" />
  </OverlayMenu>
</template>

<style lang="css" scoped>
  button {
    background-position: 0rem -0.5rem, 0rem -0.5rem;
  }
</style>