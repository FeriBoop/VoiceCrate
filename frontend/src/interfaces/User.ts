export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  createdAt: string;
  avatar: {
    imageName: string,
    imageUrl: string,
  };
  name: string;
  role: string; // Enum for roles
  isBanned: boolean; // Indicates if the user is banned
}
