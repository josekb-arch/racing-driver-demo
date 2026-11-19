# racing-driver-demo

Static motion-design demo of a racing driver site for a **fictional driver, Rowan Vale**.
It reproduces the structure, layout, colour system and scroll rhythm studied from a reference video, with original content:
generated photoreal images of a fictional person, fictional sponsors, free fonts and no third-party assets.

Stack: HTML/CSS/JS, GSAP 3 + ScrollTrigger + SplitText and Lenis (all vendored in `vendor/`). No build step.
Fallbacks: `prefers-reduced-motion` (static final states, native scroll) and no-JS.

Hero: `hero-gl.js` is loaded lazily after the intro. It renders a metaball trail (half-res ping-pong framebuffer) that reveals
the helmet through a gooey threshold, refracts the image along the edge and adds depth-map parallax. Without WebGL (or if the
script fails) the same trail is drawn on a 2D canvas.

Pages: `index.html`, plus simple demo pages `calendar.html`, `store.html` and `legal.html`. Social profiles are placeholders
(`aria-disabled`), business enquiries use a reserved `.example` address.
