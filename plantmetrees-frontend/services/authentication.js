pmtApp.factory('authentication', function ($http) {
    var user = null;

    function localLogin(username, password) {
        $http.post(`http://localhost:8089/rest/v1/session/local`, {
            username,
            password
        }).then(function (res) {
            console.log(res);
        }).catch(function (err) {
            console.log(err);
        });
    }

    return {
        localLogin
    }
});