const logger = require('../management/logger.js')
const log = new logger().get();

let _handler = null;
let _rest = null;

function restInvitationLinksInit(commonRest, handler) {
    _rest = commonRest;
    _handler = handler;
}

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*The invitationLink rest is user strict - the requests apply for the current user(session)'s invitation link */
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function restInvitationLinkFindOrCreate(req, res){
    let requestId = _rest.generateReqId();

    _handler.invitationLinkfindOrCreate(req.user.id, function (err, result) {
        if (!err) {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId, result);
        } else {
            return _rest.error(res, requestId, err);
        }
    });
}
 
/**
 * @todo Sends a facebook dialog so the user can choose which friends to recieve the link 
 * @param {Object} req express request object
 * @param {Object} res express response object
 */
function restInvitationLinkSendFacebookbDialog(req, res) {
    _handler.invitationLinkfindOrCreate(req.user.id, function (err, invitationLink) {
       if(!err){
           const url =`http://www.facebook.com/dialog/send?app_id=${_rest.getAppId('facebook')}&amp;link=${invitationLink.link}&amp;redirect_uri=${'http://localhost:8089/'}`;
            res.redirect(url);
       } 
    });
    
}

function restInvitationLinkDelete(req, res) {
    let requestId = _rest.generateReqId();

    _handler.invitationLinkDelete(req.user.id,function (err) {
        if (err) {
            return _rest.error(res, requestId, err);
        } else {
            return _rest.response(res, 200, { url: req.path, method: req.method }, requestId);
        }
    });
}

function restInvitationLinksGetConfig() {
    return [
        {
            method: 'get',
            resource: 'invitationlink',
            apiRestriction: 'base',
            handler: restInvitationLinkFindOrCreate//D
        },
        {
            method: 'get',
            resource: 'invitationlink/facebook',
            apiRestriction: 'fbuser',
            handler: restInvitationLinkSendFacebookbDialog
        },
        {
            method:'delete',
            resource:'invitationlink',
            apiRestriction: 'base',
            handler: restInvitationLinkDelete//D
        }
    ]
}

module.exports = {
    init: restInvitationLinksInit,
    getConfig: restInvitationLinksGetConfig
};