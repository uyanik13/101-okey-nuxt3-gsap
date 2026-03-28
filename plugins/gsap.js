import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { Observer } from 'gsap/Observer'
import { Flip } from 'gsap/Flip'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(Observer, ScrollTrigger)

  if (process.client) {
    gsap.registerPlugin(Draggable, Flip)
  }

  return {
    provide: {
      gsap,
      Observer,
      ScrollTrigger,
      Draggable,
      Flip
    }
  }
})