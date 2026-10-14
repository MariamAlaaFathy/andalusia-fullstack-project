import type { CourseReference } from "./CourseReference";

export type CareerPathProgram = {
  id: number;
  name: string;
  courses: CourseReference[];
};
