const multer=require('multer')
const fs=require('fs')
//fs is used to read the folder and file
const path=require('path')
//path is used to read the filename and extension

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let fileDestination='public/uploads/'
        // check if directory exist 
        if(!fs.existsSync(fileDestination)){
            fs.mkdirSync(fileDestination,{recursive:true})
            cb(null,fileDestination)
        }
        else{
            cb(null,fileDestination)
        }
    },

    filename: function (req, file, cb) {
     let filename=path.basename(file.originalname,path.extname(file.originalname))
     //path.basename('dowloads/abc.jpg','.jpg')
     // abc 
     let ext=path.extname(file.originalname)
     // .jpg 
     cb(null,filename+'_'+Date.now()+ext)
     //abc_234567.jpg
    }
  })

  const imageFilter=(req,file,cb)=>{
    if(!file.originalname.match(/\.(jpg|png|jpeg|webp|jfif|gif|JPG|PNG|JPEG|WEBP|JFIF|GIF)$/)){
        return cb(new Error('you can upload image file only'),false)
    }
    else{
        cb(null,true)
    }
  }

  const upload=multer({
    storage:storage,
    fileFilter:imageFilter,
    limits:{
        fileSize:2000000 // 2mb
    }
  })

  module.exports=upload