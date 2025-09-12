function getColorPalettes(message = MESSAGE_TASK) {
  const codes = convertMessageToCharCodes(message);
  return {
    message: message,
    palettes: paletteGeneratorStrategies.map((strategy) => ({
      name: strategy.name,
      palette: buildPalette(codes, strategy.func)
    }))
  };
}

// Generate lowercase letters
const lower = Array.from({ length: 26 }, (_, i) => {
  const ch = String.fromCharCode("a".charCodeAt(0) + i);
  return { char: ch, code: ch.charCodeAt(0) };
});

// Generate uppercase letters
const upper = Array.from({ length: 26 }, (_, i) => {
  const ch = String.fromCharCode("A".charCodeAt(0) + i);
  return { char: ch, code: ch.charCodeAt(0) };
});

// Print nicely
lower.forEach((item) => {
  console.log(`${item.char}: ${item.code}`);
});

// Print nicely
upper.forEach((item) => {
  console.log(`${item.char}: ${item.code}`);
});
