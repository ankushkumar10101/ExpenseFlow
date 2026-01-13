    require("dotenv").config();
    const connectDb = require("./config/db");
    const express=require('express')
    const userRoute=require('./routes/user')
    const cors=require('cors')
    const cookieParser=require('cookie-parser')
    connectDb();
    const{checkForAuthentication}=require('./middlewares/authentication');
    const dashboardRoute=require('./routes/dashboard')
    const app=express()
    const PORT=process.env.PORT || 8000

    app.use(cors({
      origin: ['http://localhost:5173', 'https://expenseflow-bvl5.onrender.com'],
      credentials:true
    }))
    app.use(express.urlencoded({extended:false}))
    app.use(express.json())
    app.use(cookieParser())
    app.use(checkForAuthentication('token'))

    app.get('/ping', (req, res) => {
          res.status(200).send('pong');
        });
    app.use("/api/auth", userRoute);
    const aiRoute = require('./routes/ai');
    app.use('/api/dashboard',dashboardRoute)
    app.use('/api/ai', aiRoute);
    app.listen(PORT,()=>console.log('Server Started'))


