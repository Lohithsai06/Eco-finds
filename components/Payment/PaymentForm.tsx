import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase'; // Import db
import { collection, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore'; // Import Firestore functions

interface PaymentFormProps {
  cartProducts: any[]; // Assuming cartProducts has product details like name and price
  totalPrice: number;
}

export default function PaymentForm({ cartProducts, totalPrice }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Remove the useEffect for navigation - we'll handle it directly in the payment function

  const handlePayment = async () => { // Make handlePayment async
    if (!user) {
      toast.error('You must be logged in to make a purchase.');
      return;
    }

    // Validate payment method fields
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast.error('Please fill in all card details.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        toast.error('Please enter your UPI ID.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Prepare items for Firestore
      const itemsToSave = cartProducts.map(product => ({
        productId: product.id,
        productName: product.title, // Assuming product has a 'title' field for name
        price: product.price,
      }));

      const purchaseData = {
        userId: user.uid,
        purchasedAt: serverTimestamp(),
        items: itemsToSave,
        totalAmount: totalPrice,
      };

      await addDoc(collection(db, 'purchases'), purchaseData);

      // Delete the user's cart after successful purchase
      const cartRef = doc(db, 'carts', user.uid);
      await deleteDoc(cartRef);

      toast.success(`Payment of $${totalPrice.toFixed(2)} processed successfully!`);
      clearCart();

      // Navigate after a short delay to ensure all operations complete
      console.log('Payment successful, navigating to success page...');
      setTimeout(() => {
        router.replace('/payment-success');
      }, 1000); // 1 second delay to show the success toast
    } catch (error) {
      console.error('Error processing payment or saving purchase:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Payment Information</CardTitle>
        <CardDescription>Select your preferred payment method.</CardDescription>
      </CardHeader>
      <CardContent>        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
          <TabsTrigger value="debit-card">Debit Card</TabsTrigger>
          <TabsTrigger value="upi">UPI ID</TabsTrigger>
        </TabsList>
        <TabsContent value="credit-card" className="space-y-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="XXXX XXXX XXXX XXXX"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cardName">Card Holder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="XXX"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="debit-card" className="space-y-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="debitCardNumber">Card Number</Label>
            <Input
              id="debitCardNumber"
              placeholder="XXXX XXXX XXXX XXXX"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="debitCardName">Card Holder Name</Label>
            <Input
              id="debitCardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="debitExpiryDate">Expiry Date</Label>
              <Input
                id="debitExpiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="debitCvv">CVV</Label>
              <Input
                id="debitCvv"
                placeholder="XXX"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="upi" className="space-y-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="yourname@bank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
            />
          </div>
        </TabsContent>
      </Tabs>
        <Button
          onClick={handlePayment}
          className="w-full mt-6"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Payment...' : `Make Payment - $${totalPrice.toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}
