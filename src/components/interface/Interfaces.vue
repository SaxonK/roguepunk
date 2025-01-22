<script setup lang="ts">
  import type { InterfaceStates, InterfaceTypes } from '@/utils/types/types';
  import { ref } from 'vue';
  import eventEmitter from '@/utils/events/initialiser';
  import MainMenu from './main/MainMenu.vue';
  import PauseMenu from './pause/PauseMenu.vue';

  const states = ref<InterfaceStates>({
    mainMenu: true,
    pauseMenu: false
  });
  
  const gameEmitter = eventEmitter;
  gameEmitter.on('gamePause', (_Data) => {
    states.value.pauseMenu = true;
  });

  const hide = (interfaceName: InterfaceTypes): void => {
    states.value[interfaceName] = false;
  };
  const quit = (interfaceName: InterfaceTypes): void => {
    states.value[interfaceName] = false;
    states.value.mainMenu = true;
  };
</script>

<template>
  <div :class="{ active: Object.values(states).includes(true) }" id="interfaces">
    <MainMenu title="Roguepunk" :visibility="states.mainMenu" @hide="hide" />
    <PauseMenu title="Paused" :visibility="states.pauseMenu" @hide="hide" @quit="quit" />
  </div>
</template>

<style lang="css" scoped>
  #interfaces {
    position: absolute;
    display: block;
    width: 100%;
    height: 100vh;
    background: transparent;
    transition: all 300ms ease-in-out;
    z-index: -1;
  }
  #interfaces.active {
    z-index: 2;
  }
</style>