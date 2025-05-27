const path = require('path');

module.exports = {
  entry: {
    app: './js/quiz.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/quiz.js',
  },
};
