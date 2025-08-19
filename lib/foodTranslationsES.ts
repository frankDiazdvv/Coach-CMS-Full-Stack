const spanishToEnglishDict: Record<string, string> = {
  "Carne molida": "Ground Beef",
  "Huevo": "Egg",
  "Tocino": "Bacon",
  "Queso": "Cheddar Cheese",
  "Plátano": "Banana",
  "Yogur griego": "Greek Yogurt",
  // add more common ingredients
};

async function translateToEnglish(query: string): Promise<string> {
  return spanishToEnglishDict[query] ?? query; // fallback: keep query
}
