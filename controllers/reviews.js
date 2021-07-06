const Temple= require('../models/temple');
const Review=require('../models/review');

module.exports.createReview=async (req, res) => {
    const temple = await Temple.findById(req.params.id);
    const review=new Review(req.body.review)
    review.author=req.user._id;
    temple.reviews.push(review);
    await review.save();
    await temple.save();
    req.flash('success','Created new Reviews');
    res.redirect(`/temples/${temple._id}`);
}

module.exports.deleteReview=async (req, res) => {
    const{ id,reviewId}=req.params;
    await Temple.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully Deleted Reviews');
 
    res.redirect(`/temples/${id}`);
 };