const mongoose=require('mongoose')
const crypto=require('crypto')
const uuidv1=require('uuidv1')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    role:{
        type:Number,
        required:true,
        default:0
    },
    hashed_password:{
        type:String,
        required:true
    },
    salt:String,
    isVerified:{
        type:Boolean,
        required:true,
        default:false
    }
},{timestamps:true})

//virtual fields
userSchema.virtual('password')
.set(function(password){
    this._password=password
    this.salt=uuidv1()
    this.hashed_password=this.encryptPassword(password)
})
.get(function(){
    return this._password
})

// defining the methods
userSchema.methods={
    encryptPassword:function(password){
        if(!password) return ''
        try{
            return crypto
            .createHmac('sha1',this.salt)
            .update(password)
            .digest('hex')
        }
        catch(err){
            return err
        }
    },
    authenticate:function(plainText){
        return this.encryptPassword(plainText)===this.hashed_password
    }
}

module.exports=mongoose.model('User',userSchema)

