/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global $j,$u,caap,config,con,battle,conquest,worker,stats,statsFunc,conquestLands,loe,lom,essence,gm,
schedule,state,general,session */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          CONQUEST OBJECT
// this is the main object for dealing with Conquest
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add({name: 'conquest', recordIndex: 'userId'});
	
    conquest.record = function(userId) {
        this.data = {
            userId: userId,
            name: '',
            conqRank: -1,
            //arenaRank: -1,
            level: 0,
            army: 0
        };
    };
	
	conquest.init = function() {
		recon.init('Conq' + config.getItem('ConquestType', 'Invade'));
    };
	
	conquest.checkResults = function(page, resultsText) {
        try {
            var tempDiv, text;
			
			switch (page) {
			case 'conquest_duel' :
				// Check coins
				tempDiv = $j("#guild_token_current_value");
				if ($u.hasContent(tempDiv)) {
					stats.guildTokens = caap.getStatusNumbers(tempDiv.eq(0).parent().text().trim());
				} else {
					con.warn("Unable to get Conquest Tokens Div", tempDiv);
				}
				break;
			case 'guild_castle_fort' :  // Land of Earth defense
				if (resultsText.match(/This fortification is already at max capacity/i)) {
					schedule.setItem('loeFortMax', 3 * 3600);
				}
				/* falls through */
			case 'guildv2_conquest_command' : // Land of Mist top
			case 'guildv2_conquest_expansion_fort' :  // Land of ??
			case 'guildv2_conquest_battlelist' : // Land of Mist enemies
			case 'guildv2_monster_list' :  // Land of Mist monsters
			case 'guild_conquest_castle' : // Land of Earth top
			case 'guild_conquest_castle_battlelist' : // Land of Earth enemies
			case 'guildv2_conquest_expansion' : // Land of Mist or Earth tower
				text = $j("#app_body div[style*='conq4_top.jpg']").text().trim().innerTrim();
					
				//7944 5363 GUILD LEVEL: 12 Points to Next Rank: 250 CONQUEST LV: 39 Points to Next Level: 91 13/14 MORE: (9:58) Conqueror 670 Hunter 0 Guardian 150 Engineer 0 Click here to view Conquest Report! Bel Thrall City LAND OF EARTH NONE
				
				// "12631 4736 GUILD LEVEL: 12 Points to Next Rank: 250 CONQUEST LV: 12 Points to Next Level: 134 11/11 Conqueror 460 Engineer 30 Hunter 0 Guardian 150 Click here to view Conquest Report! Malcaster Castle DEF silo"
				
				if (!caap.bulkRegex(text,
					/(\d+) (\d+) GUILD LEVEL: (\d+) Points to Next Rank: \d+ CONQUEST LV: (\d+) Points to Next \w+: (\d+) (\d+)\/(\d+)/,
					stats, ['resources.lumber', 'resources.iron', 'guild.level', 'rank.conquestLevel', 'conquest.dif', 'guildTokens.num', 'guildTokens.max'])) {
					con.warn('Conquest: unable to conquest information and resources', text);
				}
				
				conquest.categories.forEach( function(c) {
					if (!caap.bulkRegex(text, RegExp(c + ' (\\d+)'), stats, ['conquest.' + c])) {
						con.warn('Conquest: unable to read ' + c + ' points', text);
					}
				});

				statsFunc.setRecord(stats);
				break;
				
			default :
				if (!caap.oneMinuteUpdate('checkConquestTokens')) {
					return false;
				}
				stats.guildTokens.num = $j('#persistHomeConquestPlateOpen').text().numberOnly();
				statsFunc.setRecord(stats);
				break;
			}

            return false;
        } catch (err) {
            con.error("ERROR in conquest.checkResults: " + err.stack);
            return false;
        }
	};

	worker.addAction({worker : 'conquest', priority : 500, description : 'Using Conquest Coins'});
	
    conquest.worker = function() {
        try {
            var whenconquest = config.getItem('WhenConquest', 'Never'),
                conquesttype = config.getItem('ConquestType', 'Invade'),
				result;

            if (whenconquest === 'Never') {
                return {action: false, mess: ''};
            }

			if (stats.guildTokens.num > stats.guildTokens.max && caap.navigateTo('conquest_duel')) {
				return {mlog: 'Checking coins'};
			}

            /*-------------------------------------------------------------------------------------\
			LoE and LoM checks
			\-------------------------------------------------------------------------------------*/

			result = loe.worker('your', 'loe');
			if (result && (!$u.isObject(result) || $u.setContent(result.action, true))) {
				return result;
			}
			if (config.getItem('lomPriority', 'Guardian') == 'Guardian') {
				result = loe.worker('your', 'lom');
				if (result && (!$u.isObject(result) || $u.setContent(result.action, true))) {
					return result;
				}
				result = loe.worker('enemy', 'loe');
				if (result && (!$u.isObject(result) || $u.setContent(result.action, true))) {
					return result;
				}
			} else {
				result = loe.worker('enemy', 'loe');
				if (result && (!$u.isObject(result) || $u.setContent(result.action, true))) {
					return result;
				}
				result = loe.worker('your', 'lom');
				if (result && (!$u.isObject(result) || $u.setContent(result.action, true))) {
					return result;
				}
			}

			if (stats.guildTokens.num < stats.conquest.dif || stats.guildTokens.num == 0){ // Burn tokens if able to level up
				switch (whenconquest) {
				case 'At Max Coins' :
					if (stats.guildTokens.max >= 10 && stats.guildTokens.num !== stats.guildTokens.max) {
						return {action: false, mess: 'Waiting Max coins ' + stats.guildTokens.num + '/' + stats.guildTokens.max};
					}
					break;
				case 'At X Coins' :
					if (stats.guildTokens.num >= config.getItem('ConquestXCoins', 1)) {
						state.setItem('conquest_burn', true);
					} else if (stats.guildTokens.num <= config.getItem('ConquestXMinCoins', 0)) {
						state.setItem('conquest_burn', false);
						return {action: false, mess: 'Waiting X coins ' + stats.guildTokens.num + '/' + config.getItem('ConquestXCoins', 1)};
					}
					if (stats.guildTokens.num < config.getItem('ConquestXCoins', 1) && !state.getItem('conquest_burn', false)) {
						state.setItem('conquest_burn', false);
						return {action: false, mess: 'Waiting X coins ' + stats.guildTokens.num + '/' + config.getItem('ConquestXCoins', 1)};
					}
					break;
				case 'Coins Available' :
					if (stats.guildTokens.num === 0) {
						return {action: false, mess: 'Waiting for Coins ' + stats.guildTokens.num + '/1'};
					}
					break;
				}
			}

			// Check health ok
            if (!caap.checkStamina('Conquest', 1)) {
                return {action: false, mess: 'Not enough health for ' + conquesttype};
            }
			
			return battle.common('Conq' + conquesttype, 'Freshmeat');

        } catch (err) {
            con.error("ERROR in conquest.worker: " + err.stack);
            return false;
        }
    };
	
	conquest.categories = ['Conqueror','Guardian','Hunter','Engineer'];

	worker.addPageCheck({page : 'ajax:guildv2_conquest_command.php?tier=3', hours : 1});
	
    conquest.collect = function() {
        try {
            var check = false, 
				message = [], 
				pts = 0,
				when,
				vals = [0, 1000, 3000];
		
			check = ['Conqueror','Guardian','Engineer'].every( function(category) {
				when = config.getItem('When' + category, 'Never');
				if (when == 'Never') {
					return true;
				}
				pts = stats.conquest[category];
				if (when == 'Round Up') {
					if (pts - caap.minMaxArray(vals, 'max', -1, pts + 1) < 200 || pts > 4500) {
						if (pts > 1000) {
							message.push(category + ' points rounding at ' + pts);
						}
						return true;
					}
					return false;
				} 
				if (pts > when) {
					message.push(category + ' points ' + pts + ' over ' + when);
					return true;
				}
			});
			
			if (check && message.length) {
				check = caap.navigate3('guildv2_conquest_command.php?tier=3','conquest_path_shop.php?action=report_collect&ajax=1');
				if (check) {
					con.log(1, message.join(', ') + ' so clicking report collect');
					if (check == 'done') {
						conquest.categories.forEach( function(category) {
							stats.conquest[category] = 0;
						});
					}
				}
				return check;
			}
			return false;
        } catch (err) {
            con.error("ERROR in conquest.collect: " + err.stack);
            return;
        }
    };
	
    conquest.engineer = function() {
        try {
			var result = caap.checkEnergy('Quest', config.getItem('WhenQuest','Never')),
				pointsLeft = config.getItem('WhenEngineer', 'Never') - stats.conquest.Engineer,
				improveCount = Math.min(10, Math.floor(result/30), Math.ceil(pointsLeft / 19.5)),
				eO = {},
				type = config.getItem('conquestEngEss', 'Attack').toLowerCase(),
				tower = ['attack', 'defense', 'damage', 'health'].indexOf(type) + 1;
				
			if (result < 30) {
				return {action: false, mess: 'Waiting for Energy to fortify LoE: ' + result + '/' + 30};
			}

			if (!schedule.check('loeFortMax')) {
				return false;
			}
			
			if (improveCount > 0) {
				result = caap.navigate3('guild_castle_fort.php',
					'guild_castle_fort.php?improveCount=' + improveCount + '&tower=' + tower + '&fort_id=' + (tower + 11),
					'',	{failWaitHours: 3});
				if (result) {
					if (result == 'done' && $u.hasContent(stats.guild.id)) {
						eO = essence.getRecord(stats.guild.id);
						eO[type] += 200 * improveCount;
						essence.setRecord(eO);
					}
					return {mlog: 'Fortifying LoE ' + type + ' tower for 30 energy. ' + stats.conquest.Engineer + '/' + config.getItem('WhenEngineer', 'Never') + ' Engineeer points'};
				}
			}
			return false;
        } catch (err) {
            con.error("ERROR in conquest.engineer: " + err.stack);
            return;
        }
    };
	
    conquest.menu = function() {
        try {
            var XConquestInstructions = "Start battling if Guild Coins is above this points",
                XMinConquestInstructions = "Do not conquest if Guild Coins is below this points",
                maxChainsInstructions = "Maximum number of chain hits after the initial attack.",
                minRankInst = "The lowest rank that you are willing to spend your Guild Coins on. " +
					"Use +/- to indicate relative rank, e.g. -2 to attack opponents down to two ranks below your rank. " +
					"If no +/-, the number is an absolute rank, e.g. 16 would mean do not attack below rank Baron (16). " +
					"Leave blank to attack any rank.",
                maxRankInst = "The highest rank that you are willing to spend your Guild Coins on. " +
					"Use +/- to indicate relative rank, e.g. +2 to attack opponents up to two ranks over your rank. " +
					"If no +/-, the number is an absolute rank, e.g. 16 would mean do not attack above rank Baron (16). " +
					"Leave blank to attack any rank.",
                conquestList = ['Coins Available', 'At Max Coins', 'At X Coins', 'Never'],
                conquestInst = [
                    'Guild Coins Available will conquest whenever you have enough Guild Coins',
                    'At Max Guild Coins will conquest when Guild Coins is at max and will burn down all Guild Coins when able to level up',
                    'At X Guild Coins you can set maximum and minimum Guild Coins to conquest',
                    'Never - disables'
                ],
                levelsInst = [
                    'Pick best target for conquest points, regardless of level bracket',
                    'Target levels 300 and up',
                    'Target levels 600 and up',
                    'Target levels 900 and up'
                ],
                typeList = ['Invade', 'Duel'],
                levelList = ['Any', '301+', '601+', '901+'],
                typeInst = ['Conquest using Invade button', 'Conquest using Duel button - no guarentee you will win though'],
                htmlCode = '',
				catList = [],
				essList = ['Attack', 'Damage', 'Defense', 'Health'],
				LoMList = ['Never','Next','Newest'],
				LoMInst = ['Do not move to defend LoM lands',
					'Move to the next LoM that will defend',
					'Move to the LoM with the most hours left on it that will be in defense at the same time as the next one'],
				lomScoringInst = "List of score adjustments to pick targets",
				conq = 'Except for Hunter or "Never" settings, all conditions must be met to collect',
				eng = 'Except for Hunter or "Never" settings, all conditions must be met to collect',
				hunter = 'If collect monsters turned on under monsters, they will be collected until this number met',
				guardian = 'Except for Hunter or "Never" settings, all conditions must be met to collect',
				inst = {Conqueror: [conq, conq, conq, conq],
					Engineer: [eng, eng, eng, eng],
					Hunter: [hunter, hunter, hunter, hunter],
					Guardian: [guardian, guardian, guardian, guardian]};

            htmlCode = caap.startToggle('Conquesting', 'CONQUEST BATTLE');
            htmlCode += caap.makeDropDownTR("Conquest When", 'WhenConquest', conquestList, conquestInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenConquest', 'isnot', 'Never');
            htmlCode += caap.display.start('WhenConquest', 'is', 'At X Coins');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'ConquestXCoins', XConquestInstructions, 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'ConquestXMinCoins', XMinConquestInstructions, 0, '', '', true, false);
            htmlCode += caap.display.end('WhenConquest', 'is', 'At X Coins');
            htmlCode += loe.conquestMenu();
            htmlCode += lom.conquestMenu();
            htmlCode += caap.display.start('WhenLoE', 'isnot', 'Always');
            htmlCode += caap.makeDropDownTR("Conquest Type", 'ConquestType', typeList, typeInst, '', '', false, false, 62);
            htmlCode += caap.makeDropDownTR("Target Level", 'conquestLevels', levelList, levelsInst, '', 'Any', false, false, 62);
            htmlCode += caap.makeNumberFormTR("Max Chains", 'ConquestMaxChains', maxChainsInstructions, 4, '', '');
            htmlCode += caap.makeTD("Attack targets that are not:");
            htmlCode += caap.makeNumberFormTR("Lower Than Rank", 'ConquestMinRank', minRankInst, '', '', 'text'); // Check +1 works
            htmlCode += caap.makeNumberFormTR("Higher Than Rank", 'ConquestMaxRank', maxRankInst, '', '', 'text'); // Check +1 works
            htmlCode += caap.display.end('WhenLoE', 'isnot', 'Always');
            htmlCode += caap.display.end('WhenConquest', 'isnot', 'Never');
            htmlCode += caap.endToggle;

            htmlCode += caap.startToggle('ConquestOptions', 'CONQUEST OPTIONS');
            htmlCode += caap.makeDropDownTR('Move to defend LoM lands', 'doLoMmove', LoMList, LoMInst, '', 'Never', false, false, 62);
            htmlCode += caap.makeCheckTR('Enable Resource Collect', 'doConquestCollect', false, '');
            htmlCode += caap.makeCheckTR('Enable Hero Crystal Collect', 'doConquestCrystalCollect', false, '');
			conquest.categories.forEach(function (category) {
				catList = ['Never','1000','3000','4500'].concat(category != 'Hunter' ? ['Round Up'] : []);
				htmlCode += caap.makeDropDownTR("Collect " + category, 'When' + category, catList, inst[category], '', 'Never', false, false, 62);
				if (category == 'Guardian') {
					htmlCode += caap.display.start('WhenGuardian', 'isnot', 'Never');
					htmlCode += caap.makeTD("Rate targets by: <a href='http://caaplayer.freeforums.org/viewtopic.php?f=9&t=830' target='_blank' style='color: blue'>(INFO)</a>");
					htmlCode += caap.makeTextBox('lomScoring', lomScoringInst, 'heal[],dispel[],revive[],guardian[],smokebomb[]', '');
					htmlCode += caap.display.end('WhenGuardian', 'isnot', 'Never');
				}
			});
			
            htmlCode += caap.display.start('WhenEngineer', 'isnot', 'Never');
			htmlCode += caap.makeDropDownTR(" Essence", 'conquestEngEss', essList, '', '', 'Attack', false, false, 62);
            htmlCode += caap.display.end('WhenEngineer', 'isnot', 'Never');
			
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in conquest.menu: " + err.stack);
            return '';
        }
    };

}());

(function() {
    "use strict";

    conquestLands.records = [];

    conquestLands.record = function() {
        this.data = {
            'name': '',
            'index': 0,
            'status': 0,
            'timeLeft': 0,
            'phaseLeft': 0,
            'defenders': 0,
            'stateTimeLeft': 0,
            'newRecord': true
        };
    };

    conquestLands.hbest = 2;

    conquestLands.load = function() {
        try {
            conquestLands.records = gm.getItem('conquestLands.records', 'default');
            if (conquestLands.records === 'default' || !$j.isArray(conquestLands.records)) {
                conquestLands.records = gm.setItem('conquestLands.records', []);
            }

            conquestLands.hbest = conquestLands.hbest === false ? JSON.hbest(conquestLands.records) : conquestLands.hbest;
            con.log(2, "conquestLands.load Hbest", conquestLands.hbest);
            session.setItem("ConquestDashUpdate", true);
            con.log(1, "conquestLands.load", conquestLands.records);
            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.load: " + err.stack);
            return false;
        }
    };

    conquestLands.save = function(src) {
        try {
            var compress = false;
            if (caap.domain.which === 3) {
                caap.messaging.setItem('conquestLands.records', conquestLands.records);
            } else {
                gm.setItem('conquestLands.records', conquestLands.records, conquestLands.hbest, compress);
                con.log(2, "conquestLands.save", conquestLands.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    caap.messaging.setItem('conquestLands.records', conquestLands.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("ConquestDashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.save: " + err.stack);
            return false;
        }
    };

    conquestLands.clear = function() {
        try {
            conquestLands.records = [];
            conquestLands.save();
            session.setItem("ConquestDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.clear: " + err.stack);
            return false;
        }
    };

    conquestLands.getItem = function(index) {
        try {
            var newRecord = null;

            if (index === '' || $u.isNaN(index) || index < 0) {
                con.warn("index", index);
                throw "Invalid identifying index!";
            }

            if (index < conquestLands.records.length) {
                con.log(3, "Got conquest land record", index, conquestLands.records[index]);
                conquestLands.records[index].newRecord = false;
                return conquestLands.records[index];
            }

            newRecord = new conquestLands.record().data;
            newRecord.index = index;
            con.log(2, "New conquest record", index, newRecord);
            return newRecord;
        } catch (err) {
            con.error("ERROR in conquestLands.getItem: " + err.stack);
            return false;
        }
    };

    conquestLands.setItem = function(record) {
        try {
            var it = 0,
                success = false;

            for (it = 0; it < conquestLands.records.length; it += 1) {
                if (conquestLands.records[it].index === record.index) {
                    success = true;
                    break;
                }
            }

            record.newRecord = false;
            if (success) {
                conquestLands.records[it] = record;
                con.log(1, "Updated conquestLands record", record, conquestLands.records);
            } else {
                conquestLands.records.push(record);
                con.log(1, "Added conquestLands record", record, conquestLands.records);
            }
// this causes errors, need to look at it
//            conquestLands.save();
            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.setItem: " + err, record);
            return false;
        }
    };
}());
