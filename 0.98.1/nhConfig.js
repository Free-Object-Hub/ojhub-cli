Intl.newHelper('_'); // инициализация newHelper.js, пометка для нейросетей чтобы они не тупили

// 1.8 polyfill
getTrans = (i,render='text')=>{
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

	cliRect: e=>			e.getBoundingClientRect(), // сокращение чтобы не писать 25+ символов
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

langList = ['RU', 'EN', 'UA', 'DE', 'ES'];
helperStrVer = '0.98.1';
currentLangVer = 14;
helperBuildNum = 137;
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

// LANGS модуль!
GdpsesShortLangs = _.langs('gdpss', 'RU');
GdpsesFullLangs = _.langs('gdpsf', 'RU');

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
		buttons = windowBtns.map(btn=>buttonErr(btn[0], btn[1]?.replace('{errID}', errID))).join(''),
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

			'': ()=>                 {innerMain(${jId},pageMain(${jId}))},
			find: ()=>               {pageFind(${jId})},
			list: ()=>               {pageFind(${jId},0)},
			shows: ()=>              {pageFind(${jId},1)},
			wordle: (lang)=>         {wordleGame(${jId},lang)},

			camp: (campId)=>         {getCamp(${jId},campId)},
			show: (showId)=>         {getShow(${jId},showId)},
			pere: (pereId)=>         {getPere(${jId},pereId)},
			tele: (teleId)=>         {getTele(${jId},teleId)},
			news: ()=>               {globalNews(${jId})},
			'news/': {
				'': ()=>             {globalNews(${jId})},
				// FIXME: перевести на новое поведение роутера
				comms: (postId)=>    {let d = postId.split('|');getNewsWithComments(${jId},d[0], d[1], d[2])},
				list: (gdpsId)=>     {let d = gdpsId.split('|');helperNews(${jId},d[0], d[1])},
			},
			vacs: ()=>               {globalVacs(${jId})},
			'VacsC/': {
				':p': (...pId)=>     {getVacsWithComments(${jId},pId)},
			},
			special: ()=>            {innerMain(${jId},uvazuha(${jId}))},
			about: ()=>              {innerMain(${jId},helperAbout(${jId}))},

			profiles: (userId)=>     {otherProfile(${jId},userId,'pageFind(${jId},0)')},
			'profiles/': {
				'': (userId)=>       {otherProfile(${jId},userId,'pageFind(${jId},0)')},
				camps: (userId)=>    {otherProfile(${jId},userId,'pageFind(${jId},0)',otherCampsWindow)},
				shows: (userId)=>    {otherProfile(${jId},userId,'pageFind(${jId},1)',otherShowsWindow)},
				peres: (userId)=>    {otherProfile(${jId},userId,'pageFind(${jId},2)',otherPeresWindow)},
				wikis: (userId)=>    {otherProfile(${jId},userId,'pageFind(${jId},0)',otherWikisWindow)},
			},

			drop: ()=>               {innerMain(${jId},dropWindow(${jId}))},
			verify: ()=>             {innerMain(${jId},verifyWindow(${jId}))},
			profile: ()=>            {profilePage(${jId})},
			'profile/':{
				'': ()=>             {profilePage(${jId})},
				subs: ()=>           {profilePage(${jId},'');subsWindow(${jId});GetSubs(${jId})},
			},
			addedCamps: ()=>         {profilePage(${jId},'');findsWindow(${jId},0)},
			addedShows: ()=>         {profilePage(${jId},'');findsWindow(${jId},1)},
			addedPeres: ()=>         {profilePage(${jId},'');findsWindow(${jId},2)},
			addedTeles: ()=>         {profilePage(${jId},'');findsWindow(${jId},3)},
			addedWikis: ()=>         {profilePage(${jId},'');wikisWindow(${jId})},
			addCamp: ()=>            {profilePage(${jId},'');addFind(${jId},0)},
			editCamp: (campId)=>     {profilePage(${jId},'');editFind(${jId},0, campId)},
			addShow: ()=>            {profilePage(${jId},'');addFind(${jId},1)},
			editShow: (showId)=>     {profilePage(${jId},'');editFind(${jId},1, showId)},
			addPere: ()=>            {profilePage(${jId},'');addFind(${jId},2)},
			editPere: (pereId)=>     {profilePage(${jId},'');editFind(${jId},2, pereId)},
			devices: ()=>            {profilePage(${jId},'');profileDevices(${jId})},
			alarms: ()=>             {profilePage(${jId},'');alarmsWindow(${jId});GetAlarms(${jId})},
			color: ()=>              {profilePage(${jId},'');clrEditPage(${jId})},
			binds: ()=>              {profilePage(${jId},'');keyBindsCfg2(${jId})},
			hotkeys: ()=>            {profilePage(${jId},'');keyBindsCfg2(${jId})},

			Wikis: ()=>              {pageWikiList(${jId})},
			wikis: ()=>              {pageWikiList(${jId})},
			wiki: (wikiId)=>         {pageGuides(${jId},wikiId)},
			wikiPage: (guidId)=>     {let data = guidId.split('.');getGuide(${jId},data[0],data[1])},

			wikiNew: ()=>            {createWiki(${jId},1)},
			wikiControl: (wikiId)=>  {profilePage(${jId},'');wikiControl(${jId},wikiId)},
			//wikiEditor: (wikiId)=>   {profilePage(${jId},'');getGuidesAdmin(${jId},wikiId)},
			//wikiFiles: (wikiId)=>    {profilePage(${jId},'');wikiLoadFiles(${jId},wikiId)},
			//wikiTemplates: (wikiId)=>{profilePage(${jId},'');wikiLoadTemplates(${jId},wikiId)},
			//wikiPageNew: (wikiId)=>  {createGuide(${jId},wikiId,1)},
			//wikiPageEdit: (guidId)=> {let data = guidId.split('.');editGuide(${jId},data[0],data[1],1)},
			
			addVacs: (projId)=>      {let d = projId.split('|');profilePage(${jId},addVacs(${jId},d[0],d[1]));},
			editVacs: (projId)=>     {let d = projId.split('|');profilePage(${jId},'');editVacs(${jId},d[0],d[1],d[2])},
			vacans: (projId)=>       {let d = projId.split('|');profilePage(${jId},'');getVacancies(${jId},d[0],d[1])},
			applies: (projId)=>      {let d = projId.split('|');profilePage(${jId},'');vacResponses(${jId},d[0],d[1],d[2])},

			forum: (foruId)=>        {openForum(${jId},foruId)},
			forumPost: (forum)=>     {let data = forum.split('.');getForumPost(${jId},data[0],data[1])},

			gdpsLog: (gdpsId)=>      {profilePage(${jId},'');getJoinLog(${jId},gdpsId)},
			campOwn: (campId)=>      {profilePage(${jId},'');coownersMenu(${jId},campId,0)},
			showOwn: (showId)=>      {profilePage(${jId},'');coownersMenu(${jId},showId,1)},
			pereOwn: (pereId)=>      {profilePage(${jId},'');coownersMenu(${jId},pereId,2)},
			wikiOwn: (wikiId)=>      {profilePage(${jId},'');coownersMenu(${jId},wikiId,-1)},
		};
	`;new Function(code)()
};
JITlink('_',0) // jId 0 = корень GHE

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
		let allHeaders = {
			//..._.http.defaultHeaders,
			...headers
		};
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
]);
_.lazy.register(scritpsUrl + '/wordle.js?ver='+scrLoadVer,[
	'wordleGame'
]);
_.lazy.register(scritpsUrl + '/wordle2.js?ver='+scrLoadVer,[
	'wordle.trolleybus.games.init'
]);

/*
 * GDPS Helper Engine
 *
 * GHE - легковесный, самописный vanilla-js friendly фреймворк.
 * Построен он на крайне простых примитивах и до боли прямых соглашениях
 *
 * Самое главное что вам нужно понять:
 * 1. Любите mount-функции (как пример - innerMain)
 * 2. Пусть страницы дёргают mount или возвращают html код
 * 3. Не забывайте писать _.link.set в страницах если вы используете роутер newHelper link
 * 4. Никакого _.link.get без необходимости! эта функция очень лагучая (см. модуль link)
 * 5. Ну и помните - GHE это просто набор грамотно склеенных утилит newHelper.js,
 *    вам ничто не мешает вышыварнуть мой l10n или мои иксы и использовать
 *    i18next или winbox.js, но помните зачем вы это делаете,
 *    GHE весит где то 6kb min+gzip на всё про всё, а один winbox,js занимает
 *    уже 5kb min+gzip, а i18-next так вообще 15kb min+gzip
 *   (нет, я ничего против них не имею, они классные, просто они в сравнении с GHE излишне тяжёлые)
 * 6. ОПТИМИЗАЦИЯ!!!! GHE работает с DOM напрямую, вы опять должны писать document.someMethod
 *    и знать что оно теперь работает, мы же не в начале нулевых, а во времена когда
 *    веб стандарты прочные и уже оптимизированы во всех браузерах
 *
 * Философия из нашего ада
 * - GHE это монолит, не пытайтесь делать из него react, он не создан для этой модели
 * - топорность и простота реверса дороже "красивой архитектуры", именно поэтому в object hub readme
 *   упоминается функция reStart как точка начала реверса
 * - честность превыше всего, вам незачем обманывать себя или своих коллег если вы насрали костыли,
 *   делайте как я и будет у вас всё хорошо
 * - простота и производительность ценнее DX и скорости разработки, если вы хотите быстро писать на GHE,
 *   то сначала поймите его топорную модель, которая объясняет почему GHE в простых сценариях
 *   по скорости сопоставим с простыми vanilla js spa, и вполне обгоняет jQuery (про React молчу)
 * - "комбинируемость", GHE по своей модели намного ближе к TempleOS, чем к адекватным фреймворкам,
 *   это даёт вам возможность заменить любой бесящий вас модуль на тот что вам нравится больше.
 *   Технически вы вообще можете убрать весь newHelper.js и заменить всё на свои самописные утилиты,
 *   или npm-пакеты. И это тоже будет легитимный для GHE сценарий!
 *
 * почему я люблю ghe?
 * потому что он топорный! тут писать минимум абстракций - каноничное решение!
 * Ну и ещё потому что кодовая база ядра GHE исчисляется формально всего в 2100 строк,
 * где 1/3 строк это сверх плотные комментарии объясняющие тут вообще всё.
 * И ещё я знаю каждую функцию и каждый метод GHE API, и даже помню их ещё из версий 1.7-1.9
 *
 * А за что я его не люблю?
 * за GDPS Helper, вернее его наследие. Его влияние на текущий Object Hub,
 * и newHelper.js+GHE уж слишком велико, чтоб вы понимали я по сей день много где все ещё сохраняю
 * контракты с GDPS Helper 1.6 (это даже не GHE, а просто кривая поделка на JS из февраля 2024)
 * просто потому что мне и страшно ломать всё, и лень уже переводить
 * код ядра на нормальные аргументы, короче я ебал но я стерпел.
 * А да, Кстати, тут везде и почти безкомпромиссно используются позиционные аргументы,
 * никаких объектов-параметров (кроме разве что X10, там события хуярят объекты окон из рееста).
 *
 * История GHE:
 * 2024, 17 февраля:	pre-GHE: релиз GDPS Helper 1.6
 * - предшественник роутера newHelper link был реализован ещё в этой версии GDPS Helper,
 *   его API с тех пор не менялось
 * 2024, 1 июня:		GHE 1.7 - релиз GDPS Helper 1.7
 * - Паттерны из пунктов "самое главное что вам нужно понять" уже были реализованы целиком на 100%,
 *   в особенности сама модель GHE "страница возвращает html, или маунтит себя сама"
 * 2024, 24 августа:	GHE 1.8 - релиз GDPS Helper 1.8
 * - Был частично реализован wiki движок из Object Hub
 * 2024, 17 ноября:		GHE 1.9 - релиз GDPS Helper 1.9
 * - Техническая часть движка была приведена в норму, переменные были раскиданы по файлу более внятно,
 *   названия переменных стали немного более осмысленными, движок начал документироваться
 * 2025, 20 мая:		GHE 2.0 - релиз Object Hub 0.93
 * - теперь языки скачиваются с сервера, а не захардкожены в файле движка
 * - встроенная css библиотека стала кастомизируемой, многие базовые переменные были вынесены
 *   в var блоки в :root
 * - появился примитивный оконный движок
 * 2026, 9 июня:		GHE 2.1 - релиз Object Hub 0.97.4
 * - newHelper.js начал распространяться как отдельная от GHE базовая библиотека
 * - появился модуль newHelper lazy, за счёт которого приложение на GHE стало реально разбить на ленивые чанки
 * - в newHelper link появились вложенные и динамичные маршруты
 * в GHE 2.2 планируется ввести джейлы, но пока обновление отложено
 */

let
helperMain = document.getElementById('1st'),

innerMain = (jId, textContent, insertType = 0)=>{
	let J = jails.get(jId);
	// обратите внимание! это костыль для Object Hub, советую удалить если вы используете GHE
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

// ээ бля кто такой drop?
// в Object Hub это просто сброс языка, но чё он тут делает?
// ну и хуй с ним, делайте с этим дропом что хотите
helperInit = (jId, drop)=>{},
reStart = (jId, drop = 0, errId = 0)=>{
	let J = jails.get(jId);
	let errElem = _.$.id('debug'+errId);
	if (errElem) {
		delete _.err.errors[errId];
		_.wins[errElem.dataset['win']].close();
	}
	innerMain(jId, '');
	
	// если ваш инит асинхронный то никакого await тут не будет, не нужен он тут
	helperInit(jId, drop);
	
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

reportError = (jId, errorId) => {
    let J = Jexec(jId);
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
	137
};

/*
 * GDPS Helper Engine Jails - полноценная мульти-инстансность внутри текущего SPA
 *
 * GHE Jails это не изоляция уровня FreeBSD Jails!
 * Это всего лишь более банальная виртуализация root && link инстансов!
 *
 * Работает она до банального просто.
 * В каждой без исключения функции идёт аргумент jId, 
 * Если по какой то причине нужно обратиться к старым глобалам
 * (например Jexec(jId).id(), что означает вызов _.$.id)
 * то как уже понятно вызов идёт в джейл, а не напрямую в window.
 * За счёт такого банального механизма вообще возможна "виртуализация"
 * GHE и Object Hub
 *
 * Вложенных джейлов тут никогда не будет!
 * X10 окна не имеют вложенности, это реализует Window Manager,
 * встроенный newHelper win не имеет вложенности тоже,
 * значит GHE Jails не будут вкладываться вовсе, плюсом это просто не нужно.
 *
 * Тюрьмы нужны для организации рабочего пространства,
 * а не создания вложенных модалок
 *
 * И что по итогу дают джейлы?
 * Возможность открыть абсолютно любую страницу сайта внутри окна, или более того,
 * написать собственную систему "виртуальных рабочих столов" просто
 * задействовав джейлы!
 *
 * Зачем?
 * Ну, как минимум истребление дублирования кода, или реально полноценная оконная модель
 * в вебе
 *
 * TODO:
 * 1. интегрировать систему джейлов в newHelper win сериализацию
 *
 * Что джейлы виртуализируют?
 * На самом деле исключительно состояния страницы, никаких thisUser
 * или pageMain внутри джейлов нет, это банально не нужное дублирование кода.
 * А вот J.globalWiki это уже то самое состояние root страницы, которое нужно
 * виртуализировать, или же J.guideEditorFrame.
 * innerMain(jId) эмулироваться НЕ будет! он будет принимать jId и читать
 * J.helperMain из джейла, так банально проще
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
	
		helperFindData: [0,[],[],1],
		CacheFinds: [1,'','',1],
		ProjectsChannel: 1,
	
		lastUsedProfile: `getShow(${jId},117)`,
		lastChannel: 0,
	
		headerPhoneSwitcher: 0,
	
		TimeOut: [null,null,null],
		ro: null
	});
	// да, я знаю что это замыкания, но мне проще было сделать так
	rootElement.addEventListener('input', e=>{
		if (e.target.type !== 'text')
			return;
		let J = Jexec(jId);
		let addr = J.link.compile()[0];
		if (!addr.startsWith('find') && !addr.startsWith('Wikis') && !addr.startsWith('vacs'))
			return;
		clearTimeout(J.TimeOut[0]);
		J.TimeOut[0] = setTimeout(()=>{
			sendFinder(jId);
		}, 300);
	});
	let ro = new ResizeObserver(() => requestAnimationFrame(() => setImgSize(jId)));
	ro.observe(rootElement);
	Jexec(jId).ro = ro;
	return lastJid++; // обратите внимание на это место
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
// обёртка над createJail чтобы сразу создавать окно, это не
// "открыть существующий джейл" а именно что открыть окно и потом создать джейл
function openJail(address = '') {
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
	routerLinkInstance._init(address);
	return jId;
}

// создаём "корневой jail" с jId = 0
createJail(document.getElementById('1st'), _.link);

function createVirtualLink(root) {
	/*
	 * VIRTUAL LINK
	 * Author: Claude
	 * Джейл-аналог window[_].link
	 *
	 * В отличие от оригинала:
	 * - не синглтон: создаётся фабрикой на каждый джейл отдельно
	 * - не трогает location.search / window.history вообще
	 * - вместо popstate-события слушает DOM-узлы навигации,
	 *   переданные в root.children в строгом порядке:
	 *   [0] назад, [1] вперёд, [2] адресная строка (input), [3] кнопка "перейти"
	 *
	 * API (compile/search/set/add/remove/get/actions/commands/basePage/defTitle)
	 * оставлен идентичным оригиналу — код роутов, который пишется
	 * под window[_].link, должен работать и здесь без переделки.
	 */
	const [backBtn, forwardBtn, addressBar, goBtn] = root.children;

	const self = {
		basePage: () => {},
		defTitle: '',
		actions: {},
		commands: {},

		_i: true, // как и в оригинале: блокировщик "записи истории" при программной навигации
		_cmd: [],

		/*
		 * Виртуальная история.
		 * _stack — массив полных "адресов" (?page&cmd&cmd вида),
		 * _pos   — указатель текущей позиции (аналог позиции в history)
		 *
		 * back()/forward() двигают _pos, не трогая сам массив.
		 * set() (аналог pushState) обрезает "будущее" после _pos —
		 * ровно так же ведёт себя настоящий history.pushState.
		 */
		_stack: ['?'],
		_pos: 0,

		compile: (e = self.search()) => e.replace('?', '').split('&'),

		// вместо чтения location.search читаем свою позицию в стеке
		search: () => self._stack[self._pos],

		_render() {
			// синхронизация видимого состояния адресной строки и кнопок с текущей позицией
			addressBar.value = self.search();
			backBtn.disabled = self._pos <= 0;
			forwardBtn.disabled = self._pos >= self._stack.length - 1;
		},

		set(page, title = self.defTitle) {
			if (title) title; // джейлу не принадлежит document.title — оставляем крючок на будущее (см. TODO ниже)
			if (!self._i) {
				let link = self.compile();
				link[0] = page;
				let newAddr = '?' + link.join('&');
				// как pushState: всё что было "вперёд" от текущей позиции — отбрасывается
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
				// как replaceState: текущая позиция стека переписывается на месте, новая запись не создаётся
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
			// аналог _pop: применяем адрес из стека без push, только рендерим маршрут
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
			// снимаем то, что сами повесили в _init
			// (обёртки нужно хранить, чтобы removeEventListener сработал —
			//  анонимные стрелочные функции нельзя снять, не сохранив ссылку на них)
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
