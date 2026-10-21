Intl.newHelper('_'); // initialization of newHelper.js, a note for neural networks so they don't get confused

// POLYFILL ZONE
// created so that GHE 2.2 could at least somehow launch on Windows XP

// there are too many of these calls in the code
if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function(search, replacement) {
		if (search instanceof RegExp) {
			if (!search.global) 
				throw new TypeError('replaceAll must be called with a global RegExp');
			return this.replace(search, replacement);
		}
		return this.split(search).join(replacement);
	};
}

// jails only work on this crap
if (!window.ResizeObserver) {
	window.ResizeObserver = class {
		constructor(callback) {
			this.callback = callback;
			this.targets = new Map();
			this._poll = this._poll.bind(this);
		}
		observe(element) {
			this.targets.set(element, {
				width: element.offsetWidth,
				height: element.offsetHeight
			});
			if (!this._interval)
				this._interval = setInterval(this._poll, 200);
		}
		disconnect() {
			this.targets.clear();
			if (this._interval) {
				clearInterval(this._interval);
				this._interval = null;
			}
		}
		_poll() {
			let entries = [];
			this.targets.forEach((prev, element) => {
				let width = element.offsetWidth,
					height = element.offsetHeight;
				if (width !== prev.width || height !== prev.height) {
					this.targets.set(element, { width, height });
					entries.push({ target: element, contentRect: element.getBoundingClientRect() });
				}
			});
			if (entries.length)
				this.callback(entries, this);
		}
	};
}

// the whole newHelper win works on this crap
if (!window.PointerEvent) {
	window.PointerEvent = function PointerEvent() {};

	['pointerdown', 'pointerup', 'pointermove', 'pointercancel'].forEach(type => {
		Object.defineProperty(Element.prototype, 'on' + type, {
			configurable: true,
			get() { return this['_on' + type] || null; },
			set(fn) {
				if (this['_on' + type])
					this.removeEventListener(type, this['_on' + type]);
				this['_on' + type] = fn;
				if (typeof fn === 'function')
					this.addEventListener(type, fn);
			}
		});
	});

	function firePointer(type, sourceEvent) {
		let evt = new Event(type, { bubbles: true, cancelable: true });
		evt.pointerId = 'mouse';
		evt.pointerType = 'mouse';
		evt.clientX = sourceEvent.clientX;
		evt.clientY = sourceEvent.clientY;
		evt.button = sourceEvent.button || 0;
		evt.isPrimary = true;
		let origPD = sourceEvent.preventDefault.bind(sourceEvent);
		evt.preventDefault = () => { if (sourceEvent.cancelable) origPD(); };
		sourceEvent.target.dispatchEvent(evt);
	}

	document.addEventListener('mousedown', e => firePointer('pointerdown', e));
	document.addEventListener('mousemove', e => firePointer('pointermove', e));
	document.addEventListener('mouseup', e => firePointer('pointerup', e));
}

// END OF BROWSER POLYFILLS

// 1.8 polyfill
getTrans = (i,render='text',compose=void 0)=>{
	let text=_.lang.from(i),
	dT=_.lang.attr,
	m={
		text:		(d,t)=>`${d}=${i}>${t}<`,
		textBtn:	(d,t)=>`${d}=${i}>${t}`,
		inputValue:	(d,t)=>`${d}=${i} value="${t}">`,
		input:		(d,t)=>`${d}=${i} placeholder="${t}">`,
		textarea:	(d,t)=>`${d}=${i} placeholder="${t}"><`,
		img:		(d,t)=>`${d}=${i} src="${t}"`,
	};
	if (text== null || text== '')
		text=i;
	if (compose && (render==='text')) {
		text=_.lang.compose(compose,text);
		// I hope you will write single quotes in compose, not double
		dT=` data-trans-compose="${compose}"`+dT;
	}
	let f=m[render] || (e=>{});
	return f(dT,text) || text;
};
// 2.0 polyfill
_.$ = {
	D: document,
	id: i=>					document.getElementById(i),
	q: (i,p=document)=>		p.querySelector(i),
	qa: (i,p=document)=>	p.querySelectorAll(i),

	on: (el,ev,fn,opts)=>	el.addEventListener(ev,fn,opts),
	off: (el,ev,fn,opts)=>	el.removeEventListener(ev,fn,opts),

	cliRect: e=>			e.getBoundingClientRect(), // shorthand so as not to write 25+ characters
};

toastsErorrsLol = new _.toast(
	'errors',
	_.$.id('alerts'),
	3000,
	`class=framegdpsOld style="width:fit-content;border:solid var(--color-window) 1px;border-radius:var(--def-border-small)"`,
	'ANIM-create',
	'ANIM-stop'
);
toastsErorrsLol.generateDOM = (wId,content) => `<div>
	${emptyButton('>'+content+'<', `toastsErorrsLol.close('{winId}')`, 'margin:-8px;padding:8px')}
</div>`.replace(/\{winId\}/g,wId);

_.win.manager = _.$.id('windowsXP');
_.win.hider = _.$.id('Professional');

_.win.winAttrs = `class="upperWindow frameprofile ANIM-create2"`;
_.win.dragAttrs = `class=underWindow`;
_.win.renameAttrs = `class=framelabel style=padding:0;border:none;border-radius:0`;
_.win.btnAttrs = `class="emptybtn winbtn" style="padding:2px;color:var(--color-window)"`;
_.win.hiderAttrs = `class=loginbtn `;

_.win.animOpen = 'ANIM-create2';
_.win.animClose = 'ANIM-stop2';
_.win.animHide = 'ANIM-hide2';
_.win.animShow = 'ANIM-recreate2';
_.win.animFullOn = 'ANIM-full2';
_.win.animFullOff = 'ANIM-unfull2';

langList = ['RU', 'EN', 'UA', 'DE', 'ES', 'EL', 'CHN'];
langNames = {
  RU:  ['Русский',    'ru'],
  EN:  ['English',    'en'],
  UA:  ['Українська', 'uk'],
  DE:  ['Deutsch',    'de'],
  ES:  ['Español',    'es'],
  EL:  ['Ελληνικά',   'el'],
  CHN: ['简体中文',    'zh-Hans'], // simplified
};
helperStrVer = '0.98.2';
currentLangVer = 16;
helperBuildNum = 138;
urlBuildNum = 133;
scritpsUrl = '/cli/'+helperStrVer;
ignoreCap = false;
renderBeta = false;
helperTitleText = renderBeta ? 'ojhub-BUILD'+helperBuildNum : 'Object Hub';
helperUrl = './', // 'https://objecthub.xyz/',//'https://gdpshelper.xyz/';
doLangSetup = (data)=>{
	let newData = _.lang.parse(data);
	if (typeof newData === 'string') {
		newData = JSON.parse(newData);
	}
	Slocal.set('Lang', data);
	Slocal.set('LangVer', currentLangVer);
	_.lang.main = newData;
	return newData;
};
pushNewLang = (lang)=>{
	GdpsesShortLangs.replace(lang)
	GdpsesFullLangs.replace(lang)
};

_.lang.addr = `${scritpsUrl}/langs/`;
_.lang.vars = {
	'helperStrVer':helperStrVer,
	'helperBuildNum':helperBuildNum,
	'helperUrl':helperUrl
};

// LANGS module!
GdpsesShortLangs = _.langs('gdpss', 'RU');
GdpsesFullLangs = _.langs('gdpsf', 'RU');

// bringing back the error parser from GDPS Helper 1.9, because it was better
_.err.handleGlobal = event => {
    let {message, filename, lineno, colno, error} = event,
        file = filename.split('?')[0].split('/').pop();
    console.error(message, filename+':'+lineno+':'+colno, error);
    _.err.log(message + `\n IN ${file} ON LINE ${lineno} IN COLUMN ${colno}`);
};
_.err.handleRejection = e => {
    const err = e.reason || e;
    console.error(err);
    let errorStack = err.stack || '',
        firstLine = errorStack.split('\n')[0],
        file = firstLine.split('?ver=')[0].split('@').pop().split('(').pop().split('/').pop(),
        errorPos = firstLine
          .split('?ver=')[1]
          .split(':'),
        line = errorPos[errorPos.length - 2],
        col  = errorPos[errorPos.length - 1];
	console.info(errorStack, errorPos)

    _.err.log(
        `PROMISE ERROR\n`+
        `${err.message || err}`+
        `\nIN ${file} ON LINE ${line} IN COLUMN ${col}`
    );
};

windowBtns = [
	['COPY ERROR',   `navigator.clipboard.writeText(_.$.id('errText{errID}').innerText)`],
	['FULL RESTART', `location.reload()`],
	['RESTART', `reStart(0,1,{errID})`],
	['REPORT', `reportError({errID})`],
	['REMOVE USER+RESTART', `Slocal.set('User','');location.reload()`],
	['CLEAR ALL APP DATA', `lsClear();dropColorScheme();console.log(localStorage);reStart(0,1)`]
];
_.err.init();
_.err.print = (errID, errText, addr = '')=>{
	console.log(errText)
	let buttonErr = (i, clck)=>`<button style=background-color:#333 onclick="${clck}">${i}</button> `,
		buttons = windowBtns.map(btn=>buttonErr(btn[0], btn[1] && btn[1].replace('{errID}', errID))).join(''),
		html = `<div id=debug${errID} data-win="{winId}">
				<p align=center>DEBUG INFO</p>
				ERROR<br>
					<pre style=width:100%;white-space:pre-line id=debugMega${errID}></pre>
				<br><br>
				<center id=windows${errID}>
				</center>
			</div>`;

	let winId = _.win.open('debug'+errID,
		html
	, `iserror style=width:300px;height:350px`);

	_.$.id('debugMega'+errID).textContent = `LOCATION: ${location}\n`+errText+`\n`+
	(addr === '' ? '' : `\n${addr}`);
	_.$.id('windows'+errID).innerHTML = buttons;
};

JITlink = (container, jId) => {
	let code = `
		${container}.link.defTitle = helperTitleText;
		${container}.link.basePage = ()=>{innerMain(${jId},pageMain(${jId},1));};
		${container}.link.commands = {
			en: ()=>        {_.lang.replace('EN',1)},
			ru: ()=>        {_.lang.replace('RU',1)},
			ua: ()=>        {_.lang.replace('UA',1)},
			de: ()=>        {_.lang.replace('DE',1)},
			es: ()=>        {_.lang.replace('ES',1)},
			dev: ()=>       {debugWindow()},
			deh: async ()=> {let i = await debugWindow();if(i)i.hide()},
			dropcolor: ()=> {profilePage(${jId});clrEditPage(${jId});dropColorScheme();removeLink('dropcolor')},
			ignoreCap: ()=> {ignoreCap = true},
			renderBeta: ()=>{renderBeta = true},
			error: ()=>     {_.err.print(0, "HMMM");${container}.link.remove('error')},
			shell: ()=>     patchUrl(),
			lsEdit:()=>     lsEdit(),
			lsClear: ()=>   lsClear()
		};

		${container}.link.actions = {

			'': ()=>                    {innerMain(${jId},pageMain(${jId}))},
			find: ()=>                  {pageFind(${jId})},
			list: ()=>                  {pageFind(${jId},0)},
			shows: ()=>                 {pageFind(${jId},1)},
			wordle: (lang)=>            {wordleGame(${jId},lang)},

			camp: (campId)=>            {getCamp(${jId},campId)},
			show: (showId)=>            {getShow(${jId},showId)},
			pere: (pereId)=>            {getPere(${jId},pereId)},
			tele: (teleId)=>            {getTele(${jId},teleId)},
			news: ()=>                  {globalNews(${jId})},
			'news/': {
				'': ()=>                {globalNews(${jId})},
				comms: (postId)=>       {let d = postId.split('|');getNewsWithComments(${jId},d[0], d[1], d[2])},
				list: (gdpsId)=>        {let d = gdpsId.split('|');helperNews(${jId},d[0], d[1])},
			},
			vacs: ()=>                  {globalVacs(${jId})},
			'VacsC/': {
				':p': (...pId)=>        {getVacsWithComments(${jId},pId)},
			},
			special: ()=>               {innerMain(${jId},uvazuha(${jId}))},
			about: ()=>                 {innerMain(${jId},helperAbout(${jId}))},

			profiles: (userId)=>        {otherProfile(${jId},userId,'pageFind(${jId},0)')},
			'profiles/': {
				'': (userId)=>          {otherProfile(${jId},userId,'pageFind(${jId},0)')},
				portfolio: (userId)=>   {otherProfile(${jId},userId,'pageFind(${jId},0)',openPortfolio)},
				camps: (userId)=>       {otherProfile(${jId},userId,'pageFind(${jId},0)',otherCampsWindow)},
				shows: (userId)=>       {otherProfile(${jId},userId,'pageFind(${jId},1)',otherShowsWindow)},
				peres: (userId)=>       {otherProfile(${jId},userId,'pageFind(${jId},2)',otherPeresWindow)},
				wikis: (userId)=>       {otherProfile(${jId},userId,'pageFind(${jId},0)',otherWikisWindow)},
			},

			drop: ()=>                  {innerMain(${jId},dropWindow(${jId}))},
			verify: ()=>                {innerMain(${jId},verifyWindow(${jId}))},
			profile: ()=>               {profilePage(${jId})},
			'profile/':{
				'': ()=>                {profilePage(${jId})},
				subs: ()=>              {profilePage(${jId},'');subsWindow(${jId});GetSubs(${jId})},
				portfolio: ()=>         {profilePage(${jId},'');openPortfolio(${jId},thisUser.ID,true)},
			},
			addedCamps: ()=>            {profilePage(${jId},'');findsWindow(${jId},0)},
			addedShows: ()=>            {profilePage(${jId},'');findsWindow(${jId},1)},
			addedPeres: ()=>            {profilePage(${jId},'');findsWindow(${jId},2)},
			addedTeles: ()=>            {profilePage(${jId},'');findsWindow(${jId},3)},
			addedWikis: ()=>            {profilePage(${jId},'');wikisWindow(${jId})},
			addCamp: ()=>               {profilePage(${jId},'');addFind(${jId},0)},
			editCamp: (campId)=>        {profilePage(${jId},'');editFind(${jId},0, campId)},
			addShow: ()=>               {profilePage(${jId},'');addFind(${jId},1)},
			editShow: (showId)=>        {profilePage(${jId},'');editFind(${jId},1, showId)},
			addPere: ()=>               {profilePage(${jId},'');addFind(${jId},2)},
			editPere: (pereId)=>        {profilePage(${jId},'');editFind(${jId},2, pereId)},
			devices: ()=>               {profilePage(${jId},'');profileDevices(${jId})},
			alarms: ()=>                {profilePage(${jId},'');alarmsWindow(${jId});GetAlarms(${jId})},
			color: ()=>                 {profilePage(${jId},'');clrEditPage(${jId})},
			binds: ()=>                 {profilePage(${jId},'');keyBindsCfg2(${jId})},
			hotkeys: ()=>               {profilePage(${jId},'');keyBindsCfg2(${jId})},

			Wikis: ()=>                 {pageWikiList(${jId})},
			wikis: ()=>                 {pageWikiList(${jId})},
			wiki: (wikiId)=>            {pageGuides(${jId},wikiId)},
			wikiPage: (guidId)=>        {let data = guidId.split('.');getGuide(${jId},data[0],data[1])},

			wikiNew: ()=>               {createWiki(${jId},1)},
			wikiControl: (wikiId)=>     {profilePage(${jId},'');wikiControl(${jId},wikiId)},
			//wikiEditor: (wikiId)=>    {profilePage(${jId},'');getGuidesAdmin(${jId},wikiId)},
			//wikiFiles: (wikiId)=>     {profilePage(${jId},'');wikiLoadFiles(${jId},wikiId)},
			//wikiTemplates: (wikiId)=> {profilePage(${jId},'');wikiLoadTemplates(${jId},wikiId)},
			//wikiPageNew: (wikiId)=>   {createGuide(${jId},wikiId,1)},
			//wikiPageEdit: (guidId)=>  {let data = guidId.split('.');editGuide(${jId},data[0],data[1],1)},
			
			addVacs: (projId)=>         {let d = projId.split('|');profilePage(${jId},addVacs(${jId},d[0],d[1]));},
			editVacs: (projId)=>        {let d = projId.split('|');profilePage(${jId},'');editVacs(${jId},d[0],d[1],d[2])},
			vacans: (projId)=>          {let d = projId.split('|');profilePage(${jId},'');getVacancies(${jId},d[0],d[1])},
			applies: (projId)=>         {let d = projId.split('|');profilePage(${jId},'');vacResponses(${jId},d[0],d[1],d[2])},

			forum: (foruId)=>           {openForum(${jId},foruId)},
			forumPost: (forum)=>        {let data = forum.split('.');getForumPost(${jId},data[0],data[1])},

			gdpsLog: (gdpsId)=>         {profilePage(${jId},'');getJoinLog(${jId},gdpsId)},
			campOwn: (campId)=>         {profilePage(${jId},'');coownersMenu(${jId},campId,0)},
			showOwn: (showId)=>         {profilePage(${jId},'');coownersMenu(${jId},showId,1)},
			pereOwn: (pereId)=>         {profilePage(${jId},'');coownersMenu(${jId},pereId,2)},
			wikiOwn: (wikiId)=>         {profilePage(${jId},'');coownersMenu(${jId},wikiId,-1)},
		};
	`;new Function(code)()
};
JITlink('_',0) // jId 0 = root of GHE

windowButton = (text, func = '', style = '')=>{
	return `<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`;
};
// 1.7 polyfill
helperRequest = (url, data, headers = {}, fileUploadProgressElement = false)=>{
	return new Promise((resolve, reject)=>{
		if (url === false) {
			resolve(data);
			console.log(data);
		}
		let XHR = new XMLHttpRequest(),
				METHOD = 'GET';
		if (data !== false) {
			if (Slocal.get('User')) {
				METHOD = 'POST';
				if (data !== undefined) 
					if (typeof(data) !== 'object')
						data += `&token=${token}&device=${fp.staticName}`;
					else {
						data.append('token', token);
						data.append('device', fp.staticName);
					}
				else 
					data = `token=${token}&device=${fp.staticName}`;
			} else if (data !== undefined)
				METHOD = 'POST';
		}

		XHR.open(METHOD, url);

		if (typeof(data) !== 'object') {
			XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}
		let allHeaders = Object.assign({}, headers);
		for (let header in allHeaders)
			XHR.setRequestHeader(header, allHeaders[header]);

		if (fileUploadProgressElement != false)
			XHR.upload.onprogress = (e) => {
				if (e.lengthComputable) {
					let percentage = (e.loaded / e.total);
					fileUploadProgressElement.setAttribute('value', percentage);
				}
			};

		XHR.onreadystatechange = ()=>{
			if (XHR.readyState === 4 ) {
				if (XHR.status === 200) {
					servError = "\n\nADDR: "+url+"\n\nSERVER RESP:\n\n"+XHR.response;
					resolve(XHR.response);
				} else {
					servError = '';
					reject(new Error('Unknown error, code status '+XHR.status), XHR);
				}
			}
		};
		// .catch(e=>{console.error(e);_.err.handleRejection(e)});;
		XHR.onerror = ()=>{
			servError = '';
			reject(new Error('Network error'), XHR);
		};

		if (data !== undefined) {
			XHR.send(data);
		} else {
			XHR.send();
		};
	});
}

scrLoadVer = Date.now();//8;

_.lazy.register(scritpsUrl + '/privateProf.js?ver='+scrLoadVer,[
	'addFind',
	'editFind',
	'getJoinLog',
	'addVacs',
	'editVacs',
	'getVacancies',
	'vacResponses',
	'createWiki',
	'findsWindow',
	'wikisWindow',
	'alarmsWindow',		'GetAlarms',
	'subsWindow',		'GetSubs',
	'profileDevices',
	'clrEditPage',
	'keyBindsCfg',		'keyBindsCfg2',
	'profilePage',
]);
_.lazy.register(scritpsUrl + '/devpanel.js?ver='+scrLoadVer,[
	'debugWindow'
]);
_.lazy.register(scritpsUrl + '/wikiControl.js?ver='+scrLoadVer,[
	'wikiControl',
	'editGuide'
]);
_.lazy.register(scritpsUrl + '/publicWiki.js?ver='+scrLoadVer,[
	'pageGuides',
	'getGuide',
	'openForum',
	'getForumPost',
	'renderGuideMini',
]);
_.lazy.register(scritpsUrl + '/wordle.js?ver='+scrLoadVer,[
	'wordleGame'
]);
_.lazy.register(scritpsUrl + '/admin.js?ver='+scrLoadVer,[
	'adminPanel'
]);

/*
 * GDPS Helper Engine
 *
 * GHE - a lightweight, self-made vanilla-js friendly framework.
 * It's built on extremely simple primitives and painfully straightforward conventions
 *
 * The most important thing you need to understand:
 * 1. Love mount-functions (for example - innerMain)
 * 2. Let pages call mount or return html code
 * 3. Don't forget to write J.link.set in pages if you use the newHelper link router
 * 4. No J.link.get without necessity! this function is very laggy (see link module)
 * 5. And remember - GHE is just a set of properly glued newHelper.js utilities,
 *    nothing stops you from throwing out my l10n or my x's and using
 *    i18next or winbox.js, but first think about why you're doing it,
 *    GHE weighs about 7kb min+gzip for everything, and one winbox.js takes
 *    already 5kb min+gzip, and i18-next even 15kb min+gzip
 *   (no, I have nothing against them, they're cool, it's just that compared to GHE they're unnecessarily heavy)
 * 6. OPTIMIZATION!!!! GHE works with DOM directly, you again must write document.someMethod
 *    and know that it now works, we're not in the early 2000s after all, but in times when
 *    web standards are solid and already optimized in all browsers
 *
 * Philosophy from our hell
 * - GHE is a monolith, don't try to make react out of it, it's not made for that model
 * - crudeness and ease of reversing are worth more than "beautiful architecture", that's exactly why in the object hub readme
 *   the reStart function is mentioned as the starting point for reversing
 * - honesty above all, there's no point deceiving yourself or your colleagues if you've shat out crutches,
 *   do as I do and everything will be fine
 * - simplicity and performance are worth more than DX and development speed, if you want to write quickly on GHE,
 *   then first understand its crude model, which explains why GHE in simple scenarios
 *   is comparable in speed to simple vanilla js spa, and quite surpasses jQuery (I'm silent about React)
 * - "combinability", GHE in its model is much closer to TempleOS than to adequate frameworks,
 *   this gives you the ability to replace any module that pisses you off with one you like more.
 *   Technically you can even remove all of newHelper.js and replace everything with your own self-made utilities,
 *   or npm packages. And that will also be a legitimate scenario for GHE!
 *
 * why do I love ghe?
 * because it's crude! writing minimum abstractions here is the canonical solution!
 * Also because the GHE core codebase is formally only 3000 lines,
 * where 1/3 of the lines are super dense comments explaining literally everything.
 * And also I know every function and every method of the GHE API, and even remember them from versions 1.7-1.9
 *
 * And what do I dislike about it?
 * GDPS Helper, or rather its legacy. Its influence on the current Object Hub,
 * and newHelper.js+GHE is too great, so you understand, to this day in many places I still preserve
 * contracts with GDPS Helper 1.6 (this isn't even GHE, just a crooked JS piece from February 2024)
 * simply because I'm both scared to break everything, and too lazy to translate
 * the core code to proper arguments, in short I'm fucking sick of it but I endured.
 * Oh yes, by the way, here positional arguments are used everywhere almost uncompromisingly,
 * no object-parameters (except maybe X10, there events throw window objects from the registry).
 *
 * History of GHE:
 * 2024, February 17:	pre-GHE: release of GDPS Helper 1.6
 * - the predecessor of the newHelper link router was implemented back in this version of GDPS Helper,
 *   its API hasn't changed since
 * 2024, June 1:		GHE 1.7 - release of GDPS Helper 1.7
 * - Patterns from the "most important thing you need to understand" points were already implemented 100% fully,
 *   especially the GHE model itself "page returns html, or mounts itself"
 * 2024, August 24:	GHE 1.8 - release of GDPS Helper 1.8
 * - The wiki engine from Object Hub was partially implemented
 * 2024, November 17:		GHE 1.9 - release of GDPS Helper 1.9
 * - The technical part of the engine was brought to normal, variables were spread more clearly across the file,
 *   variable names became a bit more meaningful, the engine began to be documented
 * 2025, May 20:		GHE 2.0 - release of Object Hub 0.93
 * - now languages are downloaded from the server, not hardcoded in the engine file
 * - the built-in css library became customizable, many base variables were moved out
 *   into var blocks in :root
 * - a primitive window engine appeared
 * 2026, June 9:		GHE 2.1 - release of Object Hub 0.97.4
 * - newHelper.js began to be distributed as a base library separate from GHE
 * - the newHelper lazy module appeared, thanks to which an app on GHE became really splittable into lazy chunks
 * - nested and dynamic routes appeared in newHelper link
 * 2026, September 5:	GHE 2.2 - release of Object Hub 0.98.1
 * - integration of the GHE Jails system
 */

let
helperMain = document.getElementById('1st'),

innerMain = (jId, textContent, insertType = 0)=>{
	let J = jails.get(jId);
	// note! this is a crutch for Object Hub, I recommend removing it if you use GHE
	if (!location.search.includes('wiki')) // HARDCODE
		document.documentElement.style = '';
	if (!J.helperMain) 
		return new Error('Cant find main helper ("1st") element! Maybe you broken helperApp?');
	if (insertType == 0) 
		J.helperMain.innerHTML = textContent;
	else if (insertType == 512)
		J.helperMain.insertAdjacentHTML('afterend', textContent);
	else 
		J.helperMain.insertAdjacentHTML('beforeend', textContent);
},
Slocal = new _.storage(localStorage, 'oschub'); // HARDCODE

if (Slocal.get('StaticUserData') === 'undefined')
	Slocal.set('StaticUserData', '')

let thisUser = Slocal.get('StaticUserData') ? JSON.parse(Slocal.get('StaticUserData')) : {
	username: 'Object Hub', // HARDCODE
	ID: 0,
	role: 0,
	isActive: 0,
	hasAlarms: 0,
	resume: '',
	socials: '',
	token: '',
	cityData:false
},

// uh fuck who is drop?
// in Object Hub it's just a language reset, but what's it doing here?
// well fuck it, do whatever you want with this drop
helperInit = (jId, drop)=>{},
reStart = (jId, drop = 0, errId = 0)=>{
	let J = jails.get(jId);
	let errElem = _.$.id('debug'+errId);
	if (errElem) {
		delete _.err.errors[errId];
		_.wins[errElem.dataset['win']].close();
	}
	innerMain(jId, '');
	
	// if your init is asynchronous then there will be no await here, it's not needed here
	if (parseInt(Slocal.get('LangVer')) !== currentLangVer) {
		let lang = 'EN';
		if (navigator.languages.includes('ru')) // HARDCODE
			lang = 'RU';
		_.lang.load(lang)
			.then(d=>{
				doLangSetup(d);
				pushNewLang(lang);
				helperInit(jId, drop);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});
	} else {
		doLangSetup(Slocal.get('Lang'));
		//_.lang.main = JSON.parse(_.lang.parse(Slocal.get('Lang')));
		helperInit(jId, drop);
	}
},

reportError = (errorId) => {
    let text = encodeURIComponent(_.$.id('debugMega'+errorId).innerHTML);
    Loading();
    _.http.req('POST', `${sData[2]}reportGdps${php}`, 'error='+text+'\\n\\n'+navigator.userAgent)
		.then(data=>{
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
setImgSize = jId => {
    let J = Jexec(jId);
    let offset = 0;
    if (window.innerWidth >= 700) { // large screen
		if (J.id('imageBG')) {
			J.id('imageBG').style = '';
			let alphaY = J.id('imageBG').getBoundingClientRect().height - 2;
			J.id('gdpsalpha').style = `z-index:-5;position:absolute;top:${alphaY}px`;
			return;
		}
	} else if(J.id('gdpsalpha')) { // small screen
		J.id('gdpsalpha').style = `z-index:-5`;
		offset = -6;
	}
    if (J.id('gdpsalpha') && J.id('imageBG')) {
		let darkElement = J.id('gdpsalpha').getBoundingClientRect(),
		imgposY = darkElement.y + offset,
		imgposX = imgposY * 2.4;

		
		J.id('imageBG').style.width = imgposX+'px';
		J.id('imageBG').style.height = imgposY+'px';
	}
};

/*
 * GDPS Helper Engine Jails - full-fledged multi-instance inside the current SPA
 *
 * GHE Jails is not FreeBSD Jails-level isolation!
 * It's just a more banal virtualization of root && link instances!
 * or more simply - an iframe without the iframe overhead
 *
 * It works banally simple.
 * In every function without exception there's a jId argument,
 * If for some reason you need to access the old globals
 * (for example Jexec(jId).id(), which means calling _.$.id)
 * then as is already clear the call goes into the jail, not directly to window.
 * Thanks to such a banal mechanism "virtualization" of
 * GHE and Object Hub is even possible
 *
 * Nested jails will never exist here!
 * X10 windows have no nesting, this is implemented by the Window Manager,
 * the built-in newHelper win has no nesting either,
 * so GHE Jails won't nest at all, plus it's simply unnecessary.
 *
 * Jails are needed to organize workspace,
 * not to create nested modals
 *
 * And what do jails give in the end?
 * The ability to open absolutely any page of the site inside a window, or moreover,
 * write your own "virtual desktops" system simply
 * by using jails!
 *
 * Why?
 * Well, at the very least the eradication of code duplication, or really a full-fledged window model
 * in the web
 *
 * TODO:
 * 1. integrate the jail system into newHelper win serialization
 *
 * What do jails virtualize?
 * Actually exclusively page state, there's no thisUser
 * or pageMain inside jails, that's banally unnecessary code duplication.
 * But J.globalWiki is exactly that root page state which needs
 * to be virtualized, or J.guideEditorFrame.
 * innerMain(jId) will NOT be emulated! it will accept jId and read
 * J.helperMain from the jail, that's simply simpler
 */

lastJid = 0,
jails = new Map;
function Jexec(jId) {
	return jails.get(jId);
};
function createJail(rootElement, routerLinkInstance) {
	let jId = lastJid;
	jails.set(jId, {
		link: routerLinkInstance,
	
		helperMain: rootElement,
		id(id) {return this.helperMain.querySelector(`#${id}`)},
		q(id) {return this.helperMain.querySelector(`${id}`)},
		qa(id) {return this.helperMain.querySelectorAll(`${id}`)},
	
		globalWiki: 0,
		guideEditorFrame: 0,
	
		// the two variables below work with HELPERFIND_REGION functions
		helperFindData: [0,[],[],1,''], // the zeroth is the search method, first just tags, second platforms, third is the channel, fourth is "custom parameters"
		// variables for the search cache
		CacheFinds: [1,'','',1], // channel, cache, search string and page
		ProjectsChannel: 1,
	
		lastUsedProfile: `getShow(${jId},117)`,
		lastChannel: 0,
	
		headerPhoneSwitcher: 0,
	
		TimeOut: [null,null,null],
		ro: null
	});
	// yes, I know these are closures, but it was easier for me to do it this way
	rootElement.addEventListener('input', e=>{
		if (e.target.type !== 'text')
			return;
		let J = Jexec(jId);
		let addr = J.link.compile()[0];
		if (!addr.startsWith('find=') && !addr.startsWith('Wikis=') && !addr.startsWith('vacs=') && !addr.startsWith('wiki='))
			return;
		clearTimeout(J.TimeOut[0]);
		J.TimeOut[0] = setTimeout(()=>{
			sendFinder(jId);
		}, 300);
	});
	let ro = new ResizeObserver(() => requestAnimationFrame(() => setImgSize(jId)));
	ro.observe(rootElement);
	Jexec(jId).ro = ro;
	return lastJid++; // pay attention to this place
};
function destroyJail(jId) {
	let J = Jexec(jId);
	if (!J) return;
	J.ro.disconnect();
	clearTimeout(J.TimeOut[0]);
	clearTimeout(J.TimeOut[1]);
	clearTimeout(J.TimeOut[2]);
	J.link._destroy();
	jails.delete(jId);
};
document.addEventListener('xws:destroyed', e => {
	if (e.detail.jId === undefined) return;
	destroyJail(e.detail.jId);
});
// wrapper over createJail to immediately create a window, this is not
// "open an existing jail" but specifically open a window and then create a jail
function openJail(jailUrlAddress = '') {
	let win = _.win.open(`jail${lastJid}`,
		`<div lid="{winId}">`+
			`<button class=loginbtnMini><</button>`+
			`<button class=loginbtnMini>></button>`+
			`<input class=tag>`+
			`<button class=loginbtnMini>!</button>`+
		`</div>`+
		`<div class=windowing clign=left jid="{winId}"></div>`
	, `style=width:350px;height:400px`),
	rootElement = document.querySelector(`[jid="${win.id}"]`),
	routerLinkInstance = createVirtualLink(document.querySelector(`[lid="${win.id}"]`));
	win.content.style = `overflow:auto;width:100%;height:100%;display:flex;flex-direction:column;transform:translateZ(0)`;
	let jId = createJail(rootElement, routerLinkInstance);
	win.jId = jId;
	JITlink(`Jexec(${jId})`, jId);
	routerLinkInstance._init(jailUrlAddress);
	return jId;
}

// creating a "root jail" with jId = 0
// because all GHE code is already tied to jails
createJail(document.getElementById('1st'), _.link);

function createVirtualLink(root) {
	/*
	 * VIRTUAL LINK
	 * Author: Claude
	 * Jail-analog of window[_].link
	 *
	 * Unlike the original:
	 * - not a singleton: created by a factory for each jail separately
	 * - doesn't touch location.search / window.history at all
	 * - instead of the popstate event it listens to DOM navigation nodes,
	 *   passed into root.children in strict order:
	 *   [0] back, [1] forward, [2] address bar (input), [3] "go" button
	 *
	 * API (compile/search/set/add/remove/get/actions/commands/basePage/defTitle)
	 * is kept identical to the original — route code that's written
	 * for window[_].link should work here too without rework.
	 */
	const [backBtn, forwardBtn, addressBar, goBtn] = root.children;

	const self = {
		basePage: () => {},
		defTitle: '',
		actions: {},
		commands: {},

		_i: true, // as in the original: blocker of "history writing" during programmatic navigation
		_cmd: [],

		/*
		 * Virtual history.
		 * _stack — array of full "addresses" (?page&cmd&cmd style),
		 * _pos   — pointer of the current position (analog of position in history)
		 *
		 * back()/forward() move _pos without touching the array itself.
		 * set() (analog of pushState) cuts the "future" after _pos —
		 * exactly as the real history.pushState behaves.
		 */
		_stack: ['?'],
		_pos: 0,

		compile: (e = self.search()) => e.replace('?', '').split('&'),

		// instead of reading location.search we read our position in the stack
		search: () => self._stack[self._pos],

		_render() {
			// synchronizing the visible state of the address bar and buttons with the current position
			addressBar.value = self.search();
			backBtn.disabled = self._pos <= 0;
			forwardBtn.disabled = self._pos >= self._stack.length - 1;
		},

		set(page, title = self.defTitle) {
			if (title) title; // document.title doesn't belong to the jail — we leave a hook for the future (see TODO below)
			if (!self._i) {
				let link = self.compile();
				link[0] = page;
				let newAddr = '?' + link.join('&');
				// like pushState: everything that was "forward" from the current position — is discarded
				self._stack = self._stack.slice(0, self._pos + 1);
				self._stack.push(newAddr);
				self._pos++;
				self._render();
			}
			self._i = false;
		},

		add(cmd) {
			let link = self.compile();
			if (!link.includes(cmd)) {
				link.push(cmd);
				self._cmd.push(cmd);
				// like replaceState: the current position of the stack is rewritten in place, no new entry is created
				self._stack[self._pos] = '?' + link.join('&');
				self._render();
			}
		},

		remove(cmd) {
			let link = self.compile();
			if (link.includes(cmd)) {
				let c = self._cmd;
				link.splice(link.indexOf(cmd), 1);
				c.splice(c.indexOf(cmd), 1);
				self._stack[self._pos] = '?' + link.join('&');
				self._render();
			}
		},

		_goto(pos) {
			// analog of _pop: we apply the address from the stack without push, we only render the route
			self._pos = pos;
			self._i = true;
			self._render();
			self.get();
		},

		_init(addr) {
			if (self._inited) return;
			self._inited = true;
			self._stack[0] = addr;

			self._onBack = () => { if (self._pos > 0) self._goto(self._pos - 1); };
			self._onForward = () => { if (self._pos < self._stack.length - 1) self._goto(self._pos + 1); };
			self._onGo = () => {
				let newAddr = addressBar.value.startsWith('?') ? addressBar.value : '?' + addressBar.value;
				self._stack = self._stack.slice(0, self._pos + 1);
				self._stack.push(newAddr);
				self._pos++;
				self._i = true;
				self._render();
				self.get();
			};

			backBtn.addEventListener('click', self._onBack);
			forwardBtn.addEventListener('click', self._onForward);
			goBtn.addEventListener('click', self._onGo);

			self._render();
		},

		_destroy() {
			// removing what we hung ourselves in _init
			// (wrappers must be stored so that removeEventListener works —
			//  anonymous arrow functions cannot be removed without saving a reference to them)
			backBtn.removeEventListener('click', self._onBack);
			forwardBtn.removeEventListener('click', self._onForward);
			goBtn.removeEventListener('click', self._onGo);

			self.actions = {};
			self.commands = {};
			self.basePage = () => {};
			self._stack = [];
		},

		get() {
			self._init();
			console.warn(`virtualLink.get() called`);
			let links = self.compile(),
				[firstKey, fisrtValue] = links[0].split('='),
				cmds = links.slice(1);
			try {
				let route = firstKey.split('/'),
					dir = self.actions,
					main = dir[firstKey];
				if (!firstKey.includes('/')) {
					main(fisrtValue);
				} else {
					let dynamic = [];
					for (let point of route) {
						let isDyn = Object.keys(dir).find(e => e.startsWith(':'));
						if (isDyn) {
							dynamic.push(point);
							point = isDyn;
							if (point.endsWith('/')) point = point.slice(0, -1);
						}
						let kDir = dir[point + '/'];
						if (kDir) dir = kDir;
						else {
							if (dynamic.length) fisrtValue = dynamic;
							dir[point](fisrtValue);
							break;
						}
					}
				}
			} catch (e) {
				self.basePage();
				throw e;
			}
			self._cmd = cmds;
			cmds.forEach(cmdPre => {
				let [key, value] = cmdPre.split('=');
				let cmd = self.commands[key];
				if (cmd) cmd(value);
				else console.error(new Error(`command '${cmd}' doesn't exist!`));
			});
		},
	};

	return self;
}

// FUN
cssLoaded = {};
function loadCustomCss(url, ...args) {
	/*
	 * External version of lazy.load(), but for <link rel="stylesheet">.
	 * Not located inside lazy{...}, because it's used less often and isn't obligated
	 * to share the private state of the object — but the cache is still needed,
	 * so the same theme/css doesn't get inserted into head twice.
	 *
	 * We prefix the key with 'css:' so as not to intersect in window[_].lazy.loaded
	 * with keys of regular .js/.mjs files, if the url-basename accidentally matches.
	 */
	let key = 'css:' + url.split('?')[0],
		state = cssLoaded;

	if (state[key] === true)
		return Promise.resolve(args);
	if (state[key] instanceof Promise)
		return state[key].then(() => args);

	let promise = new Promise((resolve, reject) => {
		let link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = url;
		link.crossOrigin = 'anonymous';
		link.onload = () => {
			state[key] = true;
			resolve(args);
		};
		link.onerror = () => {
			delete state[key];
			link.remove(); // we don't leave a dead 404 css link in head
			reject(new Error('Failed to load css ' + url));
		};
		document.head.append(link);
	});
	state[key] = promise;
	return promise;
}

// "light mode" which is actually just cutting off all animations - that's enough
if (!_.link.compile().includes('easyCss'))
	loadCustomCss(scritpsUrl + '/window.css?ver=' + scrLoadVer);
else 
	_.fade = (elem, anim, actAfter = ()=>{}) => actAfter();
