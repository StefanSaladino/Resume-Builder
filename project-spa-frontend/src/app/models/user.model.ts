/**
 * User interface representing the structure of a user object
 * in the application. This interface defines the properties
 * associated with a user, including personal details and
 * verification status.
 * 
 * Properties:
 * - _id: Unique identifier for the user
 * - email: Email address of the user
 * - firstName: First name of the user
 * - lastName: Last name of the user
 * - isVerified: Indicates if the user's email is verified
 * - resume: Represents the user's resume
 */

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  resume: any; 
}