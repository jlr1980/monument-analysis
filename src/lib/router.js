// Route slugs. startHere uses an empty string so the landing URL is
// jlr1980.github.io/monument-analysis/ with no hash suffix.
export const ROUTES = {
  startHere: "",
  memo: "memo",
  model: "model",
  simulator: "simulator",
  sources: "sources",
  changelog: "changelog",
};

const DEFAULT_ROUTE = ROUTES.startHere;

export function readHash(hash) {
  if (!hash) return "";
  // strip leading "#/" or "#"
  return hash.replace(/^#\/?/, "");
}

export function resolveRoute(path) {
  const known = Object.values(ROUTES);
  return known.includes(path) ? path : DEFAULT_ROUTE;
}
