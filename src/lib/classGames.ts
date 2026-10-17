/** Classroom game availability is separate from the journey's lessons. */
export const CLASS_GAMES = [
  { id: "sandwich", title: "Sandwich game", subtitle: "Say It Clearly", available: true, tone: "tone-sun", icon: "sandwich" },
  { id: "mistakes", title: "Mistake hunt", subtitle: "Spot the mistakes", available: false, tone: "tone-blue", icon: "search" },
  { id: "safety", title: "Spot the secret", subtitle: "Stay safe online", available: false, tone: "tone-lilac", icon: "shield" },
] as const;

export function canPlayClassGame(id: string) {
  return CLASS_GAMES.some((game) => game.id === id && game.available);
}