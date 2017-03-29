module.exports = {


  friendlyName: 'Get current conditions',


  description: 'List the current weather conditions for a particular city or set of coordinates.',


  inputs: {
    apiKey: require('../constants/api-key.input'),
    latitude: {
      example: 37.03252,
      extendedDescription: 'If left unspecified, `city` must be provided instead.  Otherwise, both `latitude` and `longitude` must be specified.'
    },
    longitude: {
      example: -150.43283,
      extendedDescription: 'If left unspecified, `city` must be provided instead.  Otherwise, both `latitude` and `longitude` must be specified.'
    },
    city: {
      example: 'austin',
      extendedDescription: 'If left unspecified, `latitude` and `longitude` must be provided instead.  Otherwise, `city` must be specified.'
    },
    stateOrCountry: {
      example: 'texas',
      description: 'The state or country wherein the specified city is located (for the purposes of disambiguation.)',
      extendedDescription: 'If provided, `city` must also be specified.  (This is used for disambiguating city lookups, and making them more accurate.)'
    }
  },


  exits: {
    noCityFound: {
      description: 'No such city could be found.',
      extendedDescription: 'This exception is only relevant if a `city` was specified.  Otherwise it will never be triggered.'
    },
    success: {
      outputDescription: 'Current weather conditions.',
      outputExample: require('../constants/weather-conditions.exemplar'),
      moreInfoUrl: 'http://openweathermap.org/current#parameter'
    }
  },


  fn: function(inputs, exits) {
    var util = require('util');
    var Http = require('machinepack-http');

    // Negotiate argins, building request data along the way.
    var requestData = {
      appid: inputs.apiKey
    };
    if (inputs.latitude !== undefined || inputs.longitude !== undefined) {
      if (inputs.latitude === undefined || inputs.longitude === undefined) {
        return exits.error(new Error('If `latitude` is specified, `longitude` must also be specified, and vice versa.'));
      }
      if (inputs.city !== undefined || inputs.stateOrCountry !== undefined) {
        return exits.error(new Error('If `latitude` or `longitude` is specified, then neither `city` nor `stateOrCountry` ought to be specified.'));
      }
      requestData.lat = inputs.latitude;
      requestData.lon = inputs.longitude;
    }
    else if (inputs.city !== undefined) {

      var cityStateOrCountry;
      if (inputs.stateOrCountry !== undefined) {
        cityStateOrCountry = inputs.city + ',' + inputs.stateOrCountry;
      } else {
        cityStateOrCountry = inputs.city;
      }

      requestData.q = cityStateOrCountry;
    }
    else {
      return exits.error(new Error('Either a `city` or `latitude`+`longitude` must be specified.'));
    }


    Http.get({
      baseUrl: 'http://api.openweathermap.org',
      url: '/data/2.5/weather',
      data: requestData
    }).exec({
      error: function(err) { return exits.error(err); },
      non200Response: function(httpResponse) {
        if (inputs.city !== undefined && httpResponse.statusCode === 404) { return exits.noCityFound(); }
        return exits.error(new Error('Unexpected response from the OpenWeather API:\n' + util.inspect(httpResponse, {depth: 5})));
      },
      success: function(httpResponse) {
        return exits.success(httpResponse.body);
      }
    });//</ Http.get() >

  },

};
