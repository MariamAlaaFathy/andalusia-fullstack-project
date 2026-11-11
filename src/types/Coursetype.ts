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
  instructors: CourseInstructor[];
};

type CourseInstructor = {
  name: string;
  email: string;
  bio: string;
};

export type { Coursetype };