/**
 * constants/api-key.input
 */
module.exports = {
  required: true,
  example: 'xAmBxAmBxAmBkjbyKkjbyKkjbyK',
  description: 'Your private, openweathermap.org API key.',
  protect: true,
  whereToGet: {
    url: 'http://openweathermap.org/appid#get',
    description: 'Copy and paste an API key, or create one if you haven\'t already.',
    extendedDescription: 'You will first need to sign up for an openweathermap.org account.'
  }
};
