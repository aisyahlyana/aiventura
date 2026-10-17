export type Piece = { id: string; text: string; good: boolean; yes: string; no: string };

export const START_PROMPT = "Tell me about climate change.";

export const PIECES: Piece[] = [
  { id: "who", text: "I'm a primary school student.", good: true,
    yes: "Saying you are a primary school student helps the AI choose words you understand, without sharing who you are.",
    no: "Saying you are a primary school student would help the AI choose words you understand." },
  { id: "alicia", text: "My name is Alicia and I'm 11 years old.", good: false,
    yes: "Careful! Your name and age are personal information. Sharing them with an AI is not safe, and it does not need them to help you.",
    no: "Good skip! Your name and age are personal information. Keep them private: the AI can help you without them." },
  { id: "simple", text: "Explain climate change using simple examples.", good: true,
    yes: "Simple examples make the answer easy to understand and to present to your class.",
    no: "Simple examples would make the answer easier to present to your class." },
  { id: "three", text: "Give me 3 important causes.", good: true,
    yes: "A clear number keeps the answer short and focused, just right for a slide.",
    no: "Asking for 3 causes would keep the answer short and focused." },
  { id: "essay", text: "Write a 2,000-word scientific essay.", good: false,
    yes: "Far too long and too hard for a class presentation. More is not always better!",
    no: "Good skip! 2,000 scientific words would be far too long for your presentation." },
  { id: "everyday", text: "Include one example from everyday life.", good: true,
    yes: "An everyday example helps your classmates connect the topic to their own lives.",
    no: "An everyday example would help your classmates connect to the topic." },
];

export type PartId = "who" | "what" | "how" | "much";
export const PARTS: { id: PartId; n: number; name: string; tip: string; cardTip: string; text: string; tone: string }[] = [
  { id: "who", n: 1, name: "Who is it for?", tip: "Says what kind of reader you are.", cardTip: "Say what kind of reader you are, so the AI picks the right words.", text: "I'm a primary school student.", tone: "tone-blue" },
  { id: "what", n: 2, name: "What do you want?", tip: "Names the topic and the job to do.", cardTip: "Name the topic and the job: explain, list, compare or give ideas.", text: "Explain how volcanoes work.", tone: "tone-pink" },
  { id: "how", n: 3, name: "How should it explain?", tip: "Asks for a helpful style.", cardTip: "Ask for a style that helps you: simple words, examples, steps.", text: "Use simple examples.", tone: "tone-sun" },
  { id: "much", n: 4, name: "How much?", tip: "Says how long the answer should be.", cardTip: "Say how long the answer should be, so you get just what you need.", text: "Give me 3 key facts.", tone: "tone-lilac" },
];
/** Order the lesson quiz asks about the volcano phrases. */
export const ASK_ORDER: PartId[] = ["what", "who", "much", "how"];

export const SCORE_NOTES: Record<number, string> = {
  6: "Perfect! Every piece you picked helps, and you kept your personal information safe.",
  5: "So close! Read the tips to see which choice to change.",
  4: "Good start. The tips show how to make it even better.",
};

export function scorePrompt(picked: string[]) {
  return PIECES.filter((p) => picked.includes(p.id) === p.good).length;
}

export type Practice = {
  n: number; tone: string; title: string; mission: string; start: string; pieces: string[]; add: string[]; out: string[];
};

export const PRACTICES: Practice[] = [
  {
    n: 1, tone: "tone-pink", title: "The volcano poster",
    mission: "Your class is making posters about the Earth. Your team has volcanoes. Ask the AI for help with the words on your poster.",
    start: "Tell me about volcanoes.",
    pieces: ["I'm making a poster for my class.", "I live at Calle Sol 5, Madrid.", "Explain how a volcano erupts in simple steps.", "Write it as a 50-page book.", "Give me 3 fun facts for the poster.", "Use words a 10-year-old understands."],
    add: ["“I’m making a poster for my class.” (who it is for)", "“Explain how a volcano erupts in simple steps.” (what and how)", "“Give me 3 fun facts for the poster.” (how much)", "“Use words a 10-year-old understands.” (how)"],
    out: ["“I live at Calle Sol 5, Madrid.” An address is private: never share it.", "“Write it as a 50-page book.” Far too long for a poster."],
  },
  {
    n: 2, tone: "tone-blue", title: "The picnic lunch",
    mission: "Your class is going on a picnic in the park. Ask the AI for lunch ideas your team can bring.",
    start: "Give me a lunch idea.",
    pieces: ["It's for a school picnic in the park.", "My name is Marco and I'm 10.", "Make it healthy and easy to carry.", "Include every recipe in the world.", "List 3 ideas with what we need for each.", "No nuts, because some friends are allergic."],
    add: ["“It’s for a school picnic in the park.” (who it is for and why)", "“Make it healthy and easy to carry.” (how)", "“List 3 ideas with what we need for each.” (how much)", "“No nuts, because some friends are allergic.” (what)"],
    out: ["“My name is Marco and I’m 10.” A name and age are private, and the AI doesn’t need them.", "“Include every recipe in the world.” Far too much to be useful."],
  },
  {
    n: 3, tone: "tone-sun", title: "The class story",
    mission: "Your teacher will read a short story at the end of the day. Ask the AI to write one the whole class will enjoy.",
    start: "Write a story.",
    pieces: ["It's for our class reading time.", "Add my best friend's phone number.", "Make it about a brave dog who gets lost.", "Make it really scary with monsters and blood.", "Keep it short: about 150 words.", "Give it a happy ending."],
    add: ["“It’s for our class reading time.” (who it is for)", "“Make it about a brave dog who gets lost.” (what)", "“Keep it short: about 150 words.” (how much)", "“Give it a happy ending.” (how)"],
    out: ["“Add my best friend’s phone number.” A phone number is private, and it isn’t yours to share.", "“Make it really scary with monsters and blood.” Not kind or right for the whole class."],
  },
  {
    n: 4, tone: "tone-lilac", title: "The planets quiz",
    mission: "Your class has been learning about space. Ask the AI to make a quiz you can play together.",
    start: "Make a quiz.",
    pieces: ["We are a primary school class.", "Ask questions about our teacher's home address.", "Make it about the planets in our solar system.", "Make it 500 questions long.", "Give us 5 questions with the answers.", "Make it multiple choice with 3 options."],
    add: ["“We are a primary school class.” (who it is for)", "“Make it about the planets in our solar system.” (what)", "“Give us 5 questions with the answers.” (how much)", "“Make it multiple choice with 3 options.” (how)"],
    out: ["“Ask questions about our teacher’s home address.” Private information about someone else.", "“Make it 500 questions long.” Far too long to play in class."],
  },
];

export const WORKSHEET_KEY = {
  add: ["“I’m a primary school student.” (who it is for)", "“Explain climate change using simple examples.” (how)", "“Give me 3 important causes.” (how much)", "“Include one example from everyday life.” (how)"],
  out: ["“My name is Alicia and I’m 11 years old.” Personal information: never share it with an AI.", "“Write a 2,000-word scientific essay.” Far too long and hard for a class presentation."],
};
