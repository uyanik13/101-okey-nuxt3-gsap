import { defineStore } from 'pinia'

interface TileData {
  number: number | null
  color: string | null
  isJoker?: boolean
  _tid?: number          // stable unique tile identity for animation tracking
}

interface Player {
  id: number
  name: string
  tiles: TileData[]
  isCurrentPlayer: boolean
  isHuman: boolean
}

interface GameState {
  players: Player[]
  centerPile: TileData[]
  discardPile: TileData[]
  indicatorTile: TileData | null
  jokerTile: TileData | null
  currentPlayerIndex: number
  gameStarted: boolean
  turnPhase: 'draw' | 'play' | 'discard'
}

const COLORS = ['red', 'blue', 'black', 'orange']
const MAX_NUMBER = 13

// Module-level counter — survives across initGame() calls so IDs are always unique
let _tidGen = 0
const nextTid = () => ++_tidGen
const NUM_PLAYERS = 4
const TILES_PER_PLAYER = 21
const FIRST_PLAYER_TILES = 22 // First player gets 22 tiles
const RACK_SIZE = 32 // Total rack slots (2 rows of 16)

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    players: [],
    centerPile: [],
    discardPile: [],
    indicatorTile: null,
    jokerTile: null,
    currentPlayerIndex: 0,
    gameStarted: false,
    turnPhase: 'draw',
  }),

  getters: {
    currentPlayer: (state) => state.players[state.currentPlayerIndex],
    humanPlayer: (state) => state.players.find(p => p.isHuman),
    isHumanTurn: (state) => state.players[state.currentPlayerIndex]?.isHuman ?? false,
    remainingTiles: (state) => state.centerPile.length,
  },

  actions: {
    createTileSet(): TileData[] {
      const tiles: TileData[] = []
      // 4 colors x 13 numbers x 2 copies = 104 tiles
      COLORS.forEach((color) => {
        for (let number = 1; number <= MAX_NUMBER; number++) {
          tiles.push({ number, color, isJoker: false, _tid: nextTid() })
          tiles.push({ number, color, isJoker: false, _tid: nextTid() })
        }
      })
      // 2 joker (sahte okey) tiles
      tiles.push({ number: 0, color: 'red', isJoker: true, _tid: nextTid() })
      tiles.push({ number: 0, color: 'black', isJoker: true, _tid: nextTid() })
      return tiles // Total: 106 tiles
    },

    shuffle(array: TileData[]): TileData[] {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },

    determineIndicatorAndJoker(tiles: TileData[]) {
      // Pick a random non-joker tile as indicator
      const nonJokerTiles = tiles.filter(t => !t.isJoker)
      const randomIdx = Math.floor(Math.random() * nonJokerTiles.length)
      const indicator = nonJokerTiles[randomIdx]
      this.indicatorTile = { ...indicator }

      // Joker is the tile with same color, number + 1 (wraps 13 -> 1)
      const jokerNumber = indicator.number === MAX_NUMBER ? 1 : (indicator.number ?? 0) + 1
      this.jokerTile = { number: jokerNumber, color: indicator.color, isJoker: false }

      // Remove indicator from pile
      const indicatorIdx = tiles.findIndex(t =>
        t.number === indicator.number && t.color === indicator.color && !t.isJoker
      )
      if (indicatorIdx > -1) {
        tiles.splice(indicatorIdx, 1)
      }
    },

    padTilesForRack(tiles: TileData[]): TileData[] {
      const padded = [...tiles]
      while (padded.length < RACK_SIZE) {
        padded.push({ number: null, color: null, _tid: nextTid() })
      }
      return padded
    },

    initGame(playerNames: string[] = ['Sen', 'Oyuncu 2', 'Oyuncu 3', 'Oyuncu 4']) {
      const allTiles = this.createTileSet()
      const shuffled = this.shuffle(allTiles)

      this.determineIndicatorAndJoker(shuffled)

      this.players = []
      for (let i = 0; i < NUM_PLAYERS; i++) {
        const numTiles = i === 0 ? FIRST_PLAYER_TILES : TILES_PER_PLAYER
        const playerTiles = shuffled.splice(0, numTiles)
        this.players.push({
          id: i,
          name: playerNames[i] || `Oyuncu ${i + 1}`,
          tiles: this.padTilesForRack(playerTiles),
          isCurrentPlayer: i === 0,
          isHuman: i === 0,
        })
      }

      // Remaining tiles go to center pile
      this.centerPile = shuffled
      this.discardPile = []
      this.currentPlayerIndex = 0
      this.turnPhase = 'play' // First player already has 22 tiles, so play/discard
      this.gameStarted = true
    },

    drawFromCenter() {
      if (this.centerPile.length === 0) return null
      const tile = this.centerPile.pop()!
      return tile
    },

    drawFromDiscard() {
      if (this.discardPile.length === 0) return null
      const tile = this.discardPile.pop()!
      return tile
    },

    discardTile(playerIndex: number, tileIndex: number) {
      const player = this.players[playerIndex]
      const tile = player.tiles[tileIndex]
      if (!tile || tile.number === null) return

      this.discardPile.push({ ...tile })
      player.tiles[tileIndex] = { number: null, color: null }
      this.nextTurn()
    },

    nextTurn() {
      this.players[this.currentPlayerIndex].isCurrentPlayer = false
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % NUM_PLAYERS
      this.players[this.currentPlayerIndex].isCurrentPlayer = true
      this.turnPhase = 'draw'
    },

    isJokerTile(tile: TileData): boolean {
      if (tile.isJoker) return true
      if (!this.jokerTile) return false
      return tile.number === this.jokerTile.number && tile.color === this.jokerTile.color
    },
  },
})
