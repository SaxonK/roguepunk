<script setup lang="ts">
  import type { ButtonStates, PauseMenuButtons, PauseMenuStates } from '@/utils/types/types';
  import { pauseMenuButtons } from '@/utils/types/types';
  import { reactive, ref } from 'vue';
  import Button from '@/components/interface/generic/Button.vue';
  import eventEmitter from '@/utils/events/initialiser';

  const buttons = reactive<Record<PauseMenuButtons, InstanceType<typeof Button> | null>>({
    "resume": null,
    "settings": null,
    "quit": null
  });
  const emit = defineEmits(['resume', 'settings', 'quit']);
  const gameEmitter = eventEmitter;
  const states = ref<PauseMenuStates>({
    buttons: {
      "resume": {
        active: true,
        highlighted: true,
        displayOrder: 1
      },
      "settings": {
        active: true,
        highlighted: false,
        displayOrder: 2
      },
      "quit": {
        active: true,
        highlighted: false,
        displayOrder: 3
      }
    }
  });
  
  const getActiveButtonStates = (): [PauseMenuButtons, ButtonStates][] => {
    return Object.entries(states.value.buttons).filter(([_name, state]) => state.active)  as [PauseMenuButtons, ButtonStates][];
  };
  const getHightlightedButton = (): PauseMenuButtons | undefined => {
    return Object.keys(states.value.buttons).find(
      (key) => states.value.buttons[key as PauseMenuButtons].active && states.value.buttons[key as PauseMenuButtons].highlighted
    ) as PauseMenuButtons | undefined;
  };
  const getMinActiveButtonDisplayOrder = (): number => {
    const activeButtons = getActiveButtonStates();
    return Math.min(...activeButtons.map(([_name, state]) => state.displayOrder));
  };
  const getMaxActiveButtonDisplayOrder = (): number => {
    const activeButtons = getActiveButtonStates();
    return Math.max(...activeButtons.map(([_name, state]) => state.displayOrder));
  };
  const highlightHoveredButton = (button: PauseMenuButtons): void => {
    const hoveredButton = states.value.buttons[button];
    if(hoveredButton.active) {
      const highlightedButton = getHightlightedButton();
      states.value.buttons[highlightedButton as PauseMenuButtons].highlighted = false;
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
  const select = (): void => {
    const highlightedButton = getHightlightedButton();
    if(highlightedButton) {
      buttons[highlightedButton]?.$el.click();
    } else {
      console.error(`Error retrieving highlighted button in select function`);
    };  
  };

  const resume = (): void => {
    emit('resume');
    eventEmitter.emit('gameStart', true);
  };
  const settings = (): void => {
    emit('settings');
  };
  const quit = (): void => {
    emit('quit');
    eventEmitter.emit('gameExit', true);
  };

  const methods = { resume, settings, quit };

  gameEmitter.on('menuUp', (_data) => moveUp());
  gameEmitter.on('menuDown', (_data) => moveDown());
  gameEmitter.on('menuSelect', (_data) => select());
</script>

<template>
  <div class="pause-actions">
    <Button 
      v-for="(button, index) in pauseMenuButtons"
      :ref="el => (buttons[button as PauseMenuButtons] = el as InstanceType<typeof Button>)"
      :key="index"
      :id="button"
      :action="methods[button]"
      :states="states.buttons[button]"
      :type="button"
      @mouseenter="highlightHoveredButton(button)"
    />
  </div>
</template>

<style lang="css" scoped>
  .pause-actions {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    gap: 1rem;
  }
</style>