'use strict';

Parse.Cloud.define('coach', function(request, response) {
  var coach = request.params.coachName;
  Parse.Cloud.httpRequest({
    url: 'http://fumbbl.com/xml:teams?coach=' + coach
  }).then(function(httpResponse) {
    response.success(httpResponse.text);
  }, function(httpResponse) {
    response.error('Request failed with response code ' + httpResponse.status);
  });
});

Parse.Cloud.define('team', function(request, response) {
  var id = request.params.id;
  Parse.Cloud.httpRequest({
    url: 'http://fumbbl.com/xml:team?id=' + id
  }).then(function(httpResponse) {
    response.success(httpResponse.text);
  }, function(httpResponse) {
    response.error('Request failed with response code ' + httpResponse.status);
  });
});

Parse.Cloud.define('replay', function(request, response) {
  var id = request.params.id;
  var prefix = Math.floor(id / 1000);
  var ffbUrl = 'https://fumbbl.com/results/' + prefix + '/ffb-' + id + '.xml';
  var apiUrl = 'https://fumbbl.com/xml:matches?m=' + id;


  Parse.Cloud.httpRequest({
    url: ffbUrl
  }).then(function(httpResponse) {
    response.success(httpResponse.text);
  }, function(httpResponse) {
    response.error('Request failed with response code ' + httpResponse.status);
  });
});
