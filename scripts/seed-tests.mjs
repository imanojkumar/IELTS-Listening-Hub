/**
 * seed-tests.mjs — single source of truth for the 10 listening tests.
 *
 * Content was transcribed from the question snapshots shipped in the content
 * library (public/images/testNN.png). Run once to (re)generate the JSON test
 * files under src/data/tests. Authoring uses `___N___` to mark blank N.
 *
 *   node scripts/seed-tests.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "tests");
mkdirSync(OUT, { recursive: true });

/** "42 ___2___ Drive" -> [{text:"42 "},{blank:2},{text:" Drive"}] */
function seg(str) {
  const parts = String(str).split(/___(\d+)___/);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i] !== "") out.push({ text: parts[i] });
    } else {
      out.push({ blank: Number(parts[i]) });
    }
  }
  return out;
}
const blanksIn = (segs) => segs.filter((s) => s.blank).map((s) => s.blank);

function group(g) {
  const numbers = new Set();
  if (g.formRows) g.formRows.forEach((r) => (r.segments = seg(r.raw), blanksIn(r.segments).forEach((n) => numbers.add(n))));
  if (g.tableRows) {
    g.tableRows = g.tableRows.map((row) =>
      row.map((cell) => {
        const segments = seg(cell);
        blanksIn(segments).forEach((n) => numbers.add(n));
        return { segments };
      }),
    );
  }
  if (g.noteLines) g.noteLines.forEach((l) => (l.segments = seg(l.raw), blanksIn(l.segments).forEach((n) => numbers.add(n))));
  const nums = [...numbers].sort((a, b) => a - b);
  const range = nums.length ? `${nums[0]}-${nums[nums.length - 1]}` : g.range || "";
  const clean = { id: g.id, type: g.type, range, numbers: nums, marks: nums.length, instructions: g.instructions };
  if (g.wordLimit) clean.wordLimit = g.wordLimit;
  if (g.heading) clean.heading = g.heading;
  if (g.formRows) clean.formRows = g.formRows.map((r) => ({ label: r.label, segments: r.segments }));
  if (g.tableColumns) clean.tableColumns = g.tableColumns;
  if (g.tableRows) clean.tableRows = g.tableRows;
  if (g.noteLines)
    clean.noteLines = g.noteLines.map((l) => {
      const o = { segments: l.segments };
      if (l.heading) o.heading = true;
      if (l.bullet) o.bullet = true;
      return o;
    });
  return clean;
}

const WL_OWN = "Write ONE WORD AND/OR A NUMBER for each answer.";
const WL_ONE = "Write ONE WORD ONLY for each answer.";
const WL_TWO = "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.";
const WL_NM1 = "Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer.";

function build({ id, slug, title, groups, answers }) {
  const builtGroups = groups.map(group);
  const total = builtGroups.reduce((n, g) => n + g.numbers.length, 0);
  const section = {
    id: 1,
    title: "Section 1",
    durationSeconds: 480,
    questionRange: `1-${total}`,
    groups: builtGroups,
  };
  const nn = String(id).padStart(2, "0");
  return {
    id,
    slug,
    title,
    type: "IELTS General Training",
    audio: `/audio/${slug}.mp3`,
    image: `/images/${slug}.png`,
    totalQuestions: total,
    durationSeconds: 480,
    sections: [section],
    answers,
  };
}

const tests = [];

// ---------------------------------------------------------------- TEST 01
tests.push(build({
  id: 1, slug: "test01", title: "IELTS General Listening Test 1",
  groups: [
    { id: "g1", type: "form", instructions: "Complete the form below.", wordLimit: WL_OWN,
      heading: "Greenfield Community Centre – Room Hire Enquiry",
      formRows: [
        { label: "Name:", raw: "Mark ___1___" },
        { label: "Address:", raw: "42 ___2___ Drive, Greenfield" },
        { label: "Telephone:", raw: "07982 ___3___" },
        { label: "Type of event:", raw: "___4___ party" },
        { label: "Preferred date:", raw: "___5___" },
      ] },
    { id: "g2", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Room Name", "Capacity", "Cost per Hour", "Key Features"],
      tableRows: [
        ["Oak Room", "45", "£ ___6___", "Direct access to the ___7___"],
        ["Main Hall", "___8___", "£25", "Has a large stage and professional ___9___ equipment"],
        ["The ___10___", "30", "£12", "Nice wooden floor. Does not have any tables or chairs."],
      ] },
  ],
  answers: { 1: ["Fletcher"], 2: ["Willow"], 3: ["55431"], 4: ["birthday"],
    5: ["14th September", "14 September", "September 14"], 6: ["15"], 7: ["kitchen"],
    8: ["80"], 9: ["lighting"], 10: ["Studio"] },
}));

// ---------------------------------------------------------------- TEST 02
tests.push(build({
  id: 2, slug: "test02", title: "IELTS General Listening Test 2",
  groups: [
    { id: "g1", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Room", "Facilities", "Other Information", "Cost per Hour"],
      tableRows: [
        ["Willow Room", "Digital projector", "Popular for meetings", "$25"],
        ["Elm Room", "Natural lighting and a ___1___", "Access to shared ___2___", "$40"],
        ["Grand Hall", "Adjustable ___3___", "Doors lead to the ___4___", "$ ___5___"],
      ] },
    { id: "g2", type: "form", instructions: "Complete the form below.", wordLimit: WL_TWO,
      heading: "Oakwood Community Center – Club Registration",
      formRows: [
        { label: "Applicant Name:", raw: "Sarah Jennings" },
        { label: "Contact Number:", raw: "___6___" },
        { label: "Club Name:", raw: "Oakwood ___7___ Club" },
        { label: "Event Date:", raw: "___8___ April" },
        { label: "Required Deposit:", raw: "$ ___9___" },
        { label: "Payment Method:", raw: "___10___" },
      ] },
  ],
  answers: { 1: ["stage"], 2: ["kitchen"], 3: ["spotlights"], 4: ["courtyard"], 5: ["75"],
    6: ["0935 671 982", "0935671982"], 7: ["Lens"], 8: ["21st", "21"], 9: ["85"], 10: ["bank transfer"] },
}));

// ---------------------------------------------------------------- TEST 03
tests.push(build({
  id: 3, slug: "test03", title: "IELTS General Listening Test 3",
  groups: [
    { id: "g1", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Room Name", "Capacity", "Included Features", "Cost per Hour"],
      tableRows: [
        ["The Willow Room", "40", "Small ___1___ attached", "£15"],
        ["The ___2___ Room", "80", "Built-in dance floor and a ___3___", "£25"],
        ["The Pine Suite", "120", "Large ___4___ facing the park", "£ ___5___"],
      ] },
    { id: "g2", type: "notes", instructions: "Complete the notes below.", wordLimit: WL_ONE,
      heading: "Event Details & Rules",
      noteLines: [
        { bullet: true, raw: "Must pay a ___6___ to fully secure the booking." },
        { bullet: true, raw: "A special ___7___ is required from the local council if selling alcohol." },
        { bullet: true, raw: "Need to arrange own ___8___ for the guests in case of accidents." },
        { bullet: true, raw: "Free parking is available behind the ___9___ at weekends." },
        { bullet: true, raw: "Manager's surname: ___10___" },
      ] },
  ],
  answers: { 1: ["kitchen"], 2: ["Oak"], 3: ["stage"], 4: ["balcony"], 5: ["40"],
    6: ["deposit"], 7: ["license", "licence"], 8: ["insurance"], 9: ["library"], 10: ["Bramley"] },
}));

// ---------------------------------------------------------------- TEST 04
tests.push(build({
  id: 4, slug: "test04", title: "IELTS General Listening Test 4",
  groups: [
    { id: "g1", type: "form", instructions: "Complete the notes below.", wordLimit: WL_OWN,
      heading: "Booking Enquiry Form",
      formRows: [
        { label: "Name:", raw: "John ___1___" },
        { label: "Event type:", raw: "___2___ party" },
        { label: "Date preferred:", raw: "15th ___3___" },
        { label: "Number of guests:", raw: "___4___" },
        { label: "Room choice:", raw: "The ___5___ Room" },
      ] },
    { id: "g2", type: "table", instructions: "Complete the table below.", wordLimit: WL_ONE,
      tableColumns: ["Service", "Details", "Cost"],
      tableRows: [
        ["Catering", "Hot buffet including ___6___", "$25 per person"],
        ["Drinks", "___7___ and tea station", "$40 flat fee"],
        ["Cleaning", "Must dispose of ___8___", "$50 deposit"],
        ["Extras", "Renting a ___9___", "$30"],
        ["Music", "Live band requires a ___10___", "Free"],
      ] },
  ],
  answers: { 1: ["Sterling"], 2: ["anniversary"], 3: ["November"], 4: ["85"], 5: ["Oak"],
    6: ["dessert"], 7: ["coffee"], 8: ["rubbish"], 9: ["projector"], 10: ["permit"] },
}));

// ---------------------------------------------------------------- TEST 05
tests.push(build({
  id: 5, slug: "test05", title: "IELTS General Listening Test 5",
  groups: [
    { id: "g1", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Room", "Capacity", "Main Feature"],
      tableRows: [
        ["Willow Room", "40", "Views of the ___1___"],
        ["Banquet Hall", "120", "Large ___2___ for live music"],
        ["The ___3___", "___4___", "Beautiful glass ___5___"],
      ] },
    { id: "g2", type: "form", instructions: "Complete the notes below.", wordLimit: WL_OWN,
      heading: "Event Booking Details",
      formRows: [
        { label: "Catering style preferred:", raw: "___6___" },
        { label: "Special dietary requirement:", raw: "___7___ items" },
        { label: "Date of event:", raw: "___8___" },
        { label: "Deposit amount:", raw: "£ ___9___" },
        { label: "Customer name:", raw: "Arthur ___10___" },
      ] },
  ],
  answers: { 1: ["river"], 2: ["stage"], 3: ["Conservatory"], 4: ["60", "sixty"], 5: ["roof"],
    6: ["buffet"], 7: ["gluten-free"], 8: ["14 September", "14th September"], 9: ["150"], 10: ["Pendelton"] },
}));

// ---------------------------------------------------------------- TEST 06
tests.push(build({
  id: 6, slug: "test06", title: "IELTS General Listening Test 6",
  groups: [
    { id: "g1", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Class Name", "Main Focus", "Other Details", "Cost"],
      tableRows: [
        ["'Bake and Make'", "bread and pastries", "taught by a local ___1___", "£45"],
        ["'Taste of Asia'", "traditional ___2___", "lesson on using spices", "£ ___3___"],
        ["'Ocean Bounty'", "preparing ___4___", "bring own ___5___", "£55"],
      ] },
    { id: "g2", type: "table", instructions: "Complete the table below.", wordLimit: WL_ONE,
      tableColumns: ["Topic", "Details"],
      tableRows: [
        ["Location", "next to the city ___6___"],
        ["Parking", "free on ___7___ evenings"],
        ["Allergies", "must inform staff of any ___8___ allergy"],
        ["Discounts", "10% off for a ___9___ booking"],
        ["Contact", "Manager: Peter ___10___"],
      ] },
  ],
  answers: { 1: ["baker"], 2: ["curry"], 3: ["60", "sixty"], 4: ["seafood"], 5: ["apron"],
    6: ["library"], 7: ["weekend", "weekends"], 8: ["nut"], 9: ["group"], 10: ["Finch"] },
}));

// ---------------------------------------------------------------- TEST 07
tests.push(build({
  id: 7, slug: "test07", title: "IELTS General Listening Test 7",
  groups: [
    { id: "g1", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Model", "Main Features", "Cost per Week"],
      tableRows: [
        ["Explorer", "Sleeps 4, small kitchen, built-in ___1___", "£650"],
        ["Voyager", "Large dining space, attached ___2___ rack", "£725"],
        ["Cruiser", "Spacious, solar panel, high-quality ___3___ for cold nights", "£ ___4___"],
        ["Mileage limit", "Maximum of ___5___ kilometres per week", ""],
      ] },
    { id: "g2", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Item / Policy", "Details"],
      tableRows: [
        ["Cooking", "Portable ___6___ available for £25"],
        ["Furniture", "Pack includes folding chairs and a lightweight ___7___"],
        ["Connectivity", "Portable ___8___ provides internet access (£20)"],
        ["Returning the van", "A ___9___ fee applies if the waste water tank is not emptied"],
        ["Contact", "Email driver's license to David ___10___ (Bookings Manager)"],
      ] },
  ],
  answers: { 1: ["shower"], 2: ["bicycle", "bike"], 3: ["heater"], 4: ["840"], 5: ["1000", "1,000"],
    6: ["barbecue", "BBQ"], 7: ["table"], 8: ["router"], 9: ["cleaning"], 10: ["Sutton"] },
}));

// ---------------------------------------------------------------- TEST 08
tests.push(build({
  id: 8, slug: "test08", title: "IELTS General Listening Test 8",
  groups: [
    { id: "g1", type: "table", instructions: "Complete the table below.", wordLimit: WL_OWN,
      tableColumns: ["Venue", "Capacity", "Cost", "Notes"],
      tableRows: [
        ["River Lounge", "60", "£ ___1___", "Has an outdoor terrace. No ___2___ allowed."],
        ["Bridge Room", "___3___", "£225", "Soundproofed. Includes a private ___4___."],
        ["The Cellar", "40", "£100", "Unique brick arches. No disabled ___5___."],
      ] },
    { id: "g2", type: "form", instructions: "Complete the form below.", wordLimit: WL_OWN,
      heading: "Riverside Venues Booking Form",
      formRows: [
        { label: "Customer Name:", raw: "Mark ___6___" },
        { label: "Payment method:", raw: "Bank ___7___" },
        { label: "Food requested:", raw: "Hot ___8___" },
        { label: "Deposit amount:", raw: "£ ___9___" },
        { label: "Agreed set-up time:", raw: "___10___" },
      ] },
  ],
  answers: { 1: ["150"], 2: ["bands", "live bands"], 3: ["80", "eighty"], 4: ["bar", "private bar"], 5: ["access"],
    6: ["Hemmings"], 7: ["transfer"], 8: ["buffet"], 9: ["50"], 10: ["6 pm", "6", "6:00", "6:00 pm", "6.00"] },
}));

// ---------------------------------------------------------------- TEST 09
tests.push(build({
  id: 9, slug: "test09", title: "IELTS General Listening Test 9",
  groups: [
    { id: "g1", type: "notes", instructions: "Complete the form below.", wordLimit: WL_OWN,
      heading: "Riverside Community Centre – Booking Enquiry",
      noteLines: [
        { heading: true, raw: "Event Details" },
        { raw: "Type of event: 50th ___1___ party" },
        { raw: "Date requested: 14th ___2___" },
        { raw: "Number of guests expected: ___3___" },
        { raw: "Room selected: ___4___ Room" },
        { heading: true, raw: "Cost and Rules" },
        { raw: "Hourly rate: £40" },
        { raw: "Deposit required: £ ___5___ (refundable)" },
        { raw: "Rule: No loud ___6___ after 10 PM." },
        { heading: true, raw: "Additional Information" },
        { raw: "Parking code: ___7___" },
        { raw: "Catering recommendation: 'Fresh ___8___'" },
        { raw: "Equipment for hire: ___9___ (cost: £15)" },
        { raw: "Clean-up: All ___10___ must be placed in outside bins." },
      ] },
  ],
  answers: { 1: ["birthday"], 2: ["April"], 3: ["45", "forty-five"], 4: ["Cedar"], 5: ["100", "one hundred"],
    6: ["music"], 7: ["4920"], 8: ["Bites"], 9: ["projector"], 10: ["rubbish"] },
}));

// ---------------------------------------------------------------- TEST 10
tests.push(build({
  id: 10, slug: "test10", title: "IELTS General Listening Test 10",
  groups: [
    { id: "g1", type: "form", instructions: "Complete the form below.", wordLimit: WL_TWO,
      heading: "Oakwood Community Center – Booking Form",
      formRows: [
        { label: "Customer Name:", raw: "Mark ___1___" },
        { label: "Event type:", raw: "___2___ party" },
        { label: "Date of event:", raw: "14th ___3___" },
        { label: "Number of guests:", raw: "___4___" },
        { label: "Room booked:", raw: "___5___" },
        { label: "Parking:", raw: "Available at the back, and is ___6___" },
      ] },
    { id: "g2", type: "table", instructions: "Complete the table below.", wordLimit: WL_NM1,
      tableColumns: ["Item", "Cost", "Notes"],
      tableRows: [
        ["Room hire", "£45 per hour", "For weekend bookings"],
        ["Projector", "£ ___7___", "Flat fee for slideshows"],
        ["Room setup", "£30", "Customer will do this with help from ___8___"],
        ["Damage deposit", "£ ___9___", "Refundable if room is in good condition"],
        ["Kitchen surcharge", "£15", "Required when a ___10___ is used"],
      ] },
  ],
  answers: { 1: ["Harrison"], 2: ["anniversary"], 3: ["September"], 4: ["85"], 5: ["Main Hall"], 6: ["free"],
    7: ["25"], 8: ["brothers", "brother"], 9: ["150"], 10: ["caterer"] },
}));

for (const t of tests) {
  const file = join(OUT, `${t.slug}.json`);
  writeFileSync(file, JSON.stringify(t, null, 2) + "\n");
  console.log(`  wrote ${t.slug}.json  (${t.totalQuestions} questions, ${t.sections[0].groups.length} groups)`);
}
console.log(`Seeded ${tests.length} tests -> src/data/tests`);
