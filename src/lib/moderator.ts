// lib/moderator.ts
const bannedWords = [
  // Original explicit content
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

  // Original cyberbullying terms
  "no one likes you",
  "you suck",
  "worthless",
  "loser",
  "kill yourself",
  "kys",
  "unpopular",
  "hated",

  // Additional banned words
  "useless",
  "trash",
  "garbage",
  "disgusting",
  "pathetic",
  "die",
  "death",
  "murder",
  "suicide",
  "harm",
  "hurt",
  "destroy",
  "nobody",
  "nothing",
  "failure",
  "hopeless",
  "shut up",
  "shutup",
  "stfu",
  "f off",
  "fuck off",
  "piss off",
  "cunt",
  "dick",
  "asshole",
  "bastard",
  "whore",
  "slut",
  "douche",
  "scum",
  "vermin",
  "invalid",
  "inferior",
  "subhuman",
  "go die",
  "end yourself",
  "end it",
  "jump off",
  "cut yourself",
  "nobody loves you",
  "everyone hates you",
  "you're alone",
  "lonely",
  "you're nothing",
  "you're worthless",
  "useless person",
  "disappear",
  "vanish",
  "go away",
  "leave forever",
  "never come back",
  "unlovable",
  "unwanted",
  "rejected",
  "abandoned",
  "forgotten",

  // Bisaya/Cebuano banned words
  "yawa",
  "yawa ka",
  "yawaa",
  "piste",
  "pisti",
  "buang",
  "buanga",
  "buang ka",
  "tanga",
  "tangaha",
  "tang ina",
  "gago",
  "gaga",
  "gago ka",
  "pakyu",
  "pak yu",
  "libak",
  "libakon",
  "tsismosa",
  "tsismoso",
];

const warningWords = [
  // Original warning words
  "hate",
  "stupid",
  "dumb",
  "annoying",
  "lame",

  // Additional warning words
  "animal", // when used as insult
  "gay", // when potentially used negatively

  // Bisaya/Cebuano warning words
  "bogo",
  "boto",
  "oten",
  "bilat",
  "iyot",
  "bogo ka",
  "bugo",
  "bugo ka",
  "kulang-kulang",
  "salbahis",
  "lapok",
  "lapokan",
  "bastos",
  "bastos ka",
  "walay pulos",
  "walay hinungdan",
  "dili kahimut-an",
];

// Helper function to check for phrases (multi-word expressions)
function containsPhrase(message: string, phrase: string): boolean {
  return message.includes(phrase.toLowerCase());
}

export function moderateMessage(message: string): {
  isAllowed: boolean;
  reason?: string;
  warning?: boolean;
} {
  const lowerMessage = message.toLowerCase().trim();

  // Check for exact phrases first (to avoid false positives on partial matches)
  const exactPhrases = [
    "no one likes you",
    "kill yourself",
    "kys",
    "go die",
    "end yourself",
    "end it",
    "jump off",
    "cut yourself",
    "nobody loves you",
    "everyone hates you",
    "you're alone",
    "you're nothing",
    "you're worthless",
    "useless person",
    "go away",
    "leave forever",
    "never come back",
    "yawa ka",
    "buang ka",
    "gago ka",
    "bogo ka",
    "bugo ka",
    "bastos ka",
  ];

  for (const phrase of exactPhrases) {
    if (containsPhrase(lowerMessage, phrase)) {
      return {
        isAllowed: false,
        reason: `Message contains inappropriate content`,
      };
    }
  }

  // Check for banned words
  for (const word of bannedWords) {
    // Skip exact phrases we already checked
    if (word.includes(" ") || exactPhrases.includes(word)) {
      continue;
    }

    // Use word boundaries for better matching
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(message)) {
      return {
        isAllowed: false,
        reason: `Message contains inappropriate content`,
      };
    }
  }

  // Check for warning words
  for (const word of warningWords) {
    if (word.includes(" ")) {
      if (containsPhrase(lowerMessage, word)) {
        return {
          isAllowed: true,
          warning: true,
        };
      }
    } else {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(message)) {
        return {
          isAllowed: true,
          warning: true,
        };
      }
    }
  }

  // Check for all caps (potential shouting/aggression)
  const lettersOnly = message.replace(/[^A-Za-z]/g, "");
  if (lettersOnly.length > 10) {
    const capsRatio =
      (lettersOnly.match(/[A-Z]/g) || []).length / lettersOnly.length;
    if (capsRatio > 0.7) {
      return {
        isAllowed: false,
        reason: `Please avoid using excessive capital letters`,
      };
    }
  }

  // Check for excessive punctuation (anger/frustration)
  const punctuationRatio =
    (message.match(/[!?]+/g) || []).join("").length / message.length;
  if (punctuationRatio > 0.3 && message.length > 15) {
    return {
      isAllowed: false,
      reason: `Please avoid excessive punctuation`,
    };
  }

  // Check for repeated characters (like "nooooo" or "whyyyyy")
  if (message.length > 5) {
    const repeatedChars = message.match(/(.)\1{4,}/g);
    if (repeatedChars && repeatedChars.length > 0) {
      return {
        isAllowed: false,
        reason: `Please avoid repeating characters excessively`,
      };
    }
  }

  return { isAllowed: true };
}

// Optional: Export a helper function to get statistics
export function getModerationStats(message: string): {
  hasBannedWords: boolean;
  hasWarningWords: boolean;
  allCaps: boolean;
  excessivePunctuation: boolean;
  repeatedChars: boolean;
} {
  const lowerMessage = message.toLowerCase();

  const hasBannedWords = bannedWords.some((word) => {
    if (word.includes(" ")) {
      return containsPhrase(lowerMessage, word);
    }
    return new RegExp(`\\b${word}\\b`, "i").test(message);
  });

  const hasWarningWords = warningWords.some((word) => {
    if (word.includes(" ")) {
      return containsPhrase(lowerMessage, word);
    }
    return new RegExp(`\\b${word}\\b`, "i").test(message);
  });

  const lettersOnly = message.replace(/[^A-Za-z]/g, "");
  const allCaps =
    lettersOnly.length > 10 &&
    (lettersOnly.match(/[A-Z]/g) || []).length / lettersOnly.length > 0.7;

  const excessivePunctuation =
    message.length > 15 &&
    (message.match(/[!?]+/g) || []).join("").length / message.length > 0.3;

  const repeatedChars = message.length > 5 && !!message.match(/(.)\1{4,}/g);

  return {
    hasBannedWords,
    hasWarningWords,
    allCaps,
    excessivePunctuation,
    repeatedChars,
  };
}
