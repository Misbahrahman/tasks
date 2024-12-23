// src/utils.js
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
  }

export const AVATAR_COLOR_MAP = {
  teal: {
    id: "teal",
    label: "Serene Teal",
    bgClass: "bg-gradient-to-br from-teal-500 to-teal-600"
  },
  cyan: {
    id: "cyan",
    label: "Icy Cyan",
    bgClass: "bg-gradient-to-br from-cyan-500 to-cyan-600"
  },
  indigo: {
    id: "indigo",
    label: "Midnight Indigo",
    bgClass: "bg-gradient-to-br from-indigo-500 to-indigo-600"
  },
  fuchsia: {
    id: "fuchsia",
    label: "Mystic Fuchsia",
    bgClass: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-600"
  },
  lime: {
    id: "lime",
    label: "Lively Lime",
    bgClass: "bg-gradient-to-br from-lime-500 to-lime-600"
  },
  yellow: {
    id: "yellow",
    label: "Radiant Yellow",
    bgClass: "bg-gradient-to-br from-yellow-500 to-yellow-600"
  }
};
