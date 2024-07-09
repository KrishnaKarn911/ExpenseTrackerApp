const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');


const Order = sequelize.define('order',{
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    paymentId: Sequelize.STRING,
    orderId: Sequelize.STRING,
    status: Sequelize.STRING,
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // 'Users' would also work
            key: 'id'
        }
    }
})


module.exports = Order;