const express = require('express');
const app = express();
const masterRoutes = require('./routes/master.route')
const moduleRoutes = require('./routes/module.route')
const workInfoRoutes = require('./routes/workinfo.route')
const workDetailsRoutes = require('./routes/workdetails.route')
const pool = require('./config/db')
const cors = require('cors');

const corsoptions = {
    origin:'*',
    method :'GET,POST,PUT,DELETE,PATCH',
    Credential:true,
}
app.use(express.json());
app.use(cors(corsoptions));

// Routes
app.use('/api/master',masterRoutes)
app.use('/api/module',moduleRoutes)
app.use('/api/workinfo',workInfoRoutes)
app.use('/api/workdetails',workDetailsRoutes)

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ 
        success: false, 
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
