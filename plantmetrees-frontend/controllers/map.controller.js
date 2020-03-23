pmtApp.controller('MapController', function (
    $window,
    $scope,
    requests
) {
    let geojsonObject = {
        "type": "FeatureCollection",
        "features": [{
                "type": "Feature",
                "properties": {
                    "name": "Switzerland"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [9.594226, 47.525058],
                            [9.632932, 47.347601],
                            [9.47997, 47.10281],
                            [9.932448, 46.920728],
                            [10.442701, 46.893546],
                            [10.363378, 46.483571],
                            [9.922837, 46.314899],
                            [9.182882, 46.440215],
                            [8.966306, 46.036932],
                            [8.489952, 46.005151],
                            [8.31663, 46.163642],
                            [7.755992, 45.82449],
                            [7.273851, 45.776948],
                            [6.843593, 45.991147],
                            [6.5001, 46.429673],
                            [6.022609, 46.27299],
                            [6.037389, 46.725779],
                            [6.768714, 47.287708],
                            [6.736571, 47.541801],
                            [7.192202, 47.449766],
                            [7.466759, 47.620582],
                            [8.317301, 47.61358],
                            [8.522612, 47.830828],
                            [9.594226, 47.525058]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Lausanne"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [206.6339863, 46.5193823]
                }
            }
        ]
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
    }

    displayOnMap(geojsonObject);

    $scope.map.on('moveend', function (e) {
        console.log(getPoints());
        //$scope.statistics = requests.getStatistics(getPoints());
    });

    $scope.map.on('singleclick', function (evt) {
        console.log(evt.coordinate);
    });

    let statisticsMenu = new ol.control.Control({
        element: document.querySelector('#statisticsMenu')
    });
    $scope.map.addControl(statisticsMenu);
});