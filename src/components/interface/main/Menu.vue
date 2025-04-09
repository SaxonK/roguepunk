<script setup lang="ts">
  import type { ButtonStates, MainMenuButtons, MainMenuStates } from '@/utils/types/types';
  import { mainMenuButtons } from '@/utils/types/types';
  import { reactive, ref } from 'vue';
  import Button from '@/components/interface/generic/Button.vue';
  import eventEmitter from '@/utils/events/initialiser';

  const { title } = defineProps({
    title: {
      type: String,
      required: true
    }
  });

  const buttons = reactive<Record<MainMenuButtons, InstanceType<typeof Button> | null>>({
    "newGame": null,
    "loadGame": null,
    "settings": null
  });
  const emit = defineEmits(['loadGame', 'newGame', 'settings']);
  const gameEmitter = eventEmitter;
  const states = ref<MainMenuStates>({
    buttons: {
      "loadGame": {
        active: false,
        highlighted: false,
        displayOrder: 1
      },
      "newGame": {
        active: true,
        highlighted: true,
        displayOrder: 2
      },
      "settings": {
        active: true,
        highlighted: false,
        displayOrder: 3
      }
    }
  });

  const getActiveButtonStates = (): [MainMenuButtons, ButtonStates][] => {
    return Object.entries(states.value.buttons).filter(([_name, state]) => state.active)  as [MainMenuButtons, ButtonStates][];
  };
  const getHightlightedButton = (): MainMenuButtons | undefined => {
    return Object.keys(states.value.buttons).find(
      (key) => states.value.buttons[key as MainMenuButtons].active && states.value.buttons[key as MainMenuButtons].highlighted
    ) as MainMenuButtons | undefined;
  };
  const getMinActiveButtonDisplayOrder = (): number => {
    const activeButtons = getActiveButtonStates();
    return Math.min(...activeButtons.map(([_name, state]) => state.displayOrder));
  };
  const getMaxActiveButtonDisplayOrder = (): number => {
    const activeButtons = getActiveButtonStates();
    return Math.max(...activeButtons.map(([_name, state]) => state.displayOrder));
  };

  const select = (): void => {
    const highlightedButton = getHightlightedButton();
    if(highlightedButton) {
      buttons[highlightedButton]?.$el.click();
    } else {
      console.error(`Error retrieving highlighted button in select function`);
    };  
  };

  const loadGame = (): void => {
    emit('loadGame');
    console.log('Emit: loadGame');
  };
  const newGame = (): void => {
    emit('newGame');
  };
  const settings = (): void => {
    emit('settings');
    console.log('Emit: settings');
  };
  
  const highlightHoveredButton = (button: MainMenuButtons): void => {
    const hoveredButton = states.value.buttons[button];
    if(hoveredButton.active) {
      const highlightedButton = getHightlightedButton();
      states.value.buttons[highlightedButton as MainMenuButtons].highlighted = false;
      hoveredButton.highlighted = true;
    }
  };
  const moveDown = (): void => {
    const highlightedButton = getHightlightedButton();
    if(highlightedButton) {
      const highlightedButtonState = states.value.buttons[highlightedButton];
      const nextButtonDisplayOrder = highlightedButtonState.displayOrder === getMaxActiveButtonDisplayOrder() ? getMinActiveButtonDisplayOrder() : highlightedButtonState.displayOrder + 1;
      const nextButton = Object.entries(states.value.buttons).find(([_name, state]) => state.displayOrder === nextButtonDisplayOrder);
      
      highlightedButtonState.highlighted = false;
      if(nextButton !== undefined) nextButton[1].highlighted = true;
    } else {
      console.error(`Error retrieving highlighted button in moveDown function`);
    }; 
  };
  const moveUp = (): void => {
    const highlightedButton = getHightlightedButton();
    if(highlightedButton) {
      const highlightedButtonState = states.value.buttons[highlightedButton];
      const nextButtonDisplayOrder = highlightedButtonState.displayOrder === getMinActiveButtonDisplayOrder() ? getMaxActiveButtonDisplayOrder() : highlightedButtonState.displayOrder - 1;
      const nextButton = Object.entries(states.value.buttons).find(([_name, state]) => state.displayOrder === nextButtonDisplayOrder);
      
      highlightedButtonState.highlighted = false;
      if(nextButton !== undefined) nextButton[1].highlighted = true;
    } else {
      console.error(`Error retrieving highlighted button in moveUp function`);
    }; 
  };

  const methods = { loadGame, newGame, settings };

  gameEmitter.on('menuUp', (_data) => moveUp());
  gameEmitter.on('menuDown', (_data) => moveDown());
  gameEmitter.on('menuSelect', (_data) => select());
</script>

<template>
  <div class="menu-items">
    <h1>{{ title }}</h1>
    <div class="actions">
      <Button 
        v-for="(button, index) in mainMenuButtons"
        :ref="el => (buttons[button as MainMenuButtons] = el as InstanceType<typeof Button>)"
        :key="index"
        :id="button"
        :action="methods[button]"
        :states="states.buttons[button]"
        :type="button"
        @mouseenter="highlightHoveredButton(button)"
      />
    </div>
    <div class="background"></div>
  </div>
</template>

<style lang="css" scoped>
  .menu-items {
    position: relative;
    display: flex;
    width: 350px;
    flex-direction: column;
    align-items: center;
    padding-top: 10%;
    margin-left: 5%;
    background-color: rgba(0,0,0, 0.2);
    backdrop-filter: blur(25px);
    z-index: 1;
  }
  h1 {
    font-size: 86px;
    font-family: "Knewave", system-ui;
    font-weight: 400;
    font-style: normal;
    background-image: linear-gradient(rgb(255,145,144), rgb(253, 192, 148));
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    z-index: 1;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 1;
  }
  .actions button#pause {
    display: none;
  }
  .actions button#start {
    display: block;
  }
</style>