const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log("[REGISTER ROUTE CALLED]");
    console.log("Données reçues:", { email, role });

    if (!email || !password) {
      console.log("Missing fields");
      return res.status(400).json({ error: "Missing fields" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log("Mot de passe hashé:", hash);

    const user = await User.create({
      User_Email: email,
      User_Password: hash,
      User_Role: role || "client" 
    });
    console.log("Utilisateur créé:", user.User_Email, "ID:", user.User_ID);

    req.session.userId = user.User_ID;
    console.log("Session enregistrée pour l'utilisateur ID:", user.User_ID);

    res.status(201).json({
      user: {
        id: user.User_ID,
        email: user.User_Email,
        role: user.User_Role
      }
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  console.log("[LOGIN ROUTE CALLED]");
  try {

    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: { User_Email: email },
        attributes: ['User_ID', 'User_Email', 'User_Password', 'User_Role'],
        raw: true
      });
      if (!user) return res.status(401).json({ error: 'Invalid email' });

      console.log('--- DB CHECK START ---');
      console.log(`Utilisateur trouvé : ${user.User_Email} (ID: ${user.User_ID})`);
      console.log(`Rôle DB (users_type) lu : ${user.User_Role}`);
      console.log(`Hash du mot de passe lu : ${user.User_Password ? 'OK (Non-vide)' : 'ERREUR (Vide)'}`);
      console.log('--- DB CHECK END ---');

      const valid = await bcrypt.compare(password, user.User_Password);
      if (!valid) return res.status(401).json({ error: 'Invalid password' });
      req.session.userId = user.User_ID;


      
      res.json({
        id: user.User_ID,
        email: user.User_Email,
        role: user.User_Role 
      });

    } catch (err) {
      console.error("Erreur serveur dans login (catch block):", err.message); 
      res.status(500).json({ error: 'Server error' });
    }
  }
  catch (err) {
    console.error("Erreur inattendue dans login (outer catch):", err.message); 
    res.status(500).json({ error: 'Unexpected server error' });
  }
};



exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
};
