const mongoose = require('mongoose');
const { database } = require('./key');
const chalk = require('chalk');

mongoose.set('useFindAndModify', false);

mongoose.connect(database.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
})
  .then(db => console.log(chalk.yellow('DB is connected')))
  .catch(err => console.log(err));
