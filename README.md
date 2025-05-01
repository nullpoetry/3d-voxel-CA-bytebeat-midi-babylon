# 3d-voxel-CA-bytebeat-midi-babylon
3D cellular automaton (CA) built with Babylon.js and React, rendering a 16x16x16 grid with 5-bit states (0-31). Features a refined recursive Game of Life rule, bytebeat sonification, and MIDI control (Monome Arc, Launchpad Pro), 


# 3D Voxel CA with Bytebeat, MIDI, and Platonic Polygons (React)

A 3D cellular automaton (CA) built with Babylon.js and React, rendering a 16x16x16 grid of platonic polygons (tetrahedron to icosahedron) with 5-bit states (0-31). Features a refined new Game of Life rule, bytebeat sonification, and MIDI control (Monome Arc, Launchpad Pro), optimized for iPad/Pixel 9 Fold. A six-note pentatonic blues scale (C4, Eb4, F4, F#4, G4, Bb4) catalyzes CA evolution and audio, with a vibrant six-color palette and AES-encrypted steganography. Hosted on Replit for instant access. Part of a Monome Maiden successor vision.

## Features
- **React UI**: Dynamic controls for pause, reset, randomize, CA speed, and bytebeat.
- **5-Bit CA**: 32-state grid, mapped to platonic polygons and six-note pentatonic scale.
- **Refined Rule**: Sigmoid-based thresholds, driven by six-note frequencies, ensure smooth evolution.
- **Platonic Polygons**: Tetrahedron (0-6), Cube (7-12), Octahedron (13-18), Dodecahedron (19-24), Icosahedron (25-31).
- **Vibrant Colors**: Six-color palette (cyan, navy, purple, orange, teal, magenta) with glow animations.
- **Bytebeat CA Widget**: 4x4x4 CA drives bytebeat audio, controlled by MIDI/UI.
- **MIDI**: Arc knobs adjust bytebeat; Launchpad toggles cells/notes via Web MIDI API with rate-limiting.
- **Pentatonic Catalyst**: Six-note blues scale (C, Eb, F, F#, G, Bb) modulates CA rules and triggers melodic audio.
- **Security**: AES-CBC steganography, MIDI validation, CA-based entropy widget.
- **Mobile**: Touch controls, 30-60 FPS on iPad/Pixel 9 Fold.

## Demo
Try: [Replit URL (e.g., https://3d-voxel-ca-midi.yourusername.repl.co)](https://replit.com)
- Video: [Insert GIF/video of colorful polygons, MIDI on iPad].

## Setup
1. Clone: `git clone https://github.com/yourusername/3d-voxel-ca-midi.git`
2. Install: `npm install`
3. Build: `npm run build`
4. Run: `npm start`
5. Open: `http://localhost:3000` (Safari/Chrome).
6. Replit: Fork [Replit URL], click "Run".

## Security
- **React**: Escapes outputs, preventing XSS.
- **MIDI**: Validates `msg.data` (0-127), rate-limits (10/sec) to prevent flooding.
- **Encryption**: AES-CBC steganography embeds data in CA grid; entropy widget generates secure nonces.
- **Replit**: HTTPS, CSP header (`default-src 'self'`).
- **Future**: SHA-256 hashing for entropy, SQL backend with prepared statements.

## Future Work
- SuperCollider for advanced sonification.
- SHA-256-enhanced entropy for cryptographic keys.
- Quantum QNode integration for Monome Maiden.

## Contribute
Star, fork, or PR! Suggest MIDI mappings, color schemes, or security widgets.

## License
MIT

---
Created May 1, 2025, by J.Mosij. Inspired by Monome, bytebeat, and cellular security.
