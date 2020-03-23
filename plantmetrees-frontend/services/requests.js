pmtApp.factory('requests',function ($http) {
    
    function getPolygons() {
        $http.get(`http://localhost:8089/rest/v1/polygons`).then(function (res) {
            console.log(res);
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getinsectHotels() {
        
    }

    function getStatistics(projection) {
        
    }

    let forests = {
        getPolygons,
        getinsectHotels,

    }

    let statistics = {
        get: getStatistics
    }

    return {
        forests,
        statistics
    }

});