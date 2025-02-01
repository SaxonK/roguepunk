<script setup lang="ts">
  import { Action, allActions, keyBinds } from "@/utils/types/types";
  import { ref, onMounted } from 'vue';
  import Camera from "@/entities/camera/camera";
  import ControlsManager from "@/core/controls/controlsManager";
  import eventEmitter from "@/utils/events/initialiser";
  import FPSManager from "@/utils/FpsManager";
  import Game from "@/core/game";
  import keyboardMapping from "@/config/settings/controls/keyboard.json";
  import world from "@/world/initialiser";

  const viewport = ref<HTMLElement>();

  onMounted(() => {
    /* Initialise Controls Manager */
    const keyboard: keyBinds = keyboardMapping;
    const KeyBinds: keyBinds = {} as keyBinds;
    Object.keys(keyboard).forEach(key => {
      if(typeof keyboard[key as Action] === 'string' && allActions.includes(key as Action)) {
        KeyBinds[key as Action] = keyboard[key as Action]
      }
    });
    const controlsManager: ControlsManager = new ControlsManager(KeyBinds);

    /* Initialise Game */
    const camera: Camera = new Camera(0, 0, window.innerWidth, window.innerHeight);
    const fpsManager: FPSManager = new FPSManager(true, 60, window.performance.now());
    const game: Game = new Game(camera, controlsManager, fpsManager, world, eventEmitter);

    if(viewport.value) {
      game.initialiseCanvas(viewport.value);
    } else {
      console.error(`The ref 'viewport' has not been assigned to a HTMLElement in the template.`);
    };

    /* Initialise Event Listeners */
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      event.preventDefault();
      const keyPressed: string = event.key;
      const actionRepeatable = controlsManager.isRepeatableByKey(keyPressed);
      
      if(!event.repeat || event.repeat && actionRepeatable) {
        controlsManager.setActionStateTrue(keyPressed);
      } else {
        controlsManager.setActionStateFalse(keyPressed);
      };

      if(controlsManager.activeUserActions.includes('pause')) {
        eventEmitter.emit("gamePause", false);
      }
      if(!event.repeat) {
        if(controlsManager.activeUserActions.includes('moveUp')) eventEmitter.emit('menuUp', true);
        if(controlsManager.activeUserActions.includes('moveDown')) eventEmitter.emit('menuDown', true);
        if(controlsManager.activeUserActions.includes('select')) eventEmitter.emit('menuSelect', true);
      };
      if(controlsManager.activeUserActions.includes('debug')) {
        game.debugToggle();
      }
    });
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      event.preventDefault();
      const keyPressed: string = event.key;
      controlsManager.setActionStateFalse(keyPressed);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        eventEmitter.emit("gamePause", false);
      }
    });
    document.addEventListener('mousemove',(event: MouseEvent) => game.setMousePosition(event));
  });
</script>

<template>
  <div ref="viewport" id="viewport"></div>
</template>

<style lang="css" scoped>
  #viewport {
    position: relative;
    display: flex;
    width: 100%;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    z-index: 0;
  }
  #game-container {
    border: none;
    background-color: #000;
    cursor: url(../images/crosshair.png) 16 16, default;
    z-index: 1;
  }
</style>