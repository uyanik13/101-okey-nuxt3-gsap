// plugins/image-parallax.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin({
    // created() {
    //   if (process.client) {
    //     const isTouchDevice =
    //       'ontouchstart' in window ||
    //       navigator.maxTouchPoints > 0 ||
    //       navigator.msMaxTouchPoints > 0

    //     if (!isTouchDevice) {
    //       const parallax = (e) => {
    //         const images = document.querySelectorAll('.parallax-image')
    //         console.log(images)
    //         for (const image of images) {
    //           const speed = parseInt(image.getAttribute('data-speed'))
    //           const x = (window.innerWidth - e.pageX * speed) / 100
    //           const y = (window.innerHeight - e.pageY * speed) / 100
    //           image.style.transform = `translateX(${x}px) translateY(${y}px)`
    //         }
    //       }

    //       onBeforeMount(() => {
    //         window.addEventListener('mousemove', parallax)
    //       })

    //       onBeforeUnmount(() => {
    //         window.removeEventListener('mousemove', parallax)
    //       })
    //     }
    //   }
    // },
  })
})
