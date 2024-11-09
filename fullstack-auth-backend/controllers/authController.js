const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');
const resHelper = require('../utils/res');

exports.registerUser = async (req, res) => {
    const { userName, email, password, role } = req.body;
    try {
        const [existingUser] = await db.promise().query('SELECT * FROM user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query('INSERT INTO user (userName, email, password, role) VALUES (?, ?, ?, ?)', [
            userName, email, hashedPassword, role
        ]);

        resHelper.ok({ message: 'User registered successfully' }, res);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [user] = await db.promise().query('SELECT * FROM user WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user[0].userid, role: user[0].role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ token, role: user[0].role });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    const { userId } = req.user;
    try {
        const [user] = await db.promise().query('SELECT userid, userName, email, role FROM user WHERE userid = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        resHelper.ok(user[0], res);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
