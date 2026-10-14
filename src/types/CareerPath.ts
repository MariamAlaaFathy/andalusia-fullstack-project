import type { CareerPathProgram } from "./CareerPathProgram";

export type CareerPath = {
  id: number;
  name: string;
  description: string;
  skills: string[];
  programs: CareerPathProgram[];
};
