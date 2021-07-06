const {templeSchema}=require('./schemas.js');
const ExpressError=require('./utils/ExpressError');
const Temple=require('./models/temple');
const Review=require('./models/review');

const {reviewSchema}=require('./schemas.js')


module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        req.flash('error','you must be signed first!!');
       return res.redirect('/login');
    }
    next();
}

module.exports.validateTemple=(req,res,next)=>{
    const {error}=templeSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

module.exports.isAuthor=async(req,res,next)=>{
 const {id}=req.params;
 const temple = await Temple.findById(id);
 if(!temple.author.equals(req.user._id)){
     req.flash('error','you do not a permission to do that');
     return res.redirect(`/temples/${id}`);
 }
 next();
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','you do not a permission to do that');
        return res.redirect(`/temples/${id}`);
    }
    next();
   }
   

//middle ware functions
module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
    
}