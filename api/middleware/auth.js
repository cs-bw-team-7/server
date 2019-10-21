require('dotenv').config();

const log = require('../../utils/logger');

const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.replace('Token ', '');
    if (!authorization) return res.status(400).json({
      status: 'error',
      error: 'MissingAuth',
      message: 'Please provide a token in the `Authorization` header.',
    });

    // who are you?
    if (token !== process.env.ARRON_TOKEN && token !== process.env.MEGAN_TOKEN) return res.status(400).json({
      status: 'error',
      error: 'InvalidToken',
      message: 'Unfortunately the server does not know the provided token.',
    });

    req.token = token;

    next();
  } catch (error) {
    res.status(500).json(await log.err(error));
  }
}

module.exports = auth;