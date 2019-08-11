// Conversions to and from frequencies based on technique used at
// https://www.johndcook.com/music_hertz_bark.html

// Lookup arrays for note names.
const keysSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const keysFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Lookup table for steps, used to convert a key (e.g. `F#5`) to a frequency.
const steps = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11
}

const a4 = 440;

/**
 * Options for parsing audio data.
 * @typedef {Object} AnalyseAudioDataOptions
 * @property {number} a4 Frequency of A4. Defaults to `440`.
 * @property {number} sampleRate Sample rate of the audio data.
 * @property {Float32Array} audioData The audio data to analyse.
 * @property {string} accidentals Whether to use sharps or flats. Defaults to `flats`.
 */

/**
 * Analyses audio data to extract pitch and other details. Returns null if audio
 * data could not be parsed.
 * @param {AnalyseAudioDataOptions} options Options for parsing.
 */
function analyseAudioData (sampleRate, audioData, accidentals = 'sharps') {
  const frequency = YINDetector(audioData, sampleRate);
  if (frequency === null) {
    return null
  }

  // Convert the frequency to a musical pitch.

  /* eslint-disable capitalized-comments */
  // c = a(2^-4.75)
  const c0 = a4 * Math.pow(2.0, -4.75)
  // h = round(12log2(f / c))
  const halfStepsBelowMiddleC = Math.round(12.0 * Math.log2(frequency / c0))
  // o = floor(h / 12)
  const octave = Math.floor(halfStepsBelowMiddleC / 12.0)
  const keys = accidentals === 'flats' ? keysFlat : keysSharp
  const key = keys[Math.floor(halfStepsBelowMiddleC % 12)]

  // Obtain the correct frequency, in hertz, of the pitch the audio is at,
  // and then use that value determine how many cents the audio is off by.

  // z = fround(c * 2^((s + 12o) / 12))
  const correctHz = Math.fround(c0 * Math.pow(2.0, (steps[key] + (12 * octave)) / 12.0))
  // w = 1200log2(f / z)
  const centsOff = 1200 * Math.log2(frequency / correctHz)
  /* eslint-enable capitalized-comments */
  return {frequency, octave, key, correctHz, centsOff}
}

function noteToFrequency(key, octave) {
  return Math.fround(c0 * Math.pow(2.0, (steps[key] + (12 * octave)) / 12.0));
}

function playNote(key, octave) {
    let oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(466.16, audioContext.currentTime);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2);
}
