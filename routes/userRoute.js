const express=require('express')
const { postUser, postEmailConfirmation, signIn, forgetPassword, resetPassword, userList, userDetails, signOut } = require('../controllers/userController')
const router=express.Router()
const {userValidation,passwordValidation,validation}=require('../validation/validator')
const{requireAdmin,requireUser}=require('../controllers/userController')

router.post('/register',userValidation,validation,postUser)
router.put('/confirmation/:token',postEmailConfirmation)
router.post('/signin',signIn)
router.post('/forgetpassword',forgetPassword)
router.put('/resetpassword/:token',passwordValidation,validation,resetPassword)
router.get('/userlist',requireAdmin,userList)
router.get('/userdetails/:id',requireUser,userDetails)
router.post('/signout',signOut)

module.exports=router