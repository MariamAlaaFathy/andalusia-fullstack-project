type Coursetype = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  programId: number;
  programName: string;
  careerPathId: number;
  careerPathName: string;
  duration: string;
  level: string;
  prerequisites: string[];
  learningOutcomes: string[];
};

export type { Coursetype };