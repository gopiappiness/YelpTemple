
const express=require('express');
const router=express.Router({mergeParams:true});

const catchAsync=require('../utils/catchAsync');
const ExpressError= require('../utils/ExpressError');
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware')
const reviews = require('../controllers/reviews');

const Temple = require('../models/temple');
const Review=require('../models/review');



//post the review commands here
router.post('/', isLoggedIn,validateReview,catchAsync(reviews.createReview))
//deleting options
router.delete('/:reviewId', isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports=router;