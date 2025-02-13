<script setup lang="ts">
  import type { PropType } from 'vue';
  import type { AnchorPoints, ElementSettings } from '@/utils/types/types';
  import { useKeyStateStore } from '@/utils/stores/keyStates';
  import { computed, defineEmits, ref } from 'vue';
  import Basic from '@/components/hud/elements/Basic.vue';
  import Detailed from '@/components/hud/elements/Detailed.vue';
  import List from '@/components/hud/elements/List.vue';
  import Progressbar from '@/components/hud/elements/Progressbar.vue';
  import Container from '@/components/hud/elements/Container.vue';

  const { anchorPoint, configuration } = defineProps({
    anchorPoint: {
      type: String as PropType<AnchorPoints>,
      required: true
    },
    configuration: {
      type: Array as PropType<ElementSettings[]>,
      required: false,
      default: []
    }
  });

  const keyStateStore = useKeyStateStore();
  const components = {
    Basic,
    Container,
    Detailed,
    List,
    Progressbar
  };
  const emit = defineEmits(['elementDropped']);
  const hover = ref(false);
  const computedClasses = computed(() => {
    const baseClasses = anchorPoint.split('-');
    const conditionalClasses = {
      unlocked: keyStateStore.keyStates['Alt'],
      hover: hover.value
    };

    return [baseClasses, conditionalClasses];
  });

  const onDrop = (event: DragEvent): void => {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain');
    if(id) {
      hover.value = false;
      emit('elementDropped', { toAnchorPoint: anchorPoint, elementName: id });
    }
  };
  const onDragLeave = (event: DragEvent): void => {
    event.preventDefault();
    hover.value = false;
  };
  const onDragOver = (event: DragEvent): void => {
    event.preventDefault();
    hover.value = true;
  };
</script>

<template>
  <div class="anchor-point" :id="anchorPoint" :class="computedClasses" @drop="onDrop" @dragover="onDragOver" @dragleave="onDragLeave">
    <component
      v-for="element in configuration"
      :is="components[element.type]"
      :key="element.name"
      :settings="element"
      :class="{ hidden: !element.visible }"
    />
  </div>
</template>

<style lang="css" scoped>
  .anchor-point {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: calc(33% - 1rem);
    height: calc(33% - 1rem);
    background-color: transparent;
    gap: 1rem;
    z-index: 2;
  }
  .anchor-point::before {
    position: absolute;
    display: block;
    content: "";
    width: 50px;
    height: 50px;
    transition: background-color 400ms ease-in-out;
  }
  .anchor-point.unlocked::before {
    background-color: rgba(185, 246, 202, 0.25);
  }
  .anchor-point.unlocked.hover::before {
    background-color: rgba(185, 246, 202, 0.75);
  }
  .anchor-point.middle::before {
    top: 0;
    bottom: 0;
    margin: auto;
  }
  .anchor-point.bottom::before {
    bottom: 0;
  }
  .anchor-point.center::before {
    left: 0;
    right: 0;
    margin: auto;
  }
  .anchor-point.right::before {
    right: 0;
  }
  .anchor-point.top {
    top: 0;
  }
  .anchor-point.middle {
    top: 0;
    bottom: 0;
    margin: auto;
    justify-content: center;
  }
  .anchor-point.bottom {
    bottom: 0;
    justify-content: end;
  }
  .anchor-point.left {
    left: 0;
  }
  .anchor-point.center {
    left: 0;
    right: 0;
    margin: auto;
    align-items: center;
  }
  .anchor-point.right {
    right: 0;
    align-items: flex-end;
  }
</style>