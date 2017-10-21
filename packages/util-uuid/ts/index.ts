const crypto = (global as any).crypto;

const hasCrypto =
  crypto !== undefined &&
  crypto.getRandomValues !== undefined;

export default hasCrypto ?
  () => {
    const buf: Uint16Array = new Uint16Array(8);
    crypto.getRandomValues(buf);
    return `${pad(buf[0])}${pad(buf[1])}-${pad(buf[2])}-${pad(buf[3])
          }-${pad(buf[4])}-${pad(buf[5])}${pad(buf[6])}${pad(buf[7])}`;
  } :
  () => {
    return `${rnd()}${rnd()}-${rnd()}-${rnd()
          }-${rnd()}-${rnd()}${rnd()}${rnd()}`;
  };

function pad(n: number) {
  let ret = n.toString(16);
  while (ret.length < 4) {
    ret = `0${ret}`;
  }
  return ret;
}

function rnd() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .slice(1);
}
