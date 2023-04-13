<template>
    <div class="dark-board-area justify-center opacity-50 w-6/12">
          <div class="border-r-2 border-white"></div>
        </div>
        <div class="flex rounded-md flex-col space-y-1 w-1/12 mx-4">
          <div class="dark-area">
            <span>Tek</span>
          </div>
          <div class="dark-area">
            <span>Yardimsiz</span>
          </div>
          <div class="dark-area bg-green-500">
            <span>Katlamali</span>
          </div>
          <div class="dark-area">
            <span>1 El</span>
          </div>
          <div class="flex justify-center py-2">
            <Tile :number="12" :color="'red'" />
          </div>
          <div class="flex justify-center py-4">
            <Tile :number="9" :color="'blue'" />
          </div>
        </div>
        <div class="dark-board-area w-2/12"></div>
</template>