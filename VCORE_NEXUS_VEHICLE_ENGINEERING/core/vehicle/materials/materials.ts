export interface EngineeringMaterial {
  id: string;
  name: string;
  family: "STEEL" | "ALUMINUM" | "TITANIUM" | "COMPOSITE";
  yieldStrengthMpa: number;
  densityKgM3: number;
}

export const MATERIALS: EngineeringMaterial[] = [
  {
    id: "CROMOLY_4130",
    name: "AISI 4130 Chromoly",
    family: "STEEL",
    yieldStrengthMpa: 435,
    densityKgM3: 7850
  },
  {
    id: "STEEL_1018",
    name: "AISI 1018 Carbon Steel",
    family: "STEEL",
    yieldStrengthMpa: 370,
    densityKgM3: 7870
  },
  {
    id: "ALUMINUM_6061_T6",
    name: "6061-T6 Aluminum",
    family: "ALUMINUM",
    yieldStrengthMpa: 276,
    densityKgM3: 2700
  }
];
