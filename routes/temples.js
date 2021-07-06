
const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const temples=require('../controllers/temples')
const {isLoggedIn,isAuthor,validateTemple}=require('../middleware');
const ExpressError= require('../utils/ExpressError');
const Temple= require('../models/temple');
const  multer=require('multer');
const {storage}=require('../cloudinary');
const  upload=multer({storage});



router.route('/')
   .get(catchAsync(temples.index))
   .post(isLoggedIn,upload.array('image'), validateTemple, catchAsync(temples.createTemple));
//   .post(upload.array('image'),(req,res)=>{
//    console.log(req.body,req.files);
//    res.send("it's work");
// })

router.get('/new',isLoggedIn,temples.renderNewForm)

router.route('/:id')
      .get(catchAsync(temples.showTemple))
      .delete(isLoggedIn,isAuthor,catchAsync(temples.deleteTemple))
      .put(isLoggedIn,upload.array('image'),validateTemple,isAuthor,catchAsync(temples.updatedTemple));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(temples.renderEditForm));


module.exports=router;