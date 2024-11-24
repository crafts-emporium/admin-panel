export function formatNumber(num: number) {
  const arr: string[] = [];

  while (num) {
    const remainder = num % 1000;
    num = Math.floor(num / 1000);
    arr.unshift(remainder.toString().padStart(3, "0"));
  }

  if (arr.length) {
    arr[0] = arr[0].replace(/^0+/, "");
  }

  !arr.length && arr.push("0");

  return arr.join(",");
}
