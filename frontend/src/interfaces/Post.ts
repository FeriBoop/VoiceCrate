export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  //userId: string;
  userId: {
    _id: string;
    username: string;
  };
  images: [
    {
      imageName: string,
      imageUrl: string,
    }
  ];
  createdAt: Date;
}
