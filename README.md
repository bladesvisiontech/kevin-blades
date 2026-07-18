# KEVIN BLADES — Sitio parallax

Sitio web de una sola página, estilo cinematográfico/parallax (inspirado en thewatch.60fps.fr),
para la barbería **Kevin Blades** (@blades_kevin · Houston, TX).

## Cómo verlo en local
Ábrelo con un servidor (los videos no cargan con `file://`):

```bash
cd "website"
python3 -m http.server 8899
# abre http://localhost:8899
```

## Estructura
- `index.html` — marcado de todas las secciones
- `css/style.css` — estilos + microinteracciones
- `js/main.js` — GSAP ScrollTrigger (parallax, pin, contadores, cursor, audio)
- `js/vendor/` — GSAP y ScrollTrigger locales (sin CDN)
- `media/video/` — reels comprimidos para web (de ~12 GB a ~59 MB)
- `media/img/` · `media/poster/` — fotos y miniaturas optimizadas
- `media/audio/beat.mp3` — pista de fondo (ver nota abajo)
- `assets/` — originales sin tocar (referencia)

## Secciones
Hero en video · Marquee · Manifiesto · Feed @blades_kevin (scroll horizontal) ·
Estadísticas · Galería con parallax · Showreel · Visítanos/CTA · Footer.

## ⚠️ Música de fondo — IMPORTANTE
Pediste rap tipo **Wu-Tang Clan**. No puedo incluir música con derechos de autor
(Wu-Tang u otra) porque publicarla sería infracción de copyright.

Ahora mismo `media/audio/beat.mp3` es un **placeholder temporal** (el audio de
`variosvideos.MP3`). El reproductor ya está 100% funcional. Para tener el beat real,
reemplaza ese archivo por una pista **libre de derechos** (boom-bap / East Coast), p. ej.:
- Pixabay Music, Uppbeat, o Bensound (buscar "boom bap", "east coast hip hop")
- Un beat propio o licenciado

Solo tienes que guardar tu pista como `media/audio/beat.mp3` (mismo nombre) y listo.

## Notas
- `assets/episodio 2.mp4` (5,2 GB, 17 min) se dejó fuera del sitio por peso.
- El reproductor de música arranca al primer clic/scroll (política de autoplay del navegador)
  y se controla con el botón **SOUND** de la barra.
