const Category = require('../models/categoryModel')

// to post data in the category model
exports.postCategory = async (req, res) => {
    let category = new Category({
        category_name: req.body.category_name
    })
    // check for unique category or check if category is exists in the database
    Category.findOne({ category_name: category.category_name })
        .then(async (categories) => {
            if (categories) {
                return res.status(400).json({ error: 'category must be unique' })
            }
            else {

                category = await category.save()
                if (!category) {
                    return res.status(400).json({ error: 'something went wrong' })
                }
                res.send(category)

            }
        })
        .catch(err=>console.log(err))
}

// to show all category 
exports.allCategory=async(req,res)=>{
    const category=await Category.find()
    if(!category){
        return res.status(400).json({ error: 'something went wrong' })
    }
    res.send(category)
}
// to show single data
exports.categoryDetails=async(req,res)=>{
    const category=await Category.findById(req.params.id)
    if(!category){
        return res.status(400).json({ error: 'something went wrong' })
    }
    res.send(category)
}
//delete category 
exports.deleteCategory=(req,res)=>{
    Category.findByIdAndDelete(req.params.id)
    .then(category=>{
        if(!category){
            return res.status(403).json({error:'category not found'})
        }
        else{
            return res.status(200).json({mesage:'category deleted'})
        }
    })
    .catch(err=>{
        return res.status(400).json({error:err})
    })
}

//update category 
exports.updateCategory=async(req,res)=>{
    const category=await Category.findByIdAndUpdate(
        req.params.id,
        {
            category_name:req.body.category_name
        },
        {new:true}
    )
    if(!category){
        return res.status(400).json({ error: 'something went wrong' })
    }
    res.send(category)
}


