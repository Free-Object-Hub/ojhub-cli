let realColorGenerator = (
    jId,
    wikiId = 0,
    colorSchemePre = `Bg|#090609,Bg-alpha|#090609,Main|#612a9d,Light|#8200ff,Window|#3f1f5e,Profile|#1d151f,Profile-alpha|#1d151f,Black|#120f13,White|#DFD3EB`
) => {
    let J = Jexec(jId);
    let MenuC = '',
		colorListeners = '',
		colorScheme = '';
    try {
		colorScheme = wikiApplyColor(colorSchemePre);
		if (!colorScheme || typeof colorScheme !== 'object') {
			return megaAlert(jId, 'CONTENTISNULL');
		}
	} catch (e) {
		return megaAlert(jId, 'CONTENTISNULL');
	}

    for (let name in colorScheme) {
		let value = colorScheme[name];
		MenuC += 
		`<tr>`+
			`<td`+
				getTrans(name)+
			`/td>`+
			`<td>`+
				`<input iscolorscheme class=colorscheme class=colorscheme type=color id=\"color-${name}\" name=\"${name}\" value=${value}>`+
			`</td>`+
		`</tr>`;
		colorListeners += `,color-${name}`;
	}

    let html = 
		`<h2${getTrans('settings005')}/h2>`+
		`<table>`+
			MenuC+
		`</table>`+
		basicButton(getTrans('settings004'), `wikiSetColors(${jId},${wikiId})`)+
		basicButton('>DISCARD<', `wikiSetColors(${jId},${wikiId},'Bg|#090609,Bg-alpha|#090609,Main|#612a9d,Light|#8200ff,Window|#3f1f5e,Profile|#1d151f,Profile-alpha|#1d151f,Black|#120f13,White|#DFD3EB')`);
    innerWikiControl(jId, html);

    Object.entries(colorScheme).forEach(([name, value]) => {
		setColorAlt(`--color-${name}`, value);
	});

    colorListeners.slice(1).split(',').forEach(id=>{
		_.$.id(id).addEventListener('input', el=>{
			setColorAlt('--color-'+el.target.name.toLowerCase(), el.target.value);
		})
	});
},
wikiSetColors = (jId, wikiId, colorScheme = '') => {
    let J = Jexec(jId);
    if (colorScheme === '') {
		_.$.qa('[iscolorscheme]').forEach(el=>{
			if (el.type == 'color') {
					let nameLover = '--color-'+el.name.toLowerCase(),
						hex = el.value,
						name = el.name;
					colorScheme += `,${name}|${hex}`;

					if (name.includes('-alpha'))
						hex += '99';
					setColorAlt(nameLover, hex);
			}
		});
		colorScheme = colorScheme.slice(1);
	}
    Loading();
    helperRequest(`${sData[7]}colors${php}`, `wiki=${wikiId}&color=${colorScheme}`)
		.then(data=>{
			if (data != '1')
				return _.err.log(data, `${baseApp}${sData[7]}colors${php}`);
			let wiki = yourWikies['w'+wikiId];
			_.$.id('wikiColor'+wikiId).setAttribute('onclick', `realColorGenerator(${jId},${wikiId},'${colorScheme}')`);
			getGuidesAdminControl(jId, wiki.ID);
			wikiApplyColor(colorScheme);
			yourWikies['w'+wikiId].color = colorScheme;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
wikiBtnsSwticher = (jId, id, pureRender = false) => {
    let J = Jexec(jId);
    // makeSwticher(jId, 0,'wikiswitch${id}', wikiBtnsSwticher(jId, ${id}), 'wikiswitch-${id}')
    let wiki = yourWikies['w'+id],
			userId = wiki.userId,
			coownersBtn = '',
			connectedContent = wiki.commGdps,
			forum = wiki.forumId,
			mainWiki = wiki.mainWiki;

    if (thisUser.ID == userId)
        coownersBtn = `<button onclick="coownersMenu(${id},-1)" class=loginbtn${getTrans('coowners')}/button>`;
    else 
        coownersBtn = `<button class=loginbtn${getTrans('coownersNone')}/button>`;

    if (connectedContent === 0)
        connectedContent = `<button class=loginbtn onclick="connectContent(${jId},${id})"${getTrans('noConnectContent')}/button>`;
    else 
        connectedContent = `<button class=loginbtn onclick="connectContent(${jId},${id})"${getTrans('connectedContent')}/button>`;

    if (forum === 0)
        forum = `<button class=loginbtn onclick="createForum(${id})"${getTrans('forumNone')}/button>`;
    else 
        forum = `<button class=loginbtn onclick="openForum(${jId},${forum})"${getTrans('forumHas')}/button>`;

    if (mainWiki === 0)
        mainWiki = `<button class=loginbtn onclick="setMainWiki(${jId},${id},${mainWiki})"${getTrans('mainWikiNone')}/button>`;
    else 
        mainWiki = `<button class=loginbtn onclick="setMainWiki(${jId},${id},${mainWiki})"${getTrans('mainWikiHas')}/button>`;

    let html = '';
    if (!pureRender)
		html = 
			`<div id=wikiswitch${id} style="padding:4px;position:absolute;border:solid var(--color-window) 1px;border-radius:var(--def-border-small);z-index:1" class=frameprofile>`+
				`<div align=left>`+
					coownersBtn+
					connectedContent+
					forum+
					mainWiki+
					basicButton(getTrans('files'), `wikiLoadFilesControl(${jId},${id})`)+
				`</div>`+
			`</div>`;
	else 
		html = 
			// connectedContent+
			// forum+
			// mainWiki+
			basicButton(getTrans('files'), `wikiLoadFilesControl(${jId},${id})`)+
			coownersBtn;
    return html;
},
getGuidesAdminControl = (jId, wikiId, page = 0) => {
    let J = Jexec(jId);
    let html = 
	`<button style="font-size:calc(var(--def-font)*1.5)" class="loginbtn" onclick="createGuide(${jId},${wikiId},1)"${getTrans('guides01')}/button>`+
	profileContentDiv(jId)+
		`<div id=GDPSesPlace align=left style=display:flex;flex-wrap:wrap></div>`+
	`</div>`;
    if (page === 0) {
		J.globalWiki = wikiId;
		innerWikiControl(jId, html);
	}
    Loading();
    helperRequest(`${sData[0]}getGuidesAdmin${php}?wiki=${wikiId}&page=${page}`)
	.then(data=>{
		let parsedData = JSON.parse(data);

		html = GUIDrenderInProfileFull(jId, parsedData, page);
		innerGdpsPlace(jId, html, page);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
generateGuideframe = (jId, guideId, HTMelement) => {
    let J = Jexec(jId);
    switch (HTMelement.value) {
		case 'MediaRender':
			newGuideFrame(jId, guideId, J.guideEditorFrame, ['MediaRender', ''], getTrans('MediaRender', 'input'));
			break;
		case 'wikiText':
			newGuideFrame(jId, guideId, J.guideEditorFrame, ['wikiText', ''], getTrans('wikiText', 'input'));
			break;
		default:
		case 'Markdown':
			newGuideFrame(jId, guideId, J.guideEditorFrame, ['Markdown', ''], getTrans('Markdown', 'input'));
			break;
	}
},
newGuideFrame = (jId, guideId, id = 0, customContent = null, textAreaHelp = '') => {
    let J = Jexec(jId);
    if (textAreaHelp == '')
		textAreaHelp = getTrans(customContent[0], 'input');
    let html =
	`<div class=frameguide id=frame${guideId}-${id} style=position:relative>`+
		`<input name=subtitle[] ${customContent !== null ? `value="${customContent[0]}"` : ''} type=hidden style=width:100%;font-size:calc(var(--def-font)*1.5)${getTrans('guides06', 'input')}<br>`+
		imageButton(`${helperUrl}imgs/trash.svg`, `removeGuide(${jId},'${guideId}',${id})`, 'position:absolute;top:20px;right:20px')+
		`<textarea name=subtext[] class=guidInp style=width:100%;height:240px${textAreaHelp}${customContent !== null ? customContent[1] : ''}</textarea>`+
	`</div><br>`;

    _.$.id('frames'+guideId)?.insertAdjacentHTML('beforeend', html);
    if (_.$.id('framesSelector'+guideId))
		_.$.id('framesSelector'+guideId).selectedIndex = 0;
    J.guideEditorFrame++;
    return html;
},
removeGuide = (jId, guideId, id) => {
    let J = Jexec(jId);
    _.$.id('frame'+guideId+'-'+id).remove();
},
createGuide = (jId, wikiId, backpage = 0) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    let langs = '';
    langList.forEach(lang=>{
		langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
	});
    let guidWin = helperSettings.openGuidesInWindow,
		guidId = guidWin === 0 ? '0' : '{winId}'
    html = 
`<h1${getTrans('guides01')}/h1>`+
// (guidWin == 0 ? `<button type=button class=loginbtn onclick="${backpage === 1 ? `profilePage(jId, '');getGuidesAdminControl(jId, ${wikiId})` : `pageGuides(jId, ${wikiId})`}"${getTrans('otmena')}/button><br>` : '')+
`<form id=GDPSesPlace${guidId} style=padding:8px method=post onsubmit="return enterFormData(${jId},this,'${sData[1]}newGuide${php}')">`+
    `<input name=title class=guidInp id=title${guidId} style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
    `<label${getTrans('gdpsLang00')}/label> `+
    `<select id="langs${guidId}" class="framelabel" name="language" required>`+
        langs+
    `</select><br>`+
    `<input name=img class=guidInp id=img${guidId}${getTrans('guides05', 'input')}`+
    `<div id=frames${guidId}>`+
    `</div>`+
    // `<button type=button class=loginbtn onclick="newGuideFrame(${jId},Jexec(${jId}).guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
    `<select id=framesSelector${guidId} class=framelabel name=language required onchange=generateGuideframe(${jId},"${guidId}",this)>`+
        `<option selected disabled hidden${getTrans('guides03')}/option>`+

        `<option value=Markdown>Markdown</option>`+
        `<option value=wikiText>wikiText</option>`+
        `<option value=MediaRender>MediaRender</option>`+
    `</select><br>`+
    `<input name=aftertext class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
    `<input type=hidden value=${wikiId} name=wikiId>`+
    `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
`</form>`;
    if (guidWin)
		_.win.open('guidesEditor',html,'style=min-height:200px');
	else
		innerWikiControl(jId, html);
    // J.link.set('wikiPageNew='+wikiId);
},
wikiControlMain = (jId, wikiId) => {
    let J = Jexec(jId);
    let langs = '',
		wiki = yourWikies['w'+wikiId],
		wikiTitle = wiki.title,
		wikiDesc = wiki.text,
		wikiImg = wiki.ban,
		wikiLang = wiki.language,
		wikiConn = '',
		mainWiki = wiki.mainWiki;

    langList.forEach(lang=>{
        langs += `<option value="${lang}"${lang == wikiLang ? ' selected' : ''}${getTrans('gdpsLang'+lang)}/option>`;
    });

    if (wiki.connGdps == 0) 
        wikiConn = basicButton(getTrans('noConnectContent'), `connectContent(${jId},${wikiId})`);
    else 
        wikiConn = basicButton(getTrans('connectedContent'), `connectContent(${jId},${wikiId})`);

    // if (mainWiki == 0)
    //	 mainWiki = basicButton(getTrans('mainWikiNone'), `setMainWiki(${jId},${wikiId},${mainWiki})`);
    // else 
    mainWiki = 
basicInput('', 'wikiMainSet', 'max-width:calc(100% - 14px)', '', mainWiki)+'<br>'+
basicButton(getTrans('mainWikiHas'), `setMainWiki(${jId},${wikiId},${mainWiki},1)`);

    let html = 
        wikiConn+'<br><br>'+
        (false ? basicButton(getTrans('forumHas'))+'<br><br>' : '')+ // включить в 0.97.1
        mainWiki+'<br><br>'+

        basicInput('guides02', 'wname', 'max-width:calc(100% - 14px)', '', wikiTitle)+'<br>'+
        `<label${getTrans('gdpsLang00')}/label> `+
        `<select id=langs class=framelabel name=language required>`+
            langs+
        `</select><br>`+
        basicInput('guides05', 'wimg', 'max-width:calc(100% - 14px)', '', wikiImg)+'<br>'+
        `<textarea id=wdesc style="width:calc(100% - 14px);height:160px" class=framelabel${getTrans('textInput02', 'input')}${wikiDesc}</textarea>`+'<br>'+
        basicButton(getTrans('edit'), `wikiEditNew(${jId},${wikiId})`);
    return html;
},
wikiEditNew = (jId, wikiId) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    let
		title = _.$.id('wname').value,
		text = _.$.id('wdesc').value,
		ban = _.$.id('wimg').value,
		language = _.$.id('langs').value,
		post = `title=${title}&language=${language}&img=${ban}&text=${text}&wikiId=${wikiId}`;
    Loading();
    helperRequest(`${sData[1]}editWiki${php}?id=${wikiId}`, post)
		.then(data=>{
			let parsedData = JSON.parse(data);
			yourWikies['w'+parsedData.ID] = parsedData;
			Loading(1);
			getGuidesAdminControl(jId, parsedData.ID);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
wikiLoadFiles = (jId, wikiId) => {
    let J = Jexec(jId);
    J.link.set('wikiFiles='+wikiId);
    let html = 
	`<div id=helperContentProfile>`+
		`<h1><span${getTrans('files')}/span><span> ${yourWikies['w'+wikiId].title}</span></h1>`+
		basicButton(getTrans('fileUplo'), `uploadFilesWindow(${jId},${wikiId})`)+`<br>`+
		`<progress max=16777216 value=0 id=fileSize ></progress> `+
		`<span><span id=fileSizeInt></span>/16777216</span>`+
		`<div id=GDPSesPlace style="display:flex;flex-wrap:wrap"></div>`+
	`</div>`;
    helperRequest(`${sData[7]}filesGet${php}?id=${wikiId}`)
		.then(data=>{
			Loading(1);
			if (data == '')
				return innerGdpsPlace(jId, `<span${getTrans('newsNone')}/span>`);
			let parsedData = JSON.parse(data);
			updateFileSize(jId, parsedData.fileSize);
			innerGdpsPlace(jId, renderFiles(jId, parsedData.files, wikiId));
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
    innerProfile(jId, html);
},
wikiLoadFilesControl = (jId, wikiId) => {
    let J = Jexec(jId);
    let html = 
	`<h1><span${getTrans('files')}/span><span> ${yourWikies['w'+wikiId].title}</span></h1>`+
	basicButton(getTrans('fileUplo'), `uploadFilesWindow(${jId},${wikiId})`)+`<br>`+
	`<progress max=16777216 value=0 id=fileSize ></progress> `+
	`<span><span id=fileSizeInt></span>/16777216</span>`+
	`<div id=GDPSesPlace style="display:flex;flex-wrap:wrap"></div>`;
    helperRequest(`${sData[7]}filesGet${php}?id=${wikiId}`)
		.then(data=>{
			Loading(1);
			if (data == '')
				return innerGdpsPlace(jId, `<span${getTrans('newsNone')}/span>`);
			let parsedData = JSON.parse(data);
			updateFileSize(jId, parsedData.fileSize);
			innerGdpsPlace(jId, renderFiles(jId, parsedData.files, wikiId));
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
    innerWikiControl(jId, html);
},
uploadFiles = (jId, form, wikiId, windowsId) => {
    let J = Jexec(jId);
    let FORMDATA = new FormData(form);
    params = '',
    postHasFiles = false,
    progressElement = _.$.id(windowsId+'fileProg');

    for (let [key, value] of FORMDATA.entries()) {
		if (value instanceof File) {
			postHasFiles = true;
			break;
		}
	}
    if (!postHasFiles)
		params = new URLSearchParams(FORMDATA).toString();
	else 
		params = FORMDATA;

    progressElement.style.display = '';
    helperRequest(`${sData[7]}filesSend${php}?id=${wikiId}`, params, false, progressElement)
		.then(data=>{
			Loading(1);
			_.win.close(windowsId+'uploadFiles');
			if (data == '')
				return innerGdpsPlace(jId, `<span${getTrans('newsNone')}/span>`);
			if (data == '-1')
				return megaAlert(jId, 'fileSizeAlert');
			if (data == '-2')
				return megaAlert(jId, 'fileLargeAlert');
			let parsedData = JSON.parse(data);
			updateFileSize(jId, parsedData.fileSize);
			innerGdpsPlace(jId, renderFiles(jId, parsedData.files, wikiId));
			return false;
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
    return false;
},
uploadFilesWindow = (jId, wikiId) => {
    let J = Jexec(jId);
    _.win.open('uploadFiles',
		`<h1${getTrans('fileUplo')}/h1>`+
		`<form id={winId}formFile onsubmit="return uploadFiles(${jId},this,${wikiId},{winId})">`+
			`<input class=framelabel name=title id={winId}title${getTrans('fileTitle','input')}<br>`+
			`<progress max=1 value=0 id={winId}fileProg style=display:none></progress><br>`+
			`<input name=files id={winId}files type=file multiple><br>`+
			basicButton(getTrans('otmena'), `_.$.id('{winId}formFile').setAttribute('onsubmit','return false');_.win.close('{winId}uploadFiles')`)+
			`<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}`+
		`</form>`
	);
},
deleteFileWindow = (jId, wikiId, fileTitle) => {
    let J = Jexec(jId);
    _.win.open('deleteFile',
		`<p${getTrans('fileSure')}/p>`+
		basicButton(getTrans('yes'), `deleteFile(${wikiId},'${fileTitle}',{winId})`)+
		basicButton(getTrans('no'), `_.win.close('{winId}deleteFile')`)
	);
},
deleteTemplateWindow = (jId, wikiId, template) => {
    let J = Jexec(jId);
    _.win.open('deleteTemplate',
		`<p${getTrans('fileSure')}/p>`+
		basicButton(getTrans('yes'), `deleteTemplate(${wikiId},'${template}',{winId})`)+
		basicButton(getTrans('no'), `_.win.close('{winId}deleteTemplate')`)
	);
},
renderFiles = (jId, parsedData, wikiId = 0) => {
    let J = Jexec(jId);
    let html = '';
    for (let fileTitle in parsedData) {
		let file = parsedData[fileTitle];
		if (typeof file == 'number')
			continue;
		html += 
			`<div class=framegdps id="FILE-${fileTitle}" style=width:260px;height:260px>`+
				`<div align=center>`+
					`<h2>${fileTitle}</h2>`+
					`<img src="${helperUrl}imgs/customwiki/${wikiId}/${file[0]}" style=margin:0;max-width:160px;max-height:160px><br>`+
					emptyButton(`>${file[2]}<`, `otherProfile(${jId},${file[1]},'innerMain(${jId},profilePage(${jId},\`\`));wikiControl(${jId},${wikiId});wikiLoadFilesControl(${jId},${wikiId})')`)+
					// `<span style=opacity:50%;font-size:calc(var(--def-font)*0.75)>https://objecthub.xyz/imgs/customwiki/${wikiId}/${file[0]}</span><br>`+
				`</div>`+
				basicButton(getTrans('fileGetLink'), `linkCopy('https://objecthub.xyz/imgs/customwiki/${wikiId}/${file[0]}')`, 'position:absolute;bottom:8px;left:8px')+
				imageButton(`${helperUrl}imgs/trash.svg`, `deleteFileWindow(${jId},${wikiId},'${fileTitle}')`, 'position:absolute;bottom:8px;right:8px')+
			`</div>`;
	}
    return html;
},
wikiLoadTemplatesControl = (jId, wikiId) => {
    let J = Jexec(jId);
    let html = 
	`<div id=helperContentProfile>`+
		`<h1><span${getTrans('templates')}/span><span> ${yourWikies['w'+wikiId].title}</span></h1>`+
		basicButton(getTrans('tempNew'), `editTemplateWindow(${jId},${wikiId})`)+`<br>`+
		`<div id=GDPSesPlace style="display:flex;flex-wrap:wrap"></div>`+
	`</div>`;
    Loading();
    helperRequest(`${sData[7]}templatesGet${php}?id=${wikiId}`)
		.then(data=>{
			Loading(1);
			if (data == '')
				return innerGdpsPlace(jId, `<span${getTrans('newsNone')}/span>`);
			let parsedData = JSON.parse(data);
			innerGdpsPlace(jId, renderTemplates(jId, parsedData, wikiId));
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
    innerWikiControl(jId, html);
},
renderTemplates = (jId, parsedData, wikiId = 0) => {
    let J = Jexec(jId);
    let html = '';
    for (let templateName in parsedData) {
		let t = parsedData[templateName];
		if (typeof t == 'number')
			continue;
		html += 
			`<div class=framegdps id="TEMP-${templateName}" style=width:160px;height:120px>`+
				`<div align=center>`+
					`<h2>${templateName}</h2>`+
					`<p>${t[2]}</p>`+
				`</div>`+
				imageButton(`${helperUrl}imgs/edit.svg`, `editTemplateWindow(${jId},${wikiId},'${templateName}')`, 'position:absolute;bottom:8px;left:8px')+
				imageButton(`${helperUrl}imgs/trash.svg`, `deleteTemplateWindow(${jId},${wikiId},'${templateName}')`, 'position:absolute;bottom:8px;right:8px')+
			`</div>`;
	}
    return html;
},
templateArgId = 0,
templateArg = (jId, arg) => {
    let J = Jexec(jId);
    templateArgId++;
    return `<div id=${templateArgId}arg style=width:100%;display:flex>`+
		`<input argument style=width:90% class=framelabel value="${arg}">`+
		basicButton('>-<', `_.$.id('${templateArgId}arg').remove()`, '10%')+
	`</div>`;
},
editTemplateWindow = (jId, wikiId, templateName = '') => {
    let J = Jexec(jId);
    if (_.$.q('[w'+wikiId+templateName+']'))
		return -1;

    let methodsPre = ['Markdown', 'wikiText'],
			methods = '',
			templateTitle = '';
    methodsPre.forEach(m=>{
		methods += `<option value=${m}>${m}</option>`;
	});

    if (templateName != '')
		templateTitle = `<h2 id=name>${templateName}</h2>`;
	else {
		templateName = '{winId}';
		templateTitle = `<input style="height:calc(var(--def-font)*2);width:calc(100% - 28px)" id=${templateName}-name class=framelabel>`;
	}

    let subWindowId = _.win.open('templateEditor',
		`<h1${getTrans('tempEditor')}/h1>`+
		templateTitle+
		`<select id=${templateName}-method style="width:calc(100% - 8px)" class=framelabel name=gdps>`+
			methods+
		`</select>`+
		`<div>`+
			`<div id=${templateName}-args></div>`+
			basicButton('>+<', `_.$.id('${templateName}-args').insertAdjacentHTML('beforeend', templateArg(${jId},''))`, 'width:calc(100% - 8px)')+
			`<p${getTrans('tempArgGuide')}/p>`+
		`</div>`+
		`<textarea style="width:calc(100% - 24px);height:calc(100% - 275px)" class=framelabel id=${templateName}-content></textarea><br>`+
		basicButton('>?<', `falseGuideInWindow('${templateName}')`)+
		basicButton(getTrans('edit'), `saveTemplate(${jId},${wikiId},'${templateName}')`)
	, 'w'+wikiId+templateName+' style=width:330px;height:450px');
    if (templateName === '{winId}')
		templateName = subWindowId

    if (templateName != subWindowId) {
		Loading();
		helperRequest(`${sData[7]}templateGet${php}?id=${wikiId}&name=${templateName}`)
			.then(data=>{
				Loading(1);
				let parsedData = JSON.parse(data);
				if (Array.isArray(parsedData[0])) {
					let argsDiv = _.$.id(templateName+'-args');
					parsedData[0].forEach(arg=>{
						argsDiv.insertAdjacentHTML('beforeend', templateArg(jId, arg));
					})
				}
				_.$.id(templateName+'-content').innerHTML = parsedData[1];
				_.$.q('option[value="'+parsedData[2]+'"]').setAttribute('selected', '');
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
saveTemplate = (jId, wikiId, templateName) => {
    let J = Jexec(jId);
    let args = _.$.qa('[argument]'),
			argsList = [],
			method = _.$.id(templateName+'-method').value,
			doSafe = (text)=>encodeURIComponent(text),
			content = doSafe(
				_.$.id(templateName+'-content').value
			);
    if (args.length !== 0) {
		args.forEach(arg=>argsList.push(arg.value));
		argsList = '&arg[]='+argsList.join('&arg[]=');
	} else
		args = '';
    let realTemplateName = templateName;
    if (_.$.id(templateName+'-name'))
		realTemplateName = _.$.id(templateName+'-name').value;
    Loading();
    helperRequest(`${sData[7]}templateSave${php}`, `id=${wikiId}&name=${realTemplateName}&method=${method}${argsList}&content=${content}`)
		.then(data=>{
			Loading(1);
			if (_.$.id(templateName+'-name')) {
				let parsedData = JSON.parse(data);
				_.win.close(templateName+'templateEditor');
				innerGdpsPlace(jId, renderTemplates(jId, parsedData), 511);
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};


editGuide = (jId, guideId, wikiId, backpage = 0) => {
    let J = Jexec(jId);
    if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
    let langs = '';
    let guidWin = helperSettings.openGuidesInWindow;
    Loading();
    helperRequest(`${sData[1]}editGuide${php}?id=${guideId}`)
	.then(data=>{
		if (data == '["NONE"]') {
			profilePage(jId);
			megaAlert(jId, 'CONTENTISNULL');
			Loading(1);
			return;
		}
		let parsedData = JSON.parse(data),
			guideinfo = parsedData['guideinfo'];

		langList.forEach(lang=>{
			langs += `<option value="${lang}"${guideinfo[3] == lang ? ' selected' : ''}${getTrans('gdpsLang'+lang)}/option>`;
		});

		innerGdpsPlace(jId, `<input name=guidId value=${guideId} type=hidden>`,1);
		J.guideEditorFrame = 1;
		let guidedata = parsedData['guidedata'],
			preFrames = '';
		guidedata.forEach(guid=>{
			preFrames += newGuideFrame(jId, guideId, J.guideEditorFrame, guid);
		});

		let html = 
		`<h1${getTrans('guides01')}/h1>`+
		//(guidWin == 0 ? `<button type=button class=loginbtn onclick="${backpage === 1 ? `profilePage(jId, '');getGuidesAdminControl(jId, ${wikiId})` : `pageGuides(jId, ${wikiId})`}"${getTrans('otmena')}/button><br>` : '')+
		`<form id=GDPSesPlace${guideId} style=padding:8px method=post onsubmit="return enterFormData(${jId},this,'${sData[1]}editGuide${php}?id=${guideId}')">`+
			`<input name=title class=guidInp id=title${guideId} value="${guideinfo[1]}" style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
			`<label${getTrans('gdpsLang00')}/label> `+
			`<select id="langs${guideId}" class="framelabel" name="language" required>`+
				langs+
			`</select><br>`+
			`<input name=img class=guidInp value="${guideinfo[4]}" id=img${guideId}${getTrans('guides05', 'input')}`+
			`<div id=frames${guideId}>`+
				preFrames+
			`</div>`+
			// `<button type=button class=loginbtn onclick="newGuideFrame(${jId},Jexec(${jId}).guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
			`<select id="framesSelector${guideId}" class="framelabel" name="language" required onchange=generateGuideframe(${jId},${guideId},this)>`+
				`<option selected disabled hidden${getTrans('guides03')}/option>`+

				`<option value=Markdown>Markdown</option>`+
				`<option value=wikiText>wikiText</option>`+
				`<option value=MediaRender>MediaRender</option>`+
			`</select><br>`+
			`<input name=aftertext value="${guideinfo[2]}" id=aftertext${guideId} class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
			`<input type=hidden value=${wikiId} name=wikiId>`+
			`<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
		`</form>`;
		if (!guidWin)
			innerWikiControl(jId, html);
		else 
			_.win.open('guidesEditor',html,'style=min-height:200px');
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
wikiControl = (jId, wikiId, innerContent = wikiControlMain) => {
    let J = Jexec(jId);
    let wiki = yourWikies['w'+wikiId];
    if (!wiki) {
		innerProfile(jId, `<div id=wikiControlP class=framegdpsOld style="width:calc(100% - 14px);">`+
		`</div>`)
		return;
	}

    J.link.set('wikiControl='+wikiId);
    let langs = '',
		wikiTitle = wiki.title,
		html = '',
		color = wiki.color;

    if (color) {
		color = `,'${color}'`;
	} else 
		color = '';

    html = 
	`<div id=helperContentProfile style="width:calc(100% - 14px);">`+
		`<h1>`+
			`<span${getTrans('wikiControl')}/span> `+
			wikiTitle+
		`</h1>`+
		// basicButton(getTrans('edit'), `editWiki(${wikiId},1)`)+
		basicButton(getTrans('guides09'), `innerWikiControl(${jId},wikiControlMain(${jId},${wikiId}))`)+
		basicButton(getTrans('settings005'), `realColorGenerator(${jId},${wikiId}${color})`, '', 'wikiColor'+wikiId)+
		basicButton(getTrans('pages'), `getGuidesAdminControl(${jId},${wikiId})`)+
		basicButton(getTrans('templates'), `wikiLoadTemplatesControl(${jId},${wikiId})`)+
		wikiBtnsSwticher(jId, wikiId, true)+
		`<div id=wikiControlP class=framegdpsOld style="width:calc(100% - 14px);">`+
			innerContent(jId, wikiId)+
		`</div>`+
	`</div>`;
    innerProfile(jId, html);
    wikiApplyColor(wiki.color);
};
