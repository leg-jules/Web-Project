const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, passwordHash: hash });
    req.session.userId = user.id;
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'username', 'users_type', 'passwordHash'] ,
      raw: true 
    });
    if (!user) return res.status(401).json({ error: 'Invalid email' });

    console.log('--- DB CHECK START ---');
    console.log(`Utilisateur trouvé : ${user.username} (ID: ${user.id})`);
    console.log(`Rôle DB (users_type) lu : ${user.users_type}`);
    console.log(`Hash du mot de passe lu : ${user.passwordHash ? 'OK (Non-vide)' : 'ERREUR (Vide)'}`);
    console.log('--- DB CHECK END ---');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
    req.session.userId = user.id;

    const responseData = {
      id: user.id, 
      username: user.username,
      user: {
        role: user.users_type ? user.users_type.toLowerCase() : 'unknown'
      }
    };

    console.log('--- Réponse envoyée au client ---');
    console.log('Rôle final envoyé :', responseData.user.role);
    console.log('---------------------------------');
    
    res.json(responseData);

  } catch (err) {
    console.error("Erreur serveur dans login (catch block):", err.message); 
    res.status(500).json({ error: 'Server error' });
  }
};



exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
};
