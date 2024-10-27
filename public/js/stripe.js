import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe?.(
      'pk_test_51QCzKvECS97YDEhvLauq2mYuYGCMrtdAFlDREdlzA8JjIa5EfzPMx0i2HbVxDglJKayzVa69F0v1X7O6M5HtMJel00HXlHTcmf'
    );

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe?.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
