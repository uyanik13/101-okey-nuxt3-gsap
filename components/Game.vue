<template>
  <div id="game-area" class="game-area blue-image min-h-screen p-10">
    <!--TOP SECTION -->
    <div class="top h-24 flex justify-between">
      <div class="h-8 flex space-x-2">
        <div
          class="flex space-x-2 h-12 rounded-md p-2 border-2 border-gray-800 bg-black opacity-75 text-white"
        >
          <img class="w-7 h-7" src="/images/icons/gold-bars.png" alt="" />
          <span>4000</span>
        </div>
        <div
          class="flex space-x-2 h-12 rounded-md p-2 border-2 border-gray-800 bg-black opacity-75 text-white"
        >
          <img class="w-5 h-5" src="/images/icons/giftbox.png" alt="" />
          <span>41:19</span>
        </div>
      </div>
      <div
        class="h-12 rounded-md p-2 border-2 border-gray-800 bg-black opacity-75 text-white"
      >
        <horizontal-player />
      </div>
      <div class="h-10 flex space-x-2">
        <button class="flex space-x-2 bg-[#32cd32] rounded-lg p-2 text-white">
          <img class="w-7 h-7" src="/images/icons/gold-bars.png" alt="" />
          <span>SATIN AL</span>
        </button>
        <button class="flex space-x-2 bg-green-500 rounded-lg p-2 text-white">
          <Icon size="24" name="ic:sharp-wechat" />
        </button>
        <button class="flex space-x-2 bg-green-500 rounded-lg p-2 text-white">
          <Icon size="24" name="ic:baseline-keyboard-arrow-down" />
        </button>
      </div>
    </div>

    <!-- TOP TILES-->
    <div class="flex justify-between mx-12">
      <div class="tile-left-top">
        <Tile :number="13" :color="'orange'" />
      </div>
      <div class="tile-left-top">
        <Tile :number="8" :color="'black'" />
      </div>
    </div>

    <!--MIDDLE SECTION -->
    <div class="flex justify-between">
      <!--PLAYER LEFT -->
      <div id="player-left">
        <vertical-player />
      </div>
      <div id="board" class="flex w-full justify-center">
        <board />
      </div>
      <!--PLAYER RIGHT -->
      <div id="player-right">
        <vertical-player />
      </div>
    </div>

    <!-- BOTTOM TILES-->
    <div class="flex justify-between mx-12">
      <div class="tile-left-top">
        <Tile :number="8" :color="'red'" />
      </div>
      <div class="tile-right-top">
        <div ref="rightTileDropArea" class="relative w-14 h-20 inner-shadow rounded-lg">
          <div class="absolute inset-0 opacity-75 bg-gray-800 rounded-lg "></div>
          <div class="relative z-10 bg-white rounded-lg shadow"></div>
        </div>
      </div>
    </div>

    <!--PLAYER HAND - RACK -->
    <div class="flex justify-between flex-col items-center h-48">
      <div class="flex">
        <div
          class="w-48 rounded-md p-2 border-2 border-gray-800 bg-black opacity-75 text-white"
        >
          <horizontal-player />
          <div
            class="absolute w-16 h-6 p-3 right-40 bottom-16 bg-indigo-800 border-1 border-white text-white rounded-full flex items-center justify-center"
          >
            {{ oddSum }}
          </div>
        </div>
      </div>
      <div class="rack-width">
        <PlayerRack
          @updateOddSum="updateOddSum"
          :playerName="'Ogur'"
          :tiles="playersTiles[0]"
        />
      </div>
    </div>
  </div>
</template>
  <script setup>
import HorizontalPlayer from "~~/components/HorizontalPlayer.vue";
const { $gsap: gsap, $Draggable: Draggable } = useNuxtApp();
const colors = ["red", "blue", "black", "orange"];
const maxNumber = 13;
const numPlayers = 1;
const tilesPerPlayer = 21;

const rightTileDropArea = ref(null);
const oddSum = ref(0);

const updateOddSum = (data) => {
  oddSum.value = data;
};

function createTileSet(colors, maxNumber) {
  let tiles = [];

  colors.forEach((color) => {
    for (let number = 1; number <= maxNumber; number++) {
      tiles.push({ number, color });
      tiles.push({ number, color });
    }
  });

  return tiles;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function dealTiles(tiles, numPlayers, tilesPerPlayer) {
  const shuffledTiles = shuffle(tiles);
  const playersTiles = [];

  for (let i = 0; i < numPlayers; i++) {
    playersTiles.push(shuffledTiles.splice(0, tilesPerPlayer));
  }

  return playersTiles;
}

const tiles = createTileSet(colors, maxNumber);
const playersTiles = dealTiles(tiles, numPlayers, tilesPerPlayer);

const onDragEnd = (event) => {
  console.log(event);
};

onMounted(() => {
  Draggable.create(rightTileDropArea.value, {
      bounds: rightTileDropArea.value,
      type: "x,y",
      dragResistance: 0,
      activeCursor: "grabbing",
      onDragEnd: onDragEnd.bind(this),
    });
});
</script>
  
  <style>
.blue-image {
  background-image: url("/images/bg-blue.png");
  background-size: cover;
  background-position: center;
}
.rack-width {
  width: 930px;
}
</style>