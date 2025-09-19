import ProductDetail from '@/components/Product/ProductDetail';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const productsCollection = collection(db, 'products');
  const q = query(productsCollection);
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  return products.map(product => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }: PageProps) {
  return <ProductDetail productId={params.id} />;
}
