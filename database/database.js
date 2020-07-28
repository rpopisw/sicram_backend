const mongoose = require('mongoose');
const { database } = require('./key');

mongoose.set('useFindAndModify', false);
mongoose.connect(database.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
})
  .then(db => console.log('DB is connected'))
  .catch(err => console.log(err));
