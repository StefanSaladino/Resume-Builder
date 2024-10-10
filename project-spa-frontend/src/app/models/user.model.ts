export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  resume: any; // You can define a more specific type for the resume if desired
}