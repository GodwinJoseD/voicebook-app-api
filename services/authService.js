const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUser, getUserByUsername } = require('../models/User');

const signUp = async (name, password, phoneNumber) => {
  const user = await createUser(name, password, phoneNumber);
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, token };
};

const login = async (name, password) => {
  const user = await getUserByUsername(name);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, token };
};

module.exports = {
  signUp,
  login,
};