<script setup lang="ts">
  import type { AnchorPoints, IAnchorPointConfiguration, DroppedElement, ElementSettings, HudEventData } from '@/utils/types/types';
  import type { PropType } from 'vue';
  import { ref } from 'vue';
  import AnchorPoint from '@/components/hud/AnchorPoint.vue';
  import eventEmitter from '@/utils/events/initialiser';

  const { AnchorPointConfigurations } = defineProps({
    AnchorPointConfigurations: {
      type: Object as PropType<IAnchorPointConfiguration>,
      required: true
    }
  });

  const gameEventEmitter = eventEmitter;
  const anchorPointConfiguration = ref<IAnchorPointConfiguration>({ ...AnchorPointConfigurations });

  const getCurrentAnchorPoint = (elementName: string): AnchorPoints | undefined => {
    for(const anchorPoint in anchorPointConfiguration.value) {
      const elementSettings = anchorPointConfiguration.value[anchorPoint as keyof IAnchorPointConfiguration];

      if (elementSettings.some(setting => setting.name === elementName)) {
        return anchorPoint as AnchorPoints;
      }
    };
    return undefined;
  };
  const onDrop = (data: DroppedElement): void => {
    const currentAnchorPoint = getCurrentAnchorPoint(data.elementName);
    if(currentAnchorPoint === data.toAnchorPoint) return;
    if(currentAnchorPoint !== undefined) {
      const elementIndex: number = anchorPointConfiguration.value[currentAnchorPoint].findIndex(element => element.name === data.elementName);
      const element: ElementSettings = anchorPointConfiguration.value[currentAnchorPoint][elementIndex];
      const originalAnchorPointUpdated: ElementSettings[] = anchorPointConfiguration.value[currentAnchorPoint].filter(element => element.name !== data.elementName);
      anchorPointConfiguration.value[currentAnchorPoint] = originalAnchorPointUpdated;
      anchorPointConfiguration.value[data.toAnchorPoint].push(element);
    };
  };
  const search = (elementSettings: ElementSettings[], path: string, targetName: string): ElementSettings | null => {
    for(let i = 0; i < elementSettings.length; i++) {
      const element = elementSettings[i];
      const currentPath = `${path}[${i}]`;

      if (element.name === targetName) return element;
      if (Array.isArray(element.value)) {
        const nestedResult = search(element.value, `${currentPath}.value`, targetName);
        if (nestedResult) return nestedResult;
      }
    }
    return null;
  };
  const update = (data: HudEventData, field: 'value' | 'maxValue'): void => {
    for(const key of Object.keys(anchorPointConfiguration.value)) {
      const result = search(anchorPointConfiguration.value[key as AnchorPoints], key, data.name);
      if(result) {
        switch(data.updateType) {
          case 'add':
            if(typeof result.value === 'number') result[field] += data.numValue;
            if(typeof result.value === 'string') result[field] + data.stringValue;
            break;
          case 'replace':
            if(typeof result.value === 'number' && field === 'maxValue') result[field] = data.maxValue;
            if(typeof result.value === 'number' && field === 'value') result[field] = data.numValue;
            if(typeof result.value === 'string' && field === 'value') result[field] = data.stringValue;
            break;
          case 'subtract':
            if(typeof result.value === 'number') result[field] -= data.numValue;
            break;
        };
      };
    };
  };
  const toggleElementVisibility = (name: string, visible: boolean): void => {
    for(const key of Object.keys(anchorPointConfiguration.value)) {
      const result = search(anchorPointConfiguration.value[key as AnchorPoints], key, name);
      if(result) {
        result.visible = visible;
      }
    };
  };

  gameEventEmitter.on("hudUpdateValue", (data) => update(data, 'value'));
  gameEventEmitter.on("hudUpdateMaxValue", (data) => update(data, 'maxValue'));
  gameEventEmitter.on("hudElementVisibility", (data) => toggleElementVisibility(data.name, data.booleanValue));
</script>

<template>
  <div id="heads-up-display">
    <div id="anchor-points">
      <AnchorPoint
        v-for="(configuration, anchor) in anchorPointConfiguration"
        :key="anchor"
        :anchorPoint="anchor"
        :configuration="configuration"
        @elementDropped="onDrop" 
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
  #heads-up-display {
    position: fixed;
    width: 100%;
    height: 100%;
    padding: 0.5rem;
    background: transparent;
    box-sizing: border-box;
    cursor: url(../../assets/images/crosshair.png) 16 16, default;
    z-index: 1;
  }
  #heads-up-display #anchor-points {
    position: relative;
    width: 100%;
    height: 100%;
    background: transparent;
    box-sizing: border-box;
  }
</style>