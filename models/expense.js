const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');  

const Expense = sequelize.define('Expense', {
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // 'Users' would also work
            key: 'id'
        }
    }
});

module.exports = Expense;