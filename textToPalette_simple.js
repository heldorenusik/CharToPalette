const MESSAGE_TASK = "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.";
const MESSAGE_EXTRA = "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, but a hobbit-hole.";
const MESSAGE_ALPHABET = "abcdefghijklmnopqrstuvwxyz";

// define char code ranges to play with when using scaling ranges
const CHAR_CODE_LOWER_MIN = "a".charCodeAt(); // 97
const CHAR_CODE_LOWER_MAX = "z".charCodeAt(); // 122
const CHAR_CODE_UPPER_MIN = "A".charCodeAt(); // 65
const CHAR_CODE_UPPER_MAX = "Z".charCodeAt(); // 90
// define default interval range that will be used in scale algorighms
const CODE_INTERVAL_MIN = CHAR_CODE_LOWER_MIN;
const CODE_INTERVAL_MAX = CHAR_CODE_LOWER_MAX;

const prompt = require("prompt-sync")(); // <-- import prompt-sync
let inputMessage = prompt("Please, enter a message: "); // request enter a amessage
// check if inputMessage is empty. If it's empty then use default one
if (!inputMessage || inputMessage.trim() === "") {
  inputMessage = MESSAGE_TASK;
}
const modifiedMessage = inputMessage.replaceAll(" ", ""); // remove spaces

const codes = []; // define array of codes
for (let ch of modifiedMessage) {
  codes.push(ch.charCodeAt()); // add code to codes array
}

console.log(`Original message: ${inputMessage}`);
console.log(`Moldified message (no spaces): ${modifiedMessage}`);
console.log(`Char codes: {${codes.join(", ")}}`);

/**
 *  build palette from codes using a chosen strategy
 */
function buildPalette(codes, strategyFunction) {
  const palette = []; // define an empty array
  for (let code of codes) {
    const hexColor = strategyFunction(code); // get HEX color using the strategy function
    palette.push(hexColor); // add the color to the palette array
  }
  return palette;
}

/**
 * calculate unique colors count using Set
 */
function calculateUniqueColorsCount(palette) {
  const uniqueColorsSet = new Set(palette);
  return uniqueColorsSet.size;
}

/**
 * pring task results for palette created with specific strategy
 */
function printPaletteResults(palette, strategyName) {
  console.log(`\n=== ${strategyName} ===`);
  console.log(`Palette: ${palette.join(", ")}`);
  console.log(`All colors count: ${palette.length}`);
  console.log(`Unique colors count: ${calculateUniqueColorsCount(palette)}`);
}

// run application logic
let palette = buildPalette(codes, charCodeToHexColor_raw);
printPaletteResults(palette, "Raw");

palette = buildPalette(codes, charCodeToHexColor_hsl);
printPaletteResults(palette, "HSL");

// === different strategies to convert character to HEX color ===

/**
 * convert char code to HEX color using "raw" mapping
 */
function charCodeToHexColor_raw(code) {
  const r = code;
  const g = code;
  const b = code;
  return rgbToHex(r, g, b);
}

/**
 * convert char code to HEX color using HSL conversion
 * @param code - character code
 * @param saturation - saturation value [0; 100], default is 100
 * @param lightness - lightness value [0; 100], default is 50
 */
function charCodeToHexColor_hsl(code, saturation = 100, lightness = 50) {
  const hue = scaleValue(code, CODE_INTERVAL_MIN, CODE_INTERVAL_MAX, 0, 359); // scale code to [0; 360) for hue
  return hslToHex(hue, saturation, lightness);
}

/**
 * convert HSL to HEX; hue: [0; 360], saturation: [0; 100], lightness: [0; 100]
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2;
  let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
}

//=== util functions ===

/**
 * convert value to 2-digit HEX, adding leading zero if needed
 * value must be in [0; 255] range
 */
function toHex(value) {
  return value.toString(16).padStart(2, "0");
}

/**
 * convert RGB values to HEX color string
 * r, g, b must be integer in [0; 255] range
 */
function rgbToHex(r, g, b) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * scale value from range [fromMin, fromMax] to range [toMin, toMax]
 *
 * fromMax must be greater than fromMin
 * toMax must be greater than toMin
 *
 * lets take lowercase letters range by default to see the most intense colors (upper letter will be counted as min value in this case)
 * if you want to use other range, just provide fromMin and fromMax parameters:
 * for example [CHAR_CODE_UPPER_MIN, CHAR_CODE_LOWER_MAX] or [0, 127]
 */
function scaleValue(value, fromMin = CODE_INTERVAL_MIN, fromMax = CODE_INTERVAL_MAX, toMin = 0, toMax = 255) {
  let checkedValue = clamp(value, fromMin, fromMax); // ensure value is within the input range
  return Math.floor(((checkedValue - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin); //just a simple proportion to convert value from one range to another
}

/**
 * clamp number into [min; max] interval
 */
function clamp(value, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}
