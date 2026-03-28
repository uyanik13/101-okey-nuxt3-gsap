<template>
  <div
    :class="[
      'tile',
      number != null ? 'tile-real cursor-grab active:cursor-grabbing' : 'tile-empty',
      isJoker ? 'tile-joker' : '',
      small ? 'tile-sm' : '',
    ]"
    :data-index="dataIndex"
    :data-color="color"
    :data-number="number"
    :data-flip-id="tid != null ? String(tid) : undefined"
  >
    <template v-if="number != null">
      <div class="tile-body">
        <div v-if="isJoker" class="tile-joker-content">
          <span class="tile-joker-ok">OK</span>
          <span class="tile-joker-dot" :style="{ backgroundColor: colorCode }"></span>
        </div>
        <template v-else>
          <span class="tile-num" :style="{ color: colorCode }">{{ number }}</span>
          <span class="tile-dot" :style="{ backgroundColor: colorCode }"></span>
        </template>
      </div>
      <!-- Bottom edge shadow line (Zynga style) -->
      <div class="tile-bottom-edge"></div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  number: { type: Number, default: null },
  color: { type: String, default: null },
  dataIndex: { type: Number, default: null },
  isJoker: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
  tid: { type: Number, default: null },    // stable ID → becomes data-flip-id for GSAP Flip
});

const colorCode = computed(() => {
  const colorMap = {
    red: '#e8232f',
    orange: '#f07800',
    black: '#1a1a2e',
    blue: '#0a7cc4',
  };
  return colorMap[props.color] || '#0a7cc4';
});
</script>

<style scoped>
.tile {
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  flex-shrink: 0;
}

/* Empty slot placeholder */
.tile-empty {
  width: var(--tile-w, 50px);
  height: var(--tile-h, 70px);
  border-radius: 6px;
}

/* Real tile - white glossy Zynga style */
.tile-real {
  width: var(--tile-w, 50px);
  height: var(--tile-h, 70px);
  border-radius: 6px;
  background: linear-gradient(175deg, #ffffff 0%, #f5f2ec 60%, #e8e2d6 100%);
  border: 1px solid #c8bfaf;
  border-bottom: 3px solid #b0a48e;
  box-shadow:
    0 2px 0 #9a8e78,
    0 3px 6px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  transition: box-shadow 0.1s ease, transform 0.1s ease;
  z-index: 1;
}

.tile-real:hover {
  box-shadow:
    0 2px 0 #9a8e78,
    0 5px 12px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.95);
  transform: translateY(-1px);
  z-index: 10;
}

/* Joker tile - special gold border */
.tile-joker.tile-real {
  background: linear-gradient(175deg, #fffef0 0%, #fff8d0 60%, #f5e88a 100%);
  border-color: #e0c040;
  border-bottom-color: #c8a820;
  box-shadow:
    0 2px 0 #b09020,
    0 3px 8px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.95);
}

/* Small variant for board indicator */
.tile-sm.tile-real,
.tile-sm.tile-empty {
  width: 40px;
  height: 56px;
}
.tile-sm .tile-num { font-size: 1.3rem !important; }

/* Inner body */
.tile-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding-bottom: 2px;
}

.tile-num {
  font-family: 'Arial Black', 'Impact', sans-serif;
  font-size: 1.65rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.08);
}

.tile-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  opacity: 0.75;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.tile-joker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.tile-joker-ok {
  font-family: 'Arial Black', 'Impact', sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  color: #c8991a;
  text-shadow: 0 1px 0 rgba(255,255,255,0.6), 0 0 8px rgba(200,153,26,0.4);
  letter-spacing: 1px;
}

.tile-joker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  opacity: 0.8;
}

/* Bottom edge highlight - Zynga 3D effect */
.tile-bottom-edge {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 0 0 6px 6px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.18));
  pointer-events: none;
}
</style>
