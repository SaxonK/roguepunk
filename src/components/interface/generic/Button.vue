<script setup lang="ts">
  import { ButtonStates, MenuButtons } from '@/utils/types/types';
  import { PropType } from 'vue';

  const { action, states, type } = defineProps({
    action: {
      type: Function as PropType<(type: MenuButtons) => void>,
      required: true
    },
    states: {
      type: Object as PropType<ButtonStates>,
      required: true
    },
    type: {
      type: String as PropType<MenuButtons>,
      required: true
    }
  });

  const getButtonDisplayName = (button: MenuButtons): string => {
    return button.replace(/([a-z])([A-Z])/g, '$1 $2');
  };
  const handleClick = (button: MenuButtons): void => {
    action(button);
  };
</script>

<template>
  <button
    :id="type"
    :class="{ highlight: states.highlighted, inactive: !states.active }"
    @click="handleClick(type)"
  > {{ getButtonDisplayName(type) }} </button>
</template>

<style lang="css" scoped>
  button {
    font-family: "Knewave", system-ui;
    font-weight: 100;
    font-style: normal;
    font-size: 24px;
    text-transform: capitalize;
    color: #fffc;
    padding: 0.5rem 2rem;
    background: transparent;
      background-position-x: 0%;
      background-position-y: 0%;
      background-image: none;
      background-size: auto;
    background-image: none;
    border: none;
    cursor: pointer;
  }
  button.highlight {
    animation-delay: 180ms;
    animation-fill-mode: forwards;
    animation-iteration-count: 1;
    animation-name: menu-highlight-loop;
    background-image: url('@/assets/images/menu-highlight-enter.gif'), url('@/assets/images/menu-highlight-loop.gif');
    background-position: -18px -18px, 0px 230px;
    background-size: calc(100% + 2rem);
    color: #4e39c4;
  }
  button.inactive {
    color: rgba(255, 255, 255, 0.25);
    cursor: default;
  }
</style>