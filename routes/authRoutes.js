const express = require('express');
const { signUp, login } = require('../services/authService');

const router = express.Router();

// POST /auth/signup: Sign up a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, password, phoneNumber } = req.body;
    const { user, token } = await signUp(name, password, phoneNumber);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error signing up', error);
    res.status(500).json({ message: 'Error signing up' });
  }
});

// POST /auth/login: Log in an existing user
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const { user, token } = await login(name, password);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Error logging in', error);
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

module.exports = router;