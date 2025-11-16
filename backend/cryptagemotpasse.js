const bcrypt = require('bcrypt');
const motDePasse = 'test123';
const saltRounds = 10; // C'est le niveau de complexité recommandé

async function genererHachage() {
  try {
    // Génère le "salt" (sel) aléatoire
    const salt = await bcrypt.genSalt(saltRounds); 
    
    // Génère le hachage en utilisant le mot de passe et le sel
    const hash = await bcrypt.hash(motDePasse, salt); 
    
    console.log('Mot de passe original :', motDePasse);
    console.log('Hachage Bcrypt généré :', hash);
    
  } catch (err) {
    console.error('Erreur lors du hachage :', err);
  }
}

genererHachage();