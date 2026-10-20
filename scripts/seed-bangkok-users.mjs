#!/usr/bin/env node
/**
 * seed-bangkok-users.mjs
 * Creates fake users around Bangkok through the public API, to test the match engine. Each gets a
 * random-noise photo. The data comes
 * from a seeded random generator, so the same --seed gives the same people every time; run it
 * again after the dev server's data is cleared. Users that already exist are skipped, so it is
 * safe to run twice.
 *
 * Usage: node scripts/seed-bangkok-users.mjs [--base-url URL] [--count 10000] [--seed 2026]
 *                                            [--password Bangkok2026] [--concurrency 8]
 *                                            [--image-size 96] [--update-existing] [--dry-run]
 * The base URL defaults to EXPO_PUBLIC_API_BASE_URL (environment, then .env).
 * --update-existing also moves users that already exist to the location this seed gives them.
 * Logins: bkk_001 to bkk_<count>, all with the same password (default "Bangkok2026").
 */
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

/**
 * Writes one line to standard output (the script's report, not debug output).
 * @param {string} line The text to print.
 */
function print(line) {
  process.stdout.write(`${line}\n`);
}

const GENDERS = ["female", "male", "non_binary", "prefer_not_to_say"];

/**
 * A rough outline of Bangkok (the province, not the whole metropolitan area) as [lat, lon]
 * corners, clockwise from the west. Locations are picked at random inside it, anywhere, so people
 * are not limited to a list of districts. It is simplified: good enough to stay in Bangkok, not a
 * survey of the border.
 */
const BANGKOK_OUTLINE = [
  [13.8, 100.34],
  [13.84, 100.46],
  [13.87, 100.55],
  [13.96, 100.58],
  [13.95, 100.68],
  [13.9, 100.76],
  [13.88, 100.92],
  [13.78, 100.94],
  [13.71, 100.84],
  [13.69, 100.77],
  [13.67, 100.66],
  [13.66, 100.58],
  [13.62, 100.5],
  [13.54, 100.43],
  [13.5, 100.36],
  [13.62, 100.33],
];

const NAMES = [
  "Fern",
  "Mint",
  "Ploy",
  "Kwan",
  "Fah",
  "Nok",
  "Pim",
  "Aom",
  "Bua",
  "Dao",
  "Gift",
  "Jane",
  "Kaew",
  "Lek",
  "Mali",
  "Nan",
  "Oil",
  "Pat",
  "Rin",
  "Som",
  "Tan",
  "Waan",
  "Ying",
  "Am",
  "Bank",
  "Chai",
  "Dan",
  "Ekk",
  "Gun",
  "Joe",
  "Ken",
  "Mark",
  "Nat",
  "Palm",
  "Ton",
  "Win",
  "Yok",
  "Zen",
  "Boss",
  "Eve",
  "First",
  "Game",
  "Golf",
  "Ink",
  "Jay",
  "Kim",
  "Mook",
  "Nine",
  "Pop",
  "Ruk",
  "Sai",
  "Tee",
];

/** The reference year for dates of birth, so the same seed gives the same dates. */
const REFERENCE_YEAR = 2026;

/**
 * A small seeded random generator (mulberry32).
 * @param {number} seed Any integer.
 * @returns {() => number} A function giving numbers in [0, 1).
 */
function randomFrom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Options that take a value: flag, then the option it sets and how to convert the text. */
const VALUE_FLAGS = {
  "--base-url": ["baseUrl", (text) => text],
  "--count": ["count", Number],
  "--concurrency": ["concurrency", Number],
  "--image-size": ["imageSize", Number],
  "--seed": ["seed", Number],
  "--password": ["password", (text) => text],
};

/**
 * Applies the command-line arguments to the options.
 * @param {string[]} argv Arguments after the script name.
 * @param {object} options The options to fill in.
 * @throws {Error} When an argument is not a known option.
 */
function applyArguments(argv, options) {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--update-existing") {
      options.isUpdatingExisting = true;
    } else if (arg === "--dry-run") {
      options.isDryRun = true;
    } else if (Object.hasOwn(VALUE_FLAGS, arg)) {
      const [name, convert] = VALUE_FLAGS[arg];
      options[name] = convert(argv[++i]);
    } else {
      throw new Error(`Unknown option ${arg}`);
    }
  }
}

/**
 * Checks that an option is a whole number in a range.
 * @param {number} value The option's value.
 * @param {string} flag The option's flag, for the message.
 * @param {number} min Smallest allowed value.
 * @param {number} max Largest allowed value.
 * @throws {Error} When the value is outside the range.
 */
function checkWholeNumber(value, flag, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${flag} must be a whole number from ${min} to ${max}`);
  }
}

/**
 * Reads the command line.
 * @param {string[]} argv Arguments after the script name.
 * @returns {{ baseUrl: string, count: number, seed: number, password: string, concurrency: number,
 *   imageSize: number, isDryRun: boolean }}
 * @throws {Error} When an option is unknown, out of range or the base URL is missing.
 */
function readOptions(argv) {
  const options = {
    baseUrl: "",
    count: 10000,
    seed: 2026,
    concurrency: 8,
    imageSize: 96,
    isUpdatingExisting: false,
    password: "Bangkok2026",
    isDryRun: false,
  };
  applyArguments(argv, options);
  if (options.baseUrl === "") {
    options.baseUrl =
      process.env.EXPO_PUBLIC_API_BASE_URL ?? envFileValue("EXPO_PUBLIC_API_BASE_URL");
  }
  checkWholeNumber(options.count, "--count", 1, 99999);
  checkWholeNumber(options.concurrency, "--concurrency", 1, 64);
  checkWholeNumber(options.imageSize, "--image-size", 8, 1024);
  if (options.baseUrl === "" && !options.isDryRun) {
    throw new Error("No base URL: pass --base-url or set EXPO_PUBLIC_API_BASE_URL in .env");
  }
  options.baseUrl = options.baseUrl.replace(/\/+$/, "");
  return options;
}

/**
 * One value from the .env file next to package.json.
 * @param {string} key The variable name.
 * @returns {string} The value, or "" when there is no .env or no such line.
 */
function envFileValue(key) {
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
    const line = text.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
    return line === undefined ? "" : line.slice(key.length + 1).trim();
  } catch {
    return "";
  }
}

/**
 * Whether a point is inside the Bangkok outline (ray casting).
 * @param {number} lat Latitude.
 * @param {number} lon Longitude.
 * @returns {boolean} True when inside.
 */
function isInBangkok(lat, lon) {
  let isInside = false;
  for (let i = 0, j = BANGKOK_OUTLINE.length - 1; i < BANGKOK_OUTLINE.length; j = i++) {
    const [latI, lonI] = BANGKOK_OUTLINE[i];
    const [latJ, lonJ] = BANGKOK_OUTLINE[j];
    if (latI > lat !== latJ > lat && lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI) {
      isInside = !isInside;
    }
  }
  return isInside;
}

/**
 * A random point anywhere inside Bangkok: uniform over the outline's bounding box, retried until
 * it falls inside the outline.
 * @param {() => number} random The generator.
 * @returns {{ lat: number, lon: number }} The point, rounded to 6 decimals (about 10 cm).
 */
function randomBangkokPoint(random) {
  const lats = BANGKOK_OUTLINE.map(([lat]) => lat);
  const lons = BANGKOK_OUTLINE.map(([, lon]) => lon);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLon, maxLon] = [Math.min(...lons), Math.max(...lons)];
  for (;;) {
    const lat = minLat + random() * (maxLat - minLat);
    const lon = minLon + random() * (maxLon - minLon);
    if (isInBangkok(lat, lon)) {
      return { lat: Number(lat.toFixed(6)), lon: Number(lon.toFixed(6)) };
    }
  }
}

/**
 * A normally distributed number (Box-Muller).
 * @param {() => number} random The generator.
 * @returns {number} Mean 0, standard deviation 1.
 */
function gaussian(random) {
  return Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
}

/**
 * Makes one person. The order of random calls is fixed, so the same seed gives the same people.
 * @param {() => number} random The generator.
 * @param {number} index 1-based number of the person.
 * @param {string} password Shared password.
 * @returns {object} The body for POST /users (without photoUploadId),.
 */
function makePerson(random, index, password) {
  const location = randomBangkokPoint(random);
  const genderRoll = random();
  const gender =
    genderRoll < 0.46
      ? "female"
      : genderRoll < 0.92
        ? "male"
        : genderRoll < 0.97
          ? "non_binary"
          : "prefer_not_to_say";
  // At least 19, so a December birthday is still 18 or older when the script runs late in the year.
  const age = Math.min(55, Math.max(19, Math.round(27 + gaussian(random) * 6)));
  const month = 1 + Math.floor(random() * 12);
  const day = 1 + Math.floor(random() * 28);
  const dateOfBirth = `${REFERENCE_YEAR - age}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Most people look for the other binary gender, some for the same one, a few for everyone.
  const lookRoll = random();
  let targetGenders;
  if (lookRoll < 0.1) {
    targetGenders = [...GENDERS];
  } else if (lookRoll < 0.2) {
    targetGenders = [gender === "prefer_not_to_say" ? "female" : gender];
  } else if (gender === "female") {
    targetGenders = ["male"];
  } else if (gender === "male") {
    targetGenders = ["female"];
  } else {
    targetGenders = ["female", "male"];
  }
  const minAge = Math.max(18, age - 2 - Math.floor(random() * 6));
  const maxAge = Math.min(60, age + 2 + Math.floor(random() * 10));
  const radiusKm = [5, 10, 20, 30, 50, 100][Math.floor(random() * 6)];
  const name = NAMES[Math.floor(random() * NAMES.length)];
  const imageSeed = Math.floor(random() * 4294967296);

  return {
    imageSeed,
    body: {
      username: `bkk_${String(index).padStart(3, "0")}`,
      password,
      displayName: name,
      dateOfBirth,
      gender,
      location,
      preferences: { minAge, maxAge, targetGenders, radiusKm },
    },
  };
}

/**
 * A square PNG of random RGB noise, made with node:zlib only. The same seed gives the same image.
 * @param {number} imageSeed Seed for the noise.
 * @param {number} size Width and height in pixels.
 * @returns {Buffer} The PNG file (noise does not compress: about 3 bytes per pixel).
 */
function makePng(imageSeed, size) {
  const noise = randomFrom(imageSeed);
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3); // first byte 0: no PNG row filter
    for (let i = 1; i < row.length; i++) {
      row[i] = Math.floor(noise() * 256);
    }
    rows.push(row);
  }
  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // color type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * CRC-32 of a buffer, as PNG chunks need.
 * @param {Buffer} buffer The bytes.
 * @returns {number} The checksum.
 */
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return crc ^ 0xffffffff;
}

/**
 * Calls the API and returns the status with the parsed JSON body.
 * @param {string} method HTTP method.
 * @param {string} url Full URL.
 * @param {object} [options] Optional JSON body or form data.
 * @returns {Promise<{ status: number, data: any }>} The answer.
 */
async function call(method, url, { json, form } = {}) {
  const response = await fetch(url, {
    method,
    headers:
      json === undefined
        ? { Accept: "application/json" }
        : { Accept: "application/json", "Content-Type": "application/json" },
    body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
    signal: AbortSignal.timeout(60_000),
  });
  const text = await response.text();
  let data = null;
  try {
    data = text === "" ? null : JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  return { status: response.status, data };
}

/**
 * Logs in as an existing user and sets its location to the one the seed gives it.
 * @param {string} baseUrl API base URL.
 * @param {{ body: object }} person The person.
 * @returns {Promise<"updated">} What happened.
 * @throws {Error} When the server refuses.
 */
async function moveExisting(baseUrl, person) {
  const { username, password, location } = person.body;
  const login = await call("POST", `${baseUrl}/sessions`, { json: { username, password } });
  if (login.status !== 201) {
    throw new Error(`log in ${login.status} ${JSON.stringify(login.data)}`);
  }
  const response = await fetch(`${baseUrl}/users/me`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${login.data.accessToken}`,
    },
    body: JSON.stringify({ location }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(`update location ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
  return "updated";
}

/**
 * Creates one user: checks the username, uploads the photo, then creates the profile.
 * @param {string} baseUrl API base URL.
 * @param {{ imageSeed: number, body: object }} person The person.
 * @param {number} imageSize Width and height of the noise photo in pixels.
 * @param {boolean} isUpdatingExisting Move an existing user to the seed's location.
 * @returns {Promise<"created" | "exists" | "updated">} What happened.
 * @throws {Error} When the server refuses.
 */
async function createUser(baseUrl, person, imageSize, isUpdatingExisting) {
  const { username } = person.body;
  const check = await call("GET", `${baseUrl}/usernames/${username}`);
  if (check.status === 200 && check.data?.isAvailable === false) {
    return isUpdatingExisting ? moveExisting(baseUrl, person) : "exists";
  }
  const form = new FormData();
  form.append(
    "photo",
    new Blob([makePng(person.imageSeed, imageSize)], { type: "image/png" }),
    `${username}.png`,
  );
  const upload = await call("POST", `${baseUrl}/photo-uploads`, { form });
  if (upload.status !== 201) {
    throw new Error(`photo upload ${upload.status} ${JSON.stringify(upload.data)}`);
  }
  const created = await call("POST", `${baseUrl}/users`, {
    json: { ...person.body, photoUploadId: upload.data.uploadId },
  });
  if (created.status === 409) {
    return "exists";
  }
  if (created.status !== 201) {
    throw new Error(`create user ${created.status} ${JSON.stringify(created.data)}`);
  }
  return "created";
}

/** Runs the script. */
async function main() {
  const options = readOptions(process.argv.slice(2));
  const random = randomFrom(options.seed);
  const people = Array.from({ length: options.count }, (_, i) =>
    makePerson(random, i + 1, options.password),
  );

  if (options.isDryRun) {
    for (const p of people) {
      const { username, gender, dateOfBirth, location, preferences } = p.body;
      print(
        `${username} ${gender.padEnd(17)} ${dateOfBirth} ${location.lat},${location.lon} -> ${preferences.targetGenders.join("/")} ${preferences.minAge}-${preferences.maxAge} ${preferences.radiusKm} km`,
      );
    }
    print(`Dry run: ${people.length} users, nothing sent.`);
    return;
  }

  print(`Seeding ${people.length} users at ${options.baseUrl} (seed ${options.seed})`);
  const counts = { created: 0, exists: 0, updated: 0, failed: 0 };
  let next = 0;
  let finished = 0;
  const worker = async () => {
    while (next < people.length) {
      const person = people[next++];
      try {
        counts[
          await createUser(options.baseUrl, person, options.imageSize, options.isUpdatingExisting)
        ]++;
      } catch (error) {
        counts.failed++;
        console.error(`${person.body.username}: FAILED ${error.message}`);
      }
      finished++;
      if (finished % 100 === 0 || finished === people.length) {
        print(
          `${finished}/${people.length} (${counts.created} created, ${counts.exists} existed, ${counts.updated} moved, ${counts.failed} failed)`,
        );
      }
    }
  };
  await Promise.all(Array.from({ length: options.concurrency }, worker));
  print(
    `Done: ${counts.created} created, ${counts.exists} already existed, ${counts.updated} moved, ${counts.failed} failed.`,
  );
  print(
    `Log in as ${people[0].body.username} to ${people[people.length - 1].body.username} with password "${options.password}".`,
  );
  process.exitCode = counts.failed > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
