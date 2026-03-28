<template>
  <div class="rack-wrapper">

    <!-- LEFT SORT BUTTON (Seri Diz) - Zynga style side button -->
    <div class="rack-side-btn rack-side-btn-left" @click="handleSortByRuns" title="Seri Diz">
      <div class="side-btn-inner">
        <div class="side-btn-icon-row">
          <span class="sbi sbi-5">5</span><span class="sbi sbi-5">5</span>
        </div>
        <div class="side-btn-label">SORT</div>
      </div>
    </div>

    <!-- MAIN RACK BODY -->
    <div class="rack-main">
      <!-- Rack toolbar (player name + odd sum) -->
      <div class="rack-info-bar">
        <span class="rack-player-name">{{ playerName }}</span>
        <span class="rack-odd-badge" :class="{ 'badge-zero': currentOddSum === 0 }">
          {{ currentOddSum }}
        </span>
      </div>

      <!-- Rack body with wooden texture and left/right pegs -->
      <div class="rack-body-wrap">
        <!-- Left peg -->
        <div class="rack-peg rack-peg-left">
          <div class="peg-knob"></div>
          <div class="peg-knob"></div>
        </div>

        <!-- Rack surface (wood) -->
        <div class="rack-surface" ref="rackRef">
          <!-- 101 PLUS watermark -->
          <div class="rack-watermark" aria-hidden="true">
            <div class="wm-logo">101<br/>PLUS</div>
            <div class="wm-sub">AMATEURS</div>
          </div>
          <!-- Row 1 -->
          <div class="rack-row">
            <div
              v-for="(tile, i) in topRow"
              :key="tile._tid != null ? 'tid-' + tile._tid : 'et-' + i"
              class="rack-slot"
              :class="{ 'slot-filled': tile.number != null }"
              :data-slot="i"
            >
              <Tile
                v-if="tile.number != null"
                :number="tile.number"
                :color="tile.color"
                :isJoker="tile.isJoker || false"
                :dataIndex="i"
                :tid="tile._tid"
                class="rack-tile"
              />
            </div>
          </div>

          <!-- Groove between rows -->
          <div class="rack-groove"></div>

          <!-- Row 2 -->
          <div class="rack-row">
            <div
              v-for="(tile, i) in bottomRow"
              :key="tile._tid != null ? 'tid-' + tile._tid : 'eb-' + i"
              class="rack-slot"
              :class="{ 'slot-filled': tile.number != null }"
              :data-slot="i + ROW_SIZE"
            >
              <Tile
                v-if="tile.number != null"
                :number="tile.number"
                :color="tile.color"
                :isJoker="tile.isJoker || false"
                :dataIndex="i + ROW_SIZE"
                :tid="tile._tid"
                class="rack-tile"
              />
            </div>
          </div>
        </div>

        <!-- Right peg -->
        <div class="rack-peg rack-peg-right">
          <div class="peg-knob"></div>
          <div class="peg-knob"></div>
        </div>
      </div>
    </div>

    <!-- RIGHT SORT BUTTON (Çift Diz) -->
    <div class="rack-side-btn rack-side-btn-right" @click="handleSortByPairs" title="Çift Diz">
      <div class="side-btn-inner">
        <div class="side-btn-icon-row">
          <span class="sbi sbi-1">1</span><span class="sbi sbi-2">2</span><span class="sbi sbi-3">3</span>
        </div>
        <div class="side-btn-label">SORT</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import Tile from '@/components/Tile.vue';
import { useHelpers } from '~~/composables/useHelpers.js';

const { $gsap: gsap, $Draggable: Draggable, $Flip: Flip } = useNuxtApp();
const { getOddTiles, sortByRuns, sortByPairs } = useHelpers();

const ROW_SIZE = 16;

const props = defineProps({
  playerName: { type: String, default: 'Sen' },
  tiles: { type: Array, required: true },
  canDiscard: { type: Boolean, default: false },
});

const emit = defineEmits(['updateOddSum', 'drawTile', 'discardTile']);

const playerTiles = ref([...props.tiles]);
const rackRef = ref(null);
const draggableInstances = ref([]);
const currentOddSum = ref(0);

const topRow = computed(() => playerTiles.value.slice(0, ROW_SIZE));
const bottomRow = computed(() => playerTiles.value.slice(ROW_SIZE, ROW_SIZE * 2));

let dragStartSlot = null;

// ---------- Sound Engine (noise-burst synthesis — realistic tile clacks) ----------
let _audioCtx = null;
const getAudioCtx = () => {
  if (process.server) return null;
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
  } catch { return null; }
  return _audioCtx;
};

// Shaped white-noise burst through a filter — sounds like real tile hits
const _noiseClick = (ctx, durationSec, decay, filterType, filterFreq, filterQ, vol, delayT = 0) => {
  const len = Math.floor(ctx.sampleRate * durationSec);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(Math.max(0, 1 - i / len), decay);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const flt = ctx.createBiquadFilter();
  flt.type = filterType;
  flt.frequency.value = filterFreq;
  if (filterQ) flt.Q.value = filterQ;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(flt); flt.connect(g); g.connect(ctx.destination);
  src.start(ctx.currentTime + delayT);
};

const playSound = (type) => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    if (type === 'pickup') {
      // Light woody tap: sharp transient + mid-body resonance
      _noiseClick(ctx, 0.022, 9, 'highpass', 2800, 1,   0.30);
      _noiseClick(ctx, 0.055, 5, 'bandpass',  650, 2.5, 0.22);
    } else if (type === 'place') {
      // Heavy thud: low boom + hard attack click
      _noiseClick(ctx, 0.075, 4, 'lowpass',   240, 1,   0.55);
      _noiseClick(ctx, 0.018, 11,'highpass', 3200, 1,   0.35);
    } else if (type === 'draw') {
      // Slide-draw: softer mid-range with slight sustain
      _noiseClick(ctx, 0.09, 3.5,'bandpass',  480, 2,   0.38);
      _noiseClick(ctx, 0.025, 8, 'highpass', 1800, 1,   0.18);
    } else if (type === 'discard') {
      // Discard slap: medium thud + crisp click
      _noiseClick(ctx, 0.065, 4, 'lowpass',   320, 1,   0.50);
      _noiseClick(ctx, 0.022, 9, 'bandpass', 1400, 2,   0.28);
    } else if (type === 'sort') {
      // Rapid cascade of tile clacks
      for (let i = 0; i < 6; i++) {
        _noiseClick(ctx, 0.038, 7, 'bandpass', 700 + i * 90, 2.5, 0.20, i * 0.048);
      }
    }
  } catch {}
};

// ---------- Drag helpers ----------
const getSlotFromPosition = (x, y) => {
  const slots = rackRef.value?.querySelectorAll('.rack-slot');
  if (!slots) return null;
  for (const slot of slots) {
    const r = slot.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return parseInt(slot.dataset.slot);
    }
  }
  return null;
};

const clearHighlights = () => {
  rackRef.value?.querySelectorAll('.slot-drop-target').forEach(el =>
    el.classList.remove('slot-drop-target')
  );
};

const onDragStart = (tileEl) => {
  dragStartSlot = parseInt(tileEl.dataset.index);
  playSound('pickup');
  gsap.to(tileEl, {
    scale: 1.15,
    zIndex: 2000,
    rotation: 2,
    duration: 0.12,
    ease: 'back.out(2)',
  });
};

const onDragMove = (tileEl) => {
  const r = tileEl.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  clearHighlights();

  // Highlight the slot we're hovering over
  const targetSlot = getSlotFromPosition(cx, cy);
  if (targetSlot !== null && targetSlot !== dragStartSlot) {
    const el = rackRef.value?.querySelector(`[data-slot="${targetSlot}"]`);
    if (el) el.classList.add('slot-drop-target');
  }
};

// dragDist: distance in pixels the tile was moved (from GSAP Draggable this.x/y)
// < 10px = tap → discard; >= 10px = drag → insert/swap
const onDragEnd = (tileEl, dragDist) => {
  const r = tileEl.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  clearHighlights();

  gsap.to(tileEl, {
    scale: 1,
    rotation: 0,
    duration: 0.18,
    ease: 'power2.out',
    onComplete: () => gsap.set(tileEl, { clearProps: 'zIndex,rotation' }),
  });

  // TAP-TO-DISCARD: if barely moved and it's the player's discard phase
  if (dragDist < 10 && props.canDiscard && dragStartSlot !== null) {
    const tile = playerTiles.value[dragStartSlot];
    if (tile?.number != null) {
      playSound('discard');
      const emptyTile = { number: null, color: null, _tid: tile._tid };
      const newTiles = [...playerTiles.value];
      newTiles[dragStartSlot] = emptyTile;
      emit('discardTile', dragStartSlot, { ...tile });
      playerTiles.value = newTiles;
      nextTick(() => reinitDraggable());
      gsap.set(tileEl, { clearProps: 'x,y,scale,rotation,zIndex' });
      dragStartSlot = null;
      return;
    }
  }

  // DRAG-TO-SLOT
  const targetSlot = getSlotFromPosition(cx, cy);
  if (targetSlot !== null && targetSlot !== dragStartSlot && dragStartSlot !== null) {
    playSound('place');
    moveTile(dragStartSlot, targetSlot);
  } else {
    gsap.to(tileEl, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.22, ease: 'back.out(1.5)' });
  }

  gsap.set(tileEl, { clearProps: 'zIndex' });
  dragStartSlot = null;
};

// ---------- Tile movement with shift-toward-empty ----------
const moveTile = (fromIdx, toIdx) => {
  const tiles = playerTiles.value.map(t => ({ ...t }));
  const movedTile = tiles[fromIdx];
  if (movedTile.number == null) return;

  const tileEls = rackRef.value?.querySelectorAll('[data-flip-id]');
  const flipState = Flip?.getState(tileEls);

  const targetTile = tiles[toIdx];
  const fromRow = Math.floor(fromIdx / ROW_SIZE);
  const toRow = Math.floor(toIdx / ROW_SIZE);
  const rowStart = toRow * ROW_SIZE;
  const rowEnd = rowStart + ROW_SIZE;

  if (targetTile.number == null) {
    // Simple move to empty slot
    tiles[toIdx] = { ...movedTile };
    tiles[fromIdx] = { number: null, color: null };
  } else {
    // Occupied target - find nearest empty and shift tiles toward it
    let shifted = false;

    if (fromIdx < toIdx || fromRow < toRow) {
      // Moving RIGHT/DOWN: look for empty AFTER toIdx (same row)
      let emptyIdx = null;
      for (let i = toIdx + 1; i < rowEnd; i++) {
        if (tiles[i].number == null) { emptyIdx = i; break; }
      }
      if (emptyIdx !== null) {
        // Shift tiles right: toIdx..emptyIdx-1 → toIdx+1..emptyIdx
        for (let i = emptyIdx; i > toIdx; i--) {
          tiles[i] = { ...tiles[i - 1] };
        }
        tiles[toIdx] = { ...movedTile };
        tiles[fromIdx] = { number: null, color: null };
        shifted = true;
      } else {
        // Try empty BEFORE fromIdx (same row)
        for (let i = rowStart; i < fromIdx; i++) {
          if (tiles[i].number == null) { emptyIdx = i; break; }
        }
        if (emptyIdx !== null) {
          // Shift tiles left: emptyIdx+1..toIdx → emptyIdx..toIdx-1
          for (let i = emptyIdx; i < toIdx; i++) {
            tiles[i] = { ...tiles[i + 1] };
          }
          tiles[toIdx] = { ...movedTile };
          tiles[fromIdx] = { number: null, color: null };
          // Adjust fromIdx after shift
          shifted = true;
        }
      }
    } else {
      // Moving LEFT/UP: look for empty BEFORE toIdx (same row)
      let emptyIdx = null;
      for (let i = toIdx - 1; i >= rowStart; i--) {
        if (tiles[i].number == null) { emptyIdx = i; break; }
      }
      if (emptyIdx !== null) {
        // Shift tiles left
        for (let i = emptyIdx; i < toIdx; i++) {
          tiles[i] = { ...tiles[i + 1] };
        }
        tiles[toIdx] = { ...movedTile };
        tiles[fromIdx] = { number: null, color: null };
        shifted = true;
      } else {
        // Try empty AFTER fromIdx
        for (let i = fromIdx + 1; i < rowEnd; i++) {
          if (tiles[i].number == null) { emptyIdx = i; break; }
        }
        if (emptyIdx !== null) {
          for (let i = emptyIdx; i > toIdx; i--) {
            tiles[i] = { ...tiles[i - 1] };
          }
          tiles[toIdx] = { ...movedTile };
          tiles[fromIdx] = { number: null, color: null };
          shifted = true;
        }
      }
    }

    if (!shifted) {
      // No empty found: direct swap
      tiles[fromIdx] = { ...targetTile };
      tiles[toIdx] = { ...movedTile };
    }
  }

  playerTiles.value = tiles;

  nextTick(() => {
    if (Flip && flipState) {
      Flip.from(flipState, {
        duration: 0.30,
        ease: 'power2.inOut',
        stagger: { each: 0.022, from: 'start' },
        // No absolute:true — keeps elements in layout flow; Flip tracks via data-flip-id
        onComplete: reinitDraggable,
      });
    } else {
      reinitDraggable();
    }
  });
};

// ---------- Sort ----------
const handleSortByRuns = () => {
  playSound('sort');
  const flipState = Flip?.getState(rackRef.value?.querySelectorAll('[data-flip-id]'));
  playerTiles.value = sortByRuns(playerTiles.value);
  nextTick(() => {
    if (Flip && flipState) {
      Flip.from(flipState, {
        duration: 0.42,
        ease: 'power2.inOut',
        stagger: { each: 0.022, from: 'start' },
        onComplete: reinitDraggable,
      });
    } else {
      reinitDraggable();
    }
  });
};

const handleSortByPairs = () => {
  playSound('sort');
  const flipState = Flip?.getState(rackRef.value?.querySelectorAll('[data-flip-id]'));
  playerTiles.value = sortByPairs(playerTiles.value);
  nextTick(() => {
    if (Flip && flipState) {
      Flip.from(flipState, {
        duration: 0.42,
        ease: 'power2.inOut',
        stagger: { each: 0.022, from: 'start' },
        onComplete: reinitDraggable,
      });
    } else {
      reinitDraggable();
    }
  });
};

// ---------- Draggable init ----------
const reinitDraggable = () => {
  draggableInstances.value.forEach(d => d[0]?.kill());
  draggableInstances.value = [];
  if (!rackRef.value || !Draggable) return;

  const tileEls = rackRef.value.querySelectorAll('.rack-tile');
  tileEls.forEach((tileEl) => {
    const inst = Draggable.create(tileEl, {
      type: 'x,y',
      bounds: '#game-area',
      zIndexBoost: true,
      activeCursor: 'grabbing',
      onDragStart() { onDragStart(tileEl); },
      onDrag() { onDragMove(tileEl); },
      onDragEnd() {
        // this.x/this.y = total displacement; used to detect tap vs drag
        const dist = Math.sqrt(this.x * this.x + this.y * this.y);
        onDragEnd(tileEl, dist);
      },
    });
    draggableInstances.value.push(inst);
  });
};

const calculateOddTiles = () => {
  const res = getOddTiles(playerTiles.value);
  currentOddSum.value = res.totalSum;
  emit('updateOddSum', res.totalSum);
};

watch(playerTiles, () => calculateOddTiles(), { deep: true });

watch(() => props.tiles, (newTiles) => {
  playerTiles.value = [...newTiles];
  nextTick(() => reinitDraggable());
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    reinitDraggable();
    calculateOddTiles();
  });
});
</script>

<style scoped>
/* ============================================
   RACK WRAPPER - full width row
   ============================================ */
.rack-wrapper {
  display: flex;
  align-items: stretch;
  width: 100%;
  gap: 0;
  user-select: none;
  -webkit-user-select: none;
}

/* ============================================
   SIDE SORT BUTTONS (Zynga-style dark blue pill)
   ============================================ */
.rack-side-btn {
  width: 72px;
  min-width: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #2c4a7c 0%, #1a2f55 50%, #0f1e3a 100%);
  border: 2px solid #4a6fa8;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.4);
  position: relative;
  overflow: hidden;
}

.rack-side-btn-left {
  border-radius: 12px 0 0 12px;
  border-right: none;
}

.rack-side-btn-right {
  border-radius: 0 12px 12px 0;
  border-left: none;
}

.rack-side-btn:hover {
  background: linear-gradient(180deg, #3a5f9c 0%, #243a6a 50%, #162645 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 14px rgba(0,0,0,0.5);
}

.rack-side-btn:active {
  transform: scale(0.97);
}

.side-btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.side-btn-icon-row {
  display: flex;
  gap: 2px;
}

.sbi {
  width: 18px;
  height: 24px;
  background: white;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.sbi-5 { color: #1a2f55; }
.sbi-1 { color: #e8232f; }
.sbi-2 { color: #1a1a2e; }
.sbi-3 { color: #0a7cc4; }

.side-btn-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #a8c4f0;
  text-transform: uppercase;
}

/* ============================================
   MAIN RACK
   ============================================ */
.rack-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.rack-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 8px 4px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2));
}

.rack-player-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.5px;
}

.rack-odd-badge {
  font-size: 11px;
  font-weight: 700;
  min-width: 26px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  background: #4338ca;
  color: white;
  box-shadow: 0 2px 4px rgba(67,56,202,0.4);
}

.rack-odd-badge.badge-zero {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4);
  box-shadow: none;
}

.rack-body-wrap {
  display: flex;
  align-items: stretch;
  flex: 1;
}

/* Wooden pegs on sides */
.rack-peg {
  width: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 8px 0;
  background: linear-gradient(to right, #7a5c2e, #9a7540, #7a5c2e);
  border: 1px solid rgba(0,0,0,0.2);
}

.rack-peg-left { border-radius: 0; }
.rack-peg-right { border-radius: 0; }

.peg-knob {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4a3010, #2a1a08);
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
}

/* Rack surface - golden wood */
.rack-surface {
  flex: 1;
  background-image: url('/images/wood-1.png');
  background-size: cover;
  background-color: #c8a050;
  padding: 4px 2px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: visible;
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,0.15),
    inset 0 -2px 0 rgba(0,0,0,0.15);
}

.rack-groove {
  height: 4px;
  background: linear-gradient(to bottom,
    rgba(0,0,0,0.2) 0%,
    rgba(0,0,0,0.08) 50%,
    rgba(255,255,255,0.08) 100%
  );
  margin: 1px 2px;
  border-radius: 2px;
}

.rack-row {
  display: flex;
  gap: 1px;
  min-height: 74px;
}

.rack-slot {
  flex: 1;
  max-width: 56px;
  min-width: 0;
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  position: relative;
  transition: background-color 0.12s ease;
}

.rack-slot:not(.slot-filled) {
  background: rgba(0,0,0,0.06);
}

.slot-drop-target {
  background: rgba(50, 150, 255, 0.25) !important;
  box-shadow: inset 0 0 0 2px rgba(50, 150, 255, 0.6) !important;
}

.rack-tile {
  position: relative;
  z-index: 1;
}

/* ============================================
   RACK WATERMARK (101 PLUS / AMATEURS)
   ============================================ */
.rack-watermark {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  pointer-events: none;
  z-index: 0;
}

.wm-logo {
  font-size: 1.6rem;
  font-weight: 900;
  text-align: center;
  color: rgba(100,60,10,0.18);
  line-height: 1.0;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.wm-sub {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: rgba(100,60,10,0.12);
}

/* Rack surface needs relative position for watermark */
.rack-surface {
  position: relative;
}

/* Discard-able tile indicator */
.rack-row .rack-slot.slot-filled:hover .rack-tile {
  cursor: pointer;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1100px) {
  .rack-side-btn { width: 58px; min-width: 58px; }
  .sbi { width: 15px; height: 20px; font-size: 10px; }
}

@media (max-width: 860px) {
  .rack-side-btn { width: 48px; min-width: 48px; }
  .side-btn-label { font-size: 9px; }
  .rack-slot { max-width: 44px; height: 66px; }
  .rack-row { min-height: 66px; }
}

@media (max-width: 640px) {
  .rack-side-btn { width: 40px; min-width: 40px; }
  .side-btn-icon-row { display: none; }
  .rack-slot { max-width: 36px; height: 60px; }
  .rack-row { min-height: 60px; }
}
</style>
