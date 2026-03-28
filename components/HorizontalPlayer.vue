<template>
  <div class="hplayer" :class="{ 'hplayer-active': isActive }">
    <img src="/images/icons/giftbox.png" class="hplayer-avatar" alt="" />
    <span class="hplayer-name" :class="{ 'hplayer-name-active': isActive }">{{ name }}</span>
    <span v-if="isActive" class="hplayer-dot"></span>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, default: 'Oyuncu' },
  isActive: { type: Boolean, default: false },
});
</script>

<style scoped>
.hplayer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.1);
}

.hplayer-active {
  border-color: rgba(34,197,94,0.4);
  background: rgba(0,20,0,0.5);
}

.hplayer-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
}

.hplayer-name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hplayer-name-active {
  color: #4ade80;
}

.hplayer-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
</style>