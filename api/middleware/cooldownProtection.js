const Player = require('../models/player.model');

const cooldownProtection = async (req, res, next) => {
  const { token } = req;
  let player = await Player.getBy({ token });

  if (player.length > 0) {
    player = player[0];
    const now = new Date()
    const updated = new Date(player.updated_at);
    const secondsPassed = (now - updated) / 1000

    console.log('\n==============\n')
    console.log(`${player.cooldown} > ${secondsPassed} = ${player.cooldown + 1 > secondsPassed}`);
    console.log('\n==============\n')
    
    // cooldown + 1 because we lose ms precision
    if (player.cooldown + 1 > secondsPassed) return res.status(400).json({
      status: 'error',
      message: 'Please wait for your cooldown to pass to prevent penalty.',
    });
  }
  next();
}

module.exports = cooldownProtection;
