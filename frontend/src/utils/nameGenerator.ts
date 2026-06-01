import { getCountryByCode } from './countryData';

const API_URL = "https://www.meiguodizhi.com/api/v1/dz";

const API_COUNTRY_PATHS: Record<string, string> = {
  US: "/",
  CA: "/ca-address",
  AU: "/au-address",
  JP: "/jp-address",
  KR: "/kr-address",
  GB: "/uk-address",
  DE: "/de-address",
  FR: "/fr-address",
  SG: "/sg-address",
};

interface AddressApiResponse {
  status: string;
  address: {
    Full_Name: string;
    Gender: string;
    Birthday: string;
    Title: string;
    Address: string;
    City: string;
    State: string;
    State_Full: string;
    Zip_Code: string;
    Telephone: string;
    Username: string;
    Password: string;
    Occupation: string;
    Company_Name: string;
    Social_Security_Number: string;
    Credit_Card_Type: string;
    Credit_Card_Number: string;
    CVV2: string;
    Expires: string;
  };
}

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
  countryCode: string;
  countryName: string;
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
  fullAddress: string;
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

export function generateRandomName(countryCode?: string): RandomName {
  const country = countryCode ? getCountryByCode(countryCode) : getCountryByCode("US");

  const isMale = Math.random() < 0.5;
  const firstName = isMale ? pick(country.maleFirstNames) : pick(country.femaleFirstNames);
  const lastName = pick(country.lastNames);
  const fullName = `${firstName} ${lastName}`;
  const username = `${firstName}${lastName}`.toLowerCase() + Math.floor(1998 + Math.random() * 10);

  const stateData = pick(country.states);
  const streetNum = randomInt(100, 9999);
  const streetName = pick(country.streets);
  const streetType = pick(country.streetTypes);
  const streetAddress = `${streetNum} ${streetName} ${streetType}`;
  const city = pick(country.cities);
  const zipCode = country.zipFormat();
  const telephone = `+${country.phoneCountryPrefix}${country.phoneFormat()}`;
  const fullAddress = `${streetAddress}\n${city}, ${stateData.abbr} ${zipCode}\n${country.englishName}`;
  const title = isMale ? country.titleMale : country.titleFemale;
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
    countryCode: country.code,
    countryName: country.name,
    firstName, lastName, fullName, username, isMale,
    gender, birthday, streetAddress, city,
    state: stateData.abbr, stateFull: stateData.name,
    zipCode, telephone, fullAddress, title, company, occupation,
    ssn, creditCardType, creditCardNumber, cvv2, expires, password
  };
}

export async function fetchRandomNameFromApi(countryCode?: string): Promise<RandomName | null> {
  const code = countryCode || "US";
  const path = API_COUNTRY_PATHS[code];
  if (!path) return null;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, method: "address" }),
    });

    if (!res.ok) return null;

    const data: AddressApiResponse = await res.json();
    if (data.status !== "ok" || !data.address) return null;

    const addr = data.address;
    const nameParts = addr.Full_Name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const countryData = getCountryByCode(code);
    const isMale = addr.Gender?.toLowerCase() === "male";

    return {
      countryCode: code,
      countryName: countryData.name,
      firstName,
      lastName,
      fullName: addr.Full_Name,
      username: addr.Username,
      isMale,
      gender: addr.Gender,
      birthday: addr.Birthday,
      streetAddress: addr.Address,
      city: addr.City,
      state: addr.State,
      stateFull: addr.State_Full,
      zipCode: addr.Zip_Code,
      telephone: addr.Telephone,
      fullAddress: `${addr.Address}\n${addr.City}, ${addr.State} ${addr.Zip_Code}\n${countryData.englishName}`,
      title: addr.Title,
      company: addr.Company_Name,
      occupation: addr.Occupation,
      ssn: addr.Social_Security_Number,
      creditCardType: addr.Credit_Card_Type,
      creditCardNumber: addr.Credit_Card_Number,
      cvv2: addr.CVV2,
      expires: addr.Expires,
      password: addr.Password,
    };
  } catch {
    return null;
  }
}
