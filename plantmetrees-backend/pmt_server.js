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
██████╗ ███╗   ███╗████████╗     ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗
██╔══██╗████╗ ████║╚══██╔══╝     ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
██████╔╝██╔████╔██║   ██║        ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
██╔═══╝ ██║╚██╔╝██║   ██║        ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║     ██║ ╚═╝ ██║   ██║███████╗███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
╚═╝     ╚═╝     ╚═╝   ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
*/

/* Init the node modules */
const fs = require('fs');
const yml = require('js-yaml');

/* Define the config files from manifest */
const configFiles = require('./_config_manifest.json');

/* Load the config files */
const properties = yml.safeLoad(fs.readFileSync(configFiles.common_props_file, 'utf8'));
const config = yml.safeLoad(fs.readFileSync(configFiles.config_file, 'utf8'));

/* Data management */
const DataManagement = require('./management/data_management.js');
const dataMgmt = new DataManagement(config);

dataMgmt.dbConnect();

/* Auth management */
const AuthManagement = require('./management/auth_management.js');
const authMgmt = new AuthManagement(properties.oauth20);

/* Server init */
const modules = properties.modules;

let moduleHandlerMap = {};

for (let idx in modules){
    let moduleName = modules[idx];
    let handler = require(`./modules/${moduleName}`);

    //pass the instance of DataManagment to every handler
    handler.init(dataMgmt);

    moduleHandlerMap[moduleName] = handler;
}

const restServer = require('./rest/rest')(authMgmt);

restServer.init(moduleHandlerMap);
restServer.register();
restServer.listen(properties.ports.rest);
