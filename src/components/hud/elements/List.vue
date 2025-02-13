<script setup lang="ts">
  import type { IWeapon } from '@/utils/types/interfaces';
  import type { ElementSettings } from '@/utils/types/types';
  import { useKeyStateStore } from '@/utils/stores/keyStates';
  import { storeToRefs } from 'pinia';
  import { computed, onBeforeUnmount, onMounted, PropType, ref } from 'vue';

  const { settings } = defineProps({
    settings: {
      type: Object as PropType<ElementSettings>,
      required: true
    }
  });
  const keyStateStore = useKeyStateStore();
  const { keyStates } = storeToRefs(keyStateStore);
  const list = ref<HTMLElement | null>(null);

  const isElementSettingsArray = (settings: unknown): settings is ElementSettings[] => {
    return Array.isArray(settings) && settings.every(item => 
      'name' in item &&
      'type' in item &&
      'value' in item &&
      'maxValue' in item &&
      'direction' in item &&
      'displayOrder' in item &&
      'draggable' in item &&
      'visible' in item
    );
  };

  const items = computed<Array<IWeapon | null>>(() => {
    const list = settings.value;
    if (Array.isArray(list) && !isElementSettingsArray(list)) {
      if (list.length < 6) {
        const items: Array<IWeapon | null> = Array.from({ length: 6 }, (_, i) => list[i] ?? null);
        return items;
      } else {
        return list;
      }
    } else {
      return [];
    }
  });

  const unlocked = computed(() => {
    return keyStates.value['Alt'] && settings.draggable ? true : false;
  });

  const onDragStart = (event: DragEvent): void => {
    if(event.target instanceof HTMLElement) {
      event.dataTransfer?.setData('text/plain', event.target.id);
    }
  };
  onMounted(() => {
    if(settings.draggable && list.value) {
      list.value.addEventListener('dragstart', onDragStart);
    }
  });
  onBeforeUnmount(() => {
    if(list.value) {
      list.value.removeEventListener('dragstart', onDragStart);
    }
  });
</script>

<template>
  <div ref="list" :id="settings.name" :class="{ 'unlocked': unlocked }" :draggable="unlocked" class="list">
    <div class="list-item" v-for="(item, index) in items" :key="index" :class="{ inactive: item === null, }">
      <div class="item-container" v-if="item !== null">
        <span class="item-level">{{ `${item.level}` }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
  .list {
    position: relative;
    display: flex;
    flex-direction: row;
    width: fit-content;
    margin: 0 12px;
    gap: 9px;
  }
  .list-item {
    position: relative;
    display: block;
    width: 25px;
    height: 25px;
    border-width: 2px;
    border-style: solid;
    border-color: rgba(255, 227, 216, 1);
    border-radius: 0px 9px;
  }
  .list-item.inactive {
    border-color: rgba(255, 227, 216, 0.25);
  }
  .item-container {
    width: 100%;
    height: 100%;
  }
  .item-level {
    position: absolute;
    display: block;
    color: rgb(94, 114, 235);
    font-size: 9px;
    font-family: "Knewave", system-ui;
    font-weight: 100;
    font-style: normal;
    bottom: 0;
    right: 0;
    margin-right: 3px;
  }
  
  .list.hidden {
    visibility: hidden;
    opacity: 0;
  }
  .list.hidden.unlocked {
    visibility: visible;
    opacity: 0.25;
  }
  .list.unlocked {
    cursor: pointer;
  }
  .list.unlocked::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    width: 100%;
    height: 100%;
    padding: 2px;
    border-radius: 0;
    border: 2px dotted rgba(255, 255, 0, 0.75); 
  }
</style>