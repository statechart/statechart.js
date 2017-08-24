const BUCKET_SIZE = 8;
const BUCKET_ADDR = 3;
const BUCKET_MASK = BUCKET_SIZE - 1;

export function encode(arr, bitSize) {
  const byteSize = Math.ceil(bitSize / BUCKET_SIZE);
  var bitset = new Uint8Array(byteSize);
  arr.forEach(function(idx) {
    var arrIdx = idx >> BUCKET_ADDR;
    bitset[arrIdx] |= 1 << (idx & BUCKET_MASK);
  });
  return bitset;
};

export function decode(bitset) {
  var arr = [];
  bitset.forEach(function(byte, i) {
    for (var j = 0; j < BUCKET_SIZE; j++) {
      if ((byte & (1 << (j & BUCKET_MASK))) > 0) {
        arr.push(i * BUCKET_SIZE + j);
      }
    }
  });
  return arr;
};
