import {
  calculateProtestRisk,
  calculateCorruptionRisk,
} from "../utils/calculations";

describe("Utility Functions", () => {
  test("calculateProtestRisk returns correct risk value", () => {
    const region = { socialAcceptance: 50 };
    const player = { reputation: 60 };

    const risk = calculateProtestRisk(region, player);

    // Oczekiwana wartość = 100 - 50 (socialAcceptance) - 60/5 (reputation/5)
    expect(risk).toBe(38);
  });

  // Więcej testów...
});
