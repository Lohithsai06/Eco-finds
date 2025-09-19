import { db } from './firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface FormData {
  title: string;
  category: string;
  description: string;
  price: string;
}

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to compress image if needed
const compressImage = (file: File, maxSizeKB: number = 500): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions to maintain aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Try different quality levels to get under size limit
      let quality = 0.8;
      let base64 = canvas.toDataURL('image/jpeg', quality);

      // Reduce quality until under size limit
      while (base64.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) { // 1.37 is base64 overhead factor
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(base64);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const saveProduct = async (
  formData: FormData,
  imageFile: File | null,
  currentUser: User,
  productId?: string, // Optional product ID for updates
  initialImageUrl?: string, // Optional initial image URL for updates
): Promise<string> => {
  if (!currentUser) {
    throw new Error('User not authenticated. Please log in to add/edit a product.');
  }

  let imageUrl = initialImageUrl || '';

  if (imageFile) {
    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit for the original file
      throw new Error('Selected image is too large. Please select an image under 5MB.');
    }

    try {
      // Convert image to base64 with compression
      imageUrl = await compressImage(imageFile, 500); // Compress to ~500KB
      console.log('Image compressed to base64, size:', Math.round(imageUrl.length / 1024), 'KB');
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image.');
    }
  } else if (!initialImageUrl && !productId) {
    // If adding a new product and no image file is provided
    throw new Error('Please provide an image for the product.');
  }
  // If editing and no new image is provided, keep the existing image (imageUrl = initialImageUrl)


  const productData = {
    title: formData.title.trim(),
    category: formData.category,
    description: formData.description.trim(),
    price: Number(formData.price),
    imageUrl: imageUrl,
    ownerId: currentUser.uid,
    // createdAt and other fields should only be set on creation or updated carefully
    // For updates, we only update the fields that are changed.
    // For creation, we set createdAt.
    sustainabilityScore: Math.floor(Math.random() * 5) + 1, // Keep for now, consider making editable
    condition: "Good", // Keep for now, consider making editable
    views: 0, // Should not be reset on update
    likedBy: 0, // Should not be reset on update
    co2Saved: Math.floor(Math.random() * 100) + 10, // Should not be reset on update
    waterSaved: Math.floor(Math.random() * 500) + 50,
    seller: {
      name: currentUser.displayName || "Anonymous",
      rating: 5,
      verified: true,
    },
  };

  try {
    if (productId) {
      // Update existing product - only update the fields that should be editable
      const productRef = doc(db, 'products', productId);
      const updateData = {
        title: productData.title,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.imageUrl,
        // Don't update: createdAt, views, likedBy, co2Saved, waterSaved, ownerId
        // These should remain unchanged during edits
      };
      await updateDoc(productRef, updateData);
      return productId;
    } else {
      // Add new product
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    }
  } catch (err) {
    console.error('[saveProduct] An error occurred in the overall process.', err);
    throw err;
  }
};