pmtApp.controller('HomeController', function (
    $window,
    $location,
    $scope,
    $anchorScroll
) {
    $scope.sections = [{
            hide: true,
            name: 'map'
        },
        {
            hide: true,
            name:'campaigns'
        },
        {
            hide: false,
            name: 'home'
        }
    ]

    $scope.goToAnchor = function (hash) {
        let newHash = hash;
        if ($location.hash() !== newHash) {
            $anchorScroll(hash);
        } else {
            $anchorScroll();
        }
    };

    $scope.display = function (section) {
        return ($scope.sections.find(s=>s.name == section)).hide;
    }

    $scope.switch = function (section) {
        $scope.sections.forEach(s => {
            if (s.name == section) {
                s.hide = false;
            } else {
                s.hide = true
            }
        });
    }
});