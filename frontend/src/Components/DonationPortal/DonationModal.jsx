import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51OWKAVSDJ0AxOUCaBITPNU4CmAR0Uey5xYo8uPMoVGjwox5LGoWkds5eg3WIFhLrcIZpNGQCzn6NWrhbP2AClk3k00CLeANSVp');

// Form for collecting payment information
const DonationForm = ({ onClose, donationRequestId, donorId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment intent using your backend API
      const createPaymentResponse = await axios.post('http://localhost:8080/api/v1/donations/donate', {
        amount: amountNum,
        donationRequestId,
        donorId,
      });

      const { clientSecret } = createPaymentResponse.data;

      // Step 2: Confirm the payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Anonymous',
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        await axios.post('http://localhost:8080/api/v1/donations/confirmDonation', {
          donationRequestId,
          donorId,
          amount: amountNum,
        });
        
        onSuccess(paymentIntent);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Enter Donation Amount
        </Typography>
        <TextField
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          variant="outlined"
          placeholder="Amount"
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
          disabled={loading}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Card Details
        </Typography>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </Box>
      </Box>

      {error && (
        <FormHelperText error sx={{ mb: 2 }}>
          {error}
        </FormHelperText>
      )}

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !stripe}
        >
          {loading ? <CircularProgress size={24} /> : 'Donate Now'}
        </Button>
      </DialogActions>
    </form>
  );
};

// Main donation modal component
const DonationModal = ({ open, onClose, donationRequestId, donorId, title }) => {
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const handleDonationSuccess = (paymentIntent) => {
    setDonationSuccess(true);
    setPaymentDetails(paymentIntent);
  };

  const handleClose = () => {
    // If donation was successful, we might want to refresh the page or donation list
    if (donationSuccess) {
      window.location.reload();
    }
    setDonationSuccess(false);
    setPaymentDetails(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {donationSuccess ? 'Thank You!' : `Donate to ${title}`}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {donationSuccess ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Donation Successful!
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for your generous contribution. Your donation will make a real difference.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction ID: {paymentDetails?.id}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              sx={{ mt: 3 }}
            >
              Close
            </Button>
          </Box>
        ) : (
          <Elements stripe={stripePromise}>
            <DonationForm
              onClose={handleClose}
              donationRequestId={donationRequestId}
              donorId={donorId}
              onSuccess={handleDonationSuccess}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DonationModal;