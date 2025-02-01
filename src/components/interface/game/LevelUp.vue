<script setup lang="ts">
  import type { InterfaceTypes } from '@/utils/types/types';
  import OverlayMenu from '../generic/OverlayMenu.vue';
  import Option from './Option.vue';
  import itemsManager from '@/entities/weapons/initialiser';
  import eventEmitter from '@/utils/events/initialiser';

  const { visibility } = defineProps({
    visibility: {
      type: Boolean,
      required: true
    }
  });
  const emit = defineEmits(['hide']);
  const gameEmitter = eventEmitter;

  const hide = (name: InterfaceTypes): void => {
    emit('hide', name);
  };
  const setChosenOption = (name: string, active: boolean): void => {
    if(!active) {
      itemsManager.activateWeapon(name);
    } else {
      itemsManager.levelUpWeapon(name);
    };
    hide('levelUp');
    gameEmitter.emit('hudUpdateValue', { name: 'weapons', arrayValue: itemsManager.activeWeaponList, numValue: 0, maxValue: 0, stringValue: '', booleanValue: false, updateType: 'replace' });
  };
</script>

<template>
  <OverlayMenu title="Level Up!" :visibility="visibility">
    <div class="options">
      <Option v-for="option in itemsManager.getWeaponsByRandomAmount()" :index="option.name"
        :active="option.active"
        :name="option.name"
        :description="option.desciption"
        :level="option.level"
        :type="option.type"
        @click="setChosenOption(option.name, option.active)"
      />
    </div>
  </OverlayMenu>
</template>

<style lang="css" scoped>
  .options {
    display: flex;
    position: relative;
    gap: 2rem;
    padding: 2rem;
  }
</style>