<script setup lang="ts">
  import type { InterfaceStates, InterfaceTypes } from '@/utils/types/types';
  import { ref } from 'vue';
  import eventEmitter from '@/utils/events/initialiser';
  import LevelUp from './game/LevelUp.vue';
  import MainMenu from './main/MainMenu.vue';
  import PauseMenu from './pause/PauseMenu.vue';

  const states = ref<InterfaceStates>({
    mainMenu: true,
    pauseMenu: false,
    levelUp: false
  });
  
  const gameEmitter = eventEmitter;
  gameEmitter.on('gamePause', (_data) => {
    if(states.value.mainMenu || states.value.levelUp) return;
    states.value.pauseMenu = true;
  });
  gameEmitter.on('levelChanged', (_data) => {
    states.value.levelUp = true;
  });

  const hide = (interfaceName: InterfaceTypes): void => {
    if(!states.value[interfaceName]) return;

    states.value[interfaceName] = false;
    eventEmitter.emit('gameStart', true);
  };
  const quit = (interfaceName: InterfaceTypes): void => {
    states.value[interfaceName] = false;
    states.value.mainMenu = true;
    eventEmitter.emit('gameExit', true);
  };
</script>

<template>
  <div :class="{ active: Object.values(states).includes(true) }" id="interfaces">
    <MainMenu :visibility="states.mainMenu" @hide="hide" />
    <PauseMenu :visibility="states.pauseMenu" @hide="hide" @quit="quit" />
    <LevelUp :visibility="states.levelUp" @hide="hide" />
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