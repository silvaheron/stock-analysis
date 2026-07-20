export const parseNumber = (value: unknown): number | null => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    value === "-%"
  ) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const normalized = value
    .toString()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace("%", "")
    .trim();

  const number = Number(normalized);

  return isNaN(number) ? null : number;
};

export const formatNumber = (value: unknown) => {
  const number = parseNumber(value);

  return number === null
    ? "-"
    : number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

export const formatPercent = (value: unknown) => {
  const number = parseNumber(value);

  return number === null
    ? "-"
    : `${number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}%`;
};

export const formatCurrency = (value: unknown) => {
  const number = parseNumber(value);

  if (number === null) {
    return "-";
  }

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};