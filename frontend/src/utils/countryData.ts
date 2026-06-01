export interface CountryInfo {
  code: string;
  name: string;
  maleFirstNames: string[];
  femaleFirstNames: string[];
  lastNames: string[];
  cities: string[];
  states: { name: string; abbr: string }[];
  streets: string[];
  streetTypes: string[];
  phoneFormat: () => string;
  zipFormat: () => string;
  titleMale: string;
  titleFemale: string;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function usPhone(): string {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}
function usZip(): string {
  return String(randomInt(10000, 99999));
}

function ukPhone(): string {
  return `07${randomInt(100, 999)} ${randomInt(100, 999)} ${randomInt(100, 999)}`;
}
function ukZip(): string {
  const out = String(randomInt(10, 99)) + " " + String.fromCharCode(65 + randomInt(0, 25)) + String.fromCharCode(65 + randomInt(0, 25));
  return out;
}

function caPhone(): string {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}
function caZip(): string {
  const letter = String.fromCharCode(65 + randomInt(0, 25));
  const digit = randomInt(0, 9);
  const letter2 = String.fromCharCode(65 + randomInt(0, 25));
  return `${letter}${digit}${letter2} ${digit}${letter2}${digit}`;
}

function auPhone(): string {
  return `04${randomInt(10, 99)} ${randomInt(100, 999)} ${randomInt(100, 999)}`;
}
function auZip(): string {
  return String(randomInt(2000, 2999));
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: "US",
    name: "美国",
    maleFirstNames: [
      "Benjamin", "Matthew", "Alexander", "Andrew", "Samuel", "Ethan", "Daniel", "Anthony", "Henry", "Joseph",
      "David", "Lucas", "Ian", "Ryan", "Nathan", "Adrian", "Kyle", "Tyler", "Aaron", "Brandon",
      "John", "Michael", "William", "James", "Christopher", "Richard", "Charles", "Caleb", "Leo", "Oscar",
      "Julian", "Austin", "Jeremiah", "Evan", "Peter", "Zachary", "Gabriel", "Wesley", "Jude", "Maxwell",
      "Joshua", "Nicholas", "Adam", "Dominic", "Oliver", "Sebastian", "Justin", "Christian", "Elijah", "Cameron"
    ],
    femaleFirstNames: [
      "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Amelia", "Harper", "Evelyn", "Abigail",
      "Ella", "Scarlett", "Grace", "Chloe", "Victoria", "Riley", "Aria", "Lily", "Aubrey", "Zoe",
      "Mary", "Jennifer", "Linda", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa",
      "Penelope", "Camila", "Addison", "Leah", "Lucy", "Bailey", "Caroline", "Stella", "Julia", "Samantha"
    ],
    lastNames: [
      "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
      "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
      "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King"
    ],
    cities: [
      "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego",
      "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Indianapolis",
      "San Francisco", "Seattle", "Denver", "Nashville", "Portland", "Miami", "Atlanta", "Boston"
    ],
    states: [
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
    ],
    streets: ["Oak", "Maple", "Elm", "Main", "Pine", "Cedar", "Walnut", "Cherry", "Birch", "Willow",
      "Park", "Highland", "Sunset", "River", "Lake", "Hill", "Forest", "Meadow", "Spring", "Church"],
    streetTypes: ["St", "Ave", "Blvd", "Dr", "Ln", "Way", "Rd", "Ct", "Pl", "Cir"],
    phoneFormat: usPhone,
    zipFormat: usZip,
    titleMale: "Mr.",
    titleFemale: "Ms.",
  },
  {
    code: "GB",
    name: "英国",
    maleFirstNames: [
      "Oliver", "George", "Harry", "Noah", "Jack", "Leo", "Oscar", "Charlie", "James", "William",
      "Henry", "Thomas", "Freddie", "Alfie", "Arthur", "Jacob", "Ethan", "Archie", "Joshua", "Alexander",
      "David", "Michael", "Daniel", "Christopher", "Andrew", "Paul", "Mark", "Peter", "Richard", "Edward"
    ],
    femaleFirstNames: [
      "Olivia", "Amelia", "Isla", "Ava", "Mia", "Ivy", "Lily", "Ella", "Grace", "Sophie",
      "Charlotte", "Evie", "Emily", "Freya", "Florence", "Alice", "Sienna", "Poppy", "Jessica", "Daisy",
      "Sarah", "Helen", "Claire", "Laura", "Emma", "Rebecca", "Victoria", "Rachel", "Joanne", "Lucy"
    ],
    lastNames: [
      "Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Wilson", "Evans", "Thomas", "Roberts",
      "Johnson", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall",
      "Wood", "Harris", "Martin", "Jackson", "Clarke", "Clark", "James", "Scott", "Turner", "Hill"
    ],
    cities: [
      "London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Newcastle", "Sheffield", "Bristol",
      "Nottingham", "Leicester", "Southampton", "Portsmouth", "Oxford", "Cambridge", "Edinburgh", "Glasgow",
      "Cardiff", "Belfast", "York", "Brighton", "Bath", "Reading", "Exeter", "Norwich"
    ],
    states: [
      { abbr: "ENG", name: "England" }, { abbr: "SCT", name: "Scotland" },
      { abbr: "WLS", name: "Wales" }, { abbr: "NIR", name: "Northern Ireland" }
    ],
    streets: ["High", "Station", "Church", "Main", "Park", "Mill", "Green", "Victoria", "Queen", "King",
      "George", "York", "London", "Oxford", "Cambridge", "Albert", "Edward", "Russell", "Grove", "Lane"],
    streetTypes: ["St", "Rd", "Ave", "Ln", "Gdns", "Cl", "Dr", "Way", "Pl", "Mews"],
    phoneFormat: ukPhone,
    zipFormat: ukZip,
    titleMale: "Mr.",
    titleFemale: "Ms.",
  },
  {
    code: "CA",
    name: "加拿大",
    maleFirstNames: [
      "Liam", "Noah", "Benjamin", "Ethan", "William", "Lucas", "James", "Oliver", "Henry", "Jack",
      "Alexander", "Jacob", "Daniel", "Logan", "Matthew", "David", "Samuel", "Owen", "Nathan", "Thomas",
      "Michael", "Andrew", "Ryan", "Tyler", "Evan", "Adrian", "Isaac", "Jordan", "Justin", "Brandon"
    ],
    femaleFirstNames: [
      "Emma", "Olivia", "Charlotte", "Amelia", "Sophia", "Mia", "Ava", "Isabella", "Lily", "Ella",
      "Chloe", "Harper", "Grace", "Emily", "Hannah", "Abigail", "Madison", "Scarlett", "Zoe", "Hailey",
      "Evelyn", "Aria", "Layla", "Riley", "Aubrey", "Sofia", "Lucy", "Victoria", "Sarah", "Leah"
    ],
    lastNames: [
      "Smith", "Brown", "Tremblay", "Martin", "Roy", "Wilson", "MacDonald", "Gagnon", "Johnson", "Taylor",
      "Campbell", "Anderson", "Jones", "Wilson", "Moore", "White", "Lee", "Thompson", "Gauthier", "Scott",
      "Morin", "Leblanc", "Clark", "Lavoie", "Fortin", "Ouellet", "Pelletier", "Bouchard", "Cote", "Caron"
    ],
    cities: [
      "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City",
      "Hamilton", "Kitchener", "London", "Halifax", "St. Catharines", "Victoria", "Windsor", "Saskatoon",
      "Regina", "St. John's", "Barrie", "Kelowna", "Abbotsford", "Sherbrooke", "Sudbury", "Trois-Rivieres"
    ],
    states: [
      { abbr: "AB", name: "Alberta" }, { abbr: "BC", name: "British Columbia" },
      { abbr: "MB", name: "Manitoba" }, { abbr: "NB", name: "New Brunswick" },
      { abbr: "NL", name: "Newfoundland and Labrador" }, { abbr: "NS", name: "Nova Scotia" },
      { abbr: "ON", name: "Ontario" }, { abbr: "PE", name: "Prince Edward Island" },
      { abbr: "QC", name: "Quebec" }, { abbr: "SK", name: "Saskatchewan" }
    ],
    streets: ["Maple", "Oak", "Cedar", "Pine", "Birch", "Elm", "Church", "Main", "Queen", "King",
      "Victoria", "Park", "River", "Lake", "Forest", "Highland", "Willow", "Chestnut", "Cherry", "Walnut"],
    streetTypes: ["St", "Ave", "Rd", "Dr", "Blvd", "Ln", "Way", "Ct", "Pl", "Cir"],
    phoneFormat: caPhone,
    zipFormat: caZip,
    titleMale: "Mr.",
    titleFemale: "Ms.",
  },
  {
    code: "AU",
    name: "澳大利亚",
    maleFirstNames: [
      "Oliver", "Noah", "William", "Jack", "James", "Henry", "Lucas", "Ethan", "Leo", "Thomas",
      "Lachlan", "Charlie", "Hugo", "Alexander", "Max", "Benjamin", "Harrison", "Sebastian", "Oscar", "Archie",
      "David", "Michael", "Andrew", "Matthew", "Daniel", "Joshua", "Ryan", "Samuel", "Nathan", "Luke"
    ],
    femaleFirstNames: [
      "Charlotte", "Olivia", "Amelia", "Mia", "Isla", "Ava", "Grace", "Sophie", "Chloe", "Harper",
      "Ella", "Zoe", "Emily", "Lily", "Ruby", "Evelyn", "Sienna", "Sophia", "Ivy", "Willow",
      "Sarah", "Jessica", "Emma", "Lucy", "Hannah", "Georgia", "Mackenzie", "Abigail", "Elizabeth", "Claire"
    ],
    lastNames: [
      "Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Johnson", "White", "Martin", "Anderson",
      "Thompson", "Thomas", "Walker", "Harris", "Roberts", "Davis", "Jackson", "Robinson", "Miller", "Lee",
      "King", "Wright", "Campbell", "Green", "Clarke", "Baker", "Hill", "Mitchell", "Moore", "Carter"
    ],
    cities: [
      "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle",
      "Wollongong", "Hobart", "Geelong", "Townsville", "Cairns", "Darwin", "Ballarat", "Bendigo",
      "Launceston", "Mackay", "Rockhampton", "Bunbury", "Coffs Harbour", "Toowoomba", "Albury", "Mildura"
    ],
    states: [
      { abbr: "NSW", name: "New South Wales" }, { abbr: "VIC", name: "Victoria" },
      { abbr: "QLD", name: "Queensland" }, { abbr: "WA", name: "Western Australia" },
      { abbr: "SA", name: "South Australia" }, { abbr: "TAS", name: "Tasmania" },
      { abbr: "ACT", name: "Australian Capital Territory" }, { abbr: "NT", name: "Northern Territory" }
    ],
    streets: ["George", "Elizabeth", "King", "Queen", "Park", "Church", "Main", "High", "Victoria", "Albert",
      "Edward", "Sydney", "Brisbane", "Melbourne", "Adelaide", "Perth", "Collins", "Bourke", "Flinders", "Swanston"],
    streetTypes: ["St", "Rd", "Ave", "Dr", "Blvd", "Ln", "Way", "Ct", "Pl", "Pde"],
    phoneFormat: auPhone,
    zipFormat: auZip,
    titleMale: "Mr.",
    titleFemale: "Ms.",
  },
];

export function getCountryByCode(code: string): CountryInfo {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
}
