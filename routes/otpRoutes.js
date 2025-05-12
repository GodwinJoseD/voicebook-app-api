const express = require('express');
const { generateOtp, sendOtp, saveOtp, verifyOtp, resendOtp } = require('../services/otpService');
const { getUserByPhoneNumber } = require('../models/User');

const router = express.Router();

// POST /otp/send: Send OTP to user's phone number
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = await getUserByPhoneNumber(phoneNumber);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    await sendOtp(phoneNumber, otp);
    await saveOtp(user.id, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// POST /otp/verify: Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const user = await getUserByPhoneNumber(phoneNumber);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await verifyOtp(user.id, otp);

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// POST /otp/resend: Resend OTP to user's phone number
router.post('/resend', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = await getUserByPhoneNumber(phoneNumber);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = await resendOtp(user.id, phoneNumber);

    res.status(200).json({ message: 'OTP resent successfully', otp });
  } catch (error) {
    console.error('Error resending OTP', error);
    res.status(500).json({ message: 'Error resending OTP' });
  }
});

module.exports = router;