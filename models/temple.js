const mongoose=require('mongoose');
const Review=require('./review')
const Schema=mongoose.Schema;

const ImageShema =new Schema({
    url:String,
    filename:String
});

ImageShema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_100');
});

const opts={toJSON: {virtuals:true } };

//here i creating schema
const TempleSchema=new Schema({
    title:String,
    images:[ImageShema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:['Number'],
            required:true
        }
    },
    // price:Number,
    opentiming:String,
    closetiming:String,
    contactnumber:Number,
    websites:String,
    description:String,
    location:String,
    author:
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]

},opts);

TempleSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a herf="/temples/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
});

TempleSchema.post('findOneAndDelete',async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})
module.exports=mongoose.model('Temple',TempleSchema);

