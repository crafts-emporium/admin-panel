export type DateFormat = "week" | "month" | "year";
const monthDays = [31];

const range = [
  [1, 7],
  [8, 14],
  [15, 21],
  [22, 28],
  [29, 31],
];

/**
 *
 * @param year
 * @param month accepts 0+1 index
 * @returns Max Days of a month
 */
const getMaxDays = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const getWeekDays = (year: number, month: number) => {
  let maxDays = getMaxDays(year, month);
  const weekDays: [number, number][] = [];

  while (maxDays !== 0) {
    const remainingDays = maxDays % 7;
    const weeksCount = Math.floor(maxDays / 7);

    for (let i = 0; i < weeksCount; i++) {
      weekDays.push([i * 7 + 1, (i + 1) * 7]);
    }

    if (remainingDays !== 0) {
      weekDays.push([weeksCount * 7 + 1, weeksCount * 7 + remainingDays]);
    }
  }

  return weekDays;
};

export const getDateOption = (date: string, format: DateFormat) => {
  switch (format) {
    case "week":
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
      });
    case "month":
      const day = new Date(date).getDate();
      const month = new Date(date).getMonth();
      const year = new Date(date).getFullYear();

    default:
      break;
  }
};
