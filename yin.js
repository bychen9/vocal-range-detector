/*
   Copyright (C) 2003-2009 Paul Brossier <piem@aubio.org>
   This file is part of aubio.
   aubio is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   aubio is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU General Public License
   along with aubio.  If not, see <http://www.gnu.org/licenses/>.
 */

/* This algorithm was developed by A. de Cheveigné and H. Kawahara and
 * published in:
 * 
 * de Cheveigné, A., Kawahara, H. (2002) "YIN, a fundamental frequency
 * estimator for speech and music", J. Acoust. Soc. Am. 111, 1917-1930.  
 *
 * see http://recherche.ircam.fr/equipes/pcm/pub/people/cheveign.html
 */

var threshold = 0.10;
var probabilityThreshold = 0.1;

function YINDetector(float32AudioBuffer, sampleRate) {
  // Set buffer size to the highest power of two below the provided buffer's length.

  var bufferSize = void 0;
  for (bufferSize = 1; bufferSize < float32AudioBuffer.length; bufferSize *= 2) {}
  bufferSize /= 2;

  // Set up the yinBuffer as described in step one of the YIN paper.
  var yinBufferLength = bufferSize / 2;
  var yinBuffer = new Float32Array(yinBufferLength);

  var probability = void 0,
      tau = void 0;

  // Compute the difference function as described in step 2 of the YIN paper.
  for (var t = 0; t < yinBufferLength; t++) {
    yinBuffer[t] = 0;
  }
  for (var _t = 1; _t < yinBufferLength; _t++) {
    for (var i = 0; i < yinBufferLength; i++) {
      var delta = float32AudioBuffer[i] - float32AudioBuffer[i + _t];
      yinBuffer[_t] += delta * delta;
    }
  }

  // Compute the cumulative mean normalized difference as described in step 3 of the paper.
  yinBuffer[0] = 1;
  yinBuffer[1] = 1;
  var runningSum = 0;
  for (var _t2 = 1; _t2 < yinBufferLength; _t2++) {
    runningSum += yinBuffer[_t2];
    yinBuffer[_t2] *= _t2 / runningSum;
  }

  // Compute the absolute threshold as described in step 4 of the paper.
  // Since the first two positions in the array are 1,
  // we can start at the third position.
  for (tau = 2; tau < yinBufferLength; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      // found tau, exit loop and return
      // store the probability
      // From the YIN paper: The threshold determines the list of
      // candidates admitted to the set, and can be interpreted as the
      // proportion of aperiodic power tolerated
      // within a periodic signal.
      //
      // Since we want the periodicity and and not aperiodicity:
      // periodicity = 1 - aperiodicity
      probability = 1 - yinBuffer[tau];
      break;
    }
  }

  // if no pitch found, return null.
  if (tau == yinBufferLength || yinBuffer[tau] >= threshold) {
    return null;
  }

  // If probability too low, return -1.
  if (probability < probabilityThreshold) {
    return null;
  }

  /**
   * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
   * value using parabolic interpolation. This is needed to detect higher
   * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
   * for more background
   * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */
  var betterTau = void 0,
      x0 = void 0,
      x2 = void 0;
  if (tau < 1) {
    x0 = tau;
  } else {
    x0 = tau - 1;
  }
  if (tau + 1 < yinBufferLength) {
    x2 = tau + 1;
  } else {
    x2 = tau;
  }
  if (x0 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x2]) {
      betterTau = tau;
    } else {
      betterTau = x2;
    }
  } else if (x2 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x0]) {
      betterTau = tau;
    } else {
      betterTau = x0;
    }
  } else {
    var s0 = yinBuffer[x0];
    var s1 = yinBuffer[tau];
    var s2 = yinBuffer[x2];
    // fixed AUBIO implementation, thanks to Karl Helgason:
    // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  return sampleRate / betterTau;
}
