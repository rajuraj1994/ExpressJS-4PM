const Product = require('../models/productModel')

// to post product 
exports.postProduct = async (req, res) => {
    let product = new Product({
        product_name: req.body.product_name,
        product_price: req.body.product_price,
        countInStock: req.body.countInStock,
        product_description: req.body.product_description,
        product_image: req.file.path,
        category: req.body.category
    })
    product = await product.save()
    if (!product) {
        return res.status(400).json({ error: 'something went wrong' })
    }
    res.send(product)
}
// to see all products
exports.productList = async (req, res) => {
    const product = await Product.find()
        .populate('category')
    if (!product) {
        return res.status(400).json({ error: 'something went wrong' })
    }
    res.send(product)
}
// product details
exports.productDetails = async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category','category_name')
    if (!product) {
        return res.status(400).json({ error: 'something went wrong' })
    }
    res.send(product)
}

//update product 
exports.updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            product_name: req.body.product_name,
            product_price: req.body.product_price,
            countInStock: req.body.countInStock,
            product_description: req.body.product_description,
            product_image: req.file.path,
            category: req.body.category
        },
        { new: true }
    )
    if (!product) {
        return res.status(400).json({ error: 'something went wrong' })
    }
    res.send(product)
}

//delete product 
exports.deleteProduct=(req,res)=>{
    Product.findByIdAndDelete(req.params.id)
    .then(product=>{
        if(!product){
            return res.status(403).json({error:'product not found'})
        }
        else{
            return res.status(200).json({mesage:'product deleted'})
        }
    })
    .catch(err=>{
        return res.status(400).json({error:err})
    })
}
