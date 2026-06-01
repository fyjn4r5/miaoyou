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

const STREETS = [
  "Oak", "Maple", "Elm", "Main", "Pine", "Cedar", "Walnut", "Cherry", "Birch", "Willow",
  "Park", "Highland", "Sunset", "River", "Lake", "Hill", "Forest", "Meadow", "Spring", "Church"
];

const STREET_TYPES = ["St", "Ave", "Blvd", "Dr", "Ln", "Way", "Rd", "Ct", "Pl", "Cir"];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego",
  "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Indianapolis",
  "San Francisco", "Seattle", "Denver", "Nashville", "Portland", "Miami", "Atlanta", "Boston"
];

const STATES = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" }, { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" }, { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" }, { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" }, { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" }, { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" }, { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" }, { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" }, { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" }, { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" }, { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" }, { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" }, { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" }, { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" }, { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" }
];

const COMPANIES = [
  "TechCorp", "DataStream", "CloudBase", "NexGen", "OmniTech", "Cyberdyne", "FusionWare",
  "Apex Systems", "BlueBridge", "CoreLogic", "Delta Group", "Eagle Eye", "FirstPoint",
  "GlobalNet", "Horizon Inc", "IronClad", "Junction", "Kinetix", "LexisNexis", "Matrix"
];

const OCCUPATIONS = [
  "Software Engineer", "Data Analyst", "Project Manager", "Marketing Specialist",
  "Financial Analyst", "Operations Manager", "Sales Representative", "Graphic Designer",
  "Accountant", "Consultant", "IT Manager", "Business Analyst", "Registered Nurse",
  "Teacher", "Electrical Engineer", "Mechanical Engineer", "Lawyer", "Pharmacist"
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBirthday(): string {
  const year = randomInt(1960, 2002);
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateSSN(): string {
  const parts = [
    String(randomInt(1, 899)).padStart(3, "0"),
    String(randomInt(1, 99)).padStart(2, "0"),
    String(randomInt(1, 9999)).padStart(4, "0")
  ];
  return parts.join("-");
}

function generatePhone(): string {
  const area = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const line = randomInt(1000, 9999);
  return `(${area}) ${prefix}-${line}`;
}

function generateCreditCardNumber(): string {
  const groups = [
    String(randomInt(1000, 9999)),
    String(randomInt(1000, 9999)),
    String(randomInt(1000, 9999)),
    String(randomInt(1000, 9999))
  ];
  return groups.join(" ");
}

function generateExpiry(): string {
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const year = String(randomInt(26, 30));
  return `${month}/${year}`;
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export interface RandomName {
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  isMale: boolean;
  gender: string;
  birthday: string;
  streetAddress: string;
  city: string;
  state: string;
  stateFull: string;
  zipCode: string;
  telephone: string;
  title: string;
  company: string;
  occupation: string;
  ssn: string;
  creditCardType: string;
  creditCardNumber: string;
  cvv2: string;
  expires: string;
  password: string;
}

export function generateRandomName(): RandomName {
  const isMale = Math.random() < 0.5;
  const firstName = isMale ? pick(MALE_FIRST_NAMES) : pick(FEMALE_FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const username = `${firstName}${lastName}`.toLowerCase() + Math.floor(1998 + Math.random() * 10);

  const stateData = pick(STATES);
  const streetNum = randomInt(100, 9999);
  const streetName = pick(STREETS);
  const streetType = pick(STREET_TYPES);
  const streetAddress = `${streetNum} ${streetName} ${streetType}`;
  const city = pick(CITIES);
  const zipCode = String(randomInt(10000, 99999));
  const telephone = generatePhone();
  const title = isMale ? "Mr." : "Ms.";
  const gender = isMale ? "Male" : "Female";
  const birthday = randomBirthday();
  const company = pick(COMPANIES);
  const occupation = pick(OCCUPATIONS);
  const ssn = generateSSN();
  const creditCardType = pick(["Visa", "MasterCard", "American Express", "Discover"]);
  const creditCardNumber = generateCreditCardNumber();
  const cvv2 = String(randomInt(100, 999));
  const expires = generateExpiry();
  const password = generatePassword();

  return {
    firstName, lastName, fullName, username, isMale,
    gender, birthday, streetAddress, city,
    state: stateData.abbr, stateFull: stateData.name,
    zipCode, telephone, title, company, occupation,
    ssn, creditCardType, creditCardNumber, cvv2, expires, password
  };
}
