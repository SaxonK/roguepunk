<script setup lang="ts">
  import { IAnchorPointConfiguration } from "./utils/types/types";
  import { useKeyStateStore } from "@/utils/stores/keyStates";
  import { onMounted, onUnmounted, ref } from "vue";
  import Hud from "@/components/hud/Hud.vue";
  import Interfaces from "@/components/interface/Interfaces.vue";
  import Viewport from "@/components/game/Viewport.vue";
  import hudConfiguration from "@/config/hud/default.json";

  const keyStateStore = useKeyStateStore();
  const AnchorPointConfigurations = ref(hudConfiguration as IAnchorPointConfiguration);

  onMounted(() => {
    keyStateStore.attachEventListener();
  });

  onUnmounted(() => {
    keyStateStore.detachEventListener();
  });
</script>
<template>
  <Interfaces />
  <Hud :AnchorPointConfigurations="AnchorPointConfigurations" />
  <Viewport />
</template>