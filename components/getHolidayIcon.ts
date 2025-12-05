export function getHolidayIcon(name: string) {
  const n = name.toLowerCase();

  if (n.includes("black friday")) return "🔥";
  if (n.includes("cyber monday")) return "💻";
  if (n.includes("christmas")) return "🎄";
  if (n.includes("new year")) return "🎆";
  if (n.includes("thanksgiving")) return "🦃";
  if (n.includes("valentine")) return "❤️";
  if (n.includes("easter")) return "🐣";
  if (n.includes("prime day")) return "📦";
  if (n.includes("back to school")) return "🎒";

  return "✨";
}
