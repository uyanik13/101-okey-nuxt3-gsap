<template>
  <div class="vplayer" :class="{ 'vplayer-active': isActive }">
    <!-- Active turn glow -->
    <div v-if="isActive" class="vplayer-glow"></div>

    <!-- Player panel body -->
    <div class="vplayer-body">
      <!-- Avatar -->
      <div class="vplayer-avatar">
        <img src="/images/icons/giftbox.png" class="avatar-img" alt="" />
        <span v-if="isActive" class="active-dot"></span>
      </div>

      <!-- Stacked face-down tiles (visual) -->
      <div class="vplayer-tiles">
        <div
          v-for="n in Math.min(tileCount, 8)"
          :key="n"
          class="vplayer-tile-stack"
          :style="{ top: (n - 1) * 3 + 'px', left: (n - 1) * 1 + 'px' }"
        ></div>
      </div>

      <!-- Tile count badge -->
      <div class="vplayer-count" v-if="tileCount > 0">{{ tileCount }}</div>

      <!-- Name (rotated) -->
      <div class="vplayer-name-wrap">
        <span class="vplayer-name">{{ name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, default: 'Oyuncu' },
  isActive: { type: Boolean, default: false },
  tileCount: { type: Number, default: 0 },
  side: { type: String, default: 'left' },
});
</script>

<style scoped>
.vplayer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vplayer-glow {
  position: absolute;
  inset: -4px;
  border-radius: 10px;
  border: 2px solid rgba(34,197,94,0.5);
  box-shadow: 0 0 16px rgba(34,197,94,0.25);
  pointer-events: none;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.vplayer-body {
  width: 60px;
  padding: 8px 4px;
  border-radius: 8px;
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.vplayer-active .vplayer-body {
  border-color: rgba(34,197,94,0.4);
  background: rgba(0,20,0,0.6);
}

.vplayer-avatar {
  position: relative;
}

.avatar-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
}

.active-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  border: 1px solid #0a2535;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.vplayer-tiles {
  position: relative;
  width: 28px;
  height: 34px;
}

.vplayer-tile-stack {
  position: absolute;
  width: 22px;
  height: 30px;
  border-radius: 3px;
  background: linear-gradient(175deg, #f5f0e8 0%, #e8e0d0 100%);
  border: 1px solid #c0b498;
  border-bottom: 2px solid #a09078;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.vplayer-count {
  background: #1a3a60;
  color: white;
  font-size: 11px;
  font-weight: 700;
  min-width: 22px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1px solid rgba(0,180,230,0.3);
}

.vplayer-name-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vplayer-name {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  text-align: center;
  max-width: 52px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  writing-mode: horizontal-tb;
}
</style>