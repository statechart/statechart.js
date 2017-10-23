const crypto = (global as any).crypto;
const getRandomValues = crypto !== undefined && crypto.getRandomValues;

export const bytes = getRandomValues ?
  () => crypto.getRandomValues(new Uint8Array(16)) :
  () => function mathRNG() {
    const rnds = new Uint8Array(16);
    for (let i = 0, r = 0; i < 16; i++) { // tslint:disable-line
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }
    return rnds;
  };
