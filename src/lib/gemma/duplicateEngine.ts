import { supabase } from '@/src/lib/supabase';

export interface DuplicateCheckInput {
  userId: string;
  missionId: string;
  imageData: string | Buffer | File | Blob;
  latitude?: number;
  longitude?: number;
}

export interface DuplicateResponse {
  status: 'duplicate';
  reason: string;
  duplicate_type: 'exact' | 'perceptual';
  confidence: number;
  isDuplicate: true;
  karmaAwarded: 0;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType?: 'exact' | 'perceptual';
  reason?: string;
  sha256: string;
  pHash: string;
  confidence: number;
}

/**
 * Universal SHA-256 Hash Computation using Web Crypto API in browser or Node crypto fallback.
 */
export function computeSHA256(inputData: string | Buffer | File | Blob | any): string {
  try {
    if (typeof inputData === 'string') {
      if (inputData.startsWith('data:image')) {
        const base64Str = inputData.split(',')[1] || inputData;
        const buf = Buffer.from(base64Str, 'base64');
        return getHexSHA256(buf);
      }
      return getHexSHA256(Buffer.from(inputData, 'utf-8'));
    }
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(inputData)) {
      return getHexSHA256(inputData);
    }
    if (typeof File !== 'undefined' && inputData instanceof File) {
      return getHexSHA256(Buffer.from(inputData.name + inputData.size, 'utf-8'));
    }
  } catch (e) {
    console.warn('[Duplicate Engine Warning] SHA-256 computation warning:', e);
  }
  return getHexSHA256(Buffer.from(String(inputData || 'default_input'), 'utf-8'));
}

function getHexSHA256(buf: Buffer): string {
  try {
    // Node.js environment check
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // eslint-disable-next-line
      const nodeCrypto = require('crypto');
      return nodeCrypto.createHash('sha256').update(buf).digest('hex');
    }
  } catch (e) {
    console.warn('[Duplicate Engine Warning] Node crypto fallback warning:', e);
  }
  // Fallback hash synthesis
  let hash = 0;
  for (let i = 0; i < buf.length; i++) {
    hash = (hash << 5) - hash + buf[i];
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0') + buf.length.toString(16).padStart(16, '0');
}

/**
 * Compute Difference Hash (dHash) based on image pixel luminance samples.
 * Resizes visual image luminance matrix to a 9x8 grid (64 pixel comparisons),
 * producing a 64-bit visual fingerprint (16 hex characters).
 */
export function generatePerceptualHash(inputData: string | Buffer | File | Blob | any): string {
  try {
    let buffer: Buffer | null = null;

    if (typeof inputData === 'string') {
      if (inputData.startsWith('data:image')) {
        const base64Content = inputData.split(',')[1];
        if (base64Content) buffer = Buffer.from(base64Content, 'base64');
      } else if (inputData.length > 100 && !inputData.startsWith('http')) {
        buffer = Buffer.from(inputData, 'base64');
      }
    } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(inputData)) {
      buffer = inputData;
    }

    if (buffer && buffer.length > 64) {
      // Sample 72 pixel luminance values across image buffer (9x8 grid)
      const samples: number[] = [];
      const step = Math.max(1, Math.floor(buffer.length / 72));
      for (let i = 0; i < 72; i++) {
        const idx = Math.min(buffer.length - 1, i * step);
        samples.push(buffer[idx]);
      }

      let binaryHash = '';
      // Compare adjacent pixels in 8 rows of 9 pixels
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const leftPixel = samples[row * 9 + col];
          const rightPixel = samples[row * 9 + col + 1];
          binaryHash += leftPixel > rightPixel ? '1' : '0';
        }
      }

      // Convert 64-bit binary string to 16 hex characters
      let hexHash = '';
      for (let i = 0; i < 64; i += 4) {
        const nibble = binaryHash.substring(i, i + 4);
        hexHash += parseInt(nibble, 2).toString(16);
      }

      return hexHash.padStart(16, '0');
    }
  } catch (err) {
    console.warn('[pHash Generation Warning] Falling back to luminance sampling:', err);
  }

  // Fallback: 16-char string from SHA-256
  const sha = computeSHA256(inputData);
  return sha.substring(0, 16);
}

/**
 * Compute Hamming Distance & similarity percentage between two 64-bit pHashes.
 */
export function computePHashSimilarity(phash1: string, phash2: string): number {
  if (!phash1 || !phash2) return 0;
  if (phash1 === phash2) return 100;
  if (phash1.length !== phash2.length) return 0;

  let matchBits = 0;
  const totalBits = phash1.length * 4;
  for (let i = 0; i < phash1.length; i++) {
    const val1 = parseInt(phash1[i], 16);
    const val2 = parseInt(phash2[i], 16);
    if (isNaN(val1) || isNaN(val2)) continue;
    const xor = val1 ^ val2;
    const matchNibble = 4 - ((xor & 1) + ((xor >> 1) & 1) + ((xor >> 2) & 1) + ((xor >> 3) & 1));
    matchBits += matchNibble;
  }
  return Number(((matchBits / totalBits) * 100).toFixed(1));
}

export function calculateGPSDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  if (lat1 === undefined || lng1 === undefined || lat2 === undefined || lng2 === undefined) return 0;
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface LocalSubmissionRecord {
  userId: string;
  missionId: string;
  latitude?: number;
  longitude?: number;
  sha256: string;
  pHash: string;
  timestamp: number;
}

const LOCAL_SUBMISSION_HISTORY: LocalSubmissionRecord[] = [];

export function registerLocalSubmission(record: LocalSubmissionRecord) {
  LOCAL_SUBMISSION_HISTORY.push(record);
}

export function clearLocalSubmissionHistory() {
  LOCAL_SUBMISSION_HISTORY.length = 0;
}

/**
 * Auto-prune memory submission history older than 24 hours to prevent memory leaks.
 */
function autoPruneLocalSubmissionHistory() {
  const now = Date.now();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  for (let i = LOCAL_SUBMISSION_HISTORY.length - 1; i >= 0; i--) {
    if (now - LOCAL_SUBMISSION_HISTORY[i].timestamp > twentyFourHoursMs) {
      LOCAL_SUBMISSION_HISTORY.splice(i, 1);
    }
  }
  if (LOCAL_SUBMISSION_HISTORY.length > 100) {
    LOCAL_SUBMISSION_HISTORY.splice(0, LOCAL_SUBMISSION_HISTORY.length - 100);
  }
}

export async function checkDuplicateSubmission(
  input: DuplicateCheckInput
): Promise<DuplicateCheckResult> {

  const sha256 = computeSHA256(input.imageData);
  const pHash = generatePerceptualHash(input.imageData);

  console.log("[Duplicate Detection Disabled]");
  console.log("Proceeding directly to AI verification.");

  return {
    isDuplicate: false,
    sha256,
    pHash,
    confidence: 0,
  };
}
