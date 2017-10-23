import { bytes } from './rnd';

export default function uuid(): string {
  const rnds = bytes();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  return toString(rnds);
}

const BYTE_TO_HEX: string[] = [];
for (let i = 0; i < 256; ++i) { // tslint:disable-line
  BYTE_TO_HEX[i] = (i + 0x100).toString(16).substr(1);
}

function toString(buf: Uint8Array) {
  let i = 0;
  const bth = BYTE_TO_HEX;
  // tslint:disable
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}
