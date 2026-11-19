# Credits

## Images
All photos in `assets/img/` were **generated for this demo** (AI image generation) and show a **fictional person** ("Rowan Vale")
and fictional, unbranded helmets, suits and objects. They contain no third-party photographs, no real people and no real logos.
- Hero portrait with and without helmet (aligned pair for the cursor reveal; the helmet chin was regenerated in v2 so it carries
  no race number), a generated depth map of the portrait (`hero_depth.webp`, for the WebGL parallax), B&W portrait (message card),
  gallery photos, ON/OFF track images, garage, socials cards and footer portrait.
- 32 Hall of Fame helmets: each one generated as a 2x2 turntable sheet (four angles of the same invented livery) and packed into a
  4-frame sprite (`ht01–ht32.webp`).
- v3: the hero portrait and helmet carry a cut-out alpha (derived from the same generated images), and `hero_depth.webp` stores the
  helmet-shell silhouette in its green channel for the WebGL glass shell. Menu thumbnails (`m_*.webp`) are crops of the demo's own
  photos. The socials centre card loop (`s_neon_loop.webm/.mp4`) is rendered from `s_neon.webp` (push-in + light sweep, ffmpeg).
- Store: the "Line Chaser" hoodie with an RV monogram and the "RV07" collector box are original designs for Rowan Vale.
- Brand-mark clean-up passes (podium, cockpit headrest, pit-lane suit recoloured to lime/black, garage helmet letters) remove any
  logo-like marks or third-party colours.

## Fonts
- **Mona Sans** by GitHub: SIL Open Font License 1.1 (via Google Fonts), `fonts/monasans.woff2`.
- **Instrument Serif** by Instrument: SIL Open Font License 1.1 (via Google Fonts), `fonts/instrumentserif.woff2`. Free stand-in for the commercial display serif of the reference.
- **EMS Allure** single-line script by Sheldon B. Michaels (derivative of Allura by Rob Leuschke / TypeSETit), SIL Open Font License 1.1,
  from the MIT-licensed `hersheytext` package. Used only at build time to produce the centre-line SVG paths of the handwritten
  "ON", "OFF", "Collabs" and the "Rowan Vale" signature, which are drawn stroke by stroke with GSAP. No font file is shipped.

## Graphics
- Topographic background (`assets/topo.svg`, bolder copy `assets/topo-hero.svg` for the hero): generated procedurally for this project (d3-contour, ISC licence, used only at build time).
- Monogram, helmet line icon, signature underline flourish and fictional partner wordmarks: drawn for this project in SVG/CSS.
- Hero liquid reveal (`hero-gl.js`): plain WebGL shaders written for this project (no third-party 3D files or libraries).

## Libraries
- [GSAP](https://gsap.com) 3.15 + ScrollTrigger + SplitText: free "Standard no-charge" GreenSock licence.
- [Lenis](https://github.com/darkroomengineering/lenis) 1.3: MIT License.

## Reference
Motion values (easings, durations, start/end points) follow the team's animation plan, which studied a public website shown in a YouTube Short.
No code, images, fonts, 3D models, Rive files or logos from that website are included or linked.
