<script setup lang="ts">
  const { title, visibility } = defineProps({
    title: {
      type: String,
      required: true
    },
    visibility: {
      type: Boolean,
      required: true
    }
  });
</script>

<template>
  <Transition name="fade">
    <div v-if="visibility" class="overlay-menu">
      <div class="menu">
        <h2>{{ title }}</h2>
        <slot></slot>
      </div>
      <div class="background"></div>
    </div>
  </Transition>
</template>

<style lang="css" scoped>
  .overlay-menu {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    align-items: center;
    justify-content: center;
    background: transparent;
    z-index: 2;
  }
  .menu {
    display: flex;
    width: fit-content;
    height: fit-content;
    padding: 2rem;
    flex-direction: column;
    align-items: center;
    background-color: rgba(255,145,144, 0.1);
    backdrop-filter: blur(6px);
    border: 4px solid rgb(253, 192, 148);
    border-radius: 26px 0;
  }
  .menu h2 {
    width: 100%;
    height: fit-content;
    font-size: 56px;
    font-family: "Knewave", system-ui;
    font-weight: 400;
    font-style: normal;
    text-align: center;
    text-transform: capitalize;
    margin: 0;
    background-image: linear-gradient(rgb(255,145,144), rgb(253, 192, 148));
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    z-index: 1;
  }
  .background {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0,0,0, 0.5);
    backdrop-filter: blur(3px);
    z-index: 0;
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