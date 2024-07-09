const sequelize = require('../config/database');
const { DataTypes, Sequelize } = require('sequelize');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100] // password length between 6 and 100 characters
        }
    },
    confirmPassword: {
        type: DataTypes.VIRTUAL,
        validate: {
            isEqual(value) {
                if (value !== this.password) {
                    throw new Error('Passwords do not match');
                }
            }
        }
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    totalExpense: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    passwordResetToken: DataTypes.STRING,
    passwordResetExpires: DataTypes.DATE,
}, {
    hooks: {
        beforeSave: async (user) => {
          try {
            if (user.changed('password')) { 
              console.log('Before save hook: hashing password');
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
              console.log('Password hashed');
              user.confirmPassword = undefined;
            }
          } catch (err) {
            console.error('Error in beforeSave hook:', err);
            throw err; 
          }
        }
    }
});

//Instance method to create reset token
User.prototype.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex');
   this.passwordResetExpires = Date.now() + 10*60*1000;

   return resetToken;
}

module.exports = User;
