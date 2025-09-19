'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/Product/ProductForm';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Shared/Loader';
import toast from 'react-hot-toast';

interface EditProductClientProps {
  productId: string;
}

export default function EditProductClient({ productId }: EditProductClientProps) {
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!mounted) return;
      
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          
          // Check if the current user owns this product
          if (productData.ownerId !== user.uid) {
            toast.error('You can only edit your own products');
            router.push('/listings');
            return;
          }
          
          setProduct(productData);
        } else {
          setError('Product not found.');
          router.push('/listings');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details.');
        router.push('/listings');
      } finally {
        setLoading(false);
      }
    };

    if (productId && mounted) {
      fetchProduct();
    }
  }, [productId, router, user, mounted]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-4">Product data is missing.</div>;
  }

  return <ProductForm initialProductData={product} />;
}