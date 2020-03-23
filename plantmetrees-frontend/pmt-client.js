/*
 * Filename: pmt-client.js
 *
 * Created Date: Saturday, September 14th 2019, 7:32:03 pm
 * Author: Lyubomir Vidov
 *
 * Copyright © 2019 PlantMeTrees
 */

/*
                                  ,@@@,
                                ,@@@@@@@,
                        ,,,.   ,@@@@@@/@@,  .oo8888o.
                     ,&%%&%&&%,@@@@@/@@@@@@,8888\88/8o
                    ,%&\%&&%&&%,@@@\@@@/@@@88\88888/88'
                    %&&%&%&/%&&%@@\@@/ /@@@88888\88888'
                    %&&%/ %&%%&&@@\ V /@@' `88\8 `/88'
                    `&%\ ` /%&'    |.|        \ '|8'
                        |o|        | |         | |
                        |.|        | |         | |
                __\_/_\_\\/ ._\//_/__/  ,\_//__\\/.  \_//__/_
██████╗ ███╗   ███╗████████╗      ██████╗██╗     ██╗███████╗███╗   ██╗████████╗
██╔══██╗████╗ ████║╚══██╔══╝     ██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝
██████╔╝██╔████╔██║   ██║        ██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║
██╔═══╝ ██║╚██╔╝██║   ██║        ██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║
██║     ██║ ╚═╝ ██║   ██║███████╗╚██████╗███████╗██║███████╗██║ ╚████║   ██║
╚═╝     ╚═╝     ╚═╝   ╚═╝╚══════╝ ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝
*/

const pmtApp = angular.module('pmtApp', [
    'angular-storage',
    'base64',
    'ngRoute',
    'ngResource',
    'ngAnimate',
    'ngAria',
    'ngMessages',
    'ngMaterial'
]);

pmtApp.config(function ($routeProvider, $mdThemingProvider) {

    $routeProvider
        .when(pmtConf.routes.home.route, {
            templateUrl: pmtConf.routes.home.templateUrl,
            controller: pmtConf.routes.home.controller
        })
        .otherwise({
            redirectTo: pmtConf.routes.home.route
        });

    const pmtPrimaryMap = $mdThemingProvider
        .extendPalette('light-green', pmtConf.palletes.primary);

    const pmtAccentMap = $mdThemingProvider
        .extendPalette('amber', pmtConf.palletes.accent);

    $mdThemingProvider
        .definePalette('pmtPrimary', pmtPrimaryMap);

    $mdThemingProvider
        .definePalette('pmtAccent', pmtAccentMap);

    $mdThemingProvider
        .theme('default')
        .primaryPalette('pmtPrimary', {
            'default': '400',
            'hue-1': '100',
            'hue-2': '600'

        })
        .accentPalette('pmtAccent', {
            'default': '400',
            'hue-1': '100',
            'hue-2': '600'
        })
        .warnPalette('red');

});