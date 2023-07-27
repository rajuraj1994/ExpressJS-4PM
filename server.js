const express=require('express')
const app=express()
require('dotenv').config()
require('./db/connection')
const bodyParser=require('body-parser')
const morgan = require('morgan')
const cors=require('cors')

const testRoute=require('./routes/testRoute')
const categoryRoute=require('./routes/categoryRoute')
const productRoute=require('./routes/productRoute')
const userRoute=require('./routes/userRoute')
const orderRoute=require('./routes/orderRoute')
const paymentRoute=require('./routes/paymentRoute')


// middleware 
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use('/public/uploads',express.static('public/uploads'))
app.use(cors())



// routes middleware 
app.use('/api',testRoute)
app.use('/api',categoryRoute)
app.use('/api',productRoute)
app.use('/api',userRoute)
app.use('/api',orderRoute)
app.use('/api',paymentRoute)


const port=process.env.PORT || 5000
app.listen(port,()=>{
    console.log(`server started on port ${port}`)
})



