<template>
  <div id="game-area" class="game-area">

    <!-- ===== TOP BAR ===== -->
    <div class="top-bar">
      <!-- Left: coins + timer -->
      <div class="top-left">
        <div class="top-badge coin-badge">
          <img src="/images/icons/gold-bars.png" class="badge-icon" alt="" />
          <span class="badge-val">{{ playerCoins.toLocaleString() }}</span>
        </div>
        <div class="top-badge timer-badge" :class="{ 'timer-urgent': timer < 10 }">
          <svg viewBox="0 0 24 24" fill="none" class="badge-icon-sm" stroke="currentColor">
            <circle cx="12" cy="12" r="9" stroke-width="2"/>
            <path d="M12 7v5l3 3" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="badge-val">{{ formattedTimer }}</span>
        </div>
      </div>

      <!-- Center: current player name -->
      <div class="top-center">
        <div class="top-player-badge">
          <img src="/images/icons/giftbox.png" class="w-7 h-7 rounded-full" alt="" />
          <span class="top-player-name">{{ topOpponent?.name || '' }}</span>
          <button class="gift-btn" title="Hediye gönder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a3 3 0 000 6h-3a3 3 0 010-6h3zm0 0a3 3 0 000 6h3a3 3 0 000-6h-3zm-7 6h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2V8zm2 4v8h10v-8"/>
            </svg>
          </button>
        </div>
        <!-- Tile count badge for top player -->
        <div class="tile-count-badge" v-if="topOpponentTileCount > 0">{{ topOpponentTileCount }}</div>
      </div>

      <!-- Right: buy now + settings -->
      <div class="top-right">
        <button class="btn-buy">
          <img src="/images/icons/gold-bars.png" class="badge-icon" alt="" />
          <span>BUY NOW</span>
        </button>
      </div>
    </div>

    <!-- ===== MAIN GAME AREA ===== -->
    <div class="game-body">

      <!-- LEFT PLAYER PANEL -->
      <div class="side-player-panel side-player-left">
        <vertical-player
          :name="gameStore.players[1]?.name || 'Oyuncu 2'"
          :isActive="gameStore.currentPlayerIndex === 1"
          :tileCount="gameStore.players[1]?.tiles.filter(t => t.number != null).length || 0"
          side="left"
        />
      </div>

      <!-- BOARD CENTER -->
      <div class="board-wrap">
        <board :indicatorTile="indicatorTile" :jokerTile="jokerDisplay" />
      </div>

      <!-- RIGHT PLAYER PANEL -->
      <div class="side-player-panel side-player-right">
        <vertical-player
          :name="gameStore.players[3]?.name || 'Oyuncu 4'"
          :isActive="gameStore.currentPlayerIndex === 3"
          :tileCount="gameStore.players[3]?.tiles.filter(t => t.number != null).length || 0"
          side="right"
        />
      </div>
    </div>

    <!-- CURRENT PLAYER LABEL (bottom center above rack) -->
    <div class="player-label-bar">
      <img src="/images/icons/giftbox.png" class="w-5 h-5 rounded-full" alt="" />
      <span class="player-label-name">{{ gameStore.players[0]?.name || 'Sen' }}</span>
      <span class="player-label-coins">
        <img src="/images/icons/gold-bars.png" class="w-4 h-4" alt="" />
        {{ playerCoins.toLocaleString() }}
      </span>
      <!-- Draw button or remaining tile count -->
      <button
        v-if="gameStore.isHumanTurn && gameStore.turnPhase === 'draw'"
        class="draw-tile-btn"
        @click="handleDrawFromCenter"
      >
        <span class="dtb-label">ÇEK</span>
        <span class="dtb-count">{{ gameStore.remainingTiles }}</span>
      </button>
      <div v-else-if="gameStore.gameStarted" class="remaining-badge">{{ gameStore.remainingTiles }}</div>
      <!-- Turn text -->
      <div class="turn-indicator" v-if="gameStore.gameStarted && gameStore.isHumanTurn && gameStore.turnPhase !== 'draw'">
        <span class="turn-text turn-play">Taşa tıkla veya sürükle</span>
      </div>
      <div class="turn-indicator" v-else-if="gameStore.gameStarted && !gameStore.isHumanTurn">
        <span class="turn-text turn-wait">{{ gameStore.currentPlayer?.name }} oynuyor…</span>
      </div>
    </div>

    <!-- ===== RACK SECTION ===== -->
    <div class="rack-section">
      <PlayerRack
        v-if="gameStore.gameStarted"
        @updateOddSum="updateOddSum"
        @discardTile="handleDiscardTile"
        :playerName="gameStore.players[0]?.name || 'Sen'"
        :tiles="gameStore.players[0]?.tiles || []"
        :canDiscard="gameStore.isHumanTurn && gameStore.turnPhase !== 'draw'"
      />
    </div>

  </div>
</template>

<script setup>
import { useGameStore } from '~~/stores/game'

const gameStore = useGameStore()

const oddSum = ref(0)
const timer = ref(300) // 5:00
const playerCoins = ref(8774)
let timerInterval = null

if (!gameStore.gameStarted) {
  gameStore.initGame()
}

const formattedTimer = computed(() => {
  const m = Math.floor(timer.value / 60)
  const s = timer.value % 60
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2, '0')}`
})

const indicatorTile = computed(() => gameStore.indicatorTile)
const jokerDisplay = computed(() => gameStore.jokerTile)

const lastDiscardedTile = computed(() => {
  if (gameStore.discardPile.length === 0) return null
  return gameStore.discardPile[gameStore.discardPile.length - 1]
})

const topOpponent = computed(() => gameStore.players[2])
const topOpponentTileCount = computed(() =>
  gameStore.players[2]?.tiles.filter(t => t.number != null).length || 0
)

const updateOddSum = (val) => { oddSum.value = val }

const handleDrawFromCenter = () => {
  if (!gameStore.isHumanTurn || gameStore.turnPhase !== 'draw') return
  const tile = gameStore.drawFromCenter()
  if (tile) {
    const playerTiles = gameStore.players[0].tiles
    const emptyIdx = playerTiles.findIndex(t => t.number === null)
    if (emptyIdx !== -1) playerTiles[emptyIdx] = tile
    gameStore.turnPhase = 'play'
  }
}

const handleDiscardTile = (slotIndex, tile) => {
  if (!gameStore.isHumanTurn || gameStore.turnPhase === 'draw') return
  gameStore.discardPile.push({ ...tile })
  // Preserve _tid so PlayerRack's key stays stable after watch re-sync
  gameStore.players[0].tiles[slotIndex] = { number: null, color: null, _tid: tile._tid }
  gameStore.nextTurn()
}

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timer.value > 0) timer.value--
    else timer.value = 300
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style>
/* ====================================
   GAME AREA - Dark teal Zynga board
   ==================================== */
.game-area {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(0,180,200,0.12) 0%, transparent 60%),
    linear-gradient(180deg, #0a2535 0%, #08192a 40%, #061422 100%);
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
  position: relative;
}

/* Subtle teal grid overlay (Zynga board feel) */
.game-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,180,200,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,180,200,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

/* ====================================
   TOP BAR
   ==================================== */
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 100%);
  border-bottom: 1px solid rgba(0,200,230,0.1);
  flex-shrink: 0;
  gap: 8px;
}

.top-left, .top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.top-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.top-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
}

.coin-badge { border-color: rgba(232,192,32,0.3); }

.badge-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.badge-icon-sm {
  width: 16px;
  height: 16px;
  color: rgba(255,255,255,0.6);
}

.badge-val {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.timer-badge { border-color: rgba(255,255,255,0.15); }
.timer-urgent { border-color: rgba(239,68,68,0.5) !important; animation: timer-pulse 0.5s ease-in-out infinite; }
@keyframes timer-pulse {
  0%, 100% { background: rgba(0,0,0,0.5); }
  50% { background: rgba(200,0,0,0.25); }
}

.top-player-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px 0 6px;
  border-radius: 18px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.12);
  color: white;
}

.top-player-name {
  font-size: 13px;
  font-weight: 600;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gift-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.15s ease;
}
.gift-btn:hover {
  background: rgba(255,255,255,0.15);
  color: white;
}

.tile-count-badge {
  background: #1a3a60;
  color: white;
  font-size: 12px;
  font-weight: 700;
  min-width: 28px;
  height: 28px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 1px solid rgba(0,180,230,0.3);
}

.btn-buy {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2d9e3a 0%, #1a7028 100%);
  border: 1px solid rgba(0,255,0,0.2);
  color: white;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0,100,0,0.3);
}
.btn-buy:hover {
  background: linear-gradient(135deg, #38b845 0%, #226633 100%);
  box-shadow: 0 3px 12px rgba(0,150,0,0.4);
}

/* ====================================
   GAME BODY (board + side players)
   ==================================== */
.game-body {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
  padding: 6px 6px 2px;
  gap: 4px;
}

.side-player-panel {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.board-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: stretch;
}

/* ====================================
   PLAYER LABEL BAR
   ==================================== */
.player-label-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 12px;
  background: linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%);
  flex-shrink: 0;
}

.player-label-name {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.player-label-coins {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #fbbf24;
}

.turn-indicator {
  flex-shrink: 0;
}

.draw-tile-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  padding: 4px 12px;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 60%, #fbbf24 100%);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(217,119,6,0.6);
  animation: pulse-gentle 1.2s ease-in-out infinite;
}

.dtb-label {
  font-size: 12px;
  font-weight: 800;
  color: #1a0a00;
  letter-spacing: 0.5px;
}

.dtb-count {
  font-size: 11px;
  font-weight: 700;
  color: #1a0a00;
  background: rgba(0,0,0,0.18);
  border-radius: 10px;
  padding: 1px 6px;
}

.remaining-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 2px 8px;
}

.turn-text {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
}

.turn-draw {
  background: rgba(234,179,8,0.2);
  color: #fbbf24;
  border: 1px solid rgba(234,179,8,0.3);
  animation: pulse-gentle 1.5s ease-in-out infinite;
}

.turn-play {
  background: rgba(34,197,94,0.2);
  color: #4ade80;
  border: 1px solid rgba(34,197,94,0.3);
}

.turn-wait {
  color: rgba(255,255,255,0.4);
  font-weight: 400;
}

@keyframes pulse-gentle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* ====================================
   RACK SECTION
   ==================================== */
.rack-section {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  padding: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%);
  border-top: 1px solid rgba(0,200,230,0.08);
}

/* ====================================
   RESPONSIVE
   ==================================== */
@media (max-width: 1024px) {
  .side-player-panel { width: 56px; }
}

@media (max-width: 768px) {
  .top-bar { padding: 4px 8px; }
  .top-player-name { max-width: 80px; }
  .side-player-panel { width: 40px; }
  .player-label-name { font-size: 12px; }
}

@media (max-width: 480px) {
  .tile-count-badge { display: none; }
  .btn-buy span { display: none; }
  .side-player-panel { display: none; }
}
</style>

