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
      <div class="flex flex-col justify-between w-full brightness-125">
        <div
          ref="tilesRef"
          id="tiles"
          class="flex flex-wrap tiles rack-bg border-t-2 border-b-2 border-gray-200 h-42 tiles"
        >
          <div
            ref="tileContainers"
            v-for="(tile, index) in section1Tiles"
            :key="index"
            class="tile-container"
            :data-index="index"
          >
            <Tile :number="tile.number" :color="tile.color" />
          </div>
        </div>

        <div
          class="rack-bg w-full h-2 absolute top-20"
          style="box-shadow: inset 0 0 0 5px rgba(0, 0, 0, 0.2)"
        ></div>
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
import { ref, defineProps, onMounted } from "vue";
import tiles from "@/assets/fixtures/tiles.json";
import Tile from "@/components/Tile.vue";
const { $gsap: gsap, $Draggable: Draggable } = useNuxtApp();

const section1Tiles = ref([
  ...tiles,
  ...Array(11).fill({ number: null, color: null }),
]);

const tileContainers = ref([]);
const tilesRef = ref(null);

const onDrag = (tile, event) => {
  const zone = getZone(tile);
  if (zone && zone !== tile.dataset.zone) {
    gsap.killTweensOf(tile);
  }
};

const onDragStart = (tile) => {
  tile.classList.add("dragging");
};
const onPress = (tile) => {
  gsap.fromTo(tile, { opacity: 1, scale: 1 }, { opacity: 0.75, scale: 0.9, duration: 0.3 });

};
const onDragEnd = (tile, event) => {
  const zone = getZone(tile);
  if (zone && zone !== tile.dataset.zone) {
    changeZone(tile, zone);
    gsap.set(tile, {
      clearProps: "transform",
      zIndex: 1000,
    });
  }
  console.log(tile)
  tile.classList.remove("dragging");
  
  hitTest(tile);
  reorderTiles();
  
};

const getZone = (tile) => {
  const tileRect = tile.getBoundingClientRect();
  const zones = document.querySelectorAll(".tile-container");
  let closestZone = null;
  let closestDistance = Infinity;
  for (const zone of zones) {
    const zoneRect = zone.getBoundingClientRect();
    const zoneCenterX = (zoneRect.left + zoneRect.right) / 2;
    const zoneCenterY = (zoneRect.top + zoneRect.bottom) / 2;
    if (
      tileRect.left < zoneRect.right &&
      tileRect.right > zoneRect.left &&
      tileRect.top < zoneRect.bottom &&
      tileRect.bottom > zoneRect.top &&
      Math.abs(
        tileRect.left + tileRect.right - zoneRect.left - zoneRect.right
      ) < tileRect.width &&
      Math.abs(
        tileRect.top + tileRect.bottom - zoneRect.top - zoneRect.bottom
      ) < tileRect.height &&
      Math.sqrt(
        (tileRect.left - zoneCenterX) ** 2 + (tileRect.top - zoneCenterY) ** 2
      ) < closestDistance
    ) {
      closestZone = zone;
      closestDistance = Math.sqrt(
        (tileRect.left - zoneCenterX) ** 2 + (tileRect.top - zoneCenterY) ** 2
      );
    }
  }
  return closestZone;
};

const changeZone = (tile, zone) => {
  while (zone.firstChild) {
    zone.removeChild(zone.firstChild);
  }
  zone.appendChild(tile);
};

const reorderTiles = () => {
  const containers = document.querySelectorAll(".tile-container");
  containers.forEach((container) => {
    const tiles = Array.from(container.children).sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return aRect.left - bRect.left;
    });
    tiles.forEach((tile) => container.appendChild(tile));
  });
};

const hitTest = (tile) => {
  const containers = tileContainers.value;
  containers.forEach((container) => {
    const rect1 = tile.getBoundingClientRect();
    const rect2 = container.getBoundingClientRect();
    const intersection =
      Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left);
    const ratio = intersection / rect1.width;
    if (ratio > 0.5) {
      container.classList.add("highlight");
    } else {
      container.classList.remove("highlight");
    }
  });
};

const onClick = (tile) => {
  //
};

onMounted(() => {
  const tiles = tilesRef.value.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    Draggable.create(tile, {
      bounds: ".game-area",
      type: "x,y",
      dragResistance: 0,
      activeCursor: "grabbing",
      onDrag: onDrag.bind(this, tile),
      onClick: onClick.bind(this),
      onDragEnd: onDragEnd.bind(this, tile),
      onDragStart: onDragStart.bind(this, tile),
      onPress: onPress.bind(this, tile),
    });
  });

  // get the tile containers using refs
  tileContainers.value = Array.from(tileContainers.value);
});
</script>

