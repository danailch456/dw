pmtApp.controller('MapController', function (
    $window,
    $scope,
    $http
) {

    $scope.polygons = {
        "type": "FeatureCollection",
        "features": [

        ]
    }

    function parseToGeoJson(coordinates, type) {
        console.log(coordinates[0].data);
        $scope.polygons.features.push({
            "type": "Feature",
            "geometry": {
                "type": type,
                "coordinates": coordinates[0].data
            }
        });
    }

    function getPoints() {
        var extent = $scope.map.getView().calculateExtent($scope.map.getSize());
        return points = [
            [extent[0], extent[1]],
            [extent[0], extent[3]],
            [extent[2], extent[1]],
            [extent[2], extent[3]]
        ];
    }

    $scope.statistics = {};

    var titleLayer = new $window.ol.layer.Tile({
        source: new $window.ol.source.OSM()
    });

    var view = new $window.ol.View({
        center: [1, 0],
        zoom: 4,
        projection: "EPSG:4326"
    });
    $scope.map = new $window.ol.Map({
        layers: [
            titleLayer
        ],
        target: 'map',
        view: view
    });

    function displayOnMap(geojsonObject) {
        var source = new $window.ol.source.Vector({
            features: (new $window.ol.format.GeoJSON()).readFeatures(geojsonObject)
        });

        var vectorLayer = new $window.ol.layer.Vector({
            source: source,
        });

        $scope.map.addLayer(vectorLayer);

        vectorLayer.getSource().changed();
    }



    $scope.map.on('moveend', function (e) {
        console.log(getPoints());
        $http({
            method: 'POST',
            url: 'http://localhost:8089/rest/v1/statistics',
            data: getPoints()
        }).then(function (response) {
            console.log(response.data.payload);
            $scope.statistics = response.data.payload;
        }).catch(function (err) {
            console.error(err);
        });

        displayOnMap($scope.polygons);
    });

    $scope.map.on('singleclick', function (evt) {
        console.log(evt.coordinate);
    });

    let statisticsMenu = new ol.control.Control({
        element: document.querySelector('#statisticsMenu')
    });
    $scope.map.addControl(statisticsMenu);

    $http({
        url: 'http://localhost:8089/rest/v1/polygons/forest',
        method: 'GET'
    }).then(function (response) {
        console.log("Displaying on map");
        parseToGeoJson(response.data.payload,'Polygon');
    }).catch(function (err) {
        console.error(err);
    });
});