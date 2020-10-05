export default function makeCounter(a) {
  return function (b) {
    return a + b
  };
}