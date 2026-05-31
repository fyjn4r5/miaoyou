const MALE_FIRST_NAMES = [
  "Benjamin", "Matthew", "Alexander", "Andrew", "Samuel", "Ethan", "Daniel", "Anthony", "Henry", "Joseph",
  "David", "Lucas", "Ian", "Ryan", "Nathan", "Adrian", "Kyle", "Tyler", "Aaron", "Brandon",
  "John", "Michael", "William", "James", "Christopher", "Richard", "Charles", "Caleb", "Leo", "Oscar",
  "Julian", "Austin", "Jeremiah", "Evan", "Peter", "Zachary", "Gabriel", "Wesley", "Jude", "Maxwell",
  "Joshua", "Nicholas", "Adam", "Dominic", "Oliver", "Sebastian", "Justin", "Christian", "Elijah", "Cameron",
  "Liam", "Jordan", "Sean", "Thomas", "Hunter", "Connor", "Logan", "Cooper", "Max", "Luke",
  "Isaac", "Mason", "Carter", "Tristan", "Harvey", "Blake", "Nolan", "George", "Robert", "Colin",
  "Patrick", "Jack", "Dylan", "Graham", "Grant", "Owen", "Gavin", "Simon", "Seth", "Cody",
  "Derek", "Brendan", "Grayson", "Harrison", "Shane", "Chase", "Parker", "Bryce", "Jason", "Spencer",
  "Phillip", "Brady", "Arthur", "Elliot", "Marcus", "Theodore", "Jeremy", "Jasper", "Leonard", "Vincent"
];

const FEMALE_FIRST_NAMES = [
  "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Amelia", "Harper", "Evelyn", "Abigail",
  "Ella", "Scarlett", "Grace", "Chloe", "Victoria", "Riley", "Aria", "Lily", "Aubrey", "Zoe",
  "Mary", "Jennifer", "Linda", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa",
  "Penelope", "Camila", "Addison", "Leah", "Lucy", "Bailey", "Caroline", "Stella", "Julia", "Samantha",
  "Kayla", "Brooklyn", "Willow", "Elena", "Ruby", "Sophie", "Katherine", "Madelyn", "Peyton", "Luna",
  "Audrey", "Gianna", "Violet", "Lydia", "Claire", "Bella", "Alexa", "Allison", "Hannah", "Ariana",
  "Savannah", "Ashley", "Audrina", "Fiona", "Norah", "Emilia", "Isla", "Megan", "Jade", "Madison",
  "Lauren", "Ivy", "Faith", "Ellie", "Annabelle", "Alyssa", "Khloe", "Autumn", "Melanie", "Ariella",
  "Mackenzie", "Brianna", "Payton", "Maria", "Alina", "Kennedy", "Sydney", "Natalie", "Lyric", "Alexandra",
  "Piper", "Sienna", "Charlie", "Alice", "Josephine", "Adeline", "Gabriella", "Valentina", "Irene", "Isabelle", "Leilani"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
  "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
  "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
  "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
  "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins",
  "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey",
  "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez",
  "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross",
  "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington",
  "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes"
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface RandomName {
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  isMale: boolean;
}

export function generateRandomName(): RandomName {
  const isMale = Math.random() < 0.5;
  const firstName = isMale ? pick(MALE_FIRST_NAMES) : pick(FEMALE_FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const username = `${firstName}${lastName}`.toLowerCase() + Math.floor(10 + Math.random() * 90);

  return { firstName, lastName, fullName, username, isMale };
}
