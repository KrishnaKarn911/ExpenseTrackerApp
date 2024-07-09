const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');  

const FileURL = sequelize.define('fileURL', {
    fileURL: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: 'id'
        }
    }
});

module.exports = FileURL;