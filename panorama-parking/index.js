import './polyfill'
import 'expo-router/entry'

// Additional Buffer polyfill to ensure it's applied
import { Buffer } from 'buffer'

// Set global Buffer
global.Buffer = Buffer

// Apply polyfills immediately
const applyBufferPolyfills = () => {
  console.log('=== APPLYING BUFFER POLYFILLS IN INDEX.JS ===');
  console.log('global.Buffer exists:', typeof global.Buffer !== 'undefined');
  console.log('global.Buffer.prototype exists:', typeof global.Buffer.prototype !== 'undefined');
  
  if (typeof global.Buffer !== 'undefined' && global.Buffer.prototype) {
    if (!global.Buffer.prototype.readUIntLE) {
      console.log('Adding readUIntLE polyfill in index.js');
      global.Buffer.prototype.readUIntLE = function(offset, byteLength) {
        let value = 0;
        for (let i = 0; i < byteLength; i++) {
          value += this[offset + i] * Math.pow(256, i);
        }
        return value;
      };
    } else {
      console.log('readUIntLE already exists in index.js');
    }
    
    if (!global.Buffer.prototype.readUIntBE) {
      console.log('Adding readUIntBE polyfill in index.js');
      global.Buffer.prototype.readUIntBE = function(offset, byteLength) {
        let value = 0;
        for (let i = 0; i < byteLength; i++) {
          value += this[offset + i] * Math.pow(256, byteLength - 1 - i);
        }
        return value;
      };
    } else {
      console.log('readUIntBE already exists in index.js');
    }
    
    console.log('Buffer polyfills applied successfully in index.js');
  } else {
    console.error('Buffer or Buffer.prototype not available in index.js');
  }
};

// Apply immediately
applyBufferPolyfills();

// Also apply after a delay
setTimeout(applyBufferPolyfills, 100);
