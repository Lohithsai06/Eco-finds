import EditProductClient from '@/components/Product/EditProductClient';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Product } from '@/lib/types';

export async function generateStaticParams() {
  try {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection);
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    return products.map(product => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array if there's an error
    return [];
  }
}

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return <EditProductClient productId={params.id} />;
}