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
    distance: {type: Number},
    likes : {type: Number},
    author: {type: String}
});

var picturesSchema=new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    path: {type: String},
    createdOn: {type: Date, 'default': Date.now},
    //author: {type : String, required: true}
    description: {type: String}

})

var citySchema=new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {type: String, required: true},
  country:{type: String, required: true},
  lat: {type: String, required: true},
  lng: {type: String, required: true},
  information: {type: String},
  places: [{type: Schema.ObjectId, ref:"Place"}],
  rating: {type: Number, "default": 0, min:0, max:5},
  reviews: [reviewSchema],
  pictures: [picturesSchema]
});

mongoose.model('City', citySchema);
mongoose.model('Place', placesSchema);