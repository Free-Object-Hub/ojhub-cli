// ГАЙД ПО МИНИФИКАЦИИ - getElement() это обычный док гет элембуид. innerMain() это заменить весь контект внутри div id=1st

/* порядок запуска хелпера (жс):
 *  вызывается функция 'reStart()', которая вызывает 'helperRequest()' но это мелочи, она назначает глобальные переменные GDPSes и Guides
 *  если есть вход в аккаунт назначаются ещё и thisUser, myGdpses и myguides
 *  после вызывается функция 'getLink()', которая берёт в урл всё после '?' и прогоняя через себя вызывает нужные функции (например '?guides' закинет в гайды, или '?gdps=45' откроет гдпс с айди 45)
 *  после выполнения 'getLink()' хелпер готов к работе с клиентом
*/

/* Поясняю за некоторую легаси парашу - типы комментов и лайков
 * На сервере ошхаба комментарии и лайки определяются и хранятся в каналах в одной таблице, ниже приведен список какой у кого канал
 * тип контента               | лайки | комментарии | Ко-овнеры
 * Кемпы                      | 0     | 0           | 1
 * Обджект шоу                | 0     | 0           | 1
 * Страницы вики              | 7     | 2           | -
 * Вики                       | 8     | -           | 2
 * Форум посты                | 9     | 4           | -
 * Новости                    | 6     | 3           | -
 * комментарии к кемпам       | 3     | -           | -
 * комментарии к шоу          | 3     | -           | -
 * комментарии к новостям     | 4     | -           | -
 * комментарии к страницам    | 5     | -           | -
 * комментарии к форум постам | 10    | -           | -
 * Ваш контент                | 11++  | 5++         | 4++
 * 
 * !!! Типы лайков комментов прописываются через костыли в renderComms() чтобы не возникало неожиданного поведения, учтите это если реально хотите на основе newHelper.js делать сайт
 * а ещё лучше сделайте один общий тип для всех комментов чтобы не мучать себя
*/

let getElement = function(i) {
  if (!document.getElementById(i))
    Consoles.warn('Cant find element with "'+i+'" id!');
  return document.getElementById(i);
},

// #region базовые опции гдпс хелпера
ignoreCap = false,
  renderBeta = false,
  logAll = false,
  captchaLoad = false,
  techName = 'oschub942',
  Slocal = {
    get: function(name) {return localStorage.getItem(techName+name)},
    set: function(name, value) {return localStorage.setItem(techName+name, value)},
    remove: function(name) {return localStorage.removeItem(techName+name)},
  },
  Consoles = {
    error: function(data) {logAll ? console.error(data) : null},
    log: function(data) {logAll ? console.log(data) : null},
    warn: function(data) {logAll ? console.warn(data) : null},
    time: function(data) {logAll ? console.time(data) : null},
    timeEnd: function(data) {logAll ? console.timeEnd(data) : null},
  },
  scripts = [],

helperBuildNum = 104,
urlBuildNum = 133,
helperStrVer = '0.942',
helperTitleText = renderBeta ? 'ojhub-BUILD'+helperBuildNum : 'Object Hub',
currentLangVer = 1,
helperCaptchaSiteKey = '6Ldrt0grAAAAAMdteG7pq6LZ1UYeMvkElvUV7Qhx',

// Главные html теги
  helperMain = getElement('1st'),
  helperWindows = getElement('windowsXP'),
  helperHider = getElement('Professional'),
  helperIcon = link = document.querySelector("link[rel~='icon']"),
  helperTitle = document.querySelector('title'),

helperUrl = '',//'https://objecthub.xyz/',//'https://gdpshelper.xyz/',

  curlJoin = ['https://objecthub.xyz/'],
  baseApp = location.origin + location.pathname,

  sData = [
    baseApp+'server/'+urlBuildNum+'/content/',
    baseApp+'server/'+urlBuildNum+'/send/',
    baseApp+'server/'+urlBuildNum+'/',
    baseApp+'server/'+urlBuildNum+'/search/',
    baseApp+'server/'+urlBuildNum+'/delete/',
    baseApp+'server/'+urlBuildNum+'/user/',
    baseApp+'server/'+urlBuildNum+'/forum/',
    baseApp+'server/'+urlBuildNum+'/wiki/',
  ],
php = '.php',

windowsCount = 0,
guideEditorFrame = 0, // используется только в редакторе гайдов чтобы можно было удалять разделы не по порядку

errorService = {
  errors: {},
  errorCount: 0, // используется в returnError()
  errorPositionX: 24,
  errorPositionY: 72,
},

token = Slocal.get('User'), // токен юзера

globalWiki = 0,

thisUser = [
  '???', // ник
  0, // айди
  0, // роль
  0, // активирован или нет
  0, // есть ли алармы или нет
  // обычно тут временно хранится токен
],

mainLang = '', // язык, хотя вроде очевидно
servError = "\n\nADDR: \n\nSERVER RESP:\n\nxhr.response", // если 'helperRequest' вернёт ошибку, она будет записана сюда и отображена через 'returnError()'


TimeOut = [null,null], // [0] для инпута, [1] для анимаций окон (регистрация и логин)

headerPhoneSwitcher = 0, //0 - не нажимался, 1 - в профиле, 2 - в навигаторе

// универсальная функция для запросов на сервер
helperRequest = function(url, data) {
  return new Promise(function(resolve, reject) {
    let XHR = new XMLHttpRequest(),
    // убрать комментарии на случай если ваше приложение на newHelper будет использовать php-сессии или что то похожее
    //   METHOD = 'GET';
    // if (data !== '')
        METHOD = 'GET';
    if (data !== false) {
      if (Slocal.get('User')) {
        METHOD = 'POST';
        if (data !== undefined) 
          if (typeof(data) !== 'object')
            data += `&token=${token}`
          else
            data.append('token', token);
        else
          data = `token=${token}`
      } else if (data !== undefined)
        METHOD = 'POST';
    }

    XHR.open(METHOD, url);

    if (typeof(data) !== 'object') {
      XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    XHR.onreadystatechange = function() {
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
    // .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
    XHR.onerror = function() {
      servError = '';
      reject(new Error('Network error'), XHR);
    };

    if (data !== undefined) {
      XHR.send(data);
    } else {
      XHR.send();
    };
  });
},
// отображение ошибок у 'helperRequest', переменная errorService.errorCount нужна чтобы считать ошибки
returnError = function(err, addr = '') {
  errorService.errorCount++;
  if (errorService.errorCount === 1) {
    document.body.insertAdjacentHTML('beforeend',
      `<div id=errorBoxCount style=z-index:5;position:fixed;bottom:50px;left:50px;background-color:rgba(0,0,0,.5);padding:12px;border-radius:calc(var(--def-border-large)*1.5)>`+
        `<span id=errorCount style=position:absolute;right:10px;top:10px>1</span>`+
        `<button class=emptybtn onclick="for (let errId in errorService.errors) {if (!getElement('debug'+errId))renderError(errId,errorService.errors[errId])}">`+
          `<img src=${helperUrl}imgs/err.svg width=48px height=48px>`+
        `</button>`+
      `</div>`
    )
  } else {
    getElement('errorCount').innerHTML = errorService.errorCount;
  }
  renderError(errorService.errorCount, err, addr);
  errorService.errors[errorService.errorCount] = err+addr;
  if (getElement('TheLoadElem'))
    getElement('TheLoadElem').remove();
},
renderError = function(errID, errText, serverAddress = '') {
  let errInfo = 
  `LOCATION: ${location}\n`+
  `USERID: ${thisUser[1]}\n`;

  openWindow('debug'+errID,
    `<div id=debug${errID} style="width:450px;margin:0 -30px">`+
      `<p align=center style=margin:0>DEBUG INFO</p>`+
      `ERROR<br>`+
      `<div id=debugMega${errID} style=background-color:#000;overflow-y:auto;max-height:200px></div>`+
      `<br><br>`+
      `<center>`+
        `<button style=background-color:#333 onclick=reportError(${errID})>`+
          `REPORT`+
        `</button> `+
        `<button style=background-color:#333 onclick="location.reload()">`+
          `FULL RESTART`+
        `</button> `+
        `<button style=background-color:#333 onclick=reStart(1,${errID})>`+
          `RESTART`+
        `</button> `+
        `<button style=background-color:#333 onclick=linkCopy(getElement('debug${errID}').innerText)>`+
          `COPY ERROR`+
        `</button> `+
      `</center>`+
    `</div>`
  , `style=top:${errorService.errorPositionY}px;left:${errorService.errorPositionX}px`)
  getElement('debugMega'+errID).innerText = errInfo+errText+
  (serverAddress === '' ? '' : `\n${serverAddress}\n`);
  errorService.errorPositionY = errorService.errorPositionY + 24;
  if (errorService.errorPositionY > (innerHeight - 175))
    errorService.errorPositionY = 72;
  errorService.errorPositionX = errorService.errorPositionX + 24;
  if (errorService.errorPositionX > (innerWidth - 450))
    errorService.errorPositionX = 24;
},
reportError = function(errorId) {
  let text = getElement('debugMega'+errorId).innerHTML;
  Loading();
  helperRequest(`${sData[2]}reportError${php}`, 'error='+text+'\n\n'+navigator.userAgent)
    .then(function(data) {
      Loading(1);
      if (errorId !== 0) {
        if (getElement('debug'+errorId))
          closeWindow(getElement('debug'+errorId).parentElement.id);
        errorService.errors[errorId] = errorService.errors[errorService.errorCount];
        delete errorService.errors[errorService.errorCount];
        errorService.errorCount--;
        if (errorService.errorCount === 0) {
          getElement('errorBoxCount').remove();
        } else {
          getElement('errorCount').innerHTML = errorService.errorCount;
        }
      }   
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
linkActions = {
  '': function() {innerMain(pageMain())},
  list: function() {innerMain(pageList())},
  shows: function() {innerMain(pageShows())},
  en: function() {translateReplaceLang('EN',1);innerMain(pageList())},
  ru: function() {translateReplaceLang('RU',1);innerMain(pageList())},

  camp: function(campId) {getCamp(campId)},
  show: function(showId) {getShow(showId)},
  news: function(postId) {getNewsWithComments(postId.split('.')[0], postId.split('.')[1])},
  special: function() {innerMain(uvazuha())},
  about: function() {innerMain(helperAbout())},

  profile: function() {innerMain(profilePage())},
  addedCamps: function() {innerMain(profilePage(campsWindow()))},
  addedShows: function() {innerMain(profilePage(showsWindow()))},
  addedWikis: function() {innerMain(profilePage(wikisWindow()))},
  addCamp: function() {innerMain(profilePage(addCamp()))},
  editCamp: function(campId) {innerMain(profilePage(''));editCamp(campId)},
  addShow: function() {innerMain(profilePage(addShow()))},
  editShow: function(showId) {innerMain(profilePage(''));editShow(showId)},
  alarms: function() {innerMain(profilePage(alarmsWindow()));GetAlarms()},
  alarm: function(msgId) {innerMain(profilePage(alarmsWindow()));getFullAlarm(msgId)},
  profiles: function(userId) {otherProfile(userId,'innerMain(pageList())')},
  profCamps: function(userId) {otherProfile(userId,'innerMain(pageList())',otherCampsWindow)},
  profShows: function(userId) {otherProfile(userId,'innerMain(pageList())',otherShowsWindow)},
  profWikis: function(userId) {otherProfile(userId,'innerMain(pageList())',otherWikisWindow)},
  color: function() {innerMain(profilePage());clrEditPage()},
  dropcolor: function() {innerMain(profilePage());clrEditPage();dropColorScheme()},

  wikis: function() {pageWikiList()},
  wiki: function(wikiId) {pageGuides(wikiId)},
  wikiNew: function() {createWiki(1)},
  wikiEdit: function(wikiId) {editWiki(wikiId,1)},
  wikiEditor: function(wikiId) {innerMain(profilePage(''));getGuidesAdmin(wikiId)},
  wikiPage: function(guideId) {getGuide(guideId.split('.')[0],guideId.split('.')[1])},
  wikiPageNew: function(wikiId) {createGuide(wikiId,1)},
  wikiPageEdit: function(guideId) {editGuide(guideId.split('.')[0],guideId.split('.')[1],1)},

  forum: function(forumId) {openForum(forumId)},
  forumPost: function(forum) {getForumPost(forum.split('.')[0],forum.split('.')[1])},

  gdpsLog: function(gdpsId) {innerMain(profilePage(''));getJoinLog(gdpsId)},
  campOwn: function(campId) {innerMain(profilePage(''));coownersMenu(campId,0)},
  ShowOwn: function(showId) {innerMain(profilePage(''));coownersMenu(showId,1)},
  wikiOwn: function(wikiId) {innerMain(profilePage(''));coownersMenu(wikiId,2)},

  admin: function() {adminPanel()}
},
setLink = function(val, pageTitle = helperTitleText) {
  if (!ignore) {
    history.pushState(null, null, '?'+val);
    if (pageTitle)
      helperTitle.innerHTML = pageTitle;
  }
  ignore = false;
},
getLink = function() {
  let params = window.location.search
    .replace('?','')
    .split('&')
    .reduce(
      function(p,e) {
        let a = e.split('=');
        p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
        return p;
      },
      {}
    );
  Consoles.log(params);

  for (let KEY in params) {
    let VALUE = params[KEY];
    if (typeof KEY !== 'undefined') {
      if (typeof VALUE === 'undefined') {
        VALUE = thisUser[1];
      };
      try {
        linkActions[KEY](VALUE);

        renderBeta ?
        document.body.insertAdjacentHTML('beforeend', `<p style=opacity:50%;position:absolute;top:0;right:0;margin:64px data-trans="helperVer"${getTrans('helperVer')}/p>`, 1)
        : '';
      } catch (e) {
        returnError("?"+KEY+"="+VALUE+' is broken link!');
        innerMain(pageMain());
        
        renderBeta ?
        document.body.insertAdjacentHTML('beforeend', `<p style=opacity:50%;position:absolute;top:0;right:0;margin:64px data-trans="helperVer"${getTrans('helperVer')}/p>`, 1)
        : '';
      }
    };
  };
},
getLinkLegacy = function() { // Функция из GDPS Helper, устаревшая и замененная с хеша[#] на поисковые параметры[?]
  let params = window.location.hash
    .replace('#','')
    .split('&')
    .reduce(
      function(p,e) {
        let a = e.split('=');
        p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
        return p;
      },
      {}
    );
  Consoles.log(params);

  for (let KEY in params) {
    let VALUE = params[KEY];
    if (typeof KEY !== 'undefined') {
      if (typeof VALUE === 'undefined') {
        VALUE = thisUser[1];
      };
      try {
        linkActions[KEY](VALUE);
      } catch (e) {
        returnError("#"+KEY+"="+VALUE+' is broken link!');
        innerMain(pageMain());
      }
    };
  };
},
reStart = function(drop = 0, errorId = 0) {
  if (errorId !== 0) {
    if (getElement('debug'+errorId))
      closeWindow(getElement('debug'+errorId).parentElement.id);
    errorService.errors[errorId] = errorService.errors[errorService.errorCount];
    delete errorService.errors[errorService.errorCount];
    errorService.errorCount--;
    if (errorService.errorCount === 0) {
      getElement('errorBoxCount').remove();
    } else {
      getElement('errorCount').innerHTML = errorService.errorCount;
    }
  }

  innerMain('');
  // убрать комментарии на случай если ваше приложение на newHelper будет использовать php-сессии или что то похожее
  // let token = Slocal.get('User'),
  // postData = token ? 'token='+token : '';
  Loading();
  let helperInit = function() {
    helperRequest(sData[2]+'loginT'+php)
      .then(function(data) {
        let serverResp = JSON.parse(data);
		let fuckingGdpsesData = [[],[]] // кемпы и шоу раздельно
		for (let g in serverResp[2]) {
			if (g.startsWith('c'))
				fuckingGdpsesData[0].push(serverResp[2][g])
			if (g.startsWith('s'))
				fuckingGdpsesData[1].push(serverResp[2][g])
		}
        CacheCamps = fuckingGdpsesData[0];
        CacheShows = fuckingGdpsesData[1];
        CacheWikis = []; // вики нет в протоколе - игнорим
        if (Slocal.get('User')) {
          thisUser = serverResp[0];
          myCamps = [];
          myShows = [];
          myguides = [];
		for (let g in serverResp[1][0]) {
			if (g.startsWith('c'))
				myCamps.push(serverResp[1][0][g])
			if (g.startsWith('s'))
				myShows.push(serverResp[1][0][g])
		}
		  // КАКОГО ХЕРА У МЕНЯ ВИКИ В 2 РАЗНЫХ ПЕРЕМЕННЫХ АЛО?
          myguides.push(serverResp[1][2]);
          yourWikies = serverResp[1][2];
          wikiesMini = [];
          Object.keys(yourWikies).forEach(function(el) {
            wikiesMini.push(yourWikies[el][0].toString());
          });
        }
        getLink();
        helperIcon.href = 'https://objecthub.xyz/favicon.ico';
        if (Slocal.get('BetaRead') == null)
          makeBetaAlert();
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});
    if (drop !== 0) {
      ignore = true;
      translateReplaceLang('RU');
    }
  }
  if (parseInt(Slocal.get('LangVer')) !== currentLangVer) {
    loadLanguage('RU')
      .then(function() {
        helperInit();
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});
  } else {
    mainLang = JSON.parse(Slocal.get('Lang'));
    helperInit();
  }
},
// #endregion
// #region компоненты
// #region микрокомпоненты

windowButton = function(text, func = '', style = '') {
  return `<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`;
},
basicButton = function(text = '', func = '', style = '', id = '', Class = '') {
  return `<button ${id ? 'id="'+id+'"' : ''}class="loginbtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
},
emptyButton = function(text = '', func = '', style = '', id = '', Class = '') {
  return `<button ${id ? 'id="'+id+'"' : ''}class="emptybtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
},
basicInput = function(text = '', idAndName = '', style = '', Class = '') {
  return `<input ${idAndName ? `id="${idAndName}" name="${idAndName}"` : ''}class="framelabel ${Class}" style="${style}"${getTrans(text, 'input')}`;
},
radioInput = function(id = '', name = '', isChecked = 0, otnerArgs) {
  return `<input id="${id}" name="${name}" type=radio ${otnerArgs} ${isChecked ? 'checked' : ''}>`;
},

// #endregion
headerButtons = function(switcherM = 0) {
  if (switcherM === 1)
    return `<button class="headbtn" onclick="switchMobileMain();innerMain(pageMain())"${getTrans('main')}/button>`+
    `<button class="headbtn" onclick="innerMain(pageList());switchMobileMain()"${getTrans('searchCamps')}/button>`+
    `<button class="headbtn" onclick="innerMain(pageShows());switchMobileMain()"${getTrans('searchShows')}/button>`+
    `<button class="headbtn" onclick="pageWikiList();switchMobileMain()"${getTrans('guides09')}/button>`+
    `<button class="headbtn" onclick="innerMain(helperAbout());switchMobileMain()"${getTrans('aboutHelper')}/button>`;
  return `<button class="headbtn" onclick="innerMain(pageMain())"${getTrans('main')}/button>`+
  `<button class="headbtn" onclick="innerMain(pageList())"${getTrans('searchCamps')}/button>`+
  `<button class="headbtn" onclick="innerMain(pageShows())"${getTrans('searchShows')}/button>`+
  `<button class="headbtn" onclick="pageWikiList()"${getTrans('guides09')}/button>`+
  `<button class="headbtn" onclick="innerMain(helperAbout())"${getTrans('aboutHelper')}/button>`;
},
profileContentDiv = function() {
  return `<div style='display: flex; flex-direction: column; height:calc(100vh - 450px); overflow:auto' align=left>`;
},

renderTextOrTags = function() {
  let [inputs,value] = Slocal.get('ColorScheme').split('/')[2].split('|')[0].split(':'),
  checked = 0
  doneInputs = '';
  inputs.split(';').forEach(function(inp) {
    let isChecked = checked == value ? 1 : 0;
    doneInputs += radioInput(inp, inputs, isChecked, `value=${inputs}:${checked} onchange="renderSwitch(this.value,1)"`);
    checked++;
  })
  return doneInputs;
},
trtd = function(name, value) {
  return  `<tr>`+
            `<td`+
              name+
            `/td>`+
            `<td>`+
              value+
            `</td>`+
          `</tr>`;
},

likeStyle = {
  like: 'filter:drop-shadow(0 0 4px #FFC400)',
  disl: 'filter:drop-shadow(0 0 4px #FB4479)'
},
contentRender = function(
  preHtml = {
    ID: 0,
    title: '???',
    text: '???',
    likes: 0
  },
  date = 0,
  authorBtn = 1,
  likeType = 0,
  tags = '',
  specialButtons = 1,
  connectedWiki = 1,
  reportButton = '',
  joinData = '', // работает как кнопка назад в рендере новостей
  isComm = 1
 ) {
  let joinBtn = 
    `<a class=loginbtn href="join${php}?id=${preHtml.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`
  if (preHtml.links)
    if (typeof preHtml.links == 'object') {
      joinBtn = ''
      Object.keys(preHtml.links).forEach(function(l) {
        joinBtn += `<a class=loginbtn target=_blank href="join${php}?id=${preHtml.ID}&type=${l}${joinData}">${l}</a>`;
      });
    };
  let html = `<div class=framegdps ${isComm == 0 ? 'style="width:calc(100% - 40px)"' : ''}>`+
    (preHtml.img || tags ?
    `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(preHtml.img)}" width=128px height=128px style="border-radius:calc(var(--def-border)*2)">`
    : '')+
    `<h2>${preHtml.title}</h2>`+
    `<p style="margin:0">`+
    (authorBtn ?
      `<button class=loginbtn onclick="${joinData}(${preHtml.gdpsId})">${preHtml.gdpsTitle}</button>`+
      `- <button class=emptybtn onclick="otherProfile(${preHtml.author},'${joinData}(${preHtml.gdpsId})')">${preHtml.username}</button>`
    :
      `<span${getTrans('addedBy')}/span>:`+
      `<button onclick="otherProfile(${preHtml.author},'innerMain(pageList())')" style="background:0;border:0;color:var(--color-white)">${preHtml.username}</button>`
    )+
    `</p>`+
    (date ?
    `<p>${timeAgo(date)}</p>`
    : '')+
    (tags ?
    `<div class="flex-row">${tags}</div>`
    : '')+
    `<p>${Markdown(preHtml.text)}</p>`+
    `<div style="margin-top:15px">`+
      (specialButtons ?
      joinBtn+
      `<button class="loginbtn" onclick="linkCopy('https://objecthub.xyz/?camp=${preHtml.ID}')"${getTrans('getLink')}/button>`
      : '')+
      (connectedWiki ?
      `<button class=loginbtn onclick="pageGuides(${connectedWiki},\`getCamp(${preHtml.ID},'${joinData}')\`)" style="margin-top:8px"${getTrans('openConnectedWiki')}/button>`
      : '')+
      `<div class="likezone">`+
        `<span class=likeplace id="likesCount${preHtml.ID}">${preHtml.likes}</span>`+
        `<button ${preHtml.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${preHtml.ID},${likeType})" class=like id=like${preHtml.ID}></button>`+
        `<button ${preHtml.isLiked == 1  ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${preHtml.ID},${likeType})" class=dislike id=dislike${preHtml.ID}></button>`+
        (isComm == 0 ?
        `<button class=loginbtn onclick=getNewsWithComments(${preHtml.ID},${preHtml.gdpsId.slice(1)},'${joinData}')${getTrans('comms')}/button>`
        : '')+
      `</div>`+
    `</div>`+
    (reportButton ?
    `<button onclick="gdpsReport(${reportButton})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
      `<img src=${helperUrl}imgs/flag.svg width=16px style=margin:0>`+
    `</button>`
    : '')+
    (preHtml.canDel ? 
    `<button onclick="deleteNews(${preHtml.ID},${isComm})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
      `<img style=margin:0 width=24px src="${helperUrl}imgs/trash.svg">`+
    `</button>`
    : '')+
  `</div>`;
  return html;
},
contentRenderMinu = function(
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
  let imgClass = ['', ''],
  contentId = data.ID;
  if (renderImage == 1) {
    imgClass = ['FGDPSimg', 'FGDPSdemo']
  }

  let btnFuncs = [];

  switch (preHtml[4]) {
    case 0:
      btnFuncs = ['getCamp', 'innerMain(pageList())', 'c'];
      break;
    case 1:
      btnFuncs = ['getShow', 'innerMain(pageShow())', 's'];
      break;
    case 2:
      btnFuncs = ['pageGuides', 'pageWikiList()', 'w'];
      break;
    case 3:
      btnFuncs = ['getGuide', 'pageGuides()', 'g'];
      break;
    case 4: 
      btnFuncs = ['getForumPost', 'openForum('+preHtml[0]+')', 'f'];
      break;
  };
  if (data.mainWiki) {
    contentId = data.mainWiki;
    btnFuncs[0] = 'getGuide';
    preHtml[0] = data.ID;
  };

  let 
  banWidth = parseInt(preHtml[3].split(';')[0].split(':')[1]) + 16,
  banHeight = Math.round(banWidth * 0.4166),
  darkZoneMargin = banHeight - 60,
  html =
  `<div class="framegdps" styling="${btnFuncs[2]}${data.ID}" style="${preHtml[3]}">`+
    (renderImage ? `<div class=loh style="min-height:128px">` : '')+
      `<h2 style=width:290px${renderImage ? '' : ';margin-top:'+(banHeight - 35)+'px;position:inherit;z-index:1'}>${data.title}`+(data.language ? `<img class=FGDPSimg style=margin-left:4px src="${helperUrl}imgs/${data.language}.png">` : '')+`</h2>`+
      (renderAuthor ? `<p style="margin:0">`+
        `<span${getTrans('addedBy')}/span>:`+
        `<button onclick="otherProfile(${data.author},'${btnFuncs[1]}')" style="background:0;border:0;color:var(--color-white)">${data.username}</button>`+
      `</p>` : '')+
      (renderImage ? `<img onerror="Consoles.warn('broken link ${decodeURIComponent(data.img)}');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(data.img)}" width=128px height=128px style="border-radius:calc(var(--def-border)*2)">`+
    `</div>` : '')+
    
    `<img class="${imgClass[0]}" id="guideimg" style=width:${banWidth}px;height:${banHeight}px src="${decodeURIComponent(data.ban)}" onerror="Consoles.warn('broken link ${decodeURIComponent(data.ban)}');this.src='${helperUrl}imgs/hubemp.png'">`+
    `<div class="${imgClass[1]} gdpsalpha" styleng="${btnFuncs[2]}${data.ID}" style="width:${banWidth}px;height:60px;margin-top:${darkZoneMargin}px"></div>`+

    `<div style=position:absolute;bottom:0;width:100%>`+
      `<div class="likezone" style=margin-left:-4px;margin-bottom:6px>`+
        `<span class=likeplace id="likesCount${data.ID}">${data.likes}</span>`+
        `<button ${data.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${data.ID},${preHtml[5]})" class=like id="like${data.ID}"></button>`+
        `<button ${data.isLiked == 1  ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${data.ID},${preHtml[5]})" class=dislike id="dislike${data.ID}"></button>`+
      `</div>`+
      `<div class="btnszone" style=position:absolute;bottom:0;right:16px>`+
        preHtml[1]+
        `<button class=loginbtnGDPS style=margin-left:-2px;border-bottom-right-radius:calc(var(--def-border)*1.5) onclick="${btnFuncs[0]}(${contentId}${preHtml[0] ? `,'${preHtml[0]}'` : ''})"${getTrans('moreInfo')}/button>`+
      `</div>`+
    `</div>`+
    (renderDesc ? `<p ${renderImage ? 'class="FGDPStext absolute"' : ''} ${renderImage ? 'style="margin:0"' : ''}>${data.text}${data.text[120] === undefined ? '' : '...'}</p>` : '')+
    (renderTags ? `<div class="flex-row FGDPStags absolute">${preHtml[2]}</div>` : '')+
  `</div>`;
  return html;
},
contentSendCommForm = function(sendCommData) {
  if (sendCommData != '' && thisUser[3] === 1)
   return `<div class="framecomm">`+
        `<input type="text" class="framelabel" id="text" style="width:calc(100% - 16px)" required minlength=10${getTrans('min10chars', 'input')}<br>`+
        `<button class="loginbtn" onclick="sendComm(${sendCommData})" id="commentBtn"${getTrans('commSend')}/button>`+
      `</div>`;
  return '';
},

GDPStags = {
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
GDPSoss = {
  '11': 'Camptag11',
  '12': 'Camptag12',
  '13': 'Camptag13',
  '14': 'Camptag14',
  '15': 'Camptag15',
},
SHOWtags = {
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
SHOWoss = {
  '12': 'Showtag12',
  '13': 'Showtag13',
  '14': 'Showtag14',
  '15': 'Showtag15',
},

renderTagSearch = function(Array, Class, id) {
  let tagName = Array[id];
  return `<label class="tagUns" onclick="writeTag('${Class}',${id})" id=${tagName}${getTrans(tagName)}/label>`;
},
renderTagAdding = function(Array, Class, id, checked = '') {
  let tagName = Array[id];
  let html = `<input id=T${id} style=display:none name=${Class}[] type=checkbox${checked} value=${id}>`+
  `<label class=tagUns for=T${id} value=${id}${getTrans(tagName)}/label>`;
  return html;
},

// #endregion
// #region поиск + контент(открытие кемпов вики форумов и т д)

// две переменные ниже работают с функциями HELPERFIND_REGION
helperFindData = [0,[],[],0],// нулевой это метод поиска, первый просто теги, второй платформы, третий это канал

// переменные для кеша в поиске
CacheCamps = [],
CacheShows = [],
CacheWikis = [],

// переменные для кеша в профилях
myCamps = [],
myShows = [],
myguides = [],
yourWikies = [],
wikiesMini = [],

// кеш переменные админ панели, при вызове 'adminPanel()' в них вставляется ответ из 'helperRequest()', потом рендерится
ADgdpses = [],
ADtextures = [],
ADguides = [],

ignore = false, // работает с функцией 'setLink', если true то сохранение состояния в истории вкладок не будет

lastUsedProfile = "getCamp(45)", // переход в профиле

writeTag = function(type,tag) {
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
  };
  if (!helperFindData[INDEX].includes(tag)) {
    Consoles.log(elemId+tag);
    getElement(elemId+tag).setAttribute('class','tagSel');
    helperFindData[INDEX].push(tag);
  } else {
    getElement(elemId+tag).setAttribute('class','tagUns');
    let tagPlace = helperFindData[INDEX].indexOf(tag);
    if (tagPlace !== -1) {
      helperFindData[INDEX].splice(tagPlace, 1);
    }
  }
  helperFindData[INDEX].sort(function(a,b) {return a-b});
  sendFinder();
},
setMethod = function(Method) {
  getElement('method'+helperFindData[0]).setAttribute('class','tagPre');
  helperFindData[0] = Method;
  getElement('method'+helperFindData[0]).setAttribute('class','tagSel');
  sendFinder();
},
sendFinder = function(page = 0, zapros = '') {
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  if (zapros === '') {
    zapros = 'method='+helperFindData[0];
    let enteredName = getElement('gdpsNameInput').value;
    if (enteredName != '')
      zapros += '&name='+enteredName;
    if (helperFindData[1] !== null) {
      helperFindData[1].forEach(function(tag) {
        zapros += '&tags[]='+tag;
      });

      helperFindData[2].forEach(function(os) {
        zapros += '&os[]='+os;
      });
    }
  }

  Loading();
  helperRequest(`${sData[3]}new${php}?${zapros}&page=${page}&channel=${helperFindData[3]}`)
    .then(function(data) {
      let GDPSES = JSON.parse(data),
        page2 = page + 1,
        nextBtn = `sendFinder(${page2},'${zapros}')`,

        Count = Object.keys(GDPSES).length;
      switch (helperFindData[3]) {
        case 0:
          innerGdpsPlace(GDPSrenderMini(GDPSES), page);
          break;
        case 1:
          innerGdpsPlace(SHOWrenderMini(GDPSES), page);
          break;
        case 2:
          innerGdpsPlace(renderWiki(GDPSES), page);
          break;
      }

      if (Count >= 9 && helperFindData[3] !== 2)
        innerGdpsPlace(insertBtn(nextBtn),-1);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
helperComments = function(postId, contentType, commPage = 0) {
  getElement('nextGdps').remove();
  let dataForNextButton = `${postId},'${contentType}',${parseInt(commPage + 1)}`;
  Loading();
  helperRequest(`${sData[0]}fetchComms${php}?id=${postId}&type=${contentType}&page=${commPage}`)
    .then(function(data) {
      let serverResp = JSON.parse(data);
      innerComments(renderComms(serverResp, contentType, dataForNextButton), 1);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},

getCamp = function(id, joinData = 0) {
  setLink('camp='+id);
  lastUsedProfile = "getCamp("+id+")";
  contentPreload(`${id},1`, 'innerMain(pageList())');

  Loading();
  helperRequest(`${sData[0]}camp${php}?id=${id}`)
    .then(function(data) {
      if (data == '["NONE"]') {
        innerMain(pageList());
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      let dataForNextButton = `${id},0,1`,
        serverResp = JSON.parse(data),
        html = '';

      if (joinData !== 0)
        html = GDPSrender(serverResp, joinData);
      else 
        html = GDPSrender(serverResp);

      innerComments(renderComms(serverResp.comments, 0, dataForNextButton), 0);
      getElement('news').innerHTML = RenderNews(serverResp.news,0,'mini','getCamp');
      getElement('imageBG').src = BETA_fixImg(decodeURIComponent(serverResp.gdps.ban));
      if (checkOwn(id, serverResp.gdps.author, 1))
        getElement('news').insertAdjacentHTML('afterbegin', `<div class=framegdpsOld style="width:calc(100% - 40px)">`+newsWindow(id,'c')+`</div>`);
      
      getElement('insertable').innerHTML = html;
      setImgSize();
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getShow = function(id, joinData = 0) {
  setLink('show='+id);
  lastUsedProfile = "getShow("+id+")";
  contentPreload(`${id},1`, 'innerMain(pageShows())');

  Loading();
  helperRequest(`${sData[0]}camp${php}?id=${id}`)
    .then(function(data) {
      if (data == '["NONE"]') {
        innerMain(pageShows());
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      let dataForNextButton = `${id},1,1`,
        serverResp = JSON.parse(data),
        html = '';

      if (joinData !== 0)
        html = SHOWrender(serverResp, joinData);
      else 
        html = SHOWrender(serverResp);

      innerComments(renderComms(serverResp.comments, 0, dataForNextButton), 0);
      getElement('news').innerHTML = RenderNews(serverResp.news,0,'mini','getShow');
      getElement('imageBG').src = BETA_fixImg(decodeURIComponent(serverResp.gdps.ban));
      if (checkOwn(id, serverResp.gdps.author, 2))
        getElement('news').insertAdjacentHTML('afterbegin', `<div class=framegdpsOld style="width:calc(100% - 40px)">`+newsWindow(id,'s')+`</div>`);
      
      getElement('insertable').innerHTML = html;
      setImgSize();
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getNewsWithComments = function(newsId, contentId = 0, backFunc = '') {
  setLink('news='+newsId+'.'+contentId);
  lastUsedProfile = "getNewsWithComments("+newsId+","+contentId+")";
  contentPreload(`${newsId},3`, `${backFunc}(${contentId})`, 0, 0);

  Loading();
  helperRequest(`${sData[0]}newsC${php}?id=${newsId}`)
    .then(function(data) {
      if (data == '["NONE"]') {
        innerMain(pageList());
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      let dataForNextButton = `${newsId},3,1`,
        serverResp = JSON.parse(data),
        html = '';
        
      html = RenderNews(serverResp.gdps,1,'mega',backFunc);

      innerComments(renderComms(serverResp.comments, 3, dataForNextButton), 0);
      getElement('insertable').innerHTML = html;
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getGuides = function(wikiId, page) {
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  Loading();
  helperRequest(`${sData[7]}getGuides${php}?wiki=${wikiId}&page=${page}`)
    .then(function(data) {
      let parsedData = JSON.parse(data),
        page2 = page++,
        html = renderGuideMini(parsedData, page2);
      innerGdpsPlace(html,1);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getWikis = function(page) {
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  Loading();
  helperRequest(`${sData[7]}getWikis${php}?page=${page}`)
    .then(function(data) {
      let parsedData = JSON.parse(data),
        page2 = page++,
        html = renderWiki(parsedData, page2);
      innerGdpsPlace(html,1);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getGuide = function(id, wikiId = 0) {
  globalWiki = wikiId;
  let html = pHeader()+
    `<div id=helperContent>`+
      `<h1 id=title></h1>`+
      `<div id=texts></div>`+
      `<div id=innerEDIT class=gdps-forum><button class=loginbtn onclick="pageGuides(${wikiId})"${getTrans('back')}/button></div>`+
      `<div align=center style="margin:8px">`+
        contentSendCommForm(id+',2')+
        `<div id=comments>`+
        `</div>`+
      `</div>`+
    `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[7]}getGuide${php}?id=${id}&wiki=${wikiId}`)
    .then(function(data) {
      if (data == '["NONE"]') {
        gGuides();
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      setLink('wikiPage='+id+'.'+wikiId);
      let parsedData = JSON.parse(data),
        guideinfo = parsedData['guideinfo'],
        guidedata = parsedData['guidedata'],
        comments = parsedData['comments'],
        html = '';
      getElement('title').innerHTML = guideinfo[1];
      if (guideinfo[3])
        getElement('title').insertAdjacentHTML('afterend', guideinfo[2]);

      guidedata.forEach(function(div) {
        let content = '';
        switch (div[0]) {
          case 'MediaRender':
            content = MediaRender(div[1]);
            break;
          case 'wikiText':
            content = wikiText(div[1]);
            break;
          default :
          case 'Markdown':
            content = Markdown(div[1]);
            break;
        }
        html +=
        `<div class=frameguide>`+
          //`<h2>${div[0]}</h2>`+
          content+
        `</div><br>`;
      });
      html += guideinfo[2];

      getElement('texts').innerHTML = html;

      getElement('comments')
        .insertAdjacentHTML('beforeend',
          renderComms(comments,2,`${id},2,1`)
        );
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getCurrentGuideByTag = function(guideId) {
  getGuide(guideId, globalWiki);
},
openForum = function(forumId) {
  contentPreload('', '', 0, 0);
  Loading();
  helperRequest(`${sData[6]}getPosts${php}?id=${forumId}`)
    .then(function(data) {
      setLink('forum='+forumId);
      Loading(1);

      let parsedData = JSON.parse(data),
        html = forumRenderMini(parsedData);

      innerGdpsPlace(html);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getForumPost = function(forumId, postId) {
  setLink('news='+forumId+'.'+postId);
  lastUsedProfile = "getNewsWithComments("+forumId+","+postId+")";
  contentPreload(`${postId},4`, `openForum(${forumId})`, 0, 0);

  Loading();
  helperRequest(`${sData[6]}getPost${php}?id=${postId}`)
    .then(function(data) {
      if (data == '["NONE"]') {
        innerMain(pageList());
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      setLink('forumPost='+forumId+'.'+postId);
      let dataForNextButton = `${postId},4,1`,
        serverResp = JSON.parse(data),
        html = '';

      html = forumRender(serverResp.post);

      innerComments(renderComms(serverResp.comments, 4, dataForNextButton), 0);
      getElement('insertable').innerHTML = html;
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
// #endregion
// #region перевод "Налету", пожалуйста, не трогайте то что есть, я уже не помню за что какое значение отвечает
translateData = {
},
langList = ['RU', 'EN', 'JJ'],
getTrans = function(id, renderType = 'text') {
  let getText = mainLang[id];
  if (getText == undefined)
    getText = `<code>getTrans('${id}','${renderType}')</code>`;
  if (id == '')
    getText = '';
  try {
    switch (renderType) {
      case 'text':        return ` data-trans="${id}">${getText}<`;
      case 'textButton':  return ` data-trans="${id}">${getText}`;
      case 'input':       return ` data-trans="${id}" placeholder="${getText}">`;
      case 'inputValue':  return ` data-trans="${id}" value="${getText}">`;
      case 'textarea':    return ` data-trans="${id}" placeholder="${getText}"><`;
      case 'img':         return ` data-trans="${id}" src="${getText}"`;
      default:            return getText;
    }
  } catch (err) {
    returnError(err);
    return id;
  }
},
translateReplaceLang = function(lang) {
  loadLanguage(lang)
    .then(function(data) {
      console.time(this);
      let dataTrans = document.querySelectorAll('[data-trans]');
      for (let el of dataTrans) {
        let key = el.getAttribute('data-trans');
      
        switch (el.tagName) {
          case 'IMG':
            el.setAttribute('src', mainLang[key]);
            break;
          case 'INPUT':
          case 'TEXTAREA':
            el.src = mainLang[key];
            break;
          default:
            el.innerHTML = mainLang[key];
        }
      }
      console.timeEnd(this);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});
},
loadLanguage = function(name, autosetup = true) {
  return new Promise(function(resolve, reject) {
    Loading(0,0);
    helperRequest(`/cli/${helperStrVer}/langs/${name}.json`, false)
      .then(function(data) {

        let newData = data
          .replace('+helperStrVer+', helperStrVer)
          .replace('+helperBuildNum+', helperBuildNum)
          .replace('+helperUrl+', helperUrl);

        if (autosetup) {
          Slocal.set('Lang', newData);
          Slocal.set('LangVer', currentLangVer);
          mainLang = JSON.parse(newData);
        }
        resolve(newData);
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e);reject(e)});
  })
},
translateReplaceLangLegacy = function(lang) {
  Consoles.time(helperBuildNum);
  mainLang = lang;
  Slocal.set('Lang', lang);
  document.querySelectorAll('[data-trans]').forEach(function(el) {
    let KEY = el.getAttribute('data-trans');
    switch (el.tagName) {
      case 'IMG':         el.src = translateData[lang][KEY];            break;
      case 'INPUT':
      case 'TEXTAREA':      el.setAttribute('placeholder', translateData[lang][KEY]); break;
      default:          el.innerHTML = translateData[lang][KEY];          break;
    }
  });
  Consoles.timeEnd(helperBuildNum);
},
// #endregion
// #region вставка в разные куски страницы, функция innerMain упомянута тут, за остальные поясню ниже
innerMain = function(textContent, insertType = 0) {
  if (!helperMain) 
    return new Error('Cant find main helper ("1st") element! Maybe you broken helperApp?');
  if (insertType == 0) 
    helperMain.innerHTML = textContent;
  else 
    helperMain.insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в правую половину окна профилей, для телефонов замена всего экрана
innerProfile = function(textContent) {
  if (getElement('profileWindow')) 
    getElement('profileWindow').innerHTML = textContent;
  else 
    return new Error('Cant find "profileWindow" element!');
},
// вставка контента под рамкой поиска
innerGdpsPlace = function(textContent, insertType = 0) {
  if (!getElement('GDPSesPlace')) 
    return new Error('Cant find "GDPSesPlace" element!');

  if (insertType == 0) // профили
    getElement('GDPSesPlace').innerHTML = textContent;
  else if (insertType == 512)
    getElement('GDPSesPlace').insertAdjacentHTML('beforebegin', textContent);
  else if (insertType >= 1) // в поиске устарел
    getElement('GDPSesPlace').insertAdjacentHTML('beforeend', textContent);
  else // в поиске но лучще это
    getElement('GDPSesPlace').insertAdjacentHTML('afterend', textContent);
},
// вставка контента в рамку комментариев, прошу обратить внимание ибо у гдпсов она справа, а у гайдов и текстур заполняет весь экран
innerComments = function(textContent, insertType = 0) {
  if (!getElement('comments')) 
    return new Error('Cant find "comments" element!');
  if (insertType == 0) // при рендере гдпса
    getElement('comments').innerHTML = textContent;
  else 
    // а эт вроде когда "показать больше"
    getElement('comments').insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в рамку гайдов, как попало если что
innerGuides = function(textContent, insertType = 0) {
  if (!getElement('guidesPlace')) 
    return new Error('Cant find "guidesPlace" element!');
  if (insertType == 0)
    getElement('guidesPlace').insertAdjacentHTML('beforeend',textContent);
  else 
    getElement('guidesPlace').insertAdjacentHTML('afterend',textContent);
},
// #endregion
// #region разные формы
sendRegisterForm = function(wId) {
  let username = getElement('LGusername').value,
    password = getElement('LGpassword').value,
    email  = getElement('LGemail'   ).value,
    reCAPdatas = document.getElementsByClassName('g-recaptcha-response');
    reCAP = reCAPdatas[reCAPdatas.length-1].value;
    //hcaptcha = getElement(wId+'cap').getAttribute('data-hcaptcha-response');
  if (reCAP || ignoreCap) {
    Loading();
    helperRequest(
      `${sData[5]}register${php}`,
      `username=${username}&password=${password}&email=${email}`+
      `&g-recaptcha-response=${reCAP}`
    )
      .then(function(data) {
        switch (data) {
          case '-1':
            megaAlert('loginClaimed');
            break;
          case '-2':
            megaAlert('captchaDed');
            break;
          default:
            let serverResp = JSON.parse(data);
            CacheCamps = serverResp[1];
            CacheShows = serverResp[2];
            CacheWikis = serverResp[3];
            thisUser = serverResp[0];
            myCamps = [];
            myShows = [];
            myguides = [];
            myCamps.push(serverResp[3][0]);
            myShows.push(serverResp[3][1]);
            myguides.push(serverResp[3][2]);
            token = thisUser[5];
            Slocal.set('User', token);
            thisUser.pop();

            getElement('regBtn').remove();
            getElement('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser[0]}</span>`;

            if (getElement('regBtn2')) {
              getElement('regBtn2').innerHTML = getTrans('logout', 0);
              getElement('regBtn2').setAttribute('data-trans', 'logout');
              getElement('regBtn2').setAttribute('onclick', 'gLogout()');
            }
            if (getElement('btnLogin2')) {
              getElement('btnLogin2').innerHTML = thisUser[0];
              getElement('btnLogin2').removeAttribute('data-trans');
              getElement('btnLogin2').setAttribute('onclick', 'innerMain(profilePage())');
            }
            innerMain(profilePage());
            document.querySelectorAll('[isloginwindow]').forEach(function(el) {
              closeWindow(el.id);
            });
        }
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  } else {
    megaAlert('captchaDed');
  };
},
sendLoginForm = function(wId) {
  let username = getElement('LGusername').value,
    password = getElement('LGpassword').value,
    reCAPdatas = document.getElementsByClassName('g-recaptcha-response');
    reCAP = reCAPdatas[reCAPdatas.length-1].value;
    //hcaptcha = getElement(wId+'cap').getAttribute('data-hcaptcha-response');
  Consoles.log(reCAP)
  if (reCAP || ignoreCap) {
    Loading();
    helperRequest(
      `${sData[5]}login${php}`,
      `username=${username}&password=${password}`+
      `&g-recaptcha-response=${reCAP}`
    )
      .then(function(data) {
        switch (data) {
          case '-1':
            megaAlert('wrongPass');
            break;
          case '-2':
            megaAlert('accountEmpty');
            break;
          case '-3':
            megaAlert('captchaDed');
            break;
          default:
            let serverResp = JSON.parse(data);
            CacheCamps = serverResp[1];
            CacheShows = serverResp[2];
            CacheWikis = serverResp[3];
            thisUser = serverResp[0];
            myCamps = [];
            myShows = [];
            myguides = [];
            myCamps.push(serverResp[3][0]);
            myShows.push(serverResp[3][1]);
            myguides.push(serverResp[3][2]);
            token = thisUser[5];
            Slocal.set('User', token);
            thisUser.pop();

            getElement('regBtn').remove();
            getElement('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser[0]}</span>`;

            if (getElement('regBtn2')) {
              getElement('regBtn2').innerHTML = getTrans('logout', 0);
              getElement('regBtn2').setAttribute('data-trans', 'logout');
              getElement('regBtn2').setAttribute('onclick', 'gLogout()');
            }
            if (getElement('btnLogin2')) {
              getElement('btnLogin2').innerHTML = thisUser[0];
              getElement('btnLogin2').removeAttribute('data-trans');
              getElement('btnLogin2').setAttribute('onclick', 'innerMain(profilePage())');
            }
            innerMain(profilePage());
            document.querySelectorAll('[isloginwindow]').forEach(function(el) {
              closeWindow(el.id);
            });
        }
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  } else {
    megaAlert('captchaDed');
  };
},
sendDrop = function() {
  let username = getElement('LGusername').value,
    password = getElement('LGpassword').value,
    email  = getElement('LGemail'   ).value;
  Loading();
  helperRequest(
    `${sData[5]}drop${php}`,
    `username=${username}&password=${password}&email=${email}`
  )
    .then(function(data) {
      if (data == '-1')
        return alert('неа');
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
gLogout = function() {
  thisUser = ['???',0,0,0,0];
  Slocal.remove('User');
  token = undefined;
  innerMain(pageMain());
},

editNickPre = function() {
  getElement('newNick').innerHTML =
  `<input class="framelabel" id=newNick2${getTrans('newNick', 'input')}`+
  `<button onclick="editNick()" class=loginbtn${getTrans('edit')}/button>`;
},
editNick = function() {
  let newNick = getElement('newNick2').value;
  helperRequest(`${sData[5]}setNickname${php}?name=${newNick}`)
    .then(function(data) {
      let timename = thisUser[0].slice();
      thisUser[0] = data;
      for (let gdpsKey in myCamps[0]) 
        if (myCamps[0][gdpsKey].userName == timename) 
          myCamps[0][gdpsKey].userName = data;

      // потом сделать во всех гдпсах и текстурах
      getElement('oldNick').innerHTML = data;
      getElement('newNick').innerHTML = '';
    })
},

sendLike = function(id, channel, isComm = 0) {
  if (thisUser[1] === 0)
    return megaAlert('needLogin');

  Loading();
  let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
  helperRequest(`${sData[1]}like${php}`, data)
    .then(function(data) {
      let likeValue = '';
      if (!isComm) {
        likeValue = parseInt(getElement('likesCount' + id).innerText);
        getElement('likesCount' + id).innerText = data;
      } else {
        likeValue = parseInt(getElement('likesCountComm' + id).innerText);
        getElement('likesCountComm' + id).innerText = data;
      }
      if (likeValue < data && getElement('dislike' + id).style.filter == '')
        getElement('like' + id).setAttribute('style', likeStyle.like);
      else {
        getElement('like' + id).setAttribute('style', '');
        getElement('dislike' + id).setAttribute('style', '');
      }
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});
},
sendDislike = function(id, channel, isComm = 0) {
  if (thisUser[1] === 0)
    return megaAlert('needLogin');

  Loading();
  let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
  helperRequest(`${sData[1]}dislike${php}`, data)
    .then(function(data) {
      let likeValue = '';
      if (!isComm) {
        likeValue = parseInt(getElement('likesCount' + id).innerText);
        getElement('likesCount' + id).innerText = data;
      } else {
        likeValue = parseInt(getElement('likesCountComm' + id).innerText);
        getElement('likesCountComm' + id).innerText = data;
      }
      
      if (likeValue > data && getElement('like' + id).style.filter == '')
        getElement('dislike' + id).setAttribute('style', likeStyle.disl);
      else {
        getElement('dislike' + id).setAttribute('style', '');
        getElement('like' + id).setAttribute('style', '');
      }
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});
},
sendComm = function(id, channel) {
  if (thisUser[1] === 0)
    return;

  Loading();
  let dataForNextButton = `${id},'${channel}',1`,
    commText = getElement('text').value,
    data =
    'ide='   + encodeURIComponent(id)
  + '&type=' + encodeURIComponent(channel)
  + '&text=' + encodeURIComponent(commText);
  helperRequest(`${sData[1]}comment${php}`, data)
    .then(function(data) {
      Loading(1);
      if (data == '-4') {
        megaAlert('commSizeFail')
        return;
      }
      let serverResp = JSON.parse(data);

      innerComments(renderComms(serverResp,channel,dataForNextButton), 0);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
deleteComm = function(id, channel) {
  Loading();
  helperRequest(`${sData[4]}comment${php}?ide=${id}&type=${channel}`)
    .then(function(data) {
      if (data == '-1')
        return returnError('Access denied');
      getElement('comm'+data).remove();
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
// #endregion
// #region публичные страницы
EBARBTN = function() {
  let timestamp = Math.round((Date.now() - ((1752922800*1000) - Date.now()))/1000),
      EBARDATE = timeAgo2(timestamp),
      renderText = function(time, text) {
        return `<span>${time}</span><span style="font-size:calc(var(--def-font) * 0.5)">${text}</span>`;
      };

  let doneString = 
  `<div style=display:flex;flex-direction:column;align-items:center;position:absolute;right:30px;top:70px>`+
    `<img src=eba.png width=150px>`+
    `<button class=loginbtn onclick=innerMain(EBARPAGE())>`+
      `<span>`+
        renderText(EBARDATE[0],'ДН')+
        renderText(EBARDATE[1],'Ч')+
        renderText(EBARDATE[2],'М')+
      `</span>`+
    `</button>`+
  `</div>`;
  return doneString;
},
EBARTIMER = function() {
  let timestamp = Math.round((Date.now() - ((1752922800*1000) - Date.now()))/1000),
      EBARDATE = timeAgo2(timestamp);

  return `<div style="font-size:calc(var(--def-font) * 5)" align=center>${EBARDATE[0]} Дней ${EBARDATE[1]} Часов ${EBARDATE[2]} Минут</div>`;
},
EBARPAGE = function() {
  let text = Markdown(`
    
    Добро пожаловать на EBAR FEST 2025 — грядущее онлайн-событие, посвящённое русскоязычным обджект-шоу! В преддверии этого, Псёвя захватил наш сайт и добавил этот огромный таймер.

 EBAR NEWS — юмористический Telegram-канал, с которым у нас уже была своеобразная коллаборация в апреле этого года. На сей раз, мы планируем показать на фесте новый редизайн заглавной страницы Object Hub, а потому нам будет что Вам показать!

 Помимо этого, на вас ждут премьеры эпизодов Изумрудного Шоу и Салок, интервью с популярными ошкреаторами: Федкаром, Анимации Жени и Грифелером, и множество других, не менее стёбных и уморительных, вещей! 

 С нетерпением ждём Вас, а если Вы сейчас в таком же нетерпении, то, надеемся, этот таймер будет держать Вас в курсе. Увидимся 19 июля, в 14:00 по московскому времени, в Telegram-канале EBAR NEWS.

 `);

  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class=frameprofile style=text-align:left>`+
      EBARTIMER()+
      text+
      `<a class=loginbtn target=_blank href=https://t.me/ebarnews>EBAR NEWS</a>`+
      `<div align=center>`+
        `<img src=eba2.png width=100px>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
timeAgo2 = function(timestamp) {
  let timeDiff = Math.floor((Date.now() / 1000) - timestamp);
  Consoles.log(timestamp+"\n"+timeDiff);
    let Weeks = Math.floor(timeDiff / 604800),
        Days = Math.floor(timeDiff / 86400),
        Hours = Math.floor(timeDiff / 3600),
        Minutes = Math.floor(timeDiff / 60),
        Seconds = timeDiff % 60,
        HoursCurve = Hours - (Days * 24),
        MinutesCurve = Minutes - (Hours * 60);

  return [Days,HoursCurve,MinutesCurve];
},
pHeader = function() {
  let regBtn = '',
    loginBtn = '',
    regBtnMobile = '',
    loginBtnMobile = '';

  if (thisUser[1] === 0) {
    regBtn = `<button id=regBtn class="emptybtn" onclick="registerPage()"${getTrans('register')}/button>`;
    loginBtn =
    `<button id=btnLogin style="margin-left:12px" class="emptybtn" onclick="switchLogin(32,'')">`+
      `<span styllle=position:absolute;right:0;top:-8px${getTrans('login')}/span>`;
    regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="registerPage()"${getTrans('register')}/button>`;
    loginBtnMobile =
    `<button id=btnLogin2 class="loginbtn" onclick="loginPage()">`+
      `<span${getTrans('login')}/span>`;
  } else {
    regBtn = ``;
    loginBtn =
    `<button id=btnLogin styllle="position:relative;width:20px;height:16px;margin-left:20px" class="emptybtn" onclick="switchLogin(32,'')">`+
      `<span styllle=position:absolute;right:0;top:-8px>${thisUser[0]}</span>`;
    regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="gLogout()"${getTrans('logout')}/button>`;
    loginBtnMobile =
    `<button id=btnLogin2 styllle=position:relative class="loginbtn" onclick="innerMain(profilePage());switchMobileMain()">`+
      `<span>${thisUser[0]}</span>`;
  }

  //(thisUser[4] == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')

  if (thisUser[4] === 1) {
    loginBtn += `<span style="position:absolute;top:-14px;right:-6px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
    loginBtnMobile += `<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
  }
  loginBtn += `</button>`;
  loginBtnMobile += `</button>`;

  let html = 
  `<div class="header" id=helperMaster align="left">`+
    `<nodiv id=switchHtmlLang style=position:relative>`+
      `<button onclick="switchLang()" style="width:40px" class="emptybtn">`+
        `<img data-trans="src" src="${mainLang.src}" width=40px style="padding-bottom:6px;margin-top:6px">`+
      `</button>`+ // !ПОИСК! switchLang = function
    `</nodiv>`+
    EBARBTN()+
    `<div class=contentAdaptiveBig>`+
      headerButtons()+
      `<div style=position:absolute;right:8px;top:16px>`+
        `<nodiv id=switchHtmlLogin style=position:relative>`+
          regBtn+
          loginBtn+ // !ПОИСК! switchLogin = function
        `</nodiv>`+
      `</div>`+
    `</div>`+
    `<div class=contentAdaptiveSmall style=display:flex;flex-direction:row-reverse>`+
      `<button class="contentAdaptiveSmall loginbtn" onclick="switchMobileMain()">`+
        `<div style="transform:rotate(90deg)">|||</div>`+
      `</button>`+
    `</div>`+
  `</div>`+
  `<div class=frameprofile id=helperSecond style=display:none>`+
    headerButtons(1)+
    `<div style=height:33px></div>`+
    loginBtnMobile+
    regBtnMobile+
    `<p align=right${getTrans('helperVer')}/p>`+
  `</div>`;
  return html;
},
pageMain = function(ignore = false) {
  if (!ignore)
    setLink('');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class=frameprofile style="margin-top:12vh;padding-top:7vh" id=doom>`+
      `<div class=contentAdaptiveFlexSmall align=center style=align-items:center;justify-content:center>`+
        `<img onclick=playDoom() src="${helperUrl}imgs/hubbig.png" width=256px height=256px style="border-radius:calc(var(--def-border)*4)">`+
        `<div style=display:flex;flex-direction:column>`+
          `<h1 style=margin:8px;font-size:calc(var(--def-font)*2.5);color:var(--color-main)${getTrans('T2-hi')}/h1>`+
          `<h1 style=margin:8px;font-size:calc(var(--def-font)*5)${getTrans('ojhubname')}/h1>`+
        `</div>`+
      `</div>`+
      `<div class=contentAdaptiveSmall align=center>`+
        `<img onclick=playDoom() src="${helperUrl}imgs/hubbig.png" width=128px height=128px style="border-radius:calc(var(--def-border)*2)"><br>`+
        `<h2 style=margin:8px;color:var(--color-main)${getTrans('T2-hi')}/h2>`+
        `<h1 style=margin:8px${getTrans('ojhubname')}/h1>`+
      `</div>`+
    `</div>`+
    `<div class=frameprofile style="margin-top:40px">`+
      `<div align=center style=display:flex;flex-wrap:wrap;justify-content:center>`+
        `<div class=framegdpsOld align=center style=width:330px;text-align:center;position:relative;min-height:372px>`+
          `<h2${getTrans('T1-hubMaster1')}/h2>`+
          `<img style=margin:0 src=${helperUrl}imgs/like.png width=192px>`+
          `<p${getTrans('T1-hubMaster2')}/p>`+
        `</div>`+
        `<div class=framegdpsOld align=center style=width:330px;text-align:center;position:relative;min-height:372px>`+
          `<h2 style=margin-bottom:2px${getTrans('T2-promo1')}/h2>`+
          `<img style=margin:0 src=${helperUrl}imgs/load.svg width=192px>`+
          `<p style=font-size:var(--def-font);margin:0${getTrans('T2-promo2')}/p>`+
          `<button class=loginbtn onclick=window.scrollTo(0,0);innerMain(pageList())${getTrans('searchCamps')}/button><br>`+
          `<button class=loginbtn onclick=window.scrollTo(0,0);innerMain(pageShows())${getTrans('searchShows')}/button>`+
        `</div>`+
        `<div class=framegdpsOld align=center style=width:330px;text-align:center;position:relative;min-height:372px>`+
          `<h2 style=margin-bottom:2px${getTrans('T1-findAbout')}/h2>`+
          `<img style=margin:0 src=${helperUrl}imgs/gdpsnew.svg width=192px>`+
          `<p style=font-size:var(--def-font);margin:0${getTrans('T1-findHelp')}/p>`+
        `</div>`+
        `<div class=framegdpsOld align=center style=width:330px;text-align:center;position:relative;min-height:372px>`+
          `<h2 style=margin-bottom:2px${getTrans('T2-promo3')}/h2>`+
          `<img style=margin:0 src=${helperUrl}imgs/login.svg width=192px>`+
          `<p style=font-size:var(--def-font);margin:0${getTrans('T2-promo4')}/p>`+
          `<button class=loginbtn onclick=window.scrollTo(0,0);${thisUser[1] == 0 ? 'registerPage()' : 'innerMain(profilePage())'}${getTrans('register')}/button>`+
        `</div>`+
        `<div class=framegdpsOld align=center style=width:330px;text-align:center;position:relative;min-height:372px>`+
          `<h2 style=margin-bottom:2px${getTrans('T1-insertAbout')}/h2>`+
          `<img style=margin:0 src=${helperUrl}imgs/plus.svg width=192px>`+
          `<p style=font-size:var(--def-font);margin:0${getTrans('T1-insertHelp')}/p>`+
          `<button class=loginbtn onclick=window.scrollTo(0,0);${thisUser[1] == 0 ? 'registerPage()' : 'innerMain(profilePage())'}${getTrans('register')}/button>`+
        `</div>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
pageList = function() {
  let tags = '',
    oss = '';
  for (let tag in GDPStags) {
    tags += renderTagSearch(GDPStags, 'camp', tag);
  }
  for (let os in GDPSoss) {
    oss += renderTagSearch(GDPSoss, 'caOS', os);
  }
  helperFindData = [3,[],[],0];
  setLink('list');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<h1 align=center style=color:var(--color-white);margin-bottom:10px${getTrans('ojhubname')}/h1>`+
    `<div id=finder align=left class="frameprofile">`+
      `<h1${getTrans('searchCamps')}/h1><br>`+
      `<label${getTrans('findByName')}/label>:<br>`+
      `<p${getTrans('listHelp1')}/p>`+
      `<input type=text id=gdpsNameInput class=framelabel style=width:190px${getTrans('campName', 'input')}<br><br>`+

      `<label${getTrans('tags00')}/label>:<br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        tags+
      `</div>`+

      `<label${getTrans('os00')}/label>:<br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        oss+
      `</div>`+

      `<label${getTrans('Text;Tags')}/label><br>`+
      renderTextOrTags()+'<br>'+

      `<label${getTrans('otherSort')}/label><br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        `<label onclick=setMethod(3) id=method3 class=tagSel${getTrans('search1')}/label>`+
        `<label onclick=setMethod(0) id=method0 class=tagPre${getTrans('search4')}/label>`+
        `<label onclick=setMethod(1) id=method1 class=tagPre${getTrans('mostLike')}/label>`+
        `<label onclick=setMethod(2) id=method2 class=tagPre${getTrans('mostDisl')}/label>`+
      `</div>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
      GDPSrenderMini(CacheCamps,'&m=1')+
    `</div>`+
    insertBtn('sendFinder(1,\'method=3\')')+
  `</div>`;
  tags = os = '';
  return html;
},
pageShows = function() {
  let tags = '',
    oss = '';
  for (let tag in SHOWtags) {
    tags += renderTagSearch(SHOWtags, 'show', tag);
  }
  for (let os in SHOWoss) {
    oss += renderTagSearch(SHOWoss, 'shOS', os);
  }
  helperFindData = [3,[],[],1];
  setLink('shows');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<h1 align=center style=color:var(--color-white);margin-bottom:10px${getTrans('ojhubname')}/h1>`+
    `<div id=finder align=left class="frameprofile">`+
      `<h1${getTrans('searchShows')}/h1><br>`+
      `<label${getTrans('findByName')}/label>:<br>`+
      `<p${getTrans('listHelp2')}/p>`+
      `<input type=text id=gdpsNameInput class=framelabel style=width:190px${getTrans('showName', 'input')}<br><br>`+

      `<label${getTrans('tags01')}/label>:<br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        tags+
      `</div>`+

      `<label${getTrans('os01')}/label>:<br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        oss+
      `</div>`+

      `<label${getTrans('Text;Tags')}/label><br>`+
      renderTextOrTags()+'<br>'+

      `<label${getTrans('otherSort')}/label><br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        `<label onclick=setMethod(3) id=method3 class=tagSel${getTrans('search1')}/label>`+
        `<label onclick=setMethod(0) id=method0 class=tagPre${getTrans('search4')}/label>`+
        `<label onclick=setMethod(1) id=method1 class=tagPre${getTrans('mostLike')}/label>`+
        `<label onclick=setMethod(2) id=method2 class=tagPre${getTrans('mostDisl')}/label>`+
      `</div>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
      SHOWrenderMini(CacheShows,'&m=1')+
    `</div>`+
    insertBtn('sendFinder(1,\'method=3\')')+
  `</div>`;
  return html;
},
pageWikiList = function() {
  helperFindData = [0,null,null,2];
  setLink('wikis');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<h1 align=center style=color:var(--color-white);margin-bottom:10px${getTrans('ojhubname')}/h1>`+
    `<div id=finder align=left class="frameprofile">`+
      `<h1 align=center>`+
        `<span${getTrans('guides09')}/span>`+
        (thisUser[1] !== 0 ? ' <button class=loginbtn onclick="createWiki()">+</button>' : '')+
      `</h1>`+
      `<label${getTrans('findByName')}/label>:<br>`+
      `<input type=text id=gdpsNameInput class=framelabel style=width:190px${getTrans('wikiName', 'input')}<br><br>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
    `</div>`+
  `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[7]}getWikis${php}`)
    .then(function(data) {
      let parsedData = JSON.parse(data),
        html = renderWiki(parsedData);
      innerGdpsPlace(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
pageGuides = function(wiki, backButton = '') {
  if (backButton !== '')
    backButton = `<div class=gdps-forum><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button></div>`;

  if (typeof(wiki) === 'undefined')
    return pageWikiList();
  setLink('wiki='+wiki);
  globalWiki = wiki;
  let html = pHeader()+
  `<div id=helperContent>`+
    `<h1 align=center>`+
      `<span id=wikiName></span>`+
      ` <span${getTrans('guides09')}/span>`+
      (checkWikiOwn(wiki) ? ' <button class=loginbtn onclick="createGuide('+wiki+')">+</button>' : '')+
    `</h1>`+
    backButton+
    `<div class=gdps-list-place id=GDPSesPlace>`+
    `</div>`+
  `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[7]}getWiki${php}?wiki=${wiki}`)
    .then(function(data) {
      let parsedData = JSON.parse(data),
        html = renderGuideMini(parsedData);
      innerGdpsPlace(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
uvazuha = function() {
  setLink('special');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div align=center>`+
      `<h1${getTrans('ojhubname')}/h1>`+
      `<h2${getTrans('special00')}/h2>`+
      `<div class=frameguide align=left>`+
        `<p>DenisC -   <span${getTrans('special01')}/span></p>`+
        `<p>Vustur -  <span ${getTrans('special03')}/span></p>`+
        `<p>MIOBOMB -  <span${getTrans('special04')}/span></p>`+
        `<p>Qundikus - <span${getTrans('special05')}/span></p>`+
        `<p>glorius -  <span${getTrans('special09')}/span></p>`+
        `<p>M41den -  <span ${getTrans('special10')}/span></p>`+
      `</div>`+
      `<h2${getTrans('special11')}/h2>`+
      `<div class=frameguide align=left>`+
        `<p>Ikotik -   <span${getTrans('special12')}/span></p>`+
        `<h2${getTrans('special08')}/h2>`+
        `<br><br>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
helperAbout = function() {
  setLink('about');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class=frameprofile style=text-align:left>`+
      `<h1${getTrans('aboutHelper')}/h1>`+
      `<h2${getTrans('history01')}/h2>`+
      `<p${getTrans('history02')}/p>`+
      `<p${getTrans('history03')}/p>`+
      `<button class=loginbtn onclick="innerMain(uvazuha())"${getTrans('HLthanks')}/button>`+
      `<h2${getTrans('helperSocials')}/h2>`+
      `<a class=loginbtn href="https://discord.gg/zetb62mqsS" target=_blank${getTrans('helperDs')}/a><br><br>`+
      `<a class=loginbtn href="https://t.me/objecthub" target=_blank${getTrans('helperTg')}/a>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
setImgSize = function() {
  if (window.innerWidth >= 700) {
    if (getElement('imageBG')) {
      getElement('imageBG').style = '';
      let alphaY = getElement('imageBG').getBoundingClientRect().height + 72;
      getElement('gdpsalpha').style = `z-index:-5;position:absolute;top:${alphaY}px`;
      return;
    }
  } else if(getElement('gdpsalpha'))
      getElement('gdpsalpha').style = `z-index:-5`;
  if (getElement('gdpsalpha')) {
    let darkElement = getElement('gdpsalpha').getBoundingClientRect(),
    imgposY = darkElement.y,
    imgposX = imgposY * 2.4;

    getElement('imageBG').style.width = imgposX+'px';
    getElement('imageBG').style.height = imgposY+'px';
  }
},
BETA_fixImg = function(url) {
  if (!renderBeta)
    return url;

  if (url.includes('./imgs/'))
    return `.${url}`;
  else
    return url;
},
contentPreload = function(sendCommData = '', backFunc = '', renderNews = 1, renderBan = 1) {
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class=gdps-list-place id=GDPSesPlace></div>`+
    (renderBan ? 
    `<div class=imageBG>`+
      `<div style=width:100%;height:60px></div>`+
      `<img id="imageBG" class=imageBG2>`+
    `</div>`
    : '')+
    `<div class="gdps-forum">`+
      (backFunc ?
      `<button class="loginbtn" onclick="${backFunc}"${getTrans('back')}/button>`
      : '')+
    `</div><br>`+
    `<div class=gdpsnewsalpha2 id=gdpsalpha style=z-index:-5></div>`+
    `<div style="display:flex; flex-wrap:wrap">`+
      (renderNews ? 
      `<div style=overflow:auto align=center class=adaptiveNews id="news"></div>`+
      `<div class=gdpsnewsalpha></div>`
      : '')+
      `<div style=overflow:auto;flex:50%>`+
        contentSendCommForm(sendCommData)+
        `<div id="comments"></div>`+
      `</div>`+
    `</div>`+
  `</div>`;
  innerMain(html);
},
insertBtn = function(lastUse, transText = 'showMore', useRemover = 1) {// кнопка "показать больше"
  return `<div ${useRemover === 1 ? 'id=nextGdps ' : ''}class=gdps-helper align=center>`+
    `<button onclick="${lastUse}" class=loginbtn `+
    `style="font-size:calc(var(--def-font)*2);padding:4px 8px;margin:12px 0"${getTrans(transText)}/button>`+
  `</div>`;
},

profilePage = (innerHtnl = gProfileMini())=>{
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class=frameprofile style="margin:0;height:100%">`+
      `<button style="position:absolute;top:80px;right:5px" class="contentAdaptiveSmall loginbtn" onclick="profileSwitcherPhone()">`+
        `<div style="transform:rotate(90deg)">|||</div>`+
      `</button>`+
      `<div id="phoneSelector" class=contentAdaptiveBig style="position:absolute;top:95px;width:235px" align="left">`+
        `<button class=loginbtn onclick="innerProfile(gProfileMini())"${getTrans('profile')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(alarmsWindow());GetAlarms()" style=position:relative${getTrans('Alarms', 'textButton')}`+
        (thisUser[4] == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')+
        `</button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(campsWindow())"${getTrans('yourCamps')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(showsWindow())"${getTrans('yourShows')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(wikisWindow())"${getTrans('yourWikis')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile();clrEditPage()"${getTrans('settings000')}/button><br><br>`+
      `</div>`+
      `<div id="phoneSelectorSmall" class=contentAdaptiveSmall style=display:none>`+
        `<button class=loginbtn onclick="innerProfile(gProfileMini());profileSwitcherPhone()"${getTrans('profile')}/button>`+
        `<button class=loginbtn onclick="innerProfile(alarmsWindow());profileSwitcherPhone();GetAlarms()" style=position:relative${getTrans('Alarms', 'textButton')}`+
        (thisUser[4] == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')+
        `</button>`+
        `<button class=loginbtn onclick="innerProfile(campsWindow());profileSwitcherPhone()"${getTrans('yourCamps')}/button>`+
        `<button class=loginbtn onclick="innerProfile(showsWindow());profileSwitcherPhone()"${getTrans('yourShows')}/button>`+
        `<button class=loginbtn onclick="innerProfile(wikisWindow());profileSwitcherPhone()"${getTrans('yourWikis')}/button>`+
        `<button class=loginbtn onclick="innerProfile();clrEditPage();profileSwitcherPhone()"${getTrans('settings000')}/button>`+
      `</div>`+
      `<div class=profileMobileRightWindow id="profileWindow" align="left">`+
        innerHtnl+
      `</div>`+
      `<p align=right${getTrans('helperVer')}/p>`+
    `</div>`+
  `</div>`;
  return html;
},
otherProfile = function(userId, backButton, innerHtnl = otherProfileMini) {
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class=frameprofile style="margin:0;height:100%">`+
      `<button style="position:absolute;top:80px;right:5px" class="contentAdaptiveSmall loginbtn" onclick="profileSwitcherPhone()">`+
        `<div style="transform:rotate(90deg)">|||</div>`+
      `</button>`+
      `<div id="phoneSelector" class=contentAdaptiveBig style="position:absolute;top:95px;width:235px" align="left">`+
        `<button class=loginbtn onclick="otherProfileMini(${userId})"${getTrans('profile')}/button><br><br>`+
        `<button class=loginbtn onclick="otherCampsWindow(${userId})"${getTrans('searchCamps')}/button><br><br>`+
        `<button class=loginbtn onclick="otherShowsWindow(${userId})"${getTrans('searchShows')}/button><br><br>`+
        `<button class=loginbtn onclick="otherWikisWindow(${userId})"${getTrans('guides09')}/button><br><br>`+
        `<br><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button>`+
      `</div>`+
      `<div id="phoneSelectorSmall" class=contentAdaptiveSmall style=display:none>`+
        `<button class=loginbtn onclick="otherProfileMini(${userId});profileSwitcherPhone()"${getTrans('profile')}/button><br><br>`+
        `<button class=loginbtn onclick="otherCampsWindow(${userId});profileSwitcherPhone()"${getTrans('searchCamps')}/button><br><br>`+
        `<button class=loginbtn onclick="otherShowsWindow(${userId});profileSwitcherPhone()"${getTrans('searchShows')}/button><br><br>`+
        `<button class=loginbtn onclick="otherWikisWindow(${userId});profileSwitcherPhone()"${getTrans('guides09')}/button><br><br>`+
        `<br><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button>`+
      `</div>`+
      `<div class=profileMobileRightWindow id="profileWindow" align="left">`+
      `</div>`+
    `</div>`+
  `</div>`;
  innerMain(html);
  innerHtnl(userId);
},
// #endregion
// #region кнопки профиля (лист входов, удалить аларм и т д)

removeAlarm = function(id) {
  Loading();
  helperRequest(`${sData[1]}deleteAlarm${php}?id=${id}`)
  .then(function() {
    getElement('btn'+id).remove();
    getElement('fullAlarm').remove();
    Loading(1);
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
JEedit = function(gdpsId) {
  Loading();
  helperRequest(`${sData[1]}setj${php}?id=${gdpsId}`)
    .then(function(data) {
      if (data == '-2')
        return returnError('Access denied');
      getElement('JE'+gdpsId).innerHTML = getTrans(data, 0);
      Loading(1);
    });
},
ballsUp = function(gdpsId, type = 'g') {
  Loading();
  helperRequest(`${sData[1]}bump${php}?id=${gdpsId}`)
    .then(function(data) {
      if (data == 'no') 
        return getElement('BL'+gdpsId).innerHTML = getTrans('campunckecked', 0);
      let pData = JSON.parse(data),
        canBump;
      if (pData[2] > 0) {
        canBump = `<span${getTrans('isBL')}/span>`;
      } else {
        canBump = `<span${getTrans('wait1')}/span>${Math.abs(pData[2])}<span${getTrans('wait2')}/wait>`;
        if (pData[2] == -7200) {
          megaAlert('bumped');
          if (type === 'g')
            myCamps[0]['g'+gdpsId].points = pData[0];
          else 
            myShows[0]['t'+gdpsId].points = pData[0];
        }
      }
      getElement('BL'+gdpsId).innerHTML = canBump;
      Loading(1);
    });
},
coownersMenu = function(id, contentType) {
  Loading();
  helperRequest(`${sData[0]}getOwners${php}?id=${id}&type=${contentType}`)
    .then(function(data) {
      switch (contentType) {
        case 1: setLink('campOwn='+id); break;
        case 2: setLink('showOwn='+id); break;
        case 3: setLink('wikiOwn='+id); break;
        
      }
      let parsedData = JSON.parse(data),
        html = 
      `<div id=helperContentProfile>`+
        `<div>`+
          `<h1><span${getTrans('coowners')}/span> ${parsedData[0]}</h1>`+
          `<table id=comments>`+
            `<tr>`+
              `<td${getTrans('profName')}/td>`+
              `<td${getTrans('delete')}/td>`+
            `</tr>`;

      parsedData[1].forEach(function(arrat) {
        html +=
            `<tr id=perm${arrat[1]}>`+
              `<td>`+
                arrat[0]+
              `</td>`+
              `<td>`+
                `<button class=loginbtn onclick="deleteOwner(${id},${contentType},${arrat[1]})"${getTrans('delete')}/button>`+
              `</td>`+
            `</tr>`;
      });

      html += 
          `</table><br><br>`+
          `<input style="width:120px" id="addown" class="framelabel"${getTrans('idOrName', 'input')}`+
          `<button class="loginbtn" onclick="ownersAdd(${id},${contentType})">+</button>`+
        `</div>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
ownersAdd = function(id, contentType) {
  let userData = getElement('addown').value;
  Loading();
  helperRequest(`${sData[1]}permAdd${php}?gdps=${id}&type=${contentType}&user=${userData}`)
    .then(function(data) {
      if (data == '-2')
        return returnError('Access denied');
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
      innerComments(html, 1);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
deleteOwner = function(contentId, contentType, userId) {
  Loading();
  helperRequest(`${sData[1]}perm${php}?gdps=${contentId}&type=${contentType}&id=${userId}`)
    .then(function(data) {
      if (data == '-2')
        return returnError('Access denied');
      getElement('perm'+userId).remove();
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getJoinLog = function(gdpsId) { // legacy
  Loading();
  helperRequest(`${sData[0]}getJoinLog${php}?id=${gdpsId}`)
    .then(function(data) {
      setLink('gdpsLog='+gdpsId);
      let parsedData = JSON.parse(data),
        html = 
      `<div id=helperContentProfile>`+
        `<div>`+
          `<h1><span${getTrans('joinsTo')}/span> ${parsedData[0][0]}</h1>`+
          `<table>`;
      parsedData.forEach(function(arrat) {
        if (arrat[1] !== 'Microwave') {
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
      innerProfile(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
mediaselector = function(id, inputtype) {
  let fileTrans = '';
  if (id === 'img')
    fileTrans = 'Picture01';
  else
    fileTrans = 'Picture02';

  if (inputtype === 'toimg') {
    getElement('mediaselector'+id).innerHTML = 
    `<input type=text class=framelabel name=${id} style=width:40%${getTrans('campInput04', 'input')}`+
    `<button class=loginbtn onclick="mediaselector('${id}','tofile')"${getTrans('campInput07')}/button>`;
  } else {
    getElement('mediaselector'+id).innerHTML = 
    `<input type=file class=framelabel name=${id} style=width:40%>`+
    `<button class=loginbtn onclick="mediaselector('${id}','toimg')"${getTrans('campInput08')}/button>`+
    `<br><span style=opacity:50%${getTrans(fileTrans)}/span>`;
  }
},
generateSocialNetworks = function(HTMelement, editModeValue = '') {
  if (document.querySelectorAll(`[socialnetwork=${HTMelement.value}]`).length == 0)
    switch (HTMelement.value) {
      case 'telegram':
        innerGdpsPlace(
          socialNetwork('telegram', editModeValue)
        ,1);
        break;
      case 'youtube':
        innerGdpsPlace(
          socialNetwork('youtube', editModeValue)
        ,1);
        break;
      default:
      case 'discord':
        innerGdpsPlace(
          socialNetwork('discord', editModeValue)
        ,1);
        break;
    }
},
socialNetwork = function(type, value) {
  return `<div style=display:flex>`+
    `<input type=hidden name=links[] value="${type}">`+
    `<input class=framelabel type=text name=links[] socialnetwork=${type} value="${value}" style=width:100% required placeholder=${type}>`+
    `<button class=loginbtn onclick=this.parentElement.remove()>-</buttin>`+
  `</div>`;
},
addCamp = function() {
  let tags = '',
    oss = '';
  for (let tag in GDPStags) {
    tags += renderTagAdding(GDPStags, 'tags', tag);
  }
  for (let os in GDPSoss) {
    oss += renderTagAdding(GDPSoss, 'os', os);
  }
  setLink('addCamp');
  let html = 
  `<div id=helperContentProfile>`+
    `<h1${getTrans('addCamp')}/h1>`+
    `<form method=POST enctype="multipart/form-data" action='campAdd${php}' onsubmit="return enterFormData(this,'campAdd${php}')">`+
      `<label${getTrans('addCamp01')}/label><br><input class=framelabel type=text name=title style=width:100% required${getTrans('campInput01', 'input')}<br>`+
      `<label${getTrans('addCamp02')}/label><br><textarea class=framelabel name=description style=width:100% required${getTrans('campInput02', 'textarea')}/textarea><br>`+
      `<label${getTrans('addCamp03')}/label><br>`+
      `<div id=GDPSesPlace></div>`+
      `<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(this)>`+
        `<option selected disabled hidden${getTrans('addCamp03a')}/option>`+

        `<option value=youtube>youtube</option>`+
        `<option value=discord>discord</option>`+
        `<option value=telegram>telegram</option>`+
      `</select><br>`+

      `<label${getTrans('gdpsLang00')}/label><br>`+
      `<select id="langs" class="framelabel" name="language" required>`+
        `<option value="RU"${getTrans('gdpsLang01')}/option>`+
        `<option value="EN"${getTrans('gdpsLang02')}/option>`+
        `<option value="ES"${getTrans('gdpsLang03')}/option>`+
      `</select><br><br>`+

      `<h2${getTrans('campInput06')}/h2>`+
      `<label${getTrans('addCamp04')}/label><br>`+
      `<div id=mediaselectorimg>`+
        `<input class=framelabel type=text name=img style=width:40%${getTrans('campInput04', 'input')}`+
        `<button class=loginbtn onclick="mediaselector('img','tofile')"${getTrans('campInput07')}/button>`+
      `</div><br>`+
      `<label${getTrans('addCamp07')}/label><br>`+
      `<div id=mediaselectorban>`+
        `<input class=framelabel type=text name=ban style=width:40%${getTrans('campInput04', 'input')}`+
        `<button class=loginbtn onclick="mediaselector('ban','tofile')"${getTrans('campInput07')}/button>`+
      `</div><br><br>`+

      `<label${getTrans('addCamp05')}/label><br>`+
      `<div style="display:flex;flex-wrap:wrap">`+
        tags+
      `</div><br>`+
      `<label${getTrans('addCamp06')}/label><br>`+
      `<div style="display:flex;flex-wrap:wrap">`+
        oss+
      `</div><br><br>`+
      `<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('addCamp', 'inputValue')}`+
    `</form>`+
  `</div>`;
  return html;
},
editCamp = function(gdpsId) {
  Loading();
  let html = ``;
  helperRequest(`${sData[1]}campEdit${php}?id=${gdpsId}`)
  .then (function(data) {    
    setLink('editCamp='+gdpsId);
    let parsedData = JSON.parse(data),
      title = parsedData[0],
      description = parsedData[1],
      links = parsedData[2];
    if (links.startsWith('{'))
      links = JSON.parse(parsedData[2]);
    let 
      image = parsedData[3],
      banner = parsedData[4],
      Tags = JSON.parse(parsedData[5]),
      os = JSON.parse(parsedData[6]),
      tags = Tags.concat(os),
      lang = parsedData[7],
      fileWarning = '',
      tagss = '',
      oss = '',
      linksStr = '';
    for (let tag in GDPStags) {
      let checked = tags.includes(tag) ? ' checked' : '';
      tagss += renderTagAdding(GDPStags, 'tags', tag, checked);
    }
    for (let os in GDPSoss) {
      let checked = tags.includes(os) ? ' checked' : '';
      oss += renderTagAdding(GDPSoss, 'os', os, checked);
    }
    if (typeof links === 'object')
      for (let link in links) {
        linksStr += socialNetwork(link, links[link]);
      }
    else
      linksStr += socialNetwork('discord', links);

    
    if (image.includes('./imgs/customuser/') || banner.includes('./imgs/customuser/'))
      fileWarning = 'fileWarning';

    html = 
    `<div id=helperContentProfile>`+
      `<h1${getTrans('editCamp')}/h1>`+
      `<form method=POST enctype="multipart/form-data" action='campEdit${php}' onsubmit="return enterFormData(this,'campEdit${php}?id=${gdpsId}')">`+
        `<label${getTrans('addCamp01')}/label><br><input value="${title}" class=framelabel type=text name=title style=width:100% required${getTrans('campInput01', 'input')}<br>`+
        `<label${getTrans('addCamp02')}/label><br><textarea class=framelabel name=description style=width:100% required${getTrans('campInput02', 'input')}${description}</textarea><br>`+
        `<label${getTrans('addCamp03')}/label><br>`+
        `<div id=GDPSesPlace>`+
          linksStr+
        `</div>`+
        `<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(this)>`+
          `<option selected disabled hidden${getTrans('addCamp03a')}/option>`+

          `<option value=youtube>youtube</option>`+
          `<option value=discord>discord</option>`+
          `<option value=telegram>telegram</option>`+
        `</select><br>`+
        
        `<label${getTrans('gdpsLang00')}/label><br>`+
        `<select id="langs" class="framelabel" name="language" required>`+
          `<option ${lang == 'RU' ? 'selected' : ''} value="RU"${getTrans('gdpsLang01')}/option>`+
          `<option ${lang == 'EN' ? 'selected' : ''} value="EN"${getTrans('gdpsLang02')}/option>`+
          `<option ${lang == 'ES' ? 'selected' : ''} value="ES"${getTrans('gdpsLang03')}/option>`+
        `</select><br><br>`+

        `<h2${getTrans('campInput06')}/h2>`+
        (fileWarning ? `<p${getTrans('fileWarning')}/p>` : '')+
        `<label${getTrans('addCamp04')}/label><br>`+
        `<div id=mediaselectorimg>`+
          `<input value="${image}" class=framelabel type=text name=img style=width:40%${getTrans('campInput04', 'input')}`+
          `<button class=loginbtn onclick="mediaselector('img','tofile')"${getTrans('campInput07')}/button>`+
        `</div><br>`+
        `<label${getTrans('addCamp07')}/label><br>`+
        `<div id=mediaselectorban>`+
          `<input value="${banner}" class=framelabel type=text name=ban style=width:40%${getTrans('campInput04', 'input')}`+
          `<button class=loginbtn onclick="mediaselector('ban','tofile')"${getTrans('campInput07')}/button>`+
        `</div><br><br>`+
    
        `<label${getTrans('addCamp05')}/label><br>`+        
        `<div style="display:flex;flex-wrap:wrap">`+
          tagss+
        `</div><br>`+
        `<label${getTrans('addCamp06')}/label><br>`+
        `<div style="display:flex;flex-wrap:wrap">`+
          oss+
        `</div><br><br>`+
        `<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('editCamp', 'inputValue')}<br>`+
        `<p${getTrans('afterCamp')}/p><br>`+
      `</form>`+
    `</div>`;
    innerProfile(html);
    Loading(1);
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
addShow = function() {
  let tags = '',
    oss = '';
  for (let tag in SHOWtags) {
    tags += renderTagAdding(SHOWtags, 'tags', tag);
  }
  for (let os in SHOWoss) {
    oss += renderTagAdding(SHOWoss, 'os', os);
  }
  setLink('addShow');
  let html = 
  `<div id=helperContentProfile>`+
    `<h1${getTrans('addShow')}/h1>`+
    `<form method=POST enctype="multipart/form-data" action='showAdd${php}' onsubmit="return enterFormData(this,'showAdd${php}')">`+
      `<label${getTrans('addShow01')}/label><br><input class=framelabel type=text name=title style=width:100% required${getTrans('showInput01', 'input')}<br>`+
      `<label${getTrans('addShow02')}/label><br><textarea class=framelabel name=description style=width:100% required${getTrans('showInput02', 'textarea')}/textarea><br>`+
      `<label${getTrans('addShow03')}/label><br>`+
      `<div id=GDPSesPlace></div>`+
      `<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(this)>`+
        `<option selected disabled hidden${getTrans('addShow03a')}/option>`+

        `<option value=youtube>youtube</option>`+
        `<option value=discord>discord</option>`+
        `<option value=telegram>telegram</option>`+
      `</select><br>`+

      `<label${getTrans('gdpsLang00')}/label><br>`+
      `<select id="langs" class="framelabel" name="language" required>`+
        `<option value="RU"${getTrans('gdpsLang01')}/option>`+
        `<option value="EN"${getTrans('gdpsLang02')}/option>`+
        `<option value="ES"${getTrans('gdpsLang03')}/option>`+
      `</select><br><br>`+

      `<h2${getTrans('showInput06')}/h2>`+
      `<label${getTrans('addShow04')}/label><br>`+
      `<div id=mediaselectorimg>`+
        `<input class=framelabel type=text name=img style=width:40%${getTrans('showInput04', 'input')}`+
        `<button class=loginbtn onclick="mediaselector('img','tofile')"${getTrans('showInput07')}/button>`+
      `</div><br>`+
      `<label${getTrans('addShow07')}/label><br>`+
      `<div id=mediaselectorban>`+
        `<input class=framelabel type=text name=ban style=width:40%${getTrans('showInput04', 'input')}`+
        `<button class=loginbtn onclick="mediaselector('ban','tofile')"${getTrans('showInput07')}/button>`+
      `</div><br><br>`+

      `<label${getTrans('addShow05')}/label><br>`+
      `<div style="display:flex;flex-wrap:wrap">`+
        tags+
      `</div><br>`+
      `<label${getTrans('addShow06')}/label><br>`+
      `<div style="display:flex;flex-wrap:wrap">`+
        oss+
      `</div><br><br>`+
      `<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('addShow', 'inputValue')}`+
    `</form>`+
  `</div>`;
  return html;
},
editShow = function(gdpsId) {
  Loading();
  let html = ``;
  helperRequest(`${sData[1]}showEdit${php}?id=${gdpsId}`)
  .then (function(data) {
    setLink('editShow='+gdpsId);
    let parsedData = JSON.parse(data),
      title = parsedData[0],
      description = parsedData[1],
      links = parsedData[2];
    if (links.startsWith('{'))
      links = JSON.parse(parsedData[2]);
    let 
      image = parsedData[3],
      banner = parsedData[4],
      Tags = JSON.parse(parsedData[5]),
      os = JSON.parse(parsedData[6]),
      tags = Tags.concat(os),
      lang = parsedData[7],
      fileWarning = '',
      tagss = '',
      oss = '',
      linksStr = '';
    for (let tag in SHOWtags) {
      let checked = tags.includes(tag) ? ' checked' : '';
      tagss += renderTagAdding(SHOWtags, 'tags', tag, checked);
    }
    for (let os in SHOWoss) {
      let checked = tags.includes(os) ? ' checked' : '';
      oss += renderTagAdding(SHOWoss, 'os', os, checked);
    }
    if (typeof links === 'object')
      for (let link in links) {
        Consoles.log(link)
        Consoles.log(links[link])
        linksStr += socialNetwork(link, links[link]);
      }
    else
      linksStr += socialNetwork('youtube', links);

    if (image.includes('./imgs/customuser/') || banner.includes('./imgs/customuser/'))
      fileWarning = 'fileWarning';

    html = 
    `<div id=helperContentProfile>`+
      `<h1${getTrans('editShow')}/h1>`+
      `<form method=POST enctype="multipart/form-data" action='showEdit${php}' onsubmit="return enterFormData(this,'showEdit${php}?id=${gdpsId}')">`+
        `<label${getTrans('addShow01')}/label><br><input value="${title}" class=framelabel type=text name=title style=width:100% required${getTrans('showInput01', 'input')}<br>`+
        `<label${getTrans('addShow02')}/label><br><textarea class=framelabel name=description style=width:100% required${getTrans('showInput02', 'input')}${description}</textarea><br>`+
        `<label${getTrans('addShow03')}/label><br>`+
        `<div id=GDPSesPlace>`+
          linksStr+
        `</div>`+
        `<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(this)>`+
          `<option selected disabled hidden${getTrans('addShow03a')}/option>`+

          `<option value=youtube>youtube</option>`+
          `<option value=discord>discord</option>`+
          `<option value=telegram>telegram</option>`+
        `</select><br>`+
        
        `<label${getTrans('gdpsLang00')}/label><br>`+
        `<select id="langs" class="framelabel" name="language" required>`+
          `<option ${lang == 'RU' ? 'selected' : ''} value="RU"${getTrans('gdpsLang01')}/option>`+
          `<option ${lang == 'EN' ? 'selected' : ''} value="EN"${getTrans('gdpsLang02')}/option>`+
          `<option ${lang == 'ES' ? 'selected' : ''} value="ES"${getTrans('gdpsLang03')}/option>`+
        `</select><br><br>`+

        `<h2${getTrans('showInput06')}/h2>`+
        (fileWarning ? `<p${getTrans('fileWarning')}/p>` : '')+
        `<label${getTrans('addShow04')}/label><br>`+
        `<div id=mediaselectorimg>`+
          `<input value="${image}" class=framelabel type=text name=img style=width:40%${getTrans('showInput04', 'input')}`+
          `<button class=loginbtn onclick="mediaselector('img','tofile')"${getTrans('showInput07')}/button>`+
        `</div><br>`+
        `<label${getTrans('addShow07')}/label><br>`+
        `<div id=mediaselectorban>`+
          `<input value="${banner}" class=framelabel type=text name=ban style=width:40%${getTrans('showInput04', 'input')}`+
          `<button class=loginbtn onclick="mediaselector('ban','tofile')"${getTrans('showInput07')}/button>`+
        `</div><br><br>`+
    
        `<label${getTrans('addShow05')}/label><br>`+        
        `<div style="display:flex;flex-wrap:wrap">`+
          tagss+
        `</div><br>`+
        `<label${getTrans('addShow06')}/label><br>`+
        `<div style="display:flex;flex-wrap:wrap">`+
          oss+
        `</div><br><br>`+
        `<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('editShow', 'inputValue')}<br>`+
        `<p${getTrans('afterShow')}/p><br>`+
      `</form>`+
    `</div>`;
    innerProfile(html);
    Loading(1);
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
createWiki = function(backpage = 0) {
  setLink('wikiNew');
  let html = pHeader()+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(wikisWindow()))` : `pageWikiList()`}"${getTrans('otmena')}/button><br>`+
    `<form id=GDPSesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'newWiki${php}')">`+
      `<input name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs" class="framelabel" name="language" required>`+
        `<option value="RU"${getTrans('gdpsLang01')}/option>`+
        `<option value="EN"${getTrans('gdpsLang02')}/option>`+
        `<option value="ES"${getTrans('gdpsLang03')}/option>`+
      `</select><br>`+
      `<input name=img class=guidInp id=img${getTrans('guides05', 'input')}`+
      `<textarea name=text style=width:100%;height:240px class=guidInp style=width:210px${getTrans('textInput02', 'textarea')}/textarea><br>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  innerMain(html);
},
editWiki = function(wikiId, backpage = 0) {
  let html = pHeader()+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(wikisWindow()))` : `pageWikiList()`}"${getTrans('otmena')}/button><br>`+
    `<form id=GDPSesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'editWiki${php}?id=${wikiId}')">`+
      `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs" class="framelabel" name="language" required>`+
        `<option value="RU"${getTrans('gdpsLang01')}/option>`+
        `<option value="EN"${getTrans('gdpsLang02')}/option>`+
        `<option value="ES"${getTrans('gdpsLang03')}/option>`+
      `</select><br>`+
      `<input name=img class=guidInp id=img${getTrans('guides05', 'input')}`+
      `<textarea id=text name=text style=width:100%;height:240px class=guidInp style=width:210px ${getTrans('textInput02', 'textarea')}/textarea><br>`+
      `<input type=hidden value=${wikiId} name=wikiId>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[1]}editWiki${php}?id=${wikiId}`)
    .then(function(data) {
      if (data == '["NONE"]') {
        p(profilePage());
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      let parsedData = JSON.parse(data);
      setLink('wikiEdit='+wikiId);
      getElement('title').value = parsedData.title;
      getElement('text').value = parsedData.text;
      getElement('img').value = parsedData.ban;
      if (document.querySelector(`[value=${parsedData.language}]`))
        document.querySelector(`[value=${parsedData.language}]`).setAttribute('selected', ' ');
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},

// #region гайдфреймы ака таблицы и блоки

generateGuideframe = function(HTMelement) {
  switch (HTMelement.value) {
    case 'MediaRender':
      newGuideFrame(guideEditorFrame, ['MediaRender', ''], getTrans('MediaRender', 'input'));
      break;
    case 'wikiText':
      newGuideFrame(guideEditorFrame, ['wikiText', ''], getTrans('wikiText', 'input'));
      break;
    default:
    case 'Markdown':
      newGuideFrame(guideEditorFrame, ['Markdown', ''], getTrans('Markdown', 'input'));
      break;
  }
},
newGuideFrame = function(id = 0, customContent = null, textAreaHelp = '') {
  if (textAreaHelp == '')
    textAreaHelp = getTrans(customContent[0], 'input');
  let html =
  `<div class=frameguide id=frame${id} style=position:relative>`+
    `<input name=subtitle[] ${customContent !== null ? `value="${customContent[0]}"` : ''} type=hidden style=width:100%;font-size:calc(var(--def-font)*1.5)${getTrans('guides06', 'input')}<br>`+
    `<button style="position:absolute;top:20px;right:20px;padding:2px 4px"`+`
     class=loginbtn onclick="removeGuide(${id})" type=button>`+
      `<img style="margin:0" width="24px" src="${helperUrl}imgs/trash.svg">`+
    `</button>`+
    `<textarea name=subtext[] class=guidInp style=width:100%;height:240px${textAreaHelp}${customContent !== null ? customContent[1] : ''}</textarea>`+
  `</div><br>`;

  getElement('frames').insertAdjacentHTML('beforeend', html);
  getElement('framesSelector').selectedIndex = 0;
  guideEditorFrame++;
  return html;
},
removeGuide = function(id) {
  getElement('frame'+id).remove();
},

// #endregion

createGuide = function(wikiId, backpage = 0) {
  setLink('wikiPageNew='+wikiId);
  let html = pHeader()+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(''));getGuidesAdmin(${wikiId})` : `pageGuides(${wikiId})`}"${getTrans('otmena')}/button><br>`+
    `<form id=GDPSesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'newGuide${php}')">`+
      `<input name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs" class="framelabel" name="language" required>`+
        `<option value="RU"${getTrans('gdpsLang01')}/option>`+
        `<option value="EN"${getTrans('gdpsLang02')}/option>`+
        `<option value="ES"${getTrans('gdpsLang03')}/option>`+
      `</select><br>`+
      `<input name=img class=guidInp id=img${getTrans('guides05', 'input')}`+
      `<div id=frames>`+
      `</div>`+
      //`<button type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
      `<select id=framesSelector class=framelabel name=language required onchange=generateGuideframe(this)>`+
        `<option selected disabled hidden${getTrans('guides03')}/option>`+

        `<option value=Markdown>Markdown</option>`+
        `<option value=wikiText>wikiText</option>`+
        `<option value=MediaRender>MediaRender</option>`+
      `</select><br>`+
      `<input name=aftertext class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
      `<input type=hidden value=${wikiId} name=wikiId>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  innerMain(html);
},
editGuide = function(guideId, wikiId, backpage = 0) {
  let html = pHeader()+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(''));getGuidesAdmin(${wikiId})` : `pageGuides(${wikiId})`}"${getTrans('otmena')}/button><br>`+
    `<form id=GDPSesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'editGuide${php}?id=${guideId}')">`+
      `<input name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs" class="framelabel" name="language" required>`+
        `<option value="RU"${getTrans('gdpsLang01')}/option>`+
        `<option value="EN"${getTrans('gdpsLang02')}/option>`+
        `<option value="ES"${getTrans('gdpsLang03')}/option>`+
      `</select><br>`+
      `<input name=img class=guidInp id=img${getTrans('guides05', 'input')}`+
      `<div id=frames>`+
      `</div>`+
      //`<button type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
      `<select id="framesSelector" class="framelabel" name="language" required onchange=generateGuideframe(this)>`+
        `<option selected disabled hidden${getTrans('guides03')}/option>`+

        `<option value=Markdown>Markdown</option>`+
        `<option value=wikiText>wikiText</option>`+
        `<option value=MediaRender>MediaRender</option>`+
      `</select><br>`+
      `<input name=aftertext id=aftertext class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
      `<input type=hidden value=${wikiId} name=wikiId>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[1]}editGuide${php}?id=${guideId}`)
  .then(function(data) {
    if (data == '["NONE"]') {
      p(profilePage());
      megaAlert('CONTENTISNULL');
      Loading(1);
      return;
    }
    setLink('wikiPageEdit='+guideId+'.'+wikiId);
    let parsedData = JSON.parse(data),
      guideinfo = parsedData['guideinfo'];

    getElement('title').value = guideinfo[1];
    getElement('aftertext').value = guideinfo[2];
    document.querySelector(`[value=${guideinfo[3]}]`).setAttribute('selected', '');
    getElement('img').value = guideinfo[4];
    
    let guidedata = parsedData['guidedata'];
    innerGdpsPlace(`<input name=guidId value=${guideId} type=hidden>`,1);
    guideEditorFrame = 1;
    guidedata.forEach(function(guid) {
      Consoles.log(guid)
      newGuideFrame(guideEditorFrame, guid);
    });
    Loading(1);
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},

// #endregion
// #region всплывающие окна
openWindow = function(windowId, htmlContent, customAttrs = 'style=top:72px;left:24px') {
  let fullWindowId = windowsCount+windowId,
  html =
  `<div class="upperWindow frameprofile ANIM-create2" id=${fullWindowId} ${customAttrs}>`+
    `<div align=right class=underWindow id=DRAGGER${fullWindowId}>`+
      `<div style=position:absolute;left:2px>${fullWindowId}</div>`+
      windowButton('–', `hideWindow('${fullWindowId}')`, `font-weight:bold`)+
      windowButton('X', `closeWindow('${fullWindowId}')`, `font-weight:bold`)+
    `</div>`+
    htmlContent+
  `</div>`;
  helperWindows.insertAdjacentHTML('beforeend', html);
  let Window = getElement(fullWindowId);
  Window.onanimationend = function() {
    Window.classList.remove('ANIM-create2');
    Window.onanimationend = null;
  };
  initDragger(windowId);
  return windowsCount++;
},
initDragger = function(windowId) {
  let Window = getElement(windowsCount+windowId),
    pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0,

  startDrag = function(e) {
    let target = e.target;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      if ('ontouchstart' in window) {
        stopDrag(e);
        return;
      }
      return;
    }

    helperWindows.appendChild(Window);

    e.preventDefault();
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos3 = clientX;
    pos4 = clientY;
    
    document.onmouseup = stopDrag;
    document.ontouchend = stopDrag;

    document.onmousemove = draggerMove;
    document.ontouchmove = draggerMove;
  },

  draggerMove = function(e) {
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    Window.style.top = (Window.offsetTop - pos2) + "px";
    Window.style.left = (Window.offsetLeft - pos1) + "px";
  },

  stopDrag = function() {
    document.onmouseup = null;
    document.ontouchend = null;

    document.onmousemove = null;
    document.ontouchmove = null;
  }

  let draggerElement = getElement(`DRAGGER${Window.id}`) || Window;

  draggerElement.onmousedown = startDrag;
  draggerElement.ontouchstart = startDrag;
},
closeWindow = function(windowId) {
  let Window = getElement(windowId);
  if (Window)
    Window.classList.add('ANIM-stop2');

  Window.onanimationend = function() {
    Window.remove();
  };
},
hideWindow = function(windowId) {
  let Window = getElement(windowId);
  if (Window)
    Window.classList.add('ANIM-hide2');

  Window.onanimationend = function() {
    Window.style.display = 'none';
    Window.classList.remove('ANIM-hide2');
    helperHider.insertAdjacentHTML('beforeend', basicButton(`>${windowId}<`, `unhideWindow('${windowId}')`, ``, `hider${windowId}`));
    Window.onanimationend = null;
  };
},
unhideWindow = function(windowId) {
  let Window = getElement(windowId),
    hider = getElement('hider'+windowId);
  if (Window) {
    Window.classList.add('ANIM-recreate2');
    Window.style.display = '';
  }
  if (hider)
    hider.remove();

  Window.onanimationend = function() {
    Window.classList.remove('ANIM-recreate2');
    Window.onanimationend = null;
  };
},

ADwrite = (inputText = '')=>{
  openWindow('REPform', 
    `<h1>Write Alarm!!!</h1>`+
    `<form onsubmit="return enterFormData(this,'writeAlarm${php}')">`+
      `<input placeholder="userId (not username)" class=framelabel name=user>`+
      `<input placeholder=title class=framelabel name=title value="${inputText}"><br>`+
      `<textarea placeholder=text class=framelabel name=text></textarea><br>`+
      `<button onclick="getElement('F45').remove()" class=loginbtn>close</button>`+
      `<input type=submit value=send class=loginbtn>`+
    `</form>`
  );
},
loginPage = function() {
  let id = openWindow('logonWindow',
    `<h1${getTrans('login')}/h1>`+
    `<input style=width:75%  id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login01', 'input')}<br><br>`+
    `<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}`+
    `<button class=emptybtn onclick=seePassword()>`+
      `<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>`+
    `</button><br><br>`+
    `<div id=${windowsCount}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>`+
    `<button style=width:100% onclick="innerMain(dropWindow())" class="loginbtn"${getTrans('remindPass')}/button><br><br>`+
    `<button style=width:100% onclick="sendLoginForm(${windowsCount})" class="loginbtn"${getTrans('joinToGdps')}/button><br>`+
    `<br><button style=width:100% class="loginbtn" onclick="closeWindow('${windowsCount}logonWindow')"${getTrans('back')}/button>`+
    `<p align=right${getTrans('helperVer')}/p>`
  , 'isloginwindow style=top:72px;left:24px');
  loadScript('https://www.google.com/recaptcha/api.js', function(id){captchaLoad ? grecaptcha.render(id) : captchaLoad = true}, id+'cap');
},
registerPage = function() {
  let id = openWindow('logonWindow',
    `<h1${getTrans('register')}/h1>`+
    `<input style=width:75% id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login06', 'input')}<br><br>`+
    `<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}`+
    `<button class=emptybtn onclick=seePassword()>`+
      `<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>`+
    `</button><br><br>`+
    `<input style=width:75% id="LGemail" class="framelabel" required ${getTrans('login03', 'input')}<br><br>`+
    `<div id=${windowsCount}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>`+
    `<button style=width:100% onclick="sendRegisterForm(${windowsCount})" class="loginbtn"${getTrans('register')}/button><br>`+
    `<br><button style=width:100% class="loginbtn" onclick="closeWindow('${windowsCount}logonWindow')"${getTrans('back')}/button>`+
    `<p align=right${getTrans('helperVer')}/p>`
  , 'isloginwindow style=top:72px;left:24px');
  loadScript('https://www.google.com/recaptcha/api.js', function(id){captchaLoad ? grecaptcha.render(id) : captchaLoad = true}, id+'cap');
},
loadScript = function(url, callback = function(){}, args = '') {
  if (scripts.includes(url) == false) {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function() {
      scripts.push(url);
      callback(args);
    };
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else
    callback(args);
},
gdpsReport = function(gdpsId) {
  openWindow('REPform',
    `<h1${getTrans('report01')}/h1>`+
    `<form id=${windowsCount}formREP onsubmit="return enterFormData(this,'report${php}')">`+
      `<input name=gdps value="${gdpsId}" type=hidden>`+
      `<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report02', 'textarea')}/textarea><br>`+
      `<button onclick="getElement('${windowsCount}formREP').setAttribute('onsubmit','return false');closeWindow('${windowsCount}REPform')" class=loginbtn${getTrans('otmena')}/button>`+
      `<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}`+
    `</form>`
  );
},
forumReport = function(postId) {
  openWindow('REPform', 
    `<h1${getTrans('report01')}/h1>`+
    `<form id=${windowsCount}formREP onsubmit="return enterFormData(this,'report${php}')">`+
      `<input name=gdps value="${postId}" type=hidden>`+
      `<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report03', 'textarea')}/textarea><br>`+
      `<button onclick="getElement('${windowsCount}formREP').setAttribute('onsubmit','return false');closeWindow('${windowsCount}REPform')" class=loginbtn${getTrans('otmena')}/button>`+
      `<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}`+
    `</form>`
  );
},
createForum = function(forumId, step = 0) {
  if (step == 0) {
    openWindow('FORUM_ALERT',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<p style=min-width:180px${getTrans('forumAlert')}/p><br>`+
        `<button onclick=createForum(${forumId},1);closeWindow('${windowsCount}FORUM_ALERT') class=loginbtn${getTrans('yes')}/button>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}FORUM_ALERT')" class=loginbtn${getTrans('no')}/button>`+
      `</form>`
    )
  } else {
    Loading();
    helperRequest(`${sData[6]}create${php}`, `id=${forumId}`)
      .then(function(data) {
        Loading(1);
        openForum(data);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  }
},
getConfInfo = function(step = 0) {
  if (step == 0) {
    openWindow('F45',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=LGpassword${getTrans('login02', 'input')}<br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}F45')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=getConfInfo(1);closeWindow('${windowsCount}F45') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    );
  } else {
    let password = getElement('LGpassword').value;
    Loading();
    helperRequest(`${sData[5]}getAccInfo${php}`, 'password='+password)
      .then(function(data) {
        if (data == '-1') {
          megaAlert('wrongPass');
        } else {
          let parsedData = JSON.parse(data),
            html2 = `<span${getTrans('login06')}/span>: ${parsedData[0]}<br>`+
            `<span${getTrans('login03')}/span>: ${parsedData[1]}<br><br>`+
            `<button onclick="closeWindow('${windowsCount}F90')" class=loginbtn${getTrans('back')}/button>`;      
            openWindow('F90', html2);
        }
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  }
},
connectContent = function(wikiId, step = 0) {
  if (step == 0) {
    openWindow('F45', 
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=contentId placeholder="ContentId"><br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}F45')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=connectContent(${wikiId},1);closeWindow('${windowsCount}F45') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    )
  } else {
    let id = getElement('contentId').value;
    Loading();
    helperRequest(`${sData[3]}conntectContent${php}`, `id=${id}&connectTo=${wikiId}`)
      .then(function(data) {
        if (data == 0) {
          if (id == 0) {
            id = myguides[0]['w'+wikiId].wiki;
            myguides[0]['w'+wikiId].wiki = 0;
            if (myCamps[0]['g'+id])
              myCamps[0]['g'+id].wiki = 0;
            profilePage();
          } else {
            myCamps[0]['g'+id].wiki = wikiId;
            myguides[0]['w'+wikiId].wiki = id;
            getCamp(id);
          }
        } else {
          if (id == 0) {
            id = myguides[0]['w'+wikiId].wiki;
            myguides[0]['w'+wikiId].wiki = 0;
            if (myShows[0]['t'+id])
              myShows[0]['t'+id].wiki = 0;
            profilePage();
          } else {
            myShows[0]['t'+id].wiki = wikiId;
            myguides[0]['w'+wikiId].wiki = id;
            getShow(id);
          }
        }
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  }
},
connectWiki = function(contentId, type = 'c', step = 0) {
  if (step == 0) {
    openWindow('F45',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=wikiId placeholder="WikiId"><br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}F45')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=connectWiki(${contentId},'${type}',1);closeWindow('${windowsCount}F45') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    )
  } else {
    let id = getElement('wikiId').value;
    Loading();
    helperRequest(`${sData[3]}conntectWiki${php}`, `id=${id}&connectTo=${contentId}`)
      .then(function(data) {
        if (data == 0) {
          if (id == 0) {
            id = myCamps[0]['g'+contentId].wiki;
            myCamps[0]['g'+contentId].wiki = 0;
            if (myguides[0]['w'+id])
              myguides[0]['w'+id].wiki = 0;
            profilePage();
          } else {
            myCamps[0]['g'+contentId].wiki = id;
            myguides[0]['w'+id].wiki = contentId;
            getCamp(contentId);
          }
        } else {
          if (id == 0) {
            id = myShows[0]['t'+contentId].wiki;
            myShows[0]['t'+contentId].wiki = 0;
            if (myguides[0]['w'+id])
              myguides[0]['w'+id].wiki = 0;
            profilePage();
          } else {
            myShows[0]['t'+contentId].wiki = id;
            myguides[0]['w'+id].wiki = contentId;
            getShow(contentId);
          }
        }
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  }
},
setMainWiki = function(contentId, guideId, step = 0) {
  if (step == 0) {
    if (getElement('wikiId'))
      return;
    openWindow('F45',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=wikiId value=${guideId} placeholder="WikiId"><br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}F45')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=setMainWiki(${contentId},${guideId},1);closeWindow('${windowsCount}F45') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    )
  } else {
    let guideId = getElement('wikiId').value;
    Loading();
    helperRequest(`${sData[1]}setMainWiki${php}`, `wiki=${contentId}&guide=${guideId}`)
      .then(function(data) {
        getGuide(data,contentId);
        Loading(1);
      })
      .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  }
},
// #endregion
// #region рендер контента (шоу, кемпы)
toStringGDPS = function(tag) {
  let findArr = Object.assign({}, GDPStags, GDPSoss);
  return findArr[tag];
},
toStringSHOW = function(tag) {
  let findArr = Object.assign({}, SHOWtags, SHOWoss);
  return findArr[tag];
},

GDPSrenderMini = function(parsedData, joinData = '') {
  let html = '',
    Count = 0,
    preHtml = [],
    gdpsData = null,
    Tags = null,
    renderJoinLink = null,
    tagsOs = '';

  for (let Id in parsedData) {
    Count++;
    tagsOs = '';
    if (Count == 9)
      return html;

    gdpsData = parsedData[Id];
    
    Tags = JSON.parse(gdpsData.tags).concat(JSON.parse(gdpsData.os));
    Tags.forEach(function(tag){
      tagsOs += `<div class="tag"${getTrans(toStringGDPS(tag))}/div>`;
    });
    renderJoinLink = gdpsData.freejoin;

    renderJoinLink = renderJoinLink ? '' : `<a class="loginbtnGDPS" href="join${php}?id=${gdpsData.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`;

    preHtml = [joinData, renderJoinLink, tagsOs, 'width:300px;height:450px', 0, 0];
    html += contentRenderMinu(gdpsData, preHtml);
  }
  return html;
},
SHOWrenderMini = function(parsedData, joinData = '') {
  let html = '',
    Count = 0,
    preHtml = [],
    gdpsData = null,
    Tags = null,
    renderJoinLink = null,
    tagsOs = '';

  for (let Id in parsedData) {
    Count++;
    tagsOs = '';
    if (Count == 9)
      return html;

    gdpsData = parsedData[Id];
    
    Tags = JSON.parse(gdpsData.tags).concat(JSON.parse(gdpsData.os));
    Tags.forEach(function(tag){
      tagsOs += `<div class="tag"${getTrans(toStringSHOW(tag))}/div>`;
    });
    renderJoinLink = gdpsData.freejoin;

    renderJoinLink = renderJoinLink ? '' : `<a class="loginbtnGDPS" href="join${php}?id=${gdpsData.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`;

    preHtml = [joinData, renderJoinLink, tagsOs, 'width:300px;height:450px', 1, 0];
    html += contentRenderMinu(gdpsData, preHtml);
  }
  return html;
},
renderWiki = function(parsedData, page = 0) {
  page++
  let html = '',
    Count =  0,
    preHtml = [],
    gdpsData = null;

  for (let Id in parsedData) {
    Count++;
    if (Count == 9) {
      innerGdpsPlace(insertBtn(`getWikis(${page})`),-1);
      return html;
    }

    gdpsData = parsedData[Id];

    preHtml = ['', '', '', 'width:300px;height:290px', 2, 8];
    html += contentRenderMinu(gdpsData, preHtml, 0, 1, 0, 0);
  }
  return html;
},
renderGuideMini = function(parsedData, page = 0) {
  page++
  let html = '',
    Count =  0,
    preHtml = [],

    gdpsData = null;

  for (let Id in parsedData) {
    let guid = parsedData[Id];
    if (typeof guid !== 'object') {
      if (typeof guid === 'number' && guid !== 0)
        innerGdpsPlace(insertBtn('openForum('+guid+')', 'forumHas', 0),512);
      if (typeof guid === 'string') 
        getElement('wikiName').innerHTML = guid;
      continue;
    }
    Count++;
	// увеличиваю лимиты под современный протокол
    if (Count == 9) {
      innerGdpsPlace(insertBtn(`getGuides(${globalWiki},${page})`),-1);
      return html;
    }

    gdpsData = {
      ID: guid[0],
      title: guid[1],
      language: guid[2],
      likes: guid[4],
      ban: guid[5],
      isLiked: guid[7]
    };

    preHtml = [globalWiki, '', '', 'width:250px;height:200px', 3, 7];
    html += contentRenderMinu(gdpsData, preHtml, 0, 0, 0, 0);
  }
  return html;
},
forumRenderMini = function(parsedData, page = 0) {
  page++
  let html = '',
    Count =  0,
    preHtml = [],
    gdpsData = null;

  for (let Id in parsedData) {
    let guid = parsedData[Id];
    if (typeof guid !== 'object' && typeof guid === 'string') {
      getElement('insertable').innerHTML = '<h1>'+guid+'</h1>';
      continue;
    }
    Count++;
    if (Count == 5) {
      innerGdpsPlace(insertBtn(`getForumPosts(${forumId},${page})`),-1);
      return html;
    }

    gdpsData = {
      ID: guid[0],
      username: guid[2],
      author: guid[3],
      title: guid[4],
      text: guid[5],
      likes: guid[7],
      isLiked: guid[8]
    };

    preHtml = [guid[1], '', '', 'width:300px;height:290px', 4, 9];
    html += contentRenderMinu(gdpsData, preHtml, 1, 1, 0, 0);
  }
  return html;
},

GDPSrender = function(parsedData, joinData = '') {
  let html = '',
    gdpsData = parsedData.gdps,
    Tags = JSON.parse(gdpsData.tags),
    os = JSON.parse(gdpsData.os),
    tagsOs = '';

  Tags.forEach(function(tag) {
    tagsOs += `<div class="tag"${getTrans(toStringGDPS(tag))}/div>`;
  });
  tagsOs += '</div>'+'<div class="flex-row">';
  os.forEach(function(tag) {
    tagsOs += `<div class="tag"${getTrans(toStringGDPS(tag))}/div>`;
  });

  html += contentRender(gdpsData, 0, 0, 0, tagsOs, 1, gdpsData.wiki, gdpsData.ID, joinData);
  return html;
},
SHOWrender = function(parsedData, joinData = '') {
  let html = '',
    gdpsData = parsedData.gdps,
    Tags = JSON.parse(gdpsData.tags),
    os = JSON.parse(gdpsData.os),
    tagsOs = '';

  Tags.forEach(function(tag) {
    tagsOs += `<div class="tag"${getTrans(toStringSHOW(tag))}/div>`;
  });
  tagsOs += '</div>'+'<div class="flex-row">';
  os.forEach(function(tag) {
    tagsOs += `<div class="tag"${getTrans(toStringSHOW(tag))}/div>`;
  });

  html += contentRender(gdpsData, 0, 0, 0, tagsOs, 1, gdpsData.wiki, gdpsData.ID, joinData);
  return html;
},
forumRender = function(post) {
  let html = '',
    gdpsData = {
      postId: post[0],
      forumId: post[1],
      username: post[2],
      author: post[3],
      title: post[4],
      text: post[5],
      date: post[6],
      likes: post[7],
      isLiked: post[8]
    };

  html += contentRender(gdpsData, gdpsData.date, 0, 9, '', 0, 0, gdpsData.ID, '');
  return html;
},
RenderNews = function(data, isComm = 0, innerGdpsRendered = 'mega', backFunc = 'getCamp') {
  Consoles.log(isComm);
  let html = '',
    html2 = '',
    
    gData = null,
    gdpsData = null,
    miniRenderMode = '';

  let myCampsIds = [];
  for (let gdpsKey in myCamps[0]) {
    if (thisUser[1] == myCamps[0][gdpsKey].author)
      myCampsIds.push(myCamps[0][gdpsKey].ID);
  };

  for (let ide in data)  {
    html = '';
    gData = data[ide];
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
      isLiked : gData[9],
    };

    gdpsData.canDel = false;
    if (thisUser[1] == gdpsData.author || myCampsIds.includes(gdpsData.gdpsId) || thisUser[2] > 0) {
      gdpsData.canDel = true;
    }

    html += contentRender(gdpsData, gdpsData.date, 1, 2, '', 0, 0, 0, backFunc, isComm);
    html2 = html2 + html;
  };
  if (html2 == '')
    return `<h1 class=contentAdaptiveBig${getTrans('newsNoneReal')}/h1>`;
  return html2;
},

renderComms = function(parsedData, channel = 0, dataForNextButton = '') {

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
  }

  for (let ide in parsedData) {
    if (commcount == 10) {
      htmlFull = htmlFull + insertBtn(`helperComments(${dataForNextButton})`);
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
    isLiked = gdpsData[7];
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
    `<button onclick="deleteComm(${id},${channel})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
      `<img width=24px src="${helperUrl}imgs/trash.svg">`+
    `</button>`;
    
    html = 
    `<div class="framecomm" id=comm${id}>`+
      `<button style="border:none;background:none;margin:0;font-size:calc(var(--def-font)*2);font-weight:bold;color:${nameColor}"`+
      `onclick="otherProfile(${userId},lastUsedProfile)">${username}</button>`+
      `<p style="margin:0">${timeAgo(date)}</p>`+
      `<p>${commText}</p>`+
      `<div class="likezone">`+
        `<span class=likeplace id="likesCountComm${id}">${likes}</span>`+
        `<button ${isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${id},${likeChannel},1)" class=like id=like${id}></button>`+
        `<button ${isLiked == 1  ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${id},${likeChannel},1)" class=dislike id=dislike${id}></button>`+
      `</div>`+
      (thisUser[1] == userId || thisUser[2] > 0 ? delBtn : '')+
    `</div>`;

    htmlFull = htmlFull + html;

    html = '';
  };
  if (htmlFull == '')
    return `<h1${getTrans('commsNone')}/h1>`;
  return htmlFull;
},
timeAgo = function(timestamp) {
  let timeDiff = Math.floor((Date.now() / 1000) - timestamp);
  Consoles.log(timestamp+"\n"+timeDiff);

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
uploadPost = function(forumId) {
  let html = 
  `<div id=helperContentProfile>`+
    `<h1 id=blacktext${getTrans('newPost')}/h1>`+
    `<form method=post onsubmit="return enterFormData(this,'forumPost${php}')">`+
      `<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>`+
      `<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>`+
      `<input type=hidden name=forumId value=${forumId}>`+
      `<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}`+
    `</form>`+
  `</div>`;
  return html;
},

makeBetaAlert = function() {
  helperMain.insertAdjacentHTML('afterend',
    `<div class=ALERT id=BETAalert style=position:absolute;top:20%;left:50%><h1>BETA!</h1>`+
      `<p>Спешим вам сообщить что это бета версия сайта, а это значит что есть вероятность что мы внезапно удалим все аккаунты или сделаем что то похожее чтобы приблизить вас к выходу релиза сайта.</p>`+
      `<p>Пожалуйста, сообщайте о любых найденных багах и недочётах на наш дискорд сервер!</p><br>`+
      `<button style=background-color:#333 onclick="Slocal.set('BetaRead',1);getElement('BETAalert').remove()">Понятно</button>`+
    `</div>`
  );
},

checkWikiOwn = function(id) {
  if (wikiesMini.includes(id.toString()))
    return true;
  return false;
},

playDoom = function() {
  getElement('doom').style.padding = '4vh';
  getElement('doom').innerHTML = `<video autoplay src=\"${helperUrl}build2000.mp4\"></video>`; // вау вы нашли пасхалку
},

seePassword = function() {
  if (getElement('LGpassword').type == 'password') {
    getElement('LGpassword').type = 'text';
    getElement('LGbtn').src = helperUrl+'imgs/PSsee.svg';
  } else {
    getElement('LGpassword').type = 'password';
    getElement('LGbtn').src = helperUrl+'imgs/PShide.svg';
  }
},

Markdown = function(mdText) {
	// XXX: защиты в оригинале не было - добавил после патча
	if (!mdText) return;
  // first, handle syntax for code-block
  mdText = mdText.replace(/\r\n/g, '\n');
  mdText = mdText.replace(/\n~~~ *(.*?)\n([\s\S]*?)\n~~~/g, '<pre><code title="$1">$2</code></pre>' );
  mdText = mdText.replace(/\n``\` *(.*?)\n([\s\S]*?)\n``\`/g, '<pre><code title="$1">$2</code></pre>' );

  // split by "pre>", skip for code-block and process normal text
  var mdHTML = '';
  var mdCode = mdText.split( 'pre>');

  for (var i=0; i<mdCode.length; i++) {
    if ( mdCode[i].substr(-2) == '</' ) {
      mdHTML += '<pre>' + mdCode[i] + 'pre>';
    } else {
      mdHTML += mdCode[i].replace(/(.*)<$/, '$1')
      .replace(/^##### (.*?)\s*#*$/gm, '<h5>$1</h5>')
      .replace(/^#### (.*?)\s*#*$/gm, '<h4>$1</h4>')
      .replace(/^### (.*?)\s*#*$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)\s*#*$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)\s*#*$/gm, '<h1>$1</h1>')  

      .replace(/^-{3,}|^\_{3,}|^\*{3,}/gm, '<hr/>')  

      .replace(/``(.*?)``/gm, '<code>$1</code>' )
      .replace(/`(.*?)`/gm, '<code>$1</code>' )

      .replace(/^\>\> (.*$)/gm, '<blockquote><blockquote>$1</blockquote></blockquote>')
      .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')

      .replace(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img style=max-width:100% alt="$1" src="$2" $3 />')
      .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img style=max-width:100% alt="$1" src="$2" />')
      .replace(/\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<a href="$2" title="$3">$1</a>')

      .replace(/\<http(.*)\>/gm, '<a href="http$1">http$1</a>')
      .replace(/\[(.*?)\]\(\)/gm, '<a href="$1">$1</a>')
      .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
      .replace(/\[(.*?)\]\{(.*?)\}/gm, '<a onclick="getCurrentGuideByTag(\'$2\')">$1</a>')

      .replace(/^[\*|+|-][ |.](.*)/gm, '<ul><li>$1</li></ul>' ).replace(/<\/ul\>\n<ul\>/g, '\n' )
      .replace(/^\d[ |.](.*)/gm, '<ol><li>$1</li></ol>' ).replace(/<\/ol\>\n<ol\>/g, '\n' )

      .replace(/\*\*(.*)\*\*/gm, '<b>$1</b>')
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      .replace(/\_\_(.*)\_\_/gm, '<u>$1</u>')
      .replace(/\_(.*)\_/gm, '<em>$1</em>')
      .replace(/~~(.*)~~/gm, '<del>$1</del>')
      .replace(/\^\^(.*)\^\^/gm, '<ins>$1</ins>')

      .replace(/ +\n/g, '\n<br/>')
      .replace(/\n\s*\n/g, '\n<p>\n')
      .replace(/^ {4,10}(.*)/gm, '<pre><code>$1</code></pre>')
      .replace(/^\t(.*)/gm, '<pre><code>$1</code></pre>' );
    }  
  }
  mdHTML = mdHTML.replaceAll("\n", '<br>');
  return mdHTML.trim();
},
MediaRender = function(comicText) {
  let comicArray = comicText.split('\n'),
  comicArr = {};

  if (comicArray.length <= 1)
    return `<div class=comicImage><img style=max-width:100% src=${comicText}></div>`;

  for (let i = 0; i < comicArray.length; i++) {
    comicArr['p'+i] = `<div class=comicImage id=p${i}><img style=max-width:100%;max-height:80vh src=${comicArray[i]}></div> `;
  };
  Consoles.log(JSON.stringify(comicArr));
  let comicStrPre = '';
  
  JSON.stringify(Object.keys(comicArr).forEach(function(i) {
    comicStrPre += comicArr[i];
  }))
  
  let comicStr = `<div style=display:none>${comicStrPre}</div>`,
  html = 
  
  `<div style=display:flex;flex-wrap:wrap;height:80vh>`+
    `<div class=backPage style=flex:10%>`+
      emptyButton('><div align=center style=font-size:calc(var(--def-font)*2)><</div><', `setPage('p0')`, 'width:100%;height:100%', 'backPage')+
    `</div>`+
    `<div align=center style=flex:80%;align-content:center id=pagePlace>`+
      comicArr['p0']+
    `</div>`+
    `<div class=nextPage style=flex:10%>`+
      emptyButton('><div align=center style=font-size:calc(var(--def-font)*2)>></div><', `setPage('p1')`, 'width:100%;height:100%', 'nextPage')+
    `</div>`+
  `</div>`+
  `<h1 class=gdps-list-place id=pageNum>1</h1>`+
  comicStr;
  return html;
},
setPage = function(pageId) {
  getElement('pagePlace').innerHTML = getElement(pageId).innerHTML;

  // логика кнопок, я хз как её насрал!!
  let pageNum = parseInt(pageId.slice(1)),
      pagePre = pageNum - 1,
      pageNxt = pageNum + 1;

  getElement('pageNum').innerHTML = pageNxt;
  if (getElement('p'+pagePre))
    getElement('backPage').setAttribute('onclick', `setPage('p${pagePre}')`);
  if (getElement('p'+pageNxt))
    getElement('nextPage').setAttribute('onclick', `setPage('p${pageNxt}')`);
},
wikiText = function(wikitext) {
    if (!wikitext) return '';

    // Обработка заголовков (==, ===, ====)
    let html = wikitext
        .replace(/====(.+?)====/g, '<h4>$1</h4>')
        .replace(/===(.+?)===/g, '<h3>$1</h3>')
        .replace(/==(.+?)==/g, '<h2>$1</h2>');

    // Жирный, курсив и комбинации (''', '')
    html = html
        .replace(/&#039;&#039;&#039;&#039;&#039;(.+?)&#039;&#039;&#039;&#039;&#039;/g, '<strong><em>$1</em></strong>')
        .replace(/&#039;&#039;&#039;(.+?)&#039;&#039;&#039;/g, '<strong>$1</strong>')
        .replace(/&#039;&#039;(.+?)&#039;&#039;/g, '<em>$1</em>')
        .replace(/'''''(.+?)'''''/g, '<strong><em>$1</em></strong>')
        .replace(/'''(.+?)'''/g, '<strong>$1</strong>')
        .replace(/''(.+?)''/g, '<em>$1</em>');

    // Списки (#, *)
    html = html
        .replace(/^##\s*(.+)$/gm, '<ol>$1</ol>')  // Нумерованные
        .replace(/^\*\*\s*(.+)$/gm, '<ul>$1</ul>') // Маркированные
        .replace(/^#\s*(.+)$/gm, '<li>$1</li>')  // Нумерованные
        .replace(/^\*\s*(.+)$/gm, '<li>$1</li>'); // Маркированные

    // Ссылки ([[Статья]] или [[Статья|Текст]])
    html = html
        .replace(/\[\[([^|\]]+?)\]\]/g, '<a href="$1">$1</a>')
        .replace(/\[\[([^|\]]+?)\|(.+?)\]\]/g, '<a href="$1">$2</a>');

    // Внешние ссылки ([https://example.com Текст])
    html = html
        .replace(/\[(https?:\/\/[^\s]+)\]/g, '<a href="$1">$1</a>')
        .replace(/\[(https?:\/\/[^\s]+)\s(.+?)\]/g, '<a href="$1">$2</a>');

    // Таблицы ({| ... |})
    html = html.replace(/\{\|([\s\S]+?)\|\}/g, function(match, tableContent){
        const rows = tableContent.split('|-').filter(function(row) {row.trim()});
        let tableHtml = '<table border="1">';
        rows.forEach(function(row) {
            tableHtml += '<tr>';
            const cells = row.split('|').filter(function(cell) {cell.trim()});
            cells.forEach(function(cell) {
                if (cell.trim().startsWith('!')) {
                    tableHtml += `<th>${cell.replace('!', '').trim()}</th>`;
                } else {
                    tableHtml += `<td>${cell.trim()}</td>`;
                }
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</table>';
        return tableHtml;
    });

    // Обёртка списков в <ul>/<ol>
    html = html.replace(/(<li>.*<\/li>)+/g, function(match) {
        return match.includes('#') 
            ? `<ol>${match}</ol>` 
            : `<ul>${match}</ul>`;
    });

    // Переносы строк -> <br> (опционально)
    html = html.replace(/\n/g, '<br>');

    return html;
},

switchLangMenu = function() {
  let preLang = '';
  langList.forEach(function(lang) {
    preLang += 
    `<button onclick="switchLang('${lang}')" style="width:40px;margin:2px" class="emptybtn">`+
      `<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
    `</button>`;
  });
  return `<div id=switchHtmlLang2 style="position:absolute;top:0px;left:48px;padding:8px;border:solid var(--color-black) 3px;border-radius:var(--def-border-small);background-color:rgba(255,255,255,.1);">`+
    preLang+
  `</div>`;
},
switchLang = function(lang = 32) {
  if (lang === 32) {
    if (!getElement('switchHtmlLang2')) {
      getElement('switchHtmlLang').insertAdjacentHTML('beforeend', switchLangMenu());
    } else {
      getElement('switchHtmlLang2').remove();
    }
  } else {
    translateReplaceLang(lang);
    getElement('switchHtmlLang2').remove()
  }
},

switchLoginMenu = function(predrop) {
  if (thisUser[1] === 0) {
    loginPage();
    return '';
  }
  if (predrop === 'predrop')
    predrop = '';
  let preLang = '';
  preLang +=
  `<button style="width:80px" class="emptybtn" onclick="${predrop}innerMain(profilePage())">`+
    `<span${getTrans('profile')}/span>`+
  `</button>`+
  `<button style="width:80px" class="emptybtn" onclick="${predrop}gLogout()">`+
    `<span${getTrans('logout')}/span>`+
  `</button>`;
  return `<div id=switchHtmlLogin2 style="position:absolute; bottom:-55px; right:0px; padding:8px; border:solid var(--color-black) 3px;border-radius:var(--def-border-small); background-color:rgba(255,255,255,.1);">`+
    preLang+
  `</div>`;
},
switchLogin = function(lang = 32, predrop = '') {
  if (lang === 32) {
    if (!getElement('switchHtmlLogin2')) {
      getElement('switchHtmlLogin').insertAdjacentHTML('beforeend', switchLoginMenu(predrop))
    } else {
      getElement('switchHtmlLogin2').remove()
    }
  } else {
    getElement('switchHtmlLogin2').remove()
  }
},
profileSwitcherPhone = function() {
  let
  profileNavPhone = getElement('phoneSelectorSmall'),
  profileContent = getElement('helperContentProfile');

  if (headerPhoneSwitcher !== 1) {
    headerPhoneSwitcher = 1;
    profileNavPhone.style.display = 'grid';
    profileContent.style.display = 'none';
  } else {
    headerPhoneSwitcher = 0;
    profileNavPhone.style.display = 'none';
    profileContent.style.display = 'block';
  }
},
switchMobileMain = function() {
  let 
  helperNavPhone = getElement('helperSecond'),
  pageContent = getElement('helperContent');

  if (headerPhoneSwitcher !== 2) {
    headerPhoneSwitcher = 2;
    helperNavPhone.style.display = 'grid';
    pageContent.style.display = 'none';
  } else {
    if (getElement('phoneSelectorSmall') && getElement('phoneSelectorSmall').style.display === 'grid' && headerPhoneSwitcher !== 0) {
      headerPhoneSwitcher = 1;
      helperNavPhone.style.display = 'none';
      pageContent.style.display = 'block';
    } else {
      headerPhoneSwitcher = 0;
      helperNavPhone.style.display = 'none';
      pageContent.style.display = 'block';
    }
  }
},

Loading = function(stop = 0, ignoreLang = 1) {
  if (stop == 0)
    document.body.insertAdjacentHTML('beforeend',
      `<div class=ALERT id=TheLoadElem style=position:fixed;top:20%;left:50%>`+
        `<img class=Loading${ignoreLang ? getTrans('loading...','img') : ' src=https://objecthub.xyz/imgs/load.svg'}>`+
      `</div>`
    );
  else 
    if (getElement('TheLoadElem'))
      getElement('TheLoadElem').remove();
  return stop;
},
linkCopy = function(string) {
  navigator.clipboard.writeText(string)
    .then(function() {})
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  megaAlert('copied');
},
megaAlert = function(text, waitTime = 3000) {
  innerMain(`<div class=ALERT id=alert style=top:20%;left:50%><h1${getTrans(text)}/h1></div>`,1);
  setTimeout(function() {
    getElement('alert').remove();
  }, waitTime);
},

enterFormData = function(form, sendPlace) {
  let FORMDATA = new FormData(form);
  params = '';

  switch (sendPlace) {
    case 'newsPost'+php:
      if (FORMDATA.get('gdps').startsWith('s')) {
        FORMDATA.append('type', 1);
        FORMDATA.set('gdps', FORMDATA.get('gdps').slice(1))
      } else if (FORMDATA.get('gdps').startsWith('c')) {
        FORMDATA.append('type', 0);
        FORMDATA.set('gdps', FORMDATA.get('gdps').slice(1))
      } else
        FORMDATA.append('type', 0);
      break;
  }

  let postHasFiles = false;
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

  Loading();
  helperRequest(`${sData[1]}${sendPlace}`, params)
  .then(function(data) {
    if (sendPlace.indexOf('?') !== -1)
      sendPlace = sendPlace.split('?')[0];
    switch (sendPlace) {
      case 'forumPost'+php:
        let parsedData = JSON.parse(data);
        getForumPost(parsedData[0],parsedData[1]);
        break;
      case 'newsPost'+php:
        if (FORMDATA.get('type') == 1)
          getShow(FORMDATA.get('gdps'));
        else 
          getCamp(FORMDATA.get('gdps'));
        break;
      case 'writeAlarm'+php:
        getElement('F45').remove();
        break;
      case 'report'+php:
        megaAlert('reported', 1000);
        closeWindow(windowsCount+'REPform');
        break;
      case 'newGuide'+php:
        getGuide(data, FORMDATA.get('wikiId'));
        break;
      case 'editGuide'+php:
        getGuide(data, FORMDATA.get('wikiId'));
        break;
      case 'newWiki'+php:
        pageGuides(data);
        break;
      case 'editWiki'+php:
        pageGuides(data);
        break;
      case 'refreshGdps'+php:
        closeWindow(windowsCount+'link'+FORMDATA.get('gdps'));
        if (data === FORMDATA.get('link')) 
          megaAlert('reported');
        else 
          megaAlert('otmena');
        break;
      default:
        let serverResp = JSON.parse(data);
        CacheCamps = serverResp[1];
        CacheShows = serverResp[2];
        CacheWikis = serverResp[3];
        thisUser = serverResp[0];
        myCamps = [];
        myShows = [];
        myguides = [];
        myCamps.push(serverResp[3][0]);
        myShows.push(serverResp[3][1]);
        myguides.push(serverResp[3][2]);
        innerMain(profilePage());
    };
    Loading(1);
    return false;
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;

  return false;
},
deleteNews = function(id, goBack) {
  Loading();
  helperRequest(`${sData[4]}newsPost${php}?ide=${id}`)
    .then(function(data) {
      if (data == '-1')
        return returnError('Access denied');
      getElement('news'+data).remove();
      goBack ? history.back() : null;
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},

checkOwn = function(contentId, userId, type) {
  let log = logAll;
  if (log === true) Consoles.log(contentId+' '+userId+' '+type);

  if (userId === thisUser[1]) {
    if (log === true) Consoles.log('fullowner');
    return 2;
  }

  if (type === 1) {
    let myCampsIds = [];

    for (let gdpsKey in myCamps[0]) {
      myCampsIds.push(myCamps[0][gdpsKey].ID);
      if (log === true) Consoles.log(myCamps[0][gdpsKey]);
    };
    Consoles.log(myCampsIds);
    Consoles.log(`${myCampsIds}.includes(${contentId})`);
    if (myCampsIds.includes(contentId)) {
      if (log === true) Consoles.log('particalOwner');
      return 1;
    }
  }
  if (type === 2) {
    let myShowsIds = [];

    for (let gdpsKey in myShows[0]) {
      myShowsIds.push(myShows[0][gdpsKey].ID);
      if (log === true) Consoles.log(myShows[0][gdpsKey]);
    };
    Consoles.log(myShowsIds);
    Consoles.log(`${myShowsIds}.includes(${contentId})`);
    if (myShowsIds.includes(contentId)) {
      if (log === true) Consoles.log('particalOwner');
      return 1;
    }
  }
  if (log === true) Consoles.log('fullfalse');
  return 0;
},
// #endregion
// #region страницы в профилях
gProfileMini = function() {
  setLink('profile');
  let accStatus = thisUser[3] ? getTrans('isActive') : getTrans('isNotact'),
    html = 
  `<div id=helperContentProfile>`+
    `<h1${getTrans('yourProf')}/h1>`+
    `<p><span${getTrans('profName')}/span>: <span id=oldNick>${thisUser[0]}</span></p>`+
    `<button onclick="editNickPre()" class=loginbtn${getTrans('edit')}/button>`+
    `<div style=position:relative id=newNick></div>`+
    `<p><span${getTrans('profId')}/span>: ${thisUser[1]}</p>`+
    `<p><span${getTrans('profRole')}/span>: ${toStringRole(thisUser[2])}</p>`+
    `<p><span${getTrans('profAccs')}/span> <span${accStatus}/span></p>`+
    `<button class=loginbtn onclick=gLogout()${getTrans('logout2')}/button><br><br>`+
    `<button class=loginbtn onclick=getConfInfo()${getTrans('getLogin')}/button><br><br>`+
    `<button class=loginbtn onclick="innerMain(dropWindow())"${getTrans('dropPass')}/button>`+
    (thisUser[2] ? '<br><br>'+basicButton('>write ALARMM!!!<', 'ADwrite()') : '');
  html += 
  `</div>`;
  return html;
},
toStringRole = function(id) {
  switch (id) {
    case 0: return getTrans('role00', 0);
    case 1: return getTrans('role01', 0);
    case 2: return getTrans('role02', 0);
    case 3: return getTrans('role03', 0);
  };
},
campsWindow = function() {
  setLink('addedCamps');
  let gdpses = "";
  myCamps.forEach(function(gdps) {
    gdpses+=GDPSrenderInProfileFull(gdps);
  });
  let html =
  `<div id=helperContentProfile>`+
    `<h1${getTrans('yourCamps')}/h1><br>`+
    `<div align=left>`+
    `<button onclick="innerProfile(addCamp())" style=font-size:calc(var(--def-font)*1.5) class=loginbtn${getTrans('addCamp')}/button>`+
    `<button onclick="innerProfile(newsWindow())" style=font-size:calc(var(--def-font)*1.5);margin-top:4px class=loginbtn${getTrans('addNews')}/button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 480px); overflow:auto' align=left>`+
      gdpses+
    `</div>`+
  `</div>`;
  return html;
},
showsWindow = function() {
  setLink('addedShows');
  let gdpses = "";
  myShows.forEach(function(gdps) {
    gdpses+=SHOWrenderInProfileFull(gdps);
  });
  let html =
  `<div id=helperContentProfile>`+
    `<h1${getTrans('yourShows')}/h1><br>`+
    `<div align=left>`+
    `<button onclick="innerProfile(addShow())" style=font-size:calc(var(--def-font)*1.5) class=loginbtn${getTrans('addShow')}/button>`+
    `<button onclick="innerProfile(newsWindow())" style=font-size:calc(var(--def-font)*1.5);margin-top:4px class=loginbtn${getTrans('addNews')}/button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 480px); overflow:auto' align=left>`+
      gdpses+
    `</div>`+
  `</div>`;
  return html;
},
newsWindow = function(contentId = 0, contentType = 'c') {
  let gdpses = '';
  if (contentId === 0) {
    gdpses = `<select style=width:90% class=framelabel name=gdps>`;
    for (let gdpsKey in myCamps[0]) {
      let Gdps = myCamps[0][gdpsKey],
        Gid = Gdps.ID,
        newsTitle = Gdps.title;

      gdpses += `<option value=c${Gid}>${newsTitle}</option>`
    };
    for (let gdpsKey in myShows[0]) {
      let Gdps = myShows[0][gdpsKey],
        Gid = Gdps.ID,
        newsTitle = Gdps.title;

      gdpses += `<option value=s${Gid}>${newsTitle}</option>`
    };
    gdpses += `</select><br>`;
  } else {
    gdpses = `<input type=hidden name=gdps value=${contentType}${contentId}>`;
  }
  let html = 
  `<div id=helperContentProfile>`+
    `<h1 id=blacktext${getTrans('newPost')}/h1>`+
    `<form method=post onsubmit="return enterFormData(this,'newsPost${php}')">`+
      `<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>`+
      `<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>`+
      gdpses+
      `<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}`+
    `</form>`+
  `</div>`;
  return html;
},
wikisWindow = function() {
  setLink('addedWikis');
  let gdpses = "";
  Object.keys(yourWikies).forEach(function(gdps) {
    gdpses+=WIKIrenderInProfileFull([yourWikies[gdps]]);
  });
  let html =
  `<div id=helperContentProfile>`+
    `<h1${getTrans('yourWikis')}/h1><br> `+
    `<div align=left>`+
      `<button onclick="createWiki(1)" style=font-size:calc(var(--def-font)*1.5) class=loginbtn${getTrans('addWIki')}/button>`+
    `</div><br>`+
    profileContentDiv()+
      gdpses+
    `</div>`+
  `</div>`;
  return html;
},
getGuidesAdmin = function(wikiId, page = 0) {
  let html = 
  `<div id=helperContentProfile>`+
    `<button style="font-size:calc(var(--def-font)*1.5)" class="loginbtn" onclick="createGuide(${wikiId},1)"${getTrans('guides01')}/button>`+
    profileContentDiv()+
      `<div id=GDPSesPlace align=left style=display:flex;flex-wrap:wrap></div>`+
    `</div>`+
  `</div>`;
  if (page === 0) {
    globalWiki = wikiId;
    innerProfile(html);
  }
  Loading();
  helperRequest(`${sData[7]}getGuidesAdmin${php}?wiki=${wikiId}&page=${page}`)
  .then(function(data) {
    if (page === 0)
      setLink('wikiEditor='+wikiId);
    let parsedData = JSON.parse(data);

    html = GUIDrenderInProfileFull(parsedData, page);
    innerGdpsPlace(html, page);
    Loading(1);
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
GDPSrenderInProfileFull = function(parsedData) {
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
    connectedWiki = null;

  for (let Id in parsedData) {
    Count++;
    if (Count == 9)
      return html;
    
    gdpsData = parsedData[Id];
    thisId = gdpsData.ID;
    title = gdpsData.title;
    description = gdpsData.text;
    likesCount = gdpsData.likes;
    userId = gdpsData.author;
    username = gdpsData.username;
    pictureLink = gdpsData.img;
    bannerLink = BETA_fixImg(gdpsData.ban);
    renderJoinLink = gdpsData.freejoin;
    checked = gdpsData.checked;
    connectedWiki = gdpsData.wiki;

    if (checked == '0') {
      Points = `<span${getTrans('campunckecked')}/span>`;
    } else if (checked == '-1') {
      Points = `<span${getTrans('campbanned')}/span>`;
    } else {
      PointsPre = ~~(Date.now() / 1000) - gdpsData.points;
      Points = PointsPre > 0 ? `<span${getTrans('isBL')}/span>` : `<span${getTrans('wait1')}/span>${Math.abs(PointsPre)}<span${getTrans('wait2')}/wait>`;
    }
    renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target=_blank${getTrans('joinToGdps')}/a>`;

    let coownersBtn = '';

    if (thisUser[1] == userId)
      coownersBtn = `<button onclick="coownersMenu(${thisId},0)" class=loginbtn style="margin-top:8px"${getTrans('coowners')}/button>`;
    else 
      coownersBtn = `<button class=loginbtn style="margin-top:8px"${getTrans('coownersNone')}/button>`;

    if (connectedWiki === 0)
      connectedWiki = `<button class=loginbtn onclick="connectWiki(${thisId},'c')" style="margin-top:8px"${getTrans('noConnectWiki')}/button>`;
    else
      connectedWiki = `<button class=loginbtn onclick="connectWiki(${thisId},'c')" style="margin-top:8px"${getTrans('connectedWiki')}/button>`;

    html += 
    `<div class="framegdpsOld" style="width:calc(100% - 40px);" id="${thisId}">`+
      `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
      `<p style="display:inline;margin:0">`+
        `<span${getTrans('addedBy')}/span>:`+
        `<button onclick="otherProfile(${userId},'innerMain(pageList())')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
        `<span style=opacity:50%>ContentId: ${thisId}</span>`+
      `</p>`+
      `<div style="min-height:32px;margin:8px 0">`+
        `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
        `<p style=margin:0>${description}</p>`+
      `</div>`+
      `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target="_blank"${getTrans('joinToGdps')}/a>`+
      `<button onclick="editCamp(${thisId})" class=loginbtn style="margin-top:8px"${getTrans('editCamp')}/button>`+
      coownersBtn+
      connectedWiki+
      `<button onclick="getJoinLog(${thisId})" class=loginbtn style="margin-top:8px"${getTrans('joins')}/button><br><br>`+
      `<span${getTrans('isJE')}/span>:<button id=JE${thisId} class="loginbtn" onclick="JEedit(${thisId})"${getTrans(!!renderJoinLink ? 'no' : 'yes')}/button><br>`+
      `<span${getTrans('isBL')}/span>:<button id=BL${thisId} class="loginbtn" ${gdpsData.checked == 1 ? `onclick="ballsUp(${thisId})"` : ''}>${Points}</button>`+
    `</div>`;
  };
  return html;
},
SHOWrenderInProfileFull = function(parsedData) {
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
    connectedWiki = null;

  for (let Id in parsedData) {
    Count++;
    if (Count == 9)
      return html;
    
    gdpsData = parsedData[Id];
    thisId = gdpsData.ID;
    title = gdpsData.title;
    description = gdpsData.text;
    likesCount = gdpsData.likes;
    userId = gdpsData.author;
    username = gdpsData.username;
    pictureLink = gdpsData.img;
    bannerLink = BETA_fixImg(gdpsData.ban);
    renderJoinLink = gdpsData.freejoin;
    checked = gdpsData.checked;
    connectedWiki = gdpsData.wiki;

    if (checked == '0') {
      Points = `<span${getTrans('showunckecked')}/span>`;
    } else if (checked == '-1') {
      Points = `<span${getTrans('showbanned')}/span>`;
    } else {
      PointsPre = ~~(Date.now() / 1000) - gdpsData.points;
      Points = PointsPre > 0 ? `<span${getTrans('isBL')}/span>` : `<span${getTrans('wait1')}/span>${Math.abs(PointsPre)}<span${getTrans('wait2')}/wait>`;
    }
    renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target=_blank${getTrans('joinToGdps')}/a>`;

    let coownersBtn = '';

    if (thisUser[1] == userId)
      coownersBtn = `<button onclick="coownersMenu(${thisId},1)" class=loginbtn style="margin-top:8px"${getTrans('coowners')}/button>`;
    else 
      coownersBtn = `<button class=loginbtn style="margin-top:8px"${getTrans('coownersNone')}/button>`;

    if (connectedWiki === 0)
      connectedWiki = `<button class=loginbtn onclick="connectWiki(${thisId},'s')" style="margin-top:8px"${getTrans('noConnectWiki')}/button>`;
    else
      connectedWiki = `<button class=loginbtn onclick="connectWiki(${thisId},'s')" style="margin-top:8px"${getTrans('connectedWiki')}/button>`;

    html += 
    `<div class="framegdpsOld" style="width:calc(100% - 40px);" id="${thisId}">`+
      `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
      `<p style="display:inline;margin:0">`+
        `<span${getTrans('addedBy')}/span>:`+
        `<button onclick="otherProfile(${userId},'innerMain(pageList())')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
        `<span style=opacity:50%>ContentId: ${thisId}</span>`+
      `</p>`+
      `<div style="min-height:32px;margin:8px 0">`+
        `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
        `<p style=margin:0>${description}</p>`+
      `</div>`+
      `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target="_blank"${getTrans('joinToGdps')}/a>`+
      `<button onclick="editShow(${thisId})" class=loginbtn style="margin-top:8px"${getTrans('editShow')}/button>`+
      coownersBtn+
      connectedWiki+
      `<button onclick="getJoinLog(${thisId})" class=loginbtn style="margin-top:8px"${getTrans('joins')}/button><br><br>`+
      `<span${getTrans('isJE')}/span>:<button id=JE${thisId} class="loginbtn" onclick="JEedit(${thisId})"${getTrans(!!renderJoinLink ? 'no' : 'yes')}/button><br>`+
      `<span${getTrans('isBL')}/span>:<button id=BL${thisId} class="loginbtn" ${gdpsData.checked == 1 ? `onclick="ballsUp(${thisId},'t')"` : ''}>${Points}</button>`+
    `</div>`;
  };
  return html;
},
GUIDrenderInProfileFull = function(parsedData, page = 0) {
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  Consoles.log(page);
  page++
  Consoles.log(page);

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
      innerGdpsPlace(insertBtn(`getGuidesAdmin(${globalWiki},${page})`),-1);
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
    `<div class=framegdpsOld style="width:260px;height:210px" id="${id}">`+
      `<img width=276px height=133px src="${guidImg}" onerror="Consoles.warn('broken link ${guidImg}');this.src='${helperUrl}imgs/hubemp.png'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:var(--def-border);border-top-right-radius:var(--def-border)">`+
      `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img src="${helperUrl}imgs/${guidLang}.png"></h2>`+
      `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-profile-alpha), var(--color-profile));"></div>`+
      `<div style="bottom:12px;left:20px" class="absolute btnszone">`+
        basicButton(getTrans('edit'), `editGuide(${id},${globalWiki},1)`, 'margin-top:8px')+
        basicButton(getTrans('settings000'), `guideSettings(${id})`, 'margin-top:8px')+
      `</div>`+
    `</div>`;
  };
  return html;
},
guideSettings = function(guideId) {
  if (getElement('guidTag'+guideId))
    return;
  let windowId = 'guidSettings'+guideId;
  let helperWindowId = openWindow(windowId,
    `<h2 id=wikiName${guideId}></h2>`+
    `<div style=display:flex>`+
      `<span style=margin-top:calc(var(--def-btn-size)*0.75)${getTrans('tagSetup01')}/span>`+
      basicInput('tagSetup01', `guidTag${guideId}`)+'<br>'+
      basicButton(getTrans('tagSetup02'), `setWikiTag(${guideId})`)+
    `</div>`+
    basicButton('>CLOSE<', `closeWindow('${windowsCount+windowId}')`)+'<br>'
  );
  Loading();
  helperRequest(`${sData[7]}getGuide${php}?id=${guideId}&wiki=${globalWiki}`)
    .then(function(data) {
      Loading(1);
      let parsedData = JSON.parse(data),
        guideinfo = parsedData['guideinfo'];
      getElement('wikiName'+guideId).innerHTML = guideinfo[1];
      getElement('guidTag'+guideId).value = guideinfo[3];
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
setWikiTag = function(guideId) {
  let tagName = getElement('guidTag'+guideId).value;
  Loading();
  helperRequest(`${sData[1]}setWikiTag${php}?id=${guideId}&wiki=${globalWiki}&tag=${tagName}`)
    .then(function(data) {
      Loading(1);
      if (data == '-1')
        megaAlert('tagBan01')
      else if (data == '-2')
        megaAlert('tagBan02')
      else if (data == '-3')
        megaAlert('tagBan03')
      else {
        megaAlert('tagDone')
      }
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
WIKIrenderInProfileFull = function(parsedData) {
  let html = '',
    count = 0;
    
  let gdpsData = null,
    id = null,
    title = null,
    text = null,
    img = null,
    language = null,
    date = null,
    likesCount = null,
    userId = null,
    connectedContent = null,
    forum = null;

  for (let Id in parsedData) {
    count++;
    if (count == 9)
      return html;
    
    gdpsData = parsedData[Id];
    id = gdpsData[0];
    title = gdpsData[1];
    text = gdpsData[2];
    img = gdpsData[3];
    language = gdpsData[4];
    date = gdpsData[5];
    likesCount = gdpsData[7];
    userId = gdpsData[7];
    connectedContent = gdpsData[8];
    forum = gdpsData[9];
    mainWiki = gdpsData[10];

    if (thisUser[1] == userId)
      coownersBtn = `<button onclick="coownersMenu(${id},2)" class=loginbtn style="margin-top:8px"${getTrans('coowners')}/button>`;
    else 
      coownersBtn = `<button class=loginbtn style="margin-top:8px"${getTrans('coownersNone')}/button>`;

    if (connectedContent === 0)
      connectedContent = `<button class=loginbtn onclick="connectContent(${id})" style="margin-top:8px"${getTrans('noConnectContent')}/button>`;
    else
      connectedContent = `<button class=loginbtn onclick="connectContent(${id})" style="margin-top:8px"${getTrans('connectedContent')}/button>`;

    if (forum === 0)
      forum = `<button class=loginbtn onclick="createForum(${id})" style="margin-top:8px"${getTrans('forumNone')}/button>`;
    else
      forum = `<button class=loginbtn onclick="openForum(${forum})" style="margin-top:8px"${getTrans('forumHas')}/button>`;

    if (mainWiki === 0)
      mainWiki = `<button class=loginbtn onclick="setMainWiki(${id},${mainWiki})" style="margin-top:8px"${getTrans('mainWikiNone')}/button>`;
    else
      mainWiki = `<button class=loginbtn onclick="setMainWiki(${id},${mainWiki})" style="margin-top:8px"${getTrans('mainWikiHas')}/button>`;

    html += 
    `<div class=framegdpsOld style="width:calc(100% - 40px);" id="${id}">`+
      `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
      `<span style=opacity:50%>WikiId: ${id}</span>`+
      `<div style=min-height:32px>`+
        `<img onerror="this.src='${helperUrl}imgs/hubbig.png'" align=left src="${decodeURIComponent(img)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
        `<p>${text}</p>`+
      `</div>`+
      `<div style="margin-top:15px">`+
        `<button onclick="editWiki(${id},1)" class=loginbtn style="margin-top:8px"${getTrans('edit')}/button>`+
        `<button onclick="getGuidesAdmin(${id})" class=loginbtn style="margin-top:8px"${getTrans('pages')}/button>`+
        coownersBtn+
        connectedContent+
        forum+
        mainWiki+
      `</div>`+
    `</div>`;
  };
  return html;
},
alarmsWindow = function() {
  let html = 
  `<div id=helperContentProfile>`+
    `<div align=center>`+
      `<h1${getTrans('alarms01')}/h1>`+
      `<div style="display:flex">`+
        `<div style="width:30%;height:400px">`+
          `<h2${getTrans('msgs')}/h2>`+
          `<div id=alarms_small>`+
          `</div>`+
        `</div>`+
        `<div style="width:70%;height:400px">`+
          `<h2${getTrans('fullMsgs')}/h2>`+
          `<div id=alarms_big>`+
          `</div>`+
        `</div>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
GetAlarms = function(page = 0) {
  setLink('alarms');
  Loading();
  helperRequest(`${sData[0]}getAlarms${php}?page=${page}`)
  .then(function(data) {
    if (data == '[]') {
      Loading(1);
      return getElement('alarms_small').innerHTML = `<span${getTrans('newsNone')}/span>`;
    }
    let parsedData = JSON.parse(data),
      html = '';
    parsedData.forEach(function(el) {
      html += `<button id="btn${el[0]}" class=loginbtn onclick="getFullAlarm(${el[0]})">${el[1]}</button>`;
    });
    getElement('alarms_small').innerHTML = html;
    Loading(1);
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
getFullAlarm = function(id) {
  setLink('alarm='+id);
  Loading();
  helperRequest(`${sData[0]}getAlarm${php}?id=${id}`)
  .then(function(data) {
    let alarm = JSON.parse(data),
      html = 
    `<div id=fullAlarm align=left style=margin-left:12px>`+
      `<h1>${alarm.title}</h1>`+
      `<p>${alarm.text}</p>`+
      `<span${getTrans('addedBy')}/span> - `+
      `<button class=emptybtn onclick="otherProfile(${alarm.adminId},'profilePage()')">${alarm.adminName}</button><br><br>`+
      `<button class=loginbtn onclick="removeAlarm(${alarm.ID})"${getTrans('delete')}/button>`+
    `</div>`;
    getElement('alarms_big').innerHTML = html;
    Loading(1);
  })
  .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
},
dropWindow = function() {
  document.querySelectorAll('[isloginwindow]').forEach(function(el) {
    closeWindow(el.id);
  });
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class="frameprofile" style="width:10vw%">`+
      `<h1${getTrans('passReset')}/h1>`+
      `<input id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login01', 'input')}<br><br>`+
      `<input id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login04', 'input')}<br><br>`+
      `<input id="LGemail" class="framelabel" required ${getTrans('login05', 'input')}<br><br>`+
      `<p${getTrans('passResetIf')}/p>`+
      `<button class=loginbtn onclick="sendDrop()"${getTrans('submit')}/button><br><br>`+
      `<button class=loginbtn onclick="innerMain(profilePage())"${getTrans('back')}/button>`+
    `</div>`+
  `</div>`;
  return html;
},
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  otherProfileMini = function(userId) {
    setLink('profiles='+userId);
    Loading();
    helperRequest(`${sData[0]}getUser${php}?id=${userId}`)
    .then(function(data) {
      let userData = JSON.parse(data),
        accStatus = userData[3] ? getTrans('isActive') : getTrans('isNotact'),
        html = 
      `<div id=helperContentProfile>`+
        `<h1><span${getTrans('profile')}/span> ${userData[0]}</h1>`+
        `<p><span${getTrans('profName')}/span>: ${userData[0]}</p>`+
        `<p><span${getTrans('profId')}/span>: ${userData[1]}</p>`+
        `<p><span${getTrans('profRole')}/span>: ${toStringRole(userData[2])}</p>`+
        `<p><span${getTrans('notProfAccs')}/span> ${userData[0]} <span${accStatus}/span></p>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  },
  otherCampsWindow = function(userId) {
    setLink('profCamps='+userId);
    Loading();
    helperRequest(`${sData[0]}getAddedCamps${php}?id=${userId}&type=0`)
    .then(function(data) {
      let parsedData = JSON.parse(data),
        gdpses = "";
      parsedData.forEach(function(gdps) {
        if (typeof(gdps) == 'object') {
          gdpses+=GDPSrenderInProfile(gdps);
        };
      });
      let html =
      `<div id=helperContentProfile>`+
        `<h1><span${getTrans('searchCamps')}/span> ${parsedData[0]}</h1><br>`+
        profileContentDiv()+
          gdpses+
        `</div>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  },
  otherShowsWindow = function(userId) {
    setLink('profShows='+userId);
    Loading();
    helperRequest(`${sData[0]}getAddedShows${php}?id=${userId}&type=1`)
    .then(function(data) {
      let parsedData = JSON.parse(data),
        gdpses = "";
      parsedData.forEach(function(gdps) {
        if (typeof(gdps) == 'object') {
          gdpses+=SHOWrenderInProfile(gdps);
        };
      });
      let html =
      `<div id=helperContentProfile>`+
        `<h1><span${getTrans('searchShows')}/span> ${parsedData[0]}</h1><br>`+
        profileContentDiv()+
          gdpses+
        `</div>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  },
  otherWikisWindow = function(userId) {
    setLink('profWikis='+userId);
    Loading();
    helperRequest(`${sData[0]}getUserGuides${php}?id=${userId}`)
    .then(function(data) {
      let parsedData = JSON.parse(data),
        gdpses = "";
      parsedData.forEach(function(gdps) {
        if (typeof(gdps) == 'object') {
          gdpses+=WIKIrenderInProfile(gdps);
        }
      });
      let html =
      `<div id=helperContentProfile>`+
        `<h1><span${getTrans('guides09')}/span> ${parsedData[0]}</h1><br>`+
        profileContentDiv()+
          gdpses+
        `</div>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(function(e) {console.error(e);getPromiseErrorPos(e)});;
  },
  GDPSrenderInProfile = function(parsedData) {
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
      isWeeklyData = ['',''],
      checked;

    for (let Id in parsedData) {
      Count++;
      if (Count == 9)
        return html;

      gdpsData = parsedData[Id];
      thisId = gdpsData.ID;
      title = gdpsData.title;
      description = gdpsData.text;
      likesCount = gdpsData.likes;
      userId = gdpsData.author;
      username = gdpsData.username;
      pictureLink = gdpsData.img;
      bannerLink = BETA_fixImg(gdpsData.ban);
      renderJoinLink = gdpsData.freejoin;
      checked = gdpsData.checked;

      renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target=_blank${getTrans('joinToGdps')}/a>`;

      isWeeklyData = ['',''];

      html += 
      `<div class="framegdpsOld" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="${thisId}">`+
        `${isWeeklyData[1]}`+
        `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
        `<p style="display:inline;margin:0">`+
          `<span${getTrans('addedBy')}/span>:`+
          `<button onclick="otherProfile(${userId},'innerMain(pageList())')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
        `</p>`+
        `<div style="min-height:32px">`+
          `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
          `<p>${description}</p>`+
        `</div>`+
        `<div style="margin-top:15px;padding-bottom:15px">`+
          `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target="_blank"${getTrans('joinToGdps')}/a>`+
        `</div>`+
      `</div>`;
    };
    return html;
  },
  SHOWrenderInProfile = function(parsedData) {
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
      isWeeklyData = ['',''],
      checked;

    for (let Id in parsedData) {
      Count++;
      if (Count == 9)
        return html;

      gdpsData = parsedData[Id];
      thisId = gdpsData.ID;
      title = gdpsData.title;
      description = gdpsData.text;
      likesCount = gdpsData.likes;
      userId = gdpsData.author;
      username = gdpsData.username;
      pictureLink = gdpsData.img;
      bannerLink = BETA_fixImg(gdpsData.ban);
      renderJoinLink = gdpsData.freejoin;
      checked = gdpsData.checked;

      renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target=_blank${getTrans('joinToGdps')}/a>`;

      isWeeklyData = ['',''];

      html += 
      `<div class="framegdpsOld" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="${thisId}">`+
        `${isWeeklyData[1]}`+
        `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
        `<p style="display:inline;margin:0">`+
          `<span${getTrans('addedBy')}/span>:`+
          `<button onclick="otherProfile(${userId},'innerMain(pageShows())')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
        `</p>`+
        `<div style="min-height:32px">`+
          `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
          `<p>${description}</p>`+
        `</div>`+
        `<div style="margin-top:15px;padding-bottom:15px">`+
          `<a class="loginbtn" href="${curlJoin}join${php}?id=${thisId}" target="_blank"${getTrans('joinToGdps')}/a>`+
        `</div>`+
      `</div>`;
    };
    return html;
  },
  GUIDrenderInProfile = function(parsedData) {
    let html = '',

      gdpsData = null,
      id = null,
      guidTitle = null,
      guidLang = null,
      date = null,
      likes = null,
      guidImg = null,
      userId = null;

    for (let Id in parsedData) {

      gdpsData = parsedData[Id];
      id = gdpsData[0];
      guidTitle = gdpsData[1];
      guidLang = gdpsData[2];
      date = gdpsData[5];
      likes = gdpsData[7];
      guidImg = gdpsData[7];
      userId = gdpsData[8];

      html += 
      `<div class=framegdpsOld style="width:260px;height:200px" id="${id}">`+
        `<img width=276px height=133px src="${guidImg}" onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubemp.png'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:var(--def-border);border-top-right-radius:var(--def-border)">`+
        `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img src="${helperUrl}imgs/${guidLang}.png"></h2>`+
        `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-profile-alpha), var(--color-profile));"></div>`+
        `<div style="bottom:12px;left:20px" class="absolute btnszone">`+
          `<button onclick="getGuide(${id})" class=loginbtn style="margin-top:8px"${getTrans('moreInfo')}/button>`+
        `</div>`+
      `</div>`;
    };
    return html;
  },
  WIKIrenderInProfile = function(parsedData) {
    let html = '',

      gdpsData = null,
      id = null,
      guidTitle = null,
      guidLang = null,
      date = null,
      likes = null,
      guidImg = null,
      userId = null;

    for (let Id in parsedData) {

      gdpsData = parsedData[Id];
      id = gdpsData[0];
      guidTitle = gdpsData[1];
      guidLang = gdpsData[2];
      date = gdpsData[5];
      likes = gdpsData[7];
      guidImg = gdpsData[7];
      userId = gdpsData[8];

      html += 
      `<div class=framegdpsOld style="width:260px;height:200px" id="${id}">`+
        `<img width=276px height=133px src="${guidImg}" onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubemp.png'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:var(--def-border);border-top-right-radius:var(--def-border)">`+
        `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img src="${helperUrl}imgs/${guidLang}.png"></h2>`+
        `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-profile-alpha), var(--color-profile));"></div>`+
        `<div style="bottom:12px;left:20px" class="absolute btnszone">`+
          `<button onclick="pageGuides(${id})" class=loginbtn style="margin-top:8px"${getTrans('moreInfo')}/button>`+
        `</div>`+
      `</div>`;
    };
    return html;
  },
// #endregion
// #region кастомхелпер
cssRoot = document.body.style,

RGBtoHEX = function(string) {
  let dataValues = string.split(',');
  let newColor = '#'
  dataValues.forEach(function(col) {
    let hexColor = parseInt(col).toString(16);

    if (hexColor.length > 2)
      newColor += 'ff';
    else if (hexColor.length < 2)
      newColor += '0'+hexColor;
    else
      newColor += hexColor;
  })
  return newColor;
},
HEXtoRGB = function(hex) {
  let preData = hex.replace('#', ''),
  dataValuesPre = preData.split(''),
  dataValues = [''],

  splitter = false,
  arrId = 0,
  colId = 0;
  dataValuesPre.forEach(function(el) {
    dataValues[arrId] += el;
    if (splitter) {
      arrId += 1;
      if (arrId === 3)
        return;
      dataValues[arrId] = '';
    }
    splitter = !splitter;
  });

  dataValues.forEach(function(col) {
    dataValues[colId] = parseInt(col,16);
    colId++;
  });

  return dataValues.join();
},
setColor = function(name, value, SlocalValue = '') {
  cssRoot.setProperty(name, value);
  if (SlocalValue)
    Slocal.set(SlocalValue, value);
},
dropColorScheme = function() {
  let rgb = {
    r: 97,
    g: 42,
    b: 157,
  },
  bgColor =  `${parseInt(rgb.r*0.09)},${parseInt(rgb.g*0.08)},${parseInt(rgb.b*0.08)}`,
  mainColor =  `${parseInt(rgb.r   )},${parseInt(rgb.g   )},${parseInt(rgb.b   )}`,
  windowColor =`${parseInt(rgb.r*0.65)},${parseInt(rgb.g*0.75)},${parseInt(rgb.b*0.6 )}`,
  lightColor = `${parseInt(rgb.r*1.35)},${parseInt(rgb.g*0   )},${parseInt(rgb.b*1.65)}`,
  profColor =  `${parseInt(rgb.r*0.3 )},${parseInt(rgb.g*0.5 )},${parseInt(rgb.b*0.2 )}`,

  colorScheme =
    `Bg|${RGBtoHEX(bgColor)},`+
    `Bg-alpha|${RGBtoHEX(bgColor)},`+
    `Main|${RGBtoHEX(mainColor)},`+
    `Light|${RGBtoHEX(lightColor)},`+
    `Window|${RGBtoHEX(windowColor)},`+
    `Profile|${RGBtoHEX(profColor)},`+
    `Profile-alpha|${RGBtoHEX(profColor)},`+
    `Black|#13120f,`+
    `White|#ffffff/`+

    `Font|16,`+
    `Btn-size|16,`+
    `Text-indent|16,`+
    `Border-small|8,`+
    `Border|12,`+
    `Border-large|30/`+
    
    `Text;Tags:0`;
  Slocal.set('ColorScheme', colorScheme);

  colorGenerator();
},
setToColorScheme = function() {
  let colorScheme = '',
    sizeScheme = '',
    radioScheme = Slocal.get('ColorScheme').split('/')[2];
  document.querySelectorAll('[iscolorscheme]').forEach(function(el) {
    if (el.type == 'color') {
        let nameLover = '--color-'+el.name.toLowerCase(),
          hex = el.value,
          name = el.name;
        colorScheme += `,${name}|${hex}`;

        if (name.includes('-alpha'))
          hex += '99';
        setColor(nameLover, hex, 'Color'+name);
    }
    if (el.type == 'range') {
      let nameLover = '--def-'+el.name.toLowerCase(),
        val = el.value,
        name = el.name;
      sizeScheme += `,${name}|${val}`;
      setColor(nameLover, val+'px', 'Size'+name);
    }
    //if (el.type == 'radio') {
    //  let nameLover = '--rr-'+el.name.toLowerCase(),
    //    val = el.value,
    //    name = el.name;
    //  sizeScheme += `,${name}|${val}`;
    //  setColor(nameLover, val);
    //}
  })
  Slocal.set('ColorScheme',colorScheme.slice(1) + '/' + sizeScheme.slice(1) + '/' + radioScheme);
  innerProfile(gProfileMini());
},
setColorScheme = function() {
  Slocal.set('ColorScheme',getElement('scheme').value);
  colorGenerator();
},
clrEditPage = function() {
  setLink('color');
  let [Colors, Sizes, Radios] = colorGenerator(),
    colorScheme = Colors.split(','),
    sizeScheme = Sizes.split(','),
    radioScheme = Radios.split(',')
    MenuC = '',
    MenuS = '',
    MenuR = '',
    colorListeners = '',
    sizeListeners = '',
    radioListeners = '';
    //MenuR = 
    //trtd(
    //  '>Tags/Text<',
    //  radioInput('Tags', 'Tags/Text')+
    //  radioInput('Text', 'Tags/Text')
    //);

  colorScheme.forEach(function(el) {
    let [name,value] = el.split('|');
    MenuC += 
    `<tr>`+
      `<td`+
        getTrans(name)+
      `/td>`+
      `<td>`+
        `<input iscolorscheme class=colorscheme class=colorscheme type=color id="color-${name}" name="${name}" value=${value}>`+
      `</td>`+
    `</tr>`;
    colorListeners += `,color-${name}`;
  });
  sizeScheme.forEach(function(el) {
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
  radioScheme.forEach(function(el) {
    let [inputs,value] = el.split(':'),
    doneInputs = '',
    checked = 0;
    inputs.split(';').forEach(function(inp) {
      let isChecked = checked == value ? 1 : 0;
      doneInputs += radioInput(inp, inputs, isChecked, `iscolorscheme value=${inputs}:${checked} onchange="renderSwitch(this.value,1)"`);
      checked++;
    })
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
    `<div style=position:relative id=newNick></div>`+
    `<h2${getTrans('settings005')}/h2>`+
    `<table>`+
      MenuC+
    `</table>`+
    `<h2${getTrans('settings006')}/h2>`+
    `<table>`+
      MenuS+
    `</table>`+
    `<h2${getTrans('settings009')}/h2>`+
    `<table>`+
      MenuR+
    `</table>`+
    `<button class=loginbtn onclick=setToColorScheme()${getTrans('settings002')}/button><br>`+
    `<button class=loginbtn onclick=dropColorScheme()${getTrans('settings003')}/button><br><br><br>`+
    `<div style=display:flex>`+
      `<textarea name=scheme class=framelabel style="width:calc(100% - 170px)" id=scheme>${Slocal.get('ColorScheme')}</textarea>`+
      `<button class=loginbtn onclick=setColorScheme()${getTrans('settings004')}/button><br><br>`+
    `</div><br>`+
    basicButton(getTrans('settings007'), "createBasicError(0)")+'<br>'+
    basicButton(getTrans('settings008'), "createBasicError(1)")+
  `</div>`;

  innerProfile(html);
  colorListeners.slice(1).split(',').forEach(function(id) {
    getElement(id).addEventListener('input', function(el) {
      setColor('--color-'+el.target.name.toLowerCase(), el.target.value, 'Color'+el.target.name);
    })
  });
  sizeListeners.slice(1).split(',').forEach(function(id) {
    let el = getElement(id);
    el.addEventListener('change', function(el) {
      setColor('--def-'+el.target.name.toLowerCase(), el.target.value+'px', 'Size'+el.target.name);
    });
    el.addEventListener('input', function(el) {
      getElement(el.target.name).innerHTML = el.target.value+'px';
    });
  });
  //radioListeners.slice(1).split(',').forEach(function(id) {
  //  let el = getElement(id);
  //  el.addEventListener('change', function(el) {
  //    let val = el.target.value;
  //    renderSwitch(val, 1);
  //  });
  //});
},
renderSwitch = function(value, set = 0) {
  let [Colors, Sizes, Radios] = Slocal.get('ColorScheme').split('/'),
  moreRadios = Radios.split('|');
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
  }
  Consoles.log(value);
  Consoles.log('ColorScheme', Colors+'/'+Sizes+'/'+moreRadios.join('|'));
  if (set)
    Slocal.set('ColorScheme', Colors+'/'+Sizes+'/'+moreRadios.join('|'));
},
colorGenerator = function() {
  let [Colors, Sizes, Radios] = Slocal.get('ColorScheme').split('/');

  Colors.split(',').forEach(function(col) {
    let [name,hex] = col.split('|');

    if (name.includes('-alpha'))
      hex += '99';
    let SlocalName = 'Color' + name,
    CSSname = '--color-'+name.toLowerCase();
    setColor(CSSname, hex, SlocalName)
    Slocal.set(name, hex);
  });
  Sizes.split(',').forEach(function(siz) {
    let [name,val] = siz.split('|');

    val += 'px'

    let SlocalName = 'Size' + name,
    CSSname = '--def-'+name.toLowerCase();
    setColor(CSSname, val, SlocalName)
    Slocal.set(name, val);
  });
  Radios.split(',').forEach(function(rad) {
    renderSwitch(rad);
  });
  return [Colors, Sizes, Radios];
};

if (Slocal.get('ColorVer') < 4 || !Slocal.get('ColorVer')) {
  Slocal.set('ColorVer',     4);
  dropColorScheme();
};
colorGenerator();
// #endregion
// #region предстартовые проверки

if (!Slocal.get('Lang') || Slocal.get('Lang') == 'Ru') {
  mainLang = 'RU';
  Slocal.set('Lang', 'RU');
};

window.addEventListener('popstate', function() {
  ignore = true;
  getLink();
});

window.addEventListener('input', function(e) {
  if (e.target.type === 'radio')
    return;
  if (location.search !== '?list' && location.search !== '?shows' && location.search !== '?wikis')
    return;
  clearTimeout(TimeOut[0]);
  TimeOut[0] = setTimeout(function() {
    sendFinder();
  }, 300);
});

window.addEventListener('resize', setImgSize);

let globalErr = function(a, b, c, d, e) {
    //console.log(`message: ${a}`);
    //console.log(`source: ${b}`);
    //console.log(`lineno: ${c}`);
    //console.log(`colno: ${d}`);
    //console.log(`error: ${e}`);

    returnError(
      a+
      `\nON LINE ${c} IN COLUMN ${d}`
    );

    return true;
  },
  createBasicError = function(type) {
    if (type == 0)
      document.body = null;
    else if (type == 1) {
      Loading();
      helperRequest(`${sData[2]}curl${php}`)
        .then(function(data) {
          JSON.parse(data);
          Loading(1);
        })
        .catch(function(e) {console.error(e);getPromiseErrorPos(e)});
    }
  },
  getPromiseErrorPos = function(error) {
    let errorStack = error.stack,
    errorPos = errorStack
      .split('&helper:')[1]
      .split('\n')[0]
      .split(':');
    console.log(errorPos);
    returnError(
      `PROMISE ERROR HANDLER TEST\n`+
      `${error}`+
      `\nON LINE ${errorPos[0]} IN COLUMN ${errorPos[1]}`
    , servError);
  };

window.onerror = globalErr;
window.onunhandledrejection = globalErr;
// #endregion

reStart();

