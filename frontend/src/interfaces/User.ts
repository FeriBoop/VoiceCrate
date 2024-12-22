export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  role: string; // Enum for roles
  isBanned: boolean; // Indicates if the user is banned
}
