let express=require('express');
let router=express.Router();

let ctrlCities=require('../controllers/cities');
let ctrlReviews=require('../controllers/reviews');
let ctrlPlaces=require('../controllers/places');
let ctrlAuth=require('../controllers/authentication');
//let ctrlUpload=require('../controllers/uploads');
let ctrlPhoto=require('../controllers/photos');
let ctrlUsers=require('../controllers/userControl');
let multer  = require('multer');
let path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, './uploads/'))
    },
    filename: function (req, file, cb) {
        console.log(file.name);
      cb(null, file.filename + '-' + Date.now())
    }
  });
  const multerUpload = multer({  dest: 'uploads/'});
//cities
router.get('/citiesDistance', ctrlCities.citiesListByDistance);
router.get('/cities', ctrlCities.citiesListByRating);
router.use('/cities', ctrlCities.use);
router.post('/cities', ctrlCities.citiesCreate);
router.get('/cities/:cityid',  ctrlCities.citiesReadOne);
router.put('/cities/:cityid',  ctrlCities.citiesUpdateOne);
router.delete('/cities/:cityid', ctrlCities.citiesDeleteOne);
router.get('/cities', ctrlCities.searchCity);

//places
router.use('/cities/:cityid/places', ctrlPlaces.use);
router.get('/cities/:cityid/places', ctrlPlaces.placesAll);
router.get('/cities/:cityid/places/:placeid', ctrlPlaces.place);
router.post('/cities/:cityid/places', ctrlPlaces.placesCreate);
router.put('/cities/:cityid/places/:placeid', ctrlPlaces.placesUpdateOne);
//router.put('/cities/:cityid/places/:placeid/like', ctrlPlaces.likePlace);
router.delete('/cities/:cityid/places/:placeid', ctrlPlaces.placesDeleteOne);

//reviews
router.use('/cities/:cityid/reviews', ctrlReviews.use);
router.post('/cities/:cityid/reviews',  ctrlReviews.reviewsCreate);
router.get('/cities/:cityid/reviews', ctrlReviews.reviewsReadAll);
router.get('/cities/:cityid/reviews/:reviewid',  ctrlReviews.reviewsReadOne);
router.put('/cities/:cityid/reviews/:reviewid',   ctrlReviews.reviewsUpdateOne);
router.delete('/cities/:cityid/reviews/:reviewid',  ctrlReviews.reviewsDeleteOne);




//authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.get('/logout', ctrlAuth.logout);


//pictures
router.use('/cities/:cityid/photo', ctrlPhoto.use);
router.post('/cities/:cityid/photo', ctrlPhoto.uploadPhoto);
router.get('/cities/:cityid/photo', ctrlPhoto.photosList);
router.get('/cities/:cityid/photo/:photoid', ctrlPhoto.getPhoto);
router.delete('/cities/:cityid/photo/:photoid', ctrlPhoto.photoDelete);

//admin
router.use('/users', ctrlUsers.use);
router.get('/users', ctrlUsers.getUsers);
router.get('/users/:userid', ctrlUsers.getOneUser);
router.delete('/users/:userid', ctrlUsers.deleteUser);
router.put('/users/:userid', ctrlUsers.updateUser);


module.exports=router;