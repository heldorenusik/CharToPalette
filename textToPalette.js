// define constant messages to use for palette generation
const MESSAGE_TASK = "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.";
const MESSAGE_EXTRA = "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, but a hobbit-hole.";
const MESSAGE_ALPHABET = "abcdefghijklmnopqrstuvwxyz";

const DEFAULT_MESSAGES = [MESSAGE_TASK, MESSAGE_EXTRA, MESSAGE_ALPHABET]; // list of messages to analyze by default

const COLOR_VALUE_MAX = 255; // max value for RGB channels

// define char code ranges to play with when using scaling ranges
const CHAR_CODE_LOWER_MIN = "a".charCodeAt(); // 97
const CHAR_CODE_LOWER_MAX = "z".charCodeAt(); // 122
const CHAR_CODE_UPPER_MIN = "A".charCodeAt(); // 65
const CHAR_CODE_UPPER_MAX = "Z".charCodeAt(); // 90
// define default interval range that will be used in scale algorighms
const CODE_INTERVAL_MIN = CHAR_CODE_LOWER_MIN;
const CODE_INTERVAL_MAX = CHAR_CODE_LOWER_MAX;

// define some util functions

/**
 * remove all space characters from a string
 */
function removeSpaces(str) {
  return str.replaceAll(" ", "");
}

/**
 * removes all non-english symbols and converts to lower case
 * 
 */
function cleanTextToLowercaseEnglishLettersOnly(input) {
  return input.toLowerCase().replace(/[^a-z]/g, ""); // keep only English letters
}

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
 * clamp number into [min; max] interval
 */
function clamp(value, min = 0, max = COLOR_VALUE_MAX) {
  return Math.min(max, Math.max(min, value));
}

/**
 * wrap number into [0; max] range usingg modulo operation
 */
function wrapToRangeWithReminder(value, max = 256) {
  const reminder = value % max;
  return reminder < 0 ? reminder + max : reminder;
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
function scaleValue(value, fromMin = CODE_INTERVAL_MIN, fromMax = CODE_INTERVAL_MAX, toMin = 0, toMax = COLOR_VALUE_MAX) {
  let checkedValue = clamp(value, fromMin, fromMax); // ensure value is within the input range
  return Math.floor(((checkedValue - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin); //just a simple proportion to convert value from one range to another
}

// === different strategies to convert character to HEX color ===

/**
 * convert char code to HEX color using "raw" mapping
 */
function charCodeToHexColor_raw(code) {
  const checkedCode = clamp(code); // clamp code to [0; 255]
  const r = checkedCode;
  const g = checkedCode;
  const b = checkedCode;
  return rgbToHex(r, g, b);
}

/**
 * convert char code to HEX color using RGB reminder mapping with multipliers for each color channel to get more color variety
 */
function charCodeToHexColor_multiplierReminderMapping(code, multiplierR = 2, multiplierG = 7, multiplierB = 12) {
  // map code to [0; 255] intervals, use different multipliers for Red, Green and Blue
  const r = wrapToRangeWithReminder(code * multiplierR);
  const g = wrapToRangeWithReminder(code * multiplierG);
  const b = wrapToRangeWithReminder(code * multiplierB);
  return rgbToHex(r, g, b);
}

/**
 * convert char code to HEX using spectrum scale mapping
 */
function charCodeToHexColor_spectrumScale(code) {
  const scaledValue = scaleValue(code);
  const r = scaledValue;
  const g = scaledValue;
  const b = scaledValue;
  return rgbToHex(r, g, b);
}

/**
 * convert char code to HEX color using single channel push to max based on condition
 */
function charCodeToHexColor_singleChannelCondition(code) {
  let r = 0;
  let g = 0;
  let b = 0;
  const scaledValue = scaleValue(code);
  // just some condition to select a single color channel and push it to max
  if (scaledValue < COLOR_VALUE_MAX / 3) {
    r = COLOR_VALUE_MAX;
  } else if (scaledValue > (COLOR_VALUE_MAX * 2) / 3) {
    b = COLOR_VALUE_MAX;
  } else {
    g = COLOR_VALUE_MAX;
  }
  return rgbToHex(r, g, b);
}

/**
 * convert char code to HEX color using HSL conversion
 * @param code - character code
 * @param saturation - saturation value [0; 100], default is 100
 * @param lightness - lightness value [0; 100], default is 50
 */
function charCodeToHexColor_hsl(code, saturation = 100, lightness = 50) {
  const hue = scaleValue(code, CODE_INTERVAL_MIN, CODE_INTERVAL_MAX, 0, 360); // scale code to [0; 360] for hue
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

// === prepare functions for outputting results ===

// define array of strategies to run. Each strategy is an object with name and function
const paletteGeneratorStrategies = [
  { name: "Raw (r == g == b -> grey)", func: charCodeToHexColor_raw },
  { name: "RGB multipliers with mod: (code * m) % 255 [r = 2, g = 7, b = 12]", func: charCodeToHexColor_multiplierReminderMapping },
  { name: "Spectrum Scale (r == g == b -> grey)", func: charCodeToHexColor_spectrumScale },
  { name: "Single Channel (show RED, GREEN or BLUE depending on condition)", func: charCodeToHexColor_singleChannelCondition },
  { name: "HSL (saturation = 100, lightness = 50)", func: charCodeToHexColor_hsl },
  { name: "HSL (saturation = 35, lightness = 65)", func: (code) => charCodeToHexColor_hsl(code, 35, 65) }
];

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
 * calculate unique colors count without using Set
 */
function calculateUniqueColorsCount2(palette) {
  const seenColors = {}; // object to track seen colors
  let count = 0;
  for (const color of palette) {
    // check if color is already seen
    if (!seenColors[color]) {
      seenColors[color] = true; // mark as seen
      count++; // increment count
    }
  }
  return count;
}

/**
 * convert message string to array of char codes
 */
function convertMessageToCharCodes(message) {
  const codes = []; // define array of codes
  for (let ch of message) {
    codes.push(ch.charCodeAt()); // add code to codes array
  }
  return codes;
}

/**
 * pring task results for palette created with specific strategy
 */
function printPaletteResults(palette, strategyName) {
  console.log(`\n=== ${strategyName} ===`);
  console.log(`Palette: ${palette}`);
  console.log(`All colors count: ${palette.length}`);
  console.log(`Unique colors count: ${calculateUniqueColorsCount(palette)}`);
  console.log(`Preview:\n${palette.join(" ")}`);
}

/**
 * analyze message as color palette using different strategies and output results to console
 */
function analyzeMessageAsColorPalette(message) {
  let modifiedMessage = removeSpaces(message); // remove spaces
  // modifiedMessage = modifiedMessage.toLowerCase(); // convert to lowercase
  // modifiedMessage = cleanTextToLowercaseEnglishLettersOnly(message); //removes all non-english symbols and converts to lowercase
  const codes = convertMessageToCharCodes(modifiedMessage); // get array of char codes
  // print initial info
  console.log(`Original message: ${message}`);
  console.log(`Moldified message: ${modifiedMessage}`);
  console.log(`Char codes: {${codes.join(", ")}}`);
  // loop over strategies, generate palettes and log results
  for (const strategy of paletteGeneratorStrategies) {
    const palette = buildPalette(codes, strategy.func);
    printPaletteResults(palette, strategy.name);
  }
}

/**
 * combine entered message with default list
 */
function getMessagesToAnalyze(enteredMessage) {
  if (!enteredMessage || enteredMessage.trim() === "") {
    return DEFAULT_MESSAGES;
  } else {
    return [enteredMessage, ...DEFAULT_MESSAGES];
  }
}

// main function to run application logic
function main() {
  // !!! requires module installed. May not work in browser online tool -> just comment it then
  const prompt = require("prompt-sync")(); // <-- request prompt-sync.
  let inputMessage = prompt("Please, enter a message: "); // request enter a message
  const messages = getMessagesToAnalyze(inputMessage); // retrieve all messages to analyze
  for (let i = 0; i < messages.length; i++) {
    console.log("\n" + "*".repeat(50) + `( ${i + 1} )` + "*".repeat(50));
    analyzeMessageAsColorPalette(messages[i]);
  }
}

// run application logic
main();
