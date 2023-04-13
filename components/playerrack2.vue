<template>
    <div class="brightness-110">
      <div class="flex justify-between">
        <div class="flex flex-col">
          <div class="table-side items-center rounded-tl-lg">
            <span class="bg-black rounded-full w-1 h-1"></span>
          </div>
          <div
            class="bg-gradient-to-tl from-gray-100 to-gray-500 h-2 shadow-xl"
          ></div>
          <div class="table-side items-center">
            <span class="bg-black rounded-full w-1 h-1"></span>
          </div>
        </div>
        <!--CONTENT SECTION START -->
        <div
          id="content"
          class="flex flex-col justify-between w-full brightness-125"
        >
          <div
            class="flex tiles rack-bg border-t-2 border-gray-200 h-20 tiles"
            ref="section1Ref"
            @mousemove="onMouseMove($event)"
          >
            <Tile
              v-for="(tile, index) in section1Tiles"
              :key="index"
              :number="tile.number"
              :color="tile.color"
              @mousedown="onMouseDown($event, index, 'section1')"
              @mouseup="onMouseUp($event, 'section1')"
              draggable="true"
              :class="{ dragging: draggedTile === index }"
              @dragstart.prevent
            />
          </div>
          <div
            class="rack-bg w-full h-2"
            style="box-shadow: inset 0 0 0 5px rgba(0, 0, 0, 0.2)"
          ></div>
          <div
            class="flex tiles rack-bg border-b-2 h-20 tiles"
            ref="section2Ref"
            @mousemove="onMouseMove($event)"
          >
            <Tile
              v-for="(tile, index) in section2Tiles"
              :key="index"
              :number="tile.number"
              :color="tile.color"
              @mousedown="onMouseDown($event, index, 'section2')"
              @mouseup="onMouseUp($event, 'section2')"
              draggable="true"
              :class="{ dragging: draggedTile === index }"
              @dragstart.prevent
            />
          </div>
        </div>
        <!--CONTENT SECTION END -->
        <div class="flex flex-col">
          <div class="table-side items-center rounded-tr-lg">
            <span class="bg-black rounded-full w-1 h-1"></span>
          </div>
          <div
            class="bg-gradient-to-tl from-gray-100 to-gray-500 h-2 shadow-xl"
          ></div>
          <div class="table-side items-center">
            <span class="bg-black rounded-full w-1 h-1"></span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import {
    ref,
    computed,
    defineProps,
    watchEffect,
    onMounted,
    onBeforeUnmount,
  } from "vue";
  
  const props = defineProps({
    tiles: Array,
  });
  
  const tiles = computed(() => {
    return props.tiles;
  });
  
  const section1Tiles = ref(props.tiles.slice(0, 16));
  const section2Tiles = ref(props.tiles.slice(16, 21));
  
  const section1Ref = ref(null);
  const section2Ref = ref(null);
  
  let draggedTile = null;
  let offsetX = 0;
  let offsetY = 0;
  
  const onMouseDown = (event, section) => {
    event.preventDefault();
    if (!draggedTile) {
      draggedTile = event.target.closest(".tile");
      offsetX = event.clientX - draggedTile.getBoundingClientRect().left;
      offsetY = event.clientY - draggedTile.getBoundingClientRect().top;
      draggedTile.style.position = "absolute";
      draggedTile.style.zIndex = "1000";
      document.body.appendChild(draggedTile);
      moveAt(event.pageX, event.pageY);
  
      let tilesContainer = null;
      if (section == "section1") {
        section1Ref.value.classList.add("dragging-active");
        tilesContainer = section1Ref.value.querySelector(".tiles");
      } else {
        section2Ref.value.classList.add("dragging-active");
        tilesContainer = section2Ref.value.querySelector(".tiles");
      }
      tilesContainer.style.height = `${tilesContainer.offsetHeight}px`;
    }
  };
  
  const onMouseMove = (event, section) => {
    if (!draggedTile) return;
    moveAt(event.pageX, event.pageY);
  };
  
  
  
  
  const onMouseUp = (event, section) => {
    if (!draggedTile) return;
    draggedTile.style.zIndex = "";
    draggedTile = null;
    if (section == "section1") {
      section1Ref.value.classList.remove("dragging-active");
    } else {
      section2Ref.value.classList.remove("dragging-active");
    }
  };
  
  const moveAt = (pageX, pageY) => {
    if (!draggedTile) return;
    draggedTile.style.left = pageX - offsetX + "px";
    draggedTile.style.top = pageY - offsetY + "px";
  };
  
  const onDragOver = (event) => {
    if (event.target === section1Ref.value || event.target === section2Ref.value ) {
      event.preventDefault();
    }
  };
  
  const onDragEnter = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add("hovered");
  };
  
  const onDragLeave = (event) => {
    event.currentTarget.classList.remove("hovered");
  };
  
  const onDrop = (event) => {
    event.preventDefault();
    const draggedTile = document.querySelector(".tiles .tile.dragging");
    if (
      (draggedTile && event.currentTarget === section1Ref.value) ||
      (draggedTile && event.currentTarget === section2Ref.value)
    ) {
      event.currentTarget.appendChild(draggedTile);
    }
    event.currentTarget.classList.remove("hovered");
    draggedTile.classList.remove("dragging");
  };
  
  onMounted(() => {
    const section1TilePositions =
      section1Ref.value.querySelectorAll(".tile-position");
    const section2TilePositions =
      section2Ref.value.querySelectorAll(".tile-position");
    // Assign a tile to each position
    section1TilePositions.forEach((position, index) => {
      const tile = shuffledTiles[index];
      const tileElement = position.querySelector(".tile");
      tileElement.dataset.number = tile.number;
      tileElement.dataset.color = tile.color;
      tileElement.classList.add(`number-${tile.number}`);
      tileElement.classList.add(`color-${tile.color}`);
    });
    section2TilePositions.forEach((position, index) => {
      const tile = shuffledTiles[index];
      const tileElement = position.querySelector(".tile");
      tileElement.dataset.number = tile.number;
      tileElement.dataset.color = tile.color;
      tileElement.classList.add(`number-${tile.number}`);
      tileElement.classList.add(`color-${tile.color}`);
    });
  });
  
  onBeforeUnmount(() => {
    const section1Rack = section1Ref.value;
    const section2Rack = section2Ref.value;
    section1Rack.removeEventListener("dragover", onDragOver);
    section1Rack.removeEventListener("dragenter", onDragEnter);
    section1Rack.removeEventListener("dragleave", onDragLeave);
    section1Rack.removeEventListener("drop", onDrop);
    section2Rack.removeEventListener("dragover", onDragOver);
    section2Rack.removeEventListener("dragenter", onDragEnter);
    section2Rack.removeEventListener("dragleave", onDragLeave);
    section2Rack.removeEventListener("drop", onDrop);
  });
  </script>
  