// lib/moderator.ts
const bannedWords = [
  // Explicit content
  "hate",
  "kill",
  "stupid",
  "idiot",
  "ugly",
  "fat",
  "retarded",
  "moron",
  "fuck",
  "shit",
  "bitch",
  // Cyberbullying terms
  "no one likes you",
  "you suck",
  "worthless",
  "loser",
  "kill yourself",
  "kys",
  "unpopular",
  "hated",
];

const warningWords = ["hate", "stupid", "dumb", "annoying", "lame"];

export function moderateMessage(message: string): {
  isAllowed: boolean;
  reason?: string;
  warning?: boolean;
} {
  const lowerMessage = message.toLowerCase();

  // Check for banned words (immediate rejection)
  for (const word of bannedWords) {
    if (lowerMessage.includes(word)) {
      return {
        isAllowed: false,
        reason: `Message contains inappropriate content`,
      };
    }
  }

  // Check for warning words (flag for review)
  for (const word of warningWords) {
    if (lowerMessage.includes(word)) {
      return {
        isAllowed: true,
        warning: true,
      };
    }
  }

  // Check for all caps (potential shouting/aggression)
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.7 && message.length > 10) {
    return {
      isAllowed: false,
      reason: `Please avoid using excessive capital letters`,
    };
  }

  return { isAllowed: true };
}
