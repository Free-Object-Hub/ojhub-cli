let gProfileMini = jId => {
    let J = Jexec(jId);
    let buttons = '';
    for (let i = 0; i <= 2; i++) {
		let [smallString, bigString] = GDPSswitchChannel(i);
		buttons += basicButton(getTrans('add'+bigString), `addFind(${jId},${i})`, 'font-size:calc(var(--def-font)*1.5)');
	}
    buttons += basicButton(getTrans('addVacs'), `addVacsPre(${jId})`, 'font-size:calc(var(--def-font)*1.5)');
    buttons += basicButton(getTrans('addWIki'), `createWiki(${jId},1)`, 'font-size:calc(var(--def-font)*1.5)');
    J.link.set('profile');
    let accStatus = thisUser.isActive ? getTrans('isActive') : getTrans('isNotact'),
		html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('yourProf')}/h1>`+
		`<div>`+
			buttons+
		`</div>`+
		`<p><span${getTrans('profName')}/span>: <span id=oldNick>${thisUser.username}</span></p>`+
		basicButton(getTrans('edit'), `editNickPre(${jId})`)+
		`<div style=position:relative id=newNick></div>`+
		`<p><span${getTrans('profResume')}/span>: `+
			`<p id=oldResume>${thisUser.resume == '' ? '' : `<span class=framegdpsOld style="display:block;width:calc(100% - 14px)">${thisUser.resume.replaceAll('\\n', '<br>')}</span>`}</p>`+
		`</p>`+
		basicButton(getTrans('edit'), `editResumePre(${jId})`)+
		`<div style=position:relative id=newResume></div>`+
		`<p><span${getTrans('profSocials')}/span>: `+
			`<p id=oldSocials>${thisUser.socials == '' ? '' : `<span class=framegdpsOld style="display:block;width:calc(100% - 14px)">${thisUser.socials.replaceAll('\\n', '<br>')}</span>`}</p>`+
		`</p>`+
		basicButton(getTrans('edit'), `editSocialsPre(${jId})`)+
		`<div style=position:relative id=newSocials></div>`+
		`<p><span${getTrans('profId')}/span>: ${thisUser.ID}</p>`+
		`<p><span${getTrans('profRole')}/span>: ${toStringRole(thisUser.role)}</p>`+
		`<p><span${getTrans('profAccs')}/span> <span${accStatus}/span></p>`+
		(thisUser.isActive === 0 ? `<h2${getTrans('needEmailVerify')}/h2>`+
		 basicButton(getTrans('enterCode1'), `innerMain(${jId},verifyWindow(${jId}))`)+'<br><br><br>' : '')+
		basicButton('>write to support<', `ADwrite(${jId})`)+
	`</div>`;
    return html;
},
editNickPre = jId => {
    let J = Jexec(jId);
    J.id('newNick').innerHTML =
	`<input class="framelabel" id=newNick2${getTrans('newNick', 'input')}`+
	`<button onclick="editNick(${jId})" class=loginbtn${getTrans('edit')}/button>`;
},
editNick = jId => {
    let J = Jexec(jId);
    let newNick = J.id('newNick2').value;
    helperRequest(`${sData[5]}setNickname${php}?name=${newNick}`)
		.then(data=>{
			let timename = thisUser.username.slice();
			thisUser.username = data;
			for (let gdpsType in myGdpses)
				for (let gdpsKey in myGdpses[gdpsType]) 
					if (myGdpses[gdpsType][gdpsKey].userName == timename) 
						myGdpses[gdpsType][gdpsKey].userName = data;

			J.id('oldNick').innerHTML = data;
			J.id('newNick').innerHTML = '';
		})
},
editResumePre = jId => {
    let J = Jexec(jId);
    J.id('newResume').innerHTML =
	`<textarea class="framelabel" style="width:calc(100% - 40px);height:160px" id=newResume2${getTrans('newResume', 'textarea')}/textarea>`+
	`<button onclick="editResume(${jId})" class=loginbtn${getTrans('edit')}/button>`;
},
editResume = jId => {
    let J = Jexec(jId);
    let newResume = J.id('newResume2').value.replaceAll('\n','\\n');
    helperRequest(`${sData[5]}setResume${php}`, `name=${newResume}`)
		.then(data=>{
			thisUser.resume = data;
			if (data != '')
				J.id('oldResume').innerHTML = `<span class=framegdpsOld style="display:block;width:calc(100% - 40px)">${data.replaceAll('\\n', '<br>')}</span>`;
			else 
				J.id('oldResume').innerHTML = '';
			J.id('newResume').innerHTML = '';
		})
},
editSocialsPre = jId => {
    let J = Jexec(jId);
    J.id('newSocials').innerHTML =
	`<textarea class="framelabel" style="width:calc(100% - 40px);height:160px" id=newSocials2${getTrans('newSocials', 'textarea')}/textarea>`+
	`<button onclick="editSocials(${jId})" class=loginbtn${getTrans('edit')}/button>`;
},
editSocials = jId => {
    let J = Jexec(jId);
    let newSocials = J.id('newSocials2').value.replaceAll('\n','\\'+'n');
    helperRequest(`${sData[5]}setSocials${php}`, `name=${newSocials}`)
		.then(data=>{
			thisUser.socials = data;
			if (data != '')
				J.id('oldSocials').innerHTML = `<span class=framegdpsOld style="display:block;width:calc(100% - 40px)">${data.replaceAll('\\n', '<br>')}</span>`;
			else 
				J.id('oldSocials').innerHTML = '';
			J.id('newSocials').innerHTML = '';
		})
},
renderDevices = (jId, devicesJson) => {
    let J = Jexec(jId);
    let html = '',
			currentData = ['',''];
    for (let deviceId in devicesJson) {
		let device = devicesJson[deviceId];
		currentData = ['',''];
		if (device.userAgent === navigator.userAgent)
			currentData = [` <span style=opacity:50%${getTrans('currentDevice')}/span>`,",'Current'"];
		html += 
		`<div class=framegdpsOld style="width:calc(100% - 40px)" id=device${deviceId}>`+
			`<h2>${device.platform}${currentData[0]}</h2>`+
			`<p>${device.browser}</p>`+
			`<p>${device.country}, ${device.city}</p>`+
			basicButton(getTrans('delete'), `removeDevice(${jId},0,${deviceId}${currentData[1]})`)+
		`</div>`;
	}
    return html;
},
FINDrenderInProfileFull = (jId, channel, parsedData) => {
    let J = Jexec(jId);
    let html = '',
		Count = 0,

		gdpsData = null,
		thisId = null,
		title = null,
		description = null,
		likesCount = null,
		userId = null,
		username = null,
		pictureLink = null,
		bannerLink = null,
		renderJoinLink = null,
		PointsPre = null,
		Points = null,
		checked = null,
		connectedWiki = null,
		coownersBtn = '',

		[smallString, bigString, tinyStr] = GDPSswitchChannel(channel);

    for (let Id in parsedData) {
		Count++;
		if (Count == 9)
			return html;
		
		gdpsData = parsedData[Id];
		thisId = gdpsData.ID;
		title = gdpsData.title;
		description = gdpsData.text.split('\n').join('</p><p>');
		likesCount = gdpsData.likes;
		userId = gdpsData.author;
		username = gdpsData.username;
		pictureLink = gdpsData.img;
		bannerLink = gdpsData.ban;
		renderJoinLink = gdpsData.freejoin;
		checked = gdpsData.checked;
		connectedWiki = gdpsData.wiki;
		coownersBtn = '';

		renderJoinLink = renderJoinLink ? null : `<button class="loginbtn" onclick=getCamp(${jId},${thisId}) ${getTrans('openGdps')}/button>`;

		html += 
		`<div class="framegdpsOld" style="width:calc(100% - 40px);" id="${thisId}">`+
			`<h2 style="display:inline;margin-right:4px">${title}</h2>`+
			`<p style="display:inline;margin:0">`+
				`<span${getTrans('addedBy')}/span>:`+
				emptyButton(`>${username} <`, `otherProfile(${jId},${userId},'pageFind(${jId},${channel})')`, 'margin:2px')+
				`<span style=opacity:50%>ContentId: ${thisId}</span>`+
			`</p>`+
			`<div style="min-height:32px;margin:8px 0 0 0">`+
				`<img onerror="console.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=64px height=64px style="border-radius:calc(var(--def-border-small)*1.5)">`+
				`<p>${description}</p>`+
			`</div>`+
			basicButton(getTrans('actions'), `makeSwticher(${jId},0,'proj${thisId}', projectBtnsSwticher(${jId},${thisId},${channel}), 'proj-${thisId}')`)+
			`<div id=proj-${thisId} style=position:relative>`+
			`</div><br><br>`+
			basicButton(getTrans('openGdps'), `get${bigString}(${thisId})`)+
			basicButton(getTrans('edit'+bigString), `editFind(${jId},${channel},${thisId})`)+
			basicButton(getTrans('vacancies'), `getVacancies(${jId},${channel},${thisId})`)+
			// `<span${getTrans('isJE')}/span>:`+basicButton(getTrans(!!renderJoinLink ? 'no' : 'yes'), `JEedit(${jId},${thisId})`, '', 'JE'+thisId)+'<br>'+
		`</div>`;
	}
    return html;
},
GUIDrenderInProfileFull = (jId, parsedData, page = 0) => {
    let J = Jexec(jId);
    if (J.id('nextGdps'))
		J.id('nextGdps').remove();

    page++;

    let html = '',
		Count = 0,
		
		gdpsData = null,
		id = null,
		guidTitle = null,
		guidLang = null,
		date = null,
		likes = null,
		guidImg = null,
		userId = null;

    for (let Id in parsedData) {
		Count++;
		if (Count == 11) {
			innerGdpsPlace(jId, insertBtn(jId, `getGuidesAdminControl(${jId},${J.globalWiki},${page})`),-1);
			return html;
		}

		gdpsData = parsedData[Id];
		id = gdpsData[0];
		guidTitle = gdpsData[1];
		guidLang = gdpsData[2];
		date = gdpsData[3];
		likes = gdpsData[4];
		guidImg = gdpsData[5];
		userId = gdpsData[6];

		html += 
		`<div class=framegdps style="width:300px;height:300px" id="${id}">`+
			`<img width=316px height=132px src="${guidImg}" onerror="console.warn('broken link ${guidImg}');this.src='${helperUrl}imgs/hubemp.png'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:var(--def-border);border-top-right-radius:var(--def-border)">`+
			`<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img class=FGDPSimg src="${helperUrl}imgs/${guidLang}.png"></h2>`+
			`<div style="position: absolute;top: 0;left: 0;width: 316px;height: 60px;margin-top: 72px;background: linear-gradient(rgba(0,0,0,0), var(--color-profile-alpha), var(--color-profile));"></div>`+
			`<div style="bottom:12px;left:20px" class="absolute btnszone">`+
				basicButton(getTrans('edit'), `editGuide(${jId},${id},${J.globalWiki},1)`, 'margin-top:8px')+
				basicButton(getTrans('settings000'), `guideSettings(${id})`, 'margin-top:8px')+
			`</div>`+
		`</div>`;
	}
    return html;
},
guideSettings = (guideId)=>{
	if (_.$.id('guidTag'+guideId))
		return;
	let windowName = 'guidSettings',
		helperWindowId = _.win.open(windowName,
		`<h2 id=wikiName${guideId}></h2>`+
		`<div style=display:flex>`+
			`<span style=margin-top:calc(var(--def-btn-size)*0.75)${getTrans('tagSetup01')}/span>`+
			basicInput('tagSetup01', `guidTag${guideId}`, 'calc(100% - 14px)')+'<br>'+
			basicButton(getTrans('tagSetup02'), `setWikiTag(${guideId})`)+
		`</div>`+
		basicButton(getTrans('WINDOW-close'), `_.wins['{winId}'].close()`)+'<br>'
	);
	Loading();
	helperRequest(`${sData[7]}getGuide${php}?id=${guideId}&wiki=${J.globalWiki}`)
		.then(data=>{
			Loading(1);
			let parsedData = JSON.parse(data),
				guideinfo = parsedData['guideinfo'];
			_.$.id('wikiName'+guideId).innerHTML = guideinfo[1];
			_.$.id('guidTag'+guideId).value = guideinfo[3];
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
setWikiTag = (guideId)=>{
	let tagName = _.$.id('guidTag'+guideId).value;
	Loading();
	helperRequest(`${sData[7]}setWikiTag${php}?id=${guideId}&wiki=${J.globalWiki}&tag=${tagName}`)
		.then(data=>{
			Loading(1);
			if (data == '-1')
				megaAlert(jId, 'tagBan01');
			else if (data == '-2')
				megaAlert(jId, 'tagBan02');
			else if (data == '-3')
				megaAlert(jId, 'tagBan03');
			else {
				megaAlert(jId, 'tagDone');
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
WIKIrenderInProfileFull = (jId, parsedData) => {
    let J = Jexec(jId);
    let html = '',
		count = 0;
    gdpsData = null,
    id = null,
    title = null,
    text = null,
    img = null,
    language = null,
    date = null,
    likesCount = null,
    userId = null,
    coownersBtn = null,
    connectedContent = null,
    forum = null,
    mainWiki = null;

    for (let Id in parsedData) {
		count++;
		if (count == 9)
			return html;
		
		gdpsData = parsedData[Id];
		id = gdpsData.ID;
		title = gdpsData.title;
		text = gdpsData.text.split('\n').join('</p><p>');
		img = gdpsData.ban;
		language = gdpsData.language;
		date = gdpsData.date;
		likesCount = gdpsData.likes;
		userId = gdpsData.userId;
		coownersBtn = '';
		connectedContent = gdpsData.connGdps;
		forum = gdpsData.forumId;
		mainWiki = gdpsData.mainWiki;

		html += 
		`<div class=framegdpsOld style="width:calc(100% - 40px);" id="${id}">`+
			`<h2 style="display:inline;margin-right:4px">${title}</h2>`+
			`<span style=opacity:50%>WikiId: ${id}</span>`+
			`<div style=min-height:64px>`+
				`<img onerror="this.src='${helperUrl}imgs/hubbig.png'" align=left src="${decodeURIComponent(img)}" width=64px height=64px style="border-radius:calc(var(--def-border-small)*1.5)">`+
				`<p>${text}</p>`+
			`</div>`+
			// basicButton(getTrans('actions'), `makeSwticher(${jId},0,'wikiswitch${id}', wikiBtnsSwticher(${jId},${id}), 'wikiswitch-${id}')`)+
			`<div id=wikiswitch-${id} style=position:relative>`+
			`</div><br>`+
			basicButton(getTrans('wikiControl'), `wikiControl(${jId},${id})`)+
		`</div>`;
	}
    return html;
},
getFullAlarm = (jId, id) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[0]}getAlarm${php}?id=${id}`)
	.then(data=>{
		let alarm = JSON.parse(data),
			html = 
		`<div id=fullAlarm align=left style=margin-left:12px>`+
			`<h1>${alarm.title}</h1>`+
			`<p>${alarm.text}</p>`+
			`<span${getTrans('addedBy')}/span> - `+
			`<button class=emptybtn onclick="otherProfile(${jId},${alarm.adminId},'alarmsWindow(${jId});GetAlarms(${jId})')">${alarm.adminName}</button><br><br>`+
			`<button class=loginbtn onclick="removeAlarm(${jId},${alarm.ID})"${getTrans('delete')}/button>`+
		`</div>`;
		if (J.id('btn'+id))
			J.id('btn'+id).style.backgroundColor = '';
		J.id('alarms_big').innerHTML = html;
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
removeAlarm = (jId, id) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[1]}deleteAlarm${php}?id=${id}`)
	.then(()=>{
		J.id('btn'+id).remove();
		J.id('fullAlarm').remove();
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
JEedit = (jId, gdpsId) => {
    let J = Jexec(jId);
    Loading();
    helperRequest(`${sData[1]}setj${php}?id=${gdpsId}`)
		.then(data=>{
			if (data == '-2')
				return _.err.log('Access denied');
			J.id('JE'+gdpsId).innerHTML = getTrans(data, 0);
			Loading(1);
		});
},
ballsUp = (jId, gdpsId, type = 'g') => {
    let J = Jexec(jId);
    Loading();
    helperRequest(`${sData[1]}bump${php}?id=${gdpsId}`)
		.then(data=>{
			if (data == 'no') 
				return J.id('BL'+gdpsId).innerHTML = getTrans('campunckecked', 0);
			let pData = JSON.parse(data),
				canBump;
			if (pData[2] > 0) {
				canBump = `<span${getTrans('isBL')}/span>`;
			} else {
				canBump = `<span${getTrans('wait1')}/span>${Math.abs(pData[2])}<span${getTrans('wait2')}/wait>`;
				if (pData[2] == -7200) {
					megaAlert(jId, 'bumped');
					myGdpses[J.ProjectsChannel][gdpsId].points = pData[0];
				}
			}
			J.id('BL'+gdpsId).innerHTML = canBump;
			Loading(1);
		});
},
coownersMenu = (id, contentType)=>{
	if (_.$.q(`[coowners_${contentType}_${id}]`))
		return 0;
	Loading();
	helperRequest(`${sData[0]}getOwners${php}?id=${id}&type=${contentType}`)
		.then(data=>{
			let parsedData = JSON.parse(data),
			tables = '';
			parsedData[1].forEach(arrat=>{
				tables +=
					`<tr id=perm${arrat[1]}>`+
						`<td>`+
							arrat[0]+
						`</td>`+
						`<td>`+
							`<button class=loginbtn onclick="deleteOwner(${id},${contentType},${arrat[1]})"${getTrans('delete')}/button>`+
						`</td>`+
					`</tr>`;
			});

			_.win.open('coownersmenu',
				`<div align=left>`+
				`<h1><span${getTrans('coowners')}/span> ${parsedData[0]}</h1>`+
				`<table id=comments>`+
					`<tr>`+
						`<td${getTrans('profName')}/td>`+
						`<td${getTrans('delete')}/td>`+
					`</tr>`+
					tables+
				`</table><br><br>`+
				`<input style="width:120px" id="addown" class="framelabel"${getTrans('idOrName', 'input')}`+
				`<button class="loginbtn" onclick="ownersAdd(${id},${contentType})">+</button>`+
			`</div>`
			, `coowners_${contentType}_${id}`);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
ownersAdd = (id, contentType)=>{
	let userData = _.$.id('addown').value;
	Loading();
	helperRequest(`${sData[1]}permAdd${php}?id=${id}&type=${contentType}&user=${userData}`)
		.then(data=>{
			if (data == '-2')
				return _.err.log('Access denied');
			let parsedData = JSON.parse(data),
				html =
				`<tr id=perm${parsedData[1]}>`+
					`<td>`+
					parsedData[0]+
					`</td>`+
					`<td>`+
						`<button class=loginbtn onclick="deleteOwner(${id},${contentType},${parsedData[1]})"${getTrans('delete')}/button>`+
					`</td>`+
				`</tr>`;
			innerComments(jId, html, 1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
deleteOwner = (contentId, contentType, userId)=>{
	Loading();
	helperRequest(`${sData[1]}perm${php}?id=${contentId}&type=${contentType}&user=${userId}`)
		.then(data=>{
			if (data == '-2')
				return _.err.log('Access denied');
			_.$.id('perm'+userId).remove();
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
mediaselector = (jId, id, inputtype) => {
    let J = Jexec(jId);
    let fileTrans = '';
    if (id === 'img')
		fileTrans = 'Picture01';
	else 
		fileTrans = 'Picture02';

    if (inputtype === 'toimg') {
		J.id('mediaselector'+id).innerHTML = 
		`<input type=text class=framelabel name=${id} style=width:40%${getTrans('campInput04', 'input')}`+
		`<button class=loginbtn onclick="mediaselector(${jId},'${id}','tofile')"${getTrans('campInput07')}/button>`;
	} else {
		J.id('mediaselector'+id).innerHTML = 
		`<input type=file class=framelabel name=${id} style=width:40%>`+
		`<button class=loginbtn onclick="mediaselector(${jId},'${id}','toimg')"${getTrans('campInput08')}/button>`+
		`<br><span style=opacity:50%${getTrans(fileTrans)}/span>`;
	}
},
generateSocialNetworks = (jId, HTMelement, editModeValue = '') => {
    let J = Jexec(jId);
    if (J.qa(`[socialnetwork=${HTMelement.value}]`).length == 0)
		switch (HTMelement.value) {
			case 'telegram':
				innerGdpsPlace(jId, 
					socialNetwork(jId, 'telegram', editModeValue)
				,1);
				break;
			case 'youtube':
				innerGdpsPlace(jId, 
					socialNetwork(jId, 'youtube', editModeValue)
				,1);
				break;
			default:
			case 'discord':
				innerGdpsPlace(jId, 
					socialNetwork(jId, 'discord', editModeValue)
				,1);
				break;
		}
},
socialNetwork = (jId, type, value) => {
    let J = Jexec(jId);
    return `<div style=display:flex>`+
		`<input type=hidden name=links[] value="${type}">`+
		`<input class=framelabel type=text name=links[] socialnetwork=${type} value="${value}" style=width:100% required placeholder=${type}>`+
		`<button class=loginbtn onclick=this.parentElement.remove()>-</buttin>`+
	`</div>`;
},
accountIsntActiveAlert = ()=>{
	megaAlert(jId, ['profAccs', 'isNotact', 'needEmailVerify']);
},
addVacsPre = jId => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    if (_.$.q('[vacsaddmodal]'))
		return;
    let gdpsesPre = [],
		option = (title, id, channel)=>`<option value=${channel},${id}>${title}</option>`,
		gdpses = '';
    returnAllProjects().map(el=>gdpsesPre.push({ID:el.ID,title:el.title,channel:el.channel}));
    gdpsesPre.forEach(el=>{
		gdpses += option(el.title, el.ID, el.channel);
	});
    if (gdpsesPre.length == 0)
		return _.win.open('vacsaddmodal',
		`<p${getTrans('addVacs03a')}/p>`+
		basicButton(getTrans('otmena'), "_.wins['{winId}'].close()")
	, 'vacsaddmodal');
    _.win.open('vacsaddmodal',
		`<p${getTrans('addVacs01a')}/p>`+
		`<select class="framelabel" onchange="_.wins['{winId}'].close();addVacs(${jId},this.value.split(',')[0],this.value.split(',')[1])">`+
			`<option selected disabled hidden></option>`+
			gdpses+
		`</select>`
	, 'vacsaddmodal');
},
tryAddShow = ()=>{
	let links = document.getElementsByName('links[]').length,
			tags = _.$.qa('[name="tags[]"]:checked').length,
			os = _.$.qa('[name="os[]"]:checked').length;
	if (links === 0) {
		megaAlert(jId, 'linkRequired');
		return false;
	}
	if (tags === 0 || os === 0) {
		megaAlert(jId, 'tagsRequired');
		return false;
	}
	return true;
},
createForum = (forumId, step = 0)=>{
	if (step == 0) {
		_.win.open('forumAlert',
			`<form id={winId}formLINK method=post onsubmit="return false">`+
				`<p style=min-width:180px${getTrans('forumAlert')}/p><br>`+
				`<button onclick=createForum(${forumId},1);_.wins['{winId}'].close() class=loginbtn${getTrans('yes')}/button>`+
				`<button onclick="_.$.id('{winId}formLINK').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('no')}/button>`+
			`</form>`
		)
	} else {
		Loading();
		helperRequest(`${sData[6]}create${php}`, `id=${forumId}`)
			.then(data=>{
				Loading(1);
				openForum(jId, data);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
removeVacPre = (jId, id, gdpsId) => {
    let J = Jexec(jId);
    if (J.q(`[vacremove${id}]`))
		return;
    _.win.open('vacRemove',
		`<p${getTrans('removeSure')}/p>
		${basicButton(getTrans('delete'), `removeVac(jId, ${id},${gdpsId},'{winId}')`)}
		${basicButton(getTrans('otmena'), `_.wins['{winId}'].close()`)}`
	, 'vacremove'+id);
},
removeVac = (jId, id, gdpsId, winId) => {
    let J = Jexec(jId);
    Loading();
    helperRequest(`${sData[8]}removeVac${php}?id=${id}&gdpsId=${gdpsId}`)
		.then(data=>{
			if (data == 1) {
				J.id('v'+id).remove();
				_.wins[winId].close();
			}
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
removeAplPre = (jId, id, gdpsId) => {
    let J = Jexec(jId);
    if (J.q(`[aplremove${id}]`))
		return;
    _.win.open('aplRemove',
		`<p${getTrans('removeSure')}/p>`+
		basicButton(getTrans('delete'), `removeApl(${jId},${id},${gdpsId},'{winId}')`)+
		basicButton(getTrans('otmena'), `_.wins['{winId}'].close()`)
	, 'aplremove'+id);
},
removeApl = (jId, id, gdpsId, winId) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[8]}removeApl${php}?id=${id}&gdpsId=${gdpsId}`)
        .then(data=>{
            if (data == 1) {
                J.id('a'+id).remove();
                _.wins[winId].close();
            }
            Loading(1);
        })
        .catch(e=>{console.error(e);_.err.handleRejection(e)});
},
connectContent = (jId, wikiId, step = 0) => {
    let J = Jexec(jId);
    if (step == 0) {
		let option = (id, title)=>`<option value=${id}>${title}</option>`,
		gdpses = returnAllProjects().map(el=>option(el.ID, el.title));
		_.win.open('contentToWiki', 
			`<form id={winId}formLINK method=post onsubmit="return false">`+
				// `<input class=framelabel id=contentId placeholder="ContentId"><br>`+
				`<select class=framelabel id=contentId>`+
					gdpses+
				`</select><br>`+
				`<button onclick="_.$.id('{winId}formLINK').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>`+
				`<button onclick=connectContent(${jId},${wikiId},1);_.wins['{winId}'].close() class=loginbtn${getTrans('commSend')}/button>`+
			`</form>`
		)
	} else {
		let id = _.$.id('contentId').value;
		Loading();
		helperRequest(`${sData[3]}conntectContent${php}`, `id=${id}&connectTo=${wikiId}`)
			.then(data=>{
				if (data == 0) {
					if (id == 0) {
						id = yourWikies['w'+wikiId].wiki;
						yourWikies['w'+wikiId].wiki = 0;
						if (myGdpses[J.ProjectsChannel][id])
							myGdpses[J.ProjectsChannel][id].wiki = 0;
					} else {
						if (myGdpses[J.ProjectsChannel][id])
							myGdpses[J.ProjectsChannel][id].wiki = 0;
						getFind(jId, J.ProjectsChannel, id);
					}
				} else {
					if (id == 0) {
						id = yourWikies['w'+wikiId].wiki;
						yourWikies['w'+wikiId].wiki = 0;
						if (myGdpses[J.ProjectsChannel][id])
							myGdpses[J.ProjectsChannel][id].wiki = 0;
					} else {
						if (myGdpses[J.ProjectsChannel][id])
							myGdpses[J.ProjectsChannel][id].wiki = 0;
						getFind(jId, J.ProjectsChannel, id);
					}
				}
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
connectWiki = (jId, contentId, type = 'c', step = 0) => {
    let J = Jexec(jId);
    let option = (id, title)=>`<option value=${id}>${title}</option>`,
    wikis = returnAllWikies().map(el=>option(el.ID, el.title));
    if (step == 0) {
		_.win.open('wikiToContent',
			`<form id={winId}formLINK method=post onsubmit="return false">`+
				// `<input class=framelabel id=wikiId placeholder="WikiId"><br>`+
				`<select class=framelabel id=wikiId>`+
					wikis+
				`</select><br>`+
				`<button onclick="_.$.id('{winId}formLINK').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>`+
				`<button onclick=connectWiki(${jId},${contentId},'${type}',1);_.wins['{winId}'].close() class=loginbtn${getTrans('commSend')}/button>`+
			`</form>`
		)
	} else {
		let id = _.$.id('wikiId').value;
		Loading();
		helperRequest(`${sData[3]}conntectWiki${php}`, `id=${id}&connectTo=${contentId}`)
			.then(data=>{
				if (data == 0) {
					if (id == 0) {
						id = myGdpses[J.ProjectsChannel][contentId].wiki;
						myGdpses[J.ProjectsChannel][contentId].wiki = 0;
						if (yourWikies['w'+id])
							yourWikies['w'+id].wiki = 0;
					} else {
						myGdpses[J.ProjectsChannel][contentId].wiki = id;
						yourWikies['w'+id].wiki = contentId;
						getCamp(jId, contentId);
					}
				} else {
					if (id == 0) {
						id = myGdpses[J.ProjectsChannel][contentId].wiki;
						myGdpses[J.ProjectsChannel][contentId].wiki = 0;
						if (yourWikies['w'+id])
							yourWikies['w'+id].wiki = 0;
					} else {
						myGdpses[J.ProjectsChannel][contentId].wiki = id;
						yourWikies['w'+id].wiki = contentId;
						getShow(jId, contentId);
					}
				}
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
setMainWiki = (jId, contentId, guideId, step = 0) => {
    let J = Jexec(jId);
    if (step == 0) {
		if (_.$.id('wikiId'))
			return;
		_.win.open('setMainPage',
			`<form id={winId}formLINK method=post onsubmit="return false">`+
				`<input class=framelabel id=wikiMainSet value=${guideId} placeholder="WikiId"><br>`+
				`<button onclick="_.$.id('{winId}formLINK').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>`+
				`<button onclick=setMainWiki(${jId},${contentId},${guideId},1);_.wins['{winId}'].close() class=loginbtn${getTrans('commSend')}/button>`+
			`</form>`
		)
	} else {
		let guideId = _.$.id('wikiMainSet').value;
		Loading();
		helperRequest(`${sData[7]}setMainWiki${php}`, `wiki=${contentId}&guide=${guideId}`)
			.then(data=>{
				getGuide(jId, data,contentId);
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
removeDevice = (jId, type, deviceId, isCurrent = '') => {
    let J = Jexec(jId);
    if (type === 0) {
		if (!J.q(`[device${deviceId}]`))
			return _.win.open('removeDevice',
				`<p${getTrans('removeDevice'+isCurrent)}/p>`+
				basicButton(getTrans('yes'), `removeDevice(${jId},'{winId}',${deviceId},'${isCurrent}')`)+
				basicButton(getTrans('no'), `_.wins['{winId}'].close()`),
			` device${deviceId} `);
		else return false;
	}
    if (isCurrent == 'Current') {
		if (J.q(`[device${deviceId}]`))
			_.win.close(type);
		return gLogout();
	}
    _.http.req('POST', `${sData[5]}removeDevice${php}`, `id=${deviceId}`, urlEncoded)
		.then(()=>{
			Loading(1);
			J.id('device'+deviceId).remove();
			if (J.q(`[device${deviceId}]`))
				_.win.close(type);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
RGBtoHEX = (string)=>{
	let dataValues = string.split(',');
	let newColor = '#';
	dataValues.forEach(col=>{
		let hexColor = parseInt(col).toString(16);

		if (hexColor.length > 2)
			newColor += 'ff';
		else if (hexColor.length < 2)
			newColor += '0'+hexColor;
		else 
			newColor += hexColor;
	});
	return newColor;
},
HEXtoRGB = (hex)=>{
	let preData = hex.replace('#', ''),
	dataValuesPre = preData.split(''),
	dataValues = [''],

	splitter = false,
	arrId = 0,
	colId = 0;
	dataValuesPre.forEach(el=>{
		dataValues[arrId] += el;
		if (splitter) {
			arrId += 1;
			if (arrId === 3)
				return;
			dataValues[arrId] = '';
		}
		splitter = !splitter;
	});

	dataValues.forEach(col=>{
		dataValues[colId] = parseInt(col,16);
		colId++;
	});

	return dataValues.join();
},
setToColorScheme = jId => {
    let J = Jexec(jId);
    let sizeScheme = '',
		radioScheme = Slocal.get('ColorScheme').split('/')[1];
    J.qa('[iscolorscheme]').forEach(el=>{
		// if (el.type == 'color') {
		//		 let nameLover = '--color-'+el.name.toLowerCase(),
		//			 hex = el.value,
		//			 name = el.name;
		//		 colorScheme += `,${name}|${hex}`;

		//		 if (name.includes('-alpha'))
		//			 hex += '99';
		//		 setColor(nameLover, hex, 'Color'+name);
		// }
		if (el.type == 'range') {
			let nameLover = '--def-'+el.name.toLowerCase(),
				val = el.value,
				name = el.name;
			sizeScheme += `,${name}|${val}`;
			setColor(nameLover, val+'px', 'Size'+name);
		}
		// if (el.type == 'radio') {
		//	 let nameLover = '--rr-'+el.name.toLowerCase(),
		//		 val = el.value,
		//		 name = el.name;
		//	 sizeScheme += `,${name}|${val}`;
		//	 setColor(nameLover, val);
		// }
	});
    Slocal.set('ColorScheme',sizeScheme.slice(1) + '/' + radioScheme);
    clrEditPage(jId);
},
setColorScheme = jId => {
    let J = Jexec(jId);
    Slocal.set('ColorScheme',J.id('scheme').value);
    colorGenerator();
},
saveKeys2 = jId => {
    let J = Jexec(jId);
    let code = J.id('hetkeysCfg');
    Slocal.set('Hotkeys', code.value);
    new Function(code.value)();
    megaAlert2(jId, 'DONE',1000);
},
saveKeys3 = (winId)=>{
	let code = _.$.id(`${winId}_hetkeysCfg`);
	Slocal.set('Hotkeys', code.value);
	new Function(code.value)();
	megaAlert2(jId, 'DONE',1000);
},
reassignKey = (actName, newKey)=>{
	keyActions[actName] = newKey;
},

switchProfileSettings = (jId, isPhone = 0) => {
    let J = Jexec(jId);
    // makeSwticher(jId, 0,'userSettings2', switchProfileSettings(jId), ['userSettings', 'userSettingsPhone'], 'switchProfileSettings')
    let html;
    if (isPhone == 0) 
		html = 
			`<div class=ANIM-swticherUp id=userSettings2>`+
				`<button class=loginbtn onclick="profileDevices(${jId})"${getTrans('settings010')}/button><br><br>`+
				`<button class=loginbtn onclick="innerProfile(${jId});clrEditPage(${jId})"${getTrans('settings009')}/button><br><br>`+
				`<button class=loginbtn onclick="innerProfile(${jId});keyBindsCfg2(${jId})"${getTrans('settings013')}/button><br><br>`+
			`</div>`;
	else 
		html = 
			`<div class=ANIM-swticherUp id=userSettings2 style="display:grid;margin:0 8px 0 8px">`+
				`<button class=loginbtn onclick="profileDevices(${jId});profileSwitcherPhone(${jId})"${getTrans('settings010')}/button>`+
				`<button class=loginbtn onclick="innerProfile(${jId});clrEditPage(${jId});profileSwitcherPhone(${jId})"${getTrans('settings009')}/button>`+
				`<button class=loginbtn onclick="innerProfile(${jId});keyBindsCfg2(${jId});profileSwitcherPhone(${jId})"${getTrans('settings013')}/button>`+
			`</div>`;
    return html;
},
switchProfileProjects = (jId, isPhone = 0) => {
    let J = Jexec(jId);
    // makeSwticher(jId, 0,'userProjects2', switchProfileProjects(jId), ['userProjects', 'userProjectsPhone'], 'switchProfileProjects')
    let html;
    if (isPhone == 0) 
		html = 
			`<div class=ANIM-swticherUp id=userProjects2>`+
				`<button class=loginbtn onclick="findsWindow(${jId},0)"${getTrans('yourCamps')}/button><br><br>`+
				`<button class=loginbtn onclick="findsWindow(${jId},1)"${getTrans('yourShows')}/button><br><br>`+
				`<button class=loginbtn onclick="findsWindow(${jId},2)"${getTrans('yourPeres')}/button><br><br>`+
				`<button class=loginbtn onclick="findsWindow(${jId},3)"${getTrans('yourTeles')}/button><br><br>`+
				`<button class=loginbtn onclick="wikisWindow(${jId})"${getTrans('yourWikis')}/button><br><br>`+
			`</div>`;
	else 
		html = 
			`<div class=ANIM-swticherUp id=userProjects2 style="display:grid;margin:0 8px 0 8px">`+
				`<button class=loginbtn onclick="findsWindow(${jId},0);profileSwitcherPhone(${jId})"${getTrans('yourCamps')}/button>`+
				`<button class=loginbtn onclick="findsWindow(${jId},1);profileSwitcherPhone(${jId})"${getTrans('yourShows')}/button>`+
				`<button class=loginbtn onclick="findsWindow(${jId},2);profileSwitcherPhone(${jId})"${getTrans('yourPeres')}/button>`+
				`<button class=loginbtn onclick="findsWindow(${jId},3);profileSwitcherPhone(${jId})"${getTrans('yourTeles')}/button>`+
				`<button class=loginbtn onclick="wikisWindow(${jId});profileSwitcherPhone(${jId})"${getTrans('yourWikis')}/button>`+
			`</div>`;
    return html;
},
projectBtnsSwticher = (jId, thisId, channel) => {
    let J = Jexec(jId);
    // makeSwticher(jId, 0,'proj${thisId}', projectBtnsSwticher(jId, ${thisId},${channel}), 'proj-${thisId}')
    let connectedWiki = '', coownersBtn = '',
		[smallString, bigString, tinyStr, gdpsArr] = GDPSswitchChannel(channel),
		gdps = gdpsArr[thisId],
		PointsPre = 0,
		Points = '';

    if (gdps.author == thisUser.ID)
		coownersBtn = basicButton(getTrans('coowners'), `coownersMenu(${thisId},${channel})`);
	else 
		coownersBtn = basicButton(getTrans('coownersNone'));

    if (connectedWiki === 0)
		connectedWiki = basicButton(getTrans('noConnectWiki'), `connectWiki(${jId},${thisId},'${tinyStr}')`);
	else 
		connectedWiki = basicButton(getTrans('connectedWiki'), `connectWiki(${jId},${thisId},'${tinyStr}')`);

    if (gdps.checked == '0') {
		Points = `<span${getTrans(smallString+'unckecked')}/span>`;
	} else if (gdps.checked == '-1') {
		Points = `<span${getTrans(smallString+'banned')}/span>`;
	} else {
		PointsPre = ~~(Date.now() / 1000) - gdps.points;
		Points = PointsPre > 0 ? `<span${getTrans('isBL')}/span>` : `<span${getTrans('wait1')}/span>${Math.abs(PointsPre)}<span${getTrans('wait2')}/wait>`;
	}

    let html = 
	`<div id=proj${thisId} style="padding:4px;position:absolute;border:solid var(--color-window) 1px;border-radius:var(--def-border-small);z-index:1" class=frameprofile>`+
		`<div align=left>`+
			`<div style="margin:0 0 4px 8px">`+
				`<span${getTrans('isBL')}/span>:`+basicButton(`>${Points}<`, (gdps.checked == 1 ? `ballsUp(${jId},${thisId})` : ''), '', 'BL'+thisId)+
			`</div>`+
			coownersBtn+
			connectedWiki+
			basicButton(getTrans('joins'), `getJoinLog(${jId},${thisId})`)+
		`</div>`+
	`</div>`;
    return html;
};
profileDevices = jId => {
    let J = Jexec(jId);
    J.link.set('devices');
    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('settings010')}/h1>`+
		basicButton(getTrans('getLogin'),`getConfInfo()`)+'<br><br>'+
		basicButton(getTrans('logout2'), `gLogout()`)+'<br><br>'+
		basicButton(getTrans('dropPass'),`innerMain(${jId},dropWindow(${jId}))`)+'<br><br>'+
		`<h1${getTrans('devices')}/h1><br>`+
		`<div id=GDPSesPlace style='display:flex;flex-direction:column;height:calc(100vh - 480px);overflow:auto' align=left>`+
		`</div>`+
	`</div>`;
    innerProfile(jId, html);
    Loading();
    _.http.req('GET', `${sData[5]}devices${php}`)
	.then(data=>{
		// let parsedData = JSON.parse(data);
		let parsedData = JSON.parse(data),
				html = renderDevices(jId, parsedData);

		innerGdpsPlace(jId, html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
clrEditPage = jId => {
    let J = Jexec(jId);
    J.link.set('color');
    cssRoot = document.body.style;
    let [Sizes, Radios] = colorGenerator(),
		sizeScheme = Sizes.split(','),
		radioScheme = Radios.split(','),
		MenuS = '',
		MenuR = '',
		sizeListeners = '',
		radioListeners = '';
    // MenuR = 
    // trtd(
    //	 '>Tags/Text<',
    //	 radioInput('Tags', 'Tags/Text')+
    //	 radioInput('Text', 'Tags/Text')
    // );

    sizeScheme.forEach(el=>{
		let [name,value] = el.split('|');
		MenuS += 
		`<tr>`+
			`<td`+
				getTrans(name)+
			`/td>`+
			`<td>`+
				`<input iscolorscheme class="headbtn" style="padding:0;margin:0;height:48px;margin:-9px 0 -9px 0" class=colorscheme type=range min=8 max=48 step=1 id="color-${name}" name="${name}" value=${value}>`+
			`</td>`+
			`<td>`+
				` <span id="${name}">${value}px</span>`+
			`</td>`+
		`</tr>`;
		sizeListeners += `,color-${name}`;
	});
    radioScheme.forEach(el=>{
		let [inputs,value] = el.split(':'),
		doneInputs = '',
		checked = 0;
		inputs.split(';').forEach(inp=>{
			let isChecked = checked == value ? 1 : 0;
			doneInputs += radioInput(inp, inputs, isChecked, `iscolorscheme value=${inputs}:${checked} onchange="renderSwitch(this.value,1)"`);
			checked++;
		});
		MenuR += 
		`<tr>`+
			`<td`+
				getTrans(inputs)+
			`/td>`+
			`<td id="color-${inputs}">`+
				doneInputs+
			`</td>`+
		`</tr>`;
		radioListeners += `,color-${inputs}`;
	});

    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('settings001')}/h1>`+
		`<h2${getTrans('settings006')}/h2>`+
		`<table>`+
			MenuS+
		`</table>`+
		`<h2${getTrans('settings009')}/h2>`+
		`<table>`+
			MenuR+
		`</table>`+
		`<button class=loginbtn onclick=setToColorScheme(${jId})${getTrans('settings002')}/button><br>`+
		`<button class=loginbtn onclick=dropColorScheme()${getTrans('settings003')}/button><br><br><br>`+
		`<div style=display:flex>`+
			`<textarea name=scheme class=framelabel style="width:calc(100% - 170px)" id=scheme>${Slocal.get('ColorScheme')}</textarea>`+
			`<button class=loginbtn onclick=setColorScheme(${jId})${getTrans('settings004')}/button><br><br>`+
		`</div><br>`+
		basicButton(getTrans('settings007'), "createBasicError(0)")+'<br>'+
		basicButton(getTrans('settings008'), "createBasicError(1)")+'<br>'+
		basicButton('>DEV PANEL<', 'debugWindow()')+
	`</div>`;

    innerProfile(jId, html);
    sizeListeners.slice(1).split(',').forEach(id=>{
		let el = J.id(id);
		el.addEventListener('change', el=>{
			setColor('--def-'+el.target.name.toLowerCase(), el.target.value+'px', 'Size'+el.target.name);
		});
		el.addEventListener('input', el=>{
			J.id(el.target.name).innerHTML = el.target.value+'px';
		});
	});
    // radioListeners.slice(1).split(',').forEach(id=>{
    //	 let el = J.id(id);
    //	 el.addEventListener('change', el=>{
    //		 let val = el.target.value;
    //		 renderSwitch(val, 1);
    //	 });
    // });
};
keyBindsCfg2 = jId => {
    let J = Jexec(jId);
    J.link.set('hotkeys');
    let html2 = `<textarea id=hetkeysCfg class=framelabel style="width:calc(100% - 40px);height:400px">${Slocal.get('Hotkeys')}</textarea>`;
    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('settings013')}/h1>`+
		html2+
		`<br>${basicButton(getTrans('settings002'), `saveKeys2(jId)`)}`+
	`</div>`;
    if (J.id('profileWindow'))
		innerProfile(jId, html);
};
keyBindsCfg3 = ()=>{
	if (_.$.q('keyscfg'))
		return
	let html2 = `<textarea id={winId}_hetkeysCfg class=framelabel style="width:calc(100% - 40px);height:400px">${Slocal.get('Hotkeys')}</textarea>`;
	let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('settings013')}/h1>`+
		html2+
		`<br>${basicButton(getTrans('settings002'), `saveKeys3('{winId}')`)}`+
	`</div>`;
	_.win.open('keyscfg',
		html
	, 'keyscfg style=width:350px')
};

URathausSpandau = (jId, hof, lang, smallString, content) => {
    let J = Jexec(jId);
    if (hof !== 1 && J.q(`[data-short=${lang}]`))
		return;
    let elCont = '';
    if (content)
		elCont = content;
    let html = `<div style=display:flex>`+
			`<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
			`<textarea class=framelabel data-short=${lang} style=width:100% oninput="this.nextElementSibling.value='${lang}\t'+this.value" ${getTrans(smallString+'Input02a', 'input')}${elCont}</textarea>`+
			`<input type=hidden name=short value="${lang}\t${content||''}">`+
			basicButton('>-<', `this.parentElement.remove()`)+
		`</div>`
    if (hof === 1)
		return html;
    let el = J.id('langsShorts')
    el.insertAdjacentHTML('beforeend', html)
};

AmOmnibusHof = (jId, hof, lang, smallString, content) => {
    let J = Jexec(jId);
    if (hof !== 1 && J.q(`[data-lang=${lang}]`))
		return;
    let elCont = '';
    if (content)
		elCont = content;
    let html = `<div style=display:flex>`+
			`<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
			`<textarea class=framelabel data-lang=${lang} style=width:100% oninput="this.nextElementSibling.value='${lang}\t'+this.value" required ${getTrans(smallString+'Input02', 'input')}${elCont}</textarea>`+
			`<input type=hidden name=description value="${lang}\t${content||''}">`+
			basicButton('>-<', `this.parentElement.remove()`)+
		`</div>`
    if (hof === 1)
		return html;
    let el = J.id('langsDescrs')
    el.insertAdjacentHTML('beforeend', html)
};

addFind = (jId, channel) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    let smallString = 'camp',
			bigString = 'Camp',
			tags = '',
			oss = '',
			langs = '';
    switch (channel) {
        case 1:
            smallString = 'show';
            bigString = 'Show';
            break;
        case 2:
            smallString = 'pere';
            bigString = 'Pere';
            break;
        case 3:
            smallString = 'tele';
            bigString = 'Tele';
            break;
    }
    for (let tag in Tags[channel]) {
		tags += renderTagAdding(jId, Tags[channel], 'tags', tag);
	}
    for (let os in Os[channel]) {
		oss += renderTagAdding(jId, Os[channel], 'os', os);
	}
    langList.forEach(lang=>{
		langs += 
		`<button onclick="AmOmnibusHof(${jId},0,'${lang}','${smallString}');return false" style="width:40px;margin:2px" class="emptybtn">`+
			`<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
		`</button>`;
		//langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
	});

    J.link.set('add'+bigString);
    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('add'+bigString)}/h1>`+ // ${smallString}Add${php}
		`<form method=POST enctype="multipart/form-data" action='${sData[1]}${smallString}Add${php}' onsubmit="if (tryAddShow()) return enterFormData(${jId},this,'${sData[1]}${smallString}Add${php}');else return false;">`+
			`<input type=hidden name=channel value=${channel}>`+
			`<label${getTrans('add'+bigString+'01')}/label><br><input class=framelabel type=text name=title style=width:100% required${getTrans(smallString+'Input01', 'input')}<br>`+

			`<label${getTrans('addCamp02a')}/label><br>`+
			langs.replaceAll('AmOmnibusHof', 'URathausSpandau')+`<br>`+
			`<div id=langsShorts>`+
				//`<input class=framelabel type=text name=short style=width:100%${getTrans('campInput02a', 'input')}<br>`+
			`</div>`+

			`<label${getTrans('add'+bigString+'02')}/label><br>`+
			langs+`<br>`+
			`<div id=langsDescrs>`+
				//`<textarea class=framelabel name=description style=width:100% required${getTrans(smallString+'Input02', 'textarea')}/textarea><br>`+
			`</div>`+

			`<label${getTrans('add'+bigString+'03')}/label><br>`+
			`<div id=GDPSesPlace></div>`+
			`<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(${jId},this)>`+
				`<option selected disabled hidden${getTrans('add'+bigString+'03a')}/option>`+

				`<option value=youtube>youtube</option>`+
				`<option value=discord>discord</option>`+
				`<option value=telegram>telegram</option>`+
			`</select><br>`+

			//`<label${getTrans('gdpsLang00')}/label><br>`+
			//`<select id="langs" class="framelabel" name="language" required>`+
				//langs+
			//`</select><br><br>`+

			`<h2${getTrans(smallString+'Input06')}/h2>`+
			`<label${getTrans('add'+bigString+'04')}/label><br>`+
			`<div id=mediaselectorimg>`+
				`<input class=framelabel type=text name=img style=width:40%${getTrans(smallString+'Input04', 'input')}`+
				`<button class=loginbtn onclick="mediaselector(${jId},'img','tofile')"${getTrans(smallString+'Input07')}/button>`+
			`</div><br>`+
			`<label${getTrans('add'+bigString+'07')}/label><br>`+
			`<div id=mediaselectorban>`+
				`<input class=framelabel type=text name=ban style=width:40%${getTrans(smallString+'Input04', 'input')}`+
				`<button class=loginbtn onclick="mediaselector(${jId},'ban','tofile')"${getTrans(smallString+'Input07')}/button>`+
			`</div><br><br>`+

			`<label${getTrans('add'+bigString+'05')}/label><br>`+
			`<div style="display:flex;flex-wrap:wrap">`+
				tags+
			`</div><br>`+
			`<label${getTrans('add'+bigString+'06')}/label><br>`+
			`<div style="display:flex;flex-wrap:wrap">`+
				oss+
			`</div><br><br>`+
			`<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('add'+bigString, 'inputValue')}`+
		`</form>`+
	`</div>`;
    if (J.id('profileWindow')){
		innerProfile(jId, html);
		let	form = J.q('form'),
			saveData = Slocal.get(channel+'gdpsAdd');
		if (saveData) {
			let data = _.form.write(form, JSON.parse(saveData));
			let arr = data['links[]'];
			if (arr)
				for (let i = 0; i < arr.length; i += 2)
					generateSocialNetworks(jId, {value:arr[i]}, arr[i+1]);
		}
		form.addEventListener('input', ()=>{
			let save = e=>{
				let f = _.form.read(J.q('form'));
				Slocal.set(channel+'gdpsAdd', JSON.stringify(f));
			}
			clearTimeout(J.TimeOut[2]);
			TimeOut[2] = setTimeout(save, 300);
		});
	}else return html;
};
editFind = (jId, channel, gdpsId) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    Loading();
    let html = ``,
			smallString = 'camp',
			bigString = 'Camp';
    switch (channel) {
        case 1:
            smallString = 'show';
            bigString = 'Show';
            break;
        case 2:
            smallString = 'pere';
            bigString = 'Pere';
            break;
        case 3:
            smallString = 'tele';
            bigString = 'Tele';
            break;
    }
    helperRequest(`${sData[1]}${smallString}Edit${php}?id=${gdpsId}`)
	.then (data=>{
		J.link.set('edit'+bigString+'='+gdpsId);
		let parsedData = JSON.parse(data),
			title = parsedData[0],
			description = parsedData[1],
			short = parsedData[2],
			links = parsedData[3],
			image = parsedData[4],
			banner = parsedData[5],
			TagsLocal = JSON.parse(parsedData[6]),
			tags = TagsLocal;
			os = JSON.parse(parsedData[7]),
			lang = parsedData[8],
			fileWarning = '',
			tagss = '',
			oss = '',
			linksStr = '',
			langs = '';

		if (TagsLocal != null && os != null)
			tags = TagsLocal.concat(os);
		for (let tag in Tags[channel]) {
			let checked = '';
			if (TagsLocal != null)
				checked = tags.includes(tag) ? ' checked' : '';
			tagss += renderTagAdding(jId, Tags[channel], 'tags', tag, checked);
		}
		for (let osCurrent in Os[channel]) {
			let checked = '';
			if (os != null)
				checked = tags.includes(osCurrent) ? ' checked' : '';
			oss += renderTagAdding(jId, Os[channel], 'os', osCurrent, checked);
		}
		langList.forEach(lang=>{
			langs +=
			`<button onclick="AmOmnibusHof(${jId},0,'${lang}','${smallString}');return false" style="width:40px;margin:2px" class="emptybtn">`+
				`<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
			`</button>`;
			//`<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
		});
		if (typeof links === 'object')
			for (let link in links) {
				linksStr += socialNetwork(jId, link, links[link]);
			}
		else 
			linksStr += socialNetwork(jId, 'youtube', links);

		if (image.includes('imgs/customuser/') || banner.includes('imgs/customuser/'))
			fileWarning = 'fileWarning';

		let descMap = null;
		try {
			let parsedDesc = JSON.parse(description);
			if (parsedDesc && typeof parsedDesc === 'object')
				descMap = parsedDesc;
		} catch(e) {}

		let langsDescrsHtml = '';
		if (descMap)
			for (let Lang in descMap)
				langsDescrsHtml += AmOmnibusHof(jId, 1, Lang, smallString, descMap[Lang]);
		else
			langsDescrsHtml = AmOmnibusHof(jId, 1, lang, smallString, description);

		let shortsMap = null;
		try {
			let parsedDesc = JSON.parse(short);
			if (parsedDesc && typeof parsedDesc === 'object')
				shortsMap = parsedDesc;
		} catch(e) {}

		let langsShortsHtml = '';
		if (shortsMap)
			for (let Lang in shortsMap)
				langsShortsHtml += URathausSpandau(jId, 1, Lang, smallString, shortsMap[Lang]);
		else if (short > 0)
			langsShortsHtml = AmOmnibusHof(jId, 1, lang, smallString, short);

		html = 
		`<div id=helperContentProfile>`+
			`<h1${getTrans('edit'+bigString)}/h1>`+ //${smallString}Edit${php}
			`<form method=POST enctype="multipart/form-data" action='${sData[1]}${smallString}Edit${php}' onsubmit="return enterFormData(${jId},this,'${sData[1]}${smallString}Edit${php}?id=${gdpsId}')">`+
				`<label${getTrans('add'+bigString+'01')}/label><br><input value="${title}" class=framelabel type=text name=title style=width:100% required${getTrans(smallString+'Input01', 'input')}<br>`+

				`<label${getTrans('addCamp02a')}/label><br>`+
				langs.replaceAll('AmOmnibusHof', 'URathausSpandau')+`<br>`+
				`<div id=langsShorts>`+
					langsShortsHtml+
					//`<input value="${short}" class=framelabel type=text name=short style=width:100%${getTrans('campInput02a', 'input')}<br>`+
				`</div>`+

				`<label${getTrans('add'+bigString+'02')}/label><br>`+
				langs+`<br>`+
				`<div id=langsDescrs>`+
					langsDescrsHtml+
					//`<textarea class=framelabel name=description style=width:100% required${getTrans(smallString+'Input02', 'input')}${description}</textarea><br>`+
				`</div>`+

				`<label${getTrans('add'+bigString+'03')}/label><br>`+
				`<div id=GDPSesPlace>`+
					linksStr+
				`</div>`+
				`<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(${jId},this)>`+
					`<option selected disabled hidden${getTrans('add'+bigString+'03a')}/option>`+

					`<option value=youtube>youtube</option>`+
					`<option value=discord>discord</option>`+
					`<option value=telegram>telegram</option>`+
				`</select><br>`+

				//`<label${getTrans('gdpsLang00')}/label><br>`+
				//`<select id="langs" class="framelabel" name="language" required>`+
					//langs+
				//`</select><br><br>`+

				`<h2${getTrans(smallString+'Input06')}/h2>`+
				(fileWarning ? `<p${getTrans('fileWarning')}/p>` : '')+
				`<label${getTrans('add'+bigString+'04')}/label><br>`+
				`<div id=mediaselectorimg>`+
					`<input value="${image}" class=framelabel type=text name=img style=width:40%${getTrans(smallString+'Input04', 'input')}`+
					`<button class=loginbtn onclick="mediaselector(${jId},'img','tofile')"${getTrans(smallString+'Input07')}/button>`+
				`</div><br>`+
				`<label${getTrans('add'+bigString+'07')}/label><br>`+
				`<div id=mediaselectorban>`+
					`<input value="${banner}" class=framelabel type=text name=ban style=width:40%${getTrans(smallString+'Input04', 'input')}`+
					`<button class=loginbtn onclick="mediaselector(${jId},'ban','tofile')"${getTrans(smallString+'Input07')}/button>`+
				`</div><br><br>`+
		
				`<label${getTrans('add'+bigString+'05')}/label><br>`+				
				`<div style="display:flex;flex-wrap:wrap">`+
					tagss+
				`</div><br>`+
				`<label${getTrans('add'+bigString+'06')}/label><br>`+
				`<div style="display:flex;flex-wrap:wrap">`+
					oss+
				`</div><br><br>`+
				`<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('edit'+bigString, 'inputValue')}<br>`+
				`<p${getTrans('after'+bigString)}/p><br>`+
			`</form>`+
		`</div>`;
		innerProfile(jId, html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
getJoinLog = (jId, gdpsId) => {
    let J = Jexec(jId);
    // legacy
    Loading();
    helperRequest(`${sData[0]}getJoinLog${php}?id=${gdpsId}`)
		.then(data=>{
			J.link.set('gdpsLog='+gdpsId);
			let parsedData = JSON.parse(data),
				html = 
			`<div id=helperContentProfile>`+
				`<div>`+
					`<h1><span${getTrans('joinsTo')}/span> ${parsedData[0][0]}</h1>`+
					`<table>`;
			parsedData.forEach(arrat=>{
				if (arrat[1] !== 'dontRenderMe') {
					html +=
						`<tr>`+
							`<td>`+
								arrat[0]+
							`</td>`+
							`<td>`+
								timeAgo(arrat[1])+
							`</td>`+
							`<td>`+
								arrat[2]+
							`</td>`+
						`</tr>`;
				}
			});
			html += 
					`</table>`+
				`</div>`+
			`</div>`;
			innerProfile(jId, html);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
addVacs = (jId, channel, gdpsId) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    let smallString = 'vacs',
			bigString = 'Vacs',
			tags = '',
			langs = '';
    for (let tag in TagsVacs)
		tags += renderTagAdding(jId, TagsVacs, 'tags', tag);
    langList.forEach(lang=>{
		langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
	});
    J.link.set('add'+bigString+'='+channel+'|'+gdpsId);
    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('add'+bigString)}/h1>`+
		`<form method=POST enctype="multipart/form-data" action='${sData[1]}${smallString}Add${php}' onsubmit="return enterFormData(${jId},this,'${sData[1]}${smallString}Add${php}')">`+
			`<label${getTrans('add'+bigString+'01')}/label><br><input class=framelabel type=text name=title style=width:100% required${getTrans(smallString+'Input01', 'input')}<br>`+
			`<label${getTrans('add'+bigString+'02')}/label><br><textarea class=framelabel name=text style=width:100% required${getTrans(smallString+'Input02', 'textarea')}/textarea><br>`+
			`<label${getTrans('addCamp02a')}/label><br><input class=framelabel type=text name=short style=width:100%${getTrans('campInput02a', 'input')}<br>`+

			// `<label${getTrans('gdpsLang00')}/label><br>`+
			// `<select id="langs" class="framelabel" name="language" required>`+
			//	 langs+
			// `</select><br><br>`+

			`<label${getTrans('add'+bigString+'03')}/label><br>`+
			`<div style="display:flex;flex-wrap:wrap">`+
				tags+
			`</div><br><br>`+

			`<input type=hidden value=${gdpsId} name=id>`+
			`<input type=hidden value=${channel} name=channel>`+

			`<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('add'+bigString, 'inputValue')}`+
		`</form>`+
	`</div>`;
    innerProfile(jId, html);
};
editVacs = (jId, channel, gdpsId, vacId) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    if (J.q('[vaceditadm]')) return 0;
    Loading();
    let html = ``,
			smallString = 'vacs',
			bigString = 'Vacs';
    helperRequest(`${sData[8]}edit${php}`, `id=${vacId}&gdpsId=${gdpsId}`)
		.then (data=>{
			if (J.id('profileWindow')) 
				J.link.set('edit'+bigString+'='+channel+'|'+gdpsId+'|'+vacId);
			let parsedData = JSON.parse(data),
				title = parsedData.title,
				text = parsedData.text,
				short = parsedData.short,
				tags = JSON.parse(parsedData.tags),
				// lang = parsedData[7],
				tagss = '',
				langs = '';
			for (let tag in TagsVacs) {
				let checked = '';
				if (tags)
					checked = tags.includes(tag) ? ' checked' : '';
				tagss += renderTagAdding(jId, TagsVacs, 'tags', tag, checked);
			}
			langList.forEach(lang=>{
				langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
			});

			html = 
			`<h1${getTrans('edit'+bigString)}/h1>`+
			`<form method=POST enctype="multipart/form-data" action='${sData[1]}${smallString}Edit${php}' onsubmit="return enterFormData(${jId},this,'${sData[1]}${smallString}Edit${php}?id=${gdpsId}')">`+
				`<label${getTrans('add'+bigString+'01')}/label><br><input value="${title}" class=framelabel type=text name=title style=width:100% required${getTrans(smallString+'Input01', 'input')}<br>`+
				`<label${getTrans('add'+bigString+'02')}/label><br><textarea class=framelabel name=text style=width:100% required${getTrans(smallString+'Input02', 'input')}${text}</textarea><br>`+
			`<label${getTrans('addCamp02a')}/label><br><input value="${short}" class=framelabel type=text name=short style=width:100%${getTrans('campInput02a', 'input')}<br>`+

				// `<label${getTrans('gdpsLang00')}/label><br>`+
				// `<select id="langs" class="framelabel" name="language" required>`+
				//	 langs+
				// `</select><br><br>`+

				`<label${getTrans('add'+bigString+'03')}/label><br>`+				
				`<div style="display:flex;flex-wrap:wrap">`+
					tagss+
				`</div><br><br>`+

				`<input type=hidden value=${vacId} name=id>`+
				`<input type=hidden value=${gdpsId} name=gdpsId>`+
				`<input type=hidden value=${channel} name=channel>`+

				`<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('edit'+bigString, 'inputValue')}`+
			`</form>`;
			if (J.id('profileWindow')) 
				innerProfile(jId, `<div id=helperContentProfile>`+html+`</div>`);
			else 
				_.win.open('vacEditAdm', 
					html, 
				'vaceditadm');
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
getVacancies = (jId, channel, projId) => {
    let J = Jexec(jId);
    Loading();
    helperRequest(`${sData[8]}get${php}?id=${projId}`)
		.then(data=>{
			Loading(1);
			let parsedData = JSON.parse(data),
				html = 
			`<div id=helperContentProfile>`+
				`<h1><span${getTrans('vacancies')}/span> ${parsedData['gdpsdata'][0]}</h1><br>`+
				`<div align="left">`+
					basicButton(getTrans('addVacs'), `addVacs(${jId},${channel},${projId})`, 'font-size:calc(var(--def-font)*1.5)')+
				`</div><br>`+
				`<div style="display:flex;flex-direction:row;flex-wrap:wrap;height:calc(100vh - 450px);overflow:auto">`+
					renderVacancy(jId, parsedData['vacs'], true, 'a')+
				`</div>`+
			`</div>`;
			J.link.set('vacans='+channel+'|'+projId);
			innerProfile(jId, html);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
vacResponses = (jId, channel, projId, vacId) => {
    let J = Jexec(jId);
    Loading();
    helperRequest(`${sData[8]}applies${php}?id=${projId}&vacid=${vacId}`)
		.then(data=>{
			Loading(1);
			let parsedData = JSON.parse(data),
				html = 
			`<div id=helperContentProfile>`+
				`<h1><span${getTrans('vacResponses')}/span> ${parsedData['gdpsdata'][0]}</h1><br>`+
				`<div style="display:flex;flex-direction:row;flex-wrap:wrap;height:calc(100vh - 450px);overflow:auto">`+
					renderApplies(jId, parsedData['applies'], `getVacancies(${jId},${channel},${projId})`, projId)+
				`</div>`+
			`</div>`;
			J.link.set('applies='+channel+'|'+projId+'|'+vacId);
			innerProfile(jId, html);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
createWiki = (jId, backpage = 0) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    J.link.set('wikiNew');
    let langs = '';
    langList.forEach(lang=>{
		langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
	});
    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('guides01')}/h1>`+
		`<button type=button class=loginbtn onclick="${backpage === 1 ? `profilePage(jId);wikisWindow(jId)` : `pageWikiList(jId)`}"${getTrans('otmena')}/button><br>`+
		`<form id=GDPSesPlace style=padding:8px method=post onsubmit="return enterFormData(${jId},this,'${sData[1]}newWiki${php}')">`+
			`<input name=title class=framelabel id=title style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
			`<label${getTrans('gdpsLang00')}/label> `+
			`<select id="langs" class="framelabel" name="language" required>`+
				langs+
			`</select><br>`+
			`<input name=img class=framelabel id=img${getTrans('guides05', 'input')}`+
			`<textarea name=text style=width:100%;height:240px class=framelabel style=width:210px${getTrans('campInput02a', 'textarea')}/textarea><br>`+
			`<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
		`</form>`+
	`</div>`;
    if (!J.id('profileWindow'))
		profilePage(jId, '');
    innerProfile(jId, html);
};

alarmsWindow = jId => {
    let J = Jexec(jId);
    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('alarms01')}/h1>`+
		basicButton(getTrans('enableAlerts'), 'pushSubscribe()')+
		`<div align=center style="display:flex">`+
			`<div style="width:30%;height:400px">`+
				`<h2${getTrans('msgs')}/h2>`+
				`<div id=alarms_small style=display:grid>`+
				`</div>`+
			`</div>`+
			`<div style="width:70%;height:400px">`+
				`<h2${getTrans('fullMsgs')}/h2>`+
				`<div id=alarms_big>`+
				`</div>`+
			`</div>`+
		`</div>`+
	`</div>`;
    if (J.id('profileWindow'))
		innerProfile(jId, html);
	else return html;
};
GetAlarms = (jId, page = 0) => {
    let J = Jexec(jId);
    J.link.set('alarms');
    Loading();
    _.http.req('GET', `${sData[0]}getAlarms${php}?page=${page}`)
	.then(data=>{
		Loading(1);
		if (data == '[]') {
			return J.id('alarms_small').innerHTML = `<span${getTrans('newsNone')}/span>`;
		}
		let parsedData = JSON.parse(data),
			html = '',
			css = '';
		parsedData.forEach(el=>{
			if (el[2] == 1)
				css = 'style=background-color:#ff0000 ';
			else 
				css = '';
			html += `<button id="btn${el[0]}" ${css}class=loginbtn onclick="getFullAlarm(${jId},${el[0]})">${el[1]}</button>`;
		});
		J.id('alarms_small').innerHTML = html;
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
};

subsWindow = jId => {
    let J = Jexec(jId);
    let html = 
	`<div id=helperContentProfile>`+
		`<h1${getTrans('gdpsSubs')}/h1>`+
		basicButton(getTrans('enableAlerts'), 'pushSubscribe()')+
		`<div id=gdps_list style=display:grid>`+
		`</div>`+
	`</div>`;
    if (J.id('profileWindow'))
		innerProfile(jId, html);
	else return html;
};
GetSubs = (jId, page = 0) => {
    let J = Jexec(jId);
    J.link.set('profile/subs');
    Loading();
    _.http.req('GET', `${sData[10]}subs${php}?page=${page}`)
		.then(data=>{
			Loading(1);
			if (data == '[]') {
				return J.id('gdps_list').innerHTML = `<span${getTrans('noSubscriptions')}/span>`;
			}
			let gdpsArray = JSON.parse(data),
				html = FINDrenderInProfile(jId, gdpsArray, 21, ['unsub']);
			J.id('gdps_list').innerHTML = html;
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
subUnrespond2 = (jId, gdpsId) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[10]}unsub${php}?id=${gdpsId}`)
		.then(data=>{
			Loading(1);
			if (data == '1') {
				J.id(gdpsId).remove();
			} else if (data == '-1') {
				megaAlert(jId, 'notSubscribed');
			} else {
				megaAlert(jId, 'error');
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};

findsWindow = (jId, channel) => {
    let J = Jexec(jId);
    ProjectsChannel = channel;
    let [smallString, bigString, tinyStr, cacheArr] = GDPSswitchChannel(channel);
    J.link.set('added'+bigString+'s');
    let gdpses = "";
    for (let gdps in cacheArr) {
		gdpses+=FINDrenderInProfileFull(jId, channel, [cacheArr[gdps]]);
	}
    let html =
	`<div id=helperContentProfile>`+
		`<h1${getTrans('your'+bigString+'s')}/h1><br>`+
		`<div align=left>`+
		basicButton(getTrans('add'+bigString), `addFind(${jId},${channel})`, 'font-size:calc(var(--def-font)*1.5)')+
		basicButton(getTrans('addNews'), `innerProfile(${jId},newsWindow(${jId}))`, 'font-size:calc(var(--def-font)*1.5)')+
		`</div><br>`+
		`<div style='display:flex; flex-direction:column; height:calc(100vh - 480px); overflow:auto' align=left>`+
			gdpses+
		`</div>`+
	`</div>`;
    if (J.id('profileWindow'))
		innerProfile(jId, html);
	else return html;
};
wikisWindow = jId => {
    let J = Jexec(jId);
    J.link.set('addedWikis');
    let gdpses = "";
    Object.keys(yourWikies).forEach(gdps=>{
		gdpses+=WIKIrenderInProfileFull(jId, [yourWikies[gdps]]);
	});
    let html =
	`<div id=helperContentProfile>`+
		`<h1${getTrans('yourWikis')}/h1><br> `+
		`<div align=left>`+
			`<button onclick="createWiki(${jId},1)" style=font-size:calc(var(--def-font)*1.5) class=loginbtn${getTrans('addWIki')}/button>`+
		`</div><br>`+
		profileContentDiv(jId)+
			gdpses+
		`</div>`+
	`</div>`;
    if (J.id('profileWindow'))
		innerProfile(jId, html);
	else return html;
};

profilePage = (jId, innerHtnl = gProfileMini(jId)) => {
    let J = Jexec(jId);
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div class=frameprofile style="margin:0;height:100%">`+
			`<button style="position:absolute;top:80px;right:5px" class="contentAdaptiveSmall loginbtn" onclick="profileSwitcherPhone(${jId})">`+
				`<div style="transform:rotate(90deg)">|||</div>`+
			`</button>`+
			`<div id="phoneSelector" class=contentAdaptiveBig style="position:absolute;top:15px;width:235px" align="left">`+
				`<button class=loginbtn onclick="innerProfile(${jId},gProfileMini(${jId}))"${getTrans('profile')}/button><br><br>`+
				`<button class=loginbtn onclick="alarmsWindow(${jId});GetAlarms(${jId})" style=position:relative${getTrans('Alarms', 'textBtn')}`+
				(thisUser.hasAlarms == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')+
				`</button><br><br>`+
				`<button class=loginbtn onclick="subsWindow(${jId});GetSubs(${jId})" style=position:relative${getTrans('gdpsSubs', 'textBtn')}</button><br><br>`+
				basicButton(getTrans('projects'), `makeSwticher(${jId},0,'userProjects2', switchProfileProjects(${jId},0), 'userProjects', 'switchProfileProjects')`)+'<br><br>'+
				`<div class=profileSwticher id=userProjects></div>`+
				`<button class=loginbtn onclick="makeSwticher(${jId},0,'userSettings2', switchProfileSettings(${jId},0), 'userSettings', 'switchProfileSettings')"${getTrans('settings000')}/button><br><br>`+
				`<div class=profileSwticher id=userSettings></div>`+
			`</div>`+
			`<div id="phoneSelectorSmall" class=contentAdaptiveSmall style=display:none>`+
				`<button class=loginbtn onclick="innerProfile(${jId},gProfileMini(${jId}));profileSwitcherPhone(${jId})"${getTrans('profile')}/button>`+
				`<button class=loginbtn onclick="alarmsWindow(${jId});profileSwitcherPhone(${jId});GetAlarms(${jId})" style=position:relative${getTrans('Alarms', 'textBtn')}`+
				(thisUser.hasAlarms == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')+
				`</button>`+
				`<button class=loginbtn onclick="subsWindow(${jId});profileSwitcherPhone(${jId});GetSubs(${jId})" style=position:relative${getTrans('gdpsSubs', 'textBtn')}</button>`+
				basicButton(getTrans('projects'), `makeSwticher(${jId},0,'userProjects2', switchProfileProjects(${jId},1), 'userProjectsPhone', 'switchProfileProjects')`)+
				`<div id=userProjectsPhone></div>`+
				`<button class=loginbtn onclick="makeSwticher(${jId},0,'userSettings2', switchProfileSettings(${jId},1), 'userSettingsPhone', 'switchProfileSettings')"${getTrans('settings000')}/button>`+
				`<div id=userSettingsPhone></div>`+
			`</div>`+
			`<div class=profileMobileRightWindow id="profileWindow" align="left">`+
				innerHtnl+
			`</div>`+
			`<p align=right${getTrans('helperVer')}/p>`+
		`</div>`+
	`</div>`;
    innerMain(jId, html);
};
