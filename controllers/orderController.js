const OrderItem=require('../models/orderItemModel')
const Order=require('../models/orderModel')

// post order
exports.postOrder=async(req,res)=>{
    // post data to order item model and return the stored id of that data
    const orderItemIds=Promise.all(req.body.orderItems.map(async orderItemData=>{
        let newOrderItem= new OrderItem({
            quantity:orderItemData.quantity,
            product:orderItemData.product
        })
        newOrderItem= await newOrderItem.save()
        return newOrderItem._id
    }))
    const orderItemIdResolved= await orderItemIds
    // calculate total price 
    const totalAmount=await Promise.all(orderItemIdResolved.map(async orderId=>{
        const itemOrder= await OrderItem.findById(orderId).populate('product','product_price')
        const total=itemOrder.quantity*itemOrder.product.product_price
        return total
        //[200,3000]
    }))
    const totalPrice=totalAmount.reduce((a,b)=>a+b,0)

    // post data to order model 
    let order= new Order({
        orderItems:orderItemIdResolved,
        shippingAddress1:req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        totalPrice:totalPrice,
        user:req.body.user
    })
    order = await order.save()
    if(!order){
        return res.status(400).json({error:'something went wrong'})
    }
    res.send(order)
}

// order list 
exports.orderList=async(req,res)=>{
    const order=await Order.find()
    .populate('user','name')
    .sort({createdAt:-1})
    if(!order){
        return res.status(400).json({error:'something went wrong'}) 
    }
    else{
        res.send(order)
    }
}

// order details 
exports.orderDetails=async(req,res)=>{
    const order=await Order.findById(req.params.id)
    .populate('user','name')
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'
        }
    })
    if(!order){
        return res.status(400).json({error:'something went wrong'}) 
    }
    else{
        res.send(order)
    }
}

// update status 
exports.updateStatus=async(req,res)=>{
    const order= await Order.findByIdAndUpdate(
        req.params.id,
        {status:req.body.status},
        {new:true}
    )
    if(!order){
        return res.status(400).json({error:'something went wrong'}) 
    }
    else{
        res.send(order)
    }
}

// order list of specific user
exports.userList=async(req,res)=>{
    const order=await Order.find({user:req.params.userid})
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'
        }
    })
    .sort({createdAt:-1})
    if(!order){
        return res.status(400).json({error:'something went wrong'}) 
    }
    else{
        res.send(order)
    }
}
