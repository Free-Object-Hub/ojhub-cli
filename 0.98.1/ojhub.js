// ГАЙД ПО МИНИФИКАЦИИ - J.id() это обычный док гет элембуид. innerMain(jId) это заменить весь контект внутри div id=1st

/* порядок запуска хелпера (жс):
 * вызывается функция `reStart(${jId})`, которая вызывает '_.http.req()' но это мелочи, она назначает глобальные переменные GDPSes и Guides
 * если есть вход в аккаунт назначаются ещё и thisUser, myGdpses и myguides
 * после вызывается функция 'J.link.get()', которая берёт в урл всё после '?' и прогоняя через себя вызывает нужные функции (например '?guides' закинет в гайды, или '?gdps=45' откроет гдпс с айди 45)
 * после выполнения 'J.link.get()' хелпер готов к работе с клиентом
 * !!!: гайд писался к гдпс хелпер 1.8, формально обджект хаб это уже гдпс хелпер 2.1, так что он кардинально устарел
*/

/* Поясняю за некоторую легаси парашу - типы комментов и лайков
 * На сервере ошхаба комментарии и лайки определяются и хранятся в каналах в одной таблице, ниже приведен список какой у кого канал
 * тип контента               | лайки | комментарии | каналы | Ко-овнеры
 * Кемпы                      | 0     | 0           | 0      | 1
 * Обджект шоу                | 0     | 0           | 1      | 1
 * переводы                   | 0     | 0           | 2      | 1
 * Вики                       | 8     | -           | -1     | отдельная от soowners таблица wikisoowners
 * Страницы вики              | 7     | 2           | -2     | -
 * Форум посты                | 9     | 4           | -3     | -
 * вакансии                   | 11    | 5           | -5     | -
 * Новости                    | 2     | 3           | -      | -
 * комментарии к кемпам       | 1     | -           | -      | -
 * комментарии к шоу          | 1     | -           | -      | -
 * комментарии к новостям     | 5     | -           | -      | -
 * комментарии к страницам    | 6     | -           | -      | -
 * комментарии к форум постам | 10    | -           | -      | -
 * комментарии к вакансиям    | 12    | -           | -      | -
 * Ваш контент                | 13++  | 6++         | -      | 2++
*/

// #region базовые компоненты ошхаба, связанные с невхелпером
let 
captchaLoad = false,

helperVapidPublic = 'BEcP_7U_yMSR7K0oqBHQAHDK5jl9d7zKsxtXn_n7gIUr547kWWtUg_wfBDBtUpGiOs2Lg5iq0Y-G7JUBprJzyYU',
helperCaptchaSiteKey = '6Ldrt0grAAAAAMdteG7pq6LZ1UYeMvkElvUV7Qhx',
globalWiki = 0,
wikiTemplates = {},
guideEditorFrame = 0, // используется только в редакторе гайдов чтобы можно было удалять разделы не по порядку
TimeOut = [null,null], // [0] для инпута, [1] для анимаций окон (регистрация и логин)
headerPhoneSwitcher = 0, // 0 - не нажимался, 1 - в профиле, 2 - в навигаторе
ProjectsChannel = 1;

urlEncoded = {'Content-type':'application/x-www-form-urlencoded'},
GDPSswitchChannel = (channel)=>{
	switch (parseInt(channel)) {
		case 0:
			return ['camp', 'Camp', 'c', myGdpses[0]];
		case 1:
			return ['show', 'Show', 's', myGdpses[1]];
		case 2:
			return ['pere', 'Pere', 'p', myGdpses[2]];
		case 3:
			return ['tele', 'Tele', 't', myGdpses[3]];
		default:
			return ['camp', 'Camp', 'c', myGdpses[0]];
	}
},
GDPSgetChannel = (channel)=>{
	switch (channel) {
		case 'c':
			return myGdpses[0];
		case 's':
			return myGdpses[1];
		case 'p':
			return myGdpses[2];
		case 't':
			return myGdpses[3];
		default:
			return myGdpses[0];
	}
},
helperSettings = {
	openGuidesInWindow: parseInt(Slocal.get('openGuidesInWindow')),
},
token = Slocal.get('User'); // токен юзера
if (token) 
	_.http.defaultHeaders['user-token'] = token;

helperInitData = (jId, data)=>{
	let J = Jexec(jId);
	let initData = JSON.parse(data);
	if (Slocal.get('User')) {
		myGdpses = [{},{},{},{}];
		Object.keys(initData[1][0]).forEach(gdps=>{
			GDPSgetChannel(gdps[0])[gdps.slice(1)] = initData[1][0][gdps];
		});
		myguides = [];
		myguides.push(initData[1][1]);
		yourWikies = initData[1][1];
		wikiesMini = [];
		Object.keys(yourWikies).forEach(el=>{
			wikiesMini.push(yourWikies[el].ID.toString());
		});
	}
	if (initData[0].token == 'false')
		return innerMain(jId, deviceAddForm(jId));
	thisUser = initData[0];
	Slocal.set('StaticUserData', JSON.stringify(thisUser));
	helperIcon.href = 'https://objecthub.xyz/favicon.ico';
	let locationMain = J.link.compile()[0],
		lastGdpses = initData[2],
		lastNews = initData[3],
		htmlGdpses = '',
		htmlNews = '';
	if (Object.keys(lastNews).length > 0)
		for (let g in lastGdpses) {
			let gdps = lastGdpses[g];
			htmlGdpses += FINDrenderMini(jId, gdps.channel, [gdps]);
		}
	htmlGdpses += `<div class=framegdps style=display:block;width:300px;height:450px;align-content:center;text-align:center>`+
		`<h1${getTrans('T2-wantmore')}/h1>`+
		basicButton(getTrans('projects'), `pageFind(${jId},Jexec(${jId}).helperFindData[3])`)+
	`</div>`;
	mainPageCache.gdpses = htmlGdpses;
	if (Object.keys(lastNews).length > 0)
		for (let n in lastNews) {
			let news = lastNews[n];
			htmlNews += RenderNews(jId, [news],3);
		}
	htmlNews += `<div class=framegdps style=display:block;width:300px;height:350px;align-content:center;text-align:center>`+
		`<h1${getTrans('T2-wantmore')}/h1>`+
		basicButton(getTrans('news'), `globalNews(${jId})`)+
	`</div>`;
	mainPageCache.news = htmlNews;
	if (locationMain == '' || locationMain == '?') {
		innerGdpsPlace(jId, htmlGdpses);
		innerComments(jId, htmlNews);
	}
	return initData;
};
helperInit = (jId, drop)=>{
	let J = Jexec(jId);
	Fingerprint.generate(token) // если токен есть значит есть и юзер => генерируем девайс токен
		.then(fpData=>{
			LIKES.init();
			J.link.get();
			_.http.req('GET', `${sData[2]}loginT${php}`)
				.then(data=>{
					helperInitData(jId, data);
					//let serverResp = JSON.parse(data);
				})
				.catch(e=>{console.error(e);_.err.handleRejection(e)});
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	if (drop !== 0) {
		J.link._i = true;
		_.lang.replace('RU').then(e=>_.lang.main = doLangSetup(e));
		pushNewLang('RU');
	}
};

mainPageCache = {
	gdpses: '',
	news: ''
},



baseApp = location.origin + location.pathname,
baseWay = baseApp+'server/'+urlBuildNum,

sData = [
	baseWay+'/content/',
	baseWay+'/send/',
	baseWay+'/',
	baseWay+'/search/',
	baseWay+'/delete/',
	baseWay+'/user/',
	baseWay+'/forum/',
	baseWay+'/wiki/',
	baseWay+'/vacans/',
	baseWay+'/comms/',
	baseWay+'/gdps/',
	baseWay+'/news/',
	baseWay+'/profile/',
 ],

 formSdata = (API, type = '.php')=>{
	sData = [
		API+'/content/',
		API+'/send/',
		API+'/',
		API+'/search/',
		API+'/delete/',
		API+'/user/',
		API+'/forum/',
		API+'/wiki/',
		API+'/vacans/',
		API+'/comms/',
		API+'/gdps/',
		API+'/news/',
		API+'/profile/',
	]
	php = type;
},
php = '.php';
errInfo = 
	`LOCATION: ${location}\n`+
	`USERID: ${thisUser.ID}\n`;
let

// Главные html теги
	helperIcon = link = _.$.q("link[rel~='icon']"),
	helperTitle = _.$.q('title'),
// #endregion
// #region компоненты
// #region микрокомпоненты
	emptyButton = (text = '', func = '', style = '', id = '', Class = '')=>{
		return `<button ${id ? 'id="'+id+'"' : ''}class="emptybtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
	},
	imageButton = (img = '', func = '', style = '', id = '', Class = '')=>{
		return `<button ${id ? 'id="'+id+'"' : ''}class="loginbtnMini ${Class}" style="${style}" onclick="${func}"><img style=margin:0 width="24px" src="${img}"></button>`;
	},
	basicInput = (text = '', idAndName = '', style = '', Class = '', value = '')=>{
		let fullText = text == '' ? '>' : getTrans(text, 'input');
		return `<input ${idAndName ? `id="${idAndName}" name="${idAndName}"` : ''}class="framelabel ${Class}" ${value ? 'value="'+value+'"' : ''}style="${style}"${fullText}`;
	},
	radioInput = (id = '', name = '', isChecked = 0, otnerArgs)=>{
		return `<input id="${id}" name="${name}" type=radio ${otnerArgs} ${isChecked ? 'checked' : ''}>`;
	},
// #endregion

headerButton = (text, Class, oncl)=>{
	return `<button class="${Class}" onclick="${oncl}"${text}/button>`;
},
headerButtons = (jId, switcherM = 0) => {
    let J = Jexec(jId);
    if (switcherM === 1) // if phone screen
		return headerButton(getTrans('main'),	'headbtn',`switchMobileMain(${jId});innerMain(${jId},pageMain(${jId}))`)+
		headerButton(getTrans('projects'),		'headbtn',`switchMobileMain(${jId});pageFind(${jId},Jexec(${jId}).helperFindData[3])`)+
		headerButton(getTrans('news'),			'headbtn',`switchMobileMain(${jId});globalNews(${jId})`)+
		headerButton(getTrans('vacancies'),		'headbtn',`switchMobileMain(${jId});globalVacs(${jId})`)+
		headerButton(getTrans('guides09'),		'headbtn',`switchMobileMain(${jId});pageWikiList(${jId})`)+
		headerButton(getTrans('aboutHelper'),	'headbtn',`switchMobileMain(${jId});innerMain(${jId},helperAbout(${jId}))`);

    return headerButton(getTrans('main'),	'headbtn',`innerMain(${jId},pageMain(${jId}))`)+
	headerButton(getTrans('projects'),		'headbtn',`pageFind(${jId},Jexec(${jId}).helperFindData[3])`)+
	headerButton(getTrans('news'),			'headbtn',`globalNews(${jId})`)+
	headerButton(getTrans('vacancies'),		'headbtn',`globalVacs(${jId})`)+
	headerButton(getTrans('guides09'),		'headbtn',`pageWikiList(${jId})`)+
	headerButton(getTrans('aboutHelper'),	'headbtn',`innerMain(${jId},helperAbout(${jId}))`);
},
headerImg = (link)=>{
	return `><img src=${helperUrl}imgs/${link}><`;
},
profileContentDiv = jId => {
    let J = Jexec(jId);
    return `<div style='display: flex; flex-direction: column; height:calc(100vh - 450px); overflow:auto' align=left>`;
},

bottomNavButton = (jId, text, Class, oncl, icon = '', matchPath = '')=>{
	let J = Jexec(jId);
	// делаем сплит чтобы вложенные маршруты не ломали красоту картинки
	if (J.link.compile()[0].split('/')[0] === matchPath)
		Class += ' active'
	return `<button class="${Class}" onclick="${oncl}">${icon}<span class="navlabel"${getTrans(text)}/span></button>`;
},
navIcon = (text)=>{
	regedit = {
		'projects': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>`,
		'guides09': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>`,
		'news': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" /></svg>`,
		'vacs': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>`,
		'profile': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`
	};
	return regedit[text] || '';
},
bottomNav = jId => {
    let J = Jexec(jId);
    return `<nav class="bottomnav">`+
	bottomNavButton(jId, 'projects',	'navbtn',`pageFind(${jId},Jexec(${jId}).helperFindData[3])`, navIcon('projects'), 'find')+
	bottomNavButton(jId, 'guides09',	'navbtn',`pageWikiList(${jId})`, navIcon('guides09'), 'Wikis')+
	bottomNavButton(jId, 'news',		'navbtn',`globalNews(${jId})`, navIcon('news'), 'news')+
	bottomNavButton(jId, 'vacancies',	'navbtn',`globalVacs(${jId})`, navIcon('vacs'), 'vacs')+
	(thisUser.ID === 0 ?
		bottomNavButton(jId, 'register',	'navbtn',`registerPage()`, navIcon('profile'), 'register') :
		bottomNavButton(jId, 'profile',		'navbtn',`profilePage(${jId})`, navIcon('profile'), 'profile')
	)+
	`</nav>`;
},

basicButton = (text = '', func = '', style = '', id = '', Class = '')=>`<button ${id ? 'id="'+id+'"' :''}class="loginbtn ${Class}" style="${style}" onclick="${func}"${text}/button>`,
windowButton = (text, func = '', style = '')=>`<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`,
gdpsAvatar = (img, w=128, h=128, rszConf=2)=>`<img loading=lazy onerror="console.warn('broken link ${img}');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(img)}" width=${w}px height=${h}px style="border-radius:calc(var(--def-border)*${rszConf})">`,
// gdpsBan = (ban, w=360, h=150)=>

renderTextOrTags = ()=>{
	let [inputs,value] = Slocal.get('ColorScheme').split('/')[1].split(',')[0].split(':'),
	checked = 0,
	doneInputs = '';
	inputs.split(';').forEach(inp=>{
		let isChecked = checked == value ? 1 : 0;
		doneInputs += radioInput(inp, inputs, isChecked, `value=${inputs}:${checked} onchange="renderSwitch(this.value,1)"`);
		checked++;
	});
	return doneInputs;
},
trtd = (name, value)=>{
	return	`<tr>`+
						`<td`+
							name+
						`/td>`+
						`<td>`+
							value+
						`</td>`+
					`</tr>`;
},

likeStyle = {
	like: 'filter:drop-shadow(0 0 4px #DFD3EB)',
	disl: 'filter:drop-shadow(0 0 4px #B12FE4)'
},
contentRender = function(
    jId,
    preHtml = {
		ID: 0,
		title: '???',
		text: '???',
		likes: 0,
		GDPSdata: ['camp','getCamp']
	},
    date = 0,
    authorBtn = 1,
    likeType = 0,
    tags = '',
    specialButtons = 1,
    connectedWiki = 1,
    reportButton = '',
    // работает как кнопка назад в рендере новостей
    joinData = '',
    isComm = 1
) {
    let J = Jexec(jId);
    // LANGS модуль
    if (likeType === 0) {
		preHtml.text = GdpsesFullLangs.text(""+preHtml.ID)
	} else {
		preHtml.text = `>${preHtml.text}<`
	}

    let joinBtn = 
		`<a class=loginbtn href="join${php}?id=${preHtml.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`;
    if (preHtml.links)
		if (typeof preHtml.links == 'object') {
			joinBtn = '';
			Object.keys(preHtml.links).forEach(l=>{
				joinBtn += `<a class=loginbtn target=_blank href="join${php}?id=${preHtml.ID}&type=${l}${joinData}">${l}</a>`;
			});
		}
    let html = `<div class=framegdps ${joinData ? `id=news${preHtml.ID}` : ''} ${isComm == 0 ? 'style="width:calc(100% - 40px)"' : ''}>`+
		(preHtml.img || tags ?
		gdpsAvatar(preHtml.img) : '')+
		`<h2 id=${preHtml.cType}title${preHtml.ID}>${preHtml.title}</h2>`+
		(likeType === 0 ?
			(SUBS.has(preHtml.ID) === false ?
				basicButton(getTrans('gdpsSub'), `subRespond(${jId},${preHtml.ID})`, '', `sub${preHtml.ID}`) :
				basicButton(getTrans('gdpsUnsub'), `subUnrespond(${jId},${preHtml.ID})`, '', `sub${preHtml.ID}`)
			)
			 ///////////////////////////////////////////////////////////////////////////////////// КНОПКА ПОДПИСКИ
		: '')+
		`<p style="margin:0">`+
		(authorBtn ?
			basicButton(`>${preHtml.gdpsTitle}<`, `${joinData}(${preHtml.gdpsId})`)+
			'- '+emptyButton(`>${preHtml.username}<`, `otherProfile(${jId},${preHtml.author},'${joinData}(${preHtml.gdpsId})')`)
		:
			`<span${getTrans('addedBy')}/span>:`+
			`<button onclick="otherProfile(${jId},${preHtml.author},'pageFind(${jId},0)')" style="background:0;border:0;color:var(--color-white)">${preHtml.username}</button>`
		)+
		`</p>`+
		(date ?
		`<p>${timeAgo(date)}</p>`
		: '')+
		(tags ?
		`<div class="flex-row">${tags}</div>`
		: '')+
		`<div id=${preHtml.cType}text${preHtml.ID}${preHtml.text}/div>`+
		`<div style="margin-top:15px">`+
			(specialButtons ?
			joinBtn+
			`<button class="loginbtn" onclick="linkCopy('https://objecthub.xyz/?${preHtml.GDPSdata[0]}=${preHtml.ID}')"${getTrans('getLink')}/button>`
			: '')+
			(connectedWiki ?
			`<button class=loginbtn onclick="pageGuides(${jId},${connectedWiki},\`${preHtml.GDPSdata[1]}(${jId},${preHtml.ID},'${joinData}')\`)" style="margin-top:8px"${getTrans('openConnectedWiki')}/button>`
			: '')+
			`<div class="likezone">`+
				`<span class=likeplace id="likesCount${preHtml.ID}">${preHtml.likes[0]}</span>`+
				`<button ${preHtml.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${jId},${preHtml.ID},${likeType})" class=like id=like${preHtml.ID}></button>`+
				`<span class=likeplace id="dislsCount${preHtml.ID}">${preHtml.likes[1]}</span>`+
				`<button ${preHtml.isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${jId},${preHtml.ID},${likeType})" class=dislike id=dislike${preHtml.ID}></button>`+
				(typeof preHtml.likes[2] === 'undefined' ? '' : `<span class=likeplace id="commsCount${preHtml.ID}">${preHtml.likes[2]}</span>`+
				`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`)+
				(isComm == 0 ?
				`<button class=loginbtn onclick=getNewsWithComments(${jId},${preHtml.ID},${preHtml.gdpsId},'${joinData}')${getTrans('comms')}/button>`
				: '')+
			`</div>`+
		`</div>`+
		(reportButton ?
		`<button onclick="gdpsReport(${reportButton})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
			`<img src=${helperUrl}imgs/flag.svg width=16px style=margin:0>`+
		`</button>`
		: '')+
		(preHtml.canDel ? 
		imageButton(`${helperUrl}imgs/edit.svg`, `editNews(${jId},${preHtml.ID},${preHtml.gdpsId})`, `position:absolute;top:20px;right:64px`)+
		imageButton(`${helperUrl}imgs/trash.svg`, `deleteNews(${jId},${preHtml.ID},${isComm})`, `position:absolute;top:20px;right:20px`)
		: '')+
	`</div>`;
    return html;
},
contentRenderMinu = function(
    jId,
    data,
    preHtml = [
		joinData,
		joinBtn,
		tagsOs,
		'width:300px;height:450px',/*size*/
		0,/*contentType*/
		0,/*liketype*/
	],
    renderAuthor = 1,
    renderDesc = 1,
    renderTags = 1,
    renderImage = 1
) {
    let J = Jexec(jId);
    let imgClass = ['', ''],
	contentId = data.ID;
    if (renderImage == 1) {
		imgClass = ['FGDPSimg', 'FGDPSdemo']
	}

    let btnFuncs = [];

    switch (preHtml[4]) {
		case -3: 
			btnFuncs = ['getForumPost', `openForum(${jId},`+preHtml[0]+')', 'f', './?forumPost='];
			break;
		case -2:
			btnFuncs = ['getGuide', `pageGuides(${jId})`, 'g', './?wikiPage='];
			break;
		case -1:
			btnFuncs = ['pageGuides', `pageWikiList(${jId})`, 'w', './?wiki='];
			break;
		case 0:
			btnFuncs = ['getCamp', `pageFind(${jId},0)`, 'c', './?camp='];
			break;
		case 1:
			btnFuncs = ['getShow', `pageFind(${jId},1)`, 's', './?show='];
			break;
		case 2:
			btnFuncs = ['getPere', `pageFind(${jId},2)`, 'p', './?pere='];
			break;
		case 3:
			btnFuncs = ['getTele', `pageFind(${jId},3)`, 't', './?tele='];
			break;
	}
    if (data.mainWiki) {
		contentId = data.mainWiki;
		btnFuncs[0] = 'getGuide';
		preHtml[0] = data.ID;
	}
    data.isLiked = LIKES.get(preHtml[4], data.ID);

    // LANGS модуль
    if (preHtml[4] > -1) {
		data.text = GdpsesShortLangs.text(""+data.ID)
	} else {
		data.text = `>${data.text}<`
	}

    let 
	banWidth = parseInt(preHtml[3].split(';')[0].split(':')[1]) + 16,
	banHeight = Math.round(banWidth * 0.4166),
	darkZoneMargin = banHeight - 60,
	html =
	`<div class="framegdps" styling="${btnFuncs[2]}${data.ID}" style="${preHtml[3]}">`+
		(renderImage ? `<div class=loh style="min-height:128px">` : '')+
			`<h2 style=width:290px${renderImage ? '' : ';margin-top:'+(banHeight - 35)+'px;position:inherit;z-index:1'}>${data.title}</h2>`+
			(renderAuthor ? `<p style="margin:0">`+
				`<span${getTrans('addedBy')}/span>:`+
				`<button onclick="otherProfile(${jId},${data.author},'${btnFuncs[1]}')" style="background:0;border:0;color:var(--color-white)">${data.username}</button>`+
			`</p>` : '')+
			(renderImage ? gdpsAvatar(data.img)+
		`</div>` : '')+
		
		`<img loading=lazy class="${imgClass[0]}" id="guideimg" style=width:${banWidth}px;height:${banHeight}px src="${decodeURIComponent(data.ban)}" onerror="console.warn('broken link ${decodeURIComponent(data.ban)}');this.src='${helperUrl}imgs/hubemp.png'">`+
		`<div class="${imgClass[1]} gdpsalpha" styleng="${btnFuncs[2]}${data.ID}" style="width:${banWidth}px;height:60px;margin-top:${darkZoneMargin}px"></div>`+

		`<div style=position:absolute;bottom:0;width:100%>`+
			`<div class="likezone" style=margin-left:-4px;margin-bottom:6px>`+
				`<span class=likeplace id="likesCount${data.ID}">${data.likes[0]}</span>`+
				`<button ${data.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${jId},${data.ID},${preHtml[5]})" class=like id="like${data.ID}"></button>`+
				`<span class=likeplace id="dislsCount${data.ID}">${data.likes[1]}</span>`+
				`<button ${data.isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${jId},${data.ID},${preHtml[5]})" class=dislike id="dislike${data.ID}"></button>`+
				(typeof data.likes[2] === 'undefined' ? '' : `<span class=likeplace id="commsCount${data.ID}">${data.likes[2]}</span>`+
				`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`)+
			`</div>`+
			`<div class="btnszoneSearch" style=position:absolute;bottom:0;right:16px>`+
				preHtml[1]+
				`<a class=loginbtnGDPS href="${btnFuncs[3]}${data.ID}${preHtml[0] ? `.${preHtml[0]}` : ''}" style=margin-top:-2px;border-bottom-right-radius:calc(var(--def-border)*1.5) onclick="${btnFuncs[0]}(${jId},${contentId}${preHtml[0] ? `,'${preHtml[0]}'` : ''});event.preventDefault()"${getTrans('moreInfo')}/a>`+
			`</div>`+
		`</div>`+
		(renderDesc ? `<p ${renderImage ? 'class="FGDPStext absolute"' : ''} ${renderImage ? 'style="margin:0"' : ''}${data.text}/p>` : '')+
		(renderTags ? `<div class="flex-row FGDPStags absolute">${preHtml[2]}</div>` : '')+
	`</div>`;
    return html;
},
openLink = (callback)=>{
	return false
},
contentPreload = (jId, sendCommData = '', backFunc = '', renderNews = 1, renderBan = 1) => {
    let J = Jexec(jId);
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div id="insertable" class="gdps-forum"></div>`+
		`<div class=gdps-list-place id=GDPSesPlace></div>`+
		(renderBan ? 
		`<div class=imageBG>`+
			`<img id="imageBG" class=imageBG2>`+
		`</div>`
		: '')+
		`<div class="gdps-forum">`+
			(backFunc ?
			`<button class="loginbtn" onclick="${backFunc}"${getTrans('back')}/button>`
			: '')+
		`</div><br>`+
		`<div class=gdpsnewsalpha2 id=gdpsalpha style=z-index:-5></div>`+
		`<div style="flex-wrap:wrap" class=gdps-forum>`+
				(renderNews ? 
				`<div style=overflow:auto align=center class=adaptiveNews id="news"></div>`+
				`<div class=gdpsnewsalpha></div>`
				: `<div style=width:80cqw>`)+
				`<div style=overflow:auto;flex:50%>`+
					contentSendCommForm(jId, sendCommData)+
					`<div id="comments"></div>`+
				`</div>`+
			(renderNews ? '' : `</div>`)+
		`</div>`+
	`</div>`;
    innerMain(jId, html);
},
contentSendCommForm = (jId, sendCommData) => {
    let J = Jexec(jId);
    if (sendCommData != '' && thisUser.isActive === 1)
	 return `<div class="framecomm">`+
				`<input type="text" class="framelabel" id="text" style="width:calc(100% - 16px)" required minlength=10${getTrans('min10chars', 'input')}<br>`+
				`<button class="loginbtn" onclick="sendComm(${jId},${sendCommData})" id="commentBtn"${getTrans('commSend')}/button>`+
			`</div>`;
    return '';
},

Tags = [
	{
		'1': 'Camptag1',
		'2': 'Camptag2',
		'3': 'Camptag3',
		'4': 'Camptag4',
		'5': 'Camptag5',
		'6': 'Camptag6',
		'7': 'Camptag7',
		'8': 'Camptag8',
		'9': 'Camptag9',
		'10': 'Camptag10',
	},
	{
		'1': 'Showtag1',
		'2': 'Showtag2',
		'3': 'Showtag3',
		'4': 'Showtag4',
		'5': 'Showtag5',
		'6': 'Showtag6',
		'7': 'Showtag7',
		'8': 'Showtag8',
		'9': 'Showtag9',
	},
	{
		'1': 'Showtag1',
		'2': 'Showtag2',
		'3': 'Showtag3',
		'4': 'Showtag4',
		'5': 'Showtag5',
		'6': 'Showtag6',
		'7': 'Showtag7',
		'8': 'Showtag8',
		'9': 'Showtag9',
	},
	{
		'1': 'Teletag1',
		'2': 'Teletag2',
		'3': 'Teletag3',
		'4': 'Teletag4',
		'5': 'Teletag5',
		'6': 'Teletag6',
		'7': 'Teletag7',
		'8': 'Teletag8',
		'9': 'Teletag9',
	},
],
Os = [
	{
		'11': 'Camptag11',
		'12': 'Camptag12',
		'13': 'Camptag13',
		'14': 'Camptag14',
		'15': 'Camptag15',
	},
	{
		'12': 'Showtag12',
		'13': 'Showtag13',
		'14': 'Showtag14',
		'15': 'Showtag15',
	},
	{
		'12': 'Showtag12',
		'13': 'Showtag13',
		'14': 'Showtag14',
		'15': 'Showtag15',
	},
	{
		'12': 'Teletag12',
		'13': 'Teletag13',
		'14': 'Teletag14',
		'15': 'Teletag15',
	},
],
TagsVacs = {
	1:'Vacstag1',
	2:'Vacstag2',
	3:'Vacstag3',
	4:'Vacstag4',
	5:'Vacstag5',
	6:'Vacstag6',
	7:'Vacstag7',
	8:'Vacstag8',
	9:'Vacstag9',
	10:'Vacstag10',
},
toStringTAGS = (channel, tag)=>{ // используется для рендера, перемещена из региона рендера для более удобного добавления новых тегов
	let findArr = Object.assign({}, Tags[channel], Os[channel]);
	return findArr[tag];
},
toStringTagsVacs = (tag)=>{
	return TagsVacs[tag];
},

renderTagSearch = (jId, Array, Class, ArrayId, elemId = '') => {
    let J = Jexec(jId);
    let tagName = Array[ArrayId],
	customId;
    if (elemId == '')
		customId = tagName;
	else 
		customId = elemId;
    return `<label class="tagUns" onclick="writeTag(${jId},'${Class}',${ArrayId})" id=${customId}${getTrans(tagName)}/label>`;
},
renderTagAdding = (jId, Array, Class, id, checked = '') => {
    let J = Jexec(jId);
    let tagName = Array[id];
    let html = `<input id=T${id} style=display:none name=${Class}[] type=checkbox${checked} value=${id}>`+
	`<label class=tagUns for=T${id} value=${id}${getTrans(tagName)}/label>`;
    return html;
},

// #endregion
// #region поиск + контент(открытие кемпов вики форумов и т д)

// две переменные ниже работают с функциями HELPERFIND_REGION
helperFindData = [0,[],[],1], // нулевой это метод поиска, первый просто теги, второй платформы, третий это канал

// переменные для кеша в поиске
	CacheFinds = [1,'','',1], // канал, кеш, строка поиска и страница

	// переменные для кеша в профилях
	myGdpses = [{},{},{}, {}],
	myguides = [],
	yourWikies = [],
	wikiesMini = [],

writeTag = (jId, type, tag) => {
    let J = Jexec(jId);
    let INDEX = 1,
		elemId = 'Camptag';
    switch (type) {
		case 'camp':
			INDEX = 1;
			break;
		case 'caOS':
			INDEX = 2;
			break;
		case 'show':
			INDEX = 1;
			elemId = 'Showtag';
			break;
		case 'shOS':
			INDEX = 2;
			elemId = 'Showtag';
			break;
		case 'pere':
			INDEX = 1;
			elemId = 'Peretag';
			break;
		case 'peOS':
			INDEX = 2;
			elemId = 'Peretag';
			break;
		case 'tele':
			INDEX = 1;
			elemId = 'Teletag';
			break;
		case 'teOS':
			INDEX = 2;
			elemId = 'Teletag';
			break;
		case 'vacs':
			INDEX = 1;
			elemId = 'Vacstag';
			break;
	}
    if (!J.helperFindData[INDEX].includes(tag)) {
		J.id(elemId+tag).setAttribute('class','tagSel');
		J.helperFindData[INDEX].push(tag);
	} else {
		J.id(elemId+tag).setAttribute('class','tagUns');
		let tagPlace = J.helperFindData[INDEX].indexOf(tag);
		if (tagPlace !== -1) {
			J.helperFindData[INDEX].splice(tagPlace, 1);
		}
	}
    J.helperFindData[INDEX].sort((a,b)=>{return a-b});
    sendFinder(jId);
},
setMethod = (jId, Method) => {
    let J = Jexec(jId);
    J.id('method'+J.helperFindData[0]).setAttribute('class','tagPre');
    J.helperFindData[0] = Method;
    J.id('method'+J.helperFindData[0]).setAttribute('class','tagSel');
    sendFinder(jId);
},
sendFinder = (jId, page = 0, query = '') => {
    let J = Jexec(jId);
    if (J.id('nextGdps'))
		J.id('nextGdps').remove();

    if (query === '') {
		query = 'method='+J.helperFindData[0];
		let enteredName = J.id('gdpsNameInput').value;
		if (enteredName != '')
			query += '&name='+enteredName;
		if (J.helperFindData[1] !== null) {
			J.helperFindData[1].forEach(tag=>{
				query += '&tags[]='+tag;
			});

			J.helperFindData[2].forEach(os=>{
				query += '&os[]='+os;
			});
		}
	}
    J.lastChannel = J.helperFindData[3];

    Loading();
    _.http.req('GET', `${sData[3]}new${php}?${query}&page=${page}&channel=${J.helperFindData[3]}`)
		.then(data=>{
			let GDPSES = JSON.parse(data),
				renderedData,
				page2 = page + 1,
				nextBtn = `sendFinder(${jId},${page2},'${query}')`,

				Count = Object.keys(GDPSES).length;
			switch (J.helperFindData[3]) {
				case -5:
					renderedData = renderVacancy(jId, GDPSES);
					break;
				case -1:
					renderedData = renderWiki(jId, GDPSES);
					break;
				case 0:
					renderedData = FINDrenderMini(jId, 0, GDPSES);
					break;
				case 1:
					renderedData = FINDrenderMini(jId, 1, GDPSES);
					break;
				case 2:
					renderedData = FINDrenderMini(jId, 2, GDPSES);
					break;
				case 3:
					renderedData = FINDrenderMini(jId, 3, GDPSES);
					break;
					
			}
			innerGdpsPlace(jId, renderedData, page);
			J.CacheFinds[0] = J.helperFindData[3];
			if (page == 0)
				J.CacheFinds[1] = renderedData;
			else 
				J.CacheFinds[1] += renderedData;
			J.CacheFinds[2] = query;
			J.CacheFinds[3] = page2;

			if (Count >= 9 && J.helperFindData[3] !== -1)
				innerGdpsPlace(jId, insertBtn(jId, nextBtn),-1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
modifyFindTags = (jId, channel) => {
    let J = Jexec(jId);
    if (J.id(`tags${J.helperFindData[3]}`))
		J.id(`tags${J.helperFindData[3]}`).style.display = 'none';
    let actsCount = J.qa('[class=tagSel]').length - 1;
    J.qa('[class=tagSel]').forEach(el=>{
		if (actsCount == 0)
			return;
		actsCount--;
		el.classList.replace('tagSel', 'tagUns');
	});
    J.helperFindData[1] = [];
    J.helperFindData[2] = [];
    J.id('channel'+J.helperFindData[3]).setAttribute('class','tagPre');
    J.helperFindData[3] = channel;
    J.id('channel'+J.helperFindData[3]).setAttribute('class','tagSel');
    if (J.id(`tags${J.helperFindData[3]}`))
		J.id(`tags${J.helperFindData[3]}`).style.display = '';
    sendFinder(jId);
},
helperComments = (jId, postId, contentType, commPage = 0) => {
    let J = Jexec(jId);
    if (J.id('CnextGdps'))
		J.id('CnextGdps').remove();
    let dataForNextButton = `${postId},'${contentType}',${parseInt(commPage + 1)}`;
    Loading();
    _.http.req('GET', `${sData[0]}fetchComms${php}?id=${postId}&type=${contentType}&page=${commPage}`)
		.then(data=>{
			let serverResp = JSON.parse(data);
			innerComments(jId, renderComms(jId, serverResp, contentType, dataForNextButton), 1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},

getFind = (jId, channel, id, joinData = 0) => {
    let J = Jexec(jId);
    let tinyStr = 'c',
			smallString = 'camp',
			bigString = 'Camp',
			newsChannel = '.';
    switch (channel) {
        case 1:
            tinyStr = 's';
            smallString = 'show';
            bigString = 'Show';
            newsChannel = ',';
            break;
        case 2:
            tinyStr = 'p';
            smallString = 'pere';
            bigString = 'Pere';
            newsChannel = '/';
            break;
        case 3:
            tinyStr = 't';
            smallString = 'tele';
            bigString = 'Tele';
            newsChannel = '/';
            break;
        
    }
    J.lastUsedProfile = `getFind(${jId},${channel},${id})`;
    contentPreload(jId, `${id},1,3`, `pageFind(${jId},`+channel+')');

    Loading();
    _.http.req('GET', `${sData[0]}camp${php}?id=${id}`)
		.then(data=>{
			if (data == '["NONE"]') {
				pageFind(jId, channel);
				megaAlert(jId, 'CONTENTISNULL');
				Loading(1);
				return false;
			}
			let serverResp = JSON.parse(data);
			J.link.set(smallString+'='+id, serverResp.gdps.title);
			let dataForNextButton = `${id},0,1`,
				isOwner = checkOwn(id, serverResp.gdps.author, 1),
				html = '';

			if (joinData !== 0)
				html = FINDrender(jId, channel, serverResp, joinData);
			else 
				html = FINDrender(jId, channel, serverResp);

			innerComments(jId, renderComms(jId, serverResp.comments, 0, dataForNextButton), 0);
			J.id('imageBG').src = decodeURIComponent(serverResp.gdps.ban);

			if (isOwner)
				J.id('news').insertAdjacentHTML('afterbegin', `<div class=framegdps style="width:calc(100% - 40px)">`+newsWindow(jId, id,tinyStr)+`</div>`);
			J.id('news').innerHTML = basicButton(getTrans('newsList'), `helperNews(${jId},'${id}${newsChannel}',${isOwner})`)+
				RenderNews(jId, serverResp.news,2,'getCamp');
			if (Object.keys(serverResp.news).length > 10)
				J.id('news').insertAdjacentHTML('beforeend',insertBtn(jId, `loadMoreNews(${jId},${id},'get${bigString}',1,2)`));
			
			J.id('insertable').innerHTML = html;
			setImgSize(jId);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
getCamp = (jId, id, joinData = 0) => {
    let J = Jexec(jId);
    getFind(jId, 0,id,joinData);
},
getShow = (jId, id, joinData = 0) => {
    let J = Jexec(jId);
    getFind(jId, 1,id,joinData);
},
getPere = (jId, id, joinData = 0) => {
    let J = Jexec(jId);
    getFind(jId, 2,id,joinData);
},
getTele = (jId, id, joinData = 0) => {
    let J = Jexec(jId);
    getFind(jId, 3,id,joinData);
},
loadMoreNews = (jId, gdpsId, backFunc, page, renderType = 0) => {
    let J = Jexec(jId);
    if (J.id('nextGdps'))
		J.id('nextGdps').remove();
    Loading();
    _.http.req('GET', `${sData[0]}news${php}?id=${gdpsId}&page=${page}`)
		.then(data=>{
			Loading(1);
			if (data !== '{}') {
				let parsedData = JSON.parse(data),
						html = RenderNews(jId, parsedData,renderType,backFunc);
				page++;
				if (Object.keys(parsedData).length > 10)
					html += insertBtn(jId, `loadMoreNews(${jId},${gdpsId},'${backFunc}',${page})`);
				if (J.id('news'))
					J.id('news').insertAdjacentHTML('beforeend',html);
				else 
					innerGdpsPlace(jId, html, 1);
			};
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
loadGlobalNews = (jId, page) => {
    let J = Jexec(jId);
    if (J.id('nextGdps'))
		J.id('nextGdps').remove();
    Loading();
    _.http.req('GET', `${sData[0]}newsAll${php}?page=${page}`)
		.then(data=>{
			Loading(1);
			if (data !== '{}') {
				let parsedData = JSON.parse(data),
						html = RenderNews(jId, parsedData,0,'globalNews');
				page++;
				if (Object.keys(parsedData).length > 10)
					innerGdpsPlace(jId, insertBtn(jId, `loadGlobalNews(${jId},${page})`), -1);
				if (J.id('news'))
					J.id('news').insertAdjacentHTML('beforeend',html);
				else 
					innerGdpsPlace(jId, html, 1);
			};
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
gdpsNewsPage = (jId, renderNazad = false, gdpsId = 0, backFunc = '') => {
    let J = Jexec(jId);
    let html = pHeader(jId)+
	`<div style=height:60px></div>`+
	`<div id=helperContent>`+
		(renderNazad ? `<div class=gdps-forum>`+
			`<button data-trans="back" class=loginbtn onclick="${backFunc}(${jId},${parseInt(gdpsId)})"${getTrans('back')}/button><br>`+
		`</div>` : '')+
		`<div id=GDPSesPlace class=gdps-forum style=flex-direction:column;align-items:center></div>`+
	`</div>`;
    return html;
},
getNewsWithComments = (jId, newsId, contentId = 0, backFuncPre = '', commBackFunc = '') => {
    let J = Jexec(jId);
    let backFunc = '';
    if (backFuncPre.length === 1) {
		switch (backFuncPre) {
			case '.':
				backFunc = 'getCamp';
				break;
			case ',':
				backFunc = 'getShow';
				break;
			case '/':
				backFunc = 'getPere';
				break;
			//FIXME:getTele про патч пжпж UwU
			case ';':
				backFunc = 'globalNews';
				break;
		}
	} else {
		backFunc = backFuncPre;
		switch (backFuncPre) {
			case 'getCamp':
				backFuncPre = '.';
				break;
			case 'getShow':
				backFuncPre = ',';
				break;
			case 'getPere':
				backFuncPre = '/';
				break;
			case 'globalNews':
				backFuncPre = ';';
				break;
		}
	}
    if (commBackFunc == '')
		commBackFunc = backFunc;

    J.lastUsedProfile = `getNewsWithComments(${jId},`+newsId+","+contentId+")";
    contentPreload(jId, `${newsId},3,5`, `${commBackFunc}(${contentId})`, 0, 0);

    Loading();
    _.http.req('GET', `${sData[0]}newsC${php}?id=${newsId}`)
		.then(data=>{
			if (data == '["NONE"]') {
				pageFind(jId, 0);
				megaAlert(jId, 'CONTENTISNULL');
				Loading(1);
				return;
			}
			let serverResp = JSON.parse(data);
			J.link.set('news/comms='+newsId+'|'+contentId+'|'+backFuncPre, serverResp.gdps['n'+newsId].title);
			let dataForNextButton = `${newsId},3,1`,
				html = '';
				
			html = RenderNews(jId, serverResp.gdps,1,backFunc,commBackFunc);

			innerComments(jId, renderComms(jId, serverResp.comments, 3, dataForNextButton), 0);
			J.id('insertable').innerHTML = html;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
getVacsWithComments = (jId, vacId) => {
    let J = Jexec(jId);
    let commBackFunc = 'globalVacs';
    J.lastUsedProfile = `getVacsWithComments(${jId},`+vacId+")";
    contentPreload(jId, `${vacId},5,12`, `${commBackFunc}(${vacId})`, 0, 0);

    Loading();
    _.http.req('GET', `${sData[0]}vacsC${php}?id=${vacId}`)
		.then(data=>{
			if (data == '["NONE"]') {
				globalVacs(jId);
				megaAlert(jId, 'CONTENTISNULL');
				Loading(1);
				return;
			}
			let serverResp = JSON.parse(data);
			J.link.set('VacsC/'+vacId, serverResp.gdps['v'+vacId].title);
			let dataForNextButton = `${vacId},3,1`,
				html = '';
				
			html = renderVacancy(jId, serverResp.gdps,thisUser.role,'f');

			innerComments(jId, renderComms(jId, serverResp.comments, 5, dataForNextButton), 0);
			J.id('insertable').innerHTML = html;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
getWikis = (jId, page) => {
    let J = Jexec(jId);
    if (J.id('nextGdps'))
		J.id('nextGdps').remove();

    Loading();
    _.http.req('GET', `${sData[7]}getWikis${php}?page=${page}`)
		.then(data=>{
			let parsedData = JSON.parse(data),
				page2 = page++,
				html = renderWiki(jId, parsedData, page2);
			innerGdpsPlace(jId, html,1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
// #endregion
// #region вставка в разные куски страницы, функция innerMain упомянута тут, за остальные поясню ниже
// вставка контента в правую половину окна профилей, для телефонов замена всего экрана
innerProfile = (jId, textContent) => {
    let J = Jexec(jId);
    document.documentElement.style = '';
    if (J.id('profileWindow')) 
		J.id('profileWindow').innerHTML = textContent;
	else 
		return new Error('Cant find "profileWindow" element!');
},
// вставка контента в вики данные
innerWikiControl = (jId, textContent, wikiId = '') => {
    let J = Jexec(jId);
    if (J.id('wikiControlP'+wikiId)) 
		J.id('wikiControlP'+wikiId).innerHTML = textContent;
	else 
		return new Error('Cant find "profileWindow" element!');
},
// вставка контента под рамкой поиска
innerGdpsPlace = (jId, textContent, insertType = 0, otherId = '') => {
    let J = Jexec(jId);
    if (!J.id('GDPSesPlace')) 
		return new Error('Cant find "GDPSesPlace" element!');

    if (insertType == 0) // профили
		J.id('GDPSesPlace'+otherId).innerHTML = textContent;
	else if (insertType == 512)
		J.id('GDPSesPlace'+otherId).insertAdjacentHTML('beforebegin', textContent);
	else if (insertType == 511)
		J.id('GDPSesPlace'+otherId).insertAdjacentHTML('afterbegin', textContent);
	else if (insertType >= 1) // в поиске устарел
		J.id('GDPSesPlace'+otherId).insertAdjacentHTML('beforeend', textContent);
	else // в поиске но лучще это
		J.id('GDPSesPlace'+otherId).insertAdjacentHTML('afterend', textContent);
},
// вставка контента в рамку комментариев, прошу обратить внимание ибо у гдпсов она справа, а у гайдов и текстур заполняет весь экран
innerComments = (jId, textContent, insertType = 0) => {
    let J = Jexec(jId);
    if (!J.id('comments')) 
		return new Error('Cant find "comments" element!');
    if (insertType == 0) // при рендере гдпса
		J.id('comments').innerHTML = textContent;
	else 
		// а эт вроде когда "показать больше"
		J.id('comments').insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в рамку гайдов, как попало если что
innerGuides = (jId, textContent, insertType = 0) => {
    let J = Jexec(jId);
    if (!J.id('guidesPlace')) 
		return new Error('Cant find "guidesPlace" element!');
    if (insertType == 0)
		J.id('guidesPlace').insertAdjacentHTML('beforeend',textContent);
	else 
		J.id('guidesPlace').insertAdjacentHTML('afterend',textContent);
},
// #endregion
// #region разные формы
sendRegisterForm = async (wId)=>{
	await Fingerprint.generate(fp === ''); // если токена нет то он пойдёт генерироваться
	let username = _.$.id('LGusername').value,
		password = _.$.id('LGpassword').value,
		email	= _.$.id('LGemail'	 ).value,
		reCAPdatas = document.getElementsByClassName('g-recaptcha-response'),
		reCAP = '';
	if (reCAPdatas.length)
		reCAP = reCAPdatas[reCAPdatas.length-1].value;
	if (!ignoreCap && !reCAP) {
		megaAlert(jId, 'captchaDed');
		return;
	};
		Loading();
		_.http.req('POST', `${sData[5]}register${php}`,
			`username=${username}&password=${password}&email=${email}&g-recaptcha-response=${reCAP}`+fp.urlDone, urlEncoded)
			.then(data=>{
				switch (data) {
					case '-1':
						megaAlert(jId, 'loginClaimed');
						break;
					case '-2':
						megaAlert(jId, 'captchaDed');
						break;
					case '-4':
						megaAlert(jId, 'somethingWentWrong');
						break;
					default:
						let serverResp = helperInitData(jId, data);
						token = thisUser.token;
						_.http.defaultHeaders['user-token'] = token;
						Slocal.set('User', token);
						thisUser.token = '';

						_.$.id('regBtn').remove();
						_.$.id('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser.username}</span>`;

						if (_.$.id('regBtn2')) {
							_.$.id('regBtn2').innerHTML = getTrans('logout', 0);
							_.$.id('regBtn2').setAttribute('data-trans', 'logout');
							_.$.id('regBtn2').setAttribute('onclick', 'gLogout()');
						}
						if (_.$.id('btnLogin2')) {
							_.$.id('btnLogin2').innerHTML = thisUser.username;
							_.$.id('btnLogin2').removeAttribute('data-trans');
							_.$.id('btnLogin2').setAttribute('onclick', `profilePage(${jId})`);
						}
						profilePage(jId);
						_.$.qa('[isloginwindow]').forEach(el=>{
							_.wins[el.id].close();
						});
				}
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
sendLoginForm = async (wId)=>{
	await Fingerprint.generate(fp === ''); // если токена нет то он пойдёт генерироваться
	let username = _.$.id('LGusername').value,
		password = _.$.id('LGpassword').value,
		reCAPdatas = document.getElementsByClassName('g-recaptcha-response'),
		reCAP = '';
	if (reCAPdatas.length)
		reCAP = reCAPdatas[reCAPdatas.length-1].value;
	if (!ignoreCap && !reCAP) {
		megaAlert(jId, 'captchaDed');
		return;
	};
		Loading();
		_.http.req('POST', `${sData[5]}login${php}`,
			`username=${username}&password=${password}&g-recaptcha-response=${reCAP}`+fp.urlDone, urlEncoded)
			.then(data=>{
				Loading(1);
				switch (data) {
					case '-1':
						megaAlert(jId, 'wrongPass');
						break;
					case '-2':
						megaAlert(jId, 'accountEmpty');
						break;
					case '-3':
						megaAlert(jId, 'captchaDed');
						break;
					default:
						let serverResp = helperInitData(jId, data);
						token = thisUser.token;
						_.http.defaultHeaders['user-token'] = token;
						Slocal.set('User', token);
						thisUser.token = '';

						_.$.id('regBtn').remove();
						_.$.id('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser.username}</span>`;

						if (_.$.id('regBtn2')) {
							_.$.id('regBtn2').innerHTML = getTrans('logout', 0);
							_.$.id('regBtn2').setAttribute('data-trans', 'logout');
							_.$.id('regBtn2').setAttribute('onclick', 'gLogout()');
						}
						if (_.$.id('btnLogin2')) {
							_.$.id('btnLogin2').innerHTML = thisUser.username;
							_.$.id('btnLogin2').removeAttribute('data-trans');
							_.$.id('btnLogin2').setAttribute('onclick', `profilePage(${jId})`);
						}
						profilePage(jId);
						_.$.qa('[isloginwindow]').forEach(el=>{
							console.warn(el);
							_.wins[el.id].close();
						});
				}
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
sendDrop = ()=>{
	let email	= _.$.id('LGemail').value;
	Loading();
	helperRequest(
		`${sData[5]}drop${php}`,
		`email=${email}`
	)
		.then(()=>{
			Loading(1);
			if (thisUser.ID !== 0) {
				profilePage(jId);
			} else {
				innerMain(jId, pageMain(jId));
			}
			megaAlert(jId, 'needEmailVerify');
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
sendVerify = ()=>{
	let code	= _.$.id('LGcode').value;
	Loading();
	helperRequest(
		`${sData[5]}verify${php}`,
		`code=${code}`
	)
		.then(data=>{
			Loading(1);
			if (thisUser.ID == data) {
				thisUser.isActive = 1;
				profilePage(jId);
			} else {
				innerMain(jId, pageMain(jId));
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
gLogout = ()=>{
	Loading();
	helperRequest(`${sData[5]}logout${php}`, `device=${fp.staticName}`)
		.then(()=>{
			Loading(1);
			thisUser = {
				username: '???',
				ID: 0,
				role: 0,
				isActive: 0,
				hasAlarms: 0,
				token: ''
			};
			Slocal.remove('User');
			Slocal.remove('StaticUserData');
			delete _.http.defaultHeaders['user-token'];
			token = undefined;
			innerMain(jId, pageMain(jId));
		});
},

sendComm = (jId, id, channel, likeChannel) => {
    let J = Jexec(jId);
    if (thisUser.ID === 0)
		return;

    Loading();
    let dataForNextButton = `${id},'${channel}',1`,
		commText = J.id('text').value,
		data =
		'ide='	 + encodeURIComponent(id)
	+ '&type=' + encodeURIComponent(channel)
	+ '&text=' + encodeURIComponent(commText);
    _.http.req('POST', `${sData[1]}comment${php}`, data, urlEncoded)
		.then(data=>{
			Loading(1);
			if (data == '-4') {
				megaAlert(jId, 'commSizeFail');
				return;
			}
			let serverResp = JSON.parse(data);

			innerComments(jId, renderComms(jId,serverResp,channel,dataForNextButton), 0);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
editComm = (jId, id, channel) => {
    let J = Jexec(jId);
    if (J.id('commEdit'+id) !== null)
		return;
    _.win.open('commEdit',
		`<textarea class=framelabel style=width:250px id=editText-C${id}>${J.id('commText'+id).textContent}</textarea><br>
		${basicButton(getTrans('commSend'), `modifyComm(${jId},${id},${channel})`)}`
	, 'commEdit'+id);
},
modifyComm = (jId, id, channel) => {
    let J = Jexec(jId);
    let text = J.id('editText-C'+id).value,
			data = `id=${id}&type=${channel}&text=${text}`;
    Loading();
    _.http.req('POST', `${sData[1]}commentModify${php}`, data, urlEncoded)
		.then(data=>{
			Loading(1);
			_.wins[J.q(`[commEdit${id}]`).id].close();
			if (data == '-4') {
				megaAlert(jId, 'commSizeFail');
				return;
			}
			if (data == '-3') {
				megaAlert(jId, 'newsNone');
				return;
			}
			if (data != '')
				if (J.id('commText'+id))
					J.id('commText'+id).textContent = data;
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
deleteComm = (jId, id, channel) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[4]}comment${php}?ide=${id}&type=${channel}`)
		.then(data=>{
			if (data == '-1')
				return _.err.log('Access denied');
			J.id('comm'+data).remove();
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
editNews = (jId, id, gdpsId) => {
    let J = Jexec(jId);
    if (J.id('newsEdit'+id) !== null)
		return;
    Loading();
    _.http.req('GET', `${sData[0]}newsC${php}?id=${id}`)
		.then(data=>{
			Loading(1);
			let parsedData = JSON.parse(data),
					title = parsedData.gdps['n'+id].title,
					text = parsedData.gdps['n'+id].text.replaceAll('<br>', '\n');
			_.win.open('newsEdit',
				`<input class=framelabel style=width:250px id=editNews1-N${id} value="${title}"><br>
				<textarea class=framelabel style=width:250px id=editNews2-N${id}>${text}</textarea><br>
				${basicButton(getTrans('commSend'), `modifyNews(${jId},${id},${gdpsId})`)}`
			, 'newsEdit'+id);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
modifyNews = (jId, id, gdpsId) => {
    let J = Jexec(jId);
    let title = _.$.id('editNews1-N'+id).value,
			text = _.$.id('editNews2-N'+id).value,
			data = `id=${id}&gdps=${gdpsId}&title=${title}&text=${text}`;

    Loading();
    _.http.req('POST', `${sData[1]}newsModify${php}`, data, urlEncoded)
		.then(data=>{
			Loading(1);
			_.wins[_.$.q(`[newsEdit${id}]`).id].close();
			if (data == '-3') {
				megaAlert(jId, 'newsNone');
				return;
			}
			let parsedData = JSON.parse(data);
			let text = Markdown(jId, parsedData[1]);
			if (data != '')
				if (J.id('news'+id)) {
					J.id('Ntitle'+id).textContent = parsedData[0];
					J.id('Ntext'+id).innerHTML = text;
				}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
deleteNews = (jId, id, goBack) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[4]}newsPost${php}?ide=${id}`)
		.then(data=>{
			if (data == '-1')
				return _.err.log('Access denied');
			J.id('news'+data).remove();
			goBack ? history.back() : null;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
// #endregion
// #region публичные страницы
pHeader = jId => {
    let J = Jexec(jId);
    let regBtn = '',
		loginBtn = '',
		regBtnMobile = '',
		loginBtnMobile = '';

    if (thisUser.ID === 0) {
		regBtn = `<button id=regBtn class="emptybtn" onclick="registerPage()"${getTrans('register')}/button>`;
		loginBtn =
		`<button id=btnLogin style="margin-left:12px" class="emptybtn" onclick="loginPage()">`+
			`<span styllle=position:absolute;right:0;top:-8px${getTrans('login')}/span>`;
		regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="registerPage()"${getTrans('register')}/button>`;
		loginBtnMobile =
		`<button id=btnLogin2 class="loginbtn" onclick="loginPage()">`+
			`<span${getTrans('login')}/span>`;
	} else {
		regBtn = ``;
		loginBtn =
		`<button id=btnLogin styllle="position:relative;width:20px;height:16px;margin-left:20px" class="emptybtn" onclick="profilePage(${jId})">`+
			`<span styllle=position:absolute;right:0;top:-8px>${thisUser.username}</span>`;
		regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="gLogout()"${getTrans('logout')}/button>`;
		loginBtnMobile =
		`<button id=btnLogin2 styllle=position:relative class="loginbtn" onclick="profilePage(${jId});switchMobileMain(${jId})">`+
			`<span>${thisUser.username}</span>`;
	}

    // (thisUser.hasAlarms == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')

    if (thisUser.hasAlarms == 1) {
		loginBtn += `<span style="position:absolute;top:-14px;right:-6px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
		loginBtnMobile += `<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
	}
    loginBtn += `</button>`;
    loginBtnMobile += `</button>`;

    let html =
	`<div class="header" id=helperMaster align="left">`+
		`<nodiv id=switchHtmlLang style=position:relative>`+
			`<button onclick="makeSwticher(${jId},0,'switchHtmlLang2', switchLangMenu(${jId}), 'switchHtmlLang', 'switchLangMenu')" style="width:40px" class="emptybtn">`+
				`<img src="${helperUrl}imgs/globe.svg" width=40px style="margin-bottom:-6px">`+
			`</button>`+ 
			basicButton('>Jail it!<', `new Function('let j = openJail(_.link.compile()[0]);Jexec(j).link.get()')()`)+
		`</nodiv>`+
		(renderBeta ? `<p style=opacity:50%;position:absolute;top:0;right:0;margin:64px data-trans="helperVer"${getTrans('helperVer')}/p>` : '')+
		`<div class=contentAdaptiveBig>`+
			headerButtons(jId)+
			`<div style=position:absolute;right:8px;top:16px>`+
				`<nodiv id=switchHtmlLogin style=position:relative>`+
					regBtn+
					loginBtn+ // !ПОИСК! switchLogin = function
				`</nodiv>`+
			`</div>`+
		`</div>`+
		`<div class=contentAdaptiveSmall style=display:flex;flex-direction:row-reverse>`+
			`<button class="contentAdaptiveSmall loginbtn" onclick="switchMobileMain(${jId})">`+
				`<div style="transform:rotate(90deg)">|||</div>`+
			`</button>`+
		`</div>`+
	`</div>`+
	bottomNav(jId)+
	`<div class=frameprofile id=helperSecond style=display:none>`+
		headerButtons(jId, 1)+
		`<div style=height:33px></div>`+
		loginBtnMobile+
		regBtnMobile+
		`<p align=right${getTrans('helperVer')}/p>`+
	`</div>`;
    return html;
},
pageMain = (jId, localIgnore = false) => {
    let J = Jexec(jId);
    let mainPlate = (jId, h1, p, btns, img) => {
        let J = Jexec(jId);
        let text = [];
        if (!Array.isArray(p))
			text = `<p${getTrans(p)}/p>`;
		else {
			p.forEach(el=>{
				text.push(`<p${getTrans(el)}/p>`);
			})
			text = text.join('');
		}
        return `<div class=mainPlate style=width:330px;height:400px>`+
					`<h2 style="margin:6px 0 6px 0"${getTrans(h1)}/h2>`+
					text+
					`<div class=absolute style=bottom:8px;z-index:1>`+
						`<img style=margin:0 src="${helperUrl}imgs/${img}" width="144px"><br>`+
						btns+
					`</div>`+
				`</div>`;
    }
    if (!localIgnore)
		J.link.set('');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div style="background-color:var(--color-profile)">`+
			`<div class=contentAdaptiveFlexSmall style=position:relative;align-items:center;justify-content:center;overflow:hidden>`+
				basicButton(getTrans('finder-name'), `pageFind(${jId},Jexec(${jId}).helperFindData[3])`, `position:absolute;top:295px;left:calc(15% + 80px);z-index:3;font-size:calc(var(--def-font)*2);font-family:'Unbounded',system-ui;filter:drop-shadow(2px 2px 6px #000)`)+
				`<div class=textFly style=position:relative;width:35cqw;height:370px;z-index:2;align-content:center>`+
					`<h3 style="width:650px;margin:8px;filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*2.5);color:#5E4877"${getTrans('T2-hi')}/h3>`+
					`<h1 style="width:650px;margin:8px;filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*4);font-weight:bold">`+
						`<span style=font-size:calc(var(--def-font)*4)${getTrans('ojhubname')}/span>`+
					`!</h1>`+
					`<h2 style="width:650px;margin:8px;filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*1.5)"${getTrans('hubMaster')}/h2>`+
				`</div>`+
				`<div style=position:relative;width:35cqw;height:370px;z-index:1>`+
					`<img src="${helperUrl}imgs/grad.webp"  height=1000px style="position:absolute;right:-220px;top:-100px;transform:rotate(-3deg)">`+

					`<img src="${helperUrl}imgs/gem.webp"   loading=lazy height=322px style="filter:drop-shadow(2px 2px 8px #000);position:absolute;right:420px;top:100px">`+
					`<img src="${helperUrl}imgs/gasi.webp"  loading=lazy height=348px style="filter:drop-shadow(2px 2px 8px #000);position:absolute;right:270px;top:50px;transform:rotate(-3deg)">`+
					`<img src="${helperUrl}imgs/share.webp" loading=lazy height=424px style="filter:drop-shadow(2px 2px 8px #000);position:absolute;right:-20px;top:-11px;transform:rotate(0deg)">`+
				`</div>`+
			`</div>`+
			`<div class=contentAdaptiveSmall align=center style=position:relative;overflow:hidden>`+
				`<div class=textFly style=z-index:2>`+
					`<img src="${helperUrl}imgs/grad.webp"  height=1000px style="position:absolute;right:-180px;top:-100px;transform:rotate(-3deg)">`+
					`<h3 style="filter:drop-shadow(2px 2px 6px #000);margin:12px;font-size:calc(var(--def-font)*2.5);color:#5E4877"${getTrans('T2-hi')}/h3>`+
					`<h1 style="filter:drop-shadow(2px 2px 6px #000);margin:12px;font-size:calc(var(--def-font)*3);font-weight:bold">`+
						`<span style=font-size:calc(var(--def-font)*3)${getTrans('ojhubname')}/span>`+
					`!</h1>`+
					`<h2 style="filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*1.25)"${getTrans('hubMaster')}/h2>`+
				`</div>`+
				basicButton(getTrans('finder-name'), `pageFind(${jId},Jexec(${jId}).helperFindData[3])`, `margin-top:24px;margin-bottom:48px;font-size:calc(var(--def-font)*2);font-family:'Unbounded',system-ui;filter:drop-shadow(2px 2px 6px #000)`)+
			`</div>`+
		`</div>`+
		`<div class=frameprofile style=margin-top:40px;background-color:var(--color-bg)>`+
			`<div align=center style=display:flex;flex-wrap:wrap;justify-content:center>`+
				`<div style=display:flex;flex-wrap:wrap;justify-content:center>`+
					mainPlate(jId, 
						'T2-promo1',
						['T2-promo2','T2-promo3'],
						basicButton(getTrans('searchCamps'), `pageFind(${jId},0)`)+
						basicButton(getTrans('searchShows'), `pageFind(${jId},1)`)+
						basicButton(getTrans('searchPeres'), `pageFind(${jId},2)`),
						'proj.svg'
					)+
					mainPlate(jId, 
						'T1-insertAbout',
						'T1-insertHelp',
						(thisUser.ID == 0 ? basicButton(getTrans('login'), 'loginPage()')+
							basicButton(getTrans('register'), 'registerPage()') : 
							basicButton(getTrans('yourProf'), `profilePage(${jId})`)
						)
						,
						'papka.svg'
					)+
				`</div>`+
				`<div style=display:flex;flex-wrap:wrap;justify-content:center>`+
					mainPlate(jId, 
						'T3-promo1',
						'T3-promo2',
						basicButton(getTrans('vacancies'), `globalVacs(${jId})`)+
						basicButton(getTrans('guides09'), `pageWikiList(${jId})`),
						'edin.svg'
					)+
					mainPlate(jId, 
						'T4-promo1',
						'T4-promo2',
						basicButton(getTrans('aboutHelper'), `innerMain(${jId},helperAbout(${jId}))`),
						'abou.svg'
					)+
				`</div>`+
				`<div style=width:100%>`+
					`<h1${getTrans('projects')}/h1>`+
					`<div id=GDPSesPlace class=gdps-list-list>${mainPageCache.gdpses}</div>`+
					`<h1${getTrans('news')}/h1>`+
					`<div id=comments class=gdps-list-list>${mainPageCache.news}</div>`+
				`</div>`+
			`</div>`+
		`</div>`+
	`</div>`;
    return html;
},
pageFind = (jId, channel = 1) => {
    let J = Jexec(jId);
    if (J.helperFindData[3] < 0) {
		J.helperFindData[3] = J.ProjectsChannel;
		channel = J.ProjectsChannel;
	}
    J.ProjectsChannel = channel;
    let tagsDiv = '',
		TagsStr = '',
		OsStr = '',
		tags = '',
		oss = '',
		customTag = '';
    for (let num in Tags) {
		switch (num) {
			case '0':
				TagsStr = 'camp';
				OsStr = 'caOS';
				break;
			case '1':
				TagsStr = 'show';
				OsStr = 'shOS';
				break;
			case '2':
				TagsStr = 'pere';
				OsStr = 'peOS';
				break;
			case '3':
				TagsStr = 'tele';
				OsStr = 'teOS';
				break;
		}
		for (let tag in Tags[num]) {
			if (num == 2) customTag = 'Peretag'+tag;
			else customTag = '';
			tags += renderTagSearch(jId, Tags[num], TagsStr, tag, customTag);
		}
		for (let os in Os[num]) {
			if (num == 2) customTag = 'Peretag'+os;
			else customTag = '';
			oss += renderTagSearch(jId, Os[num], OsStr, os, customTag);
		}
		tagsDiv += `<div id=tags${num} ${num != channel ? 'style=display:none' : ''}>`+
		`<h3 style=margin:0${getTrans('tags0'+num)}/h3><br>`+
			`<div style=display:flex;flex-wrap:wrap class=justifyCenterIfPcLeft>`+
				tags+
			`</div><br>`+
			`<h3 style=margin:0${getTrans('os0'+num)}/h3><br>`+
			`<div style=display:flex;flex-wrap:wrap class=justifyCenterIfPcLeft>`+
				oss+
			`</div>`+
		`</div>`;
		tags = '';
		oss = '';
	}
    J.helperFindData = [3,[],[],channel];
    J.link.set('find');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div style="height:60px"></div>`+
		`<div class=mainFinder>`+
			`<div class=finder>`+
				`<div align=center class="frameprofile textCenterIfPcLeft" style=height:100%>`+
					`<h1 style="margin:0 0 var(--def-font) 0"${getTrans('finder-name')}/h1>`+
					`<h3 style=margin:0${getTrans('findByName')}/h3>`+
					`<input type=text id=gdpsNameInput class=framelabel style=width:250px;margin-top:8px${getTrans('findName', 'input')}<br><br>`+
					`<h3 style=margin:0${getTrans('finder-channel')}/h3><br>`+
					`<div style=display:flex;flex-wrap:wrap class="justifyCenterIfPcLeft widthBiggerIfPc">`+
						`<label onclick=modifyFindTags(${jId},0) id=channel0 class=${channel == 0 ? 'tagSel' : 'tagPre'}${getTrans('searchCamps')}/label>`+
						`<label onclick=modifyFindTags(${jId},1) id=channel1 class=${channel == 1 ? 'tagSel' : 'tagPre'}${getTrans('searchShows')}/label>`+
						`<label onclick=modifyFindTags(${jId},2) id=channel2 class=${channel == 2 ? 'tagSel' : 'tagPre'}${getTrans('searchPeres')}/label>`+
						`<label onclick=modifyFindTags(${jId},3) id=channel3 class=${channel == 3 ? 'tagSel' : 'tagPre'}${getTrans('searchTeles')}/label>`+
					`</div><br>`+

					tagsDiv+'<br>'+

					//`<label${getTrans('Text;Tags')}/label><br>`+
					//renderTextOrTags()+'<br><br>'+

				`</div>`+
			`</div>`+
			`<div class="finderMargin ">`+
				`<div class=justifyCenterIfPcLeft style=display:flex;flex-wrap:wrap;justify-content:center>`+
					`<label onclick=setMethod(${jId},3) id=method3 class=tagSel${getTrans('search1')}/label>`+
					`<label onclick=setMethod(${jId},0) id=method0 class=tagPre${getTrans('search4')}/label>`+
					`<label onclick=setMethod(${jId},1) id=method1 class=tagPre${getTrans('mostLike')}/label>`+
					`<label onclick=setMethod(${jId},2) id=method2 class=tagPre${getTrans('mostDisl')}/label>`+
				`</div>`+
				`<div class="gdps-list-place " id=GDPSesPlace style="margin-top:16px">`+
					J.CacheFinds[1]+
					insertBtn(jId, `sendFinder(${jId},${J.CacheFinds[3]},'${J.CacheFinds[2]}')`)+
				`</div>`+
			`</div>`+
		`</div>`+
	`</div>`;
    innerMain(jId, html);

    let startSearch = false;
    if (J.CacheFinds[1] == '')
		startSearch = true;
    if (channel !== J.CacheFinds[0])
		startSearch = true;

    if (startSearch)
		sendFinder(jId);
},
pageWikiList = jId => {
    let J = Jexec(jId);
    J.helperFindData = [0,null,null,-1];
    J.link.set('Wikis');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div style="height:60px"></div>`+
		`<div id=finder align=left class="frameprofile">`+
			`<h1 align=center>`+
				`<span${getTrans('guides09')}/span> `+
				(thisUser.ID !== 0 ? basicButton('>+<', `createWiki(${jId})`, 'font-size:calc(var(--def-font)*1.75);padding: 0 calc(var(--def-btn-size)*0.5);') : '')+
			`</h1>`+
			`<label${getTrans('findByName')}/label>:<br>`+
			`<input type=text id=gdpsNameInput class=framelabel style=width:190px${getTrans('wikiName', 'input')}<br><br>`+
		`</div>`+
		`<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
		`</div>`+
	`</div>`;
    innerMain(jId, html);
    Loading();
    _.http.req('GET', `${sData[7]}getWikis${php}`)
		.then(data=>{
			let parsedData = JSON.parse(data),
				html = renderWiki(jId, parsedData);
			innerGdpsPlace(jId, html);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
globalNews = jId => {
    let J = Jexec(jId);
    J.link.set('news');
    innerMain(jId, gdpsNewsPage(jId));
    Loading();
    _.http.req('GET', `${sData[0]}newsAll${php}?page=0`)
		.then(data => {
			Loading(1);
			if (data == '{}') {
				innerGdpsPlace(jId, `<h1${getTrans('newsNone')}/h1>`, 1);
			} else {
				let parsedData = JSON.parse(data);
				innerGdpsPlace(jId, RenderNews(jId, parsedData,0,'globalNews'));
				if (Object.keys(parsedData).length > 10)
					innerGdpsPlace(jId, insertBtn(jId, `loadGlobalNews(${jId},1)`), 1);
				let campsCount = myGdpses[0] ? Object.keys(myGdpses[0]).length : 0,
					showsCount = myGdpses[1] ? Object.keys(myGdpses[1]).length : 0,
					peresCount = myGdpses[2] ? Object.keys(myGdpses[2]).length : 0,
					telesCount = myGdpses[3] ? Object.keys(myGdpses[3]).length : 0,
					gdpssCount = campsCount + showsCount + peresCount + telesCount;
				if (gdpssCount !== 0)
					innerGdpsPlace(jId, `<div class=framegdps>`+newsWindow(jId)+`</div>`, 511);
			};
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
globalVacs = jId => {
    let J = Jexec(jId);
    let tags = '';
    for (let tag in TagsVacs) {
		tags += renderTagSearch(jId, TagsVacs, 'vacs', tag, '');
	}
    J.helperFindData = [0,[],[],-5];
    J.link.set('vacs');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div style="height:60px"></div>`+
		`<div id=finder align=left class="frameprofile">`+
			`<h1${getTrans('finder-name')}/h1>`+
			`<label${getTrans('findByName')}/label>:<br>`+
			`<input type=text id=gdpsNameInput class=framelabel style=width:250px${getTrans('findName', 'input')}<br><br>`+

			`<div id=tags>`+
				`<label${getTrans('tags00')}/label>:<br>`+
				`<div style=display:flex;flex-wrap:wrap;justify-content:center>`+
					tags+
				`</div>`+
			`</div>`+

		`</div>`+
		`<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
		`</div>`+
	`</div>`;
    innerMain(jId, html);
    Loading();
    _.http.req('GET', `${sData[8]}getAll${php}?page=0`)
		.then(data => {
			Loading(1);
			let parsedData = JSON.parse(data);
			innerGdpsPlace(jId, renderVacancy(jId, parsedData));
			if (Object.keys(parsedData).length > 8)
				innerGdpsPlace(jId, insertBtn(jId, `sendFinder(${jId},1,'method=0')`), -1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
uvazuha = jId => {
    let J = Jexec(jId);
    J.link.set('special');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div align=center>`+
			`<h1${getTrans('ojhubname')}/h1>`+
			`<h2${getTrans('special00')}/h2>`+
			`<div class=frameguide align=left>`+
				`<p>DenisC -	 <span${getTrans('special01')}/span></p>`+
				`<p>Vustur -	<span ${getTrans('special03')}/span></p>`+
				`<p>MIOBOMB -	<span${getTrans('special04')}/span></p>`+
				`<p>Qundikus - <span${getTrans('special05')}/span></p>`+
				`<p>glorius -	<span${getTrans('special09')}/span></p>`+
				`<p>M41den -	<span ${getTrans('special10')}/span></p>`+
			`</div>`+
			`<h2${getTrans('special11')}/h2>`+
			`<div class=frameguide align=left>`+
				`<p>Ikotik -	 <span${getTrans('special12')}/span></p>`+
				`<p>Олег -		 <span${getTrans('special13')}/span></p>`+
				`<p>Шаре -		 <span${getTrans('special14')}/span></p>`+
				`<h2${getTrans('special08')}/h2>`+
				`<br><br>`+
			`</div>`+
		`</div>`+
	`</div>`;
    return html;
},
helperAbout = jId => {
    let J = Jexec(jId);
    J.link.set('about');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div class=frameprofile style=text-align:left>`+
			`<h1${getTrans('aboutHelper')}/h1>`+
			`<h2${getTrans('history01')}/h2>`+
			`<p${getTrans('history02')}/p>`+
			`<p${getTrans('history03')}/p>`+
			`<button class=loginbtn onclick="innerMain(${jId},uvazuha(${jId}))"${getTrans('HLthanks')}/button>`+
			`<h2${getTrans('helperSocials')}/h2>`+
			`<a class=loginbtn href="https://t.me/objecthub" target=_blank${getTrans('helperTg')}/a> `+
			`<a class=loginbtn href="https://discord.gg/zetb62mqsS" target=_blank${getTrans('helperDs')}/a> `+
			basicButton(getTrans('news'),`helperNews(${jId},'117/',${thisUser.role})`)+
			`</div>`+
		`</div>`+
	`</div>`;
    return html;
},
helperNews = (jId, gdpsId, renderOwnButton = 0) => {
    let J = Jexec(jId);
    let backFunc = '',
			lastFunc = '',
			gdpsInt = parseInt(gdpsId),
			renderNazad = true;
    switch (gdpsId[gdpsId.length-1]) {
		case '.':
			backFunc = 'getCamp';
			lastFunc = '.';
			break;
		case ',':
			backFunc = 'getShow';
			lastFunc = ',';
			break;
		case '/':
			backFunc = 'getPere';
			lastFunc = '/';
			// renderNazad = false;
			break;
	}
    innerMain(jId, gdpsNewsPage(jId, renderNazad, gdpsId, backFunc));
    Loading();
    _.http.req('GET', `${sData[0]}news${php}?id=${gdpsInt}`)
		.then(data=>{
			J.link.set('news/list='+gdpsId+'|'+renderOwnButton);
			Loading(1);
			if (data == '{}') {
				innerGdpsPlace(jId, `<h1${getTrans('newsNone')}/h1>`, 1);
			} else {
				let parsedData = JSON.parse(data);
				innerGdpsPlace(jId, RenderNews(jId, parsedData,0,backFunc));
				if (Object.keys(parsedData).length > 10)
					innerGdpsPlace(jId, insertBtn(jId, `loadMoreNews(${jId},${gdpsInt},'${backFunc}',1)`), 1);
				if (parseInt(renderOwnButton))
					innerGdpsPlace(jId, `<div class=framegdps>`+newsWindow(jId, gdpsId)+`</div>`, 511);
			};
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
BETA_fixImg = (url)=>{
	if (!renderBeta)
		return url;

	if (url.includes('./imgs/'))
		return `.${url}`;
	else 
		return url;
},
insertBtn = (jId, lastUse, transText = 'showMore', useRemover = 1, group = '') => {
    let J = Jexec(jId);
    // кнопка "показать больше"
    return `<div ${useRemover === 1 ? 'id='+group+'nextGdps ' : ''}class=gdps-helper align=center>`+
		`<button onclick="${lastUse}" class=loginbtn `+
		`style="font-size:calc(var(--def-font)*2);padding:4px 8px;margin:12px 0"${getTrans(transText)}/button>`+
	`</div>`;
},

deviceAddForm = jId => {
    let J = Jexec(jId);
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<form class="frameprofile" method=post onsubmit="return enterFormData(${jId},this,'${sData[1]}deviceAdd${php}')">`+
			`<h1${getTrans('deviceNotTrust01')}/h1>`+
			`<p${getTrans('deviceNotTrust02')}/p>`+
			`<input type=hidden name=device value='${fp.staticName}'>`+
			`<input type=hidden name=deviceDynamic value='${fp.dynamic}'>`+
			`<input id=LGpassword class=framelabel maxlength=64 minlength=5 name=password type=password${getTrans('login02', 'input')}<br><br>`+
			`<input class=loginbtn type=submit${getTrans('submit', 'inputValue')}<br><br>`+
			`<input type=hidden name=device value="${fp.staticName}">`+
		`</form>`+
	`</div>`;
    return html;
},
otherProfile = (jId, userId, backButton, innerHtnl = otherProfileMini) => {
    let J = Jexec(jId);
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div class=frameprofile style="margin:0;height:100%">`+
			`<button style="position:absolute;top:80px;right:5px" class="contentAdaptiveSmall loginbtn" onclick="profileSwitcherPhone(${jId})">`+
				`<div style="transform:rotate(90deg)">|||</div>`+
			`</button>`+
			`<div id="phoneSelector" class=contentAdaptiveBig style="position:absolute;top:15px;width:235px" align="left">`+
				`<button class=loginbtn onclick="otherProfileMini(${jId},${userId})"${getTrans('profile')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(${jId},0,${userId})"${getTrans('searchCamps')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(${jId},1,${userId})"${getTrans('searchShows')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(${jId},2,${userId})"${getTrans('searchPeres')}/button><br><br>`+
				`<button class=loginbtn onclick="otherWikisWindow(${jId},${userId})"${getTrans('guides09')}/button><br><br>`+
				`<br><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button>`+
			`</div>`+
			`<div id="phoneSelectorSmall" class=contentAdaptiveSmall style=display:none>`+
				`<button class=loginbtn onclick="otherProfileMini(${jId},${userId});profileSwitcherPhone(${jId})"${getTrans('profile')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(${jId},0,${userId});profileSwitcherPhone(${jId})"${getTrans('searchCamps')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(${jId},1,${userId});profileSwitcherPhone(${jId})"${getTrans('searchShows')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(${jId},2,${userId});profileSwitcherPhone(${jId})"${getTrans('searchPeres')}/button><br><br>`+
				`<button class=loginbtn onclick="otherWikisWindow(${jId},${userId});profileSwitcherPhone(${jId})"${getTrans('guides09')}/button><br><br>`+
				`<br><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button>`+
			`</div>`+
			`<div class=profileMobileRightWindow id="profileWindow" align="left">`+
			`</div>`+
		`</div>`+
	`</div>`;
    innerMain(jId, html);
    innerHtnl(jId, userId);
},
// #endregion
// #region кнопки профиля (лист входов, удалить аларм и т д)
newsWindow = (jId, contentId = 0, contentType = 'c') => {
    let J = Jexec(jId);
    let gdpses = '';
    if (contentId === 0) {
		gdpses = `<select style=width:90% class=framelabel name=gdps>`;
		for (let gdpsType in myGdpses)
			for (let gdpsKey in myGdpses[gdpsType]) {
				let Gdps = myGdpses[gdpsType][gdpsKey],
					Gid = Gdps.ID,
					Gch = GDPSswitchChannel(gdpsType)[2],
					newsTitle = Gdps.title;

				gdpses += `<option value=${Gch}${Gid}>${newsTitle}</option>`
			};
		gdpses += `</select><br>`;
	} else {
		gdpses = `<input type=hidden name=gdps value=${contentType}${contentId}>`;
	}
    let html = 
	`<div id=helperContentProfile>`+
		`<h1 id=blacktext${getTrans('newPost')}/h1>`+
		`<form method=post onsubmit="return enterFormData(${jId},this,'${sData[1]}newsPost${php}')">`+
			`<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>`+
			`<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>`+
			`<progress max=1 value=0 id=newsFileProg style=display:none></progress><br>`+
			`<input name=files id=newsFiles type=file multiple><br>`+
			gdpses+
			`<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}`+
		`</form>`+
	`</div>`;
    return html;
},

// #endregion
// #region newHelper.js - окна
ADwrite = (jId, userId = '') => {
    let J = Jexec(jId);
    let anonymusSend = `<p><input type=checkbox name=anonymus> Send as Object hub</p>`;
    _.win.open('writeAlarm', 
		`<h1>Write to support</h1>`+
		`<form onsubmit="return enterFormData(${jId},this,'${sData[1]}writeAlarm${php}')">`+
			`<input name=windowId value={winId} type=hidden>`+
			`<input placeholder="userId (not username)" class=framelabel ${thisUser.role === 0 ? 'type=hidden value=0':'type=text value="'+userId+'"'} name=user><br>`+
			`<input placeholder=title class=framelabel name=title><br>`+
			`<textarea placeholder=text class=framelabel name=text></textarea><br>`+
			(thisUser.role !== 0 ? anonymusSend : '')+
			`<button onclick="_.wins['{winId}'].close()" class=loginbtn>close</button>`+
			`<input type=submit value=send class=loginbtn>`+
		`</form>`
	);
},
loginPage = ()=>{
	let id = _.win.open('logonWindow',
		`<h1${getTrans('login')}/h1>
		<input style=width:75%	id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login01', 'input')}<br><br>
		<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}
		<button class=emptybtn onclick=seePassword()>
			<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>
		</button><br><br>
		<div id={winId}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>
		<button style="width:calc(100% - 16px)" onclick="innerMain(0,dropWindow(0))" class="loginbtn"${getTrans('remindPass')}/button><br><br>
		<button style="width:calc(100% - 16px)" onclick="sendLoginForm('{winId}')" class="loginbtn"${getTrans('joinToGdps')}/button><br>
		<br><button style="width:calc(100% - 16px)" class="loginbtn" onclick="_.wins['{winId}'].close()"${getTrans('back')}/button>
		<p align=right${getTrans('helperVer')}/p>`
	, 'isloginwindow');
	if (!ignoreCap) {
		_.lazy.load('https://www.google.com/recaptcha/api.js')
			.then(()=>{
				let elemId = id.id+'cap';
				captchaLoad ? grecaptcha.render(elemId) : captchaLoad = true;
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
registerPage = ()=>{
	let id = _.win.open('logon2Window',
		`<h1${getTrans('register')}/h1>
		<input style=width:75% id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login06', 'input')}<br><br>
		<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}
		<button class=emptybtn onclick=seePassword()>
			<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>
		</button><br><br>
		<input style=width:75% id="LGemail" class="framelabel" required ${getTrans('login03', 'input')}<br><br>
		<br><button style="width:calc(100% - 16px)" class="loginbtn" onclick="_.wins['{winId}'].close();loginPage()"${getTrans('logiloginn')}/button>
		<div id={winId}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>
		<button style="width:calc(100% - 16px)" onclick="sendRegisterForm('{winId}')" class="loginbtn"${getTrans('register')}/button><br>
		<br><button style="width:calc(100% - 16px)" class="loginbtn" onclick="_.wins['{winId}'].close()"${getTrans('back')}/button>
		<p align=right${getTrans('helperVer')}/p>`
	, 'isloginwindow');
	if (!ignoreCap) {
		_.lazy.load('https://www.google.com/recaptcha/api.js')
			.then(()=>{
				let elemId = id.id+'cap';
				captchaLoad ? grecaptcha.render(elemId) : captchaLoad = true;
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
reportParser = (formObj, url)=>{
	let formData = _.form.read(formObj),
		parsedForm = new URLSearchParams(formData).toString();
	_.http.req('POST', url, parsedForm)
		.then(data=>{
			megaAlert(0, 'reported', 1000);
			_.wins[formData['windowId']].close();
			return false;
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	return false;
}
gdpsReport = (gdpsId)=>{
	_.win.open('REPform',
		`<h1${getTrans('report01')}/h1>
		<form id={winId}formREP onsubmit="return reportParser(this,'${sData[2]}reportGdps${php}')">
			<input type=hidden value="{winId}" name=windowId>
			<input name=gdps value="${gdpsId}" type=hidden>
			<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report02', 'textarea')}/textarea><br>
			<button onclick="_.$.id('{winId}formREP').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>
			<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}
		</form>`
	);
},
forumReport = (postId)=>{
	_.win.open('REPform2', 
		`<h1${getTrans('report01')}/h1>
		<form id={winId}formREP onsubmit="return reportParser(this,'${sData[2]}reportGdps${php}')">
			<input type=hidden value="{winId}REPform2" name=windowId>
			<input name=gdps value="${postId}" type=hidden>
			<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report03', 'textarea')}/textarea><br>
			<button onclick="_.$.id('{winId}formREP').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>
			<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}
		</form>`
	);
},
getConfInfo = (step = 0)=>{
	if (step == 0) {
		_.win.open('getLogin',
			`<form id={winId}formLINK method=post onsubmit="return false">
				<input class=framelabel id=LGpassword${getTrans('login02', 'input')}<br>
				<button onclick="_.$.id('{winId}formLINK').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>
				<button onclick=getConfInfo(1);_.wins[{winId}].close() class=loginbtn${getTrans('commSend')}/button>
			</form>`
		);
	} else {
		let password = _.$.id('LGpassword').value;
		Loading();
		helperRequest(`${sData[5]}getAccInfo${php}`, 'password='+password)
			.then(data=>{
				if (data == '-1') {
					megaAlert(jId, 'wrongPass');
				} else {
					let parsedData = JSON.parse(data),
						html2 = `<span${getTrans('login06')}/span>: ${parsedData[0]}<br>
						<span${getTrans('login03')}/span>: ${parsedData[1]}<br><br>
						<button onclick="_.wins['{winId}'].close()" class=loginbtn${getTrans('back')}/button>`;			
						_.win.open('getLogin2', html2);
				}
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
// #endregion
// #region свитчеры
makeSwticher = (
    jId,
    switchType = 0,
    switcherElemId = '',
    switcherHTML = '',
    innerElementId = '',
    switcherName
) => {
    let J = Jexec(jId);
    if (switchType === 0) 
		if (!J.id(switcherElemId))
			if (typeof innerElementId === 'string') {
				if (J.id(innerElementId))
					J.id(innerElementId).insertAdjacentHTML('beforeend', switcherHTML);
			} else 
				innerElementId.forEach(el => el == 'object' ? el.insertAdjacentHTML('beforeend', switcherHTML) : '');
		else
			J.id(switcherElemId).remove();
	else
		J.id(switcherElemId).remove();
    if (false)
		if (!J.id(switcherElemId)) // J.link.compile().includes('switcher='+innerElementId)
			return swtichRemove(jId, innerElementId);
		else 
			switchAdd(jId, innerElementId);
},
switchScan = (jId, name) => {
    let J = Jexec(jId);
    console.log(name);
    switch(name) {
		case 'switchHtmlLang':
			return makeSwticher(jId, 0,'switchHtmlLang2', switchLangMenu(jId), 'switchHtmlLang', 'switchLangMenu');
			break;
		case 'userSettings':
			return makeSwticher(jId, 0,'userSettings2', switchProfileSettings(jId), 'userSettings', 'switchProfileSettings');
			break;
		case 'userProjects':
			return makeSwticher(jId, 0,'userProjects2', switchProfileProjects(jId), 'userProjects', 'switchProfileProjects');
			break;
		case 'userSettingsPhone':
			return makeSwticher(jId, 0,'userSettings2', switchProfileSettings(jId), 'userSettingsPhone', 'switchProfileSettings');
			break;
		case 'userProjectsPhone':
			return makeSwticher(jId, 0,'userProjects2', switchProfileProjects(jId), 'userProjectsPhone', 'switchProfileProjects');
			break;
		default:
			return swtichRemove(jId, name);
	}
},
switchAdd = (jId, name) => {
    let J = Jexec(jId);
    J.link.add('switcher='+name);
    return false;
},
swtichRemove = (jId, name) => {
    let J = Jexec(jId);
    J.link.remove('switcher='+name);
    return false;
},

switchLangMenu = jId => {
    let J = Jexec(jId);
    // makeSwticher(jId, 0,'switchHtmlLang2', switchLangMenu(jId), 'switchHtmlLang', 'switchLangMenu')
    let preLang = '';
    langList.forEach(lang=>{
		preLang += 
		`<button onclick="_.lang.replace('${lang}').then(e=>doLangSetup(e));pushNewLang('${lang}');makeSwticher(${jId},1,'switchHtmlLang2')" style="width:40px;margin:2px" class="emptybtn">`+
			`<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
		`</button>`;
	});
    return `<div id=switchHtmlLang2 style="position:absolute;top:0px;left:48px;padding:8px;border:solid var(--color-black) 3px;border-radius:var(--def-border-small);background-color:rgba(255,255,255,.1);">`+
		preLang+
	`</div>`;
};
// #endregion
// #region девайс
class Fingerprint {
	static async generate(generateFp = '') {
		console.info('device token? '+!!generateFp);
		if (!generateFp)
			return {};
		// Постоянная часть (шифрованная строка)
		const staticName = await this.getPermanentFingerprint();

		// Временная часть (JSON строка для удобства)
		const dynamic = encodeURIComponent(JSON.stringify({
			userAgent: navigator.userAgent,
			viewport: `${window.innerWidth}x${window.innerHeight}`,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			languages: navigator.languages,
			timestamp: Date.now()
		}));

		let fpData = {
			staticName: staticName,
			dynamic: dynamic,
			urlDone: `&device=${staticName}&deviceDynamic=${dynamic}`,
			objDone: {
				device: staticName,
				deviceDynamic: dynamic
			}
		};
		_.http.defaultHeaders['device-static'] = staticName;
		fp = fpData;
		return fpData;
	}
	static async getPermanentFingerprint() {
		const components = {
			colorDepth: screen.colorDepth,
			pixelRatio: window.devicePixelRatio,
			hardwareConcurrency: navigator.hardwareConcurrency,
			deviceMemory: navigator.deviceMemory || 'unknown',
			canvas: await this.getCanvasFingerprint(),
			webgl: await this.getWebGLInfo(),
			fonts: await this.getFontsList()
		};

		const jsonString = JSON.stringify(components);
		const encoder = new TextEncoder();
		const data = encoder.encode(jsonString);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}
	static async getCanvasFingerprint() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 200;
		canvas.height = 50;
		
		ctx.textBaseline = 'top';
		ctx.font = '14px Arial';
		ctx.fillStyle = '#f60';
		ctx.fillRect(0, 0, 200, 50);
		ctx.fillStyle = '#069';
		ctx.fillText('Fingerprint @' + navigator.hardwareConcurrency, 2, 2);

		const canvas2dValue = canvas.toDataURL().substring(0, 100);
		
		canvas.width = 0;
		canvas.height = 0;
		if (canvas.parentNode)
			canvas.parentNode.removeChild(canvas);
		
		return canvas2dValue;
	}
	static async getWebGLInfo() {
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl');
			if (!gl) return 'no-webgl';
			
			const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
			return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
		} catch {
			return 'error';
		}
	}
	static async getFontsList() {
		const fonts = ['Arial', 'Times', 'Courier'];
		const available = [];
		
		for (const font of fonts) {
			if (await this.checkFont(font)) available.push(font);
		}
		
		return available;
	}
	static checkFont(font) {
		return new Promise(resolve => {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			const text = "mmmmmmmmmmlli";
			
			context.font = "50px monospace";
			const width1 = context.measureText(text).width;
			
			context.font = `50px "${font}", monospace`;
			const width2 = context.measureText(text).width;
			
			const isFontAvailable = (width1 !== width2);
			
			canvas.width = 0;
			canvas.height = 0;
			if (canvas.parentNode)
				canvas.parentNode.removeChild(canvas);
			
			resolve(isFontAvailable);
		});
	}
}
let fp = '',
// #endregion
// #region новые клиентские лайки
/* ДЛЯ НАЧАЛА стоит сказат как оно работает
 * Из-за легаси модели гдпс хелпера доставшейся ошхабу по наследству у нас нет как таковой логики в сервисе лайков. -1 это лайк а просто 1 дизлайк, почему? так удобнее удалять лайки! (это кстати помогло ошхабу очень быстро реализовать возможность удаления лайков, ну а на хелпере оно не прижилось)
 * Здесь вы увидете обычную прослойку для получения лайков из внешнего хранилища, ибо это внешнее ультракомпактное хранилище было сделано великим DenisC
*/
LIKES = {
	// каждый ключ объекта - канал, каждый канал содержит массив где минусовое число лайк а плюсовое дизлайк
	data: {
		// некоторых классов тут нет так как они будут удалены из ошхаба в ближайшем обновлении, как пример форумы, и страницы вики ибо там оно не будет нужно (максимум комменты но оно не имеет никакого отношения к сервису лайков)
		"p": new Set(), // все проекты (канал >= 0)
		"c": new Set(), // комментарии (нет это не кемпы, мио не тупи)
		"n": new Set(), // новости
		"g": new Set(), // "гайды" АКА страницы в вики
		"w": new Set(), // сами вики
		"f": new Set(), // форумы ну вроде бы
		"v": new Set(), // вакансии
	},
	chIdToStr: {
		0:	'p',
		1:	'c',
		2:	'n',
		3:	'c',
		4:	'c',
		5:	'c',
		6:	'n',
		7:	'g',
		8:	'w',
		9:	'f',
		10:	'c',
		11:	'v',
		12:	'c',
	},
	transform(ch) {
		if (ch == -3)
			return 'f';
		if (ch == -2)
			return 'g';
		if (ch == -1)
			return 'w';
		if (ch >= 0)
			return 'p';
		return ch;
	},
	get(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		if (set.has(id))
			return 1;
		if (set.has(-id))
			return -1;
		return 0;
	},
	checker(ch, preId, type) { // -1 like, 1 disl
		let channel = this.chIdToStr[ch.toString()],
			set = this.data[channel],
			id = Math.abs(preId),
			hasL = set.has(-id),
			hasD = set.has(id);

		if (hasL || hasD)
			return this.remove(channel, id);
		if (type === 1)
			this.dislAdd(channel, id);
		else 
			this.likeAdd(channel, id);
	},
	likeAdd(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		set.delete(id);
		set.add(-id);
	},
	dislAdd(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		set.delete(-id);
		set.add(id);
	},
	remove(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		set.delete(id);
		set.delete(-id);
	},
	push(channel, ids) {
		let set = this.data[channel];
		set.clear();
		for (let id of ids)
			set.add(id);
	},
	init() {
		if (!token)
			return false;
		_.http.req('GET', `${sData[2]}likesT${php}`).then(data=>{
			let parsedData = JSON.parse(data);
			for (let i in parsedData)
				if (i === 'subs')
					SUBS.init(parsedData.subs)
				else
					LIKES.push(i, parsedData[i]);
			return this.data;
		})
	}
},

sendLike = (jId, id, channel, isComm = 0) => {
    let J = Jexec(jId);
    if (thisUser.ID === 0)
		return megaAlert(jId, 'needLogin');

    Loading();
    _.http.req('POST', `${sData[1]}like${php}?ide=${id}&type=${channel}`)
		.then(data=>{
			let likeValue = JSON.parse(data),
				likePlace = 'likesCount',
				dislPlace = 'dislsCount',
				prefix = '';
			if (isComm) 
				prefix = 'Comm';
			J.id(likePlace + prefix + id).textContent = likeValue[0];
			J.id(dislPlace + prefix + id).textContent = likeValue[1];
			
			repaintLikeButton(jId, id, isComm, 1);
			LIKES.checker(channel, id, -1)
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
sendDislike = (jId, id, channel, isComm = 0) => {
    let J = Jexec(jId);
    if (thisUser.ID === 0)
		return megaAlert(jId, 'needLogin');

    Loading();
    _.http.req('POST', `${sData[1]}dislike${php}?ide=${id}&type=${channel}`)
		.then(data=>{
			let likeValue = JSON.parse(data),
				likePlace = 'likesCount',
				dislPlace = 'dislsCount',
				prefix = '';
			if (isComm) 
				prefix = 'Comm';
			J.id(likePlace + prefix + id).textContent = likeValue[0];
			J.id(dislPlace + prefix + id).textContent = likeValue[1];
			
			repaintLikeButton(jId, id, isComm, -1);
			LIKES.checker(channel, id, 1)
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
repaintLikeButton = (jId, id, isComm, liketype = 0) => {
    let J = Jexec(jId);
    let like = 'like'+id,
		disl = 'dislike'+id;
    if (isComm) {
		like = 'likeComm'+id;
		disl = 'dislikeComm'+id;
	}
    let likeElem = J.id(like),
		dislElem = J.id(disl);

    if (likeElem.style.filter == '' && dislElem.style.filter == '') {
		if (liketype == -1) {
			dislElem.setAttribute('style', likeStyle.disl);
		} else {
			likeElem.setAttribute('style', likeStyle.like);
		}
		return;
	}
    if (likeElem.style.filter != '') {
		likeElem.setAttribute('style', '');
	}
    if (dislElem.style.filter != '') {
		dislElem.setAttribute('style', '');
	}
},
// #endregion
// #region уведомления!
/*
 * Подписки!
 *
 * Я не знаю что вам сказать тут, технически они слизаны с вакансий потому что мне так удобно
 */
SUBS = {
	data: new Set(),

	has(id) {
		return this.data.has(Math.abs(id));
	},
	toggle(id) {
		id = Math.abs(id);
		if (this.data.has(id))
			this.data.delete(id);
		else
			this.data.add(id);
	},
	push(ids) {
		this.data.clear();
		for (let id of ids)
			this.data.add(id);
	},
	init(subs) {
		this.push(subs || []);
	}
},
subRespond = (jId, gdpsId) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[10]}sub${php}?id=${gdpsId}`)
		.then(data=>{
			Loading(1);
			if (data == '1') {
				megaAlert(jId, 'reported');
				let subBtn = J.id('sub'+gdpsId);
				if (subBtn) {
					subBtn.setAttribute('data-trans', 'gdpsUnsub');
					subBtn.setAttribute('onclick', `subUnrespond(${jId},${gdpsId})`);
					subBtn.textContent = getTrans('gdpsUnsub',0);
				}
			} else if (data == '-1') {
				megaAlert(jId, 'alreadySubscribed');
			} else {
				megaAlert(jId, 'error');
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
subUnrespond = (jId, gdpsId) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[10]}unsub${php}?id=${gdpsId}`)
		.then(data=>{
			Loading(1);
			if (data == '1') {
				megaAlert(jId, 'otmena');
				let subBtn = J.id('sub'+gdpsId);
				if (subBtn) {
					subBtn.setAttribute('data-trans', 'gdpsSub');
					subBtn.setAttribute('onclick', `subRespond(${jId},${gdpsId})`);
					subBtn.textContent = getTrans('gdpsSub',0);
				}
			} else if (data == '-1') {
				megaAlert(jId, 'notSubscribed');
			} else {
				megaAlert(jId, 'error');
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},

pushSubscribe = async ()=>{
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		console.warn('push не поддерживается этим браузером');
		return false;
	}

	const reg = await navigator.serviceWorker.register('/sw.js');
	await navigator.serviceWorker.ready;

	let sub = await reg.pushManager.getSubscription();

	if (!sub) {
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') {
			Slocal.set('Push', '-1');
			return false;
		}

		sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: pushUrlBase64ToUint8Array(helperVapidPublic)
		});
	}

	return pushSendToServer(sub);
},
pushSendToServer = async (sub)=>{
	let j = sub.toJSON(),
		data = `endpoint=${encodeURIComponent(j.endpoint)}&`+
				`p256dh=${encodeURIComponent(j.keys.p256dh)}&`+
				`auth=${encodeURIComponent(j.keys.auth)}`,
		res = await _.http.req('POST', `${sData[2]}sub.php`, data, urlEncoded);

	if (res !== '1') {
		console.error('push: не удалось сохранить подписку', res);
		return false;
	}

	return true;
},
pushUrlBase64ToUint8Array = (base64String)=>{
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
},
// #endregion
// #region рендер контента (шоу, кемпы)

FINDrenderMini = (jId, channel, parsedData, joinData = '') => {
    let J = Jexec(jId);
    let html = '',
		Count = 0,
		preHtml = [],
		gdpsData = null,
		TagsLocal = null,
		renderJoinLink = null,
		tagsOs = '';

    for (let Id in parsedData) {
		Count++;
		tagsOs = '';
		if (Count == 9)
			return html;

		gdpsData = parsedData[Id];

		let gText = gdpsData.text;
		try {
			gText = JSON.parse(gdpsData.text)
		} catch {}
		GdpsesShortLangs.mount(""+gdpsData.ID, gText)

		if (JSON.parse(gdpsData.tags) != null && JSON.parse(gdpsData.os) != null) {
			TagsLocal = JSON.parse(gdpsData.tags).concat(JSON.parse(gdpsData.os));
			TagsLocal.forEach(function(tag){
				tagsOs += `<div class="tag"${getTrans(toStringTAGS(channel, tag))}/div>`;
			});
		}
		renderJoinLink = gdpsData.freejoin;

		renderJoinLink = '';//renderJoinLink ? '' : `<a class="loginbtnGDPS" href="join${php}?id=${gdpsData.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`;

		preHtml = [joinData, renderJoinLink, tagsOs, 'width:300px;height:450px', channel, 0];
		html += contentRenderMinu(jId, gdpsData, preHtml);
	}
    return html;
},
renderWiki = (jId, parsedData, page = 0) => {
    let J = Jexec(jId);
    page++;
    let html = '',
		Count =	0,
		preHtml = [],
		gdpsData = null;

    for (let Id in parsedData) {
		Count++;
		if (Count == 9) {
			innerGdpsPlace(jId, insertBtn(jId, `getWikis(${jId},${page})`),-1);
			return html;
		}

		gdpsData = parsedData[Id];

		preHtml = ['', '', '', 'width:300px;height:350px', -1, 8];
		html += contentRenderMinu(jId, gdpsData, preHtml, 0, 1, 0, 0);
	}
    return html;
},

FINDrender = (jId, channel, parsedData, joinData = '') => {
    let J = Jexec(jId);
    let html = '',
		gdpsData = parsedData.gdps,
		TagsLocal = JSON.parse(gdpsData.tags),
		os = JSON.parse(gdpsData.os),
		tagsOs = '';

    switch (channel) {
		case 0:
			gdpsData.GDPSdata = ['camp','getCamp'];
			break;
		case 1:
			gdpsData.GDPSdata = ['show','getShow'];
			break;
		case 2:
			gdpsData.GDPSdata = ['pere','getPere'];
			break;
		case 3:
			gdpsData.GDPSdata = ['tele','getTele'];
			break;
	}
    gdpsData.isLiked = LIKES.get('p', gdpsData.ID);

    let gText = gdpsData.text;
    try {
		gText = JSON.parse(gdpsData.text)
	} catch {}
    GdpsesFullLangs.mount(""+gdpsData.ID, gText)

    tagsOs += '<div class="flex-row">';
    if (TagsLocal != null)
		TagsLocal.forEach(tag=>{
			tagsOs += `<div class="tag"${getTrans(toStringTAGS(channel, tag))}/div>`;
		});
    tagsOs += '</div>'+'<div class="flex-row">';
    if (os != null)
		os.forEach(tag=>{
			tagsOs += `<div class="tag"${getTrans(toStringTAGS(channel, tag))}/div>`;
		});
    tagsOs += '</div>';


    html += contentRender(jId, gdpsData, 0, 0, 0, tagsOs, 1, gdpsData.wiki, gdpsData.ID, joinData);
    return html;
},
RenderNews = (jId, data, isComm = 0, backFunc = 'getCamp', commBackFunc = '') => {
    let J = Jexec(jId);
    console.warn('renderNews Comm => '+isComm);
    if (commBackFunc == '')
		commBackFunc = backFunc;
    let html = '',
		html2 = '',
		Count = 0,
		
		gData = null,
		gdpsData = null,
		miniRenderMode = '';

    let myCampsIds = [];
    for (let gdpsType in myGdpses)
		for (let gdpsKey in myGdpses[gdpsType]) 
			if (thisUser.ID == myGdpses[gdpsType][gdpsKey].author) 
				myCampsIds.push(myGdpses[gdpsType][gdpsKey].ID);

    for (let ide in data)	{
		Count++;
		if (Count == 11) 
			return html2;

		html = '';
		gData = data[ide];
		if (Array.isArray(gData))
			gdpsData = {
				ID: gData[0],
				title: gData[1],
				text: gData[2],
				author: gData[3],
				username: gData[4],
				gdpsId: gData[5],
				gdpsTitle: gData[6],
				date: gData[7],
				likes: gData[8],
				isLiked: gData[9],
				hasFile: gData[10],
				gdpsImg: gData[11]
			};
		else 
			gdpsData = gData;
		gdpsData.isLiked = LIKES.get('n', gdpsData.ID);

		gdpsData.canDel = false;
		if (thisUser.ID == gdpsData.author || myCampsIds.includes(gdpsData.gdpsId) || thisUser.role > 0) {
			gdpsData.canDel = true;
		}

		switch (gdpsData.gdpsId[0]) {
			case 'c':
				backFunc = 'getCamp';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
			case 's':
				backFunc = 'getShow';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
			case 'p':
				backFunc = 'getPere';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
			case 't':
				backFunc = 'getTele';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
		}
		let widthCfg = [
			'',
			'',
			'style="width:calc(100% - 40px)"',
			'style="width:300px;height:350px"'
		],
		text = '';
		if (isComm == 3)
			if (gdpsData.text.length > 150)
				text = Markdown(jId, gdpsData.text.slice(0,150).trimEnd())+'...'
			else 
				text = Markdown(jId, gdpsData.text.trimEnd())
		else 
			text = Markdown(jId, gdpsData.text.trimEnd())

		html += `<div style=display:flex id=news${gdpsData.ID}>`+
		(isComm == 0 ? gdpsAvatar(gdpsData.gdpsImg,64,64,1) : '')+
		`<div class=framegdps ${widthCfg[isComm]}>`+
			`<h2 id=Ntitle${gdpsData.ID}>${gdpsData.title}</h2>`+
			`<p style="margin:0">`+
				`<button class=loginbtn onclick="${backFunc}(${jId},'${gdpsData.gdpsId}')">${gdpsData.gdpsTitle}</button>`+
				`- <button class=emptybtn onclick="otherProfile(${jId},${gdpsData.author},'${backFunc}(${jId},${gdpsData.gdpsId})')">${gdpsData.username}</button>`+
			`</p>`+
			`<p>${timeAgo(gdpsData.date)}</p>`+
			`<div id=Ntext${gdpsData.ID}>${text}</div>`+
			`<div>${gdpsData.hasFile == '' ? '' : `<img loading=lazy class=newsImage src=${helperUrl}imgs/customnews/${gdpsData.ID}.${gdpsData.hasFile}>`}</div>`+
			`<div style="margin-top:15px">`+
				`<div class="likezone">`+
					`<span class=likeplace id="likesCount${gdpsData.ID}">${gdpsData.likes[0]}</span>`+
					`<button ${gdpsData.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${jId},${gdpsData.ID},2)" class=like id=like${gdpsData.ID}></button>`+
					`<span class=likeplace id="dislsCount${gdpsData.ID}">${gdpsData.likes[1]}</span>`+
					`<button ${gdpsData.isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${jId},${gdpsData.ID},2)" class=dislike id=dislike${gdpsData.ID}></button>`+
					`<span class=likeplace id="commsCount${gdpsData.ID}">${gdpsData.likes[2]}</span>`+
					`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`+
					(isComm != 1 ?
					`<button class=loginbtn onclick=getNewsWithComments(${jId},${gdpsData.ID},${gdpsData.gdpsId},'${backFunc}','${commBackFunc}')${getTrans('comms')}/button>`
					: '')+
				`</div>`+
			`</div>`+
			// `<button onclick="gdpsReport(${reportButton})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
			//	`<img src=${helperUrl}imgs/flag.svg width=16px style=margin:0>`+
			// `</button>`+
			(gdpsData.canDel ? 
			imageButton(`${helperUrl}imgs/edit.svg`, `editNews(${jId},${gdpsData.ID},${gdpsData.gdpsId})`, `position:absolute;top:20px;right:64px`)+
			imageButton(`${helperUrl}imgs/trash.svg`, `deleteNews(${jId},${gdpsData.ID},${isComm})`, `position:absolute;top:20px;right:20px`)
			: '')+
		`</div>`+
	`</div>`;
		html2 = html2 + html;
	}
    if (html2 == '')
		return `<h1 class=contentAdaptiveBig${getTrans('newsNoneReal')}/h1>`;
    return html2;
},
renderVacancy = (jId, parsedData, isAdmin = thisUser.role, renderMethod = 'm') => {
    let J = Jexec(jId);
    let html = '',
		Count = 0,
		TagsLocal = [],
		tagsOs = '',
		adminButtons = '',
		applyBtn = '',
		title = '',
		text = '';

    for (let longId in parsedData) {
		let id = longId.slice(1);
		tagsOs = '';
		Count++;
		if (Count == 9)
			return html;

		gdpsData = parsedData[longId];
		gdpsData.isLiked = LIKES.get('v', gdpsData.ID);

		title = gdpsData.title;
		text = gdpsData.text;
		if (renderMethod == 'm')
			if (text[120])
				text += '...';
		if (gdpsData.tags && JSON.parse(gdpsData.tags) != null) {
			TagsLocal = JSON.parse(gdpsData.tags);
			TagsLocal.forEach(function(tag){
				tagsOs += `<div class="tag"${getTrans(toStringTagsVacs(tag))}/div>`;
			});
		}

		if (typeof isAdmin == 'number') {
			title += ` -`+basicButton(`>${gdpsData.gTitle}<`, `get${GDPSswitchChannel(gdpsData.gChannel)[1]}(${jId},${gdpsData.gId})`);
		}
			if (isAdmin == true) 
				adminButtons = 
					imageButton(`${helperUrl}imgs/trash.svg`, `removeVacPre(${jId},${id},${gdpsData.gId})`, 'position:absolute;top:8px;right:8px')+
					imageButton(`${helperUrl}imgs/edit.svg`, `editVacs(${jId},${gdpsData.gChannel},${gdpsData.gId},${id})`, 'position:absolute;top:8px;right:52px');

		let applyBtnStyle = 'margin:0;border-radius:0;margin-bottom:2px';
		if (renderMethod != 'm')
			applyBtnStyle = '';

		if (isAdmin == 1)
			applyBtn = basicButton(getTrans('vacResponses'), `vacResponses(${jId},${gdpsData.gChannel},${gdpsData.gId},${id})`, applyBtnStyle);
		else if (!gdpsData.isApplied) 
			applyBtn = basicButton(getTrans('vacRespond'), `vacRespond(${jId},${longId.slice(1)})`, applyBtnStyle, 'a'+id);
		else 
			applyBtn = basicButton(getTrans('vacResponded'), `vacUnrespond(${jId},${longId.slice(1)},${gdpsData.isApplied})`, applyBtnStyle, 'a'+id);

		html +=
		`<div class=framegdpsOld id=${longId} ${renderMethod == 'm' || renderMethod == 'a' ? 'style=width:330px;height:450px' : ''}>`+
			`<h2>${title}`+'</h2>'+
			(isAdmin ? adminButtons : '')+
			`<p>${text}</p>`+
			`<div ${renderMethod == 'm' || renderMethod == 'a' ? 'class=absolute' : ''} style=bottom:4px>`+
				(renderMethod == 'f' ?
					`<div class="flex-row">`+
						tagsOs+
					`</div>`
					:
					`<div class="flex-row FGDPStags absolute" style=width:100%;bottom:64px>`+
						tagsOs+
					`</div>`
				)+
				(renderMethod == 'a' ? 
				'' :
				`<div class="likezone" style=margin-left:-4px;margin-bottom:2px>`+
					`<span class=likeplace id="likesCount${id}">${gdpsData.likes[0]}</span>`+
					`<button ${gdpsData.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${jId},${id},11)" class=like id="like${id}"></button>`+
					`<span class=likeplace id="dislsCount${id}">${gdpsData.likes[1]}</span>`+
					`<button ${gdpsData.isLiked == 1 ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${jId},${id},11)" class=dislike id="dislike${id}"></button>`+
					(typeof gdpsData.likes[2] === 'undefined' ? '' : `<span class=likeplace id="commsCount${id}">${gdpsData.likes[2]}</span>`+
					`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`)+
				`</div>`
				)+
				(renderMethod != 'm' ?
					`<div class="btnszoneSearch" style=position:absolute;bottom:10px;right:18px>`+
						applyBtn+
					`</div>`
					:
					`<div class="btnszoneSearch" style=position:absolute;bottom:0;right:4px>`+
						applyBtn+
						`<button class=loginbtnGDPS style=margin:0;border-bottom-right-radius:calc(var(--def-border)*1.5) onclick="getVacsWithComments(${jId},${id})"${getTrans('comms')}/button>`+
					`</div>`
				)+
			`</div>`+
		`</div>`;
	}
    return html;
},
vacRespond = (jId, vacId) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[8]}apply${php}?id=${vacId}`)
		.then(aplId=>{
			Loading(1);
			megaAlert(jId, 'reported');
			let applyBtn = J.id('a'+vacId);
			if (applyBtn) {
				applyBtn.setAttribute('data-trans', 'vacResponded');
				applyBtn.setAttribute('onclick', `vacUnrespond(${jId},${vacId},${aplId})`);
				applyBtn.textContent = getTrans('vacResponded',0);
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
vacUnrespond = (jId, vacId, aplId) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[8]}removeApl${php}?id=${aplId}&vacId=${vacId}`)
		.then(data=>{
			Loading(1);
			megaAlert(jId, 'otmena');
			let applyBtn = J.id('a'+vacId);
			if (applyBtn) {
				applyBtn.setAttribute('data-trans', 'vacRespond');
				applyBtn.setAttribute('onclick', `vacRespond(${jId},${vacId})`);
				applyBtn.textContent = getTrans('vacRespond',0);
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
renderApplies = (jId, parsedData, backFunc, gdpsId) => {
    let J = Jexec(jId);
    let html = '',
		Count = 0,
		tagsOs = '';

    for (let Id in parsedData) {
		Count++;
		tagsOs = '';
		if (Count == 11)
			return html;

		gdpsData = parsedData[Id];
		
		html +=
		`<div class=framegdpsOld id=${Id} style=width:300px;height:450px>`+
			`<h2>${gdpsData.username} <span style=opacity:50%>userId: ${gdpsData.userId}</span></h2>`+
			`<span>${timeAgo(gdpsData.date)}</span>`+
			`<p>${gdpsData.resume.replaceAll('\\n','<br>')}</p>`+
			imageButton(`${helperUrl}imgs/trash.svg`, `removeAplPre(${jId},${Id.slice(1)},${gdpsId})`, 'position:absolute;top:8px;right:8px')+
			`<div class="flex-row FGDPStags absolute" style=bottom:4px>`+
				basicButton(getTrans('profile'), `otherProfile(${jId},${gdpsData.userId},'${backFunc}')`)+
			`</div>`+
		`</div>`;
	}
    return html;
},

renderComms = (jId, parsedData, channel = 0, dataForNextButton = '') => {
    let J = Jexec(jId);
    let commcount = 0,
		html = '',
		htmlFull = '',
		delBtn = '',
		likeChannel = 0,

		gdpsData = null,
		id = null,
		username = null,
		commText = null,
		userId = null,
		userrole = null,
		likes = null,
		date = null,
		isLiked = null,
		nameColor = null;

    switch (channel) {
		case 0:
		case 1:
			likeChannel = 3;
			break;
		case 2:
			likeChannel = 6;
			break;
		case 3:
			likeChannel = 5;
			break;
		case 4:
			likeChannel = 10;
			break;
		case 5:
			likeChannel = 12;
			break;
	}

    for (let ide in parsedData) {
		if (commcount == 10) {
			htmlFull = htmlFull + insertBtn(jId, `helperComments(${jId},${dataForNextButton})`, 'showMore', 1, 'C');
			return htmlFull;
		};
		commcount++;

		gdpsData = parsedData[ide];
		id = gdpsData[0];
		username = gdpsData[1];
		commText = gdpsData[2];
		userId = gdpsData[3];
		userrole = gdpsData[4];
		likes = gdpsData[5];
		date = gdpsData[6];
		isLiked = LIKES.get('c', id);
		switch (userrole) {
			case 0:
				nameColor = 'var(--color-white)';
				break;
			case 1:
				nameColor = 'greenyellow';
				break;
			case 2:
				nameColor = 'yellow';
				break;
			case 3:
				nameColor = '#ffcc22';
				break;
		}

		delBtn = 
		imageButton(`${helperUrl}imgs/edit.svg`, `editComm(${jId},${id},${channel})`, `position:absolute;top:20px;right:20px`)+
		imageButton(`${helperUrl}imgs/trash.svg`, `deleteComm(${jId},${id},${channel})`, `position:absolute;top:20px;right:64px`);
		
		html = 
		`<div class="framecomm" id=comm${id}>`+
			`<button style="border:none;background:none;margin:0;font-size:calc(var(--def-font)*2);color:${nameColor}"`+
			`onclick="otherProfile(${jId},${userId},Jexec(${jId}).lastUsedProfile)">${username}</button>`+
			`<p style="margin:0">${timeAgo(date)}</p>`+
			`<p id=commText${id}>${commText}</p>`+
			`<div class="likezone">`+
				`<span class=likeplace id="likesCountComm${id}">${likes[0]}</span>`+
				`<button ${isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${jId},${id},${likeChannel},1)" class=like id=likeComm${id}></button>`+
				`<span class=likeplace id="dislsCountComm${id}">${likes[1]}</span>`+
				`<button ${isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${jId},${id},${likeChannel},1)" class=dislike id=dislikeComm${id}></button>`+
			`</div>`+
			(thisUser.ID == userId || thisUser.role > 0 ? delBtn : '')+
		`</div>`;

		htmlFull = htmlFull + html;

		html = '';
	}
    if (htmlFull == '')
		return `<h1${getTrans('commsNone')}/h1>`;
    return htmlFull;
},
timeAgo = (timestamp)=>{
	let timeDiff = Math.floor((Date.now() / 1000) - timestamp);

	if (timeDiff < 60) {
		return timeDiff + getTrans('timeAgo01', 0);
	} else if (timeDiff < 3600) {
		let Minutes = Math.floor(timeDiff / 60),
			Seconds = timeDiff % 60;
		return Minutes + getTrans('timeAgo02', 0) + Seconds + getTrans('timeAgo03', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 86400) {
		let Hours = Math.floor(timeDiff / 3600),
			Minutes = Math.floor((timeDiff % 3600) / 60);
		return Hours + getTrans('timeAgo04', 0) + Minutes + getTrans('timeAgo05', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 604800) {
		let Days = Math.floor(timeDiff / 86400),
			Hours = Math.floor((timeDiff % 86400) / 3600);
		return Days + getTrans('timeAgo06', 0) + Hours + getTrans('timeAgo07', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 2592000) {
		let Weeks = Math.floor(timeDiff / 604800),
			Days = Math.floor((timeDiff % 604800) / 86400);
		return Weeks + getTrans('timeAgo08', 0) + Days + getTrans('timeAgo09', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 31536000) {
		let Months = Math.floor(timeDiff / 2592000),
			Weeks = Math.floor((timeDiff % 2592000) / 604800);
		return Months + getTrans('timeAgo10', 0) + Weeks + getTrans('timeAgo11', 0) + getTrans('timeAgo13', 0);
	} else {
		return getTrans('timeAgo12', 0);
	};
},
// #endregion
// #region прочий хлам
Loading = (stop = 0, customImg = 'src=https://objecthub.xyz/imgs/load.svg')=>{
	if (stop == 0)
		document.body.insertAdjacentHTML('beforeend',
			`<div class=ALERT id=TheLoadElem style=position:fixed;top:20%;left:50%>`+
				`<img class=Loading ${customImg}>`+
			`</div>`
		);
	else 
		if (_.$.id('TheLoadElem'))
			_.$.id('TheLoadElem').remove();
	return stop;
},

checkWikiOwn = (id)=>{
	if (wikiesMini.includes(id.toString()))
		return true;
	return false;
},

seePassword = ()=>{
	if (_.$.id('LGpassword').type == 'password') {
		_.$.id('LGpassword').type = 'text';
		_.$.id('LGbtn').src = helperUrl+'imgs/PSsee.svg';
	} else {
		_.$.id('LGpassword').type = 'password';
		_.$.id('LGbtn').src = helperUrl+'imgs/PShide.svg';
	}
},

profileSwitcherPhone = jId => {
    let J = Jexec(jId);
    let
	profileNavPhone = J.id('phoneSelectorSmall'),
	profileContent = J.id('helperContentProfile');

    if (J.headerPhoneSwitcher !== 1) {
		J.headerPhoneSwitcher = 1;
		profileNavPhone.style.display = 'grid';
		profileContent.style.display = 'none';
	} else {
		J.headerPhoneSwitcher = 0;
		profileNavPhone.style.display = 'none';
		profileContent.style.display = 'block';
	}
},
switchMobileMain = jId => {
    let J = Jexec(jId);
    let 
	helperNavPhone = J.id('helperSecond'),
	pageContent = J.id('helperContent');

    if (J.headerPhoneSwitcher !== 2) {
		J.headerPhoneSwitcher = 2;
		helperNavPhone.style.display = 'grid';
		pageContent.style.display = 'none';
	} else {
		if (J.id('phoneSelectorSmall') && J.id('phoneSelectorSmall').style.display === 'grid' && J.headerPhoneSwitcher !== 0) {
			J.headerPhoneSwitcher = 1;
			helperNavPhone.style.display = 'none';
			pageContent.style.display = 'block';
		} else {
			J.headerPhoneSwitcher = 0;
			helperNavPhone.style.display = 'none';
			pageContent.style.display = 'block';
		}
	}
},

linkCopy = (string)=>{
	navigator.clipboard.writeText(string)
		.then(()=>{})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	megaAlert(0, 'copied');
},
megaAlert = (jId, text, waitTime = 3000) => {
    let J = Jexec(jId);
    let doneText = '';
    if (!Array.isArray(text))
		doneText = getTrans(text);
	else {
		doneText = `>${text.map(el=>`<span${getTrans(el)}/span>`).join(' ')}<`;
	}
    if (text.startsWith('![]'))
		text = `<img src=${text.slice(3)}>`;
    innerMain(jId, `<div class=ALERT id=alert style=top:20%;left:50%><h1${doneText}/h1></div>`,512);
    setTimeout(()=>{
		if (_.$.id('alert'))
			_.$.id('alert').remove();
	}, waitTime);
    return false;
},
megaAlert2 = (jId, text, waitTime = 3000) => {
    let J = Jexec(jId);
    let doneText = '';
    if (!Array.isArray(text))
		doneText = text;
	else {
		doneText = `>${text.map(el=>`<span>${el}</span>`).join(' ')}<`;
	}
    if (text.startsWith('![]'))
		text = `<img src=${text.slice(3)}>`;
    innerMain(jId, `<div class=ALERT id=alert style=top:20%;left:50%><h1>${doneText}</h1></div>`,512);
    setTimeout(()=>{
		if (J.id('alert'))
			J.id('alert').remove();
	}, waitTime);
    return false;
},



enterFormData = (jId, form, sendPlace) => {
    let J = Jexec(jId);
    let FORMDATA = new FormData(form);
    params = '';

    switch (sendPlace) {
		case sData[1]+'newsPost'+php:
			let gdpsId = FORMDATA.get('gdps'),
				[ch, gdps] = [gdpsId[0], gdpsId.slice(1)];
			FORMDATA.set('ch', ch);
			FORMDATA.set('gdps', parseInt(gdps));
			break;
	}

    let postHasFiles = false;
    for (let [key, value] of FORMDATA.entries()) {
		if (value instanceof File) {
			postHasFiles = true;
			break;
		}
	}
    //if (!postHasFiles)
    //	params = new URLSearchParams(FORMDATA).toString();
    //else 
    params = FORMDATA;

    Loading();
    _.http.req('POST', sendPlace, params)
	.then(data=>{
		if (sendPlace.indexOf('?') !== -1)
			sendPlace = sendPlace.split('?')[0];
		let parsedData = '';
		Loading(1);
		switch (sendPlace) {

			case sData[1]+'forumPost'+php:
				parsedData = JSON.parse(data);
				getForumPost(jId, parsedData[0],parsedData[1]);
				_.wins[_.$.q('[forumpost]').id].close();
				break;
			case sData[1]+'newsPost'+php:
				const funcs = {
					'p': getPere,
					't': getTele,
					's': getShow,
					'c': getCamp,
				},
				ch = FORMDATA.get('ch');
				gId = FORMDATA.get('gdps');
				funcs[ch](jId, gId);
				break;
			case `${sData[1]}writeAlarm${php}`:
				_.wins[FORMDATA.get('windowId')].close();
				break;
			case `reportGdps${php}`:
				megaAlert(jId, 'reported', 1000);
				_.wins[FORMDATA.get('windowId')].close();
				break;
			case sData[1]+'newGuide'+php:
				getGuide(jId, data, FORMDATA.get('wikiId'));
				break;
			case `${sData[1]}editGuide${php}`:
				getGuide(jId, data, FORMDATA.get('wikiId'));
				break;
			case sData[1]+'newWiki'+php:
				parsedData = JSON.parse(data);
				yourWikies['w'+parsedData.ID] = parsedData;
				profilePage(jId, '');wikiControl(jId, parsedData.ID);
				break;
			case sData[1]+'editWiki'+php:
				parsedData = JSON.parse(data);
				yourWikies['w'+parsedData.ID] = parsedData;
				profilePage(jId, '');wikiControl(jId, parsedData.ID);
				break;
			case `${sData[1]}vacsAdd${php}`:
				getVacancies(jId, FORMDATA.get('channel'),FORMDATA.get('id'));
				break;
			case `${sData[1]}vacsEdit${php}`:
				if (J.id('profileWindow')) 
					getVacancies(jId, FORMDATA.get('channel'),FORMDATA.get('gdpsId'));
				else {
					_.wins[_.$.q('[vaceditadm]')?.id].close();
					globalVacs(jId);
				}
				break;
			default:
				if (data == '-1')
					return megaAlert(jId, 'wrongPass');
				let serverResp = helperInitData(jId, data);
				profilePage(jId);
		};
		return false;
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});

    return false;
},



updateFileSize = (jId, value) => {
    let J = Jexec(jId);
    J.id('fileSize').setAttribute('value', value);
    J.id('fileSizeInt').innerHTML = value;
},

checkOwn = (contentId, userId, type)=>{
	if (userId === thisUser.ID) {
		return 2;
	}

	if (type === 1) {
		let myCampsIds = [];

		for (let gdpsKey in myGdpses[0]) {
			myCampsIds.push(myGdpses[0][gdpsKey].ID);
		};
		if (myCampsIds.includes(contentId)) {
			return 1;
		}
	}
	if (type === 2) {
		let myShowsIds = [];

		for (let gdpsKey in myGdpses[1]) {
			myShowsIds.push(myGdpses[1][gdpsKey].ID);
		};
		if (myShowsIds.includes(contentId)) {
			return 1;
		}
	}
	return 0;
},

returnAllProjects = ()=>{
	let AllProjects = [];
	for (let gdpsType in myGdpses)
		for (let gdpsKey in myGdpses[gdpsType])
			AllProjects.push(myGdpses[gdpsType][gdpsKey]);
	return AllProjects;
},
returnAllWikies = ()=>{
	let AllWikies = [];
	for (let wikiId in yourWikies)
		AllWikies.push(yourWikies[wikiId]);
	return AllWikies;
},

// #endregion
// #region викифункции

Markdown = (jId, mdText, depth = 0, counter = { n: 0 }) => {
    let J = Jexec(jId);
    const ATTR_RE = /\s*\{([.\#][^\{\}]*)\}\s*$/;
    const parseBlockAttrs = (text) => {
		const m = text.match(ATTR_RE);
		if (!m) return { text, cls: '', id: '' };
		const clean = text.slice(0, m.index);
		let cls = [], id = '';
		m[1].trim().split(/\s+/).forEach(tok => {
			if (tok[0] === '.' && /^\.[a-zA-Z0-9_-]+$/.test(tok)) {
				cls.push(tok.slice(1));
			}
			else if (tok[0] === '#' && /^#[a-zA-Z0-9_-]+$/.test(tok)) {
				id = tok.slice(1);
			}
		});
		return {
			text: clean,
			cls: cls.length ? ` class="wiki-usr ${cls.join(' ')}"` : '',
			id: id ? ` id="usr-${id}"` : ''
		};
	};

    // ===== ФАЗА 1: LEXER — режем текст на блочные токены =====
    const mdLex = (mdText) => {
		mdText = mdText.replaceAll(/\r\n/g, '\n').replaceAll(/\r<br>/g, '\n');
		const lines = mdText.split('\n');
		const tokens = [];
		let i = 0;
		while (i < lines.length) {
			const line = lines[i];
			const fence = line.match(/^(~~~|```)\s*(.*)$/);
			if (fence) {
				const closer = fence[1];
				const title = fence[2];
				const body = [];
				i++;
				while (i < lines.length && !lines[i].startsWith(closer)) {
					body.push(lines[i]);
					i++;
				}
				i++;
				tokens.push({
					type: 'code',
					title: title,
					text: body.join('\n')
				});
				continue;
			}
			const h = line.match(/^(#{1,5})\s+(.*?)\s*#*$/);
			if (h) {
				tokens.push({
					type: 'h',
					depth: h[1].length,
					text: h[2]
				});
				i++;
				continue;
			}
			if (/^-{3,}$|^_{3,}$|^\*{3,}$/.test(line)) {
				tokens.push({ type: 'hr' });
				i++;
				continue;
			}
			const bq = line.match(/^(\>{1,2})\s?(.*)$/);
			if (bq) {
				tokens.push({
					type: 'quote',
					depth: bq[1].length,
					text: bq[2]
				});
				i++;
				continue;
			}
			const li = line.match(/^([*+\-]|\d+)\.\s+(.*)$/);
			if (li) {
				tokens.push({
					type: 'li',
					ordered: /^\d+$/.test(li[1]),
					text: li[2]
				});
				i++;
				continue;
			}
			if (line.trim() === '') {
				tokens.push({ type: 'space' });
				i++;
				continue;
			}
			const buf = [line];
			i++;
			while (
				i < lines.length &&
				lines[i].trim() !== '' &&
				! /^(#{1,5})\s|^(~~~|```)|^-{3,}$|^\>|^([*+\-]|\d+)\.\s/.test(lines[i])
			) {
				buf.push(lines[i]);
				i++;
			}
			tokens.push({
				type: 'p',
				text: buf.join('\n')
			});
		}
		return tokens;
	};

    // ===== инлайн-разметка внутри текста одного токена =====
    const mdInline = (text) => {
		text = text
			.replaceAll(/!\[(.*?)\]\((.*?) "(.*?)"\)/g, '<img style=max-width:100% alt="$1" src="$2" $3 />')
			.replaceAll(/!\[(.*?)\]\((.*?)\)/g, '<img style=max-width:100% alt="$1" src="$2" />')
			.replaceAll(/\[(.*?)\]\((.*?) "(.*?)"\)/g, '<a href="$2" title="$3">$1</a>')
			.replaceAll(/\<http(.*)\>/g, '<a href="http$1">http$1</a>')
			.replaceAll(/\[(.*?)\]\(\)/g, '<a href="$1">$1</a>')
			.replaceAll(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
			.replaceAll(/\[(.*?)\]\{(.*?)\}/g, `<a onclick="getCurrentGuideByTag(${jId},\'$2\')">$1</a>`)
			.replaceAll(/\*\*(.*?)\*\*/g, '<b>$1</b>')
			.replaceAll(/\*(.*?)\*/g, '<em>$1</em>')
			.replaceAll(/\_\_(.*?)\_\_/g, '<u>$1</u>')
			.replaceAll(/\_(.*?)\_/g, '<em>$1</em>')
			.replaceAll(/~~(.*?)~~/g, '<del>$1</del>')
			.replaceAll(/\^\^(.*?)\^\^/g, '<ins>$1</ins>')
			.replaceAll(/``(.*?)``/g, '<code>$1</code>')
			.replaceAll(/`(.*?)`/g, '<code>$1</code>');
		return text;
	};

    // ===== ФАЗА 2: RENDER — токены в html =====
    const mdRender = (tokens) => {
		let html = '';
		let listBuf = null;
		const flushList = () => {
			if (!listBuf) return;
			const tag = listBuf.ordered ? 'ol' : 'ul';
			html += '<' + tag + '>';
			for (let j = 0; j < listBuf.items.length; j++) {
				const a = parseBlockAttrs(listBuf.items[j]);
				html += '<li' + a.cls + a.id + '>' +
					mdInline(a.text) +
					'</li>';
			}
			html += '</' + tag + '>';
			listBuf = null;
		};
		for (let i = 0; i < tokens.length; i++) {
			const t = tokens[i];
			if (t.type !== 'li') flushList();
			if (t.type == 'code') {
				html += '<pre><code title="' + t.title + '">' +
					t.text +
					'</code></pre>';
			}
			else if (t.type == 'h') {
				const a = parseBlockAttrs(t.text);
				html += '<h' + t.depth + a.cls + a.id + '>' +
					mdInline(a.text) +
					'</h' + t.depth + '>';
			}
			else if (t.type == 'hr') {
				html += '<hr/>';
			}
			else if (t.type == 'quote') {
				const a = parseBlockAttrs(t.text);
				html += t.depth == 2
					? '<blockquote><blockquote' + a.cls + a.id + '>' +
						mdInline(a.text) +
						'</blockquote></blockquote>'
					: '<blockquote' + a.cls + a.id + '>' +
						mdInline(a.text) +
						'</blockquote>';
			}
			else if (t.type == 'li') {
				if (!listBuf || listBuf.ordered !== t.ordered) {
					flushList();
					listBuf = {
						ordered: t.ordered,
						items: []
					};
				}
				listBuf.items.push(t.text);
			}
			else if (t.type == 'space') {
				html += '<p>';
			}
			else if (t.type == 'p') {
				const a = parseBlockAttrs(t.text);
				html += '<p' + a.cls + a.id + '>' +
					mdInline(a.text)
						.replaceAll(/ +\n/g, '<br/>')
						.replaceAll('\n', '<br>') +
					'</p>';
			}
		}
		flushList();
		return html.trim();
	};

    // ===== ФАЗА 0: шаблоны =====
    const mdTemplates = (mdText) =>
		mdText.replace(
			/\{\{([^}|]+)(?:\|([^}]*))?\}\}/g,
			(match, templateName, argsStr) => {
				if (depth >= 6) {
					return '<div class="template-error">Превышена глубина вложенности шаблонов</div>';
				}
				if (counter.n >= 5000) {
					return '<div class="template-error">Превышен лимит вызовов шаблонов</div>';
				}
				try {
					// Считаем любой найденный вызов.
					counter.n++;
					templateName = templateName.trim();
					const templateFunction =
						wikiTemplates[J.globalWiki]?.[templateName] ||
						wikiTemplates[0]?.[templateName];
					if (!templateFunction) {
						return `<div class="template-missing">Шаблон "${templateName}" не найден</div>`;
					}
					let providedArgs = argsStr
						? argsStr.split('|').map(arg => arg.trim())
						: [];
					providedArgs = providedArgs.map(arg =>
						MarkdownGen2(arg, depth + 1, counter)
					);
					return templateFunction(...providedArgs);
				} catch (error) {
					return `<div class="template-error">Ошибка в шаблоне: ${error.message}</div>`;
				}
			}
		);

    mdText = mdText.replace(/\\(.)/g, (match, char) =>
		'\u0000ESC' + char.charCodeAt(0).toString(16).padStart(4, '0') + '\u0000'
	);
    mdText = mdTemplates(mdText);
    const tokens = mdLex(mdText);
    let html = mdRender(tokens);
    html = html.replace(/\u0000ESC([0-9a-fA-F]{4})\u0000/g, (m, hex) =>
		String.fromCharCode(parseInt(hex, 16))
	);
    return html;
},
// #endregion
// #region страницы в профилях
toStringRole = (id)=>{
	switch (id) {
		case 0: return getTrans('role00', 0);
		case 1: return getTrans('role01', 0);
		case 2: return getTrans('role02', 0);
		case 3: return getTrans('role03', 0);
	};
},
dropWindow = jId => {
    let J = Jexec(jId);
    _.$.qa('[isloginwindow]').forEach(el=>{
		_.wins[el.id].close();
	});
    J.link.set('drop');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div class="frameprofile" style="width:10cqw%">`+
			`<h1${getTrans('passReset')}/h1>`+
			`<input id="LGemail" class="framelabel" required ${getTrans('login05', 'input')}<br><br>`+
			`<button class=loginbtn onclick="sendDrop()"${getTrans('submit')}/button><br><br>`+
			`<button class=loginbtn onclick="profilePage(${jId})"${getTrans('back')}/button>`+
		`</div>`+
	`</div>`;
    return html;
},
verifyWindow = jId => {
    let J = Jexec(jId);
    _.$.qa('[isloginwindow]').forEach(el=>{
		_.wins[el.id].close();
	});
    J.link.set('verify');
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<div class="frameprofile" style="width:10cqw%">`+
			`<h1${getTrans('enterCode2')}/h1>`+
			`<input id="LGcode" class="framelabel" required ${getTrans('enterCode3', 'input')}<br><br>`+
			`<button class=loginbtn onclick="sendVerify()"${getTrans('submit')}/button><br><br>`+
			`<button class=loginbtn onclick="profilePage(${jId})"${getTrans('back')}/button>`+
		`</div>`+
	`</div>`;
    return html;
},
otherProfileMini = (jId, userId) => {
    let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[0]}getUser${php}?id=${userId}`)
	.then(data=>{
		let userData = JSON.parse(data);
		J.link.set('profiles='+userId, userData.username);
		let accStatus = userData.isActive ? getTrans('isActive') : getTrans('isNotact'),
			html = 
		`<div id=helperContentProfile>`+
			`<h1><span${getTrans('profile')}/span> ${userData.username}</h1>`+
			`<p><span${getTrans('profName')}/span>: ${userData.username}</p>`+
			`<p><span${getTrans('profSocials')}/span>: `+
				`<p${userData.socials == '' ? '' : ' class=framegdpsOld style="width:calc(100% - 40px)"'}>${userData.socials.replaceAll('\\n','<br>')}</p>`+
			`</p>`+
			`<p><span${getTrans('profResume')}/span>: `+
				`<p${userData.resume == '' ? '' : ' class=framegdpsOld style="width:calc(100% - 40px)"'}>${userData.resume.replaceAll('\\n','<br>')}</p>`+
			`</p>`+
			`<p><span${getTrans('profId')}/span>: ${userData.ID}</p>`+
			`<p><span${getTrans('profRole')}/span>: ${toStringRole(userData.role)}</p>`+
			`<p><span${getTrans('notProfAccs')}/span> ${userData.username} <span${accStatus}/span></p>`+
		`</div>`;
		innerProfile(jId, html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
otherFindsWindow = (jId, channel, userId) => {
    let J = Jexec(jId);
    let [smallString, bigString] = GDPSswitchChannel(channel);
    J.link.set('profiles/'+smallString+'s='+userId);
    Loading();
    _.http.req('GET', `${sData[0]}getAdded${bigString}s${php}?id=${userId}&type=${channel}`)
	.then(data=>{
		let parsedData = JSON.parse(data),
			gdpses = "";
		parsedData.forEach(gdps=>{
			if (typeof(gdps) == 'object') {
				gdpses+=FINDrenderInProfile(jId, gdps);
			};
		});
		let html =
		`<div id=helperContentProfile>`+
			`<h1><span${getTrans('search'+bigString+'s')}/span> ${parsedData[0]}</h1><br>`+
			profileContentDiv(jId)+
				gdpses+
			`</div>`+
		`</div>`;
		innerProfile(jId, html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
otherCampsWindow = (jId, userId) => {
    let J = Jexec(jId);
    otherFindsWindow(jId, 0, userId);
},
otherShowsWindow = (jId, userId) => {
    let J = Jexec(jId);
    otherFindsWindow(jId, 1, userId);
},
otherPeresWindow = (jId, userId) => {
    let J = Jexec(jId);
    otherFindsWindow(jId, 2, userId);
},
otherWikisWindow = (jId, userId) => {
    let J = Jexec(jId);
    J.link.set('profiles/wikis='+userId);
    Loading();
    _.http.req('GET', `${sData[0]}getUserGuides${php}?id=${userId}`)
	.then(data=>{
		let parsedData = JSON.parse(data),
			gdpses = "";
		parsedData.forEach(gdps=>{
			if (typeof(gdps) == 'object') {
				gdpses+=WIKIrenderInProfile(jId, gdps);
			}
		});
		let html =
		`<div id=helperContentProfile>`+
			`<h1><span${getTrans('guides09')}/span> ${parsedData[0]}</h1><br>`+
			profileContentDiv(jId)+
				gdpses+
			`</div>`+
		`</div>`;
		innerProfile(jId, html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
FINDrenderInProfile = (jId, parsedData, limit = 9, flags = []) => {
    let J = Jexec(jId);
    let html = '',
		Count = 0,

		gdpsData = null,
		thisId = null,
		title = null,
		description = null,
		userId = null,
		username = null,
		pictureLink = null,
		smallString = null,
		bigString = null,
		isWeeklyData = ['',''];

    for (let Id in parsedData) {
		Count++;
		if (Count == limit)
			return html;

		gdpsData = parsedData[Id];
		thisId = gdpsData.ID;

		let text = '';
		try {
			text = JSON.parse(gdpsData.text);
		} catch {}
		GdpsesShortLangs.mount(""+thisId, text);

		title = gdpsData.title;
		description = GdpsesShortLangs.text(""+thisId)
		userId = gdpsData.author;
		username = gdpsData.username;
		pictureLink = gdpsData.img;
		[smallString, bigString] = GDPSswitchChannel(gdpsData.channel);

		isWeeklyData = ['',''];

		html += 
		`<div class="framegdpsOld" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="g${thisId}">`+
			`${isWeeklyData[1]}`+
			`<h2 style="display:inline;margin-right:4px">${title}</h2>`+
			`<p style="display:inline;margin:0">`+
				`<span${getTrans('addedBy')}/span>:`+
				`<button onclick="otherProfile(${jId},${userId},'pageFind(${jId},${gdpsData.channel})')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
			`</p>`+
			`<div style="min-height:64px">`+
				`<img onerror="console.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=64px height=64px style="border-radius:calc(var(--def-border-small)*1.5)">`+
				`<p${description}/p>`+
				basicButton(getTrans('openGdps'), `get${bigString}(${jId},${thisId})`)+
				(flags.includes('unsub') ? basicButton(getTrans('gdpsUnsub'), `subUnrespond2(${jId},${thisId})`) : '')+
			`</div>`+
		`</div>`;
	}
    return html;
},
WIKIrenderInProfile = (jId, parsedData) => {
    let J = Jexec(jId);
    let html = '',

		gdpsData = null,
		id = null,
		guidTitle = null,
		userId = null,
		username = null,
		guidImg = null;

    for (let Id in parsedData) {

		gdpsData = parsedData[Id];
		id = gdpsData.ID;
		guidTitle = gdpsData.title;
		guidText = gdpsData.text.split('\n').join('</p><p>');
		userId = gdpsData.author;
		username = gdpsData.username;
		guidImg = gdpsData.ban;
		
		html += 
		`<div class="framegdpsOld" style="width:calc(100% - 40px);" id="${id}">`+
			`<h2 style="display:inline;margin-right:4px">${guidTitle}</h2>`+
			`<p style="display:inline;margin:0">`+
				`<span${getTrans('addedBy')}/span>:`+
				`<button onclick="otherProfile(${jId},${userId},'pageWikiList(${jId})')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
			`</p>`+
			`<div style="min-height:64px">`+
				`<img onerror="console.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(guidImg)}" width=64px height=64px style="border-radius:calc(var(--def-border-small)*1.5)">`+
				`<p>${guidText}</p>`+
				basicButton(getTrans('openGdps'), `pageGuides(${jId},${id})`)+
			`</div>`+
		`</div>`;
	}
    return html;
},
// #endregion
// #region кастомхелпер
cssRoot = document.body.style,
colorGenerator = ()=>{
	let [Sizes, Radios] = Slocal.get('ColorScheme').split('/');

	Sizes.split(',').forEach(siz=>{
		let [name,val] = siz.split('|');

		val += 'px';

		let SlocalName = 'Size' + name,
		CSSname = '--def-'+name.toLowerCase();
		setColor(CSSname, val, SlocalName);
		Slocal.set(name, val);
	});
	Radios.split(',').forEach(rad=>{
		renderSwitch(rad);
	});
	return [Sizes, Radios];
},
setColor = (name, value, SlocalValue = '')=>{
	cssRoot.setProperty(name, value);
	if (SlocalValue)
		Slocal.set(SlocalValue, value);
},
wikiApplyColor = (colorStr)=>{
	let colors = colorStr.split(','),
	colorScheme = colorStr.split(',').reduce((obj, pair) => {
		const [key, value] = pair.split('|');
		obj[key] = value;
		return obj;
	}, {});
	colors.forEach(col=>{
		let color = col.split('|'),
		nameLover = '--color-'+color[0].toLowerCase();

		if (nameLover.includes('-alpha'))
			color[1] += '99';
		setColorAlt(nameLover, color[1]);
	});
	return colorScheme;
},
setColorAlt = (name, value)=>{
	document.documentElement.style.setProperty(name, value);
},
renderSwitch = (value, set = 0)=>{
	let [Sizes, Radios] = Slocal.get('ColorScheme').split('/'),
	moreRadios = Radios.split(',');
	switch (true) {
		case value.startsWith('Text;Tags:'):
			moreRadios[0] = value;
			if (value.slice(-1) == 0) {
				setColor('--rr-tags', '100%');
				setColor('--rr-text', '0%');
			} else {
				setColor('--rr-tags', '0%');
				setColor('--rr-text', '100%');
			}
			break;
		case value.startsWith('guidFull;guidWindow:'):
			moreRadios[1] = value;
			Slocal.set('openGuidesInWindow', value.slice(-1));
			helperSettings.openGuidesInWindow = parseInt(value.slice(-1));
			break;
	}
	if (set)
		Slocal.set('ColorScheme', Sizes+'/'+moreRadios.join(','));
},
dropColorScheme = ()=>{
	let colorScheme =
		`Font|16,`+
		`Btn-size|16,`+
		`Text-indent|16,`+
		`Border-small|8,`+
		`Border|12,`+
		`Border-large|30/`+
		
		`Text;Tags:0,`+
		`guidFull;guidWindow:0`;
	Slocal.set('ColorScheme', colorScheme);

	colorGenerator();
};

if (Slocal.get('ColorVer') < 7 || !Slocal.get('ColorVer')) {
	Slocal.set('ColorVer',		 7);
	dropColorScheme();
};
colorGenerator();
// #endregion
// #region предстартовые проверки

let createBasicError = type=>{
	if (type == 0)
		document.body = null;
	else if (type == 1) {
		Loading();
		_.http.req(`${sData[2]}curl${php}`)
			.then(data=>{
				JSON.parse(data);
				Loading(1);
			})
	}
};

window.addEventListener('beforeunload', e=>{
	if (Object.keys(_.wins).length)
		e.preventDefault();
});

// #region Tampermonkey
if (!Slocal.get('Hotkeys'))
	Slocal.set('Hotkeys', `// global key
let mainHotkey = 'ControlLeft + AltLeft'

_.hotkeys

// my profile
.on(
	mainHotkey + ' + KeyQ',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage(0,'');
		innerProfile(0,gProfileMini(0));
	}
)
// my camps
.on(
	mainHotkey + ' + KeyC',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage(0,'');
		findsWindow(0,0);
	}
)

// my shows
.on(
	mainHotkey + ' + KeyS',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage(0,'');
		findsWindow(0,1);
	}
)
// my dubs
.on(
	mainHotkey + ' + KeyD',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage(0,'');
		findsWindow(0,2);
	}
)
// new post
.on(
	mainHotkey + ' + KeyN',
	()=>{
		innerProfile(0,newsWindow(0))
	}
)
// my wikis
.on(
	mainHotkey + ' + KeyW',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage(0,'');
		wikisWindow(0);
	}
)`)
new Function(Slocal.get('Hotkeys'))();
// #endregion 

// #endregion
// #region команды
let patchUrl = ()=>{
	if (_.$.q('[shell]'))
		return;
	let cmds = [];
	for (let i in _.link.commands)
		cmds.push(i);
	_.win.open('urls',
		`
		<p>Commands list:<br>
		${cmds.join(', ')}
		</p>
		<input class=framelabel id=shell value=${location.search}>
		<button class=loginbtn onclick="history.replaceState(null,null,_.$.id('shell').value);_.link.get();_.$.id('shell').value=location.search" >run</button>
		`
	, 'shell');
},
lsEdit = ()=>{
	let html = `<button onclick=lsSave() class=loginbtn>save</button>
		<div style=height:400px><table>`;
		banList = ['length','key','getItem','setItem','removeItem','clear'];
	for (let a in localStorage)
		if (!banList.includes(a))
			html +=
				`<tr>
					<td>${a}:<td>
					<td><textarea data-local="${a}" class=framelabel>${localStorage[a]}</textarea></td>
				</tr>`;
	html += `</table></div>`;
	_.win.open('lsedit',
		html
	);
},
lsSave = ()=>{
	let elems = _.$.qa('[data-local]');
	for (let a of elems)
		localStorage.setItem(a.dataset.local, a.value);
},
lsClear = ()=>{
	let banList = ['length','key','getItem','setItem','removeItem','clear','oschubUser'];
	for (let a in localStorage)
		if (!banList.includes(a))
			localStorage.removeItem(a);
	_.link.remove('lsClear');
},

// #endregion
// #region проверка здоровья
nextStep = 0,

// TODO: сделать реальные провери ошибок
heartStep = [
	/* ФОРМАТ ОШИБОК:
	 *
	 * null = всё впорядке
	 * "err" = вывести текст ошибки
	 *
	 * я вдохновился golang когда придумывал формат ошибок
	 */

	() => {
		if (typeof thisUser !== "object" || thisUser === null)
			return "thisUser isnt object"
		if (Object.keys(thisUser).length < 9)
			return "thisUser lost keys"
		return null;
	},

	() => {
		return null;
	},

],

heartBeet = ()=>{
	if (!heartStep.length)
		return;
	console.log(nextStep);
	let step = heartStep[nextStep];
	try {
		const resp = step();
		if (resp !== 0)
			_.err.log(resp)
	} catch (e) {
		_.err.log(`heartBeet error on step ${nextStep}, error:`, e)
	}
	nextStep = (nextStep + 1) % heartStep.length;
};

//setInterval(heartBeet, 1000);
// #endregion

reStart(0);
