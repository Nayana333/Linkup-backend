import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import PremiumUsers from '../model/permium/premiumModel'
import User from "../model/user/userModel";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";

const stripe = new Stripe("sk_test_51P2lOoSGck1zxwUllJBB2lKFHEPuz1Kvi7n2FhTH6dWPxwTAyuAn36fGpErOXgrfFFyjzc1flqyJp0wDPNmvCjS5004WQeD5dY");



export const getPremiumUserData = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {

    const allPremiumUserData = await PremiumUsers.find({ userId: userId });


    const latestPremiumUser = await PremiumUsers.findOne({ userId }).sort({ startDate: -1 });

    res.status(200).json({ success: true, allPremiumUserData, latestPremiumUser });
  } catch (error) {
    console.error('Error fetching premium user data:', error);
    res.status(500).json({ success: false, message: 'Error fetching premium user data' });
  }
};


export const initiatecheckout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (user && user.isPremium === true) {
      res.json({ success: false, message: 'User is already subscribed to premium', user });
    }

    const fare = "249";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: "LinkUp premium membership - 1mo",
            },
            unit_amount: parseInt(fare) * 100
          },
          quantity: 1,
        }
      ],
      mode: "payment",
      success_url: process.env.SUCCESS_URL as string,
      cancel_url: process.env.CANCEL_URL as string,
      customer_email: user?.email,
      billing_address_collection: 'required',
    });

    res.json({ success: true, id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, message: 'Error creating checkout session' });
  }
});


export const validatePayment = async (req: Request, res: Response) => {
  const { sessionId, userId } = req.body;
  const amount = "249";

  try {

    const user = await User.findById(userId);

    if (user && user.isPremium === true) {
      return res.json({ success: false, message: 'User is already subscribed to premium' });
    }

    const existingPremium = await PremiumUsers.findOne({ transactionId: sessionId });

    if (existingPremium) {
      return res.status(400).json({ success: false, message: 'Unauthorized access' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session && session.payment_status === 'paid') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 28);

      const newPremium = new PremiumUsers({
        userId,
        amount,
        transactionId: sessionId,
        startDate: Date.now(),
        expiryDate,
      });

      await newPremium.save();

      await User.findByIdAndUpdate(userId, { isPremium: true, premiumExpiryDate: expiryDate });
      const updatedUser = await User.findById(userId, { password: 0 });

      return res.json({ success: true, message: 'Premium document created and user updated successfully', user: updatedUser });
    } else {
      return res.json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Error processing successful payment:', error);
    return res.status(500).json({ success: false, message: 'Error processing successful payment' });
  }
};