<script setup lang="ts">
  const { visibility } = defineProps({
    visibility: {
      type: Boolean,
      required: true
    }
  });
</script>

<template>
  <Transition name="fade">
    <div v-if="visibility" class="full-screen">
      <slot></slot>
    </div>
  </Transition>
</template>

<style lang="css">
  .full-screen {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100vh;
    background: transparent;
    z-index: 2;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>