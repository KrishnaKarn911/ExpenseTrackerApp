const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const bodyParser = require('body-parser');
const AppError = require('./utils/appError');
require('dotenv').config({path: 'config.env'});
const cors = require('cors');
const compression=require('compression');
const morgan = require('morgan');
const fs=require('fs');
const helmet=require('helmet');



const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const FileURL = require('./models/fileDownload');

const globalErrorHandler = require('./controllers/errorController');
const userRoute = require('./routes/userRoutes');
const expenseRoute = require('./routes/expenseRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const premiunRoutes = require('./routes/premiumRoutes');
const passwordRoute = require('./routes/passwordRoute');

const app=express();

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{
    flags: 'a'
})
app.use(express.json());
app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('views'));

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));


app.use('/user',userRoute);
app.use('/exp',expenseRoute);
app.use('/purchase',purchaseRoutes);
app.use('/premium',premiunRoutes);
app.use('/password',passwordRoute)






User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(Order, {foreignKey: 'userId', onDelete: 'CASCADE'});
Order.belongsTo(User,{foreignKey:"userId", onDelete: 'CASCADE'});

User.hasMany(FileURL, {foreignKey: 'userId', onDelete: 'CASCADE'});
FileURL.belongsTo(User, {foreignKey:'userId', onDelete: 'CASCADE'});


app.all('*',(req,res,next)=>{

    next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler)

sequelize.sync().then(()=>{
    console.log('Database Synced')
}).catch(err=>{
    console.log(err);
})

const server = app.listen(process.env.PORT || 3001 ,()=>{
    console.log('Server running in port 3000')
})

process.on('unhandledRejection',err=>{
    console.log(err.name, err.message);
    console.log('Unhandled Rejection...Shutting Down...')
    server.close(()=>{
        process.exit(1);
    })
    
})
