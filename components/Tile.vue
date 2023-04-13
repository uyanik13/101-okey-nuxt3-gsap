<template>
  <div
    class="tile tile-bg border-1 border-gray-500 rounded-lg w-14 h-20 flex flex-col items-center justify-center"
    :style="{ color: color }"
  >
    <div class="number font-merri text-4xl">{{ number }}</div>
    <span class="w-3 h-3 bg-gray-400 shadow-inner rounded-full mt-2"></span>
  </div>
</template>
<script setup>
import { ref, defineProps } from "vue";

const props = defineProps({
  number: Number,
  color: String,
});
</script>
  
  