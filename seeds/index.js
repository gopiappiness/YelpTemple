const mongoose = require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const Temple = require('../models/temple');
//connecting with mongoose with localhost 27017
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//here create database connect and error
const db = mongoose.connection;
db.on("err", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const sample =array=>array[Math.floor(Math.random()*array.length)];

//here i using random function in generating in location, title
const seedDB=async()=>{
    await Temple.deleteMany({});
    for(let i=0;i<300;i++){
     const random1000=Math.floor(Math.random()*1000);
     const price=Math.floor(Math.random()*20)+10;
     const camp=new Temple({
         author:'60d27663b82e1426100c8e5d',
         location:`${cities[random1000].city},${cities[random1000].state}`,
         title:`${sample(descriptors)} ${sample(places)}`,
         image: 'https://source.unsplash.com/collection/190727/500x500',
         description:'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Mollitia, est ipsam! Iste blanditiis fugiat nam exercitationem nesciunt repudiandae quis aspernatur distinctio vel deleniti est consectetur nisi beatae ratione, maxime enim?',
        //  price,
        opentiming:"4.50AM",
        closetiming:"10.30PM",
        contactnumber:"+918957456789",
        websites:"www.pillaiyarpattitemple.com",
         geometry:{ 
            type: 'Point',
             coordinates: [
                 cities[random1000].longitude,
                 cities[random1000].latitude,
              ]
              
            },

         images:[
            {
                url: 'https://res.cloudinary.com/ddlgzlwyg/image/upload/v1624607219/yelpcamp/pqaijw0tz4ig8uzcbkk1.jpg',
                filename: 'yelpcamp/pqaijw0tz4ig8uzcbkk1'
              },
              {
                url: 'https://res.cloudinary.com/ddlgzlwyg/image/upload/v1624607223/yelpcamp/ur3xzbnda9wq1t2r2t6w.png',
                filename: 'yelpcamp/ur3xzbnda9wq1t2r2t6w'
              }
          
         ]

     })
     await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
})