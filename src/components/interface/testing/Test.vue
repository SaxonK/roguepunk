<script setup lang="ts">
  import { ref } from 'vue';
  import weaponsManager from '@/entities/weapons/initialiser';

  const weapons = ref<Record<string, number>>({
    "Pistol": 0,
    "Katana": 0,
    "Grenade": 0
  });

  const getRandomWeaponByAmount = (amount: number): void => {
    for(let i = 0; i < amount; i++) {
      let weapon = weaponsManager.getRandomWeapon();
      weapons.value[weapon.name] += 1;
    }
  };
</script>

<template>
  <div class="test-container">
    <div v-for="(value, weapon) in weapons" :index="weapon" class="weapon">
      <span>{{ `${weapon} count: ${value}` }}</span>
    </div>
    <button @click="getRandomWeaponByAmount(1)" style="cursor: pointer">Get Weapon!</button>
  </div>
</template>

<style lang="css" scoped>
.test-container {
  position: relative;
  display: flex;
  width: fit-content;
  flex-direction: column;
  gap: 1rem;
  color: #fafafa;
  z-index: 100;
}
</style>