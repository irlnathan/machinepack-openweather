module.exports = {
  friendlyName: 'Get current conditions',
  description: 'List the current weather conditions for a particular city.',
  extendedDescription: '',
  inputs: {
    apiKey: {
      example: 'xAmBxAmBxAmBkjbyKkjbyKkjbyK',
      description: 'The private API key for this application.',
      protect: true,
      whereToGet: {
        url: 'http://openweathermap.org/appid#get',
        description: 'Copy and paste an API key, or create one if you haven\'t already.',
        extendedDescription: ''
      }
    },
    city: {
      example: 'austin',
      description: 'The city for the current weather conditions.',
      required: true
    },
    stateOrCountry: {
      example: 'texas',
      description: 'The state or country for the current weather conditions.'
    }
  },
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    noCityFound: {
      description: 'No city found.'
    },
    success: {
      description: 'Returns current conditions for a city.',
      example: {
        coord: {
          lon: -97.74,
          lat: 30.27
        },
        sys: {
          message: 0.25,
          country: 'United States of America',
          sunrise: 1424005831,
          sunset: 1424045975
        },
        weather: [{
          id: 803,
          main: 'Clouds',
          description: 'broken clouds',
          icon: '04d'
        }],
        base: 'cmc stations',
        main: {
          temp: 292.36,
          temp_min: 292.36,
          temp_max: 292.36,
          pressure: 1007.21,
          sea_level: 1032.2,
          grnd_level: 1007.21,
          humidity: 64
        },
        wind: {
          speed: 4.42,
          deg: 189.5
        },
        clouds: {
          all: 76
        },
        dt: 1424018333,
        id: 4671654,
        name: 'Austin'
      }
    }
  },
  fn: function(inputs, exits) {
    var util = require('util');
    var _ = require('lodash');
    var Http = require('machinepack-http');

    var cityStateOrCountry;
    if (inputs.stateOrCountry) {
      cityStateOrCountry = inputs.city + ',' + inputs.stateOrCountry;
    } else {
      cityStateOrCountry = inputs.city;
    }

    Http.sendHttpRequest({
      baseUrl: 'http://api.openweathermap.org',
      url: '/data/2.5/weather',
      method: 'get',
      params: {
        api_key: inputs.apiKey,
        q: cityStateOrCountry
      }
    }).exec({
      success: function(httpResponse) {
        // Parse response body and build up result.
        var responseBody;
        try {
          responseBody = JSON.parse(httpResponse.body);

          if (responseBody.cod === '404') {
            return exits.noCityFound('No City Found.');
          }

          return exits.success(responseBody);
        } catch (e) {
          return exits.error('Unexpected response from the OpenWeather API:\n' + util.inspect(responseBody, false, null) + '\nParse error:\n' + util.inspect(e));
        }
      },
      // An unexpected error occurred.
      error: function(err) {
        return exits.error(err);
      }
    });
  }
}
