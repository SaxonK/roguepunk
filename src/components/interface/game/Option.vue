<script setup lang="ts">
  const { name, description, level, type } = defineProps({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    }
  });
</script>

<template>
  <div class="level-up-option">
    <div class="details">
      <div class="type">{{ `Type: ${type.toLowerCase()}` }}</div>
      <div class="level">{{ active ? `Level: ${level + 1}` : `New!` }}</div>
    </div>
    <h3>{{ name }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<style lang="css" scoped>
  .level-up-option {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 200px;
    text-align: center;
    font-family: "Knewave", system-ui;
    font-weight: 400;
    font-style: normal;
    border: 2px solid rgb(255,145,144);
    background-color: rgba(253, 192, 148, 0.25);
    backdrop-filter: blur(2px);
    border-radius: 26px 0;
    padding: 1rem;
    gap: 1rem;
    transition: all 300ms ease-in-out;
    cursor: pointer;
  }
  .level-up-option:hover {
    background-color: rgba(253, 192, 148, 0.5);
  }
  .details {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-content: space-between;
    gap: 1rem;
  }
  h3 {
    margin: 0;
  }
  p {
    margin: 0;
  }
</style>