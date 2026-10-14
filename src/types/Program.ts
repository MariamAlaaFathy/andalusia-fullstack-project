import type { CourseReference } from "./CourseReference";

export type Program = {
  id: number;
  name: string;
  description: string;
  careerPathId: number;
  careerPathName: string;
  courses: CourseReference[];
};
