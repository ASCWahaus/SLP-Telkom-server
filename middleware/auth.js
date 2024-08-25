import jwt from 'jsonwebtoken'
import UsersModel from '../models/usersModel.js';
import ErrorResponse from '../utils/errorResponse.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]        
    }

    if(!token){
        return next(new ErrorResponse("Not authorized to access this route", 401))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await UsersModel.findById(decoded.id)

        if(!user){
            return next(new ErrorResponse("No user found with this id", 404))
        }

        req.user = user;

        next();

    } catch (error) {
        return (new ErrorResponse("Not authorized to access this route", 404))
    }
}

export const isNotVerified = async (req, res, next) => {
    try {
        const user = await UsersModel.findOne({email:req.body.email})
        
        if (user.isVerified) {
            return next();
        }
        res.json({message:"Your account has not been verified"})
    
    } catch (error) {
        res.status(404).json({message : error.message})
    }
}

export const auth = async (req, res, next) => {
    try {
      //const token = req.headers.authorization.split(" ")[1];
      let token
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]        
    }
      const isCustomAuth = token.length < 500;
  
      let decodedData;
  
      if (token && isCustomAuth) {      
        decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
        req.user = decodedData?._id;
      } else { //untuk OAuth (login with google)
        decodedData = jwt.decode(token);
  
        req.user = decodedData?.sub; //sub = spesific id for google acc
      }    
  
      next();
    } catch (error) {
      console.log(error);
    }
  };
  