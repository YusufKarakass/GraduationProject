/* import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null 
                next()
            } else {
                const user = await User.findById(decodedToken.userId)
                res.locals.user = user
                next()
            }
        })
    } else {
        res.locals.user = null
        next()
    }
}


const authenticateToken = async (req, res, next) => {

    try {
        const token = req.cookies.jwt;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err) => {
                if (err) {
                    console.log(err.message);
                    res.redirect("/login")
                } else {
                    req.user = decodedToken;
                    next();
                }
            })
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        res.status(401).json({
            succeeded: false,
            error: "Not authorized"
        })
    }


}

export { authenticateToken, checkUser }; */


 import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                const user = await User.findById(decodedToken.userId);
                res.locals.user = user;
                req.user = user; // BURASI ÖNEMLİ: req.user set edilir
                next();
            }
        });
    } else {
        res.locals.user = null;
        req.user = null;
        next();
    }
};

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({
            succeeded: false,
            error: "Not authorized",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({
                succeeded: false,
                error: "Not authorized",
            });
        }
        req.user = decodedToken; // BURASI DA ÖNEMLİ: token decode edilip req.user olarak atanır
        next();
    });
};

export { checkUser, authenticateToken };
