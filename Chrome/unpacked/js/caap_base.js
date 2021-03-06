/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,$,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
devVersion,caapVersion,caapjQuery,caapjQueryUI,caapjQueryDataTables,
battle,feed,festival,spreadsheet,town,FB,conquest,
image64:true,offline:true,profiles:true,
session:true,state:true,css:true,gm:true,ss:true,db:true,sort:true,schedule:true,
general:true,monster:true,guild_monster:true,gifting:true,army:true,caap:true,con:true,
schedule,gifting,state,army, general,session,monster,guild_monster,worker,conquestLands,
stats,statsFunc,throwError,configOld,configDefault,hyper,stateOld,
gb,essence,gift,chores */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          caap OBJECT
// this is the main object for the game, containing all methods, globals, etc.
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.namespace = "caap";

    caap.caapDivObject = {};

    caap.caapTopObject = {};

    caap.caapTopMinObject = {};

    caap.caapPlayButtonDiv = {};

    caap.documentTitle = '';
//
    caap.newVersionAvailable = typeof CAAP_SCOPE_RUN !== "undefined" ? (devVersion !== '0' ? (CAAP_SCOPE_RUN[1] > caapVersion || (CAAP_SCOPE_RUN[1] >= caapVersion && CAAP_SCOPE_RUN[2] > devVersion)) : (CAAP_SCOPE_RUN[1] > caapVersion)) : false;

    caap.fbIframeDiv = {};

    caap.ajaxLoadIcon = {};

    caap.resultsText = '';

    caap.jWindow = null;

    caap.jss = "javascript";

    caap.libs = {
        jQuery: 'https://ajax.googleapis.com/ajax/libs/jquery/' + caapjQuery + '/jquery.min.js',
        jQueryUI: 'https://ajax.googleapis.com/ajax/libs/jqueryui/' + caapjQueryUI + '/jquery-ui.min.js',
        farbtastic: 'https://castle-age-auto-player.googlecode.com/files/farbtastic.min.js',
        utility: 'https://utility-js.googlecode.com/files/utility-0.2.3.min.js',
        dataTables: 'https://ajax.aspnetcdn.com/ajax/jquery.dataTables/' + caapjQueryDataTables + '/jquery.dataTables.min.js'
    };

    caap.removeLibs = [];

    caap.domain = {
        which: -1,
        protocol: ["http://", "https://"],
        ptype: 0,
        url: ["apps.facebook.com/castle_age", "apps.facebook.com/reqs.php#confirm_46755028429_0", "web3.castleagegame.com/castle_ws", "webback.castleagegame.com/castle", "www.facebook.com/dialog/apprequests"],
        link: "",
        altered: "",
        inIframe: false
    };

    caap.setDomWaiting = function (url) {
        con.log(3, "setDomWaiting", url, session.getItem('clickUrl', ''));
        var update = $u.hasContent(url) && !session.getItem('clickUrl', '').hasIndexOf(url);

        con.log(3, "setDomWaiting update", update);
        if (update) {
            con.log(3, "setDomWaiting clickUrl", url);
            session.setItem('clickUrl', url);
        }

        if (update || !session.getItem("waitingForDomLoad", false)) {
            con.log(3, "waitingForDomLoad", session.getItem('clickUrl', ''));
            schedule.setItem("clickedOnSomething", 0);
            session.setItem("waitingForDomLoad", true);
        }
    };

    caap.getDomWaiting = function () {
        return session.getItem("waitingForDomLoad", false);
    };

    caap.clearDomWaiting = function () {
        con.log(3, "clearDomWaiting");
        schedule.setItem("clickedOnSomething", 3600);
        session.setItem("waitingForDomLoad", false);
    };

    caap.sessionVarsInit = function () {
        session.setItem("lastReload", Date.now());
        session.setItem("pageLoadCounter", 0);
        session.setItem("flagReload", false);
        session.setItem("delayMain", false);
        session.setItem("pageLoadOK", true);
        session.setItem('clickUrl', window.location.href);
        session.setItem("waitingForDomLoad", false);
    };

	caap.addToDataRegister = function() {
		worker.recordsList.forEach( function(r) {
			caap.dataRegister[r] = {
				"get": function () {
					return window[r].records;
				},

				"set": function (value) {
					window[r].records = value;
				},

				"save": function (src) {
					window[r].save(src);
				},

				"loaded": caap.dataRegister && caap.dataRegister[r] ? caap.dataRegister[r].loaded : false
			};
		});
	};
	
	caap.dataRegister = caap.dataRegister || {
        "config.options": {
            "get": function () {
                return config.getAll();
            },

            "set": function (value) {
                config.setAll(value);
            },

            "loaded": false
        },

        "state.flags": {
            "get": function () {
                return state.getAll();
            },

            "set": function (value) {
                state.setAll(value);
            },

            "loaded": false
        },

        "schedule.timers": {
            "get": function () {
                return schedule.getAll();
            },

            "set": function (value) {
                schedule.setAll(value);
            },

            "loaded": false
        },

        "caap.demi": {
            "get": function () {
                return caap.demi;
            },

            "set": function (value) {
                caap.demi = value;
            },

            "save": function (src) {
                caap.SaveDemi(src);
            },

            "loaded": false
        },

        "conquestLands.records": {
            "get": function () {
                return conquestLands.records;
            },

            "set": function (value) {
                conquestLands.records = value;
            },

            "save": function (src) {
                conquestLands.save(src);
            },

            "loaded": false
        },

        "guild_monster.records": {
            "get": function () {
                return guild_monster.records;
            },

            "set": function (value) {
                guild_monster.records = value;
            },

            "save": function (src) {
                guild_monster.save(src);
            },

            "loaded": false
        },

        "spreadsheet.records": {
            "get": function () {
                return spreadsheet.records;
            },

            "set": function (value) {
                spreadsheet.records = value;
            },

            "save": function (src) {
                spreadsheet.save(src);
            },

            "loaded": false
        }
    };

    caap.mTarget = {
        "caapfb": {
            ref: null,
            url: "*"
        },

        "caapif": {
            ref: null,
            url: "*"
        },

        "caapifp": {
            ref: null,
            url: "*"
        }
    };

    caap.postMessage = function (msg) {
        try {
            var port = $u.is_chrome ? caap.port : caap.mTarget[msg.dest].ref,
                msj = $u.is_chrome ? msg : JSON.stringify(msg),
                url = $u.is_chrome ? null : $u.setContent(caap.mTarget[msg.dest].url, "*");

            if (!port) {
                throw "No port available";
            }

            port.postMessage(msj, url);
        } catch (err) {
            con.error("ERROR in postMessage: " + err, msg);
            //alert("ERROR in postMessage: " + err.stack);

			worker.list.forEach( function(r) {
				window[r] = null;
			});
			window.worker = null;
            window.image64 = null;
            window.offline = null;
            window.profiles = null;
            window.session = null;
            window.config = null;
            window.state = null;
            window.css = null;
            window.gm = null;
            window.ss = null;
            window.db = null;
            window.sort = null;
            window.schedule = null;
            window.arena = null;
            window.festival = null;
            window.spreadsheet = null;
            window.caap = null;
            window.con = null;
            $u.reload();
        }
    };

    caap.messaging = {
        connected : ["caap"],

        dataRegisterLoaded : false,

        connect : function () {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caap")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caap",
                        message: "connect",
                        data: ""
                    });

                    session.incItem("messageCount");
                } else if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caap")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: ($u.is_chrome ? "caap" : "caapfb"),
                        message: "connect",
                        data: ""
                    });

                    session.incItem("messageCount");
                } else if (caap.domain.which === 4 && caap.messaging.connected.hasIndexOf("caap")) {
                    caap.postMessage({
                        source: "caapifp",
                        dest: ($u.is_chrome ? "caap" : "caapif"),
                        message: "connect",
                        data: ""
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connect";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.connect: " + err.stack);
                return false;
            }
        },

        setItem : function (name, value) {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "setItem",
                        data: {
                            name: name,
                            value: value
                        }
                    });

                    session.incItem("messageCount");
                } else if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "setItem",
                        data: {
                            name: name,
                            value: value
                        }
                    });

                    session.incItem("messageCount");
                } else {
                    if (caap.domain.which !== 4) {
                        throw "Wrong domain or destination not connected";
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.setItem: " + err.stack);
                return false;
            }
        },

        getItem : function (msg, data) {
            try {
                if (caap.messaging.connected.hasIndexOf(msg.source)) {
                    caap.postMessage({
                        source: msg.dest,
                        dest: msg.source,
                        message: "getItem",
                        data: data
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.getItem: " + err.stack);
                return false;
            }
        },

        ok : function (msg) {
            try {
                if ((caap.domain.which === 0 || caap.domain.which === 3 || caap.domain.which === 4) && caap.messaging.connected.hasIndexOf(msg.source)) {
                    caap.postMessage({
                        source: msg.dest,
                        dest: msg.source,
                        message: "ok",
                        data: msg.message
                    });
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.ok: " + err.stack);
                return false;
            }
        },

        visitUrl : function (url) {
            try {
                if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "visitUrl",
                        data: url
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.visitUrl: " + err.stack);
                return false;
            }
        },

        setDivContent : function (name, value, hide) {
            try {
                if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "setDivContent",
                        data: {
                            name: name,
                            value: value,
                            hide: (hide ? true : false)
                        }
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.setDivContent: " + err.stack);
                return false;
            }
        },

        setCheckedIds : function (idArray) {
            try {
                if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapifp")) {
                    session.setItem("delayMain", true);
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapifp",
                        message: "setCheckedIds",
                        data: idArray
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.setCheckedIds: " + err.stack);
                return false;
            }
        },

        restartListener : function (inform) {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "restartListener",
                        data: ""
                    });

                    session.incItem("messageCount");
                } else if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    if (inform) {
                        caap.postMessage({
                            source: "caapif",
                            dest: "caapfb",
                            message: "restartListener",
                            data: ""
                        });

                        session.incItem("messageCount");
                    }
                } else {
                    if (caap.domain.which === 0 || caap.domain.which === 3) {
                        throw "Destination not connected";
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.restartListener: " + err.stack);
                return false;
            }
        },

        pauseListener : function (inform) {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "pauseListener",
                        data: ""
                    });

                    session.incItem("messageCount");
                } else if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    if (inform) {
                        caap.postMessage({
                            source: "caapif",
                            dest: "caapfb",
                            message: "pauseListener",
                            data: ""
                        });

                        session.incItem("messageCount");
                    }
                } else {
                    if (caap.domain.which === 0 || caap.domain.which === 3) {
                        throw "Destination not connected";
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.pauseListener: " + err.stack);
                return false;
            }
        },

        changeDropDownList : function (idName, dropList, option) {
            try {
                if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "changeDropDownList",
                        data: {
                            idName: idName,
                            dropList: dropList,
                            option: option
                        }
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.changeDropDownList: " + err.stack);
                return false;
            }
        },

        selectDropOption : function (idName, value) {
            try {
                if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "selectDropOption",
                        data: {
                            idName: idName,
                            value: value
                        }
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.selectDropOption: " + err.stack);
                return false;
            }
        },

        hello : function () {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "hello",
                        data: ""
                    });

                    session.incItem("messageCount");
                } else if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "hello",
                        data: ""
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.hello: " + err.stack);
				// This is bad. Later loads will fail and script will freeze. Do a reload.
				caap.reloadCastleAge();
                return false;
            }
        },

        broadcast : function () {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "broadcast",
                        data: caap.messaging.connected
                    });

                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.broadcast: " + err.stack);
                return false;
            }
        },

        cntd : function (msg) {
            try {
                if ((caap.domain.which === 0 || caap.domain.which === 3) && caap.messaging.connected.hasIndexOf(msg.source)) {
                    caap.postMessage({
                        source: msg.dest,
                        dest: msg.source,
                        message: "connected",
                        data: caap.messaging.connected
                    });

                    session.incItem("messageCount");
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.cntd: " + err.stack);
                return false;
            }
        },

        disconnect : function () {
            try {
                if (caap.domain.which === 4 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapifp",
                        dest: "caapif",
                        message: "disconnect",
                        data: ""
                    });

                    caap.caapifpShutdown();
                } else if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "disconnect",
                        data: ""
                    });

                    caap.caapifShutdown();
                } else if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "disconnect",
                        data: ""
                    });
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.disconnect: " + err.stack);
                return false;
            }
        },

        scrollToTop : function () {
            try {
                if (caap.domain.which === 3 && caap.messaging.connected.hasIndexOf("caapfb")) {
                    caap.postMessage({
                        source: "caapif",
                        dest: "caapfb",
                        message: "scrollToTop",
                        data: ""
                    });
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.scrollToTop: " + err.stack);
                return false;
            }
        },

        styleChange : function () {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "styleChange",
                        data: ""
                    });
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.styleChange: " + err.stack);
                return false;
            }
        },

        backgroundCA : function (bgcolor) {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "backgroundCA",
                        data: bgcolor
                    });
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.backgroundCA: " + err.stack);
                return false;
            }
        },

        goblinHinting : function () {
            try {
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif")) {
                    caap.postMessage({
                        source: "caapfb",
                        dest: "caapif",
                        message: "goblinHinting",
                        data: ""
                    });
                } else {
                    throw "Wrong domain or destination not connected";
                }

                return true;
            } catch (err) {
                con.error("ERROR in messaging.goblinHinting: " + err.stack);
                return false;
            }
        }
    };

    caap.scrollToTop = function () {
        window.scrollTo(0, config.getItem("scrollToPosition", 0));
    };

    /*
    caap.showRequestForm = (function (tit, msg, track, request_params) {
        FB.api({
            method: 'fql.query',
            query: 'SELECT uid FROM user WHERE is_app_user = 1 AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())'
        }, function (result) {
            var i,
                appUsers = [],
                filterLists = [],
                lists = {
                    0x00: {
                        name: 'Send',
                        list: 'caap_giftSend',
                        gift: true,
                        fest: false,
                        recr: false,
                        mons: false,
                        prom: false,
                        all: false
                    },
                    0x01: {
                        name: 'app_users',
                        list: '',
                        gift: false,
                        fest: false,
                        recr: false,
                        mons: false,
                        prom: false,
                        all: true
                    },
                    0x02: {
                        name: 'Custom',
                        list: 'caap_giftCustom',
                        gift: true,
                        fest: false,
                        recr: false,
                        mons: true,
                        prom: true,
                        all: false
                    },
                    0x03: {
                        name: 'Guild',
                        list: 'caap_giftGuild',
                        gift: true,
                        fest: true,
                        recr: false,
                        mons: true,
                        prom: true,
                        all: false
                    },
                    0x06: {
                        name: 'all',
                        list: '',
                        gift: false,
                        fest: false,
                        recr: true,
                        mons: false,
                        prom: false,
                        all: false
                    },
                    0x07: {
                        name: 'app_non_users',
                        list: '',
                        gift: false,
                        fest: false,
                        recr: true,
                        mons: false,
                        prom: false,
                        all: false
                    },
                    0x08: {
                        name: 'Non Followers',
                        list: 'caap_nfollowers',
                        gift: false,
                        fest: true,
                        recr: false,
                        mons: false,
                        prom: false,
                        all: false
                    }
                },
                list, limit = false,
                gift = request_params.indexOf("gift=") >= 0,
                fest = request_params.indexOf("fest=") >= 0,
                recr = msg.indexOf("recruiting") >= 0,
                mons = request_params.indexOf("battle_monster") >= 0,
                prom = request_params.indexOf("popup_promo_create") >= 0,
                filterFunc;

            for (i in result) {
                if (result.hasOwnProperty(i)) {
                    appUsers.push(parseInt(result[i].uid, 10));
                }
            }

            filterFunc = function (member) {
                return appUsers.indexOf(member) >= 0;
            };

            for (i in lists) {
                if (lists.hasOwnProperty(i)) {
                    if (!lists[i].all) {
                        if ((!gift && !fest && !recr && !mons && !prom) || (gift && !lists[i].gift) || (fest && !lists[i].fest) || (recr && !lists[i].recr) || (mons && !lists[i].mons) || (prom && !lists[i].prom)) {
                            continue;
                        }
                    }

                    list = '';
                    if (lists[i].list) {
                        list = sessionStorage.getItem(lists[i].list);
                        list = list && list.length ? JSON.parse(list).filter(filterFunc) : null;

                        if (list && list.length) {
                            filterLists.push({
                                name: lists[i].name,
                                user_ids: list
                            });

                            if (lists[i].name === "Send") {
                                limit = true;
                            }
                        }
                    } else {
                        filterLists.push(lists[i].name);
                    }

                    if (limit && lists[i].name === "app_users") {
                        break;
                    }
                }
            }

            console.log("filterLists", filterLists);
            FB.ui({
                method: 'apprequests',
                message: msg,
                filters: filterLists,
                data: track,
                title: tit
            }, function (result) {
                $('.fb_dialog_iframe').each(function () {
                    $(this).remove();
                });

                sessionStorage.setItem("caap_giftResult", JSON.stringify(result));
                if (result && result.request_ids) {
                    var request_id_string = String(result.request_ids),
                        request_id_array = request_id_string.split(';'),
                        request_id_count = request_id_array.length,
                        params = 'ajax=1&signed_request=SIGNED_REQUEST';

                    $.ajax({
                        url: 'request_handler.php?' + request_params + '&request_ids=' + result.request_ids,
                        context: document.body,
                        data: params,
                        type: 'POST',
                        success: function () {
                            document.getElementById('results_container').innerHTML = request_id_count + (request_id_count === 1 ? ' request' : ' requests') + ' sent! By CAAP';
                            FB.XFBML.parse(document.getElementById('results_container'));
                            $('#results_container').show();
                        }
                    });
                }
            });
        });
    }).toString();
    */

    caap.getSigned = function () {
        try {
            var params = $u.setContent($j('script').text(), '').regex(new RegExp("params \\+= '&signed_request=(.*)'", 'gmi'));

            if ($u.hasContent(params)) {
                params = $u.isArray(params) ? params[0] : params;
                session.setItem("signedRequest", params);
                con.log(2, "Ajax signed request available");
                // disabled this because it causes gifts to be already collected.
                //caap.showRequestForm = "showRequestForm = " + caap.showRequestForm.replace(/SIGNED_REQUEST/gm, params);
                //$u.injectScript(caap.showRequestForm, true);
            } else {
                con.warn("caap.signedRequest is empty");
            }

            return true;
        } catch (err) {
            con.error("ERROR in getSigned: " + err.stack);
            return false;
        }
    };

    caap.mainCaapLoop = function () {
        caap.makeActionsList();
        caap.waitMilliSecs = 8000;
        caap.waitMainLoop();
        caap.reloadOccasionally();
    };

    caap.getMsgItem = function (msg) {
        try {
            var done = true,
                it;

            caap.addToDataRegister();
			caap.dataRegister[msg.data.name].set(msg.data.value);
            caap.dataRegister[msg.data.name].loaded = true;
            for (it in caap.dataRegister) {
                if (caap.dataRegister.hasOwnProperty(it)) {
                    if (!done) {
                        break;
                    }

                    if (!caap.dataRegister[it].loaded) {
                        done = false;
                    }
                }
            }

            if (done) {
				// Re initialize, since some values get lost in iFrame
				worker.list.forEach( function(i) {
					if ($u.isFunction(window[i].init)) {
						window[i].init();
					}
				});
                con.log_level = config.getItem('DebugLevel', 1);
                con.log(1, "iframe all data loaded");
                caap.messaging.dataRegisterLoaded = true;
                ss = new $u.StorageHelper({
                    'namespace': caap.namespace,
                    'storage_id': stats.FBID.toString(),
                    'storage_type': 'sessionStorage'
                });

                window.setTimeout(caap.initial, 200);
                caap.mainCaapLoop();
            }

            return true;
        } catch (err) {
            con.error("ERROR in getMsgItem: " + err.stack);
            return false;
        }
    };

    caap.setCheckedIds = function (msg) {
        try {
            con.log(2, "setCheckedIds received", msg.data);
            var results = {
                    'notChecked': [],
                    'areChecked': [],
                    'notFound': [],
                    'areFound': []
                },
                doChecks = function () {
                    var input,
                        checkState,
                        it = 0,
                        len = msg.data.length;

                    for (it = 0; it < len; it += 1) {
                        checkState = false;
                        input = $j("input[value='" + msg.data[it] + "']");
                        if ($u.hasContent(input)) {
                            caap.click(input);
                            results.areFound.push(msg.data[it]);
                            checkState = input.is(":checked");
                            if (checkState) {
                                results.areChecked.push(msg.data[it]);
                            } else {
                                results.notChecked.push(msg.data[it]);
                            }
                        } else {
                            results.notFound.push(msg.data[it]);
                        }
                    }

                    input = $u.hasContent(results.areChecked) ? $j("input[name='ok_clicked']") : $j("input[name='cancel_clicked']");
                    if (input) {
                        //caap.messaging.sentGifts(msg, results);
                        caap.click(input);
                    }
                };

            window.setTimeout(function () {
                var objDiv = $j('.fbProfileBrowserListContainer').parent(),
                    domDiv = objDiv.get(1),
                    to;

                objDiv.on("DOMNodeInserted", function () {
                    con.log(3, "Scroll ...");
                    window.clearTimeout(to);
                    domDiv.scrollTop = domDiv.scrollHeight;
                    to = window.setTimeout(doChecks, 5000);
                });

                if (domDiv) {
                    domDiv.scrollTop = domDiv.scrollHeight;
                }

                to = window.setTimeout(doChecks, 5000);
            }, 5000);

            return true;
        } catch (err) {
            con.error("ERROR in setCheckedIds: " + err.stack);
            return false;
        }
    };

    caap.initDb = function (FBID) {
        if (caap.domain.which === 3 || caap.domain.which === 4) {
            window.config = new $u.VarsHelper();
            config.oldSetItem = config.setItem;
            config.setItem = function (name, value) {
                config.oldSetItem(name, value);
                caap.messaging.setItem('config.options', config.getAll());
                return config.getItem(name, value);
            };

            window.state = new $u.VarsHelper();
            state.oldSetItem = state.setItem;
            state.setItem = function (name, value) {
                state.oldSetItem(name, value);
                caap.messaging.setItem('state.flags', state.getAll());
                return state.getItem(name, value);
            };

            window.schedule = new $u.ScheduleVarsHelper();
            schedule.oldSetItem = schedule.setItem;
            schedule.setItem = function (name, seconds, randomSecs) {
                schedule.oldSetItem(name, seconds, randomSecs);
                caap.messaging.setItem('schedule.timers', schedule.getAll());
                return schedule.getItem(name);
            };
        } else {
            window.db = new $u.IDBHelperAsync();
            if (db && db.available) {
                //db.onsuccess = function () {con.log(1, "db", db)};
                db.open(caap.namespace + "." + FBID, "CAAP Database", "1");
            }

            //con.log(1, "$u", $u);
            window.gm = new $u.StorageHelper({
                'namespace': caap.namespace,
                'storage_id': FBID.toString(),
                'storage_type': 'localStorage'
            });

            //con.log(1, "gm", gm);
            window.ss = new $u.StorageHelper({
                'namespace': caap.namespace,
                'storage_id': FBID.toString(),
                'storage_type': 'sessionStorage'
            });

            //con.log(1, "ss", ss);
            //gm.clear('0');
            window.config = new $u.ConfigHelper("config.options", "current", {
                'namespace': caap.namespace,
                'storage_id': FBID.toString(),
                'storage_type': 'localStorage'
            });

            window.configOld = new $u.ConfigHelper("config.options", "current", {
                'namespace': caap.namespace,
                'storage_id': '0',
                'storage_type': 'localStorage'
            });
			
            window.configDefault = new $u.ConfigHelper("config.options", "current", {
                'namespace': caap.namespace,
                'storage_id': 'd',
                'storage_type': 'localStorage'
            });
			
			config.getItem = function (name, value) {
				if (!$u.isString(name) || !$u.hasContent(name)) {
					throwError("config.getItem", new TypeError(name + " is an invalid identifier"));
				}
				return configDefault.getItem(name, $u.isDefined(this.vars[name]) ? this.vars[name] : configOld.getItem(name, value));

			};

			config.setItem = function (name, value) {
				if (name === this.keyName) {
					throwError("config.setItem", new TypeError(name + " is a reserved identifier"));
				}

				if (!$u.isDefined(value)) {
					throwError("config.setItem", new TypeError(value + " is 'undefined' or 'null'"));
				}

				if (configDefault.getItem(name) !== undefined) {
					con.log(1, 'Setting default value for all hyper accounts for ' + name + ' to ' + value);
					return configDefault.setItem(name, value);
				}
				
				if (!$u.compare($u.ConfigHelper.base.getItem.call(this, name), value)) {
					$u.ConfigHelper.base.setItem.call(this, name, value);
					this.save();
				}

				return value;
			};

            window.state = new $u.ConfigHelper("state.flags", "current", {
                'namespace': caap.namespace,
                'storage_id': FBID.toString(),
                'storage_type': 'localStorage'
            });

            window.stateOld = new $u.ConfigHelper("state.flags", "current", {
                'namespace': caap.namespace,
                'storage_id': '0',
                'storage_type': 'localStorage'
            });

			state.getItem = function (name, value) {
				if (!$u.isString(name) || !$u.hasContent(name)) {
					throwError("state.setItem", new TypeError(name + " is an invalid identifier"));
				}

				return $u.isDefined(this.vars[name]) ? this.vars[name] : stateOld.getItem(name, value);
			};

            if (caap.domain.which === 0) {
                state.oldSave = state.save;
                state.save = function () {
                    state.oldSave();
                    con.log(3, "state.save", state);
                    if (caap.messaging.connected.hasIndexOf("caapif")) {
                        con.log(3, "state.save send");
                        caap.messaging.setItem('state.flags', state.getAll());
                    }
                };
            }

            window.schedule = new $u.ScheduleStorageHelper("schedule.timers", "current", {
                'namespace': caap.namespace,
                'storage_id': FBID.toString(),
                'storage_type': 'localStorage'
            });

            if (caap.domain.which === 0) {
                schedule.oldSave = schedule.save;
                schedule.save = function () {
                    schedule.oldSave();
                    con.log(3, "schedule.save", schedule);
                    if (caap.messaging.connected.hasIndexOf("caapif")) {
                        con.log(3, "schedule.save send");
                        caap.messaging.setItem('schedule.timers', schedule.getAll());
                    }
                };
            }
			if (caap.domain.which == 2) {
				window.hyper = new $u.StorageHelper({
					'namespace': caap.namespace,
					'storage_id': 'hyper',
					'storage_type': 'localStorage'
				});
			}

			if (typeof hyper !== 'undefined' && $u.isArray(hyper.getItem('logons', false)) && hyper.getItem('logons', false).length > 1) {
				caap.hyper = true;
				schedule.setItem("hyperTimer", 0);
				con.log(1, 'Multiple accounts configured, so enabling hyper visor functions!', caap.hyper);
			}
			
            if (caap.domain.which === 0) {
                config.oldSave = config.save;
                config.save = function () {
                    config.oldSave();
                    con.log(3, "config.save", config);
                    if (caap.messaging.connected.hasIndexOf("caapif")) {
                        con.log(3, "config.save send");
                        caap.messaging.setItem('config.options', config.getAll());
                    }
                };
            }
        }
    };

    caap.caapifpPMListener = function (e) {
        try {
            if (caap.domain.which === 4) {
                if (e.origin.hasIndexOf("web.castleagegame.com") || e.origin.hasIndexOf("apps.facebook.com")) {
                    var msg = JSON.parse(e.data);

                    con.log(3, "caapifp got message", msg, e.origin);
                    caap.mTarget[msg.source].url = e.origin;
                    caap.mTarget[msg.source].ref = e.source;
                    //caap.giftingHandler(msg);
                }
            }
        } catch (err) {
            con.error("ERROR in caapifpPMListener: " + err, e);
        }
    };

    caap.caapifpStartup = function () {
        try {
            if (caap.domain.which === 4) {
                if ($u.is_chrome) {
                    caap.port = chrome.extension.connect({
                        name: "caapifp"
                    });

                    //caap.port.onMessage.addListener(caap.giftingHandler);
                } else {
                    con.log(3, "caapifp add listeners");
                    caap.messaging.connected.push("caapifp");
                    caap.mTarget.caapif.ref = window.parent;
                    $u.addEvent(window, "message", caap.caapifpPMListener);
                    caap.jWindow.on("unload", caap.messaging.disconnect);
                }

                caap.messaging.connect();
            }
        } catch (err) {
            con.error("ERROR in caapifpStartup: " + err.stack);
        }
    };

    caap.caapifpShutdown = function () {
        try {
            if (caap.domain.which === 4) {
                if ($u.is_chrome) {
                    //caap.port.onMessage.removeListener(caap.giftingHandler);
                    caap.port = null;
                } else {
                    $u.removeEvent(window, "message", caap.caapifpPMListener);
                    caap.jWindow.off("unload", caap.messaging.disconnect);
                }
            }
        } catch (err) {
            con.error("ERROR in caapifpShutdown: " + err.stack);
        }
    };

    caap.iframeHandler = function (msg) {
        if ((msg.source === "caap" || msg.source === "caapfb" || msg.source === "caapifp") && msg.dest === "caapif") {
            var it;

            caap.addToDataRegister();
			switch (msg.message) {
                case "ok":
                    session.decItem("messageCount");

                    break;
                case "connect":
                    if (!caap.messaging.connected.hasIndexOf(msg.source)) {
                        caap.messaging.connected.push(msg.source);
                    }

                    caap.messaging.ok(msg);
                    con.log(3, "connect current connections", caap.messaging.connected);
                    caap.messaging.cntd(msg);
                    break;
                case "connected":
                    caap.messaging.connected = msg.data;
                    caap.messaging.ok(msg);
                    con.log(3, "current connections", caap.messaging.connected);
                    if (!caap.messaging.dataRegisterLoaded) {
                        caap.messaging.hello(msg);
                    }

                    break;
                case "disconnect":
                    caap.messaging.connected.removeByValue(msg.source);
                    con.log(2, "current connections", caap.messaging.connected, msg.source);

                    break;
                case "broadcast":
                    if (msg.source === ($u.is_chrome ? "caap" : "caapif") && msg.data.name === "connected") {
                        caap.messaging.connected = msg.data.value;
                        caap.messaging.ok(msg);
                        con.log(3, "broadcast connected received", caap.messaging.connected);
                        if (!caap.messaging.dataRegisterLoaded) {
                            caap.messaging.hello(msg);
                        }
                    }

                    break;
                case "hello":
                    caap.messaging.ok(msg);
                    for (it in caap.dataRegister) {
                        if (caap.dataRegister.hasOwnProperty(it)) {
                            caap.messaging.getItem(msg, it);
                        }
                    }

                    break;
                case "getItem":
                    caap.messaging.ok(msg);
                    caap.getMsgItem(msg);

                    break;
                case "setItem":
                    caap.messaging.ok(msg);
                    //con.log(1, "iframe got setItem", msg);
                    caap.dataRegister[msg.data.name].set(msg.data.value);
                    caap.dataRegister[msg.data.name].loaded = true;

                    break;
                case "pauseListener":
                    caap.messaging.ok(msg);
                    caap.pauseListener();

                    break;
                case "restartListener":
                    caap.messaging.ok(msg);
                    caap.restartListener();

                    break;
                case "styleChange":
                    caap.messaging.ok(msg);
                    con.log(4, "iframe got styleChange", msg);
                    caap.colorUpdate();

                    break;
                case "backgroundCA":
                    caap.messaging.ok(msg);
                    con.log(4, "iframe got backgroundCA", msg);
                    $j("body").css({
                        'background-color': msg.data
                    });

                    break;
                case "goblinHinting":
                    caap.messaging.ok(msg);
                    con.log(1, "iframe got goblinHinting", msg);
                    spreadsheet.clear();
                    spreadsheet.load();

                    break;
                default:
					break;
            }

            con.log(4, "caap.messageCount", session.getItem("messageCount"));
        }
    };

    caap.caapifPMListener = function (e) {
        try {
            if (caap.domain.which === 3) {
                if (e.origin.hasIndexOf("apps.facebook.com") || e.origin.hasIndexOf("www.facebook.com")) {
                    var msg = JSON.parse(e.data);

                    con.log(3, "caapif got message", msg, e.origin);
                    caap.mTarget[msg.source].url = e.origin;
                    caap.mTarget[msg.source].ref = e.source;
                    caap.iframeHandler(msg, e);
                }
            }
        } catch (err) {
            con.error("ERROR in caapifPMListener: " + err, e);
        }
    };

    caap.caapifStartup = function () {
        try {
            if (caap.domain.which === 3) {
                if ($u.is_chrome) {
                    caap.port = chrome.extension.connect({
                        name: "caapif"
                    });

                    caap.port.onMessage.addListener(caap.iframeHandler);
                } else {
                    caap.messaging.connected.push("caapif");
                    caap.jWindow.on("message", caap.caapifPMListener);
                    $u.addEvent(window, "message", caap.caapifPMListener);
                    caap.jWindow.on("unload", caap.messaging.disconnect);
                    caap.mTarget.caapfb.ref = window.parent;
                }

                caap.messaging.connect();
            }
        } catch (err) {
            con.error("ERROR in caapifStartup: " + err.stack);
        }
    };

    caap.caapifShutdown = function () {
        try {
            if (caap.domain.which === 3) {
                if ($u.is_chrome) {
                    caap.port.onMessage.removeListener(caap.iframeHandler);
                    caap.port = null;
                } else {
                    caap.jWindow.off("message", caap.caapifPMListener);
                    $u.removeEvent(window, "message", caap.caapifPMListener);
                    caap.jWindow.off("unload", caap.messaging.disconnect);
                }
            }
        } catch (err) {
            con.error("ERROR in caapifShutdown: " + err.stack);
        }
    };

    caap.chromeHandler = function (msg) {
        if ((msg.source === "caap" || msg.source === "caapif" || msg.source === "caapifp") && msg.dest === "caapfb") {
            caap.addToDataRegister();
			switch (msg.message) {
                case "ok":
                    session.decItem("messageCount");

                    break;
                case "connect":
                    if (!caap.messaging.connected.hasIndexOf(msg.source)) {
                        caap.messaging.connected.push(msg.source);
                    }

                    caap.messaging.ok(msg);
                    con.log(3, "connect current connections", caap.messaging.connected);
                    caap.messaging.cntd(msg);

                    break;
                case "connected":
                    caap.messaging.connected = msg.data;
                    caap.messaging.ok(msg);
                    con.log(3, "current connections", caap.messaging.connected);

                    break;
                case "disconnect":
                    caap.messaging.connected.removeByValue(msg.source);
                    con.log(2, "current connections", caap.messaging.connected, msg.source);

                    break;
                case "broadcast":
                    if (msg.source === "caap" && msg.data.name === "connected") {
                        caap.messaging.connected = msg.data.value;
                        caap.messaging.ok(msg);
                        con.log(3, "broadcast connected received", caap.messaging.connected);
                    }

                    break;
                case "hello":
                    caap.messaging.ok(msg);
                    caap.messaging.hello(msg);

                    break;
                case "getItem":
                    caap.messaging.ok(msg);
                    caap.messaging.getItem(msg, {
                        name: msg.data,
                        value: caap.dataRegister[msg.data].get()
                    });

                    break;
                case "setItem":
                    caap.messaging.ok(msg);
                    caap.dataRegister[msg.data.name].set(msg.data.value);
                    if ($u.isFunction(caap.dataRegister[msg.data.name].save)) {
                        caap.dataRegister[msg.data.name].save(msg.source);
                    } else {
                        con.log(4, "no save function", msg.data.name);
                    }

                    break;
                case "visitUrl":
                    caap.messaging.ok(msg);
                    caap.visitUrl(msg.data);

                    break;
                case "setDivContent":
                    caap.messaging.ok(msg);
                    caap.setDivContent(msg.data.name, msg.data.value, caap.caapDivObject, msg.data.hide);

                    break;
                case "changeDropDownList":
                    caap.messaging.ok(msg);
                    con.log(4, "changeDropDownList", msg);
                    caap.changeDropDownList(msg.data.idName, msg.data.dropList, msg.data.option);

                    break;
                case "selectDropOption":
                    caap.messaging.ok(msg);
                    con.log(4, "selectDropOption", msg);
                    caap.selectDropOption(msg.data.idName, msg.data.value);

                    break;
                case "scrollToTop":
                    caap.messaging.ok(msg);
                    con.log(4, "scrollToTop", msg);
                    caap.scrollToTop(msg.data);

                    break;
                default:
					break;
            }

            con.log(4, "caap.messageCount", session.getItem("messageCount"));
        }
    };

    caap.caapfbPMListener = function (e) {
        try {
            if (caap.domain.which === 0) {
                if (e.origin.hasIndexOf("web.castleagegame.com")) {
                    var msg = JSON.parse(e.data);

                    con.log(3, "caapfb got message", msg, e.origin);
                    caap.mTarget[msg.source].url = e.origin;
                    caap.mTarget[msg.source].ref = e.source;
                    caap.chromeHandler(msg, e);
                }
            }
        } catch (err) {
            con.error("ERROR in caapfbPMListener: " + err.stack);
        }
    };

    caap.caapfbStartup = function () {
        try {
            if (caap.domain.which === 0) {
                if ($u.is_chrome) {
                    caap.port = chrome.extension.connect({
                        name: "caapfb"
                    });
                    caap.port.onMessage.addListener(caap.chromeHandler);
                    caap.messaging.connect();
                } else {
                    caap.messaging.connected.push("caapfb");
                    $j(window).on("message", caap.caapfbPMListener);
                    $u.addEvent(window, "message", caap.caapfbPMListener);
                }
            }
        } catch (err) {
            con.error("ERROR in caapfbStartup: " + err.stack);
        }
    };

    caap.caapfbShutdown = function () {
        try {
            if (caap.domain.which === 0) {
                if ($u.is_chrome) {
                    caap.port.onMessage.removeListener(caap.chromeHandler);
                    caap.port = null;
                } else {
                    $j(window).off("message", caap.caapfbPMListener);
                    $u.removeEvent(window, "message", caap.caapfbPMListener);
                }
            }
        } catch (err) {
            con.error("ERROR in caapfbShutdown: " + err.stack);
        }
    };

    caap.fbData = null;

    caap.fbEnv = null;

    caap.lsUsed = function () {
        try {
            var used = {
                    'type': '',
                    'match': 0,
                    'total': 0
                },
                perc = {
                    caap: 0,
                    total: 0
                }, msg = '';

            used = gm.used();
            if (used.type !== "greaseMonkey") {
                perc.caap = ((used.match * 2.048 / 5242880) * 100).dp();
                con.log(1, "CAAP localStorage used: " + perc.caap + "%");
                perc.total = ((used.total * 2.048 / 5242880) * 100).dp();
                if (perc.total >= 90) {
                    con.warn("Total localStorage used: " + perc.total + "%");
                    msg = "<div style='text-align: center;'>";
                    msg += "<span style='color: red; font-size: 14px; font-weight: bold;'>WARNING!</span><br />";
                    msg += "localStorage usage for domain: " + perc.total + "%<br />";
                    msg += "CAAP is using: " + perc.total + "%";
                    msg += "</div>";
                    window.setTimeout(function () {
                        $j().alert(msg);
                    }, 5000);
                } else {
                    con.log(1, "Total localStorage used: " + perc.total + "%");
                }
            } else {
                con.log(1, "CAAP GM storage used (chars): " + used.match);
                con.log(1, "GM storage used (chars): " + used.total);
            }

            return true;
        } catch (err) {
            con.error("ERROR in release lsUsed: " + err.stack);
            return false;
        }
    };

    caap.incrementPageLoadCounter = function () {
        try {
            return session.incItem("pageLoadCounter");
        } catch (err) {
            con.error("ERROR in incrementPageLoadCounter: " + err.stack);
            return undefined;
        }
    };

    caap.initial = function () {
        function chatListener(event) {
            if (event.target.className === "fbDockWrapper fixed_always fbDockWrapperRight") {
                event.target.style.display = "none";
                $j("#pagelet_dock").off("DOMNodeInserted", chatListener);
            }
        }
        try {
            var shiftDown, tDiv;

            if (caap.domain.which === 0) {
                $j('div.fixedAux').hide();
            }

            if (caap.domain.which === 2 || caap.domain.which === 3) {
                caap.ajaxLoadIcon = $j('#AjaxLoadIcon');
            }

            if (caap.domain.which === 3 && config.getItem('backgroundCA', false)) {
                $j("body").css({
                    'background-image': "",
                    'background-position': 'center top',
                    'background-repeat': 'no-repeat',
                    'background-color': 'black',
                    'margin': '0px',
                    'overflow': 'hidden'
                });
            }

            if (caap.domain.which === 3 && config.getItem('backgroundCA', false)) {
                $j("body").css({
                    'background-color': 'black'
                });
            }

            if (caap.domain.which === 0 && config.getItem('backgroundCA', false)) {
                $j("body").css({
                    'background-color': 'black'
                });

                $j("#mainContainer").css({
                    'border-color': 'black'
                });

                $j("#contentArea").css({
                    'border-color': 'black'
                });

                $j("#contentCol").css({
                    'background-color': 'black',
                    'border-color': 'black'
                });

                $j("#leftColContainer,#pagelet_canvas_footer_content,#bottomContent").hide();

                $j("#contentCol").removeClass("clearfix");
            }

            if (caap.domain.which === 0 || caap.domain.which === 2) {
                caap.controlXY.selector = caap.domain.which === 0 ? "#contentArea" : "#globalcss";
            }

            if (caap.domain.which === 2 || caap.domain.which === 3) {
                caap.dashboardXY.selector = "#app_body_container";
            }

            if (caap.domain.which === 0) {
                caap.pageletPresenceDiv = $j("#pagelet_dock");
                $j('#rightCol').children().hide();
                if (config.getItem('HideFBChat', false)) {
                    tDiv = $j("#pagelet_dock div[class='fbDockWrapper fixed_always fbDockWrapperRight']");
                    if ($u.hasContent(tDiv)) {
                        tDiv.hide();
                    } else {
                        $j("#pagelet_dock").on("DOMNodeInserted", chatListener);
                    }
                }
            }

            // Can create a blank space above the game to host the dashboard if wanted.
            // Dashboard currently uses '185px'
            if (caap.domain.which === 2) {
                shiftDown = gm ? gm.getItem('ShiftDown', '', hiddenVar) : '';
                if ($u.hasContent(shiftDown)) {
                    $j(caap.controlXY.selector).css('padding-top', shiftDown);
                }
            }

            if (caap.domain.which === 0 || caap.domain.which === 2) {
				worker.recordsList.forEach( function(r) {
					window[r].load();
				});
				conquestLands.load();

				worker.list.forEach( function(i) {
					if ($u.isFunction(window[i].init)) {
						window[i].init();
					}
				});

                caap.loadDemi();
                caap.addControl();
                caap.addPlayButton();
            }

            if (caap.domain.which === 0 || caap.domain.which === 2 || caap.domain.which === 3) {
                spreadsheet.load();
            }

            if (caap.domain.which === 2 || caap.domain.which === 3) {
                caap.addDashboard();
                caap.addDashboardMin();
            }

            caap.addListeners();

            if (caap.domain.which === 2 || caap.domain.which === 3) {
                caap.addDBListener();
                caap.checkResultsTop();
                statsFunc.check();
                caap.bestLand = new caap.landRecord().data;
                caap.sellLand = {};
                offline.bga.sort($u.sortBy(false, 'n'));
            }

            if (caap.domain.which === 3 && state.getItem('caapPause', 'none') === 'block') {
                caap.pauseListener();
            }

            return true;
        } catch (err) {
            con.error("ERROR in caap.initial: " + err.stack);
            return false;
        }
    };

    caap.oneMinuteUpdate = function (funcName, reset) {
        try {
            if (!$u.isString(funcName) || funcName === '') {
                throw "Invalid identifying name!";
            }

            if (!reset && !state.getItem('reset' + funcName) && !schedule.check(funcName + 'Timer')) {
                return false;
            }

            schedule.setItem(funcName + 'Timer', 60);
            state.setItem('reset' + funcName, false);
            return true;
        } catch (err) {
            con.error("ERROR in oneMinuteUpdate: " + err.stack);
            return undefined;
        }
    };

    caap.bulkRegex = function (div, regex, record, array, silent) {
        try {
            var text = ($u.isString(div) ? div : $u.isObject(div) && $u.hasContent(div.textContent) ?
					div.textContent : $u.setContent(div.text(), '')).trim().innerTrim(),
				args = text.regex(regex);
			
			if (typeof record == 'undefined' && typeof array == 'undefined') {
				return args;
			}
			args = $u.isDefined(args) &&  !$u.isArray(args) ? [args] : args;
			array = $u.isArray(array) ? array : [array];
			if (!args) {
				if (!silent) {
					con.warn('Bulk Regex: No match for regex expression in div text', text, regex, args, array);
				}
				return false;
			}
			
			if (args.length != array.length) {
				if (!silent) {
					con.warn('Bulk Regex: ' + args.length + ' args in regex, but only ' + array.length + ' vars listed',
						text, regex, args, array);
				}
				return false;
			}
			
			array.forEach( function(entry, index) {
				if (entry.match(/\./)) {
					record[entry.split('.')[0]][entry.split('.')[1]] = args[index];
				} else {
					record[entry] = args[index];
				}
			});
			return true;
        } catch (err) {
            con.error("ERROR in bulkRegex: " + err + ' ' + err.stack);
            return undefined;
        }
    };
	
    caap.minMaxArray = function (array, minMax, lowerBound, upperBound) {
        try {
			var result;
            if (!$u.isArray(array)) {
                throw "caap.minMaxArray: Invalid array";
            }
            if (minMax != 'min' && minMax != 'max') {
                throw "caap.minMaxArray: minMax neither 'min' nor 'max'";
            }

			array = array.filter(function(value) {
				return ($u.isNumber(lowerBound) ? value > lowerBound : true) && ($u.isNumber(upperBound) ? value < upperBound : true);
			});
			result = Math[minMax].apply(null, array);

            return result == Number.POSITIVE_INFINITY || result == Number.NEGATIVE_INFINITY ? undefined : result;
        } catch (err) {
            con.error("ERROR in minMaxArray: " + err + ' ' + err.stack);
            return undefined;
        }
    };
	
    caap.timeStr = function (Short) {
        return config.getItem("use24hr", true) ? (Short ? "D H:i" : "D d M H:i") : (Short ? "D g:i A" : "D d M g:i A");
    };

    caap.displayTime = function (name) {
        try {
            if (!$u.isString(name) || name === '') {
                throw "Invalid identifying name!";
            }

            var timer = schedule.getItem(name);

            return $u.makeTime(($u.isPlainObject(timer) ? timer.next : new Date()), caap.timeStr(true));
        } catch (err) {
            con.error("ERROR in displayTime: " + err.stack);
            return false;
        }
    };

    caap.landQuestList = [
        'Land of Fire',
        'Land of Earth',
        'Land of Mist',
        'Land of Water',
        'Demon Realm',
        'Undead Realm',
        'Underworld',
        'Kingdom of Heaven',
        'Ivory City',
        'Earth II',
        'Water II',
        'Mist II',
        'Mist III',
        'Fire II',
        'Pangaea',
        'Perdition',
        'Land of Fire III',
        'Land of Earth III',
        'Land of Mist IV',
        'Land of Water III',
        'Undead II',
        'Outer Realms'
    ];

    caap.demiQuestList = ['Ambrosia', 'Malekus', 'Corvintheus', 'Aurora', 'Azeron'];

    caap.atlantisQuestList = ['Atlantis', 'Atlantis II', 'Atlantis III'];

    caap.selectDropOption = function (idName, value) {
        try {
            if (caap.domain.which === 3) {
                caap.messaging.selectDropOption(idName, value);
            } else {
                var drop = $j("#caap_" + idName, caap.caapDivObject);

                $j("option", drop).removeAttr('selected');
                drop.val(value);
            }

            return true;
        } catch (err) {
            con.error("ERROR in selectDropOption: " + err.stack);
            return false;
        }
    };

    caap.newAutoQuest = function () {
        return JSON.copy({
            'name': '',
            'energy': 0,
            'general': 'none',
            'experience': 0
        });
    };

    caap.updateAutoQuest = function (id, value) {
        try {
            if (!$u.isString(id) || !$u.hasContent(id)) {
                throw "No valid id supplied!";
            }

            if (!$u.hasContent(value)) {
                throw "No value supplied!";
            }

            var temp = state.getItem('AutoQuest', caap.newAutoQuest());

            temp[id] = value;
            state.setItem('AutoQuest', temp);
            return true;
        } catch (err) {
            con.error("ERROR in updateAutoQuest: " + err.stack);
            return false;
        }
    };

    caap.showAutoQuest = function () {
        try {
            caap.setDivContent("stopAutoQuest", "Stop auto quest: " + state.getItem('AutoQuest', caap.newAutoQuest()).name + " (energy: " + state.getItem('AutoQuest', caap.newAutoQuest()).energy + ")", caap.caapDivObject, false);
            return true;
        } catch (err) {
            con.error("ERROR in showAutoQuest: " + err.stack);
            return false;
        }
    };

    caap.clearAutoQuest = function () {
        try {
            caap.setDivContent("stopAutoQuest", "", caap.caapDivObject, true);
            return true;
        } catch (err) {
            con.error("ERROR in clearAutoQuest: " + err.stack);
            return false;
        }
    };

    caap.manualAutoQuest = function (AutoQuest) {
        try {
            state.setItem('AutoQuest', $u.setContent(AutoQuest, caap.newAutoQuest()));
            caap.selectDropOption('WhyQuest', config.setItem('WhyQuest', 'Manual'));
            caap.clearAutoQuest();
            return true;
        } catch (err) {
            con.error("ERROR in manualAutoQuest: " + err.stack);
            return false;
        }
    };

    caap.changeDropDownList = function (idName, dropList, option) {
        try {
            if (caap.domain.which === 3) {
                caap.messaging.changeDropDownList(idName, dropList, option);
            } else {
                $j("#caap_" + idName + " option", caap.caapDivObject).remove();
                $j("#caap_" + idName, caap.caapDivObject).append("<option disabled='disabled' value='not selected'>Choose one</option>");
                var item = 0,
                    len = dropList.length,
                    drop = $j("#caap_" + idName, caap.caapDivObject);

                for (item = 0; item < len; item += 1) {
                    if (item === 0 && !option) {
                        config.setItem(idName, dropList[item]);
                        con.log(1, "Saved: " + idName + "  Value: " + dropList[item]);
                    }

                    $j("#caap_" + idName, caap.caapDivObject).append("<option value='" + dropList[item].escapeHTML() + "'>" + dropList[item].escapeHTML() + "</option>");
                }

                if (option) {
                    drop.val(option.escapeHTML());
                } else {
                    drop.val($j("option:eq(1)", drop).val());
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in changeDropDownList: " + err.stack);
            return false;
        }
    };

    caap.controlXY = {
        selector: '',
        x: 0,
        y: 0
    };

    caap.getControlXY = function (reset) {
        try {
            var selector = $j(caap.controlXY.selector),
                outer = selector.outerWidth(true),
                xoff = (caap.domain.which === 2 || (caap.domain.which === 0 && !config.getItem('backgroundCA', false))) ? outer + 10 : outer;

            return {
                y: reset ? selector.offset().top : caap.controlXY.y,
                x: caap.controlXY.x === '' || reset ? selector.offset().left + xoff : selector.offset().left + caap.controlXY.x
            };
        } catch (err) {
            con.error("ERROR in getControlXY: " + err.stack);
            return {
                x: 0,
                y: 0
            };
        }
    };

    caap.saveControlXY = function () {
        try {
            state.setItem('caap_div_menuTop', caap.caapDivObject.offset().top);
            state.setItem('caap_div_menuLeft', caap.caapDivObject.offset().left - $j(caap.controlXY.selector).offset().left);
            state.setItem('caap_top_zIndex', '1');
            state.setItem('caap_div_zIndex', '2');
        } catch (err) {
            con.error("ERROR in saveControlXY: " + err.stack);
        }
    };

    caap.dashboardXY = {
        selector: '',
        x: 0,
        y: 0
    };

    caap.getDashboardXY = function (reset) {
        try {
            var selector = $j(caap.dashboardXY.selector);

            return {
                y: reset ? selector.offset().top : caap.dashboardXY.y,
                x: caap.dashboardXY.x === '' || reset ? selector.offset().left : selector.offset().left + caap.dashboardXY.x
            };
        } catch (err) {
            con.error("ERROR in getDashboardXY: " + err.stack);
            return {
                x: 0,
                y: 0
            };
        }
    };

    caap.saveDashboardXY = function () {
        try {
            state.setItem('caap_top_menuTop', caap.caapTopObject.offset().top);
            state.setItem('caap_top_menuLeft', caap.caapTopObject.offset().left - $j(caap.dashboardXY.selector).offset().left);
            state.setItem('caap_div_zIndex', '1');
            state.setItem('caap_top_zIndex', '2');
            caap.dashboardXY.x = state.getItem('caap_top_menuLeft', '');
            caap.dashboardXY.y = state.getItem('caap_top_menuTop', $j(caap.dashboardXY.selector).offset().top);
        } catch (err) {
            con.error("ERROR in saveDashboardXY: " + err.stack);
        }
    };

    caap.messDivs = {
        'banner': "",
        'activity_mess': "",
        'idle_mess': "",
        'quest_mess': "",
        'battle_mess': "",
        'conquest_mess': "",
        'monster_mess': "",
        'gb10_mess': "",
        'gb100_mess': "",
        'gbClassic_mess': "",
        'guild_monster_mess': "",
        'fortify_mess': "",
        'heal_mess': "",
        'demipoint_mess': "",
        'gift_mess': "",
        'army_mess': "",
        'feats_mess': "",
        'kobo_mess': "",
        'essence_mess': "",
        'level_mess': "",
        'exp_mess': "",
        'debug1_mess': "",
        'debug2_mess': "",
        'control': "",
        'donate': ""
    };

    caap.moveMenu = function () {
        caap.caapDivObject.css({
            top: config.getItem("udOffset", 0) + 'px',
            left: config.getItem("lrOffset", 0) + 'px'
        });
    };

    caap.addControl = function (reload) {
        try {
            var caapDiv = "<div id='caap_div'>",
                divID,
                //len = 0,
                styleXY = {
                    x: 0,
                    y: 0
                },
                bgc = state.getItem('StyleBackgroundLight', '#E0C691'),
                htmlCode = '',
                banner = '',
                donate = '';

            for (divID in caap.messDivs) {
                if (caap.messDivs.hasOwnProperty(divID)) {
                    caapDiv += "<div class='caap_ww' id='caap_" + divID + "'></div>";
                }
            }

            caapDiv += "</div>";
            caap.controlXY.x = state.getItem('caap_div_menuLeft', '');
            caap.controlXY.y = state.getItem('caap_div_menuTop', $j(caap.controlXY.selector).offset().top);
            // yinzanat - added this to change the position of the menu because chrome messed it up.
/*  yinzanat - 07/18/2014 - don't need this since we can just bind the menu to the facebook ads bar
            caap.controlXY.x = parseInt (config.getItem("lrOffset", 0), 10);
            caap.controlXY.y = parseInt(config.getItem("udOffset", 0));
            styleXY = caap.getControlXY();
*/
            caapDiv = $j(caapDiv);
            if (caap.domain.which != 2) {
            caapDiv.css({
                width: '235px',
                background: bgc,
                opacity: state.getItem('StyleOpacityLight', 1),
                color: $u.bestTextColor(bgc),
                padding: "20px",
                border: "2px solid #444",
                float: 'right',
                zIndex: state.getItem('caap_div_zIndex', '2')
            });
            } else {
                caapDiv.css({
                    width: '180px',
                    background: bgc,
                    opacity: state.getItem('StyleOpacityLight', 1),
                    color: $u.bestTextColor(bgc),
                    padding: "4px",
                    border: "2px solid #444",
                    top: styleXY.y + 'px',
                    left: styleXY.x + 'px',
                    zIndex: state.getItem('caap_div_zIndex', '2'),
                    position: 'absolute'
                });
            }

            if (devVersion === '0') {
                htmlCode += caap.makeTD("Version: " + caapVersion + " - <a href='http://caaplayer.freeforums.org/' target='_blank'>CAAP Forum</a>");
                if (caap.newVersionAvailable) {
                    htmlCode += caap.makeTD("<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + "!</a>");
                }
            } else {
                htmlCode += caap.makeTD("Version: " + caapVersion + " d" + devVersion + " - <a href='http://caaplayer.freeforums.org/' target='_blank'>CAAP Forum</a>");
            }

            if (caap.newVersionAvailable) {
                htmlCode += caap.makeTD("<a href='http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " +
                                        state.getItem('SUC_remote_version') + " d" + state.getItem('DEV_remote_version') + "!</a>");
            }

            caap.setDivContent('Version', htmlCode, caapDiv);

            banner += "<div id='caap_BannerDisplay_hide' style='display: " + (config.getItem('BannerDisplay', true) ? 'block' : 'none') + "'>";
            banner += "<img src='data:image/png;base64," + image64.header + "' alt='Castle Age Auto Player' /><br /><hr /></div>";
            caap.setDivContent('banner', banner, caapDiv);
            donate += "<div id='caap_DonateDisplay_hide' style='display: " + (config.getItem('DonateDisplay', true) ? 'block' : 'none') + "'><br /><hr />";
            donate += "<a href='https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=xotic750%40gmail%2ecom&item_name=Castle%20Age%20Auto%20Player&item_number=CAAP&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted'>";
            donate += "<img src='data:image/gif;base64," + image64.donate + "' alt='Donate' /></a></div>";
            caap.setDivContent('donate', donate, caapDiv);

            htmlCode += caap.addPauseMenu();
            htmlCode += caap.addDisableMenu();
            htmlCode += general.menu();
            htmlCode += caap.addQuestMenu();
            htmlCode += battle.menu();
            htmlCode += monster.menu();
            htmlCode += guild_monster.menu();
            htmlCode += feed.menu();
            htmlCode += gb.menu();
            htmlCode += conquest.menu();
            //htmlCode += arena.menu();
			if (config.getItem("When100v100", "Never") !== "Never") {
				config.setItem("When100v100", "Never");
			}

            htmlCode += caap.addCashHealthMenu();
            htmlCode += statsFunc.menu();
            htmlCode += chores.menu();
            htmlCode += essence.menu();
            htmlCode += army.menu();
            htmlCode += gift.menu();

            htmlCode += caap.addOtherOptionsMenu();
            //htmlCode += caap.addFooterMenu();
            caap.setDivContent('control', htmlCode, caapDiv);
            $j("input[type='button']", caapDiv).button();
            caap.makeSliderListener("CustStyleOpacityLight", 0.5, 1, 0.01, 1, true, caapDiv);
            caap.makeSliderListener("CustStyleOpacityDark", 0.5, 1, 0.01, 1, true, caapDiv);
            caap.makeSliderListener("scrollToPosition", 0, 1000, 10, 0, false, caapDiv);
            if (reload === true) {
                caap.caapDivObject.replaceWith(caapDiv);
                caap.caapDivObject = caapDiv;
                caap.pauseListener();
                caap.reBindCaapDiv();
            } else {
                 if (document.getElementById('rightCol')) {
                    caap.caapDivObject = caapDiv.appendTo(document.getElementById('rightCol'));
                 } else {
                    if (document.getElementById('body')) {
                        caap.caapDivObject = caapDiv.appendTo(document.getElementById('body'));
                    } else {
                        caap.caapDivObject = caapDiv.appendTo(document.body);
                    }
                }
            }

            caap.checkLastAction(state.getItem('LastAction', 'caap.idle'));
            return true;
        } catch (err) {
            con.error("ERROR in addControl: " + err.stack);
            return false;
        }
    };

    caap.ajax = function (page, params, cbError, cbSuccess) {
        try {
            if (caap.domain.which !== 2 && caap.domain.which !== 3) {
                throw "can not be called on this domain: " + caap.domain.which;
            }

            params = $u.hasContent(params) && $u.isPlainObject(params) && !$u.isEmptyObject(params) ? params : {};
            params.ajax = 1;

            var signedRequest = session.getItem("signedRequest");

            if ($u.hasContent(signedRequest) && $u.isString(signedRequest)) {
                params.signed_request = signedRequest;
            }

            if (!$u.hasContent(page) || !$u.isString(page)) {
                page = "index.php";
                params.adkx = 2;
            }

            if (!$u.hasContent(cbError) || !$u.isFunction(cbError)) {
                cbError = function (XMLHttpRequest, textStatus, errorThrown) {
                    con.error("ajax: ", [XMLHttpRequest, textStatus, errorThrown]);
                };
            }

            if (!$u.hasContent(cbSuccess) || !$u.isFunction(cbSuccess)) {
                cbSuccess = function (data, textStatus, XMLHttpRequest) {
                    con.log(2, "ajax:", [data, textStatus, XMLHttpRequest]);
                };
            }

            $j.ajax({
                url: page,
                type: 'POST',
                data: params,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    cbError(XMLHttpRequest, textStatus, errorThrown);
                },

                success: function (data, textStatus, XMLHttpRequest) {
                    data = "<div>" + data + "</div>";
                    con.log(2, "ajax", [data, textStatus, XMLHttpRequest]);
                    cbSuccess(data, textStatus, XMLHttpRequest);
                }
            });

            return true;
        } catch (err) {
            con.error("ERROR in ajax: " + err.stack);
            return false;
        }
    };

    caap.addPauseMenu = function () {
        try {
            return "<div id='caapPaused' style='font-weight: bold; display: " + state.getItem('caapPause', 'block') + "'>Paused on mouse click.<br /><a href='javascript:;' id='caapRestart' >Click here to restart</a></div><hr />";
        } catch (err) {
            con.error("ERROR in addPauseMenu: " + err.stack);
            return '';
        }
    };

    caap.addDisableMenu = function () {
        try {
            var autoRunInstructions = "Disable auto running of CAAP. Stays persistent even on page reload and the autoplayer will not autoplay.",
                htmlCode = '';

            htmlCode += caap.makeCheckTR("Disable Autoplayer", 'Disabled', false, autoRunInstructions);
            htmlCode += '<hr />';
            return htmlCode;
        } catch (err) {
            con.error("ERROR in addDisableMenu: " + err.stack);
            return '';
        }
    };

    caap.addCashHealthMenu = function () {
	
		// Should move these after working out worker.init functions
	
        try {
            var bankInstructions0 = "Minimum cash to keep in the bank. Press tab to save",
                bankInstructions1 = "Minimum cash to have on hand, press tab to save",
                bankInstructions2 = "Maximum cash to have on hand, bank anything above this, press tab to save (leave blank to disable).",
                healthInstructions = "Minimum health to have before healing, press tab to save (leave blank to disable).",
                healthStamInstructions = "Minimum Stamina to have before healing, press tab to save (leave blank to disable).",
                bankImmedInstructions = "Bank as soon as possible. May interrupt player and monster battles.",
                autobuyInstructions = "Automatically buy lands in groups of 10 based on best Return On Investment value.",
                autosellInstructions = "Automatically sell off any excess lands above your level allowance.",
                htmlCode = '';

            htmlCode = caap.startToggle('CashandHealth', 'CASH and HEALTH');
            htmlCode += caap.makeCheckTR("Bank Immediately", 'BankImmed', false, bankImmedInstructions);
            htmlCode += caap.makeCheckTR("Auto Buy Lands", 'autoBuyLand', false, autobuyInstructions);
            htmlCode += caap.makeCheckTR("Auto Sell Excess Lands", 'SellLands', false, autosellInstructions);
            htmlCode += caap.makeNumberFormTR("Keep In Bank", 'minInStore', bankInstructions0, 100000, '', '', false, false, 62);
            htmlCode += caap.makeNumberFormTR("Bank Above", 'MaxInCash', bankInstructions2, '', '', '', false, false, 40);
            htmlCode += caap.makeNumberFormTR("But Keep On Hand", 'MinInCash', bankInstructions1, '', '', '', true, false, 40);
            htmlCode += caap.makeNumberFormTR("Heal If Health Below", 'MinToHeal', healthInstructions, '', '', '');
            htmlCode += caap.makeNumberFormTR("Not If Stamina Below", 'MinStamToHeal', healthStamInstructions, '', '', '', true, false);
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in addCashHealthMenu: " + err.stack);
            return '';
        }
    };

    caap.addQuestMenu = function () {
        try {
            var XQuestInstructions = "Start questing when energy is at or above this value.",
                XMinQuestInstructions = "Stop quest when energy is at or below this value.",
                questForList = ['Advancement', 'Max Influence', 'Max Gold', 'Max Experience', 'Manual'],
                questForListInstructions = [
                    'Advancement performs all the main quests in a sub quest area but not the secondary quests.',
                    'Max Influence performs all the main and secondary quests in a sub quest area.',
                    'Max Gold performs the quest in the specific area that yields the highest gold.',
                    'Max Experience performs the quest in the specific area that yields the highest experience.',
                    'Manual performs the specific quest that you have chosen.'],
                questAreaList = ['Quest', 'Demi Quests', 'Atlantis'],
                questWhenList = ['Energy Available', 'At Max Energy', 'At X Energy', 'Not Fortifying', 'Not Covering My Damage', 'Never'],
                questWhenInst = [
                    'Energy Available - will quest whenever you have enough energy.',
                    'At Max Energy - will quest when energy is at max and will burn down all energy when able to level up.',
                    'At X Energy - allows you to set maximum and minimum energy values to start and stop questing. Will burn down all energy when able to level up.',
                    'Not Fortifying - will quest only when your fortify settings are matched.',
                    'Not Covering My Damage - will keep enough to cover your current stamina, and quest with the rest.',
                    'Never - disables questing.'],
                stopInstructions = "This will stop and remove the chosen quest and set questing to manual.",
                autoQuestName = state.getItem('AutoQuest', caap.newAutoQuest()).name,
                htmlCode = '';

            htmlCode = caap.startToggle('Quests', 'QUEST');
            htmlCode += caap.makeDropDownTR("Quest When", 'WhenQuest', questWhenList, questWhenInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenQuest', 'isnot', 'Never');
            htmlCode += caap.display.start('WhenQuest', 'is', 'At X Energy');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XQuestEnergy', XQuestInstructions, 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinQuestEnergy', XMinQuestInstructions, 0, '', '', true, false);
            htmlCode += caap.display.end('WhenQuest', 'is', 'At X Energy');
            htmlCode += caap.makeDropDownTR("Quest Area", 'QuestArea', questAreaList, '', '', '', false, false, 62);
            switch (config.getItem('QuestArea', questAreaList[0])) {
                case 'Quest':
                    htmlCode += caap.makeDropDownTR("Sub Area", 'QuestSubArea', caap.landQuestList, '', '', '', false, false, 62);
                    break;
                case 'Demi Quests':
                    htmlCode += caap.makeDropDownTR("Sub Area", 'QuestSubArea', caap.demiQuestList, '', '', '', false, false, 62);
                    break;
                default:
                    htmlCode += caap.makeDropDownTR("Sub Area", 'QuestSubArea', caap.atlantisQuestList, '', '', '', false, false, 62);
                    break;
            }

            htmlCode += caap.makeDropDownTR("Quest For", 'WhyQuest', questForList, questForListInstructions, '', '', false, false, 62);
            htmlCode += caap.makeCheckTR("Switch Quest Area", 'switchQuestArea', true, 'Allows switching quest area after Advancement or Max Influence');
            htmlCode += caap.makeCheckTR("Perform Excavation Quests", 'ExcavateMines', false, 'If quest is for a mine, go ahead and excavate it.');
            htmlCode += caap.makeCheckTR("Quest For Orbs", 'GetOrbs', false, 'Perform the Boss quest in the selected land for orbs you do not have.');
            htmlCode += "<a id='caap_stopAutoQuest' style='display: " + (autoQuestName ? "block" : "none") + "' href='javascript:;' title='" + stopInstructions + "'>";
            htmlCode += (autoQuestName ? "Stop auto quest: " + autoQuestName + " (energy: " + state.getItem('AutoQuest', caap.newAutoQuest()).energy + ")" : '');
            htmlCode += "</a>";
            htmlCode += caap.display.end('WhenQuest', 'isnot', 'Never');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in addQuestMenu: " + err.stack);
            return '';
        }
    };

    caap.addOtherOptionsMenu = function () {
        try {
            // Other controls
            var timeInstructions = "Use 24 hour format for displayed times.",
                nextLevelInDaysInstructions = "Express time to next level as the number of relative days so as to remove possible" +
                                              " confusion when the time to next level is a week or more in the future.",
                nextLevelThresholdInstructions = "Time to next level is expressed as the specific day of the week and the time of day" +
                                                 " unless that represents more than this number of days in the future; then," +
                                                 " time to next level is expressed as the number of relative days.  Thus, a 3 to 6" +
                                                 " day value is suggested for this threshold.",
                titleInstructions0 = "Set the title bar.",
                titleInstructions1 = "Add the current action.",
                titleInstructions2 = "Add the player name.",
                //newsSummaryInstructions = "Enable or disable the news summary on the index page.",
                bannerInstructions = "Uncheck if you wish to hide the CAAP banner.",
                donateInstructions = "Uncheck if you wish to hide the CAAP donate button.",
                itemTitlesInstructions = "Replaces the CA item titles with more useful tooltips.",
                goblinHintingInstructions = "When in the Goblin Emporium, CAAP will try to hide items that you require and fade those that may be required.",
                //ingredientsHideInstructions = "Hide the ingredients list on the Alchemy pages.",
                //alchemyShrinkInstructions = "Reduces the size of the item images and shrinks the recipe layout on the Alchemy pages.",
                //keepShrinkInstructions = "Reduces the size of the item images on the Keep pages.",
                //recipeCleanInstructions = "CAAP will try to hide recipes that are no longer required on the Alchemy page and therefore shrink the list further.",
                //recipeCleanCountInstructions = "The number of items to be owned before cleaning the recipe item from the Alchemy page.",
                //bookmarkModeInstructions = "Enable this if you are running CAAP from a bookmark. Disables refreshes and gifting. Note: not recommended for long term operation.",
                levelupModeInstructions = "Calculates approx. how many XP points you will get from your current stamina and energy and when you have enough of each to level up it will start using them down to 0.",
                serializeInstructions = "Setting this value allows you to define your Raids and Monsters all within either the Monster Attack Order or Raid Attack Order list boxes. " +
                    "Selection is serialized so that you only have a single selection from the list active at one time.  " +
                    "This is in contrast to the default mode, where you can have an active Raid and an active Monster, both processing independently.",
                styleList = ['CA Skin', 'Original', 'Custom', 'None'],
                htmlCode = '';

            htmlCode += caap.startToggle('Other', 'OTHER');
            /*
            if (caap.domain.which === 0) {
                htmlCode += caap.makeCheckTR('FB Custom Dropdown', 'FBCustomDrop', false, "Enable FB custom request dropdown");
                htmlCode += caap.display.start('FBCustomDrop');
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD(caap.makeTextBox('FBCustomDropList', "List of UserIDs for a FB custom request dropdown", '', ''));
                htmlCode += caap.endTR;
                htmlCode += caap.display.end('FBCustomDrop');
            }
            */

            htmlCode += caap.makeCheckTR('Display Keep Stats', 'displayKStats', true, "Display user statistics on your keep.");
            htmlCode += caap.makeCheckTR('Enable Oracle Mod', 'enableOracleMod', true, "Allows you to change the monthly general and the equipment that you wish to purchase.");
            htmlCode += caap.makeCheckTR('Display Item Titles', 'enableTitles', true, itemTitlesInstructions);
            htmlCode += caap.makeCheckTR('Do Goblin Hinting', 'goblinHinting', true, goblinHintingInstructions);
            //htmlCode += caap.makeCheckTR('Hide Recipe Ingredients', 'enableIngredientsHide', false, ingredientsHideInstructions);
            //htmlCode += caap.makeCheckTR('Alchemy Shrink', 'enableAlchemyShrink', true, alchemyShrinkInstructions);
            //htmlCode += caap.makeCheckTR('Keep Shrink', 'enableKeepShrink', true, keepShrinkInstructions);
            /*
            htmlCode += caap.makeCheckTR('Recipe Clean-Up', 'enableRecipeClean', 1, recipeCleanInstructions);
            htmlCode += caap.display.start('enableRecipeClean');
            htmlCode += caap.makeNumberFormTR("Recipe Count", 'recipeCleanCount', recipeCleanCountInstructions, 1, '', '', true);
            htmlCode += caap.display.end('enableRecipeClean');
            */

            if (caap.domain.which === 0) {
                htmlCode += caap.makeCheckTR('Auto Scroll To Top', 'scrollToTop', false, "Automatically scrolls the window to the very top of the view.");
                htmlCode += caap.display.start('scrollToTop');
                htmlCode += caap.makeSlider('Offset', "scrollToPosition", '', 0, true);
                htmlCode += caap.display.end('scrollToTop');
            }


            htmlCode += caap.makeCheckTR('Display CAAP Banner', 'BannerDisplay', true, bannerInstructions);
            htmlCode += caap.makeCheckTR('Display CAAP Donate', 'DonateDisplay', true, donateInstructions);
            htmlCode += caap.makeCheckTR('Use 24 Hour Format', 'use24hr', true, timeInstructions);

            htmlCode += caap.makeCheckTR('Days to next level', 'NextLevelInDays', false, nextLevelInDaysInstructions);
            htmlCode += caap.display.start('NextLevelInDays');
            htmlCode += caap.makeNumberFormTR('if more than n days', 'NextLevelThreshold', nextLevelThresholdInstructions, 5, '', '', true, false);
            htmlCode += caap.display.end('NextLevelInDays');

            htmlCode += caap.makeCheckTR('Set Title', 'SetTitle', false, titleInstructions0);
            htmlCode += caap.display.start('SetTitle');
            htmlCode += caap.makeCheckTR('Display Action', 'SetTitleAction', false, titleInstructions1, true);
            htmlCode += caap.makeCheckTR('Display Name', 'SetTitleName', false, titleInstructions2, true);
            htmlCode += caap.display.end('SetTitle');
            htmlCode += caap.makeCheckTR('Auto Comma Text Areas', 'TextAreaCommas', false, "When enabled, text input areas will be automatically converted to comma seperation");
            if (caap.domain.which === 0) {
                htmlCode += caap.makeCheckTR('Use CA Background', 'backgroundCA', false, '');
                //htmlCode += caap.makeCheckTR('Hide Cross Adverts', 'HideCrossAds', false, "Hide CA cross advertising.");
            }

            //htmlCode += caap.makeCheckTR('Enable News Summary', 'NewsSummary', true, newsSummaryInstructions);
            //htmlCode += caap.makeNumberFormTR("Left - Right offset (px)", 'lrOffset', 'Changing this will move the side menu left or right.', 942, '', '', true, false);
            //htmlCode += caap.makeNumberFormTR("Up - Down offset (px)", 'udOffset', 'Changing this will move the side menu up or down', 44, '', '', true, false);
            //htmlCode += caap.makeTD("<input type='button' id='caap_moveMenu' value='Set Menu Position' style='padding: 0; font-size: 10px; height: 18px' />");
            htmlCode += caap.makeDropDownTR("Style", 'DisplayStyle', styleList, '', '', 'CA Skin', false, false, 62);
            htmlCode += caap.display.start('DisplayStyle', 'is', 'Custom');
            htmlCode += caap.makeTD("Running:");
            htmlCode += caap.makeNumberFormTR("Color", 'CustStyleBackgroundLight', '#FFFFFF', '#E0C691', '', 'color', true, false, 40);
            htmlCode += caap.makeSlider('Transparency', "CustStyleOpacityLight", '', 1, true);
            htmlCode += caap.makeTD("Paused:");
            htmlCode += caap.makeNumberFormTR("Color", 'CustStyleBackgroundDark', '#FFFFFF', '#B09060', '', 'color', true, false, 40);
            htmlCode += caap.makeSlider('Transparency', "CustStyleOpacityDark", '', 1, true);
            htmlCode += caap.display.end('DisplayStyle', 'is', 'Custom');
            htmlCode += caap.makeCheckTR('Advanced', 'AdvancedOptions', false);
            htmlCode += caap.display.start('AdvancedOptions');
            htmlCode += caap.makeCheckTR('Enable Level Up Mode', 'EnableLevelUpMode', true, levelupModeInstructions, true);
            htmlCode += caap.makeCheckTR('Serialize Raid and Monster', 'SerializeRaidsAndMonsters', false, serializeInstructions, true);
            //htmlCode += caap.makeCheckTR('Bookmark Mode', 'bookmarkMode', false, bookmarkModeInstructions, true);
            htmlCode += caap.makeNumberFormTR("Reload Frequency", 'ReloadFrequency', 'Changing this will cause longer/shorter refresh rates. Minimum is 2 minutes.', 8, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Log Level", 'DebugLevel', '', 1, '', '', true, false);
/*           htmlCode += caap.startTR();
            htmlCode += caap.makeTD("<input type='button' id='caap_ActionList' value='Modify Action Order' style='padding: 0; font-size: 10px; height: 18px' />");
            htmlCode += caap.endTR;
*/            htmlCode += "<form><fieldset><legend>Database</legend>";
            htmlCode += caap.makeDropDownTR("Which Data", 'DataSelect', caap.exportList(), '', '', 'Config', true, false, 50);
            htmlCode += caap.startTR();
            htmlCode += caap.makeTD("<input type='button' id='caap_ExportData' value='Export' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
            htmlCode += caap.makeTD("<input type='button' id='caap_ImportData' value='Import' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
            htmlCode += caap.makeTD("<input type='button' id='caap_DeleteData' value='Delete' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
            htmlCode += caap.endTR;
            htmlCode += "</fieldset></form>";

            if (db && db.available) {
                htmlCode += "<form><fieldset><legend>Config</legend>";
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD("<input type='button' id='caap_BackupConfig' value='Profiles' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
                htmlCode += caap.makeTD("<input type='button' id='caap_BackupCurrent' value='Backup' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
                htmlCode += caap.makeTD("<input type='button' id='caap_RestoreCurrent' value='Restore' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
                htmlCode += caap.endTR;
                htmlCode += "</fieldset></form>";
            }

            htmlCode += caap.display.end('AdvancedOptions');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in addOtherOptionsMenu: " + err.stack);
            return '';
        }
    };

    caap.addFooterMenu = function () {
        try {
            var htmlCode = '';
            htmlCode += caap.startTR();
            htmlCode += caap.makeTD("Unlock Menu <input type='button' id='caap_ResetMenuLocation' value='Reset' style='padding: 0; font-size: 10px; height: 18px' />", false, false, "width: 90%, display: inline-block;");
            htmlCode += caap.makeTD("<input type='checkbox' id='unlockMenu' />", false, true, "width: 10%, display: inline-block;");
            htmlCode += caap.endTR;

            if (devVersion === '0') {
                htmlCode += caap.makeTD("Version: " + caapVersion + " - <a href='http://caaplayer.freeforums.org/' target='_blank'>CAAP Forum</a>");
                if (caap.newVersionAvailable) {
                    htmlCode += caap.makeTD("<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + "!</a>");
                }
            } else {
                htmlCode += caap.makeTD("Version: " + caapVersion + " d" + devVersion + " - <a href='http://caaplayer.freeforums.org/' target='_blank'>CAAP Forum</a>");
                if (caap.newVersionAvailable) {
                    htmlCode += caap.makeTD("<a href='http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " +
                                            state.getItem('SUC_remote_version') + " d" + state.getItem('DEV_remote_version') + "!</a>");
                }
            }

            return htmlCode;
        } catch (err) {
            con.error("ERROR in addFooterMenu: " + err.stack);
            return '';
        }
    };

    caap.addPlayButton = function() {
        try {
            /*-------------------------------------------------------------------------------------\
            Here is where we construct the HTML for our dashboard. We start by building the outer
            container and position it within the main container.
            \-------------------------------------------------------------------------------------*/
            var layout = "<div id='caap_playbuttondiv'>",
                bgc = state.getItem('StyleBackgroundDark', '#B09060');

            /*-------------------------------------------------------------------------------------\
            We install the display selection box that allows the user to toggle through the
            available displays.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_playbutton' class='ui-icon ui-icon-circle-triangle-e' style='position:absolute;top:0px;left:0px;' title='Resume' onmouseover='this.style.cursor=\"pointer\";' onmouseout='this.style.cursor=\"default\";'>&gt;</div>";
            layout += "</div>";

            /*-------------------------------------------------------------------------------------\
            No we apply our CSS to our container
            \-------------------------------------------------------------------------------------*/
            $j(layout).css({
                background : bgc,
                color : $u.bestTextColor(bgc),
                padding : "5px",
                height : "6px",
                width : "6px",
                margin : "0 auto",
                opacity : state.getItem('StyleOpacityDark', 1),
                top : '0px',
                left : '0px',
                zIndex : '99',
                position : 'fixed',
                display : state.getItem('caapPause', 'none')
            }).appendTo(document.body);

            caap.caapPlayButtonDiv = $j('#caap_playbuttondiv');
            return true;
        } catch (err) {
            con.error("ERROR in addPlayButton: " + err.stack);
            return false;
        }
    };

    /////////////////////////////////////////////////////////////////////
    //                          EVENT LISTENERS
    // Watch for changes and update the controls
    /////////////////////////////////////////////////////////////////////

    caap.setDisplay = function (area, idName, display, quiet) {
        try {
            if (!$u.hasContent(idName) || (!$u.isString(idName) && !$u.isNumber(idName))) {
                con.warn("idName", idName);
                throw "Bad idName!";
            }

            var areaDiv = caap[area],
                areatest = area;

            if (!$u.hasContent(areaDiv)) {
                areatest = "default";
                areaDiv = $j(document.body);
                con.warn("Unknown area. Using document.body", area);
            }

            con.log(2, "Change: display of 'caap_" + idName + "' to '" + (display === true ? 'block' : 'none') + "'", areatest);
			areaDiv = $j('div[id="caap_' + idName + '"]', areaDiv);
            if (!$u.hasContent(areaDiv) && !quiet) {
                con.warn("Unable to find idName in area!", idName, area);
				return false;
            }
            areaDiv.each( function() {
				$j(this).css('display', display === true ? 'block' : 'none');
			});

            return true;
        } catch (err) {
            con.error("ERROR in setDisplay: " + err.stack);
            return false;
        }
    };

    caap.setDisplayById = function (idName) {
        try {
			$j("div[id^='caap_displayIf__" + idName + "__is']").each( function() {
				var id = $j(this).attr('id'),					
					arr = id.regex(/caap_displayIf__(\w+)__(is|isnot)__(\w+)/);
				if (arr) {
					caap.setDisplay('', id.replace('caap_',''), (config.getItem(arr[0], false).toString() == arr[2].replace(/_/g,' ')) == (arr[1] == 'is'));
				} else {
					con.warn('caap.dropBoxListener: Unable to parse setting change for id ' + id);
				}
			});

            return true;
        } catch (err) {
            con.error("ERROR in setDisplayById: " + err.stack);
            return false;
        }
    };

    caap.checkBoxListener = function (e) {
        try {
            var idName = e.target.id.stripCaap(),
                DocumentTitle = '',
                d = '',
                styleXY = {};

            con.log(1, "Change: setting '" + idName + "' to ", e.target.checked);
            config.setItem(idName, e.target.checked);
			caap.setDisplayById(idName);
			
            switch (idName) {
                case "NextLevelInDays":
                    caap.setNextLevelMessage();
                    break;
                case "backgroundCA":
                    if (caap.domain.which === 0) {
                        if (e.target.checked) {
                            $j("body").css({
                                'background-color': 'black'
                            });

                            caap.messaging.backgroundCA("black");

                            $j("#mainContainer").css({
                                'border-color': 'black'
                            });

                            $j("#contentArea").css({
                                'border-color': 'black'
                            });

                            $j("#contentCol").css({
                                'background-color': 'black',
                                'border-color': 'black'
                            });

                            $j("#leftColContainer,#pagelet_canvas_footer_content,#bottomContent").hide();

                            $j("#contentCol").removeClass("clearfix");
                        } else {
                            $j("body").css({
                                'background-color': ''
                            });

                            caap.messaging.backgroundCA("");

                            $j("#mainContainer").css({
                                'border-color': ''
                            });

                            $j("#contentArea").css({
                                'border-color': ''
                            });

                            $j("#contentCol").css({
                                'background-color': '',
                                'border-color': ''
                            });

                            $j("#leftColContainer,#pagelet_canvas_footer_content,#bottomContent").show();

                            $j("#contentCol").addClass("clearfix");
                        }
                    }

                    if (caap.domain.which === 0 || caap.domain.which === 2) {
                        styleXY = caap.getControlXY(true);
                        caap.caapDivObject.css({
                            top: styleXY.y + 'px',
                            left: styleXY.x + 'px'
                        });
                    }

                    if (caap.domain.which === 2 || caap.domain.which === 3) {
                        styleXY = caap.getDashboardXY(true);
                        caap.caapTopObject.css({
                            top: styleXY.y + 'px',
                            left: styleXY.x + 'px'
                        });

                        caap.caapTopMinObject.css({
                            top: styleXY.y + 'px',
                            left: styleXY.x + 'px'
                        });
                    }

                    break;
                case "filterGeneral":
                    if (caap.domain.which === 0 || caap.domain.which === 2) {
                        general.UpdateDropDowns();
                    }

                    break;
                case "HideFBChat":
                    if (caap.domain.which === 0) {
                        con.log(9, "HideFBChat");
                        $j("#pagelet_dock div[class='fbDockWrapper fixed_always fbDockWrapperRight']").css('display', e.target.checked ? 'none' : 'block');
                    }

                    break;
				case "IgnoreBattleLoss":
                    con.log(9, "IgnoreBattleLoss");
                    if (e.target.checked) {
                        con.log(1, "Ignore Battle Losses has been enabled.");
                    }

                    break;
                case "SetTitle":
                case "SetTitleAction":
                case "SetTitleName":
                    if (caap.domain.which === 0 || caap.domain.which === 2) {
                        con.log(9, idName);
                        if (e.target.checked) {
                            if (config.getItem('SetTitleAction', false)) {
                                d = $j('#caap_activity_mess', caap.caapDivObject).html();
                                if (d) {
                                    DocumentTitle += d.replace("Activity: ", '') + " - ";
                                }
                            }

                            if (config.getItem('SetTitleName', false)) {
                                DocumentTitle += stats.PlayerName + " - ";
                            }

                            document.title = DocumentTitle + caap.documentTitle;
                        } else {
                            document.title = caap.documentTitle;
                        }
                    }

                    break;
                case "unlockMenu":
                    con.log(9, "unlockMenu");
                    if (e.target.checked) {
                        if (caap.domain.which === 0 || caap.domain.which === 2) {
                            $j(":input[id^='caap_']", caap.caapDivObject).attr({
                                disabled: true
                            });

                            caap.caapDivObject.css('cursor', 'move').draggable({
                                stop: function () {
                                    caap.saveControlXY();
                                }
                            });
                        }

                        if (caap.domain.which === 2 || caap.domain.which === 3) {
                            $j(":input[id^='caap_']", caap.caapTopObject).attr({
                                disabled: true
                            });

                            caap.caapTopObject.css('cursor', 'move').draggable({
                                stop: function () {
                                    caap.saveDashboardXY();
                                    styleXY = caap.getDashboardXY();
                                    caap.caapTopMinObject.css({
                                        top: styleXY.y + 'px',
                                        left: styleXY.x + 'px'
                                    });
                                }
                            });
                        }

                    } else {
                        if (caap.domain.which === 0 || caap.domain.which === 2) {
                            caap.caapDivObject.css('cursor', '').draggable("destroy");
                            $j(":input[id^='caap_']", caap.caapDivObject).attr({
                                disabled: false
                            });
                        }

                        if (caap.domain.which === 2 || caap.domain.which === 3) {
                            caap.caapTopObject.css('cursor', '').draggable("destroy");
                            $j(":input[id^='caap_']", caap.caapTopObject).attr({
                                disabled: false
                            });
                        }
                    }

                    break;
                case "AchievementMode":
                    con.log(9, "AchievementMode");
                    monster.flagReview();

                    break;
                case "StatSpendAll":
                    state.setItem("autoStatRuleLog", true);
                    break;
                case "enableTitles":
                case "goblinHinting":
                    if (e.target.checked) {
                        caap.messaging.goblinHinting();
                    }

                    break;
                case "ignoreClerics":
                case "chooseIgnoredMinions":
                    state.setItem('targetGuildMonster', {});
                    state.setItem('staminaGuildMonster', 0);
                    schedule.setItem("guildMonsterReview", 0);

                    break;
                case "festivalTower":
                    monster.select(true);

                    break;
                default:
					break;
            }

            return true;
        } catch (err) {
            con.error("ERROR in checkBoxListener: " + err.stack);
            return false;
        }
    };

    caap.colorDiv = {};

    caap.colorUpdate = function () {
        try {
            var color = state.getItem('caapPause', 'none') === 'none' ? state.getItem('StyleBackgroundLight', 1) : state.getItem('StyleBackgroundDark', 1),
                bgo = state.getItem('caapPause', 'none') === 'none' ? state.getItem('StyleOpacityLight', 1) : state.getItem('StyleOpacityDark', 1),
                btc = $u.bestTextColor(color),
                chk1,
                chk2;

            if (caap.domain.which === 0 || caap.domain.which === 2) {
                chk1 = caap.caapDivObject.css('background-color');
                chk2 = caap.caapDivObject.css('color');
            } else if (caap.domain.which === 3) {
                chk1 = caap.caapTopObject.css('background-color');
                chk2 = caap.caapTopObject.css('color');
            }

            if ($u.hex2rgb(color).color !== chk1) {
                con.log(4, "Update background color", color, chk1);
                if (caap.domain.which === 0 || caap.domain.which === 2) {
                    caap.caapDivObject.css({
                        'background': color,
                        'opacity': bgo,
                        'color': btc
                    });

                    caap.caapPlayButtonDiv.css({
                        'background': color,
                        'opacity': bgo,
                        'color': btc
                    });
                }

                if (caap.domain.which === 2 || caap.domain.which === 3) {
                    caap.caapTopObject.css({
                        'background': color,
                        'opacity': bgo,
                        'color': btc
                    });

                    caap.caapTopMinObject.css({
                        'background': color,
                        'opacity': bgo,
                        'color': btc
                    });
                }

                if ($u.hex2rgb(btc).color !== chk2) {
                    con.log(4, "Update text color", btc, chk2);
                    if (caap.domain.which === 2 || caap.domain.which === 3) {
                        $j("th[data-type='bestcolor'],td[data-type='bestcolor']", caap.caapTopObject).css({
                            'color': btc
                        });
                    }
                }
            }

            if (caap.domain.which === 0) {
                caap.messaging.styleChange();
            }

            return true;
        } catch (err) {
            con.error("ERROR in colorUpdate: " + err.stack);
            return false;
        }
    };

    caap.colorBoxClickListener = function (e) {
        function fb1call(color) {
            state.setItem("StyleBackgroundLight", color);
            caap.colorUpdate();
        }

        function fb2call(color) {
            state.setItem("StyleBackgroundDark", color);
            caap.colorUpdate();
        }

        function d1call(el_id, color) {
            var s = el_id.stripCaap(),
                v = $u.addSharp(color).toUpperCase(),
                c = '';

            if (color !== 'close') {
                con.log(1, 'Change: setting "' + s + '" to ', v);
                config.setItem(s, v);
            } else {
                c = config.getItem(s, v);
                switch (s) {
                    case "CustStyleBackgroundLight":
                        state.setItem("StyleBackgroundLight", c);
                        caap.colorUpdate();
                        break;
                    case "CustStyleBackgroundDark":
                        state.setItem("StyleBackgroundDark", c);
                        caap.colorUpdate();
                        break;
                    default:
						break;
                }

                caap.colorDiv[e.target.id][3].val(c);
                caap.colorDiv[e.target.id][3].css({
                    background: e.target.value,
                    color: $u.bestTextColor(e.target.value)
                });
            }
            delete caap.colorDiv[el_id];
        }

        try {
            var id = e.target.id.stripCaap(),
                t = $j(e.target);

            if (!$u.hasContent(caap.colorDiv[e.target.id])) {
                switch (id) {
                    case "CustStyleBackgroundLight":
                        caap.colorDiv[e.target.id] = t.colorInput(fb1call, d1call).concat(t);
                        break;
                    case "CustStyleBackgroundDark":
                        caap.colorDiv[e.target.id] = t.colorInput(fb2call, d1call).concat(t);
                        break;
                    default:
                        caap.colorDiv[e.target.id] = t.colorInput(function () {}, d1call).concat(t);
                }

                caap.colorDiv[e.target.id][1].css({
                    background: e.target.value,
                    color: $u.bestTextColor(e.target.value),
                    padding: "5px",
                    border: "2px solid #000000"
                });
            }

            return true;
        } catch (err) {
            con.error("ERROR in colorBoxClickListener: " + err.stack);
            return false;
        }
    };

    caap.colorBoxChangeListener = function (e) {
        try {
            e.target.value = $u.addSharp(e.target.value).toUpperCase();
            caap.colorBoxListener(e);
            return true;
        } catch (err) {
            con.error("ERROR in colorBoxChangeListener: " + err.stack);
            return false;
        }
    };

    caap.colorBoxListener = function (e) {
        try {
            var id = e.target.id.stripCaap(),
                val = $u.addSharp(e.target.value).toUpperCase(),
                c = new $u.ColorConv();

            e.target.style.backgroundColor = val;
            c.setRgb(e.target.style.backgroundColor);
            e.target.style.color = $u.bestTextColor(c.getHex());
            con.log(1, 'Change: setting "' + id + '" to ', val);
            config.setItem(id, val);
            if ($u.hasContent(caap.colorDiv[e.target.id])) {
                caap.colorDiv[e.target.id][2].setColor(val);
            }

            switch (id) {
                case "CustStyleBackgroundLight":
                    state.setItem("StyleBackgroundLight", val);
                    caap.colorUpdate();

                    break;
                case "CustStyleBackgroundDark":
                    state.setItem("StyleBackgroundDark", val);
                    caap.colorUpdate();

                    break;
                default:
					break;
            }

            return true;
        } catch (err) {
            con.error("ERROR in colorBoxListener: " + err.stack);
            return false;
        }
    };

    caap.textBoxListener = function (e) {
        try {
            var idName = e.target.id.stripCaap();

            con.log(1, 'Change: setting "' + idName + '" to ', String(e.target.value));
            config.setItem(idName, String(e.target.value));
            return true;
        } catch (err) {
            con.error("ERROR in textBoxListener: " + err.stack);
            return false;
        }
    };
 
	caap.numberBoxListener = function (e) {
        try {
            var idName = e.target.id.stripCaap(),
                number = null,
                message = '';

            if ($u.isNaN(e.target.value) && e.target.value !== '') {
                message = "<div style='text-align: center;'>";
                message += "You entered:<br /><br />";
                message += "'" + e.target.value + "'<br /><br />";
                message += "Please enter a number or leave blank.";
                message += "</div>";
                $j().alert(message);
                number = '';
            } else {
                number = $u.isNaN(e.target.value) && e.target.value === '' ? '' : e.target.value.parseFloat();
            }

            con.log(1, 'Change: setting "' + idName + '" to ', number);
            if (/MaxToFortify/.test(idName)) {
                monster.select(true);
            } else if (/Chain/.test(idName)) {
                state.getItem('BattleChainId', 0);
            } else if (idName === 'DebugLevel') {
                con.log_level = e.target.value.parseInt();
            } else if (idName === "IgnoreMinionsBelow") {
                state.setItem('targetGuildMonster', {});
                state.setItem('staminaGuildMonster', 0);
                schedule.setItem("guildMonsterReview", 0);
            }

            e.target.value = config.setItem(idName, number);
            return true;
        } catch (err) {
            con.error("ERROR in numberBoxListener: " + err.stack);
            return false;
        }
    };

    caap.dropBoxListener = function (e) {
        try {
            if (e.target.selectedIndex > 0) {
                var idName = e.target.id.stripCaap(),
                    value = e.target.options[e.target.selectedIndex].value,
                    title = e.target.options[e.target.selectedIndex].title,
					workerName = idName.replace('When', ''),
					mess = workerName.toLowerCase() + '_mess';

                con.log(1, 'Change: setting "' + idName + '" to "' + value + '" with title "' + title + '"');
                config.setItem(idName, value);
                e.target.title = title;
				caap.setDisplayById(idName);
				
				switch (idName) {
					case 'WhenBattle':
					case 'WhenConquest':
					case 'WhenMonster':
						caap.setDivContent(mess, value === 'Never' ? workerName + ' off' : '');
						if (workerName == 'Monster' || workerName == 'Battle') {
							caap.setDisplay("caapDivObject", 'WhenBattleStayHidden_hide', ((config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden')));
							caap.setDisplay("caapDivObject", 'WhenMonsterStayHidden_hide', ((config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && config.getItem('WhenBattle', 'Never') !== 'Stay Hidden')));
						}
						break;
						
					case 'WhenGuildMonster':
						caap.setDivContent('guild_monster_mess', value === 'Never' ? 'Guild Monster off' : '');
						break;
						
					case 'WhenGuildBattle': // Add in 10v10, 100v100?
						caap.setDivContent('gbClassic_mess', value === 'Never' ? 'Classic off' : '');
						break;
						
					case 'QuestArea':
                        switch (value) {
                            case "Quest":
                                caap.changeDropDownList('QuestSubArea', caap.landQuestList);
                                break;
                            case "Demi Quests":
                                caap.changeDropDownList('QuestSubArea', caap.demiQuestList);
                                break;
                            case "Atlantis":
                                caap.changeDropDownList('QuestSubArea', caap.atlantisQuestList);
                                break;
                            default:
								break;
                        }
						/* falls through */
					case 'QuestSubArea':
					case 'WhyQuest':
						state.setItem('AutoQuest', caap.newAutoQuest());
						caap.clearAutoQuest();
						break;
						
					case 'BattleType':
					case 'TargetType':
						state.setItem('BattleChainId', 0);
						break;
						
					case 'DisplayStyle':
						caap.setDisplay("caapDivObject", idName + '_hide', value === 'Custom');
						switch (value) {
							case "Original":
								state.setItem("StyleBackgroundLight", "#EFEFFF");
								state.setItem("StyleBackgroundDark", "#FEEFFF");
								state.setItem("StyleOpacityLight", 1);
								state.setItem("StyleOpacityDark", 1);
								break;
							case "None":
								state.setItem("StyleBackgroundLight", "#FFFFFF");
								state.setItem("StyleBackgroundDark", "#FFFFFF");
								state.setItem("StyleOpacityLight", 1);
								state.setItem("StyleOpacityDark", 1);
								break;
							case "Custom":
								state.setItem("StyleBackgroundLight", config.getItem("CustStyleBackgroundLight", "#E0C691"));
								state.setItem("StyleBackgroundDark", config.getItem("CustStyleBackgroundDark", "#B09060"));
								state.setItem("StyleOpacityLight", config.getItem("CustStyleOpacityLight", 1));
								state.setItem("StyleOpacityDark", config.getItem("CustStyleOpacityDark", 1));
								break;
							default:
								state.setItem("StyleBackgroundLight", "#E0C691");
								state.setItem("StyleBackgroundDark", "#B09060");
								state.setItem("StyleOpacityLight", 1);
								state.setItem("StyleOpacityDark", 1);
						}
						caap.colorUpdate();
						break;
						
					default:
						break;
				}
            }
            return true;
        } catch (err) {
            con.error("ERROR in dropBoxListener: " + err.stack);
            return false;
        }
    };

    caap.textAreaListener = function (e) {
        function commas() {
            // Change the boolean from false to true to enable BoJangles patch or
            // set the hidden variable in localStorage
            if (config.getItem("TextAreaCommas", false)) {
                // This first removes leading and trailing white space and/or commas before
                // both removing and inserting commas where appropriate.
                // Handles adding a single user id as well as replacing the entire list.
                e.target.value = e.target.value.replace(/(^[,\s]+)|([,\s]+$)/g, "").replace(/[,\s]+/g, ",");
            }
        }

        try {
            var idName = e.target.id.stripCaap();

            con.log(1, 'Change: setting "' + idName + '" to ', e.target.value);
            config.setItem(idName, e.target.value);
            switch (idName) {
                case "orderGuildMinion":
                case "orderGuildMonster":
                    state.setItem('targetGuildMonster', {});
                    state.setItem('staminaGuildMonster', 0);
                    schedule.setItem("guildMonsterReview", 0);
                    break;
                case "orderbattle_monster":
                case "orderraid":
                    monster.select(true);
                    break;
                case "BattleTargets":
                    state.setItem('BattleChainId', 0);
                    commas();
                    break;
                case "EliteArmyList":
                    commas();
                    break;
                default:
					break;
            }

            return true;
        } catch (err) {
            con.error("ERROR in textAreaListener: " + err.stack);
            return false;
        }
    };

    caap.pauseListener = function () {
        caap.messaging.pauseListener();
        var bgc = state.getItem('StyleBackgroundDark', '#B09060'),
            bgo = state.getItem('StyleOpacityDark', 1),
            btc = $u.bestTextColor(bgc),
            chk = $u.bestTextColor(state.getItem('StyleBackgroundLight', '#E0C691'));

        if (caap.domain.which !== 3) {
            caap.caapDivObject.css({
                'background': bgc,
                'color': btc,
                'opacity': bgo,
                'z-index': '3'
            });
        }

        if (caap.domain.which !== 0) {
            caap.caapTopObject.css({
                'background': bgc,
                'color': btc,
                'opacity': bgo
            });

            caap.caapTopMinObject.css({
                'background': bgc,
                'color': btc,
                'opacity': bgo
            });

            if (btc !== chk) {
                $j("th[data-type='bestcolor'],td[data-type='bestcolor']", caap.caapTopObject).css({
                    'color': btc
                });
            }
        }

        if (caap.domain.which !== 3) {
            $j('#caapPaused', caap.caapDivObject).show();
            caap.caapPlayButtonDiv.show();
        }

        state.setItem('caapPause', 'block');
        session.setItem('ReleaseControl', true);
    };

    caap.restartListener = function () {
        caap.messaging.restartListener();
        var bgc = state.getItem('StyleBackgroundLight', '#E0C691'),
            bgo = state.getItem('StyleOpacityLight', 1),
            btc = $u.bestTextColor(bgc),
            chk = $u.bestTextColor(state.getItem('StyleBackgroundDark', '#B09060'));

        if (caap.domain.which !== 3) {
            $j('#caapPaused', caap.caapDivObject).hide();
            caap.caapPlayButtonDiv.hide();
            caap.caapDivObject.css({
                'background': bgc,
                'color': btc,
                'opacity': bgo,
                'z-index': state.getItem('caap_div_zIndex', '2'),
                'cursor': ''
            });
        }

        if (caap.domain.which !== 0) {
            caap.caapTopObject.css({
                'background': bgc,
                'color': btc,
                'opacity': bgo,
                'z-index': state.getItem('caap_top_zIndex', '1'),
                'cursor': ''
            });

            caap.caapTopMinObject.css({
                'background': bgc,
                'color': btc,
                'opacity': bgo,
                'z-index': state.getItem('caap_top_zIndex', '1'),
                'cursor': ''
            });

            if (btc !== chk) {
                $j("th[data-type='bestcolor'],td[data-type='bestcolor']", caap.caapTopObject).css({
                    'color': btc
                });
            }
        }

        if (caap.domain.which !== 3) {
            $j('#unlockMenu', caap.caapDivObject).attr('checked', false);
        }

        state.setItem('caapPause', 'none');
        schedule.setItem("clickedOnSomething", 0);
		if (caap.hyper) {
			schedule.setItem("hyperTimer", 0);
		}
        session.setItem('ReleaseControl', true);
        session.setItem('resetselectMonster', true);
        session.setItem('resetselectGuildMonster', true);
		worker.list.forEach( function(i) {
			if ($u.isFunction(window[i].unpause)) {
				window[i].unpause();
			}
		});
		
        caap.clearDomWaiting();
    };

    caap.resetMenuLocationListener = function () {
        var caap_divXY = {},
            caap_topXY = {};

        state.deleteItem('caap_div_menuLeft');
        state.deleteItem('caap_div_menuTop');
        state.deleteItem('caap_div_zIndex');
        if (caap.domain.which !== 3) {
            caap.controlXY.x = '';
            caap.controlXY.y = $j(caap.controlXY.selector).offset().top;
            caap_divXY = caap.getControlXY(true);
            caap.caapDivObject.css({
                'cursor': '',
                'z-index': '2',
                'top': caap_divXY.y + 'px',
                'left': caap_divXY.x + 'px'
            });

            $j(":input[id^='caap_']", caap.caapDivObject).attr({
                disabled: false
            });
        }

        state.deleteItem('caap_top_menuLeft');
        state.deleteItem('caap_top_menuTop');
        state.deleteItem('caap_top_zIndex');
        if (caap.domain.which !== 0) {
            caap.dashboardXY.x = '';
            caap.dashboardXY.y = $j(caap.dashboardXY.selector).offset().top;
            caap_topXY = caap.getDashboardXY(true);
            caap.caapTopObject.css({
                'cursor': '',
                'z-index': '1',
                'top': caap_topXY.y + 'px',
                'left': caap_topXY.x + 'px'
            });

            caap.caapTopMinObject.css({
                'cursor': '',
                'z-index': '1',
                'top': caap_topXY.y + 'px',
                'left': caap_topXY.x + 'px'
            });

            $j(":input[id^='caap_']", caap.caapTopObject).attr({
                disabled: false
            });
        }
    };

    caap.foldingBlockListener = function (e) {
        try {
            var subId = e.target.id.replace(/_Switch/i, ''),
                subDiv = document.getElementById(subId);

            if (subDiv.style.display === "block") {
                con.log(2, 'Folding: ', subId);
                subDiv.style.display = "none";
                e.target.innerHTML = e.target.innerHTML.replace(/-/, '+');
                state.setItem('Control_' + subId.stripCaap(), "none");
            } else {
                con.log(2, 'Unfolding: ', subId);
                subDiv.style.display = "block";
                e.target.innerHTML = e.target.innerHTML.replace(/\+/, '-');
                state.setItem('Control_' + subId.stripCaap(), "block");
            }

            return true;
        } catch (err) {
            con.error("ERROR in foldingBlockListener: " + err.stack);
            return false;
        }
    };

    caap.whatClickedURLListener = function (event) {
        try {
            var obj = event.target;

            con.log(3, 'event.target', event.target);
            while (obj && !obj.href) {
                obj = obj.parentNode;
            }

            if (obj && obj.href) {
                con.log(3, 'obj.href', obj.href);
                caap.setDomWaiting(obj.href);
            } else {
                if (obj && !obj.href) {
                    con.warn('whatClickedURLListener no href', obj);
                }
            }
        } catch (err) {
            con.error("ERROR in whatClickedURLListener: " + err, event);
        }
    };

    caap.whatClickedimgButton = function (event) {
        try {
            var obj = event.target,
                onclick = '',
                called = '',
                label = '',
                page = $j(".game").attr("id");

            con.log(3, 'event.target', event.target);
            while (obj && !obj.onclick) {
                obj = obj.parentNode;
            }

            if (obj && obj.onclick) {
                con.log(3, 'obj.onclick', obj.onclick);
                onclick = (obj.onclick + ' ');
                called = onclick.regex(/\s*(\S+)\(\'/m);
                label = onclick.regex(/\S+\(\'(\S+)\'\)/m);
                label = $u.setContent(label, onclick.regex(/,\s*\'(\S+)\'/m));
                if ($u.hasContent(page) && $u.hasContent(called) && $u.hasContent(label)) {
                    con.log(2, 'page', page + '.php?' + called + '&' + label);
                    session.setItem('clickUrl', page + '.php?' + called + '&' + label);
                    //caap.setDomWaiting(page + '.php?' + called + '&' + label);
                    caap.checkResultsTop();
                } else {
                    con.warn('whatClickedimgButton missing page, called or label', page, called, label);
                }
            } else {
                if (obj && !obj.onclick) {
                    con.warn('whatClickedimgButton no onclick', obj);
                }
            }
        } catch (err) {
            con.error("ERROR in whatClickedURLListener: " + err, event);
        }
    };

    caap.whatFriendBox = function () {
        try {
            var obj = event.target,
                userID = 0;

            while (obj && !obj.id) {
                obj = obj.parentNode;
            }

            if (obj && obj.id && obj.onclick) {
                userID = obj.onclick.toString().regex(/friendKeepBrowse\('(\d+)'/);
                caap.setDomWaiting("keep.php" + ($u.isNumber(userID) && userID > 0 ? "?casuser=" + userID : ''));
            }

        } catch (err) {
            con.error("ERROR in whatFriendBox: " + err, event);
        }
    };

    caap.guildMonsterEngageListener = function () {
        con.log(4, "engage guild_battle_monster.php");
        caap.setDomWaiting("guild_battle_monster.php");
    };

    caap.windowResizeListener = function () {
        var caap_topXY;

        if (caap.domain.which === 0 || caap.domain.which === 2) {
            caap.caapDivObject.css('left', caap.getControlXY().x + 'px');
        }

        if (caap.domain.which === 2 || caap.domain.which === 3) {
            caap_topXY = caap.getDashboardXY();
            caap.caapTopObject.css('left', caap_topXY.x + 'px');
            caap.caapTopMinObject.css('left', caap_topXY.x + 'px');
        }
    };

    caap.goldTimeListener = function (e) {
        var tArr = $u.setContent($u.setContent($j(e.target).text(), '').regex(/(\d+):(\d+)/), []);

        if (!$u.hasContent(tArr) || tArr.length !== 2) {
            return;
        }

        stats.gold.ticker = tArr;
        if (tArr[1] === 0 || con.log_level >= 4) {
            con.log(3, "goldTimeListener", tArr[0] + ":" + tArr[1].lpad("0", 2));
        }
    };

    caap.energyListener = function (e) {
        var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);

        if (num < 0 || $u.isNaN(num)) {
            return;
        }
        stats.energy.num = num;
        con.log(3, "energyListener", num, stats.energy);
    };

    caap.energyTimeListener = function (e) {
        var tArr = $u.setContent($u.setContent($j(e.target).text(), '').regex(/(\d+):(\d+)/), []);

        if (!$u.hasContent(tArr) || tArr.length !== 2) {
            return;
        }

        stats.energy.ticker = tArr;
        if (tArr[1] === 0 || con.log_level >= 4) {
            con.log(3, "energyTimeListener", tArr[0] + ":" + tArr[1].lpad("0", 2));
        }
    };

    caap.healthListener = function (e) {
        var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);

        if (num < 0 || $u.isNaN(num)) {
            return;
        }

        stats.health.num = num;
        con.log(3, "healthListener", num);
    };

    caap.healthTimeListener = function (e) {
        var tArr = $u.setContent($u.setContent($j(e.target).text(), '').regex(/(\d+):(\d+)/), []);

        if (!$u.hasContent(tArr) || tArr.length !== 2) {
            return;
        }

        stats.health.ticker = tArr;
        if (tArr[1] === 0 || con.log_level >= 4) {
            con.log(3, "healthTimeListener", tArr[0] + ":" + tArr[1].lpad("0", 2));
        }
    };

    caap.staminaListener = function (e) {
        var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);

        if (num < 0 || $u.isNaN(num)) {
            return;
        }

        stats.stamina.num = num;
        con.log(3, "staminaListener", num);
    };

    caap.staminaTimeListener = function (e) {
        var tArr = $u.setContent($u.setContent($j(e.target).text(), '').regex(/(\d+):(\d+)/), []);

        if (!$u.hasContent(tArr) || tArr.length !== 2) {
            return;
        }

        stats.stamina.ticker = tArr;
        if (tArr[1] === 0 || con.log_level >= 4) {
            con.log(3, "staminaTimeListener", tArr[0] + ":" + tArr[1].lpad("0", 2));
        }
    };

    caap.reBindCaapDiv = function () {
        try {
            if (!$u.hasContent(caap.caapDivObject)) {
                throw "Unable to find div for caap_div";
            }

            $j('input:checkbox[id^="caap_"]', caap.caapDivObject).change(caap.checkBoxListener);

            $j('input[data-subtype="text"]', caap.caapDivObject).change(caap.textBoxListener);

            $j('input[data-subtype="color"]', caap.caapDivObject).keyup(caap.colorBoxListener).change(caap.colorBoxChangeListener).click(caap.colorBoxClickListener);

            $j('input[data-subtype="number"]', caap.caapDivObject).change(caap.numberBoxListener);

            $j('#unlockMenu', caap.caapDivObject).change(caap.checkBoxListener);

            $j('select[id^="caap_"]', caap.caapDivObject).change(caap.dropBoxListener);

            $j('textarea[id^="caap_"]', caap.caapDivObject).change(caap.textAreaListener);

            $j('a[id^="caap_Switch"]', caap.caapDivObject).click(caap.foldingBlockListener);

            $j('#caap_ImportData', caap.caapDivObject).click(function () {
                caap.importDialog($u.setContent($j('#caap_DataSelect', caap.caapDivObject).val(), 'Config'));
            });

            $j('#caap_ExportData', caap.caapDivObject).click(function () {
                var val = $u.setContent($j('#caap_DataSelect', caap.caapDivObject).val(), 'Config');
                caap.exportDialog(caap.exportTable[val].export(), val);
            });

            $j('#caap_DeleteData', caap.caapDivObject).click(function () {
                caap.deleteDialog($u.setContent($j('#caap_DataSelect', caap.caapDivObject).val(), 'Config'));
            });

            $j('#caap_BackupConfig', caap.caapDivObject).click(function () {
                profiles.getBackupKeys(caap.profilesDialog);
            });

            $j('#caap_BackupCurrent', caap.caapDivObject).click(function () {
                profiles.backupCurrent();
            });

            $j('#caap_RestoreCurrent', caap.caapDivObject).click(function () {
                profiles.restoreCurrent();
            });

//            $j('#caap_ActionList', caap.caapDivObject).click(caap.actionDialog);
            $j('#caap_moveMenu', caap.caapDivObject).click(function () {
                caap.moveMenu();
            });

            $j('#caap_FillArmy', caap.caapDivObject).click(function () {
                state.setItem("FillArmy", true);
                state.setItem("ArmyCount", 0);
                state.setItem('FillArmyList', []);
                caap.getArmyButtonListener();
            });

            $j('#caap_ArenaNow', caap.caapDivObject).click(function() {
                caap.getArenaButtonListener();
            });
            $j('#caap_ResetMenuLocation', caap.caapDivObject).click(caap.resetMenuLocationListener);

            $j('#caapRestart', caap.caapDivObject).click(caap.restartListener);

            $j('#caap_playbutton', caap.caapPlayButtonDiv).on('click', caap.restartListener);

            $j('#caap_control', caap.caapDivObject).mousedown(caap.pauseListener);

            $j('#caap_stopAutoQuest', caap.caapDivObject).click(function () {
                con.log(1, 'Change: setting stopAutoQuest and go to Manual');
                caap.manualAutoQuest();
            });

            return true;
        } catch (err) {
            con.error("ERROR in reBindCaapDiv: " + err.stack);
            return false;
        }
    };

    caap.addListeners = function () {
        try {
            if (caap.domain.which !== 3) {
                if (!caap.reBindCaapDiv()) {
                    throw "Unable to find div for caap_div";
                }

                $j(window).on('resize', caap.windowResizeListener);
            }

            if (caap.domain.which !== 0) {
                if (!$u.hasContent($j('#globalContainer'))) {
                    throw 'Global Container not found';
                }

                // Fires once when page loads
                $j(document).on('click', 'body a', caap.whatClickedURLListener);

                $j(document).on('click', 'body div>img.imgButton,a[href=""]>img.imgButton', caap.whatClickedimgButton);

                $j(document).on('click', '#globalContainer div[id*="friend_box_"]', caap.whatFriendBox);

                if ($u.mutationTypes.DOMSubtreeModified) {
                    con.log(3, "Bind sts onload");
                    $j(document).on('DOMSubtreeModified', '#globalContainer #gold_time_value', caap.goldTimeListener);
                    $j(document).on('DOMSubtreeModified', '#globalContainer #energy_current_value', caap.energyListener);
                    $j(document).on('DOMSubtreeModified', '#globalContainer #energy_time_value', caap.energyTimeListener);
                    $j(document).on('DOMSubtreeModified', '#globalContainer #stamina_current_value', caap.staminaListener);
                    $j(document).on('DOMSubtreeModified', '#globalContainer #stamina_time_value', caap.staminaTimeListener);
                    $j(document).on('DOMSubtreeModified', '#globalContainer #health_current_value', caap.healthListener);
                    $j(document).on('DOMSubtreeModified', '#globalContainer #health_time_value', caap.healthTimeListener);
                }

                $j(document).on('DOMNodeInserted', '#globalContainer', function (event) {
                    var tId = $u.hasContent(event.target.id) ? event.target.id.replace('app46755028429_', '') : event.target.id,
                        page = $j('#globalContainer .game').eq(0).attr("id"),
                        caap_topXY;

                    // Uncomment this to see the id of domNodes that are inserted
                    /*
                    if (event.target.id && !event.target.id.match(/globalContainer/) && !event.target.id.match(/time/i) && !event.target.id.match(/ticker/i) && !event.target.id.match(/caap/i)) {
                    caap.setDivContent('debug2_mess', tId);
                    alert(event.target.id);
                    }
                    */

                    if (tId === page) {
                        session.setItem('page', page);
                        con.log(3, "DOM load target matched", tId, page);
                        caap.clearDomWaiting();
                        caap.incrementPageLoadCounter();
                        if (caap.domain.which === 3) {
                            if (config.getItem('scrollToTop', false)) {
                                caap.messaging.scrollToTop();
                            }
                        }

                        session.setItem("delayMain", true);
                        window.setTimeout(function () {
                            caap.checkResultsTop();
                            session.setItem("delayMain", false);
                        }, 1500);
                    }

                    // Reposition the dashboard
                    if (event.target.id === caap.dashboardXY.selector.replace("#", '')) {
                        caap_topXY = caap.getDashboardXY();
                        caap.caapTopObject.css('left', caap_topXY.x + 'px');
                        caap.caapTopMinObject.css('left', caap_topXY.x + 'px');
                    }
                });
            }

            return true;
        } catch (err) {
            con.error("ERROR in addListeners: " + err.stack);
            return false;
        }
    };

    /////////////////////////////////////////////////////////////////////
    //                          CHECK RESULTS
    // Called each iteration of main loop, this does passive checks for
    // results to update other functions.
    /////////////////////////////////////////////////////////////////////

    caap.pageList = {
        'castle_age': {
            signaturePic: 'choose_demi.jpg'
        },
        'castle': {
            signaturePic: 'choose_demi.jpg'
        },
        'castle_ws': {
            signaturePic: 'choose_demi.jpg'
        },
        'index': {
            signaturePic: 'choose_demi.jpg'
        },
        'battle_monster': {
            signaturePic: 'tab_monster_active.gif'
        },
        'guildv2_battle_monster': {
            signaturePic: 'tab_monster_active.gif'
        },
        'battle_expansion_monster': {
            signaturePic: 'tab_monster_active.gif'
        },
        'player_monster_list': {
            signaturePic: 'tab_monster_list_on.gif'
        },
        'public_monster_list': {
            signaturePic: 'monster_button_pubmonster_on.jpg'
		},
        'raid': {
            signaturePic: 'battle_tab_raid_on.jpg'
        },
        'land': {
            signaturePic: 'fb_tab_land_on.jpg',
            CheckResultsFunction: 'checkResults_land'
        },
        'territory': {
            signaturePic: 'fbland_top.jpg'
        },
        'generals': {
            signaturePic: 'tab_generals_on.gif'
        },
        'quests': {
            signaturePic: 'tab_quest_on.gif',
            CheckResultsFunction: 'checkResults_quests',
            subpages: ['earlyQuest']
        },
        'earlyQuest': {
            signaturePic: 'quest_back_1.jpg',
            CheckResultsFunction: 'checkResults_quests'
        },
        'symbolquests': {
            signaturePic: 'demi_quest_on.gif',
            CheckResultsFunction: 'checkResults_quests'
        },
        'monster_quests': {
            signaturePic: 'tab_atlantis_on.gif',
            CheckResultsFunction: 'checkResults_quests'
        },
        'gift_accept': {
            signaturePic: 'gif'
        },
        'army': {
            signaturePic: 'invite_on.gif',
            CheckResultsFunction: 'checkResults_army'
        },
        'keep': {
            signaturePic: 'tab_stats_on.gif'
        },
        'oracle': {
            signaturePic: 'oracle_on.gif'
        },
        'alchemy': {
            signaturePic: 'tab_alchemy_on.gif'
        },
        'battlerank': {
            signaturePic: 'tab_battle_rank_on.gif'
        },
        'war_rank': {
            signaturePic: 'tab_war_on.gif'
        },
        'conquest_battlerank': {
            signaturePic: 'conqrank_on2.jpg'
        },
        'achievements': {
            signaturePic: 'tab_achievements_on.gif'
        },
        'battle': {
            signaturePic: 'battle_tab_battle_on.jpg'
        },
        'soldiers': {
            signaturePic: 'fb_tab_soldiers_on.jpg'
        },
        'item': {
            signaturePic: 'fb_tab_smith_on.jpg'
        },
        'magic': {
            signaturePic: 'fb_tab_magic_on.jpg'
        },
        'gift': {
            signaturePic: 'tab_gifts_on.gif'
        },
        'goblin_emp': {
            signaturePic: 'emporium_cancel.gif'
        },
        'view_class_progress': {
            signatureId: 'choose_class_screen',
            //signaturePic: 'tab_monster_class_on.gif',
            CheckResultsFunction: 'checkResults_view_class_progress'
        },
        'expansion_monster_class_choose': {
            signaturePic: 'nm_class_header.jpg',
            CheckResultsFunction: 'checkResults_view_class_progress'
        },
        'monster_class_choose': {
            signaturePic: 'nm_class_header.jpg',
            CheckResultsFunction: 'checkResults_view_class_progress'
        },
        'guildv2_home': {
            signaturePic: 'tab_guild_main_on.jpg',
            CheckResultsFunction: 'checkResults_guild'
        },
        'guildv2_monster_summon_list': {
            signaturePic: 'tab_guild_main_on.jpg'
        },
        'guildv2_current_monster_battles': {
            signaturePic: 'tab_guild_main_on.jpg'
        },
        /* some of these older pages can be cleaned up. */
        'guild_current_monster_battles': {
            signaturePic: 'guild_monster_tab_on.jpg'
        },
        'guild_monster_summon_list': {
            signaturePic: 'guild_summon_monster_button_on.jpg'
        },
        'guild_battle_monster': {
            signatureId: 'guild_battle_banner_section'
        },
        'guildv2_battle': {
            signaturePic: 'guild_battle_top.jpg'
        },
        'tenxten_gb_formation': {
            signaturePic: 'fb_guild_btn_10_on.jpg'
        },
        'ten_battle': {
            signaturePic: 'guild_battle_top.jpg'
        },
        'guild_battle': {
            signaturePic: 'guild_battle_banner.jpg'
        },
        'item_archive_bonus': {
            signaturePic: 'archive_icon_ravager.jpg',
            CheckResultsFunction: 'timerArchives'
        },
        'army_member': {
            signaturePic: 'view_army_on.gif',
            CheckResultsFunction: 'checkResults_army_member'
        },
        'festival_challenge': {
            signaturePic: 'festival_rankbarslider.gif',
            CheckResultsFunction: 'festivalBlessResults'
        },
        'hundred_battle': {
            signaturePic: 'fb_guild_btn_100_off.jpg'
        },
        'hundred_battle_view': {
            signaturePic: 'guild_battle_banner.jpg'
        },
        'army_news_feed': {
            signatureId: 'army_feed_body',
            CheckResultsFunction: 'checkResults_army_news_feed'
        },
        'festival_duel_home': {
            signaturePic: 'festival_duelchamp_enter.gif'
        },
        'guild_panel': {
            signaturePic: 'tab_guild_management_on.gif',
            CheckResultsFunction: 'checkResults_guild_panel'
        },
        'guild_shop': {
            signaturePic: 'generic_hero_deianira.gif',
            CheckResultsFunction: 'checkResults_guild_shop'
        },
        'guild_class': {
            signatureId: 'class_help',
            CheckResultsFunction: 'checkResults_guild_class'
        },
        'guild_formation': {
            signatureId: 'gout_2_',
            CheckResultsFunction: 'checkResults_guild_formation'
        },
        'guildv2_conquest_command': {
            signaturePic: 'conq2_mistnav_on3.gif'
        },
        'guildv2_conquest_castle': { 
            signatureId: 'conq2_castle_body.jpg'
        },
        'guild_conquest_castle': { 
            signatureId: 'conq2_capsule_loe.jpg'
        },
        'guildv2_conquest_expansion': { 
            signatureId: 'conq2_castle_battletopwar.jpg'
        },
        'guildv2_conquest_expansion_fort': {
            signatureId: 'war_fort_topinfo.jpg'
        },
        'guildv2_conquest_expansion_demi': {
            signatureId: 'war_fort_topinfo.jpg'
        },
        'conquest_duel': {
            signatureId: 'war_conquest_header2.jpg'
        },
        'trade_market': {
            signatureId: 'trade_home_top.jpg'
        },
        'guild_conquest_market': {
            signatureId: 'trade_guild_top.jpg'
        },
        'arena' : {
            signatureId : 'arena9_homemid.jpg',
            CheckResultsFunction : 'checkResults_arenaBattle'
        },
        'player_loadouts' : {
            signatureId : 'load_top2.jpg'
        }
    };

    caap.checkResultsTop = function () {
        try {
		
            con.log(4, 'caap.checkResultsTop');
            // Check page to see if we should go to a page specific check function
			
            caap.resultsText = $u.setContent($j("#app_body #results_main_wrapper").text(), '').trim().innerTrim();

            if (!session.setItem("pageLoadOK", statsFunc.check())) {
                return true;
            }

            if (config.getItem("enableTitles", true)) {
                spreadsheet.doTitles();
            }

            var pageUrl = session.getItem('clickUrl', ''),
                page2 = $u.setContent(pageUrl, 'none').basename(".php"),
                page = session.getItem('page', ''),
                it = 0,
                len = 0,
                AFrecentAction = localStorage.AFrecentAction;

            page = $u.setContent(page, page2);

            if (AFrecentAction === undefined) {
                localStorage.AFrecentAction = true;
                AFrecentAction = true;
            }

            if ((monster.records.length === 0) && ((AFrecentAction === true))) {
                monster.select(true);
            }

			// why? because we need to make sure things like highlight users damage and
			// joinability are called in both and we update % bar values correctly when
			// we are using the new whatclickedimgButton listener
			// Also detect when there is an actual page match that is incorrect
            if (page !== page2) {
                if ((page === 'onBattle' && page2 !== 'battle_monster') || (page === 'onRaid' && page2 === 'raid')) {
                    con.warn("page and page2 differ", page, page2, pageUrl);
                } else {
                    con.log(2, "page and page2 differ", page, page2, pageUrl);
                }
            } else {
                con.log(2, "Page and page2", page, page2, pageUrl);
            }

            session.setItem('pageUserCheck', page === 'keep' ? $u.setContent(pageUrl.regex(/user=(\d+)/), 0) : 0);
            if ($u.hasContent(page) && $u.hasContent(caap.pageList[page]) && $u.hasContent(caap.pageList[page].subpages)) {
                for (it = 0, len = caap.pageList[page].subpages.length; it < len; it += 1) {
                    if ($u.hasContent($j("#app_body img[src*='" + caap.pageList[caap.pageList[page].subpages[it]].signaturePic + "']"))) {
                        page = caap.pageList[page].subpages[it];
                        break;
                    }
                }
            }
            
            session.setItem('page', page);
			caap.page = page;
			caap.clickUrl = pageUrl;
			worker.list.forEach(worker.checkResults);
			
            if ($u.hasContent(caap.pageList[page])) {
                con.log(3, 'caap.checkResultsTop caap.resultsText', caap.resultsText);
                if ($u.hasContent(caap.pageList[page].CheckResultsFunction)) {
					if ($u.isFunction(caap[caap.pageList[page].CheckResultsFunction])) {
						con.log(3, 'Calling function', caap.pageList[page].CheckResultsFunction);
						caap[caap.pageList[page].CheckResultsFunction]();
					} else {
						con.warn('Check Results function not found ' + caap.pageList[page].CheckResultsFunction);
					}
				}
            }

			worker.list.forEach(worker.checkSave);
			
            // Information updates
            caap.updateDashboard();
            caap.setNextLevelMessage();
            caap.setDivContent('demipoint_mess', !battle.demisPointsToDo('set') ? 'Daily Demi Points: off' : battle.demisPointsToDo('left') ? 'Daily Demi Points in progress' : 'Daily Demi Points done');
            caap.setDivContent('feats_mess', schedule.check('festivalBlessTimer') ? 'Feat = none' : 'Next Feat: ' + $u.setContent(caap.displayTime('festivalBlessTimer'), "Unknown"));

            return true;
        } catch (err) {
            con.error("ERROR in checkResults: " + err.stack);
            return false;
        }
    };

    caap.setNextLevelMessage = function () {
        if (config.getItem('NextLevelInDays', false)
        && (config.getItem('NextLevelThreshold', 5) * 24) < stats.indicators.hrtl) {
            caap.setDivContent('level_mess', 'Expected next level: +' + (Math.floor(stats.indicators.hrtl / 24 * 10) / 10) + ' days');
        } else {
            caap.setDivContent('level_mess', 'Expected next level: ' + $u.makeTime(stats.indicators.enl, caap.timeStr(true)));
        }
        return;
    };

    caap.checkResults_loadouts = function() {
        general.checkResults_loadouts();
    };

    // text in the format '123/234'
	// Two ways to use -- if a record is passed, that record will be updated with num and max
	// Otherwise, num and max and dif will be returned.
	// Different uses are based on fact that more complex records would only want num/max
	// updated. Dif should be calculated as needed. For simple records with no other values
	// than num, max, dif, use the return approach
	
	caap.weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	
	caap.gameDay = function(offsetSeconds, time) {
		time = new Date($u.setContent(time, Date.now()));
		offsetSeconds = $u.setContent(offsetSeconds, 0); 				// Need to adjust from 7 to 8 when daylight savings time changes
		return caap.weekdays[new Date(time.getTime() + ((time.getTimezoneOffset() / 60 - 7) * 3600 + offsetSeconds) * 1000).getDay()];
	};
	
    caap.getStatusNumbers = function (text, record) {
        try {
            if (!$u.isString(text) || !/\d+\/\d+/.test(text)) {
                throw "Invalid text supplied:" + text;
            }
			
			if ($u.isObject(record)) {
                record.num = text.regex(/(\d+)\//);
                record.max = text.regex(/\/(\d+)/);
			}

            return {
                'num': text.regex(/(\d+)\//),
                'max': text.regex(/\/(\d+)/),
                'dif': text.regex(/\/(\d+)/) - text.regex(/(\d+)\//)
            };
        } catch (err) {
            con.error("ERROR in getStatusNumbers: " + err, text, record);
            return undefined;
        }
    };

    caap.checkResults_oracle = function () {
        try {
            var text = '',
                tNum = 0,
                tDiv,
                lDiv;

            if (config.getItem("enableOracleMod", true)) {
                tDiv = $j("#app_body #results_container").parent().children().eq(6);
                if ($u.hasContent(tDiv)) {
                    lDiv = $j("#app_body .limitedDiv_int");
                    if ($u.hasContent(lDiv) && lDiv.length === 4) {
                        text = '<form><select><option value="#">Change General</option>';
                        for (tNum = 0; tNum < offline.bga.length; tNum += 1) {
                            text += '<option value="' + tNum + '">' + offline.bga[tNum].n + '</option>';
                        }

                        text += '</select></form>';
                        tDiv.html(text);
                        tDiv.children("form").on('change', function (event) {
                            var v = event.target.value,
                                it = 0;

                            function change(t, i, n, a, d, b, o, p) {
                                o = lDiv.eq(o).children();
                                o.eq(1).children().eq(0).html('Summon<br>' + ["General", "Magic", "Amulet", "Weapon", "Shield", "Helmet", "Armor", "Glove", "Off-hand", "Spell"][t] + '<br>');
                                o.eq(2).children().eq(0).attr({
                                    'src': o.eq(2).children().eq(0).attr('src').dirname() + p + '.jpg',
                                    'alt': n,
                                    'title': i
                                });

                                o.eq(3).children().eq(0).html(n + '!');
                                o.eq(4).children().eq(0).children(0).text(a + ' Attack');
                                o.eq(4).children().eq(1).children(0).text(d + ' Defense');
                                o.eq(5).children().eq(0).attr('id', 'favorBuy_' + b);
                                $j("input[name='buychoice']", o).val(b);
                            }

                            if (v !== "#") {
                                change(0, offline.bga[v].i, offline.bga[v].n, offline.bga[v].a, offline.bga[v].d, offline.bga[v].b, 0, offline.bga[v].p);
                                for (it = 0; it < 3; it += 1) {
                                    change(offline.bga[v].e[it].t, offline.bga[v].e[it].i, offline.bga[v].e[it].n, offline.bga[v].e[it].a, offline.bga[v].e[it].d, offline.bga[v].e[it].b, 1 + it, offline.bga[v].e[it].p);
                                }
                            }
                        });
                    } else {
                        con.warn('limitedDiv_int not found.');
                    }
                } else {
                    con.warn('results_container not found.');
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in checkResults_oracle: " + err.stack);
            return false;
        }
    };

    caap.checkResults_alchemy = function () {
        try {
            var recipeDiv = $j("#app_body .alchemyRecipeBack .recipeTitle"),
                titleTxt = '',
                titleRegExp = new RegExp("RECIPES: Create (.+)", "i"),
                image = '',
                hideCount = config.getItem("recipeCleanCount", 1);
                /*
                special = [
                        "Volcanic Knight",
                        "Holy Plate",
                        "Atlantean Forcefield",
                        "Spartan Phalanx",
                        "Cronus, The World Hydra",
                        "Helm of Dragon Power",
                        "Avenger",
                        "Judgement",
                        "Tempered Steel",
                        "Bahamut, the Volcanic Dragon",
                        "Blood Zealot",
                        "Transcendence",
                        "Soul Crusher",
                        "Soulforge",
                        "Crown of Flames"
                    ];
                */

            hideCount = hideCount < 1 ? 1 : hideCount;
            if ($u.hasContent(recipeDiv)) {
                recipeDiv.each(function () {
                    var row = $j(this);
                    titleTxt = row.text().trim().innerTrim().regex(titleRegExp);
                    if ($u.hasContent(titleTxt)) {
                        if (titleTxt === "Elven Crown") {
                            image = "gift_aeris_complete.jpg";
                        }

                        if (spreadsheet.isSummon(titleTxt, image)) {
                            row.text(row.text().trim() + ' : Summon Owned (' + town.getCount(image) + ')');
                        } else {
                            row.text(row.text().trim() + ' : Owned (' + town.getCount(image) + ')');
                            /*
                            if (config.getItem("enableRecipeClean", true) && !special.hasIndexOf(titleTxt) && town.getCount(image) >= hideCount) {
                                row.parent().parent().hide().next().hide();
                            }
                            */
                        }
                    }

                    return true;
                });
            }

            /*
            if (config.getItem("enableIngredientsHide", false)) {
                $j("#app_body div[class='statsTTitle'],div[class='statsTMain']").hide();
            }
            */

            /*
            if (config.getItem("enableAlchemyShrink", true)) {
                $j("#app_body div[class*='alchemyRecipeBack'],div[class*='alchemyQuestBack']").css("height", "100px");
                $j("#app_body div[class*='alchemySpace']").css("height", "4px");
                $j("#app_body .statsT2 img").not("img[src*='emporium_go.gif']").attr("style", "height: 45px, width: 45px;").parent().attr("style", "height: 45px, width: 45px;").parent().css("width", "50px");
                $j("#app_body input[name='Alchemy Submit']").css("width", "80px");
                $j("#app_body .recipeTitle").css("margin", "0px");
            }
            */

            return true;
        } catch (err) {
            con.error("ERROR in checkResults_alchemy: " + err.stack);
            return false;
        }
    };

    caap.checkResults_view_class_progress = function () {
        try {
            var classDiv = $j("#app_body #choose_class_screen div[class*='banner_']");

            if ($u.hasContent(classDiv)) {
                stats.character = {};
                classDiv.each(function () {
                    var monsterClass = $j(this),
                        name = $u.setContent(monsterClass.attr("class"), '').replace("banner_", '').ucFirst();

                    if (name) {
                        stats.character[name] = {};
                        stats.character[name].percent = $u.setContent($j("[style*='%']:first", monsterClass).getPercent('width').dp(2), 0);
                        stats.character[name].level = $u.setContent(monsterClass.children().eq(2).text().numberOnly(), 0);
                        con.log(2, "Got character class record", name, stats.character[name]);
                        statsFunc.setRecord(stats);
                    } else {
                        con.warn("Problem character class name", name);
                    }

                    monsterClass = null;
                });
            } else {
                con.warn("Problem with character class records", classDiv);
            }

            classDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_view_class_progress: " + err.stack);
            return false;
        }
    };

    /////////////////////////////////////////////////////////////////////
    //                          QUESTING
    // Quest function does action, DrawQuest sets up the page and gathers info
    /////////////////////////////////////////////////////////////////////

    // Returns the least value of the stat for the configured generals/loadouts minus a small buffer
    caap.maxStatCheck = function(stat) {
        try {
            return stats[stat].min + stats[stat].norm - (caap.hyper ? 12 : 3);
        } catch (err) {
            con.error("ERROR in maxStatCheck: " + err.stack);
        }
    };

	worker.addAction({worker : 'caap', priority : 1700, description : 'Checking Max Stats', functionName : 'maxStatsCheck'});
	
    caap.maxStatsCheck = function() {
		try {
			stats.priorityGeneral = 'Use Current';
			var result = ['stamina', 'energy'].some( function(stat) {
				if (!$u.isNumber(stats[stat].norm) || stats[stat].norm === 0) {
					caap.navigateTo('keep');
					con.log(2, 'Visiting keep to find base stat ' + stat + ' unaltered by general');
					return true;
				}
			});

			if (result) {
				return true;
			}

			return stats.energy.num >= caap.maxStatCheck('energy') ? caap.quests() : false;
        } catch (err) {
            con.error("ERROR in maxStatsCheck: " + err.stack);
            return undefined;
        }
    };

    caap.questAreaInfo = {
        'Land of Fire': {
            clas: 'quests_stage_1',
            base: 'land_fire',
            next: 'Land of Earth',
            area: '',
            list: '',
            boss: 'Heart of Fire',
            orb: 'Orb of Gildamesh'
        },
        'Land of Earth': {
            clas: 'quests_stage_2',
            base: 'land_earth',
            next: 'Land of Mist',
            area: '',
            list: '',
            boss: 'Gift of Earth',
            orb: 'Colossal Orb'
        },
        'Land of Mist': {
            clas: 'quests_stage_3',
            base: 'land_mist',
            next: 'Land of Water',
            area: '',
            list: '',
            boss: 'Eye of the Storm',
            orb: 'Sylvanas Orb'
        },
        'Land of Water': {
            clas: 'quests_stage_4',
            base: 'land_water',
            next: 'Demon Realm',
            area: '',
            list: '',
            boss: 'A Look into the Darkness',		// mission name where boss is found, not name of boss
            orb: 'Orb of Mephistopheles'
        },
        'Demon Realm': {
            clas: 'quests_stage_5',
            base: 'land_demon_realm',
            next: 'Undead Realm',
            area: '',
            list: '',
            boss: 'The Rift',						// mission name where boss is found, not name of boss
            orb: 'Orb of Keira'
        },
        'Undead Realm': {
            clas: 'quests_stage_6',
            base: 'land_undead_realm',
            next: 'Underworld',
            area: '',
            list: '',
            boss: 'Undead Embrace',					// mission name where boss is found, not name of boss
            orb: 'Lotus Orb'
        },
        'Underworld': {
            clas: 'quests_stage_7',
            base: 'tab_underworld',
            next: 'Kingdom of Heaven',
            area: '',
            list: '',
            boss: 'Confrontation',					// mission name where boss is found, not name of boss
            orb: 'Orb of Skaar Deathrune'
        },
        'Kingdom of Heaven': {
            clas: 'quests_stage_8',
            base: 'tab_heaven',
            next: 'Ivory City',
            area: '',
            list: '',
            boss: 'Archangels Wrath',				// mission name where boss is found, not name of boss
            orb: 'Orb of Azriel'
        },
        'Ivory City': {
            clas: 'quests_stage_9',
            base: 'tab_ivory',
            next: 'Earth II',
            area: '',
            list: '',
            boss: 'Entrance to the Throne',			// mission name where boss is found, not name of boss
            orb: 'Orb of Alpha Mephistopheles'
        },
        'Earth II': {
            clas: 'quests_stage_10',
            base: 'tab_earth2',
            next: 'Water II',
            area: '',
            list: '',
            boss: 'The Rebel Leader',				// mission name where boss is found, not name of boss
            orb: 'Orb of Aurelius'
        },
        'Water II': {
            clas: 'quests_stage_11',
            base: 'tab_water2',
            next: 'Mist II',
            area: '',
            list: '',
            boss: 'The Demi-God',					// mission name where boss is found, not name of boss
            orb: 'Orb of Corvintheus'
        },
        'Mist II': {
            clas: 'quests_stage_12',
            base: 'tab_mist2',
            next: 'Mist III',
            area: '',
            list: '',
            boss: 'The Source',						// mission name where boss is found, not name of boss
            orb: 'Orb of Jahanna'
        },
        'Mist III': {
            clas: 'quests_stage_13',
            base: 'tab_mist3',
            next: 'Fire II',
            area: '',
            list: '',
            boss: 'Aurora, the Life Demi-Goddess',	// mission name where boss is found, not name of boss
            orb: 'Orb of Aurora'
        },
        'Fire II': {
            clas: 'quests_stage_14',
            base: 'tab_fire2',
            next: 'Pangaea',
            area: '',
            list: '',
            boss: 'A Mighty Figure',				// mission name where boss is found, not name of boss
            orb: 'Orb of Ambrosia'
        },
        'Pangaea': {
            clas: 'quests_stage_15',
            base: 'tab_pangaea',
            next: 'Perdition',
            area: '',
            list: '',
            boss: 'Face Off',						// mission name where boss is found, not name of boss
            orb: 'Orb of Malekus'
        },
        'Perdition': {
            clas: 'quests_stage_16',
            base: 'tab_perdition',
            next: 'Land of Fire III',
            area: '',
            list: '',
            boss: 'Redemption',						// mission name where boss is found, not name of boss
            orb: 'Orb of Azeron'
        },
        'Land of Fire III': {
            clas: 'quests_stage_17',
            base: 'tab_fire4',
            next: 'Land of Earth III',
            area: '',
            list: '',
            boss: 'The Great Phoenix',				// mission name where boss is found, not name of boss
            orb: 'Orb of Fenix'
        },
        'Land of Earth III': {
            clas: 'quests_stage_18',
            base: 'tab_earth3',
            next: 'Land of Mist IV',
            area: '',
            list: '',
            boss: 'Wrath of Urmek',					// mission name where boss is found, not name of boss
            orb: 'Orb of Urmek'
        },
        'Land of Mist IV': {
            clas: 'quests_stage_19',
            base: 'tab_mist4',
            next: 'Land of Water III',
            area: '',
            list: '',
            boss: 'Devourer of the Skies',			// mission name where boss is found, not name of boss
            orb: 'Orb of Vorak'
        },
        'Land of Water III': {
            clas: 'quests_stage_20',
            base: 'tab_water3',
            next: 'Undead II',
            area: '',
            list: '',
            boss: 'Baal, Stealer of Souls',			// mission name where boss is found, not name of boss
            orb: 'Orb of Baal'
        },
        'Undead II': {
            clas: 'quests_stage_21',
            base: 'tab_undead2',
            next: 'Outer Realms',
            area: '',
            list: '',
            boss: 'Aspect of Death',				// mission name where boss is found, not name of boss
            orb: 'Orb of Death'
        },
        'Outer Realms': {
            clas: 'quests_stage_22',
            base: 'tab_outer',
            next: 'DemiChange',
            area: '',
            list: '',
            boss: 'Medusas Throne',					// mission name where boss is found, not name of boss
            orb: 'Orb of Cassandra'
        },

        'DemiChange': {
            clas: 'symbolquests_stage_1',
            next: 'Ambrosia',
            area: 'Demi Quests',
            list: 'demiQuestList'
        },
        'Ambrosia': {
            clas: 'symbolquests_stage_1',
            next: 'Malekus',
            area: '',
            list: ''
        },
        'Malekus': {
            clas: 'symbolquests_stage_2',
            next: 'Corvintheus',
            area: '',
            list: ''
        },
        'Corvintheus': {
            clas: 'symbolquests_stage_3',
            next: 'Aurora',
            area: '',
            list: ''
        },
        'Aurora': {
            clas: 'symbolquests_stage_4',
            next: 'Azeron',
            area: '',
            list: ''
        },
        'Azeron': {
            clas: 'symbolquests_stage_5',
            next: 'AtlantisChange',
            area: '',
            list: ''
        },

        'AtlantisChange': {
            clas: 'monster_quests_stage_1',
            next: 'Atlantis',
            area: 'Atlantis',
            list: 'atlantisQuestList'
        },
        'Atlantis': {
            clas: 'monster_quests_stage_1',
            base: 'land_atlantis',
            next: 'Atlantis II',
            area: 'Atlantis',
            list: ''
        },
        'Atlantis II': {
            clas: 'monster_quests_stage_2',
            base: 'land_atlantis_2',
            next: 'Atlantis III',
            area: 'Atlantis',
            list: ''
        },
        'Atlantis III': {
            clas: 'monster_quests_stage_3',
            base: 'tab_atlantis3',
            next: '',
            area: 'Atlantis',
            list: '',
            boss: 'Poseidon',
            orb: 'Orb of Poseidon'
        }
    };

    caap.demiQuestTable = {
        'Ambrosia': 'energy',
        'Malekus': 'attack',
        'Corvintheus': 'defense',
        'Aurora': 'health',
        'Azeron': 'stamina'
    };

    caap.isExcavationQuest = {
        'Cave of Wonder': true,
        'Rune Mines': true,
        'Nether Vortex': true,
        // Atlantis II
        'Entrance': true,
        'Fortress': true,
        'Path': true,
        'Town': true,
        'Underwater': true
    };

    caap.qtom = null;

	worker.addAction({worker : 'caap', priority : 600, description : 'Questing', functionName : 'quests'});
	
    caap.quests = function () {
        try {
            var storeRetrieve = state.getItem('storeRetrieve', ''),
                whenQuest,
                fortMon,
                maxHealthtoQuest,
                targetFrombattle_monster,
                currentMonster,
                energyCheck,
                pathToPage,
                imageOnPage,
                subQArea,
                landPic,
                subDQArea,
                deityN = caap.deityTable[caap.demiQuestTable[subDQArea]],
                picSlice,
                descSlice,
                bDiv,
                bDisp,
                button,
				result,
                itemBuyPopUp,
                costToBuy,
				qO = state.getItem('AutoQuest', caap.newAutoQuest()),
                autoQuestDivs,
                background;

            caap.qtom = window.setTimeout(function () {
                caap.setDivContent('quest_mess', '');
            }, 1000);

            whenQuest = config.getItem('WhenQuest', 'Never');

            if (whenQuest === 'Never') {
                caap.setDivContent('quest_mess', '');
                window.clearTimeout(caap.qtom);
                return false;
            }

            if (whenQuest === 'Not Fortifying' || (config.getItem('PrioritiseMonsterAfterLvl', false) && state.getItem('KeepLevelUpGeneral', false))) {
                fortMon = state.getItem('targetFromfortify', new monster.energyTarget().data);
                if ($j.isPlainObject(fortMon) && fortMon.md5 && fortMon.type) {
                    switch (fortMon.type) {
                        case "Fortify":
                            maxHealthtoQuest = config.getItem('MaxHealthtoQuest', 0);

                            if (!maxHealthtoQuest) {
                                caap.setDivContent('quest_mess', '<span style="font-weight: bold;">No valid over fortify %</span>');
                                window.clearTimeout(caap.qtom);
                                return false;
                            }

                            caap.setDivContent('quest_mess', 'No questing until attack target ' + fortMon.name + " health exceeds " + config.getItem('MaxToFortify', 0) + '%');
                            window.clearTimeout(caap.qtom);

                            targetFrombattle_monster = state.getItem('targetFrombattle_monster', '');

                            // this looks like a bug and needs testing if (!targetFrombattle_monster) {
                            if (!targetFrombattle_monster) {
                                currentMonster = monster.getItem(targetFrombattle_monster);
                                if (!currentMonster.fortify) {
                                    if (currentMonster.fortify < maxHealthtoQuest) {
                                        caap.setDivContent('quest_mess', 'No questing until fortify target ' + currentMonster.name + ' health exceeds ' + maxHealthtoQuest + '%');
                                        window.clearTimeout(caap.qtom);
                                        return false;
                                    }
                                }
                            }

                            break;
                        case "Strengthen":
                            caap.setDivContent('quest_mess', 'No questing until attack target ' + fortMon.name + " at full strength.");
                            window.clearTimeout(caap.qtom);

                            break;
                        case "Stun":
                            caap.setDivContent('quest_mess', 'No questing until attack target ' + fortMon.name + " stunned.");
                            window.clearTimeout(caap.qtom);

                            break;
                        default:
							break;
                    }

                    return false;
                }
            }
			
			result = conquest.engineer();
			if (caap.passThrough(result)) {
				return result;
			}

            if (!qO.name) {
                if (config.getItem('WhyQuest', 'Manual') === 'Manual') {
                    caap.setDivContent('quest_mess', 'Pick quest manually.');
                    window.clearTimeout(caap.qtom);
                    return false;
                }

                caap.setDivContent('quest_mess', 'Searching for quest.');
                window.clearTimeout(caap.qtom);
                con.log(1, "Searching for quest");
            } else {
                energyCheck = caap.checkEnergy('Quest', whenQuest, qO.energy);
                if (!energyCheck) {
                    return false;
                }
            }

			// Set general
            if (storeRetrieve) {
                if (storeRetrieve === 'general') {
                    con.log(1, "storeRetrieve", storeRetrieve);
                    if (general.Select('BuyGeneral')) {
                        return true;
                    }
                } else if (chores.retrieveFromBank(storeRetrieve)) {
					con.log(1, 'Getting $' + storeRetrieve + ' from bank');
					return true;
				}
			} else if (general.Select('QuestGeneral:' + qO.experience)) {
				return {log: 'Setting quest general'};
            }

            pathToPage = 'quests';
            imageOnPage = 'quest_back_1.jpg';
            subQArea = 'Land of Fire';
            landPic = '';

            switch (config.getItem('QuestArea', 'Quest')) {
                case 'Quest':
                    if (stats.level > 7) {
                        subQArea = config.getItem('QuestSubArea', 'Land of Fire');
                        landPic = caap.questAreaInfo[subQArea].base;
                        if ($u.hasContent($j("img[src*='" + landPic + "_lock']"))) {
                            caap.checkResults_quests(true);
                        }

                        if ((landPic === 'tab_heaven' || config.getItem('GetOrbs', false)) && config.getItem('WhyQuest', 'Manual') !== 'Manual') {
                            if (chores.checkPages('magic')) {
                                return true;
                            }
                        }

                        pathToPage = 'quests,' + landPic;
                        imageOnPage = landPic;
                        switch (landPic) {
                            case 'tab_outer':
                                pathToPage += '_small.jpg';
                                imageOnPage += '_big.jpg';
                                break;
                            case 'tab_undead2':
                            case 'tab_water3':
                            case 'tab_mist4':
                            case 'tab_earth3':
                            case 'tab_fire4':
                            case 'tab_perdition':
                            case 'tab_pangaea':
                            case 'tab_fire2':
                            case 'tab_mist3':
                            case 'tab_mist2':
                            case 'tab_water2':
                            case 'tab_earth2':
                            case 'tab_ivory':
                            case 'tab_underworld':
                                pathToPage += '_small.gif';
                                imageOnPage += '_big.gif';
                                break;
                            case 'tab_heaven':
                                pathToPage += '_small2.gif';
                                imageOnPage += '_big2.gif';
                                break;
                            case 'land_undead_realm':
                            case 'land_demon_realm':
                                pathToPage += '.gif';
                                imageOnPage += '_sel.gif';
                                break;
                            default:
                                pathToPage = 'quests,jobs_tab_back.gif,' + landPic + '.gif';
                                imageOnPage += '_sel.gif';
                        }
                    }

                    if (caap.navigateTo(pathToPage, imageOnPage)) {
                        return true;
                    }

                    break;
                case 'Demi Quests':
                    if (caap.navigateTo('quests,symbolquests', 'demi_quest_on.gif')) {
                        return true;
                    }

                    subDQArea = config.getItem('QuestSubArea', 'Ambrosia');
                    deityN = caap.deityTable[caap.demiQuestTable[subDQArea]];
                    picSlice = $j('#globalContainer #symbol_image_symbolquests' + deityN);
                    descSlice = $j('#globalContainer #symbol_desc_symbolquests' + deityN);

                    if (!$u.hasContent(picSlice) || !$u.hasContent(descSlice)) {
                        con.warn('No diety image or description for', subDQArea);
                        return false;
                    }

                    if (descSlice.css('display') === 'none') {
                        return caap.navigateTo(picSlice.attr("src").basename());
                    }

                    break;
                case 'Atlantis':
                    if (stats.level > 7) {
                        subQArea = config.getItem('QuestSubArea', 'Atlantis');
                        landPic = caap.questAreaInfo[subQArea].base;
                        if ($u.hasContent($j("img[src*='" + landPic + "_lock']"))) {
                            caap.checkResults_quests(true);
                        }

                        pathToPage = 'quests,monster_quests,' + landPic;
                        imageOnPage = landPic;
                        switch (subQArea) {
                            case 'Atlantis':
                                pathToPage += '.gif';
                                imageOnPage += '_realm_sel.gif';
                                break;
                            case 'Atlantis II':
                                pathToPage += '_2.gif';
                                imageOnPage += '_realm_sel_2.gif';
                                break;
                            case 'Atlantis III':
                                pathToPage += '_small.gif';
                                imageOnPage += '_big.gif';
                                break;
                            default:
                                pathToPage += '_small.gif';
                                imageOnPage += '_big.gif';
                                break;
                        }
                    }

                    if (caap.navigateTo(pathToPage, imageOnPage)) {
                        return true;
                    }

                    break;
                default:
					break;
            }

            bDiv = $j('#globalContainer #single_popup');
            bDisp = $u.setContent(bDiv.css("display"), 'none');
            button = $j();

            // Buy quest requires popup
            itemBuyPopUp = $j('#globalContainer form[id*="itemBuy"]');
            costToBuy = 0;

            if (bDisp !== 'none' && $u.hasContent(itemBuyPopUp)) {
                con.log(2, 'itemBuy');
                state.setItem('storeRetrieve', 'general');
                if (general.Select('BuyGeneral')) {
                    return true;
                }

                state.setItem('storeRetrieve', '');
                costToBuy = itemBuyPopUp.text().replace(new RegExp(".*\\$"), '').replace(new RegExp("[^\\d]{3,}.*"), '').parseInt();
                con.log(2, "costToBuy", costToBuy);
                if (stats.gold.cash < costToBuy) {
                    //Retrieving from Bank
                    if (stats.gold.cash + (stats.gold.bank - config.getItem('minInStore', 0)) >= costToBuy) {
                        con.log(1, "Trying to retrieve", costToBuy - stats.gold.cash);
                        state.setItem("storeRetrieve", costToBuy - stats.gold.cash);
                        return chores.retrieveFromBank(costToBuy - stats.gold.cash);
                    }

                    con.log(1, "Cant buy requires, stopping quest");
                    caap.manualAutoQuest();
                    return false;
                }

                button = caap.checkForImage('quick_buy_button.jpg', $j('#single_popup'));
                if ($u.hasContent(button)) {
                    con.log(1, 'Clicking on quick buy button.');
                    caap.click(button);
                    return true;
                }

                con.warn("Cant find buy button");
                return false;
            }

            button = caap.checkForImage('quick_buy_button.jpg');
            if (bDisp !== 'none' && $u.hasContent(button)) {
                con.log(2, 'quick_buy_button');
                state.setItem('storeRetrieve', 'general');
                if (general.Select('BuyGeneral')) {
                    return true;
                }

                state.setItem('storeRetrieve', '');
                costToBuy = $j("strong", button.parents("form").eq(0)).text().replace(new RegExp("[^0-9]", "g"), '');
                con.log(2, "costToBuy", costToBuy);
                if (stats.gold.cash < costToBuy) {
                    //Retrieving from Bank
                    if (stats.gold.cash + (stats.gold.bank - config.getItem('minInStore', 0)) >= costToBuy) {
                        con.log(1, "Trying to retrieve: ", costToBuy - stats.gold.cash);
                        state.setItem("storeRetrieve", costToBuy - stats.gold.cash);
                        return chores.retrieveFromBank(costToBuy - stats.gold.cash);
                    }

                    con.log(1, "Cant buy General, stopping quest");
                    caap.manualAutoQuest();
                    return false;
                }

                con.log(2, 'Clicking on quick buy general button.');
                caap.click(button);
                return true;
            }

            autoQuestDivs = {
                name: '',
                click: $j(),
                tr: $j(),
                genDiv: $j(),
                orbCheck: false
            };

            autoQuestDivs = caap.checkResults_quests(true);
            //con.log(1, 'autoQuestDivs/qO.name', autoQuestDivs, qO.name);
            if (!autoQuestDivs.name) {
                con.log(1, 'Could not find AutoQuest.');
                caap.setDivContent('quest_mess', 'Could not find AutoQuest.');
                window.clearTimeout(caap.qtom);
                return false;
            }

            if (autoQuestDivs.name !== qO.name) {
                con.log(1, 'New AutoQuest found.');
                caap.setDivContent('quest_mess', 'New AutoQuest found.');
                window.clearTimeout(caap.qtom);
                return true;
            }

            // if found missing requires, click to buy
            if ($u.hasContent(autoQuestDivs.tr)) {
                background = $j("div[style*='background-color']", autoQuestDivs.tr);
                if ($u.hasContent(background) && background.css("background-color") === 'rgb(158, 11, 15)') {
                    con.log(1, "Missing item");
                    if (config.getItem('QuestSubArea', 'Atlantis') === 'Atlantis') {
                        con.log(1, "Cant buy Atlantis items, stopping quest");
                        caap.manualAutoQuest();
                        return false;
                    }

                    con.log(2, "background.style.backgroundColor", background.css("background-color"));
                    state.setItem('storeRetrieve', 'general');
                    if (general.Select('BuyGeneral')) {
                        return true;
                    }

                    state.setItem('storeRetrieve', '');
                    con.log(2, "background.children().eq(0).children().eq(0).attr('title')", background.children().eq(0).children().eq(0).attr("title"));
                    if (background.children().eq(0).children().eq(0).attr("title")) {
                        con.log(2, "Clicking to buy", background.children().eq(0).children().eq(0).attr("title"));
                        caap.click(background.children().eq(0).children().eq(0));
                        return true;
                    }
                }
            } else {
                con.warn('Can not buy quest item');
                return false;
            }

            if ($u.hasContent(autoQuestDivs.click)) {
                con.log(2, 'Clicking auto quest', qO.name);
                session.setItem('ReleaseControl', true);
                caap.click(autoQuestDivs.click);
                caap.showAutoQuest();
                if (autoQuestDivs.orbCheck) {
                    schedule.setItem("magic", 0);
                }

                return true;
            }

            con.warn('Can not click auto quest', qO.name);
            return false;
        } catch (err) {
            con.error("ERROR in quests: " + err.stack);
            return false;
        }
    };

    caap.questName = null;

    caap.checkResults_symbolquests = function () {
        try {
            $j('#globalContainer div[id*="symbol_tab_symbolquests"]').off('click', caap.symbolquestsListener).on('click', caap.symbolquestsListener);
            $j('#globalContainer form[id*="symbols_form_"]').off('click', caap.symbolquestsClickListener).on('click', caap.symbolquestsClickListener);

            var demiDiv = $j('#globalContainer div[id*="symbol_desc_symbolquests"]'),
                points = [],
                success = true;

            if ($u.hasContent(demiDiv) && demiDiv.length === 5) {
                demiDiv.each(function () {
                    var num = $u.setContent($j(this).children().next().eq(1).children().children().next().text(), '').trim().innerTrim().regex(/(\d+)/);

                    if ($u.hasContent(num) && !$u.isNaN(num)) {
                        points.push(num);
                    } else {
                        success = false;
                        con.warn('Demi-Power text problem');
                    }
                });

                if (success) {
                    con.log(3, 'Demi-Power Points', points);
                    caap.demi.ambrosia.power.total = $u.setContent(points[0], 0);
                    caap.demi.malekus.power.total = $u.setContent(points[1], 0);
                    caap.demi.corvintheus.power.total = $u.setContent(points[2], 0);
                    caap.demi.aurora.power.total = $u.setContent(points[3], 0);
                    caap.demi.azeron.power.total = $u.setContent(points[4], 0);
                    schedule.setItem("symbolquests", (gm ? gm.getItem("checkSymbolQuests", 24, hiddenVar) : 24) * 3600, 300);
                    caap.SaveDemi();
                }
            } else {
                con.warn("Demi demiDiv problem", demiDiv);
            }

            return true;
        } catch (err) {
            con.error("ERROR in checkResults_symbolquests: " + err.stack);
            return false;
        }
    };

    caap.isBossQuest = function (name) {
        try {
            var qn = '',
                found = false;

            for (qn in caap.questAreaInfo) {
                if (caap.questAreaInfo.hasOwnProperty(qn)) {
                    if (caap.questAreaInfo[qn].boss && caap.questAreaInfo[qn].boss === name) {
                        found = true;
                        break;
                    }
                }
            }

            return found;
        } catch (err) {
            con.error("ERROR in isBossQuest: " + err.stack);
            return false;
        }
    };

    caap.symbolquestsListener = function (event) {
        con.log(2, "Clicked Demi Power image", event.target.parentNode.parentNode.parentNode.parentNode.id);
        caap.setDomWaiting("symbolquests.php");
        caap.clearDomWaiting();
        caap.checkResultsTop();
    };

    caap.symbolquestsClickListener = function (event) {
        con.log(2, "Clicked Demi Power blessing", event.target.parentNode.id);
        caap.setDomWaiting("symbolquests.php");
    };

    caap.checkResults_quests = function (pickQuestTF) {
        try {
            //con.log(1, "checkResults_quests pickQuestTF", pickQuestTF);
            pickQuestTF = pickQuestTF || false;
            if ($u.hasContent($j('#globalContainer #quest_map_container'))) {
                $j("#app_body div[id*='meta_quest_']").each(function () {
                    var row = $j(this);

                    if (!($u.hasContent($j("img[src*='_completed']", row)) || $u.hasContent($j("img[src*='_locked']", row)))) {
                        $j("#globalContainer div[id*='quest_wrapper_" + row.attr("id").replace("meta_quest_", '') + "']").show();
                    }

                    row = null;
                });
            }

            var bestReward = 0,
                rewardRatio = 0,
                div = $j(),
                ssDiv = $j(),
                whyQuest = config.getItem('WhyQuest', 'Manual'),
                haveOrb,
                isTheArea,
                questSubArea,
                autoQuestDivs,
                expRegExp,
                energyRegExp,
                moneyRegExp,
                money2RegExp,
                influenceRegExp,
                reward,
                energy,
                experience,
                divTxt,
                expM,
                tStr,
                idx,
                energyM,
                eObj,
                expObj,
                moneyM = [],
                rewardLow,
                rewardHigh,
                click,
                influence,
                influenceList,
                general,
                genDiv,
                questType,
                tempAutoQuest;

            if (pickQuestTF === true && whyQuest !== 'Manual') {
                state.setItem('AutoQuest', caap.newAutoQuest());
            }

            if (caap.hasImage('demi_quest_on.gif')) {
                caap.checkResults_symbolquests($u.isString(pickQuestTF) ? pickQuestTF : undefined);
                ssDiv = $j("#globalContainer div[id*='symbol_displaysymbolquest']");
                if (!$u.hasContent(ssDiv)) {
                    con.warn("Failed to find symbol_displaysymbolquest");
                }

                ssDiv.each(function () {
                    div = $j(this);
                    if (div.css("display") !== 'none') {
                        return false;
                    }

                    return true;
                });
            } else {
                div = $j("#globalContainer");
            }

            ssDiv = $j(".quests_background,.quests_background_sub", div);
            if (!$u.hasContent(ssDiv)) {
                con.warn("Failed to find quests_background");
                return false;
            }

            haveOrb = false;
            isTheArea = false;
            questSubArea = '';

            questSubArea = config.getItem('QuestSubArea', 'Land of Fire');
            isTheArea = caap.checkCurrentQuestArea(questSubArea);
            con.log(2, "Is quest area", questSubArea, isTheArea);
            if (isTheArea && whyQuest !== 'Manual' && config.getItem('GetOrbs', false)) {
                if ($u.hasContent($j("input[alt='Perform Alchemy']"))) {
                    haveOrb = true;
                } else {
                    if (questSubArea && caap.questAreaInfo[questSubArea].orb) {
                        haveOrb = town.records.getObjIndex('name', caap.questAreaInfo[questSubArea].orb) >= 0;
                    }
                }

                con.log(2, "Have Orb for", questSubArea, haveOrb);
                if (haveOrb && caap.isBossQuest(state.getItem('AutoQuest', caap.newAutoQuest()).name)) {
                    state.setItem('AutoQuest', caap.newAutoQuest());
                }
            }

            /*
             * This subroutine call added as a stop-gap measure to allow CAAP to perform auto-quests even
             * when CA developers omit or duplicate the names for either main quests or sub-quests.
             */
            caap.updateQuestNames(ssDiv);

            autoQuestDivs = {
                name: '',
                click: $j(),
                tr: $j(),
                genDiv: $j(),
                orbCheck: false
            };

            $j("#app_body .autoquest").remove();

            expRegExp = new RegExp("\\+(\\d+)");
            energyRegExp = new RegExp("(\\d+)\\s+energy", "i");
            moneyRegExp = new RegExp("\\$([0-9,]+)\\s*-\\s*\\$([0-9,]+)", "i");
            money2RegExp = new RegExp("\\$([0-9,]+)mil\\s*-\\s*\\$([0-9,]+)mil", "i");
            influenceRegExp = new RegExp("(\\d+)%");

            ssDiv.each(function () {
                div = $j(this);
                caap.questName = caap.getQuestName(div);
                if (!caap.questName) {
                    return true;
                }

                reward = null;
                energy = null;
                experience = null;
                divTxt = '';
                expM = [];
                tStr = '';

                divTxt = div.text().trim().innerTrim();
                expM = divTxt ? divTxt.match(expRegExp) : [];
                if (expM && expM.length === 2) {
                    experience = expM[1] ? expM[1].numberOnly() : 0;
                } else {
                    expObj = $j(".quest_experience", div);
                    if ($u.hasContent(expObj)) {
                        tStr = expObj.text();
                        experience = tStr ? tStr.numberOnly() : 0;
                    } else {
                        con.warn("Can't find experience for", caap.questName);
                    }
                }

                idx = caap.questName.indexOf('<br>');

                if (idx >= 0) {
                    caap.questName = caap.questName.substring(0, idx);
                }

                energyM = divTxt.match(energyRegExp);
                if (energyM && energyM.length === 2) {
                    energy = energyM[1] ? energyM[1].numberOnly() : 0;
                } else {
                    eObj = $j(".quest_req", div);
                    if ($u.hasContent(eObj)) {
                        energy = $j('b', eObj).eq(0).text().numberOnly();
                    }
                }

                if (!energy) {
                    con.warn("Can't find energy for", caap.questName);
                    return true;
                }

                moneyM = [];
                rewardLow = 0;
                rewardHigh = 0;

                moneyM = divTxt ? divTxt.stripHtmlJunk().match(moneyRegExp) : [];
                if (moneyM && moneyM.length === 3) {
                    rewardLow = moneyM[1] ? moneyM[1].numberOnly() : 0;
                    rewardHigh = moneyM[2] ? moneyM[2].numberOnly() : 0;
                    reward = (rewardLow + rewardHigh) / 2;
                } else {
                    moneyM = divTxt ? divTxt.stripHtmlJunk().match(money2RegExp) : [];
                    if (moneyM && moneyM.length === 3) {
                        rewardLow = moneyM[1] ? moneyM[1].numberOnly() * 1000000 : 0;
                        rewardHigh = moneyM[2] ? moneyM[2].numberOnly() * 1000000 : 0;
                        reward = (rewardLow + rewardHigh) / 2;
                    } else {
                        con.warn('No money found for', caap.questName, divTxt);
                    }
                }

                click = $j("input[name='Do Quest']", div);

                if (!$u.hasContent(click)) {
                    con.warn('No button found for', caap.questName);
                    return true;
                }

                influence = -1;

                if (caap.isBossQuest(caap.questName)) {
                    if ($u.hasContent($j(".quests_background_sub", div))) {
                        //if boss and found sub quests
                        influence = 100;
                    } else {
                        influence = 0;
                    }
                } else {
                    influenceList = divTxt.match(influenceRegExp);
                    if (influenceList && influenceList.length === 2) {
                        influence = influenceList[1] ? influenceList[1].parseInt() : 0;
                    } else {
                        con.warn("Influence div not found.", influenceList);
                    }
                }

                if (influence < 0) {
                    con.warn('No influence found for', caap.questName, divTxt);
                }

                general = 'none';
                genDiv = $j();

                if (influence >= 0 && influence < 100) {
                    genDiv = $j(".quest_act_gen", div);
                    if ($u.hasContent(genDiv)) {
                        genDiv = $j("img[src*='jpg']", genDiv);
                        if ($u.hasContent(genDiv)) {
                            general = genDiv.attr("title");
                        }
                    }
                }

                switch (div.attr("class")) // determine quest type
                {
                    case 'quests_background_special':
                        questType = 'boss';

                        break;
                    case 'quests_background':
                        if (caap.isExcavationQuest[caap.questName]) {
                            questType = 'mine';
                        } else {
                            questType = 'primary';
                        }

                        break;
                    default:
                        questType = 'subquest';
                }

                caap.labelQuests(div, energy, reward, experience, click);
                con.log(9, "QuestSubArea", questSubArea);
                if (isTheArea) {
                    if (questType === 'boss' && config.getItem('GetOrbs', false) && whyQuest !== 'Manual' && !haveOrb) {
                        caap.updateAutoQuest('name', caap.questName);
                        pickQuestTF = true;
                        autoQuestDivs.orbCheck = true;
                    }

                    if (questType === 'mine' && config.getItem('ExcavateMines', false) && whyQuest !== 'Manual' && influence < 100) {
                        caap.updateAutoQuest('name', caap.questName);
                        pickQuestTF = true;
                    }

                    switch (whyQuest) {
                        case 'Advancement':
                            if (influence >= 0) {
                                if (!state.getItem('AutoQuest', caap.newAutoQuest()).name && questType === 'primary' && influence < 100) {
                                    caap.updateAutoQuest('name', caap.questName);
                                    pickQuestTF = true;
                                }
                            } else {
                                con.warn("Can't find influence for", caap.questName, influence);
                            }

                            break;
                        case 'Max Influence':
                            if (influence >= 0) {
                                if (!state.getItem('AutoQuest', caap.newAutoQuest()).name && questType !== 'mine' && influence < 100) {
                                    caap.updateAutoQuest('name', caap.questName);
                                    pickQuestTF = true;
                                }
                            } else {
                                con.warn("Can't find influence for", caap.questName, influence);
                            }

                            break;
                        case 'Max Experience':
                            rewardRatio = (Math.floor(experience / energy * 100) / 100);
                            if (bestReward < rewardRatio && questType !== 'mine') {
                                caap.updateAutoQuest('name', caap.questName);
                                pickQuestTF = true;
                            }

                            break;
                        case 'Max Gold':
                            rewardRatio = (Math.floor(reward / energy * 10) / 10);
                            if (bestReward < rewardRatio && questType !== 'mine') {
                                caap.updateAutoQuest('name', caap.questName);
                                pickQuestTF = true;
                            }

                            break;
                        default:
							break;
                    }

                    if (isTheArea && state.getItem('AutoQuest', caap.newAutoQuest()).name === caap.questName) {
                        bestReward = rewardRatio;

                        con.log(2, "Setting AutoQuest", caap.questName);

                        tempAutoQuest = caap.newAutoQuest();

                        tempAutoQuest.name = caap.questName;
                        tempAutoQuest.energy = energy;
                        tempAutoQuest.general = general;
                        tempAutoQuest.experience = experience;
                        state.setItem('AutoQuest', tempAutoQuest);
                        con.log(4, "checkResults_quests", state.getItem('AutoQuest', caap.newAutoQuest()));
                        caap.showAutoQuest();
                        autoQuestDivs.name = caap.questName;
                        autoQuestDivs.click = click;
                        autoQuestDivs.tr = div;
                        autoQuestDivs.genDiv = genDiv;
                    }
                }

                //con.log(1, "End of run");
                return true;
            });

            con.log(4, "pickQuestTF", pickQuestTF);
            if (pickQuestTF) {
                if (state.getItem('AutoQuest', caap.newAutoQuest()).name) {
                    con.log(4, "return autoQuestDivs", autoQuestDivs);
                    caap.showAutoQuest();
                    return autoQuestDivs;
                }

                //if not find quest, probably you already maxed the subarea, try another area
                if ((whyQuest === 'Max Influence' || whyQuest === 'Advancement') && config.getItem('switchQuestArea', true)) {
                    con.log(9, "QuestSubArea", questSubArea);
                    if (questSubArea && caap.questAreaInfo[questSubArea] && caap.questAreaInfo[questSubArea].next) {
                        questSubArea = config.setItem('QuestSubArea', caap.questAreaInfo[questSubArea].next);
                        if (caap.questAreaInfo[questSubArea].area && caap.questAreaInfo[questSubArea].list) {
                            config.setItem('QuestArea', caap.questAreaInfo[questSubArea].area);
                            caap.changeDropDownList('QuestSubArea', caap[caap.questAreaInfo[questSubArea].list]);
                        }
                    } else {
                        con.log(1, "Setting questing to manual");
                        caap.manualAutoQuest();
                    }

                    con.log(2, "UpdateQuestGUI: Setting drop down menus");
                    caap.selectDropOption('QuestArea', config.getItem('QuestArea', 'Quest'));
                    caap.selectDropOption('QuestSubArea', questSubArea);
                    return false;
                }

                con.log(1, "Finished QuestArea.");
                caap.manualAutoQuest();
            }

            return false;
        } catch (err) {
            con.error("ERROR in checkResults_quests: " + err.stack);
            caap.manualAutoQuest();
            return false;
        }
    };

    caap.classToQuestArea = {
        'quests_stage_1': 'Land of Fire',
        'quests_stage_2': 'Land of Earth',
        'quests_stage_3': 'Land of Mist',
        'quests_stage_4': 'Land of Water',
        'quests_stage_5': 'Demon Realm',
        'quests_stage_6': 'Undead Realm',
        'quests_stage_7': 'Underworld',
        'quests_stage_8': 'Kingdom of Heaven',
        'quests_stage_9': 'Ivory City',
        'quests_stage_10': 'Earth II',
        'quests_stage_11': 'Water II',
        'quests_stage_12': 'Mist II',
        'quests_stage_13': 'Mist III',
        'quests_stage_14': 'Fire II',
        'quests_stage_15': 'Pangaea',
        'quests_stage_16': 'Perdition',
        'quests_stage_17': 'Land of Fire III',
        'quests_stage_18': 'Land of Earth III',
        'quests_stage_19': 'Land of Mist IV',
        'quests_stage_20': 'Land of Water III',
        'quests_stage_21': 'Undead II',
        'quests_stage_22': 'Outer Realms',
        'symbolquests_stage_1': 'Ambrosia',
        'symbolquests_stage_2': 'Malekus',
        'symbolquests_stage_3': 'Corvintheus',
        'symbolquests_stage_4': 'Aurora',
        'symbolquests_stage_5': 'Azeron',
        'monster_quests_stage_1': 'Atlantis',
        'monster_quests_stage_2': 'Atlantis II',
        'monster_quests_stage_3': 'Atlantis III'
    };

    caap.checkCurrentQuestArea = function (QuestSubArea) {
        try {
            var found = false;

            if (stats.level < 8) {
                if (caap.hasImage('quest_back_1.jpg')) {
                    found = true;
                }
            } else if (QuestSubArea && caap.questAreaInfo[QuestSubArea]) {
                if ($u.hasContent($j("#globalContainer div[class='" + caap.questAreaInfo[QuestSubArea].clas + "']"))) {
                    found = true;
                }
            }

            return found;
        } catch (err) {
            con.error("ERROR in checkCurrentQuestArea: " + err.stack);
            return false;
        }
    };

    caap.getCurrentQuestArea = function () {
        var mainDiv = $j('#main_bn'),
            className;

        if ($u.hasContent(mainDiv)) {
            className = mainDiv.attr("class");
            if ($u.hasContent(className) && caap.classToQuestArea[className]) {
                return caap.classToQuestArea[className];
            }
        }

        return false;
    };

    caap.getQuestName = function (questDiv) {
        try {
            var item_title = $j(".quest_desc,.quest_sub_title", questDiv),
                firstb = $j("b", item_title).eq(0),
                text = '';

            if (!$u.hasContent(item_title)) {
                con.log(2, "Can't find quest description or sub-title");
                return false;
            }

            text = item_title.html().trim().innerTrim();
            if (/LOCK/.test(text) || /boss_locked/.test(text)) {
                con.log(2, "Quest locked", text);
                return false;
            }

            if (!$u.hasContent(firstb)) {
                con.warn("Can't get bolded member out of", text);
                return false;
            }

            caap.questName = firstb.text().trim().innerTrim();
            if (!$u.hasContent(caap.questName)) {
                con.warn('No quest name for this row');
                return false;
            }

            return caap.questName;
        } catch (err) {
            con.error("ERROR in getQuestName: " + err.stack);
            return false;
        }
    };

    /*
     * Below section of code added as a stop-gap measure to allow CAAP to perform auto-quests even
     * when CA developers omit or duplicate the names for either main quests or sub quests.
     */

    // this table is only for quest name corrections, however, if a quest area requires any
    // corrections at all, then all main/sub quest names must be listed here regardless;
    // because, the array index must match the element index from the HTML container.
    caap.questNameCorrections = { // note: indent subquests under main quests for readability
        'Mist III': // this quest area had a duplicate name on a subquest
        ['Tenvir Summit',
            'Defeat Wolverines',
            'Survey Area',
            'Gather Supplies',
            'Taubourne Falls',
            'Find A Way Across',
            'Repair Bridge',
            'Cross the Falls',
            'Hakkal Woods',
            'Gather Samples',
            'Hunt For Food',
            'Prepare for Dark',
            'Signs of the Scourge',
            'Kill Slimes',
            'Cast Poison Shield',
            'Make Camp',
            'The Green Haze',
            'Dispatch Corrupted Soldiers',
            'Kill Diseased Treants',
            'Find Shelter From Haze',
            'Sporeguard Revisited',
            'Destroy Mushrooms',
            'Eradicate Spores',
            'Clear Haze',
            'Death of a Forest',
            'Gather Nature Essence',
            'Gather Life Dust',
            'Cast Regrowth',
            'Calm Before the Storm',
            'Walking in the Woods', // renamed
        'Defeat Rock Elementals', // was duplicate
        'Gather Earth Essence',
            'The Life Temple',
            'Investigate Temple',
            'Collect Artifact Shards',
            'Create Artifact Relic',
            'The Life Altar',
            'Use Artifact Relic',
            'Unlock Altar',
            'Destroy Scourge'],
        'Fire II': // this quest area had a duplicate name on a main quest
        ['Unlikely Alliance',
            'Counter Life Drain',
            'Test Her Power',
            'Defeat Sylvana',
            'Bridge of Fire',
            'Destroy Fire Elementals',
            'Cross Lava Pools',
            'Avoid an Avalanche',
            'River of Light',
            'Enchant Weapon',
            'Kill River Hydras',
            'Destroy Path',
            'Karth',
            'Make Preparations',
            'Scout Karth',
            'Climb Wall',
            'Nighttime Infiltration',
            'Find Shortcut',
            'Find Supplies',
            'Dispatch Patrol',
            'Burning of Karth',
            'Defeat Paladin',
            'Capture Army',
            'Burn Barracks',
            'Crossing the White Plains',
            'Avoid Patrols',
            'Move Supplies',
            'Make Camp',
            'Prepare for Siege', // renamed
        'Plan Strategy',
            'Setup Siege',
            'Prepare for War',
            'Siege on the Capital', // was duplicate
        'Don Armor',
            'Ride Down',
            'Confront Celesta',
            'Energy Rift',
            'Cast Barrier',
            'Brace Yourself',
            'Confront Figure'],
        'Land of Earth III': // this quest area had a duplicate name on a subquest
        ['Battle Cultists',
            'Interrogate',
            'Gather Crystals',
            'Free Prisoners',
            'Dodge Wind Attacks!',
            'Cast Earth Shield',
            'Chase Assassin',
            'Catch Breath',
            'Cut A Path',
            'Traverse River',
            'Find Clues',
            'Cure Snake Bite',
            'Find Walkway',
            'Battle Lizardman',
            'Defeat Swamp Hags',
            'Fight Troll',
            'Calm Villagers',
            'Gather Information',
            'Heal Wounded Villagers', // renamed
        'Repair Buildings',
            'Follow Wreckage',
            'Traverse Lava',
            'Defeat Wild Apes',
            'Scout Ahead',
            'Stone Idols Attack',
            'Defensive Position',
            'Defeat Stone Guardians',
            'Enter the Cradle',
            'Research',
            'Gorilla Ambush',
            'Discover Artifacts',
            'Loot Artifacts',
            'Save Survivors',
            'Distract Urmek',
            'Retreat',
            'Find Cover',
            'Discover Empty Tomb',
            'Heal Our Wounded', // renamed
        'Build Morale',
            'Plan Attack'],
        'Land of Mist IV': // this quest area needed names for all subquests
        ['Recovery',
            'Give Army Leave',
            'Rest at Home',
            'Recall Army',
            'Desolate Pass',
            'Mountain Ascent',
            'Mist-filled Pass',
            'Descent from the Pass',
            'Canyons of Borati',
            'Explore Canyons',
            'No one Around',
            'Scout Ahead',
            'Surrounded',
            'Cultists Approach',
            'Wait and See',
            'The Chant Begins',
            'Cassandra',
            'The Chant Ceases',
            'Cassandra Appears',
            'Questions Asked',
            'Contemplation',
            'No Harm Threatened',
            'Cassandra Disappears',
            'Cultists Leave',
            'Elyraels Stepstones',
            'Secure the Area',
            'Bury the Dead',
            'Break Camp',
            'The Floating City',
            'Enter the City',
            'Admire the Architecture',
            'Meet the Griffin Legions',
            'Griffin Legions',
            'War Council Called',
            'Battle Planning',
            'Leaders Assigned',
            'Taking Flight',
            'The Hunt Begins',
            'Wings in Formation',
            'Falcons Recon Ahead'],
        'end-of-table': []
    };

    caap.updateQuestNames = function (qc) {
        var qa = caap.getCurrentQuestArea(),
            qnc = '',
            ttl = $j(),
            firstb = $j();

        if (caap.questNameCorrections[qa]) {
            qnc = caap.questNameCorrections[qa];
            qc.each(function (idx, ele) {
                ttl = $j(".quest_desc,.quest_sub_title", ele);
                firstb = $j("b", ttl).eq(0);
                firstb[0].innerHTML = qnc[idx];
                ttl = null;
                firstb = null;
            });
        }

        ttl = null;
        firstb = null;
        return;
    };

    /*
     * Above section of code added as a stop-gap measure to allow CAAP to perform auto-quests even
     * when CA developers omit or duplicate the names for either main quests or sub quests.
     */

    /*------------------------------------------------------------------------------------\
    caap.checkEnergy gets passed the default energy requirement plus the condition text from
    caap.the 'Whenxxxxx' setting and the message div name. If energy is not defined, returns
	the total amount of energy available.
    \------------------------------------------------------------------------------------*/
    caap.checkEnergy = function (which, condition, energyRequired) {
        try {
            if (!stats.energy) {
                return false;
            }

            if (!which) {
				con.warn('Check Energy not passed an argument to specify quest or fortify');
                return false;
            }

            var whichEnergy,
                maxIdleEnergy = caap.maxStatCheck('energy'),
				energyMin,
				msgdiv = which.toLowerCase() + '_mess';
				
			energyRequired = $u.setContent(energyRequired, 0);
			
			if (condition == 'Never') {
				caap.setDivContent(msgdiv, which + ': Never');
				return 0;
			}

			if (caap.inLevelUpMode() && stats.energy.num >= energyRequired) {
				if (msgdiv === "quest_mess") {
					window.clearTimeout(caap.qtom);
				}
				caap.setDivContent(msgdiv, which + ': Burning all energy to ' + (caap.inLevelUpMode() ? 'level up' : ' get below max'));
				return stats.energy.num;
			}

            if (['Energy Available', 'Not Fortifying', 'Not Covering My Damage'].indexOf(condition) >=0) {
				energyMin = Math.max(0, stats.energy.num - (condition == 'Not Covering My Damage' ? Math.max( 20, stats.stamina.num * config.getItem('HealPercStam', 20) / 100) : 0));
                if (energyMin >= energyRequired) {
                    return energyMin;
                }
				if (msgdiv === "quest_mess") {
					window.clearTimeout(caap.qtom);
                }
				caap.setDivContent(msgdiv, which + ': Waiting for more energy: ' + stats.energy.num + "/" + energyRequired);
            } else if (condition === 'At X Energy') {

                whichEnergy = config.getItem('X' + which + 'Energy', 1);

                if (stats.energy.num >= whichEnergy) {
                    state.setItem('X' + which + 'Energy', true);
                }
                if (stats.energy.num >= energyRequired) {
                    if (state.getItem('X' + which + 'Energy', false) && stats.energy.num >= config.getItem('XMin' + which + 'Energy', 0)) {
						if (msgdiv === "quest_mess") {
							window.clearTimeout(caap.qtom);
						}
						caap.setDivContent(msgdiv, which + ': At X energy. Burning to ' + config.getItem('XMin' + which + 'Energy', 0));
                        return stats.energy.num - config.getItem('XMin' + which + 'Energy', 0);
                    }
                    state.setItem('X' + which + 'Energy', false);
                }
				whichEnergy = energyRequired > whichEnergy ? energyRequired : whichEnergy;
				if (msgdiv === "quest_mess") {
					window.clearTimeout(caap.qtom);
				}
				caap.setDivContent(msgdiv, which + ': Waiting for X energy: ' + stats.energy.num + "/" + whichEnergy);
            } else if (condition === 'At Max Energy') {
                if (stats.energy.num >= maxIdleEnergy) {
                    return stats.energy.num;
                }
				if (msgdiv === "quest_mess") {
					window.clearTimeout(caap.qtom);
				}
				caap.setDivContent(msgdiv, which + ': Waiting for max energy: ' + stats.energy.num + "/" + maxIdleEnergy);
            }
            return false;
        } catch (err) {
            con.error("ERROR in checkEnergy: " + err.stack);
            return false;
        }
    };

    caap.labelListener = function (e) {
        try {
            var sps = e.target.getElementsByTagName('span'),
                mainDiv = $j("#globalContainer #main_bn"),
                className = '',
                tempAutoQuest = {};

            if (sps.length <= 0) {
                throw 'what did we click on?';
            }

            tempAutoQuest = caap.newAutoQuest();
            tempAutoQuest.name = sps[0].innerHTML;
            tempAutoQuest.energy = sps[1].innerHTML.parseInt();

            caap.manualAutoQuest(tempAutoQuest);
            con.log(5, 'labelListener', sps, state.getItem('AutoQuest'));
            if (stats.level < 8 && caap.hasImage('quest_back_1.jpg')) {
                config.setItem('QuestArea', 'Quest');
                config.setItem('QuestSubArea', 'Land of Fire');
            } else {
                if (caap.hasImage('tab_quest_on.gif')) {
                    config.setItem('QuestArea', 'Quest');
                    caap.selectDropOption('QuestArea', 'Quest');
                    caap.changeDropDownList('QuestSubArea', caap.landQuestList);
                } else if (caap.hasImage('demi_quest_on.gif')) {
                    config.setItem('QuestArea', 'Demi Quests');
                    caap.selectDropOption('QuestArea', 'Demi Quests');
                    caap.changeDropDownList('QuestSubArea', caap.demiQuestList);
                } else if (caap.hasImage('tab_atlantis_on.gif')) {
                    config.setItem('QuestArea', 'Atlantis');
                    caap.selectDropOption('QuestArea', 'Atlantis');
                    caap.changeDropDownList('QuestSubArea', caap.atlantisQuestList);
                }

                if ($u.hasContent(mainDiv)) {
                    className = mainDiv.attr("class");
                    if ($u.hasContent(className) && caap.classToQuestArea[className]) {
                        config.setItem('QuestSubArea', caap.classToQuestArea[className]);
                    }
                }
            }

            con.log(1, 'Setting QuestSubArea to', config.getItem('QuestSubArea', 'Land Of Fire'));
            caap.selectDropOption('QuestSubArea', config.getItem('QuestSubArea', 'Land Of Fire'));
            caap.showAutoQuest();
            caap.checkResults_quests();
            mainDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in labelListener: " + err.stack);
            return false;
        }
    };

    caap.labelQuests = function (div, energy, reward, experience, click) {
        try {
            if ($u.hasContent($j("div[class='autoquest']", div))) {
                return;
            }

            var newdiv,
                b,
                setAutoQuest,
                quest_nameObj,
                quest_energyObj;

            newdiv = document.createElement('div');
            newdiv.className = 'autoquest';
            newdiv.style.fontSize = '10px';
            newdiv.innerHTML = "$ per energy: " + (Math.floor(reward / energy * 10) / 10) + "<br />Exp per energy: " + (Math.floor(experience / energy * 100) / 100) + "<br />";

            if (state.getItem('AutoQuest', caap.newAutoQuest()).name === caap.questName) {
                b = document.createElement('b');

                b.innerHTML = "Current auto quest";
                newdiv.appendChild(b);

                b = null;
            } else {
                setAutoQuest = document.createElement('a');

                setAutoQuest.innerHTML = 'Auto run this quest.';
                setAutoQuest.quest_name = caap.questName;

                quest_nameObj = document.createElement('span');

                quest_nameObj.innerHTML = caap.questName;
                quest_nameObj.style.display = 'none';
                setAutoQuest.appendChild(quest_nameObj);

                quest_energyObj = document.createElement('span');

                quest_energyObj.innerHTML = energy;
                quest_energyObj.style.display = 'none';
                setAutoQuest.appendChild(quest_energyObj);
                $u.addEvent(setAutoQuest, "click", caap.labelListener);

                newdiv.appendChild(setAutoQuest);

                quest_nameObj = null;
                quest_energyObj = null;
                setAutoQuest = null;
            }

            newdiv.style.position = 'absolute';
            newdiv.style.background = '#B09060';
            newdiv.style.right = "144px";
            click.parent().before(newdiv);

            newdiv = null;
        } catch (err) {
            con.error("ERROR in labelQuests: " + err.stack);
        }
    };

    /////////////////////////////////////////////////////////////////////
    //                          AUTO BLESSING
    /////////////////////////////////////////////////////////////////////

    caap.deityTable = {
        'energy': 1,
        'attack': 2,
        'defense': 3,
        'health': 4,
        'stamina': 5
    };

    caap.pstDay = function () {
        var time = new Date(),
			pstMS = time.getTime() + ((-420) * 60000),
			pstTime = new Date(pstMS),
			weekday = {
				0 : "Sunday",
				1 : "Monday",
				2 : "Tuesday",
				3 : "Wednesday",
				4 : "Thursday",
				5 : "Friday",
				6 : "Saturday"
			};

        return weekday[pstTime.getUTCDay()];
    };

    caap.blessSelection = function () {
        var autoBless = config.getItem('AutoBless', 'none'),
        pstDayBonus = caap.pstDay(),
        startAtt = 0,
        stopAtt = 4,
        attribute = '',
        attrName = '',
        attrValue = 0,
        attrAdjustNew = 0,
        attrCurrent = 0,
        level = 0,
        energy = 0,
        stamina = 0,
        attack = 0,
        defense = 0,
        health = 0,
        n;

        if (autoBless.match('Auto Upgrade')) {
            try {
                if (config.getItem("AutoStatAdv", false)) {
                    startAtt = 5;
                    stopAtt = 9;
                }

                energy = stats.energy.max;
                stamina = stats.stamina.max;
                attack = stats.attack;
                defense = stats.defense;
                health = stats.health.max;
                level = stats.level;

                for (n = startAtt; n <= stopAtt; n += 1) {
                    attrName = 'Attribute' + n;
                    attribute = config.getItem(attrName, '');
                    /*jslint continue: true */
                    if (attribute === '') {
                        con.log(4, attrName + " is blank: continue");
                        continue;
                    }

                    if (stats.level < 10) {
                        if (attribute === 'Attack' || attribute === 'Defense' || attribute === 'Health') {
                            con.log(1, "Characters below level 10 can not increase Attack, Defense or Health: continue");
                            continue;
                        }
                    }

                    attrValue = config.getItem('AttrValue' + n, 0);
                    attribute = attribute.toLowerCase();
                    switch (attribute) {
                        case 'energy':
                            attrCurrent = energy;

                            break;
                        case 'stamina':
                            if (pstDayBonus === 'Thursday' || pstDayBonus === 'Friday' ) {
                                con.log(1, "We don't pray stamina on Thursday and Friday: continue");
                                continue;
                            }
                            attrCurrent = stamina;

                            break;
                        case 'attack':
                            attrCurrent = attack;

                            break;
                        case 'defense':
                            attrCurrent = defense;

                            break;
                        case 'health':
                            attrCurrent = health;

                            break;
                        default:
                            throw "Unable to match attribute: " + attribute;
                    }
                    /*jslint continue: false */

                    if (config.getItem('AutoStatAdv', false)) {
                        /*jslint evil: true */
                        attrAdjustNew = eval(attrValue);
                        /*jslint evil: false */
                    } else {
                        attrAdjustNew = attrValue;
                    }

                    if (attrAdjustNew > attrCurrent) {
                        return attribute;
                    }
                }
                return '';
            } catch (err) {
                con.error("ERROR in autoBlessSelection: " + err.stack);
                return 'none';
            }
        } else {
            return autoBless;
        }
    };

	worker.addAction({worker : 'caap', priority : -100, description : 'Demi Blessings', functionName : 'bless'});	
	
    caap.bless = function () {
        try {
            var autoBless = caap.blessSelection(),
                autoBlessN = caap.deityTable[autoBless.toLowerCase()],
                picSlice = $j(),
                descSlice = $j(),
                rVal;


            picSlice = $j("#mainHeaderTabs input[src*='header_persist_btn_pray.gif']");
			if (!$u.hasContent(autoBlessN) || !$u.hasContent(picSlice)) { 
                picSlice = null;
                descSlice = null;
                return false;
            }
			
			descSlice = $j("#mainHeaderTabs input[src*='demi_symbol_" + autoBlessN + ".gif']");
			if ($u.hasContent(descSlice) && schedule.check('blessingTimer') && caap.ifClick(picSlice)) {
				schedule.setItem('blessingTimer', 5 * 60);
				return true;
			}

            if (caap.navigateTo('quests,demi_quest_off', 'demi_quest_bless')) {
                picSlice = null;
                descSlice = null;
                return true;
            }

            picSlice = $j("#app_body #symbol_image_symbolquests" + autoBlessN);
            if (!$u.hasContent(picSlice)) {
                con.warn('No diety image for', autoBless);
                picSlice = null;
                descSlice = null;
                return false;
            }

            descSlice = $j("#app_body #symbol_desc_symbolquests" + autoBlessN);
            if (!$u.hasContent(descSlice)) {
                con.warn('No diety description for', autoBless);
                picSlice = null;
                descSlice = null;
                return false;
            }

            if (descSlice.css('display') === 'none') {
                rVal = caap.navigateTo(picSlice.attr("src").basename());
                picSlice = null;
                descSlice = null;
                return rVal;
            }

            picSlice = $j("#symbols_form_" + autoBlessN + " input[name='symbolsubmit']", descSlice);
            if (!$u.hasContent(picSlice)) {
                con.warn('No image for deity blessing', autoBless);
                picSlice = null;
                descSlice = null;
                return false;
            }

            con.log(1, 'Click deity blessing for', autoBless, autoBlessN);
            caap.click(picSlice);
            picSlice = null;
            descSlice = null;
            return true;
        } catch (err) {
            con.error("ERROR in autoBless: " + err.stack);
            return false;
        }
    };

    /////////////////////////////////////////////////////////////////////
    //                          FESTIVAL BLESSING
    /////////////////////////////////////////////////////////////////////

    caap.checkResults_festival_tower = function () {
        try {
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_festival_tower: " + err.stack);
            return false;
        }
    };

    caap.festivalBlessTable = {
        'attack': 'defense',
        'defense': 'energy',
        'energy': 'stamina',
        'stamina': 'health',
        'health': 'army',
        'army': 'attack'
    };

    caap.festivalBlessGeneral = {
        'attack': 'DuelGeneral',
        'defense': 'FortifyGeneral',
        'energy': 'IdleGeneral',
        'stamina': 'IdleGeneral',
        'health': 'IdleGeneral',
        'army': 'InvadeGeneral'
    };

    caap.festivalBlessResults = function () {
        try {
            var hours = 0,
                minutes = 0,
                tDiv = $j(),
                txt = '',
                autoBless = config.getItem('festivalBless', 'None');

            if (autoBless !== 'None') {
                tDiv = $j("#globalContainer div[style*='festival_feats_bottom.jpg']");
                txt = $u.setContent(tDiv.text(), '').trim().innerTrim().regex(/(\d+:\d+)/);
                if ($u.hasContent(txt)) {
                    // Check time until next Festival Blessing
                    hours = $u.setContent(txt.regex(/(\d+):/), 0);
                    minutes = $u.setContent(txt.regex(/:(\d+)/), 30);
                    con.log(2, 'Recorded Festival Blessing Time. Scheduling next click! ' + hours + ':' + minutes.lpad("0", 2));
                    schedule.setItem('festivalBlessTimer', (hours * 60 + minutes + 5) * 60, 300);
                }

                tDiv = $j("#globalContainer div[style*='festival_victory_popup.jpg']");
                if ($u.hasContent(tDiv)) {
                    con.log(1, "Festival Feat Victory!");
                } else {
                    tDiv = $j("#globalContainer div[style*='festival_defeat_popup.jpg']");
                    if ($u.hasContent(tDiv)) {
                        con.log(1, "Festival Feat Defeat!", autoBless, caap.festivalBlessTable[autoBless.toLowerCase()]);
                        $j("#caap_festivalBless", caap.caapDivObject).val(config.setItem('festivalBless', autoBless === 'All' ? 'All' : caap.festivalBlessTable[autoBless.toLowerCase()].ucFirst()));
                    }
                }
            }

            tDiv = null;
        } catch (err) {
            con.error("ERROR in festivalBlessResults: " + err.stack);
        }
    };

	worker.addAction({worker : 'caap', priority : -2000, description : 'Doing Festival Bless', functionName : 'festivalBless'});
	
    caap.festivalBless = function () {
        try {
            var autoBless = config.getItem('festivalBless', 'None'),
                capPic,
                picSlice,
                txt,
                atkFeat,
                defFeat,
                heaFeat,
                eneFeat,
                staFeat,
                armFeat,
                default_bless;

            if (autoBless === 'None' || !schedule.check('festivalBlessTimer')) {
                return false;
            }

            if (autoBless === 'All') {
                atkFeat = [50, 100, 150, 200, 280, 375, 510, 725];
                defFeat = [50, 100, 150, 200, 280, 375, 510, 725];
                heaFeat = [125, 150, 200, 250, 300, 375, 440, 500];
                eneFeat = [50, 100, 150, 200, 280, 375, 510, 725];
                staFeat = [25, 50, 75, 100, 140, 180, 255, 360];
                armFeat = [50, 100, 200, 400, 600, 800, 1000, 1200];
                default_bless = 'All';

                if (stats.achievements.feats.attack < 8) {
                    if (stats.attack >= atkFeat[stats.achievements.feats.attack]) {
                        autoBless = 'Attack';
                    }

                    default_bless = 'Attack';
                }

                if (stats.achievements.feats.defense < 8) {
                    if (stats.defense >= defFeat[stats.achievements.feats.defense]) {
                        autoBless = 'Defense';
                    }

                    default_bless = default_bless === 'All' ? 'Defense' : default_bless;
                }

                if (stats.achievements.feats.health < 8) {
                    if (stats.health.max >= heaFeat[stats.achievements.feats.health]) {
                        autoBless = 'Health';
                    }

                    default_bless = default_bless === 'All' ? 'Health' : default_bless;
                }

                if (stats.achievements.feats.energy < 8) {
                    if (stats.energy.max >= eneFeat[stats.achievements.feats.energy]) {
                        autoBless = 'Energy';
                    }

                    default_bless = default_bless === 'All' ? 'Energy' : default_bless;
                }

                if (stats.achievements.feats.stamina < 8) {
                    if (stats.stamina.max >= staFeat[stats.achievements.feats.stamina]) {
                        autoBless = 'Stamina';
                    }

                    default_bless = default_bless === 'All' ? 'Stamina' : default_bless;
                }

                if (stats.achievements.feats.army < 8) {
                    if (stats.army.actual >= armFeat[stats.achievements.feats.army]) {
                        autoBless = 'Army';
                    }

                    default_bless = default_bless === 'All' ? 'Army' : default_bless;
                }

                if (autoBless === 'All') {
                    autoBless = default_bless !== 'All' ? default_bless : 'Attack';
                }
            }

            capPic = 'festival_capsule_' + autoBless.toLowerCase() + '.gif';
            picSlice = $j();
            txt = '';

            if (caap.navigateTo('soldiers,fb_tab_festival.jpg,festival_feat_nav,' + capPic, 'festival_feats_bottom.jpg')) {
                return true;
            }

            txt = $u.setContent($j("#app_body div[style*='festival_feats_middle.jpg'] strong").text(), '').trim().innerTrim();
            if (/Mastered/i.test(txt)) {
                con.log(1, 'Area Completed!', autoBless);
                $j("#caap_festivalBless", caap.caapDivObject).val(config.setItem('festivalBless', caap.festivalBlessTable[autoBless.toLowerCase()].ucFirst()));
                caap.navigateTo('soldiers,fb_tab_festival.jpg,festival_feat_nav');
                picSlice = null;
                return false;
            }

            if (!new RegExp(autoBless).test(txt)) {
                con.warn('No match for text', autoBless);
                caap.navigateTo('soldiers,fb_tab_festival.jpg,festival_feat_nav');
                picSlice = null;
                return false;
            }

            picSlice = $j("#app_body img[src*='festival_feat_completedbutton.jpg']");
            if ($u.hasContent(picSlice)) {
                con.log(1, 'Area Completed!', autoBless);
                $j("#caap_festivalBless", caap.caapDivObject).val(config.setItem('festivalBless', caap.festivalBlessTable[autoBless.toLowerCase()].ucFirst()));
                caap.navigateTo('soldiers,fb_tab_festival.jpg,festival_feat_nav');
                picSlice = null;
                return false;
            }

            picSlice = $j("#app_body input[src*='festival_feat_testbutton.jpg']");
            if (!$u.hasContent(picSlice)) {
                con.warn('No blessing button', autoBless);
                caap.navigateTo('soldiers,fb_tab_festival.jpg,festival_feat_nav');
                picSlice = null;
                return false;
            }

            con.log(1, 'Click blessing button for', autoBless);
            schedule.setItem('festivalBlessTimer', 300, 300);
            caap.click(picSlice);
            picSlice = null;
            return true;
        } catch (err) {
            con.error("ERROR in festivalBless: " + err.stack);
            return false;
        }
    };

    /////////////////////////////////////////////////////////////////////
    //                          LAND
    // Displays return on lands and perfom auto purchasing
    /////////////////////////////////////////////////////////////////////

    caap.landRecord = function () {
        this.data = {
            'row': $j(),
            'name': '',
            'income': 0,
            'cost': 0,
            'totalCost': 0,
            'owned': 0,
            'maxAllowed': 0,
            'buy': 0,
            'roi': 0,
            'set': 0,
            'last': 0
        };
    };

    caap.bestLand = {};

    caap.sellLand = {};
	
    caap.checkResults_land = function () { //fbland_top.jpg
        function selectLands(div, val, type) {
            try {
                type = type || 'Buy';
                var selects = $j("select", div);

                if (!$u.hasContent(selects)) {
                    con.warn(type + " select not found!");
                    return false;
                }

                if (type === "Buy") {
                    if (selects.length === 2) {
                        selects.eq(0).val(val);
                    }
                } else {
                    selects.eq(0).val(val);
                }

                return true;
            } catch (err) {
                con.error("ERROR in selectLands: " + err.stack);
                return false;
            }
        }

        try {
            var ssDiv = $j("#app_body div[style*='town_land_bar']"),
                bestLandCost = {};

            if (!$u.hasContent(ssDiv)) {
                con.warn("Can't find town_land_bar.jpg");
                return false;
            }

            caap.bestLand = state.setItem('BestLandCost', new caap.landRecord().data);
            caap.sellLand = {};

            ssDiv.each(function () {
                var row = $j(this),
                    strongs = $j("strong", row),
                    name = '',
                    income = 0,
                    cost = 0,
                    tStr = '',
                    maxAllowed = 0,
                    owned = 0,
                    s = 0,
                    roi = 0,
                    selection = [1, 5, 10],
                    land = new caap.landRecord();

                if (!$u.hasContent(row)) {
                    return true;
                }

                selectLands(row, 10);
                if (!$u.hasContent(strongs) || strongs.length !== 3) {
                    con.warn("Can't find strongs", strongs.length);
                    return true;
                }

                name = strongs.eq(0).text().trim();
                if (!$u.hasContent(name)) {
                    con.warn("Can't find land name");
                    return true;
                }

                income = strongs.eq(1).text().trim().numberOnly();
                if (!$u.hasContent(income)) {
                    con.warn("Can't find land income");
                    return true;
                }

                cost = strongs.eq(2).text().trim().numberOnly();
                if (!$u.hasContent(cost)) {
                    con.warn("Can't find land cost");
                    return true;
                }

                // Lets get our max allowed from the land_buy_info div
                tStr = row.text().trim().innerTrim();
                if (!$u.hasContent(tStr)) {
                    con.warn("Can't find land text");
                    return true;
                }

                maxAllowed = tStr.regex(/Max Allowed For your level: (\d+)/);
                if (!$u.hasContent(maxAllowed)) {
                    con.warn("Can't find land maxAllowed");
                    return true;
                }

                owned = tStr.regex(/Owned: (\d+)/);
                if (!$u.hasContent(owned)) {
                    con.warn("Can't find land owned");
                    return true;
                }

                land.data.row = row;
                land.data.name = name;
                land.data.income = income;
                land.data.cost = cost;
                land.data.maxAllowed = maxAllowed;
                land.data.owned = owned;
                land.data.buy = (maxAllowed - owned) > 10 ? 10 : maxAllowed - owned;
                land.data.totalCost = land.data.buy * cost;
                roi = (((income / cost) * 240000) / 100).dp(2);
                if (!$u.hasContent($j("input[name='Buy']", row))) {
                    roi = 0;
                    // If we own more than allowed we will set land and selection
                    for (s = 2; s >= 0; s -= 1) {
                        if (land.data.owned - land.data.maxAllowed >= selection[s]) {
                            caap.sellLand = land.data;
                            selectLands(row, selection[s], 'Sell');
                            break;
                        }
                    }
                }

                land.data.roi = $u.setContent(roi, 0);
                strongs.eq(0).text(name + " | " + land.data.roi + "% per day.");
                con.log(4, "Land:", land.data.name);
                if (land.data.roi > 0 && land.data.roi > caap.bestLand.roi) {
                    con.log(4, "Set Land:", land.data.name, land.data);
                    caap.bestLand = $j.extend(true, {}, land.data);
                }

                return true;
            });

            $j.extend(true, bestLandCost, caap.bestLand);
            delete bestLandCost.row;
            bestLandCost.set = true;
            bestLandCost.last = Date.now();
            state.setItem('BestLandCost', bestLandCost);
            con.log(2, "Best Land Cost: ", bestLandCost.name, bestLandCost.cost, bestLandCost);
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_land: " + err.stack);
            return false;
        }
    };

    caap.noLandsLog = true;

	worker.addAction({worker : 'caap', priority : 100, description : 'Land Operations', functionName : 'lands'});

    caap.lands = function () {
        function buySellLand(land, type) {
            try {
                type = type || 'Buy';
                var button = $j("input[name='" + type + "']", land.row);

                if ($u.hasContent(button)) {
                    if (type === 'Buy') {
                        caap.bestLand = state.setItem('BestLandCost', new caap.landRecord().data);
                    } else {
                        caap.sellLand = {};
                    }

                    caap.click(button, 15000);
                    return true;
                }

                con.warn(type + " button not found!");
                return false;
            } catch (err) {
                con.error("ERROR in buySellLand: " + err.stack);
                return false;
            }
        }

        try {
            var bestLandCost = {},
				cashTotAvail = 0,
                cashNeed = 0,
                theGeneral = '',
				result = false;
				
			if (schedule.check('territory')) {
				result = caap.navigate2('territory,clickimg:fbland_btn_collect.gif');
				if (result == 'fail') {
					schedule.setItem('territory', 6 * 60 * 60);
				} else if (result) {
					con.log(1, 'Checking daily territory collect.');
					return true;
				}
			}

            if (!config.getItem('autoBuyLand', false)) {
                return false;
            }

            // Do we have lands above our max to sell?
            if (!$j.isEmptyObject(caap.sellLand) && config.getItem('SellLands', false)) {
                con.log(2, "Selling land", caap.sellLand.name);
                buySellLand(caap.sellLand, 'Sell');
                return true;
            }

            bestLandCost = state.getItem('BestLandCost', new caap.landRecord().data);
            if (!bestLandCost.set) {
                con.log(2, "Going to land to get Best Land Cost");
                if (caap.navigateTo('soldiers,land', caap.hasImage('fb_tab_land_on.jpg') ? '' : 'fb_tab_land_on.jpg')) {
                    return true;
                }
            }

            if (bestLandCost.cost === 0) {
                if (caap.noLandsLog) {
                    con.log(2, "No lands to purchase");
                    caap.noLandsLog = false;
                }

                return false;
            }

            if (!stats.gold.bank && stats.gold.bank !== 0) {
                con.log(2, "Going to keep to get Stored Value");
                if (caap.navigateTo('keep')) {
                    return true;
                }
            }

            // Retrieving from Bank
            cashTotAvail = stats.gold.cash + (stats.gold.bank - config.getItem('minInStore', 0));
            cashNeed = bestLandCost.buy * bestLandCost.cost;
            theGeneral = config.getItem('IdleGeneral', 'Use Current');
            if ((cashTotAvail >= cashNeed) && (stats.gold.cash < cashNeed)) {
                if (theGeneral !== 'Use Current') {
                    //con.log(2, "Changing to idle general");
                    if (general.Select('IdleGeneral')) {
                        return true;
                    }
                }

                con.log(2, "Trying to retrieve", cashNeed - stats.gold.cash);
                return chores.retrieveFromBank(cashNeed - stats.gold.cash);
            }

            // Need to check for enough moneys + do we have enough of the builton type that we already own.
            if (bestLandCost.cost && stats.gold.cash >= cashNeed) {
                if (theGeneral !== 'Use Current') {
                    con.log(2, "Changing to idle general");
                    if (general.Select('IdleGeneral')) {
                        return true;
                    }
                }

                caap.navigateTo('soldiers,land');
                if (caap.hasImage('fb_tab_land_on.jpg')) {
                    if (bestLandCost.buy) {
                        con.log(2, "Buying land", caap.bestLand.name);
                        if (buySellLand(caap.bestLand)) {
                            return true;
                        }
                    }
                } else {
                    return caap.navigateTo('soldiers,land');
                }
            }

            return false;
        } catch (err) {
            con.error("ERROR in lands: " + err.stack);
            return false;
        }
    };

    /////////////////////////////////////////////////////////////////////
    //                          CONQUEST EVENTS
    /////////////////////////////////////////////////////////////////////

	worker.addAction({worker : 'caap', priority : 1800, description : 'Clicking dailies', functionName : 'collectConquest'});
    caap.collectConquest = function () {
        try {
			var headerDiv = $j('#mainHeaderTabs');
			if (config.getItem('AutoArchives', false) && caap.ifClick($j("input[src*='header_persist_btn_eneable.gif']", headerDiv))) {
				return true;
			} 
			if (schedule.check('doConquestCollect') && config.getItem('doConquestCollect', false)
				&& caap.ifClick($j("div[style*='header_persist_collect_container_wood.jpg'] input[src*='header_persist_btn_collect.gif']", headerDiv))) {
				schedule.setItem('doConquestCollect', 5 * 60);
				return true;
			} 
			if (schedule.check('doConquestCrystalCollect') && config.getItem('doConquestCrystalCollect', false) 
				&& caap.ifClick($j("div[style*='header_persist_collect_container_crystal.jpg'] input[src*='header_persist_btn_pray.gif']", headerDiv))) {
				schedule.setItem('doConquestCrystalCollect', 5 * 60);
				return true;
			} 
			if (conquest.collect()) {
				return true;
			}

            return false;
        } catch (err) {
            con.error("ERROR in collectConquest: " + err.stack);
            return false;
        }
    };

	worker.addAction({worker : 'caap', priority : -300, description : 'Moving to LoM Land', functionName : 'LoMmove'});
	
    caap.LoMmove = function () {
        try {
			var myIndex = stats.LoMland,
				myLand = {},
				nextLand = -1,
				result = false,
				defendable = function(land) {
					return land.status == 'enter' && land.defenders < 25 && land.phaseLeft < land.timeLeft + 2;
				};
			
			if (config.getItem('doLoMmove', 'Never') == 'Never' || (myIndex >= 0 && conquestLands.records[myIndex].status != 'enter') || !schedule.check('LoMmoveWait')) {
				return false;
			}
			// Find the land with the least time until it goes into defend
			nextLand = conquestLands.records.reduce( function(previous, land) {
				return defendable(land)	&& (previous == -1 || land.phaseLeft < previous.phaseLeft) ? land : previous;
			}, nextLand);
			
			// See if there is a land with more hours on it, that will be in defend during the same time
			if (config.getItem('doLoMmove', 'Never') == 'Newest') {
				if (nextLand !== -1) {
					nextLand = conquestLands.records.reduce( function(previous, land) {
						return defendable(land)	&& Math.min(nextLand.phaseLeft + 24, nextLand.timeLeft) + 2 > land.phaseLeft 
							&& land.timeLeft > previous.timeLeft ? land : previous;
					}, nextLand);
				}
			}

			if (nextLand != -1) {
				if (myIndex == -1) {
					result = caap.navigate2("ajax:guildv2_conquest_command.php?tier=3,clickjq:#app_body div[style*='conq2_capsule']:eq( " + nextLand.index + " ) img[src*='conq2_btn_enter.jpg'],guildv2_conquest_expansion_fort,clickimg:conq2_btn_joinpos.gif");
					//result = caap.navigate2("guildv2_conquest_command");
					stats.LoMland = result == 'done' ? nextLand.index : stats.LoMland;
				} else {
					myLand = conquestLands.records[myIndex];
					// If I can move, and there is an enter-able land with enough time for me to join it and get back to my land, then join.
					if (myLand.status == 'enter' && nextLand.index !== myIndex && myLand.phaseLeft > Math.min(nextLand.phaseLeft + 24, nextLand.timeLeft) + 2) {
						result = caap.navigate2('ajax:guildv2_conquest_command.php?tier=3,clickimg:_smallX.jpg');
						stats.LoMland = result == 'done' ? -1 : stats.LoMland;
					}
				}
				if (result == 'fail') {
					schedule.setItem('LoMmoveWait', 5 * 60);
				}
			}
            return result == 'done' || result === true;
        } catch (err) {
            con.error("ERROR in LoMmove: " + err.stack);
            return false;
        }
    };
	
    caap.checkMyGuildIds = function () {
		try {
			var tempDiv = $j("#guildv2_formation_middle"),
				tempArray=[], i;
				
			con.log(2, 'checkMyGuildIds');        
			if ($u.hasContent(tempDiv)) {
				
				
				//Checking caap.MyGuildIds
				for (i=0;i<100;i++) {
					try {
						tempDiv = $j("#player"+i); 
						if ($u.hasContent(tempDiv)) {
							/*jslint evil: true */
							tempArray.push(eval(tempDiv.attr("key")));
							/*jslint evil: false */
						}
					} catch (err) {
						con.error("ERROR in #player"+i+": " + err.stack);					
					}
				}
				
				stats.guild.ids = tempArray;
				statsFunc.setRecord(stats);
			}
			return true;
		} catch (err) {
			con.error("ERROR in checkMyGuildIds: " + err.stack);
			return false;			
		}
    };

}());
