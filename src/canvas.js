import React, { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';

const Canvas = ({
  setScene,
  setGrid,
  setMeshes,
  isPaused,
  stepInterval,
  bytebeatT,
  audioCtx,
  bytebeatGain
}) => {
  const canvasRef = useRef(null);
  const size = 16;
  let grid = new Array(size).fill().map(() => new Array(size).fill().map(() => new Array(size).fill(0)));
  let nextGrid = new Array(size).fill().map(() => new Array(size).fill().map(() => new Array(size).fill(0)));
  let meshes = [];
  let stepCount = 0;
  let lastStepTime = performance.now();
  let bytebeatPhase = 0;
  let midiMessageCount = 0;
  let lastMidiTime = performance.now();

  // Platonic Polyhedra
  const polyhedra = {
    tetrahedron: BABYLON.MeshBuilder.CreatePolyhedron("tetra", { type: 0, size: 0.4 }, null),
    cube: BABYLON.MeshBuilder.CreateBox("cube", { size: 0.8 }, null),
    octahedron: BABYLON.MeshBuilder.CreatePolyhedron("octa", { type: 1, size: 0.5 }, null),
    dodecahedron: BABYLON.MeshBuilder.CreatePolyhedron("dodeca", { type: 2, size: 0.6 }, null),
    icosahedron: BABYLON.MeshBuilder.CreatePolyhedron("icosa", { type: 3, size: 0.6 }, null)
  };

  // Color Palette (Six-Note Pentatonic-Inspired)
  const colorPalette = [
    BABYLON.Color3.FromHexString('#00CED1'), // Cyan (C)
    BABYLON.Color3.FromHexString('#191970'), // Navy (Eb)
    BABYLON.Color3.FromHexString('#9932CC'), // Purple (F)
    BABYLON.Color3.FromHexString('#FFA500'), // Orange (F#)
    BABYLON.Color3.FromHexString('#008080'), // Teal (G)
    BABYLON.Color3.FromHexString('#C71585')  // Magenta (Bb)
  ];

  // Materials
  const materials = new Array(32).fill().map((_, i) => {
    const mat = new BABYLON.StandardMaterial(`mat_${i}`, null);
    const t = i / 31;
    const idx1 = Math.floor(t * 5); // 6 colors, 0-5
    const idx2 = Math.min(5, idx1 + 1);
    const frac = (t * 5) % 1;
    mat.diffuseColor = BABYLON.Color3.Lerp(colorPalette[idx1], colorPalette[idx2], frac);
    mat.emissiveColor = mat.diffuseColor.scale(0.5);
    return mat;
  });

  // Six-Note Pentatonic Blues Scale
  const pentatonicNotes = [60, 63, 65, 66, 67, 70]; // C4, Eb4, F4, F#4, G4, Bb4
  const playPentatonicNote = (state) => {
    const note = pentatonicNotes[state % 6];
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440 * Math.pow(2, (note - 69) / 12), audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  };

  // Bytebeat
  const bytebeat = (t, state) => ((t * state >> 8) ^ (t >> 4)) & 255;

  // Encryption (Steganography)
  const encryptData = async (data, key) => {
    const enc = new TextEncoder();
    const keyData = enc.encode(key.padEnd(32, '0').slice(0, 32));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      enc.encode(data)
    );
    return { iv, encrypted: new Uint8Array(encrypted) };
  };

  const embedInGrid = async (data, key) => {
    const { iv, encrypted } = await encryptData(data, key);
    const bits = [...iv, ...encrypted].map(byte => byte % 2);
    for (let i = 0; i < bits.length && i < size * size * size; i++) {
      const x = Math.floor(i / (size * size));
      const y = Math.floor((i % (size * size)) / size);
      const z = i % size;
      grid[x][y][z] = bits[i] ? Math.min(31, grid[x][y][z] + 1) : Math.max(0, grid[x][y][z] - 1);
    }
    initializeGrid(scene);
  };

  // CA Functions
  const countNeighbors = (x, y, z) => {
    let sum = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          const nx = x + dx, ny = y + dy, nz = z + dz;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size && nz >= 0 && nz < size) {
            sum += grid[nx][ny][nz];
          }
        }
      }
    }
    return sum;
  };

  const computeDensity = () => {
    let total = 0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          total += grid[x][y][z];
        }
      }
    }
    return total / (size * size * size * 31);
  };

  const initializeGrid = (scene) => {
    meshes.forEach(mesh => mesh.dispose());
    meshes = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const state = grid[x][y][z];
          const type = state <= 6 ? "tetrahedron" : state <= 12 ? "cube" : state <= 18 ? "octahedron" : state <= 24 ? "dodecahedron" : "icosahedron";
          const instance = polyhedra[type].createInstance(`cell_${x}_${y}_${z}`);
          instance.position = new BABYLON.Vector3(x, y, z);
          instance.scaling = new BABYLON.Vector3(1 + state / 32, 1 + state / 32, 1 + state / 32);
          instance.material = materials[state];
          BABYLON.Animation.CreateAndStartAnimation(
            `glow_${x}_${y}_${z}`,
            instance.material,
            'emissiveColor',
            30,
            30,
            instance.material.emissiveColor,
            instance.material.emissiveColor.scale(1.5),
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
          );
          meshes.push(instance);
        }
      }
    }
    setMeshes(meshes);
  };

  const step = () => {
    if (isPaused) return;
    const now = performance.now();
    if (now - lastStepTime < stepInterval) return;
    lastStepTime = now;

    const density = stepCount % 10 === 0 ? computeDensity() : null;
    const noteInfluence = (pentatonicNotes[stepCount % 6] / 440) * (bytebeatT / 500); // Six-note scale
    const normalizedSumMax = 31 * 26;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const neighborSum = countNeighbors(x, y, z);
          const normalizedSum = neighborSum / normalizedSumMax;
          const threshold = 100 / (1 + Math.exp(-10 * (normalizedSum - noteInfluence)));
          const current = grid[x][y][z];
          let next = current;
          if (threshold > 50) {
            next = Math.min(31, current + 1);
          } else if (threshold < 20) {
            next = Math.max(0, current - 1);
          }
          nextGrid[x][y][z] = next;

          if (next > current) {
            playPentatonicNote(next);
            const sample = bytebeat(bytebeatPhase++, next);
            const source = audioCtx.createBufferSource();
            const buffer = audioCtx.createBuffer(1, 1, 44100);
            buffer.getChannelData(0)[0] = sample / 255;
            source.buffer = buffer;
            source.connect(bytebeatGain);
            source.start();
          }
        }
      }
    }

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          grid[x][y][z] = nextGrid[x][y][z];
          const mesh = meshes[x * size * size + y * size + z];
          const state = grid[x][y][z];
          const type = state <= 6 ? "tetrahedron" : state <= 12 ? "cube" : state <= 18 ? "octahedron" : state <= 24 ? "dodecahedron" : "icosahedron";
          if (mesh.name !== `cell_${x}_${y}_${z}_${type}`) {
            mesh.dispose();
            const instance = polyhedra[type].createInstance(`cell_${x}_${y}_${z}_${type}`);
            instance.position = new BABYLON.Vector3(x, y, z);
            instance.scaling = new BABYLON.Vector3(1 + state / 32, 1 + state / 32, 1 + state / 32);
            instance.material = materials[state];
            meshes[x * size * size + y * size + z] = instance;
          } else {
            mesh.material = materials[state];
            mesh.scaling = new BABYLON.Vector3(1 + state / 32, 1 + state / 32, 1 + state / 32);
          }
        }
      }
    }

    setGrid([...grid]);
    setMeshes([...meshes]);
    stepCount++;
  };

  // MIDI Hook with Rate-Limiting
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(midi => {
        midi.inputs.forEach(input => {
          input.onmidimessage = msg => {
            const now = performance.now();
            if (now - lastMidiTime < 100 && midiMessageCount > 10) return; // Rate-limit
            midiMessageCount++;
            if (now - lastMidiTime >= 1000) {
              midiMessageCount = 0;
              lastMidiTime = now;
            }
            if (msg.data[0] === 176 && msg.data[1] >= 0 && msg.data[1] <= 127) { // CC
              const newT = 100 + msg.data[2] * 10;
              setBytebeatT(newT);
            } else if (msg.data[0] === 144 && msg.data[1] >= 0 && msg.data[1] <= 127 && msg.data[2] > 0) { // Note on
              const x = Math.floor(Math.random() * size);
              const y = Math.floor(Math.random() * size);
              const z = Math.floor(Math.random() * size);
              grid[x][y][z] = Math.min(31, grid[x][y][z] + 1);
              playPentatonicNote(grid[x][y][z]);
              initializeGrid(scene);
              embedInGrid("Secret message", "mykey");
            }
          };
        });
      }).catch(err => console.log("MIDI access denied:", err));
    }
  }, [scene]);

  // Babylon.js Setup
  useEffect(() => {
    const engine = new BABYLON.Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1);

    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 30, new BABYLON.Vector3(8, 8, 8), scene);
    camera.attachControl(canvasRef.current, true, true, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;
    camera.pinchPrecision = 100;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    Object.values(polyhedra).forEach(mesh => { mesh.isVisible = false; scene.addMesh(mesh); });
    materials.forEach(mat => { mat.scene = scene; });

    initializeGrid(scene);
    setScene(scene);
    setGrid([...grid]);

    scene.registerBeforeRender(() => {
      step();
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '80vh' }} />;
};

export default Canvas;