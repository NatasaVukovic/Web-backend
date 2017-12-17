var express=require('express');
var router=express.Router();
var multer=require('multer');
var upload = multer({ dest: 'uploads/' });
/*var jwt=require('express-jwt');
var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});*/

var ctrlCities=require('../controllers/cities');
var ctrlReviews=require('../controllers/reviews');
var ctrlPlaces=require('../controllers/places');
var ctrlAuth=require('../controllers/authentication');
var ctrlUpload=require('../controllers/uploads');
var ctrlPictures=require('../controllers/pictures');

//cities
//router.get('/cities', ctrlCities.citiesListByDistance);
router.get('/cities', ctrlCities.citiesListByRating);
router.use('/cities', ctrlCities.use);
router.post('/cities', ctrlCities.citiesCreate);
router.get('/cities/:cityid',  ctrlCities.citiesReadOne);
router.put('/cities/:cityid',  ctrlCities.citiesUpdateOne);
router.delete('/cities/:cityid', ctrlCities.citiesDeleteOne);
router.get('/cities', ctrlCities.searchCity);

//places
router.use('/cities/:cityid/places', ctrlPlaces.use);
//router.get('/cities/:cityid/places', ctrlPlaces.placesListByLikes);
router.post('/cities/:cityid/places', ctrlPlaces.placesCreate);
router.put('/cities/:cityid/places/:placeid', ctrlPlaces.placesUpdateOne);
router.put('/cities/:cityid/places/:placeid/like', ctrlPlaces.likePlace);
router.delete('cities/:cityid/places/:placeid', ctrlPlaces.placesDeleteOne)

//reviews
router.use('/cities/:cityid/reviews', ctrlReviews.use);
router.post('/cities/:cityid/reviews',  ctrlReviews.reviewsCreate);
router.get('/cities/:cityid/reviews/:reviewid',  ctrlReviews.reviewsReadOne);
router.put('/cities/:cityid/reviews/:reviewid',   ctrlReviews.reviewsUpdateOne);
router.delete('/cities/:cityid/reviews/:reviewid',  ctrlReviews.reviewsDeleteOne);
/*
//upload
router.get('/cities/:cityid/upload/:filename', ctrlUpload.getFile);
router.post('/cities/:cityid/upload', ctrlUpload.createFile);
router.get('/cities/cityid/upload', ctrlUpload.listOfUploads);*/


//authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.get('/logout', ctrlAuth.logout);


//pictures
router.post('/cities/:cityid/pictures', ctrlPictures.uploadPhoto);
router.get('/cities/:cityid/pictures', ctrlPictures.photosList);
router.get('/cities/:cityid/pictures/:pictureid', ctrlPictures.getPhoto);
router.delete('/cities/:cityid/pictures/:pictureid', ctrlPictures.photoDelete);

module.exports=router;