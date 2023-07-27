const User = require('../models/userModel')
const Token=require('../models/tokenModel')
const crypto=require('crypto')
const sendEmail=require('../utils/setEmail')
const jwt=require('jsonwebtoken') // authentication
const { expressjwt} = require("express-jwt") // authorization 

// post user 
exports.postUser = async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    // check if email is already registered or not
    User.findOne({ email: user.email })
        .then(async data => {
            if (data) {
                return res.status(400).json({ error: 'email must be unique, try another' })
            }
            else {
                user = await user.save()
                if (!user) {
                    return res.status(400).json({ error: 'something went wrong while creating your account' })
                }
                // send token to the database 
                let token= new Token({
                    token:crypto.randomBytes(16).toString('hex'),
                    userId:user._id
                })
                token = await token.save()
                if(!token){
                    return res.status(400).json({error:'Failed to create token'})
                }
                const url=process.env.FRONTEND_URL+'\/email\/confirmation\/'+token.token
                //send email 
                sendEmail({
                    from:'no-reply@ecommercestore.com',
                    to:user.email,
                    subject:'Email Verification Link',
                    text:`Hello \n please verify your email by click in the below link \n\n
                    http://${req.headers.host}/api/confirmation/${token.token}
                    `,
                    html:`
                    <h1>Verify Your Email</h1>
                    <a href='${url}'>click to verify</a>
                    `
                })
                res.send(user)
            }
        })
        .catch(err =>{
            return res.status(400).json({error:err})
        })

}

//email confirmation
exports.postEmailConfirmation=(req,res)=>{
    // at first find the valid or matching token 
    Token.findOne({token:req.params.token})
    .then(token=>{
        if(!token){
            return res.status(404).json({error:'invalid token or token may have expired'})
        }
        // if we found the valid token then find the valid user for that token
        User.findOne({_id:token.userId})
        .then(user=>{
            if(!user){
                return res.status(404).json({error:'we are unable to find the valid user for this token'})
            }
            // check if the user is already verfied or not 
            if(user.isVerified){
                return res.status(400).json({error:'email is already verified,login to continue'})
            }
            // save the verified user
            user.isVerified=true
            user.save()
            .then(user=>{
                if(!user){
                    return res.status(400).json({error:'failed to verify your email,try again'})
                }
                else{
                    res.json({message:'congrats,your email has been verified'})
                }
            })
            .catch(err=>{
                return res.status(400).json({error:err})
            })
        })
        .catch(err=>{
            return res.status(400).json({error:err})
        })

    })
    .catch(err=>{
        return res.status(400).json({error:err})
    })
}

//login process
exports.signIn=async(req,res)=>{
    // destructing user 
    const{email,password}=req.body
    // at first check if email is registerd in the database or not 
    const user =await User.findOne({email})
    if(!user){
        return res.status(404).json({error:'sorry the email you provided is not found in our system'})
    }
    // if email found then check the matching password for that email 
    if(!user.authenticate(password)){
        return res.status(400).json({error:'email and password doesnot match'})
    }
    // check if user is verified or not 
    if(!user.isVerified){
        return res.status(400).json({error:'verify your email before login'})
    }
    // now generate token using user id and jwt secret 
    const token=jwt.sign({_id:user._id,role:user.role},process.env.JWT_SECRET)
    // store token in the cookie 
    res.cookie('myCookie',token,{expire:Date.now()+999999})
    // return user information to frontend
    const{_id,name,role}=user 
    return res.json({token,user:{_id,name,email,role}})
}

// forget password 
exports.forgetPassword=async(req,res)=>{
    // at first check if the email is in the system or not
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(404).json({error:'email you provide not found in our system'})
    }
    let token = new Token({
        userId:user._id,
        token:crypto.randomBytes(16).toString('hex')
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:'failed to create the token,process terminated'})
    }
    // sendEmail 
    const url=process.env.FRONTEND_URL+'\/reset\/password\/'+token.token
    sendEmail({
        from:'no-reply@ecommercestore.com',
        to:user.email,
        subject:'Password Reset Link',
        text:`Hello \n please reset your password by click in the below link \n\n
        http://${req.headers.host}/api/resetpassword/${token.token}
        `,
        html:`
        <h1>Reset Your Password</h1>
        <a href='${url}'>click to reset password</a>
        `
    })
    res.json({message:'password reset link has been sent to your email'})

}

// reset password 
exports.resetPassword=async(req,res)=>{
    //at first find the valid or matching token 
    const token = await Token.findOne({token:req.params.token})
    if(!token){
        return res.status(404).json({error:'invalid token or token may have expired'})
    }
    // if token found then find the valid user for that token
    let user= await User.findOne({_id:token.userId})
    if(!user){
        return res.status(404).json({error:'we are unable to find the valid user for this token'})
    }
    // new password set and save 
    user.password=req.body.password 
    user =await user.save()
    if(!user){
        return res.status(500).json({error:'failed to reset password'})
    }
    res.json({message:'password has been reset successfully'})
}

//user list 
exports.userList=async(req,res)=>{
    const user=await User.find()
    .select('-hashed_password')
    .select('-salt')
    if(!user){
        return res.status(400).json({error:'something went wrong'})
    }
    res.send(user)
}

// user details 
exports.userDetails=async(req,res)=>{
    const user=await User.findById(req.params.id)
    .select('-hashed_password')
    .select('-salt')
    if(!user){
        return res.status(400).json({error:'something went wrong'})
    }
    res.send(user)
}
// admin middleware 
exports.requireAdmin = (req, res, next) => {
    expressjwt({
      secret: process.env.JWT_SECRET,
      algorithms: ['HS256'],
      userProperty:'auth'
    })(req, res, (err) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (req.auth.role === 1) {
        next();
      } else {
        return res.status(403).json({ error: 'You are not authorized to access this page' });
      }
    })
  }

  // user middleware 
exports.requireUser = (req, res, next) => {
    expressjwt({
      secret: process.env.JWT_SECRET,
      algorithms: ['HS256'],
      userProperty:'auth'
    })(req, res, (err) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (req.auth.role === 0) {
        next();
      } else {
        return res.status(403).json({ error: 'You are not authorized to access this page' });
      }
    })
  }
  

// signout 
exports.signOut=(req,res)=>{
    res.clearCookie('myCookie')
    res.json({message:'signout success'})
}
