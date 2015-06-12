'use strict';
var Roster = Parse.Object.extend("Roster");
var rosterCacheRefreshPeriod = 24 * 60 * 60 * 1000;

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

Parse.Cloud.define('roster', function(request, response) {
  console.log('Roster!');
  var id = request.params.id;
  var roster = new Roster();

  var query = new Parse.Query(Roster);
  query.equalTo("rosterId", id);
  query.find({
    success: function(rosters) {
      console.log('Roster query success!');
      if (!rosters.length) {
        console.log('but no rosters!!!');
        getRosterData(id, roster, response);
      } else {
        // refresh the cache
        console.log('roster updated: ' + rosters[0].updatedAt);

        var now = new Date(Date.now());
        if (rosters[0].updatedAt.getTime() + rosterCacheRefreshPeriod < Date.now()) {
          console.log('stale roster!!!');
          getRosterData(id, rosters[0], response);
        } else {
          response.success(rosters[0].get('xml'));
        }
      }
    },
    error: function(object, error) {
      getRosterData(id, roster, response);
    }
  });
});

function getRosterData (id, roster, response) {
  console.log('Roster sads!');
  Parse.Cloud.httpRequest({
    url: 'https://fumbbl.com/xml:roster?id=' + id
  }).then(function(httpResponse) {

    roster.set("rosterId", id);
    roster.set("xml", httpResponse.text);

    roster.save(null, {
      success: function(roster) {
        console.log('New object created with rosterId: ' + roster.rosterId);
      },
      error: function(roster, error) {
        console.log('Failed to create new object, with error code: ' + error.message);
      }
    });

    response.success(httpResponse.text);
  }, function(httpResponse) {
    response.error('Request failed with response code ' + httpResponse.status);
  });
}

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

var cacheFactory = {
  get: function (objectName, cacheRefreshPeriod)
}