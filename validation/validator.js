const {check,validationResult}=require('express-validator')

exports.categoryValidation=[
    check('category_name','category is required').notEmpty()
    .isLength({min:3}).withMessage('category name must be minimum of 3 characters or more')
]

exports.productValidation=[
    check('product_name','product is required').notEmpty()
    .isLength({min:3}).withMessage('product name must be minimum of 3 characters or more'),
    check('product_price','price is required').notEmpty()
    .isNumeric().withMessage('price must be a numeric value'),
    check('countInStock','stock is required').notEmpty()
    .isNumeric().withMessage('stock must be a numeric value'),
    check('category','category is required').notEmpty(),
    check('product_description','description is required').notEmpty()
    .isLength({min:20}).withMessage('description must be 20 characters or more')
]

exports.userValidation=[
    check('name','name is required').notEmpty()
    .isLength({min:2}).withMessage('name must be minimum of 2 characters'),
    check('email','email is required').notEmpty()
    .isEmail().withMessage('Email format invalid'),
    check('password','password is required').notEmpty()
    .matches(/[a-z]/).withMessage('password must contain at least one lowercase lettter')
    .matches(/[A-Z]/).withMessage('password must contain at least one uppercase lettter')
    .matches(/[0-9]/).withMessage('password must contain one numeric digit')
    .matches(/[@#$-_?]/).withMessage('password must contain one special charscter')
    .isLength({min:8}).withMessage('password must be at least 8 characters')
]

exports.passwordValidation=[
    check('password','password is required').notEmpty()
    .matches(/[a-z]/).withMessage('password must contain at least one lowercase lettter')
    .matches(/[A-Z]/).withMessage('password must contain at least one uppercase lettter')
    .matches(/[0-9]/).withMessage('password must contain one numeric digit')
    .matches(/[@#$-_?]$/).withMessage('password must contain one special charscter')
    .isLength({min:8}).withMessage('password must be at least 8 characters')
]

exports.validation=(req,res,next)=>{
    const errors=validationResult(req)
    if(errors.isEmpty()){
        next()
    }
    else{
        return res.status(400).json({error:errors.array()[0].msg})
    }
}