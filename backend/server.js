require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const workerRoutes = require('./routes/worker');
const app = express();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


app.use(express.json());


const store = new SequelizeStore({
  db: sequelize,
});

store.sync(); 

app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                 
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,   
  },
}));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/worker', workerRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
