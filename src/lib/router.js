export const ROUTES = {
  memo: "memo",
  deck: "deck",
  model: "model",
  simulator: "simulator",
  sources: "sources",
  changelog: "changelog",
};

const DEFAULT_ROUTE = ROUTES.memo;

export function readHash(hash) {
  if (!hash) return "";
  // strip leading "#/" or "#"
  return hash.replace(/^#\/?/, "");
}

export function resolveRoute(path) {
  const known = Object.values(ROUTES);
  return known.includes(path) ? path : DEFAULT_ROUTE;
}
