
const Temple = require('../models/temple');
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});
const {cloudinary}=require('../cloudinary');

module.exports.index=async(req, res) => {
    const temples = await Temple.find({});
    res.render('temples/index', { temples})
};

module.exports.renderNewForm=(req, res) => {
    res.render('temples/new');

};
module.exports.createTemple=async(req, res,next) => {

       const geoData=await geocoder.forwardGeocode({
           query:req.body.temple.location,
           limit:1
       }).send()      
   const temple = new Temple(req.body.temple);
   temple.geometry=geoData.body.features[0].geometry;
   temple.images=req.files.map(f=>({url:f.path,filename:f.filename}));
   temple.author=req.user._id;
    await temple.save();
    console.log(temple);
    req.flash('success','successfully made by temples');
    res.redirect(`/temple/${temple._id}`)
    
};

module.exports.showTemple=async(req, res) => {
    const temple = await Temple.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    console.log(temple);
   if(!temple){
      req.flash('error','cannot find that temples');
       return res.redirect('/temples');
   }
    res.render('temples/show', { temple});
};

module.exports.renderEditForm=async (req, res) => {
    const {id} = req.params;
    const temple= await Temple.findById(id);
    if(!temple){
         req.flash('error','cannot find that temples');
         return res.redirect('/temples');
     }
     
    res.render('temples/edit', { temple });
};


module.exports.updatedTemple=async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const temple= await Temple.findByIdAndUpdate(id, { ...req.body.temple });
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    temple.images.push(...imgs);
    await temple.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
        }
    await temple.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages} } } })
    console.log(temple);
    }
    req.flash('success','Successfully temples updated');
    res.redirect(`/temples/${temple._id}`);
};

module.exports.deleteTemple=async (req, res) => {
    const { id } = req.params;
    await Temple.findByIdAndDelete(id);
    req.flash('success','Successfully deleting temples');
    res.redirect('/temples/');
};