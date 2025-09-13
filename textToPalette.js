// define constant messages to use for palette generation
const MESSAGE_TASK = "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.";
// const MESSAGE_TASK = "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, but a hobbit-hole.";
// const MESSAGE_TASK = "abcdefghijklmnopqrstuvwxyz";

/**
 * convert value to 2-digit HEX string, adding leading zero if needed
 * value must be in [0; 255] range
 */
function toHex(value) {
  return value.toString(16).padStart(2, "0");
}

/**
 * convert RGB values to HEX color string
 * r, g, b must be integer in [0; 255] range
 */
function rgbToHexColor(r, g, b) {
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

/**
 * scale value from range [fromMin, fromMax] to range [toMin, toMax]
 */
function scaleValue(value, fromMin, fromMax, toMin, toMax) {
  return Math.floor(((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin); //a proportion to convert value from one range to another
}

/**
 * convert char code to HEX color using raw code as is
 */
function convertCodeToHexColor(code) {
  const r = code;
  const g = code;
  const b = code;
  return rgbToHexColor(r, g, b);
}

/**
 * convert char code to HEX color using HSL conversion
 * @param code - character code
 * @param saturation - saturation value [0; 100], default is 100
 * @param lightness - lightness value [0; 100], default is 50
 * @returns hex color string
 */
function convertCodeToHexColorHSL(code, saturation = 100, lightness = 50) {
  // scale code from [0; 127] range to [0; 360) for hue
  // we may use another interval to see more variety of colors (char codes from a to z for example)
  const hue = scaleValue(code, 0, 127, 0, 359);
  return hslToHex(hue, saturation, lightness);
}

/**
 * Thanks chat gpt!
 * convert HSL color representation to HEX
 * @param h - hue value [0; 360)
 * Hue is the pure color itself, such as red, yellow, green, or blue, representing its position on a 360-degree color wheel
 * @param saturation - saturation value [0; 100]
 * @param lightness - lightness value [0; 100]
 * @returns hex color string
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2;
  let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHexColor(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
}

/**
 * count unique colors in the array using Set
 */
function countUniqueColors(values) {
  return new Set(values).size;
}

// const prompt = require("prompt-sync")(); // <-- import prompt-sync
// let message = prompt("Please, enter a message: "); // request enter a amessage
// if (!message) {
//   message = MESSAGE_TASK; // use default message if none entered
// }
let message = MESSAGE_TASK; // use default message
console.log(`Original message: ${message}`);
let noSpacesMessage = message.replaceAll(" ", ""); // remove spaces
console.log(`Message without spaces: ${noSpacesMessage}`);
const codes = []; // define array of codes
const colors = []; // define array of colors
const vibrantColors = []; //define array for more vibrant colors
for (let symbol of noSpacesMessage) {
  let code = symbol.charCodeAt();
  let color = convertCodeToHexColor(code);
  let vibrantColor = convertCodeToHexColorHSL(code);
  console.log(symbol + " -> " + code + " -> " + color + " / " + vibrantColor);
  codes.push(code);
  colors.push(color);
  vibrantColors.push(vibrantColor);
}
const colorsCount = colors.length;
console.log(`Char codes are: ${codes.join(", ")}`);
console.log(`Raw colors are: ${colors.join(", ")}`);
console.log(`Vibrant colors are: ${vibrantColors.join(", ")}`);
console.log(`Total colors count = ${colorsCount}`);
console.log(`Unique raw colors count: ${countUniqueColors(colors)}`);
console.log(`Unique vibrant colors count: ${countUniqueColors(vibrantColors)}`);
