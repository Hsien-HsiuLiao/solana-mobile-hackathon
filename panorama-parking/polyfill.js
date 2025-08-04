import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto'
import { Buffer } from 'buffer'

// Immediately set global Buffer
global.Buffer = Buffer

// Force apply Buffer methods immediately
const applyBufferPolyfills = () => {
  console.log('=== APPLYING BUFFER POLYFILLS ===');
  console.log('global.Buffer exists:', typeof global.Buffer !== 'undefined');
  console.log('global.Buffer.prototype exists:', typeof global.Buffer.prototype !== 'undefined');
  
  if (typeof global.Buffer !== 'undefined' && global.Buffer.prototype) {
    // Add missing Buffer methods if they don't exist
    if (!global.Buffer.prototype.readUIntLE) {
      console.log('Adding readUIntLE polyfill');
      global.Buffer.prototype.readUIntLE = function(offset, byteLength) {
        let value = 0;
        for (let i = 0; i < byteLength; i++) {
          value += this[offset + i] * Math.pow(256, i);
        }
        return value;
      };
    } else {
      console.log('readUIntLE already exists');
    }
    
    if (!global.Buffer.prototype.readUIntBE) {
      console.log('Adding readUIntBE polyfill');
      global.Buffer.prototype.readUIntBE = function(offset, byteLength) {
        let value = 0;
        for (let i = 0; i < byteLength; i++) {
          value += this[offset + i] * Math.pow(256, byteLength - 1 - i);
        }
        return value;
      };
    } else {
      console.log('readUIntBE already exists');
    }
    
    // Also add writeUIntLE and writeUIntBE if they don't exist
    if (!global.Buffer.prototype.writeUIntLE) {
      console.log('Adding writeUIntLE polyfill');
      global.Buffer.prototype.writeUIntLE = function(value, offset, byteLength) {
        for (let i = 0; i < byteLength; i++) {
          this[offset + i] = (value >> (i * 8)) & 0xFF;
        }
        return offset + byteLength;
      };
    } else {
      console.log('writeUIntLE already exists');
    }
    
    if (!global.Buffer.prototype.writeUIntBE) {
      console.log('Adding writeUIntBE polyfill');
      global.Buffer.prototype.writeUIntBE = function(value, offset, byteLength) {
        for (let i = 0; i < byteLength; i++) {
          this[offset + i] = (value >> ((byteLength - 1 - i) * 8)) & 0xFF;
        }
        return offset + byteLength;
      };
    } else {
      console.log('writeUIntBE already exists');
    }
    
    // Test the polyfills
    try {
      const testBuffer = Buffer.from([1, 2, 3, 4]);
      const testValue = testBuffer.readUIntLE(0, 4);
      console.log('Buffer polyfill test successful:', testValue);
    } catch (error) {
      console.error('Buffer polyfill test failed:', error);
    }
    
    console.log('Buffer polyfills applied successfully');
  } else {
    console.error('Buffer or Buffer.prototype not available for polyfill');
  }
};

// Apply immediately
applyBufferPolyfills();

// Also apply after a short delay to ensure it's loaded
setTimeout(applyBufferPolyfills, 100);

// Apply again after a longer delay
setTimeout(applyBufferPolyfills, 1000);

// getRandomValues polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues
}

const webCrypto = typeof crypto !== 'undefined' ? crypto : new Crypto()

;(() => {
  if (typeof crypto === 'undefined') {
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    })
  }
})()

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

//React Native Error: b.readUIntLE is not a function due to usage of subarray function in versions >= v0.29.0 #3041
//rec fix
global.Buffer = Buffer;

Buffer.prototype.subarray = function subarray(
  begin,
  end
) {
  const result = Uint8Array.prototype.subarray.apply(this, [begin, end]);
  Object.setPrototypeOf(result, Buffer.prototype); // Explicitly add the `Buffer` prototype (adds `readUIntLE`!)
  return result;
};