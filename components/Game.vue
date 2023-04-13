<template>
    <div id="game-area" class="blue-image min-h-screen p-10">
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
        <div class="tile-left-top">
          <Tile :number="8" :color="'red'" />
        </div>
      </div>
  
      <!--PLAYER HAND - RACK -->
      <div class="flex justify-between flex-col items-center h-48">
        <div
          class="w-48 h-HorizontalPlayer12 rounded-md p-2 border-2 border-gray-800 bg-black opacity-75 text-white"
        >
          <horizontal-player />
        </div>
        <div class="rack-width">
          <PlayerRack :playerName="'Ogur'" :tiles="playerTiles" />
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { shuffle } from "lodash";
  import HorizontalPlayer from "~~/components/HorizontalPlayer.vue";
  
  const colors = ["red", "blue", "black", "orange"];
  const tiles = [];
  
  for (let i = 0; i < colors.length; i++) {
    for (let j = 1; j <= 13; j++) {
      tiles.push({ number: j, color: colors[i] });
      tiles.push({ number: j, color: colors[i] });
    }
  }
  
  const shuffledTiles = shuffle(tiles);
  const playerTiles = shuffledTiles.slice(0, 21);
  </script>
  
  <style>
  .blue-image {
    background-image: url("/images/bg-blue.png");
    background-size: cover;
    background-position: center;
  }
  .rack-width{
    width: 930px;
  }
  </style>