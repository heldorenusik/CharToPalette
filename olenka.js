const prompt = require("prompt-sync")(); // <-- import prompt-sync
let message = prompt("Please, enter a message: "); // request enter a amessage
let noSpacesMessage = message.replaceAll(" ", "");
console.log(noSpacesMessage); // remove spaces
const codes = []; // define array of codes
for (let symbol of noSpacesMessage) {
  let code = symbol.charCodeAt();
  let color = convertCodeToHexColor(code);
  console.log(symbol + " -> " + code + " -> " + color);
}

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

function convertCodeToHexColor(code) {
  const r = code;
  const g = code;
  const b = code;
  return rgbToHexColor(r, g, b);
}
