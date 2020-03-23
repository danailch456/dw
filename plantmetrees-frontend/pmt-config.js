/*
 * Filename: pmt-config.js
 *
 * Created Date: Saturday, September 14th 2019, 7:25:17 pm
 * Author: Lyubomir Vidov
 *
 * Copyright (c) 2019 PlantMeTrees
 */


const pmtConf = {};

pmtConf.routes = {

    home: {
        route: "/home",
        templateUrl: "./views/home.view.html",
        controller: "HomeController"
    }

};

pmtConf.palletes = {

    primary: {
        '400': '8ac148',
        /* default */
        '100': 'bdf478',
        /* hue-1 */
        '600': '599014',
        /* hue-2 */
        'contrastDarkColors': ['100'],
        'contrastLightColors': ['600']
    },
    accent: {
        '400': 'ffa726',
        /* default */
        '100': 'ffd95b',
        /* hue-1 */
        '600': 'c77800',
        /* hue-2 */
        'contrastDarkColors': ['100', '400'],
        'contrastLightColors': ['600']
    }

};