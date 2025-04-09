<script setup lang="ts">
  import FullscreenMenu from '@/components/interface/generic/FullscreenMenu.vue';
  import Menu from './Menu.vue';

  const { visibility } = defineProps({
    visibility: {
      type: Boolean,
      required: true
    }
  });
  const emit = defineEmits(['hide']);
</script>

<template>
  <FullscreenMenu :visibility="visibility">
    <Menu title="RoguePunk" @newGame="emit('hide', 'mainMenu');"></Menu>
    <video class="menu-background" autoplay muted loop><source src="/assets/videos/menu-background.mp4" type="video/mp4" /></video>
  </FullscreenMenu>
</template>

<style lang="css" scoped>
  .menu-background {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    object-fit: cover;
    z-index: 0;
  }
</style>