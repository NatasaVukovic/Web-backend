var express=require('express');
var router=express.Router();

var ctrlCities=require('../controllers/cities');
var ctrlReviews=require('../controllers/reviews');
var ctrlPlaces=require('../controllers/places');
var ctrlAuth=require('../controllers/authentication');
//var ctrlUpload=require('../controllers/uploads');
var ctrlPhoto=require('../controllers/photos');
var ctrlUsers=require('../controllers/userControl');

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
router.post('/cities/:cityid/photo', ctrlPhoto.uploadPhoto);
router.post('/cities/:cityid/photoList', ctrlPhoto.uploadPhotoList);
router.get('/cities/:cityid/pictures', ctrlPhoto.photosList);
router.get('/cities/:cityid/pictures/:pictureid', ctrlPhoto.getPhoto);
router.delete('/cities/:cityid/pictures/:pictureid', ctrlPhoto.photoDelete);

//admin
router.use('/users', ctrlUsers.use);
router.get('/users', ctrlUsers.getUsers);
router.get('/users/:userid', ctrlUsers.getOneUser);
router.delete('/users/:userid', ctrlUsers.deleteUser);
router.put('/users/:userid', ctrlUsers.updateUser);


module.exports=router;