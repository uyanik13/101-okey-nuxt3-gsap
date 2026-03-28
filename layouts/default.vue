<template>
    <slot />
</template>

<script setup>
useHead({
  bodyAttrs: {
    class: computed(() => {
      return ''
    }),
  },
});
</script>
 