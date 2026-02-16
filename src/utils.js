export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const AVATAR_COLOR_MAP = {
  blue: {
    id: "blue",
    label: "Ocean Blue",
    bgClass: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
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

// Shared color keys used by Avatar component
const AVATAR_COLOR_KEYS = ['blue', 'teal', 'cyan', 'indigo', 'fuchsia', 'lime', 'yellow'];

/** Deterministic avatar color from a name string */
export const getAvatarColor = (name = '') => {
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLOR_KEYS.length;
  return AVATAR_COLOR_KEYS[index];
};

/** Get 1-2 uppercase initials from a full name */
export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || '?';
