import axios from 'axios';
import { showAlert } from './alerts';

// Wait until the Stripe object is loaded
if (typeof Stripe === 'undefined') {
  return;
}

const stripe = Stripe(
  'pk_test_51QCzKvECS97YDEhvLauq2mYuYGCMrtdAFlDREdlzA8JjIa5EfzPMx0i2HbVxDglJKayzVa69F0v1X7O6M5HtMJel00HXlHTcmf'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
