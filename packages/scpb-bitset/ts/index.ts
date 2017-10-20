const BUCKET_SIZE = 8;
const BUCKET_ADDR = 3;
const BUCKET_MASK = BUCKET_SIZE - 1;

export function encode(
  arr: number[],
  bitSize: number,
) {
  const byteSize = Math.ceil(bitSize / BUCKET_SIZE);
  const bitset = new Uint8Array(byteSize);
  arr.forEach((idx) => {
    const arrIdx = idx >> BUCKET_ADDR;
    bitset[arrIdx] |= 1 << (idx & BUCKET_MASK);
  });
  return bitset;
}

export function decode(
  bitset: Uint8Array,
) {
  const arr: number[] = [];
  bitset.forEach((byte, i) => {
    for (let j = 0; j < BUCKET_SIZE; j++) { // tslint:disable-line
      if ((byte & (1 << (j & BUCKET_MASK))) > 0) {
        arr.push(i * BUCKET_SIZE + j);
      }
    }
  });
  return arr;
}
