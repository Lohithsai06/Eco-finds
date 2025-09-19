export interface User {
  uid: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  products: CartItem[];
}

export interface Purchase {
  id: string;
  userId: string;
  items: {
    productId: string;
    productName: string;
    price: number;
  }[];
  totalAmount: number;
  purchasedAt: Date;
}

export const categories = [
  'All',
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Books',
  'Sports',
  'Beauty',
  'Food',
  'Other'
];