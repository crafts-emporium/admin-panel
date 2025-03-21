export function formatNumber(num: number) {
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
  });

  return formatter.format(num);
}
