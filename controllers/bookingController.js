import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
// import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import stripe from 'stripe';

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe(
    process.env.STRIPE_SECRET_KEY
  ).checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${process.env.BASE_URL}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              'http://res.cloudinary.com/dvp1mjhd9/image/upload/v1719767825/q3elysozotzxbdpddv8b.jpg',
              // `${process.env.BASE_URL}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
  next();
});

export const createBooking = factory.createOne(Booking);
export const getBooking = factory.getOne(Booking);
export const getAllBooking = factory.getAll(Booking);
export const updateBooking = factory.updateOne(Booking);
export const deleteBooking = factory.deleteOne(Booking);
