var mongoose=require('mongoose'),
    Schema = mongoose.Schema;

var reviewSchema=new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    author: {type : String, required: true},
    rating: {type: Number, 'default': 0, min:0, max:5, required: true},
    reviewText: {type : String, required: true},
    createdOn: {type: Date, 'default': Date.now}
   
});

var placesSchema=new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    place: {type: String, required: true},
    lat: {type: String},
    lng: {type: String},
    likes : {type: Number, default: 0},
    author: {type: String, required: true},
    description: {type: String}
});

var picturesSchema=new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    createdOn: {type: Date, 'default': Date.now},
    author: {type : String, required: true},
    description: {type: String},
    path: {type: String, required: true}
})

var citySchema=new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {type: String, required: true},
  country:{type: String, required: true},
  lat: {type: Number, required: true},
  lng: {type: Number, required: true},
  information: {type: String},
  places: [placesSchema],
  rating: {type: Number, "default": 0, min:0, max:5},
  reviews: [reviewSchema],
  pictures: [picturesSchema],
    distance: {type: Number, default:0}
});

mongoose.model('City', citySchema);
//mongoose.model('Place', placesSchema);