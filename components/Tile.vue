<template>
  <div
    v-if="number"
    class="tile tile-bg border-1 border-gray-500 rounded-lg w-14 h-20 flex flex-col items-center justify-center"
    :style="{ color: colorCode }"
  >
    <div class="number font-merri text-4xl">{{ number }}</div>
    <span class="w-3 h-3 bg-gray-400 shadow-inner rounded-full mt-2"></span>
  </div> 
</template>
<script setup>
import { defineProps } from "vue";

const props = defineProps({
  number: Number,
  color: String,
});

const colorCode = computed (()=> {
  if(props.color === 'red'){
    return '#C0392B'
  }else if(props.color === 'orange'){
    return '#F39C12'
  }else if(props.color === 'black'){
    return '#000000'
  }else{
    return '#0C21B5'
  }
})
</script>
  
  