if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require('joi');
const { templeSchema, reviewSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Temple = require('./models/temple');
const Review = require('./models/review');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const templeRoutes = require('./routes/temples');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require('connect-mongo')(session);

// const dbUrl=process.env.DB_URL;

const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

//database connection with localhost 27017
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

//data base connected or not checking
const db = mongoose.connection;

db.on("err", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

//html not allowed script so we used ejs 
app.engine('ejs', ejsMate);

//this view engine is ejs format
app.set('view engine', 'ejs');

app.set('/views', path.join(__dirname, '/views'))


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(mongoSanitize({
    replaceWith:'_'
}))

const secret=process.env.SECRET || 'thisisshouldbeasecret';

const store= new MongoDBStore({
    url:dbUrl,
    secret,
    touchAfter:24*60*60
});

store.on("error",function(e){
  console.log("SEESSION STORE ERROR",e);
})


const sessionConfig = {
    store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
       expires:Date.now()+1000*60*60*24*7,
         maxAge:1000*60*60*24*7
    }

}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://icons.getbootstrap.com/icons",
    "https://img.icons8.com",
    "http://icons.getbootstrap.com/icons/",
    "https://icons.getbootstrap.com/icons/house-door/",
    
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://icons.getbootstrap.com/icons",
    "https://img.icons8.com",
    "http://icons.getbootstrap.com/icons/",
    "https://icons.getbootstrap.com/icons/house-door/",
    "https://img.icons8.com/ios/100/000000/add-user-male.png",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dqy38xq3p/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})

const validateTemple = (req, res, next) => {
    const campSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),//title must required with string data type
            image: Joi.string().required(),//image must required with string data type
            location: Joi.string().required(),//image must required with string data type
            price: Joi.number().required().min(0),//price must required with number data type (min value must be 0)
            description: Joi.string().required(),//description must required with string data type
        }).required()


    })

    const { error } = campSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
    //    console.log(result);

}

//middle ware
const validateReview = (req, res, next) => {
    const reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required(),//title must required with number data type
            body: Joi.string().required()//image must required with string data type
        }).required()

    })

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
    //    console.log(result);

}

app.use('/', userRoutes);
app.use('/temples', templeRoutes);
app.use('/temples/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
});

//all the details show in find({})
app.get('/temples', catchAsync(async (req, res) => {
    const temples = await Temple.find({});
    res.render('temples/index', { temples })
}));
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' });
//     await camp.save();
//     res.send(camp)
// })
app.get('/temples/new', (req, res) => {
    res.render('temples/new');
});

app.post('/temples', validateTemple, catchAsync(async (req, res, next) => {
    const temple = new Temple(req.body.temple);
    await temple.save();
    res.redirect(`/temples/${temple._id}`)
}));

app.get('/temples/:id', catchAsync(async (req, res) => {
    const temple = await Temple.findById(req.params.id).populate('reviews');
    console.log(temple);
    res.render('temples/show', { temple });
}));

//using editing in value
app.get('/temples/:id/edit', catchAsync(async (req, res) => {
    const temple = await Temple.findById(req.params.id);
    res.render('temples/edit', { temple});
}));

//here using updating commands
app.put('/temples/:id', validateTemple, catchAsync(async (req, res) => {
    const { id } = req.params;
    const temple = await Temple.findByIdAndUpdate(id, { ...req.body.temple });
    res.redirect(`/temples/${temple._id}`);
}));

//i have used in delete options 
app.delete('/temples/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Temple.findByIdAndDelete(id);
    res.redirect('/temples/');
}));

//post the review commands here
app.post('/temples/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const temple = await Temple.findById(req.params.id);
    const review = new Review(req.body.review)
    temple.reviews.push(review);
    await review.save();
    await temple.save();
    res.redirect(`/temples/${temple._id}`);

}));
//deleting options
app.delete('/temples/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Temple.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/temples/${id}`);
}));



app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error', { err })
    // res.send('Oh boy something went Wrong');
})

const port=process.env.PORT || 3000;
//localhost:port number in 3000
app.listen(port, () => {
    console.log(`Serving on Port  Number is ${port}`);
})