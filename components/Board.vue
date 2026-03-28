<template>
  <div class="board-area">
    <!-- Left board panels (decorative teal grid) -->
    <div class="board-panel board-panel-left">
      <div class="board-panel-inner">
        <div class="board-logo-watermark">101<br/>PLUS</div>
      </div>
    </div>

    <!-- Center column: game mode labels + indicator/joker -->
    <div class="board-center-col">
      <!-- Game mode chips -->
      <div class="mode-chips">
        <div class="mode-chip">Solo</div>
        <div class="mode-chip mode-chip-active">Assisted</div>
        <div class="mode-chip mode-chip-warn">Incremental</div>
        <div class="mode-chip">1 Round</div>
      </div>

      <!-- Indicator tile -->
      <div v-if="indicatorTile" class="indicator-slot">
        <div class="indicator-tile-wrap">
          <Tile
            :number="indicatorTile.number"
            :color="indicatorTile.color"
            :isJoker="indicatorTile.isJoker || false"
            :small="true"
          />
        </div>
        <span class="indicator-label">Gösterge</span>
      </div>

      <!-- Joker tile (okey) -->
      <div v-if="jokerTile" class="indicator-slot">
        <div class="indicator-tile-wrap joker-glow">
          <Tile
            :number="jokerTile.number"
            :color="jokerTile.color"
            :isJoker="true"
            :small="true"
          />
        </div>
        <span class="indicator-label okey-label">Okey</span>
      </div>
    </div>

    <!-- Right board panel / discard area -->
    <div class="board-panel board-panel-right">
      <div class="board-panel-inner">
        <div class="board-logo-watermark">101<br/>PLUS</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  indicatorTile: { type: Object, default: null },
  jokerTile: { type: Object, default: null },
});
</script>

<style scoped>
.board-area {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 4px;
  align-items: stretch;
}

/* Board panels - teal grid */
.board-panel {
  flex: 1;
  min-height: 160px;
  border-radius: 8px;
  background:
    linear-gradient(rgba(0,180,200,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,180,200,0.06) 1px, transparent 1px),
    linear-gradient(180deg, #0d3d4a 0%, #0a2d38 100%);
  background-size: 30px 30px, 30px 30px, cover;
  border: 1px solid rgba(0,200,230,0.12);
  position: relative;
  overflow: hidden;
}

.board-panel-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-logo-watermark {
  font-size: 2rem;
  font-weight: 900;
  text-align: center;
  color: rgba(0,200,230,0.07);
  line-height: 1.1;
  letter-spacing: 2px;
  pointer-events: none;
}

/* Center column */
.board-center-col {
  width: 100px;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  padding: 6px 0;
}

/* Mode chips */
.mode-chips {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
}

.mode-chip {
  height: 24px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.08);
  letter-spacing: 0.3px;
}

.mode-chip-active {
  background: rgba(34,197,94,0.25);
  border-color: rgba(34,197,94,0.4);
  color: #4ade80;
}

.mode-chip-warn {
  background: rgba(239,68,68,0.2);
  border-color: rgba(239,68,68,0.35);
  color: #f87171;
}

/* Indicator display */
.indicator-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.indicator-tile-wrap {
  border-radius: 7px;
  padding: 2px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
}

.joker-glow {
  border-color: rgba(232,192,32,0.4);
  box-shadow: 0 0 10px rgba(232,192,32,0.2);
}

.indicator-label {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.okey-label {
  color: #fbbf24;
  opacity: 0.8;
}
</style>
