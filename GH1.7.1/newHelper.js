const baseApp =
//                'http://localhost/requake/',
//                'https://gdpshelper.xyz/',
//                'https://cfmot.ru/requakeX/',
location.origin + location.pathname,

sData = [baseApp+'server/133/content/', baseApp+'server/133/send/', baseApp+'server/133/', baseApp+'server/133/search/', baseApp+'server/133/delete/'],

helperVer = 61;

// переменные для кеша в поиске
let
GDPSes = [],
Textures = [],

// переменные для кеша в профилях
myGdpses = [],
myTextures = [],

// переменные для кеша в чужих профилях
otherUser = [],
otherGdpses = [],
otherTextures = [],

ignore = false, //работает с функцией ниже
setLink = function(val) {
    if (!ignore) {
        history.pushState(null, null, val);
    }
    ignore = false;
},
getLink = function() {
    // там где /// там профильные функции, нужно сделать там main(pageList())
    let actions = {
        '': function()                   { main(pageList()); }, //pageMain
            list: function()             { main(pageList()); },
        textures: function()             { main(pageText()); },
        gdps: function(gdpsId)           { helperContent('gdps', gdpsId) },
        news: function(gdpsId)           { helperNews(gdpsId); },
        newsC: function(postId)          { helperContent('newsC',postId.split('.')[0],postId.split('.')[1]); },
        texture: function(textId)        { helperContent('text', textId); },
        special: function()              { main(uvazuha()); },
        login: function()                { loginPage() },
        register: function()             { registerPage() },
        profile: function()              { main(profilePage()); },///
        addedGdpses: function()          { main(profilePage(gdpsesWindow())); },///
        addedTextures: function()        { main(profilePage(texturesWindow())); },///
        addGdps: function()              { main(profilePage(addGdps())); },///
        addTp: function()                { main(profilePage(addText())); },///
        editGdps: function(gdpsId)       { main(profilePage(editGdps(gdpsId))); },///
        editTexture: function(textId)    { main(profilePage(editText(textId))); },///
        alarms: function()               { main(profilePage(alarmsWindow())); getAlarms() },///
        alarm: function(msgId)           { main(profilePage(alarmsWindow())); getAlarms(); getFullAlarm(msgId); },///
        profiles: function(userId)       { otherProfile(userId,'main(pageList())'); },
        profGdpses: function(userId)     { otherProfile(userId,'main(pageList())',otherGdpsesWindow); },
        profTextures: function(userId)   { otherProfile(userId,'main(pageList())',otherTexturesWindow); },
        guides: function()               { main(gGuides()); },
        guide: function(guideId)         { getGuide(guideId); },

        gdpsLog: function(gdpsId)        { getJoinLog(gdpsId); },///
        gdpsOwn: function(gdpsId)        { main(profilePage(coownersMenu(gdpsId,3))); },///
        textureOwn: function(textId)     { main(profilePage(coownersMenu(textId,4))); },///

        admin: function()                { adminPanel(); }
    };

    let params = window.location.search
        .replace('?','')
        .split('&')
        .reduce(
            function(p,e){
                let a = e.split('=');
                p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                return p;
            },
            {}
        );

    for (let key in params) {
        let value = params[key];
        if (typeof key !== 'undefined') {
            if (typeof value === 'undefined') {
                value = thisUser[1];
            };
            actions[key](value);
        };
    };
},
isLogged = 0,
token = localStorage.getItem('helperUser'), //токен юзера
reStart = function(drop = 0) {
    if (document.getElementById('debug'))
        document.getElementById('debug').remove();
    main('');
    token = localStorage.getItem('helperUser');
    let postData = token ? 'token='+token : '';
    Loading();
    helperRequest(sData[2]+'loginT.php', postData)
        .then(function(data) {
            Loading(1);
            let resp = JSON.parse(data);
            GDPSes = resp[2];
            Textures = [];//resp[2];
            if (postData !== '') {
                isLogged = 1;
                thisUser = resp[0];
                myGdpses = [];
                myTextures = [];
                myGdpses.push(resp[1][0]);
                //myTextures.push(resp[3][1]);
            }
            getLink();
        })
        .catch(function(error) {returnError(error)});
    if (drop !== 0) {
        translateB('RU');
    }
},
thisUser = [
    '???', //ник
    0, //айди
    0, //роль
    0, //активирован или нет
    0, //есть ли алармы или нет
    '', //токен
    //helperVer //версия хелпера
], //по умолчанию
mainLang = localStorage.getItem('helperLang'), //язык, хотя вроде очевидно

lastUsed = 'fetchNew(0,1)', //гдпсы
lastUsed2 = 'fetchNew(1,1)', //текстуры
lastUsed3 = "main(helperContent('gdps',45))", //переход в профиле

//перевод "Налету"
translateA = {
    RU: {
        'helperVer':'ver - 1.7.1 <span style=opacity:50%>(BUILD '+helperVer+')</span>',
        'src':'./imgs/RU.png',
        'loading...':'Загрузка...',
        'profile':'Профиль',
        'yourProf':'Ваш профиль',
        'register':'Регистрация',
        'login':'Вход',
        'logout':'Выход',
        'logout2':'Выйти из аккаунта',
        'dropPass':'Сбросить пароль',
        'edit':'Изменить',
        'back':'Назад',
        'textures':'Текстурпаки',
        'helperDs':'Дискорд сервер',
        'yes':'Да',
        'no':'Нет',
        'GDtag01':'Старее 2.1',
        'GDtag02':'2.1',
        'GDtag03':'2.2',
        'GDtag04':'Малый сервер',
        'GDtag05':'Большой сервер',
        'GDtag06':'Бесплатный хостинг',
        'GDtag07':'Личный хостинг',
        'GDtag08':'Заказной хостинг',
        'GDtag09':'Модификации',
        'GDtag10':'Текстуры',
        'GDtag11':'Встроенные читы',
        'GDtag12':'Windows',
        'GDtag13':'MacOS',
        'GDtag14':'Android',
        'GDtag15':'IOS',
        'mostLike':'Самое лайкнутое',
        'mostDisl':'Самое дизлайкнутое',
        'search1':'Больше всего баллов',
        'search2':'Идёт набор на модераторов',
        'search3':'Идёт креатор контест',
        'TXtag01':'1.9',
        'TXtag02':'2.0',
        'TXtag03':'2.1',
        'TXtag09':'2.2',
        'TXtag04':'Недоделаный',
        'TXtag05':'Изменены звуки',
        'TXtag06':'Изменена музыка',
        'TXtag07':'Изменены иконки',
        'TXtag08':'Изменены блоки',
        'TXtag12':'Low',
        'TXtag13':'Medium',
        'TXtag14':'High',
        'TXtag15':'Есть на Android',
        'search':'ГДПСы',
        'searchT':'Текстурпаки',
        'findByName':'Найдите по названию',
        'gdpsName':'Название ГДПС',
        'listHelp1':'если вы ищете гдпс которого нету в листе то добавьте его! но перед этим зарегистрируйтесь',
        'tags00':'Найдите по тегам',
        'os00':'Найдите по платформе',
        'otherSort':'Другие способы поиска',
        'addGdps':'Добавить ГДПС',
        'addGdps01':'Название:',
        'addGdps02':'Описание:',
        'addGdps03':'Ссылка на ГДПС:',
        'addGdps04':'Аватар ГДПС:',
        'addGdps05':'Тэги <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько тегов)</span>:',
        'addGdps06':'ОС <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько ОС)</span>:',
        'afterGD':'После изменения ваш гдпс будет забанен <span style=opacity:50%>(если ранее был подтверждён)</span>',
        'textQual':'Качество текстур <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько тегов)</span>:',
        'addText01':'Аватар Текстурпака:',
        'addText02':'Ссылка на скачивание ПК:',
        'addText03':'Ссылка на скачивание Андроид:',
        'addText':'Добавить Текстурпак',
        'editText':'Изменить Текстурпак',
        'editGdps':'Изменить ГДПС',
        'afterTX':'После изменения ваш текстурпак будет забанен <span style=opacity:50%>(если ранее был подтверждён)</span>',
        'gdpsInput01':'Название этого ГДПС',
        'gdpsInput02':'Описание этого ГДПС',
        'gdpsInput03':'http://www.boomlings.com/tools ИЛИ http://gofruit.space/gdps/XXXX',
        'gdpsInput04':'Прямая ссылка на картинку',
        'gdpsInput05':'https://discord.gg/gdps',
        'textInput01':'Название текстур',
        'textInput02':'Описание текстур',
        'textInput03':'Прямая ссылка на картинку',
        'textInput04':'https://drive.google.com',
        'textInput05':'Если нет оставьте пустым',
        'special00':'Благодарит этих людей',
        'special01':'Создание "майского билда"',
        'special02':'Майский билд (почти) в оригинале',
        'special03':'"Новый" стиль сайта и новая главная страница',
        'special04':'Большинство идей для проекта GDPS Helper и доработка "майского билда", дорабатывает веб сайт проекта в одниночку с релиза (0.91 - 1.7)',
        'special05':'Стиль сайта на июнь',
        'special06':'Поиск дыр в безопасности сайта',
        'special07':'Стиль сайта на октябрь',
        'special08':'Вы все, кто пользуется сайтом',
        'special09':'Помощь в создании системы перевода "налету"',
        'special10':'Огромная помощь в дизайне на лето 2024',
        'profName':'Имя пользователя',
        'profId':'ID пользователя',
        'profRole':'Роль',
        'profAccs':'Ваш аккаунт ',
        'notProfAccs':'Аккаунт ',
        'isActive':'Активирован',
        'isNotact':'Неактивирован',
        'yourGdpses':'Ваши ГДПСы',
        'Alarms':'Уведомления',
        'yourTexts':'Ваши Текстурпаки',
        'alarms01':'Сообщения от администрации',
        'msgs':'Сообщения',
        'fullMsgs':'Полный текст',
        'role00':'Нет',
        'role01':'Менеджер',
        'role02':'Админ',
        'role03':'Фюрер',
        'GDPSstatus10':'Статус сервера: Не работает',
        'GDPSstatus00':'Статус сервера: Проверка не запускалась',
        'GDPSstatus01':'Статус сервера: Работает',
        'weekGdps':'ГДПС Недели',
        'addedBy':'Автор',
        'moreInfo':'Подробнее',
        'checkNews':'Просмотреть новости',
        'getLink':'Скопировать ссылку',
        'showMore':'Показать больше',
        'loggedAs':'Вход выполнен',
        'commSend':'Отправить',
        'min10chars':'минимум 10 символов',
        'joinToGdps':'Войти',
        'download':'Скачать',
        'downloadPC':'Скачать (ПК)',
        'downloadMB':'Скачать (Андроид)',
        'downloadMBmini':'ПК',
        'downloadPCmini':'Андроид',
        'account':'Аккаунт',
        'newsNone':'Ничего нет',
        'newsNoneReal':'Новостей с ГДПСа нет',
        'remindPass':'Забыли пароль?',
        'login01':'Имя пользователя',
        'login02':'Пароль',
        'login03':'Адрес эл. почты',
        'login04':'Новый пароль',
        'login05':'Адрес эл. почты',
        'gdpsLang00':'Язык',
        'gdpsLang01':'Русский',
        'gdpsLang02':'Английский',
        'gdpsLang03':'Испанский',
        'notYourProf':'Профиль',
        'notYourGdpses':'ГДПСы',
        'notYourTexts':'Текстурпаки',
        'textNone':'Нету',
        'delete':'Удалить',
        'coowners':'Со-владельцы',
        'idOrName':'ID или имя пользователя',
        'joinsTo':'Переходы на',
        'joins':'Переходы',
        'coownersNone':'Вы со-владелец',
        'CCtrue':'Проводится',
        'CCfalse':'Не проводится',
        'isCC':'Проходит креатор контест',
        'isMC':'Проходит набор на модераторов',
        'isJE':'Требуется авторизация на сайте для входа в дискорд сервер',
        'isBL':'Баллы (нажмите для получения, раз в ровно 2 часа)',
        'comms':'Комментарии',
        'commsNone':'Комментариев нет',
        'submit':'Подтвердить',
        'passReset':'Сброс пароля',
        'passResetIf':'Если вдруг вы владеете старым аккаунтом, на котором не привязана почта то обратитесь к администрации в дискорде',
        'addNews':'Новый новостной пост',
        'publishNews':'Опубликовать',
        'newsText':'Текст поста',
        'needLogin':'Требуется регистрация',
        'timeAgo01':' секунд назад',
        'timeAgo02':' минут и ',
        'timeAgo03':' секунд назад',
        'timeAgo04':' часов и ',
        'timeAgo05':' минут назад',
        'timeAgo06':' дней и ',
        'timeAgo07':' часов назад',
        'timeAgo08':' недель и ',
        'timeAgo09':' дней назад',
        'timeAgo10':' месяцев и ',
        'timeAgo11':' недель назад',
        'timeAgo12':'давно',
        'report01':'Жалоба на ГДПС',
        'report02':'Причина жалобы (например - не работает ссылка входа)',
        'otmena':'Отмена',
        'copied':'Скопировано!',
        'reported':'Отправлено!',
    },
    EN: {
        'helperVer':'ver - 1.7.1 <span style=opacity:50%>(BUILD '+helperVer+')</span>',
        'src':'./imgs/EN.png',
        'loading...':'Loading...',
        'profile':'Profile',
        'yourProf':'Your profile',
        'register':'Register',
        'login':'Login',
        'logout':'Logout',
        'logout2':'Logout of your account',
        'dropPass': 'Reset password',
        'edit':'Edit',
        'back':'Back',
        'textures':'Texturepacks',
        'helperDs':'Discord server',
        'yes':'Yes',
        'no':'No',
        'GDtag01':'Older than 2.1',
        'GDtag02':'2.1',
        'GDtag03':'2.2',
        'GDtag04':'Small server',
        'GDtag05':'Large server',
        'GDtag06':'Free hosting',
        'GDtag07':'Self hosting',
        'GDtag08':'Paid hosting',
        'GDtag09':'Mods',
        'GDtag10':'Textures',
        'GDtag11':'Built-in cheats',
        'GDtag12':'Windows',
        'GDtag13':'MacOS',
        'GDtag14':'Android',
        'GDtag15':'IOS',
        'mostLike':'Most liked',
        'mostDisl':'Most disliked',
        'search1':'Most points',
        'search2':'Mod. recruitment',
        'search3':'Creator contest',
        'TXtag01':'1.9',
        'TXtag02':'2.0',
        'TXtag03':'2.1',
        'TXtag09':'2.2',
        'TXtag04':'Unfinished',
        'TXtag05':'Changed sounds',
        'TXtag06':'Сhanged music',
        'TXtag07':'Сhanged icons',
        'TXtag08':'Сhanged blocks',
        'TXtag12':'Low',
        'TXtag13':'Medium',
        'TXtag14':'High',
        'TXtag15':'Android',
        'search':'GDPSes',
        'searchT':'Texturepacks',
        'findByName':'Find by name',
        'gdpsName':'GDPS name',
        'listHelp1':'If you are looking for a gdps that isnt in the list, then add it! But before that, register',
        'tags00':'Search by tags',
        'os00':'Search by platform',
        'otherSort':'Other search methods',
        'addGdps':'Add GDPS',
        'addGdps01':'Title:',
        'addGdps02':'Description:',
        'addGdps03':'Link to GDPS:',
        'addGdps04':'GDPS Avatar:',
        'addGdps05':'Tags <span style=opacity:50%>(Windows: hold down CTRL to add multiple tags)</span>:',
        'addGdps06':'OS <span style=opacity:50%>(Windows: hold down CTRL to add multiple OS)</span>:',
        'afterGD':'After edit, your gdps will be banned <span style=opacity:50%>(if previously verified)</span>',
        'textQual':'Texture quality <span style=opacity:50%>(Windows: hold down CTRL to add multiple tags)</span>:',
        'addText01':'Texture Pack Avatar:',
        'addText02':'PC download Link:',
        'addText03':'Android download link:',
        'addText':'Add Texturepack',
        'editText':'Edit Texturepack',
        'editGdps':'Edit GDPS',
        'afterTX':'After edit, your texturepack will be banned <span style=opacity:50%>(if previously verified)</span>',
        'gdpsInput01':'GDPS name',
        'gdpsInput02':'GDPS description',
        'gdpsInput03':'http://www.boomlings.com/tools OR http://gofruit.space/gdps/XXXX ',
        'gdpsInput04':'Direct link to picture',
        'gdpsInput05':'https://discord.gg/gdps',
        'textInput01':'Texturepack name',
        'textInput02':'Texturepack description',
        'textInput03':'Direct link to picture',
        'textInput04':'https://drive.google.com/...',
        'textInput05':'If not, leave it empty',
        'special00':'Thanks these people',
        'special01':'"May build" development',
        'special02':'May build is (almost) in the original',
        'special03':'A "new" website style and a new home page',
        'special04':'Most of the ideas for the GDPS Helper project and the revision of the "May build", the project\'s website is being finalized one day from the release (0.91 - 1.7.1)',
        'special05':'Website style for June',
        'special06':'Search for security bugs in the site',
        'special07':'Website style for October',
        'special08':'All of you who use the site',
        'special09':'Assistance in creating a translation system',
        'special10':'A huge help in the design for the summer of 2024',
        'profName':'Username',
        'profId':'UserID',
        'profRole':'Role',
        'profAccs':'Your account ',
        'notProfAccs':'Account',
        'isActive':'Activated',
        'isNotact':'Unactivated',
        'yourGdpses':'Your GDPSes',
        'Alarms':'Notifications',
        'yourTexts':'Your Texturepacks',
        'alarms01':'Messages by administration',
        'msgs':'Messages',
        'fullMsgs':'Full text',
        'role00':'No',
        'role01':'Manager',
        'role02':'Admin',
        'role03':'Head Admin',
        'GDPSstatus10':'Server Status: Not working',
        'GDPSstatus00':'Server status: check didn\'t started',
        'GDPSstatus01':'Server Status: Working',
        'weekGdps':'Weekly GDPS',
        'addedBy':'Author',
        'moreInfo':'Learn more',
        'checkNews':'View GDPS news',
        'getLink':'Copy link',
        'showMore':'Show more',
        'loggedAs':'Logged as',
        'commSend':'Send',
        'min10chars':'Minimum 10 characters',
        'joinToGdps':'Join',
        'download':'Download',
        'downloadPC':'Download (PC)',
        'downloadMB':'Download (Android)',
        'downloadMBmini':'PC',
        'downloadPCmini':'Android',
        'account':'Account',
        'newsNone':'Nothing found',
        'newsNoneReal':'There is no news from GDPS',
        'remindPass':'Forgot password?',
        'login01':'Username',
        'login02':'Password',
        'login03':'Email address',
        'login04':'New password',
        'login05':'Email address',
        'gdpsLang00':'Language',
        'gdpsLang01':'Russian',
        'gdpsLang02':'English',
        'gdpsLang03':'Spanish',
        'notYourProf':'Profile',
        'notYourGdpses':'GDPSes',
        'notYourTexts':'Texturepacks',
        'textNone':'Nothing',
        'delete':'Delete',
        'coowners':'Co-owners',
        'idOrName':'ID or username',
        'joinsTo':'Joins to',
        'joins':'Joins',
        'coownersNone':'You are co-owner',
        'CCtrue':'Held',
        'CCfalse':'Not held',
        'isCC':'Creator contest',
        'isMC':'Recruitment for moderators',
        'isJE':'Authorization required to join in discord server',
        'isBL':'Points (click to receive, once every exactly 2 hours)',
        'comms':'Comments',
        'commsNone':'There are no comments',
        'submit':'Confirm',
        'passReset':'Password Reset',
        'passResetIf':'If you suddenly own an old account that does not have mail linked to it, then contact the admins in the discord',
        'addNews':'New News Post',
        'publishNews':'Publish',
        'newsText':'text',
        'needLogin':'Registration is required',
        'timeAgo01': ' seconds ago', 
        'timeAgo02': ' minutes and ', 
        'timeAgo03': ' seconds ago', 
        'timeAgo04': ' hours and ', 
        'timeAgo05': ' minutes ago', 
        'timeAgo06': ' days and ', 
        'timeAgo07': ' hours ago', 
        'timeAgo08': ' weeks and ', 
        'timeAgo09': ' days ago', 
        'timeAgo10': ' months and ', 
        'timeAgo11': ' weeks ago', 
        'timeAgo12': 'long ago', 
        'report01':'Report GDPS',
        'report02':'The reason of report (for example, the join link does not work)',
        'otmena':'Cancel',
        'copied':'Copied!',
        'reported':'Sent!'
    }
},
getTrans = function(id) {
    try {
        return translateA[mainLang][id];
    } catch (err) {
        mainLang = 'RU';
        localStorage.setItem('helperLang', 'RU');
        returnError(err);
    }
},
translateB = function(lang) {
    mainLang = lang;
    localStorage.setItem('helperLang', lang);
    document.querySelectorAll('[data-trans]').forEach(function(el) {
    let key = el.getAttribute('data-trans');
        if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'IMG') {
            el.innerHTML = translateA[lang][key];
        } else if (el.tagName !== 'IMG') {
            el.setAttribute('placeholder', translateA[lang][key]);
        } else {
            el.src = translateA[lang][key];
        };
    });
},

//вставка в разные куски страницы
main = function(textContent) {
    document.getElementById('1st').innerHTML = textContent;
},
innerProfile = function(textContent) {
    document.getElementById('profileWindow').innerHTML = textContent;
},
innerGdpsPlace = function(textContent, insert = 0) {
    if (insert == 0) //профили
        document.getElementById('GDPSesPlace').innerHTML = textContent;
    else if (insert >= 1) //в поиске устарел
        document.getElementById('GDPSesPlace').insertAdjacentHTML('beforeend', textContent);
    else //в поиске но лучще это
        document.getElementById('GDPSesPlace').insertAdjacentHTML('afterend', textContent);
},
innerComments = function(textContent, insert = 0) {
    if (insert == 0) //при рендере гдпса
        document.getElementById('comments').innerHTML = textContent;
    else //а эт вроде когда "показать больше"
        document.getElementById('comments').insertAdjacentHTML('beforeend', textContent);
},

//страницы
finderVisible = false,
makeFinderVisible = function() {
    finderVisible = !finderVisible;
    if (finderVisible) {
        document.getElementById('finder').setAttribute('align', 'center');
        document.getElementById('finder').style.display = 'block';
        document.getElementById('finder').style.margin = '';
        document.getElementById('1st').insertBefore(
            document.getElementById('finder'),
            document.getElementById('afterFind')
        );
    } else {
        document.getElementById('finder').setAttribute('align', '');
        document.getElementById('finder').style.display = '';
        document.getElementById('finder').style.margin = '5px';
        document.getElementById('afterFind').insertBefore(
            document.getElementById('finder'),
            document.getElementById('beforeFinder')
        );
    };
},

switchLangMenu = function() {
    let preLang = '';
    for (let lang in translateA) {
        preLang += 
        `<button onclick="switchLang('${lang}')" style="width:32px" class="emptybtn">`+
            `<img src="./imgs/${lang}.png" width=32px style="padding-bottom:6px">`+
        `</button> `;
    };
    return `<div id=switchLang2 style="position:absolute; bottom:-40px; left:40px; padding:8px; border:solid black 3px;border-radius:8px; background-color:rgba(255,255,255,.1);">`+
        preLang+
    `</div>`;
},
switchLang = function(lang = 32) {
    if (lang === 32) {
        if (!document.getElementById('switchLang2')) {
            document.getElementById('switchLang').insertAdjacentHTML('beforeend', switchLangMenu())
        } else {
            document.getElementById('switchLang2').remove()
        }
    } else {
        translateB(lang)
        document.getElementById('switchLang2').remove()
    }
},

pHeader = function(predrop = '') {
    if (predrop === 'predrop')
        predrop = 'dropLogin(1);';
    let html = 
    `<div class="header" align="center">`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}main(pageList())">`+
            `<img src="./imgs/gdpsnew.svg" width=32px>`+
        `</button> `+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}main(pageText())">`+
            `<img src="./imgs/text.svg" width=32px>`+
        `</button> `+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}main(gGuides())">`+
            `<img src="./imgs/guid.svg" width=32px>`+
        `</button> `+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}main(uvazuha())">`+
            `<img src="./imgs/uvazuha.svg" width=32px>`+
        `</button> `+
        `<button style="width:32px" class="emptybtn" onclick="location.href = 'https://discord.gg/6T84uCgVcz'">`+
            `<img src="./imgs/disc.svg" width=32px>`+
        `</button> `;
    if (isLogged) {
        html +=
        `<button style="width:32px" class="emptybtn" onclick="${predrop}main(profilePage())">`+
            `<img src="./imgs/user.svg" width=32px>`+
        `</button> `;
    } else {
        html +=
        `<button style="width:32px" class="emptybtn" onclick="${predrop}registerPage()">`+
            `<img src="./imgs/reg.svg" width=32px>`+
        `</button> `+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}loginPage()">`+
            `<img src="./imgs/login.svg" width=32px>`+
        `</button> `;
    };
    html += 
        `<nodiv id=switchLang style=position:relative>`+
            `<button onclick="switchLang()" style="width:32px" class="emptybtn">`+
                `<img data-trans="src" src="./imgs/${mainLang}.png" width=32px style="padding-bottom:6px">`+
            `</button> `+
        `</nodiv>`+
    `</div>`;
    return html;
},
pageList = function() {
    setLink('?');
    finderVisible = false;
    let html = pHeader()+
    `<h1 align=center style=color:white;margin-bottom:10px>GDPS Helper</h1>`+
    `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="makeFinderVisible()">`+
        `<div style="transform:rotate(90deg)">|||</div>`+
    `</button>`+
    `<div id=afterFind align=center class=gdps-forum style="height:calc(100vh - 140px);overflow:auto">`+
        `<div id=finder align=left class="framenext profileMobile1" style="width:240px;margin:5px;height:fit-content">`+
            `<h1 data-trans="search">${getTrans('search')}</h1><br>`+
            `<label data-trans="findByName">${getTrans('findByName')}:</label><br>`+
            `<p data-trans="listHelp1">${getTrans('listHelp1')}</p>`+
            `<input data-trans="gdpsName" type=text id=framelabel class=framelabel style=width:190px placeholder="${getTrans('gdpsName')}">`+
            `<button onclick=fetchName(0) class=loginbtn><img src="./imgs/gdpsnew.svg" height=16px></button><br><br>`+

            `<label data-trans="tags00">${getTrans('tags00')}:</label><br>`+
            `<label data-trans="GDtag01">${getTrans('GDtag01')}</label><input name=tags[] type=checkbox value=1><br>`+
            `<label data-trans="GDtag02">${getTrans('GDtag02')}</label><input name=tags[] type=checkbox value=2><br>`+
            `<label data-trans="GDtag03">${getTrans('GDtag03')}</label><input name=tags[] type=checkbox value=3><br>`+
            `<label data-trans="GDtag04">${getTrans('GDtag04')}</label><input name=tags[] type=checkbox value=4><br>`+
            `<label data-trans="GDtag05">${getTrans('GDtag05')}</label><input name=tags[] type=checkbox value=5><br>`+
            `<label data-trans="GDtag06">${getTrans('GDtag06')}</label><input name=tags[] type=checkbox value=6><br>`+
            `<label data-trans="GDtag07">${getTrans('GDtag07')}</label><input name=tags[] type=checkbox value=7><br>`+
            `<label data-trans="GDtag08">${getTrans('GDtag08')}</label><input name=tags[] type=checkbox value=8><br>`+
            `<label data-trans="GDtag09">${getTrans('GDtag09')}</label><input name=tags[] type=checkbox value=9><br>`+
            `<label data-trans="GDtag10">${getTrans('GDtag10')}</label><input name=tags[] type=checkbox value=10><br>`+
            `<label data-trans="GDtag11">${getTrans('GDtag11')}</label><input name=tags[] type=checkbox value=11><br>`+
            `<button onclick=fetchTags(0,0,getTags()) class=loginbtn><img src="./imgs/gdpsnew.svg" height=16px></button><br><br>`+

            `<label data-trans="os00">${getTrans('os00')}:</label><br>`+
            `<button data-trans="GDtag12" onclick=fetchOs(0,0,'os=12') class=loginbtn>${getTrans('GDtag12')}</button> `+
            `<button data-trans="GDtag13" onclick=fetchOs(0,0,'os=13') class=loginbtn>${getTrans('GDtag13')}</button> `+
            `<button data-trans="GDtag14" onclick=fetchOs(0,0,'os=14') class=loginbtn>${getTrans('GDtag14')}</button> `+
            `<button data-trans="GDtag15" onclick=fetchOs(0,0,'os=15') class=loginbtn>${getTrans('GDtag15')}</button><br><br>`+

            `<label data-trans="otherSort">${getTrans('otherSort')}:</label><br>`+
            `<button data-trans="mostLike" onclick=fetchLiked(0) class=loginbtn>${getTrans('mostLike')}</button> `+
            `<button data-trans="mostDisl" onclick=fetchDisliked(0) class=loginbtn>${getTrans('mostDisl')}</button> `+
            `<button data-trans="search1" onclick=fetchPoints() class=loginbtn>${getTrans('search1')}</button><br>`+
            `<button data-trans="search2" onclick=fetchMC() class=loginbtn>${getTrans('search2')}</button> `+
            `<button data-trans="search3" onclick=fetchCC() class=loginbtn>${getTrans('search3')}</button>`+
        `</div>`+
        `<div id=beforeFinder align=left class=profileMobile4>`+
            `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
                GDPSrenderMini(GDPSes)+
            `</div>`+
            insertBtn('fetchNew(0,1)')+
        `</div>`+
    `</div>`;
    return html;
    
},
pageText = function() {
    setLink('?'+'textures');
    finderVisible = false;
    let html = pHeader()+
    `<h1 align=center style=color:white;margin-bottom:10px>GDPS Helper</h1>`+
    `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="makeFinderVisible()">`+
        `<div style="transform:rotate(90deg)">|||</div>`+
    `</button>`+
    `<div id=afterFind align=center class=gdps-forum style="height:calc(100vh - 140px);overflow:auto">`+
        `<div id=finder align=left class="framenext profileMobile1" style="width:240px;margin:5px;height:fit-content">`+
            `<h1 data-trans="searchT">${getTrans('searchT')}</h1><br>`+
            `<label data-trans="findByName">${getTrans('findByName')}:</label><br>`+
            `<input data-trans="gdpsName" type=text id=framelabel class=framelabel style=width:190px placeholder="${getTrans('gdpsName')}">`+
            `<button onclick=fetchName(1) class=loginbtn><img src="./imgs/gdpsnew.svg" height=16px></button><br><br>`+
            
            `<label data-trans="tags00">${getTrans('tags00')}:</label><br>`+
            `<label data-trans="TXtag01">${getTrans('TXtag01')}</label><input name="tags[]" type="checkbox" value="1"><br>`+
            `<label data-trans="TXtag02">${getTrans('TXtag02')}</label><input name="tags[]" type="checkbox" value="2"><br>`+
            `<label data-trans="TXtag03">${getTrans('TXtag03')}</label><input name="tags[]" type="checkbox" value="3"><br>`+
            `<label data-trans="TXtag09">${getTrans('TXtag09')}</label><input name="tags[]" type="checkbox" value="9"><br>`+
            `<label data-trans="TXtag04">${getTrans('TXtag04')}</label><input name="tags[]" type="checkbox" value="4"><br>`+
            `<label data-trans="TXtag05">${getTrans('TXtag05')}</label><input name="tags[]" type="checkbox" value="5"><br>`+
            `<label data-trans="TXtag06">${getTrans('TXtag06')}</label><input name="tags[]" type="checkbox" value="6"><br>`+
            `<label data-trans="TXtag07">${getTrans('TXtag07')}</label><input name="tags[]" type="checkbox" value="7"><br>`+
            `<label data-trans="TXtag08">${getTrans('TXtag08')}</label><input name="tags[]" type="checkbox" value="8"><br>`+
            `<button name="os" onclick="fetchTags(1,0,getTags())" class=loginbtn><img src="./imgs/gdpsnew.svg" height=16px></button><br><br>`+

            `<label data-trans="os00">${getTrans('os00')}:</label><br>`+
            `<button onclick=fetchOs(1,0,'os=12') class=loginbtn>Low</button> `+
            `<button onclick=fetchOs(1,0,'os=13') class=loginbtn>Medium</button> `+
            `<button onclick=fetchOs(1,0,'os=14') class=loginbtn>High</button>`+
            `<button data-trans="TXtag15" onclick=fetchOs(1,0,'os=15') class=loginbtn>${getTrans('TXtag15')}</button><br><br>`+
            
            `<label data-trans="otherSort">${getTrans('otherSort')}:</label><br>`+
            `<button data-trans="mostLike" onclick=fetchLiked(1) class=loginbtn>${getTrans('mostLike')}</button> `+
            `<button data-trans="mostDisl" onclick=fetchDisliked(1) class=loginbtn>${getTrans('mostDisl')}</button>`+
        `</div>`+
        `<div id=beforeFinder align=left class=profileMobile4>`+
            `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
                TEXTrenderMini(Textures)+
            `</div>`+
            insertBtn('fetchNew(1,1)')+
        `</div>`+
    `</div>`;
    return html;
},
uvazuha = function() {
    setLink('?'+'special');
    let html = pHeader()+
    `<div align=center>`+
        `<h1>GDPS Helper</h1>`+
        `<h2 data-trans="special00">${getTrans('special00')}</h2>`+
        `<div class=frameguide align=left>`+
            `<p>DenisC - <span  data-trans="special01">${getTrans('special01')}</span></p>`+
            `<a href=./DA2/     data-trans="special02">${getTrans('special02')}</a>`+
            `<p>Vustur - <span  data-trans="special03">${getTrans('special03')}</span></p>`+
            `<p>MIOBOMB - <span data-trans="special04">${getTrans('special04')}</span></p>`+
            `<p>lemongd - <span data-trans="special05">${getTrans('special05')}</span></p>`+
            `<p>??? - <span     data-trans="special06">${getTrans('special06')}</span></p>`+
            `<p>mirvis - <span  data-trans="special07">${getTrans('special07')}</span></p>`+
            `<p>glorius - <span data-trans="special09">${getTrans('special09')}</span></p>`+
            `<p>M41den  - <span data-trans="special09">${getTrans('special10')}</span></p>`+
            `<h2 data-trans="special08">${getTrans('special08')}</h2>`+
            `<br><br>`+
        `</div>`+
    `</div>`;
    return html;
},
gGuides = function() {
    setLink('?'+'guides');
    let html = pHeader()+
    `<div class=framelogin>`+
        `<h1>Гайды</h1>`+
        `<h2>(только на <img src="./imgs/RU.png">)</h2>`+
        `<p>гайды, которые подойдут для любого ядра</p>`+
        `<button class=loginbtn onclick=getGuide(2)>Создание Windows</button><br><br>`+
        `<button class=loginbtn onclick=getGuide(3)>Создание Android</button><br><br>`+
        `<p>ядро GMDPrivateServer, ака Cvolton</p>`+
        `<button class=loginbtn onclick=getGuide(1)>Как создать ГДПС</button><br><br>`+
        `<button class=loginbtn onclick=getGuide(4)>Бекап сервера</button><br><br>`+
        `<button class=loginbtn onclick=getGuide(5)>настройка hCaptcha</button><br><br><br><br>`+
        `<button class=loginbtn onclick=getGuide(6)>Список хостов</button><br><br>`+
    `</div>`;
    return html;
},
getGuide = function(id) {
    let html = pHeader()+
        `<h1 id=title></h1>`+
        `<div id=texts></div>`+
        `<div class=gdps-forum><button class=loginbtn onclick="main(gGuides())">Назад</button></div>`+
        `<div align=center style="margin:8px">`+
            `<h1>Комментарии</h1>`;
            if (isLogged) {
                html +=
            `<div class=framemain style=height:60px>`+
                `<p style=margin:0;padding:0>Вход выполнен: ${thisUser[0]}</p>`+
                `<input type=text class=framelabel id=text required minlength=10 placeholder="минимум 10 символов"><br>`+
                `<button class=loginbtn onclick="sendComm(${id},3)">Отправить</button>`+
            `</div>`
            };
        html +=
            `<div id=comments>`+
            `</div>`+
        `</div>`;
    main(html);
    Loading();
    helperRequest(`${sData[0]}getGuide.php?id=${id}`)
    .then(data => {
        setLink('?'+'guide='+id);
        Loading(1);
        let parsedData = JSON.parse(data);
        let guideinfo = parsedData['guideinfo'];
        let guidedata = parsedData['guidedata'];
        let comments = parsedData['comments'];
        document.getElementById('title').innerHTML = guideinfo[0];
        document.getElementById('texts').insertAdjacentHTML('afterend', guideinfo[1]);
        if (guideinfo[2])
        {document.getElementById('title').insertAdjacentHTML('afterend', guideinfo[2])}

        guidedata.forEach((val) => {
            document.getElementById('texts')
            .insertAdjacentHTML('beforeend', '<div class=frameguide>'+val+'</div><br>');
        });

        document.getElementById('comments').insertAdjacentHTML('beforeend',
        renderComms(comments,6,`${id},'guid',1`));
    });
},
dropLogin = function(type = 0) {
    let hcaptchaHtml = document.getElementById('2st');
    if (type === 0) {
        document.getElementById('3st').appendChild(hcaptchaHtml);
        hcaptchaHtml.style.display = 'block';
    } else if (type === 1) {
        document.getElementById('4st').appendChild(hcaptchaHtml);
        hcaptchaHtml.style.display = 'none';
        main(pageList());
    };
},
loginPage = function() {
    setLink('?'+'login');
    let html = pHeader('predrop')+
    `<div class="framelogin">`+
        `<h1 data-trans="login">${getTrans('login')}</h1>`+
        `<input data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
        `<input data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}"><br><br>`+
            `<div id=3st></div><br><br>`+
        `<button data-trans="remindPass" onclick="main(dropWindow())" class="loginbtn">${getTrans('remindPass')}</button><br><br>`+
        `<button data-trans="joinToGdps" onclick="sendLoginForm()" class="loginbtn">${getTrans('joinToGdps')}</button><br>`+
        `<br><button data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
    `</div>`;
    main(html);
    dropLogin();
},
registerPage = function() {
    setLink('?'+'register');
    let html = pHeader('predrop')+
    `<div class="framelogin">`+
        `<h1 data-trans="register">${getTrans('register')}</h1>`+
        `<input data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
        `<input data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}"><br><br>`+
        `<input data-trans="login03" id="LGemail"    class="framelabel" required placeholder="${getTrans('login03')}"><br><br>`+
            `<div id=3st></div><br><br>`+
        `<button data-trans="register" onclick="sendRegisterForm()" class="loginbtn">${getTrans('register')}</button><br>`+
        `<br><button data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
    `</div>`;
    main(html);
    dropLogin();
},
contentPreload = function(sendCommData = '', backFunc = '') {
    let html = pHeader()+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class="gdps-forum">`+
        `<button data-trans="back" class="loginbtn" onclick="main(${backFunc}">${getTrans('back')}</button>`+
    `</div><br>`;
    if (isLogged) html += 
    `<div class="framemain" style="height:60px">`+
        `<p style="margin:0;padding:0">`+
            `<span data-trans="loggedAs">${getTrans('loggedAs')}</span>: `+
            `${thisUser[0]}`+
        `</p>`+
        `<input data-trans="min10chars" type="text" class="framelabel" id="text" required minlength=10 placeholder="${getTrans('min10chars')}"><br>`+
        `<button data-trans="commSend" class="loginbtn" onclick="sendComm(${sendCommData})" id="commentBtn">${getTrans('commSend')}</button>`+
    `</div>`;
    html += 
    `<div id="comments"></div>`;
    return html;
},
GDPSpreload = function(sendCommData = '', backFunc = '') {
    let html = pHeader()+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class="gdps-forum"><canvas id="Stat"></canvas></div>`+
    `<div class="gdps-forum">`+
        `<button data-trans="back" class="loginbtn" onclick="main(${backFunc}">${getTrans('back')}</button>`+
    `</div><br>`+
    `<div style="display:flex; flex-wrap:wrap">`+
        `<div style="max-height:300px; overflow:auto; margin-bottom:12px; flex:60%; flex-basis:400px" align=center id="news"></div>`+
        `<div style="max-height:300px; overflow:auto; margin-bottom:12px; flex:40%">`;
    if (isLogged) html += 
            `<div class="framemain" style="height:60px">`+
                `<p style="margin:0;padding:0">`+
                    `<span data-trans="loggedAs">${getTrans('loggedAs')}</span>: `+
                    thisUser[0]+
                `</p>`+
                `<input data-trans="min10chars" type="text" class="framelabel" id="text" required minlength=10 placeholder="${getTrans('min10chars')}"><br>`+
                `<button data-trans="commSend" class="loginbtn" onclick="sendComm(${sendCommData})" id="commentBtn">${getTrans('commSend')}</button>`+
            `</div>`;
    html += 
            `<div id="comments"></div>`+
        `</div>`+
    `</div>`;
    return html;
},
gdpsNewsPage = function(gdpsId = 0) {
    let html = pHeader()+
    `<div class=gdps-forum>`+
        `<button data-trans="back" class=loginbtn onclick="helperContent('gdps', ${gdpsId})">${getTrans('back')}</button><br>`+
    `</div>`+
    `<div id=GDPSesPlace class=gdps-forum style=flex-direction:column></div>`;
    return html;
},
getTags = function() {
    let checkboxes = document.querySelectorAll('input[type=\'checkbox\']:checked');
    let queryString = '';
    
    if (checkboxes.length === 0) {
        queryString = '';
    } else {
        checkboxes.forEach(function(checkbox, index) {
            let name = checkbox.name;
            let value = checkbox.value;
            queryString += (index > 0 ? '&' : '') +
            encodeURIComponent(name) + '=' + encodeURIComponent(value);
        })
    };
    return queryString;
},

//кнопка "показать больше"
insertBtn = function(lastUse) {
    return `<div id=nextGdps class=gdps-helper>
        <button onclick="${lastUse}" class=loginbtn style="font-size:32px; padding: 4px 8px; margin: 12px 0;">
            ${getTrans('showMore')}
        </button>
    </div>`;
},

//рендеры
phoneSwitch = false,
profileSwitcherPhone = function(userId = thisUser[1], backButton = '') {
    let html = '';
    if (userId === thisUser[1]) {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile"   class=loginbtn onclick="innerProfile(gProfileMini())"  >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="yourGdpses"class=loginbtn onclick="innerProfile(gdpsesWindow())"  >${getTrans('yourGdpses')}</button><br><br>`+
            `<button data-trans="Alarms"    class=loginbtn onclick="innerProfile(alarmsWindow())"  >${getTrans('Alarms')}</button><br><br>`+
            `<button data-trans="yourTexts" class=loginbtn onclick="innerProfile(texturesWindow())">${getTrans('yourTexts')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="main(pageList())">${getTrans('back')}</button>`+
        `</div>`;
    } else {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile"   class=loginbtn onclick="otherProfileMini(${userId})"   >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="notYourGdpses" class=loginbtn onclick="otherGdpsesWindow(${userId})"  >${getTrans('notYourGdpses')}</button><br><br>`+
            `<button data-trans="notYourTexts"  class=loginbtn onclick="otherTexturesWindow(${userId})">${getTrans('notYourTexts')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`;
    };
    return html;
},

profilePage = function(innerHtnl = gProfileMini()) {
    let html = pHeader()+
    `<div class=frameprofile style="margin:0;height:100%">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone())">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position: absolute;transform: translate(0%, 50%);top: -15px;width: 235px;" align="left">`+
            `<button data-trans="profile"   class=loginbtn onclick="innerProfile(gProfileMini())"            >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="yourGdpses"class=loginbtn onclick="innerProfile(gdpsesWindow())"            >${getTrans('yourGdpses')}</button><br><br>`+
            `<button data-trans="Alarms"    class=loginbtn onclick="innerProfile(alarmsWindow());getAlarms()">${getTrans('Alarms')}</button><br><br>`+
            `<button data-trans="yourTexts" class=loginbtn onclick="innerProfile(texturesWindow())"          >${getTrans('yourTexts')}</button><br><br>`+
        `</div>`+
        `<div class=profileMobile3 id="profileWindow" align="left">`+
            innerHtnl+
        `</div>`+
        `<p align=right data-trans="helperVer">${getTrans('helperVer')}</p>`+
    `</div>`;
    return html;
},
gProfileMini = function() {
    setLink('?'+'profile');
    let accStatus = thisUser[3] ? getTrans('isActive') : getTrans('isNotact');
    let html = 
    `<h1 data-trans="yourProf">${getTrans('yourProf')}</h1>`+
    `<p><span data-trans="profName">${getTrans('profName')}</span>: ${thisUser[0]}</p>`+
    `<p><span data-trans="profId"  >${ getTrans('profId') }</span>: ${thisUser[1]}</p>`+
    `<p><span data-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(thisUser[2])}</p>`+
    `<p><span data-trans="profAccs">${getTrans('profAccs')}</span> <span data-trans="${thisUser[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`+
    `<button data-trans="logout2" class=loginbtn onclick=gLogout()>${getTrans('logout2')}</button><br><br>`+
    `<button data-trans="dropPass" class=loginbtn onclick="main(dropWindow())">${getTrans('dropPass')}</button>`;
    if (thisUser[2] !== 0)
        html += 
    `<br><br><button class=loginbtn onclick="adminPanel()">Admin Panel!!1</button>`
    return html;
},
gdpsesWindow = function() {
    setLink('?'+'addedGdpses');
    let gdpses = "";
    myGdpses.forEach((gdps) => {
        gdpses+=GDPSrenderInProfile2(gdps);
    });
    let html =
    `<h1 data-trans="yourGdpses">${getTrans('yourGdpses')}</h1><br>`+
    `<div align=left>`+
    `<button data-trans="addGdps" onclick="innerProfile(addGdps())" style=font-size:24px class=loginbtn>${getTrans('addGdps')}</button> `+
    `<button data-trans="addNews" onclick="innerProfile(newsWindow())" style=font-size:24px;margin-top:4px class=loginbtn>${getTrans('addNews')}</button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 300px); overflow:auto' align=left>`+
        gdpses+
    `</div>`;
    return html;
},
newsWindow = function() {
    let gdpses = '';
    for (let gdpsKey in myGdpses[0]) {
        let gdps = myGdpses[0][gdpsKey];
        let Gid = gdps[0];
        let title = gdps[1];

        gdpses += `<option value=${Gid}>${title}</option>`
    };
    let html = 
    `<h1 id=blacktext>Новый пост</h1>`+
    `<form method=post onsubmit="return enterFormData(this,'newsPost.php')">`+
        `<input data-trans="addGdps01" class=framelabel type=title placeholder=${getTrans("addGdps01")} name=title><br>`+
        `<textarea data-trans="newsText" class=framelabel name=text placeholder="${getTrans('newsText')}"></textarea><br>`+
        `<select class=framelabel style=color:black name=gdps>${gdpses}</select><br>`+
        `<input data-trans="publishNews" type=submit value="${getTrans('publishNews')}" class="loginbtn">`+
    `</form>`;
    return html;
},
texturesWindow = function() {
    setLink('?'+'addedTextures');
    let gdpses = "";
    myTextures.forEach((gdps) => {
        gdpses+=TEXTrenderInProfile2(gdps);
    });
    let html =
    `<h1 data-trans="yourTexts">${getTrans('yourTexts')}</h1><br>`+
    `<div align=left>`+
        `<button data-trans="addText" onclick="innerProfile(addText())" style=font-size:24px class=loginbtn>${getTrans('addText')}</button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 300px); overflow:auto' align=left>`+
        gdpses+
    `</div>`;
    return html;
},
alarmsWindow = function() {
    setLink('?'+'alarms');
    let html = 
    `<div align=center>`+
        `<h1 data-trans="alarms01">${getTrans('alarms01')}</h1>`+
        `<div style="display:flex">`+
            `<div style="width: 30%;  height: 400px;">`+
                `<h2 data-trans="msgs">${getTrans('msgs')}</h2>`+
                `<div id=alarms_small>`+
                `</div>`+
            `</div>`+
            `<div style="width: 70%;  height: 400px;">`+
                `<h2 data-trans="fullMsgs">${getTrans('fullMsgs')}</h2>`+
                `<div id=alarms_big>`+
                `</div>`+
            `</div>`+
        `</div>`+
    `</div>`;
    return html;
},
getAlarms = function(page = 0) {
    setLink('?'+'alarms');
    Loading();
    helperRequest(`${sData[0]}getAlarms.php?page=${page}`)
    .then(data => {
        Loading(1);
        if (data == '[]') 
            return document.getElementById('alarms_small').innerHTML = `<span data-trans="newsNone">${getTrans('newsNone')}</span>`;
        let parsedData = JSON.parse(data);
        let html = '';
        parsedData.forEach(el => {
            html += `<button id="btn${el[0]}" class=loginbtn onclick="getFullAlarm(${el[0]})">${el[1]}</button>`;
        });
        document.getElementById('alarms_small').innerHTML = html;
    })
    .catch(function(error) {returnError(error)});
},
getFullAlarm = function(id) {
    setLink('?'+'alarm='+id);
    Loading();
    helperRequest(`${sData[0]}getAlarm.php?id=${id}`)
    .then(data => {
        Loading(1);
        let alarm = JSON.parse(data);
        let html = 
        `<div id=fullAlarm align=left style=margin-left:12px>`+
            `<h1>${alarm.title}</h1>`+
            `<p>${alarm.text}</p>`+
            `<span data-trans=""addedBy>${getTrans('addedBy')}</span> - `+
            `<button class=emptybtn onclick="otherProfile(${alarm.adminId},'profilePage()')">${alarm.adminName}</button><br><br>`+
            `<button data-trans="delete" class=loginbtn onclick="removeAlarm(${alarm.ID})">${getTrans('delete')}</button>`+
        `</div>`;
        document.getElementById('alarms_big').innerHTML = html;
    })
    .catch(function(error) {returnError(error)});
},
removeAlarm = function(id) {
    Loading();
    helperRequest(`${sData[1]}deleteAlarm.php?id=${id}`)
    .then(() => {
        Loading(1);
        document.getElementById('btn'+id).remove();
        document.getElementById('fullAlarm').remove();
    })
    .catch(function(error) {returnError(error)});
},
dropWindow = function() {
    if (!isLogged) return loginPage();
    let html = pHeader()+
    `<div class="framelogin" style="width:10vw%">`+
        `<h1 data-trans="passReset">${getTrans('passReset')}</h1>`+
        `<input data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
        `<input data-trans="login04" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login04')}"><br><br>`+
        `<input data-trans="login05" id="LGemail"    class="framelabel" required placeholder="${getTrans('login05')}"><br><br>`+
        `<p data-trans="passResetIf">${getTrans('passResetIf')}</p>`+
        `<button data-trans="submit" class=loginbtn onclick="sendDrop()">${getTrans('submit')}</button><br><br>`+
        `<button data-trans="back" class=loginbtn onclick="main(profilePage())">${getTrans('back')}</button>`+
    `</div>`;
    return html;
},
addGdps = function() {
    setLink('?'+'addGdps');
    let html = 
    `<h1 data-trans="addGdps">${getTrans('addGdps')}</h1>`+
    `<form method=POST action='gdpsAdd.php' onsubmit="return enterFormData(this,'gdpsAdd.php')">`+
        `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input data-trans="gdpsInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('gdpsInput01')}"><br>`+
        `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="gdpsInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('gdpsInput02')}"></textarea><br>`+
        `<label data-trans="addGdps03">${getTrans('addGdps03')}</label><br><input data-trans="gdpsInput03" class=framelabel type=text name=database style=width:100% required placeholder="${getTrans('gdpsInput03')}"><br>`+
        `<label data-trans="addGdps04">${getTrans('addGdps04')}</label><br><input data-trans="gdpsInput04" class=framelabel type=text name=img style=width:100% placeholder="${getTrans('gdpsInput04')}"><br>`+
        `<label data-trans="helperDs">${ getTrans('helperDs') }</label><br><input data-trans="gdpsInput05" class=framelabel type=text name=link style=width:100% required placeholder="${getTrans('gdpsInput05')}"><br><br>`+

        `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label><br>`+
        `<select id="langs" class="framelabel" name="language" required>`+
            `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
            `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
            `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
        `</select><br><br>`+

        `<label data-trans="addGdps05">${getTrans('addGdps05')}</label><br>`+
        `<select name=tags[] size=5 multiple required class=framelabel>`+
            `<option data-trans="GDtag01" value=1>${getTrans('GDtag01')}</option>`+
            `<option data-trans="GDtag02" value=2>${getTrans('GDtag02')}</option>`+
            `<option data-trans="GDtag03" value=3>${getTrans('GDtag03')}</option>`+
            `<option data-trans="GDtag04" value=4>${getTrans('GDtag04')}</option>`+
            `<option data-trans="GDtag05" value=5>${getTrans('GDtag05')}</option>`+
            `<option data-trans="GDtag06" value=6>${getTrans('GDtag06')}</option>`+
            `<option data-trans="GDtag07" value=7>${getTrans('GDtag07')}</option>`+
            `<option data-trans="GDtag08" value=8>${getTrans('GDtag08')}</option>`+
            `<option data-trans="GDtag09" value=9>${getTrans('GDtag09')}</option>`+
            `<option data-trans="GDtag10" value=10>${getTrans('GDtag10')}</option>`+
            `<option data-trans="GDtag11" value=11>${getTrans('GDtag11')}</option>`+
        `</select><br>`+
        `<label data-trans="addGdps06">${getTrans('addGdps06')}</label><br>`+
        `<select name=os[] multiple required class=framelabel>`+
            `<option data-trans="GDtag12" value=12>${getTrans('GDtag12')}</option>`+
            `<option data-trans="GDtag13" value=13>${getTrans('GDtag13')}</option>`+
            `<option data-trans="GDtag14" value=14>${getTrans('GDtag14')}</option>`+
            `<option data-trans="GDtag15" value=15>${getTrans('GDtag15')}</option>`+
        `</select><br><br>`+
        `<input data-trans="addGdps" type=submit value="${getTrans('addGdps')}" class=loginbtn>`+
    `</form>`;
    return html;
},
addText = function() {
    setLink('?'+'addTp');
    let html = 
    `<h1 data-trans="addText">${getTrans('addText')}</h1>`+
    `<form method=POST action='textAdd.php' onsubmit="return enterFormData(this,'textAdd.php')">`+
        `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input data-trans="textInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('textInput01')}"><br>`+
        `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="textInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('textInput02')}"></textarea><br>`+
        `<label data-trans="addText01">${getTrans('addText01')}</label><br><input data-trans="textInput03" class=framelabel type=text name=img style=width:100% placeholder="${getTrans('textInput03')}"><br>`+
        `<label data-trans="addText02">${getTrans('addText02')}</label><br><input data-trans="textInput04" class=framelabel type=text name=link style=width:100% required placeholder="${getTrans('textInput04')}"><br>`+
        `<label data-trans="addText03">${getTrans('addText03')}</label><br><input data-trans="textInput05" class=framelabel type=text name=database style=width:100% placeholder="${getTrans('textInput05')}"><br><br>`+
        `<label data-trans="addGdps05">${getTrans('addGdps05')}</label><br>`+
        `<select name=tags[] size=5 multiple required class=framelabel>`+
            `<option data-trans="TXtag01" value=1>${getTrans('TXtag01')}</option>`+
            `<option data-trans="TXtag02" value=2>${getTrans('TXtag02')}</option>`+
            `<option data-trans="TXtag03" value=3>${getTrans('TXtag03')}</option>`+
            `<option data-trans="TXtag09" value=9>${getTrans('TXtag09')}</option>`+
            `<option data-trans="TXtag04" value=4>${getTrans('TXtag04')}</option>`+
            `<option data-trans="TXtag05" value=5>${getTrans('TXtag05')}</option>`+
            `<option data-trans="TXtag06" value=6>${getTrans('TXtag06')}</option>`+
            `<option data-trans="TXtag07" value=7>${getTrans('TXtag07')}</option>`+
            `<option data-trans="TXtag08" value=8>${getTrans('TXtag08')}</option>`+
        `</select><br>`+
        `<label data-trans="textQual">${getTrans('textQual')}</label><br>`+
        `<select name=os[] multiple required class=framelabel>`+
            `<option data-trans="TXtag12" value=12>${getTrans('TXtag12')}</option>`+
            `<option data-trans="TXtag13" value=13>${getTrans('TXtag13')}</option>`+
            `<option data-trans="TXtag14" value=14>${getTrans('TXtag14')}</option>`+
            `<option data-trans="TXtag15" value=15>${getTrans('TXtag15')}</option>`+
        `</select><br><br>`+
        `<input data-trans="addText" type=submit value="${getTrans('addText')}" class=loginbtn>`+
    `</form>`;
    return html;
},
editGdps = function(gdpsId) {
    Loading();
    let html = ``;
    helperRequest(`${sData[1]}gdpsEdit.php?id=${gdpsId}`)
    .then (data => {
        Loading(1);
        setLink('?'+'editGdps='+gdpsId);
        let parsedData = JSON.parse(data);
        let tags = JSON.parse(parsedData[5]);
        let os = JSON.parse(parsedData[6]);
        html = 
            `<h1 data-trans="editGdps">${getTrans('editGdps')}</h1>`+
            `<form method=POST action='gdpsEdit.php' onsubmit="return enterFormData(this,'gdpsEdit.php?id=${gdpsId}')">`+
                `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input value="${parsedData[0]}" data-trans="gdpsInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('gdpsInput01')}"><br>`+
                `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="gdpsInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('gdpsInput02')}">${parsedData[1]}</textarea><br>`+
                `<label data-trans="addGdps03">${getTrans('addGdps03')}</label><br><input value="${parsedData[2]}" data-trans="gdpsInput03" class=framelabel type=text  name=database style=width:100% required placeholder="${getTrans('gdpsInput03')}"><br>`+
                `<label data-trans="addGdps04">${getTrans('addGdps04')}</label><br><input value="${parsedData[3]}" data-trans="gdpsInput04" class=framelabel type=text  name=img style=width:100% placeholder="${getTrans('gdpsInput04')}"><br>`+
                `<label data-trans="helperDs">${ getTrans('helperDs') }</label><br><input value="${parsedData[4]}" data-trans="gdpsInput05" class=framelabel type=text  name=link style=width:100% required placeholder="${getTrans('gdpsInput05')}"><br><br>`+
                
                `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label><br>`+
                `<select id="language" class="framelabel" name="language" required>`+
                    `<option ${parsedData[7] == 'RU' ? 'selected' : ''} data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                    `<option ${parsedData[7] == 'EN' ? 'selected' : ''} data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                    `<option ${parsedData[7] == 'ES' ? 'selected' : ''} data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
                `</select><br><br>`+

                `<label data-trans="addGdps05">${getTrans('addGdps05')}</label><br>`+
                `<select name=tags[] id=tags size=5 multiple required class=framelabel>`+
                    `<option ${tags.includes("1") ? 'selected' : ''  } data-trans="GDtag01" value=1>${getTrans('GDtag01')}</option>`+
                    `<option ${tags.includes("2") ? 'selected' : ''  } data-trans="GDtag02" value=2>${getTrans('GDtag02')}</option>`+
                    `<option ${tags.includes("3") ? 'selected' : ''  } data-trans="GDtag03" value=3>${getTrans('GDtag03')}</option>`+
                    `<option ${tags.includes("4") ? 'selected' : ''  } data-trans="GDtag04" value=4>${getTrans('GDtag04')}</option>`+
                    `<option ${tags.includes("5") ? 'selected' : ''  } data-trans="GDtag05" value=5>${getTrans('GDtag05')}</option>`+
                    `<option ${tags.includes("6") ? 'selected' : ''  } data-trans="GDtag06" value=6>${getTrans('GDtag06')}</option>`+
                    `<option ${tags.includes("7") ? 'selected' : ''  } data-trans="GDtag07" value=7>${getTrans('GDtag07')}</option>`+
                    `<option ${tags.includes("8") ? 'selected' : ''  } data-trans="GDtag08" value=8>${getTrans('GDtag08')}</option>`+
                    `<option ${tags.includes("9") ? 'selected' : ''  } data-trans="GDtag09" value=9>${getTrans('GDtag09')}</option>`+
                    `<option ${tags.includes("10") ? 'selected' : '' } data-trans="GDtag10" value=10>${getTrans('GDtag10')}</option>`+
                    `<option ${tags.includes("11") ? 'selected' : '' } data-trans="GDtag11" value=11>${getTrans('GDtag11')}</option>`+
                `</select><br>`+
                `<label data-trans="addGdps06">${getTrans('addGdps06')}:</label><br>`+
                `<select name=os[] id=os multiple required class=framelabel>`+
                    `<option ${os.includes("12") ? 'selected' : ''  } data-trans="GDtag12" value=12>${getTrans('GDtag12')}</option>`+
                    `<option ${os.includes("13") ? 'selected' : ''  } data-trans="GDtag13" value=13>${getTrans('GDtag13')}</option>`+
                    `<option ${os.includes("14") ? 'selected' : ''  } data-trans="GDtag14" value=14>${getTrans('GDtag14')}</option>`+
                    `<option ${os.includes("15") ? 'selected' : ''  } data-trans="GDtag15" value=15>${getTrans('GDtag15')}</option>`+
                `</select><br><br>`+
                `<input data-trans="editGdps" type=submit value="${getTrans('editGdps')}" class=loginbtn><br>`+
                `<p data-trans="afterGD">${getTrans('afterGD')}</p><br>`+
            `</form>`;
        innerProfile(html);
    })
    .catch(function(error) {returnError(error)});
},
editText = function(gdpsId) {
    Loading();
    let html = ``;
    helperRequest(`${sData[1]}textEdit.php?id=${gdpsId}`)
    .then (data => {
        Loading(1)
        setLink('?'+'editTexture='+gdpsId);
        let parsedData = JSON.parse(data);
        let tags = JSON.parse(parsedData[5]);
        let os = JSON.parse(parsedData[6]);
        html = 
            `<h1 data-trans="editText">${getTrans('editText')}</h1>`+
            `<form id=formGdps method=POST action='textEdit.php' onsubmit="return enterFormData(this,'textEdit.php?id=${gdpsId}')">`+
                `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input value="${parsedData[0]}" data-trans="textInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('textInput01')}"><br>`+
                `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="textInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('textInput02')}">${parsedData[1]}</textarea><br>`+
                `<label data-trans="addText01">${getTrans('addText01')}</label><br><input value="${parsedData[2]}" data-trans="textInput03" class=framelabel type=text name=img style=width:100% placeholder="${getTrans('textInput03')}"><br>`+
                `<label data-trans="addText02">${getTrans('addText02')}</label><br><input value="${parsedData[3]}" data-trans="textInput04" class=framelabel type=text name=link style=width:100% required placeholder="${getTrans('textInput04')}"><br>`+
                `<label data-trans="addText03">${getTrans('addText03')}</label><br><input value="${parsedData[4]}" data-trans="textInput05" class=framelabel type=text name=database style=width:100% placeholder="${getTrans('textInput05')}"><br><br>`+
                `<label data-trans="addGdps05">${getTrans('addGdps05')}</label><br>`+
                `<select name=tags[] size=5 multiple required class=framelabel>`+
                    `<option ${tags.includes("1") ? 'selected' : ''  } data-trans="TXtag01" value=1>${getTrans('TXtag01')}</option>`+
                    `<option ${tags.includes("2") ? 'selected' : ''  } data-trans="TXtag02" value=2>${getTrans('TXtag02')}</option>`+
                    `<option ${tags.includes("3") ? 'selected' : ''  } data-trans="TXtag03" value=3>${getTrans('TXtag03')}</option>`+
                    `<option ${tags.includes("9") ? 'selected' : ''  } data-trans="TXtag09" value=9>${getTrans('TXtag09')}</option>`+
                    `<option ${tags.includes("4") ? 'selected' : ''  } data-trans="TXtag04" value=4>${getTrans('TXtag04')}</option>`+
                    `<option ${tags.includes("5") ? 'selected' : ''  } data-trans="TXtag05" value=5>${getTrans('TXtag05')}</option>`+
                    `<option ${tags.includes("6") ? 'selected' : ''  } data-trans="TXtag06" value=6>${getTrans('TXtag06')}</option>`+
                    `<option ${tags.includes("7") ? 'selected' : ''  } data-trans="TXtag07" value=7>${getTrans('TXtag07')}</option>`+
                    `<option ${tags.includes("8") ? 'selected' : ''  } data-trans="TXtag08" value=8>${getTrans('TXtag08')}</option>`+
                `</select><br>`+
                `<label data-trans="textQual">${getTrans('textQual')}</label><br>`+
                `<select name=os[] multiple required class=framelabel>`+
                    `<option ${os.includes("12") ? 'selected' : ''  } data-trans="TXtag12" value=12>${getTrans('TXtag12')}</option>`+
                    `<option ${os.includes("13") ? 'selected' : ''  } data-trans="TXtag13" value=13>${getTrans('TXtag13')}</option>`+
                    `<option ${os.includes("14") ? 'selected' : ''  } data-trans="TXtag14" value=14>${getTrans('TXtag14')}</option>`+
                    `<option ${os.includes("15") ? 'selected' : ''  } data-trans="TXtag15" value=15>${getTrans('TXtag15')}</option>`+
                `</select><br><br>`+
                `<input data-trans="editText" type=submit value="${getTrans('editText')}" class=loginbtn><br>`+
                `<p data-trans="afterTX">${getTrans('afterTX')}</p><br>`+
            `</form>`;
        innerProfile(html);
    })
    .catch(function(error) {returnError(error)});
},
coownersMenu = function(id, contentType) {
    let contentTypeNew = contentType - 3;
    Loading();
    helperRequest(`${sData[0]}getOwners.php?id=${id}&type=${contentType}`)
    .then(data => {
        Loading(1);
        if (contentType == 3)
            setLink('?'+'gdpsOwn='+id);
        else 
            setLink('?'+'textureOwn='+id);
        let parsedData = JSON.parse(data);
        let html = 
        `<div>`+
            `<h1><span data-trans="coowners">${getTrans('coowners')}</span> ${parsedData[0]}</h1>`+
            `<table id=comments>`+
                `<tr>`+
                    `<td data-trans="profName">${getTrans('profName')}</td>`+
                    `<td data-trans="delete">${getTrans('delete')}</td>`+
                `</tr>`;

        parsedData[1].forEach(arrat => {
            html +=
                `<tr id=perm${arrat[1]}>`+
                    `<td>`+
                        arrat[0]+
                    `</td>`+
                    `<td>`+
                        `<button data-trans="delete" class=loginbtn onclick="deleteOwner(${id},${contentTypeNew},${arrat[1]})">${getTrans('delete')}</button>`+
                    `</td>`+
                `</tr>`;
        });

        html += 
            `</table><br><br>`+
            `<input data-trans="idOrName" style="width:120px" id="addown" class="framelabel" placeholder="${getTrans('idOrName')}">`+
            `<button class="loginbtn" onclick="ownersAdd(${id},${contentTypeNew})">+</button>`+
        `</div>`;
        innerProfile(html);
    })
    .catch(function(error) {returnError(error)});
},
ownersAdd = function(id, type) {
    let userData = document.getElementById('addown').value;
    Loading();
    helperRequest(`${sData[1]}permAdd.php?gdps=${id}&type=${type}&user=${userData}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        let parsedData = JSON.parse(data);
        let html =
            `<tr id=perm${parsedData[1]}>`+
                `<td>`+
                parsedData[0]+
                `</td>`+
                `<td>`+
                    `<button data-trans="delete" class=loginbtn onclick="deleteOwner(${id},${type},${parsedData[1]})">${getTrans('delete')}</button>`+
                `</td>`+
            `</tr>`;
        innerComments(html, 1);
    })
    .catch(function(error) {returnError(error)});
},
deleteOwner = function(contentId, type, userId) {
    Loading();
    helperRequest(`${sData[1]}perm.php?gdps=${contentId}&type=${type}&id=${userId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        document.getElementById('perm'+userId).remove();
    })
    .catch(function(error) {returnError(error)});
},
getJoinLog = function(gdpsId) {
    Loading();
    helperRequest(`${sData[0]}getJoinLog.php?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        setLink('?'+'gdpsLog='+gdpsId);
        let parsedData = JSON.parse(data);
        let html = 
        `<div>`+
            `<h1><span data-trans="joinsTo">${getTrans('joinsTo')}</span> ${parsedData[0][0]}</h1>`+
            `<table>`;
        parsedData.forEach(arrat => {
            if (arrat[1] !== 'Microwave') {
                html +=
                `<tr>`+
                    `<td>`+
                        arrat[0]+
                    `</td>`+
                    `<td>`+
                        timeAgo(arrat[1])+
                    `</td>`+
                `</tr>`;
            }
        });
        html += 
            `</table>`+
        `</div>`;
        innerProfile(html);
    })
    .catch(function(error) {returnError(error)});
},

MCedit = function(gdpsId) {
    Loading();
    helperRequest(`${sData[1]}modc.php?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        document.getElementById('MC'+gdpsId).innerHTML = getTrans(data);
    });
},
CCedit = function(gdpsId) {
    Loading();
    helperRequest(`${sData[1]}crec.php?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        document.getElementById('CC'+gdpsId).innerHTML = getTrans(data);
    });
},
JEedit = function(gdpsId) {
    Loading();
    helperRequest(`${sData[1]}setj.php?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        document.getElementById('JE'+gdpsId).innerHTML = getTrans(data);
    });
},
ballsUp = function(gdpsId) {
    Loading();
    helperRequest(`${sData[1]}bump.php?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        document.getElementById('BL'+gdpsId).innerHTML = data;
    });
},

otherProfile = function(userId, backButton, innerHtnl = otherProfileMini) {
    setLink('?'+'profiles='+userId);
    let html = pHeader()+
    `<div class=frameprofile style="margin:0;height:100%">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone(${userId}, '${backButton}'))">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position: absolute;transform: translate(0%, 50%);top: -15px;width: 235px;" align="left">`+
            `<button data-trans="profile"   class=loginbtn onclick="otherProfileMini(${userId})"   >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="notYourGdpses" class=loginbtn onclick="otherGdpsesWindow(${userId})"  >${getTrans('notYourGdpses')}</button><br><br>`+
            `<button data-trans="notYourTexts"  class=loginbtn onclick="otherTexturesWindow(${userId})">${getTrans('notYourTexts')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`+
        `<div class=profileMobile3 id="profileWindow" align="left">`+
        `</div>`+
    `</div>`;
    main(html);
    innerHtnl(userId);
},
otherProfileMini = function(userId) {
    setLink('?'+'profiles='+userId);
    Loading()
    helperRequest(`${sData[0]}getUser.php?id=${userId}`)
    .then(data => {
        Loading(1);
        let userData = JSON.parse(data);
        let accStatus = userData[3] ? getTrans('isActive') : getTrans('isNotact');
        let html = 
        `<h1><span data-trans="notYourProf">${getTrans('notYourProf')}</span> ${userData[0]}</h1>`+
        `<p><spandata-trans="profName">${getTrans('profName')}</span>: ${userData[0]}</p>`+
        `<p><spandata-trans="profId">${   getTrans('profId') }</span>: ${userData[1]}</p>`+
        `<p><spandata-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(userData[2])}</p>`+
        `<p><span data-trans="notProfAccs">${getTrans('notProfAccs')}</span> ${userData[0]} <span data-trans="${userData[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`;
        innerProfile(html);
    })
    .catch(function(error) {returnError(error)});
},
otherGdpsesWindow = function(userId) {
    setLink('?'+'profGdpses='+userId)
    Loading()
    helperRequest(`${sData[0]}getAddedGdpses.php?id=${userId}&type=0`)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data);
        let gdpses = "";
        parsedData.forEach((gdps) => {
            if (typeof(gdps) == 'object') {
                gdpses+=GDPSrenderInProfile(gdps);
            };
        });
        let html =
        `<h1><span data-trans="notYourGdpses">${getTrans('notYourGdpses')}</span> ${parsedData[0]}</h1><br>`+
        `<div style='display: flex; flex-direction: column; height:calc(100vh - 300px); overflow:auto' align=left>`+
            gdpses+
        `</div>`;
        innerProfile(html);
    })
    .catch(function(error) {returnError(error)});
},
otherTexturesWindow = function(userId) {
    setLink('?'+'profTextures='+userId);
    Loading();
    helperRequest(`${sData[0]}getAddedTextures.php?id=${userId}&type=1`)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data);
        let gdpses = "";
        parsedData.forEach((gdps) => {
            if (typeof(gdps) == 'object') {
                gdpses+=TEXTrenderInProfile(gdps);
            }
        });
        let html =
        `<h1><span data-trans="notYourTexts">${getTrans('notYourTexts')}</span> ${parsedData[0]}</h1><br>`+
        `<div style='display: flex; flex-direction: column; height:calc(100vh - 300px); overflow:auto' align=left>`+
            gdpses+
        `</div>`;
        innerProfile(html);
    })
    .catch(function(error) {returnError(error)});
},

toStringRole = function(id) {
    switch (id) {
        case 0: return getTrans('role00');
        case 1: return getTrans('role01');
        case 2: return getTrans('role02');
        case 3: return getTrans('role03');
    };
},
toStringGDPS = function(tag) {
    switch (tag) {
        case "1": return getTrans('GDtag01');
        case "2": return getTrans('GDtag02');
        case "3": return getTrans('GDtag03');
        case "4": return getTrans('GDtag04');
        case "5": return getTrans('GDtag05');
        case "6": return getTrans('GDtag06');
        case "7": return getTrans('GDtag07');
        case "8": return getTrans('GDtag08');
        case "9": return getTrans('GDtag09');
        case "10": return getTrans('GDtag10');
        case "11": return getTrans('GDtag11');
        case "12": return getTrans('GDtag12');
        case "13": return getTrans('GDtag13');
        case "14": return getTrans('GDtag14');
        case "15": return getTrans('GDtag15');
    };
},
toStringTEXT = function(tag) {
    switch (tag) {
        case "1": return getTrans('TXtag01');
        case "2": return getTrans('TXtag02');
        case "3": return getTrans('TXtag03');
        case "9": return getTrans('TXtag09');
        case "4": return getTrans('TXtag04');
        case "5": return getTrans('TXtag05');
        case "6": return getTrans('TXtag06');
        case "7": return getTrans('TXtag07');
        case "8": return getTrans('TXtag08');
        case "12": return getTrans('TXtag12');
        case "13": return getTrans('TXtag13');
        case "14": return getTrans('TXtag14');
        case "15": return getTrans('TXtag15');
    };
},
GDPSrenderMini = function(parsedData) {
    let html = '',
        count =    0;

    let gdpsData = null,
        id = null,
        title = null,
        description = null,
        tags = null,
        os = null,
        likesCount = null,
        userId = null,
        username = null,
        pictureLink = null,
        renderJoinLink = null,
        isWeekly = null,
        language = null,
        isWeeklyData = ['',''],
        tagsOs = '';
    
    for (let Id in parsedData) {
        count++;
        if (count == 9)
            return html;

		// Object Hub Compat
        gdpsData = parsedData[Id];
        id = gdpsData.ID;
        title = gdpsData.title;
        description = gdpsData.text;
        tags = JSON.parse(gdpsData.tags);
        os = JSON.parse(gdpsData.os);
        likesCount = gdpsData.likes;
        userId = gdpsData.author;
        username = gdpsData.username;
        pictureLink = gdpsData.img;
        renderJoinLink = true;
        isWeekly = 0;
        language = 'RU';
        tagsOs =   '';

		/*
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        gdpsTitle = gdpsData[1];
        description = gdpsData[2];
        Tags = JSON.parse(gdpsData[3]);
        os = JSON.parse(gdpsData[4]);
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        renderJoinLink = gdpsData[9];
        isWeekly = gdpsData[10];
        gdpsLang = gdpsData[13];
        tagsOs =   '';
		*/


        renderJoinLink = renderJoinLink ? '' : `<a data-trans="joinToGdps" href="join.php?id=${id}" target=_blank>${getTrans('joinToGdps')}</a>    `;

        if(isWeekly == 1)
            isWeeklyData = ['box-shadow:0 0px 4px 2px #AC5A00;background:linear-gradient(#AC5A00,#dc7400);',
            `<h1 data-trans="weekGdps" style="margin:0;margin-top:-50px;padding:0;background:#dc7400;border-radius:8px" align="center">${getTrans('weekGdps')}</h1>`];
        else 
            isWeeklyData = ['',''];
        
        tags.forEach(function(tag) {
            tagsOs += `<div class="tag">${toStringGDPS(tag)}</div>`;
        });
        os.forEach(function(tag) {
            tagsOs += `<div class="os">${toStringGDPS(tag)}</div>`;
        });
        
    
        html += 
        `<div class="framegdps" style="${isWeeklyData[0]}width:280px;height:450px" id="${id}">`+
            isWeeklyData[1]+
            `<h2>${title} <img src="./imgs/${language}.png"></h2>`+
            `<p style="margin:0;padding:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'main(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:128px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=128px height=128px style="border-radius:24px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `${renderJoinLink}`+
                `<button data-trans="moreInfo" class=loginbtn onclick="helperContent('gdps', ${id})">${getTrans('moreInfo')}</button> `+
                `<div class="likezone">`+
                    `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                    `<button onclick="sendLike(${id},0)" id="like"></button>`+
                    `<button onclick="sendDislike(${id},0)" id="dislike"></button>`+
                `</div>`+
            `</div>`+
            `<div class="flex-row">${tagsOs}</div>`+
        `</div>`;
    };
    return html;
},
TEXTrenderMini = function(parsedData) {
    let html = '',
        count = 0;
        
    let gdpsData = null,
        id = null,
        title = null,
        description = null,
        tags = null,
        os = null,
        likesCount = null,
        userId = null,
        username = null,
        pictureLink = null,
        download = null,
        tagsOs =   '';

    for (let Id in parsedData) {
        count++;
        if (count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        title = gdpsData[1];
        description = gdpsData[2];
        tags = JSON.parse(gdpsData[3]);
        os = JSON.parse(gdpsData[4]);
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        download = gdpsData[9];
        tagsOs = '';
        
        tags.forEach(function(tag) {
            tagsOs += `<div class="tag">${toStringTEXT(tag)}</div>`;
        });
        os.forEach(function(tag) {
            tagsOs += `<div class="os">${toStringTEXT(tag)}</div>`;
        });
        
    
        html += 
        `<div class=framegdps style="width:280px;height:450px" id="${id}">`+
            `<h2>${title}</h2>`+
            `<p style="margin:0;padding:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'main(pageText())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style=min-height:128px>`+
                `<img onerror="this.src='./imgs/empty.png'" align=left src="${decodeURIComponent(pictureLink)}" width=128px height=128px style=border-radius:24px>`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style=margin-top:15px>`+
                `<a data-trans="download" href="${decodeURIComponent(download)}" target=_blank>${getTrans('download')}</a>`+
                `<button data-trans="moreInfo" class=loginbtn onclick="helperContent('text',${id})">${getTrans('moreInfo')}</button>`+
                `<div class=likezone>`+
                    `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                    `<button onclick="sendLike(${id},1)" id="like"></button>`+
                    `<button onclick="sendDislike(${id},1)" id="dislike"></button>`+
                `</div>`+
            `</div>`+
            `<div class="flex-row">${tagsOs}</div>`+
        `</div>`;
    };
    return html;
},
gdpsReport = function(gdpsId) {
    let html = 
    `<div class=framemenu id=REPform>`+
        `<h1 data-trans="report01">${getTrans('report01')}</h1>`+
        `<form onsubmit="return enterFormData(this,'report.php')">`+
            `<input name=gdps value="${gdpsId}" type=hidden>`+
            `<textarea data-trans="report02" style="width:250px;height:100px" placeholder="${getTrans('report02')}" class=framelabel name=text></textarea><br>`+
            `<button data-trans="otmena" onclick="document.getElementById('REPform').remove()" class=loginbtn>${getTrans('otmena')}</button> `+
            `<input data-trans="commSend" type=submit value=${getTrans('commSend')} class=loginbtn>`+
        `</form>`+
    `</div>`;
    document.getElementById('1st').insertAdjacentHTML('beforeend', html);
},
GDPSrender = function(parsedData) {
    let html = '';

		// Object Hub compat
    let gdpsData = parsedData.gdps,
        id = gdpsData.ID,
        title = gdpsData.title,
        description = gdpsData.text,
        tags = JSON.parse(gdpsData.tags)
        os = JSON.parse(gdpsData.os),
        likesCount = gdpsData.likes,
        userId = gdpsData.author,
        username = gdpsData.username,
        pictureLink = gdpsData.img,
        renderJoinLink = true,
        serverStatus = 0 
        tagsOs =   '';

	/*
    let gdpsData = parsedData.gdps,
        id = gdpsData[0],
        title = gdpsData[1],
        description = gdpsData[2],
        tags = JSON.parse(gdpsData[3]),
        os = JSON.parse(gdpsData[4]),
        likesCount = gdpsData[5],
        userId = gdpsData[6],
        username = gdpsData[7],
        pictureLink = gdpsData[8],
        renderJoinLink = gdpsData[9],
        serverStatus = gdpsData[10],
        tagsOs =   '';
	*/

    tags.forEach(function(tag) {
        tagsOs += `<div class="tag">${toStringGDPS(tag)}</div>`;
    });
    html += '</div>'+'<div class="flex-row">'
    os.forEach(function(tag) {
        tagsOs += `<div class="os">${toStringGDPS(tag)}</div>`;
    });

    switch (serverStatus) {
        case -1:
            serverStatus = getTrans('GDPSstatus10');
            break;
        case 0:
            serverStatus = getTrans('GDPSstatus00');
            break;
        case 1:
            serverStatus = getTrans('GDPSstatus01');
            break;
    };

    html += 
    `<div class="framegdps">`+
        `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=128px height=128px style="border-radius:24px">`+
        `<h2>${title}</h2>`+
        `<h3>${serverStatus}</h3>`+
        `<p style="margin:0;padding:0">`+
            `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
            `<button onclick="otherProfile(${userId},'main(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
        `</p>`+
        `<div class="flex-row">${tagsOs}</div>`+
        `<p>${description}</p>`+
        `<div style="margin-top:15px">`+
            `<a data-trans="joinToGdps" href="join.php?id=${id}" target=_blank>${getTrans('joinToGdps')}</a> `+
            `<button data-trans="getLink" class="loginbtn" onclick="linkCopy('https://gdpshelper.xyz/list/gdps.php?id=${id}')">${getTrans('getLink')}</button>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                `<button onclick="sendLike(${id},0)" id="like"></button>`+
                `<button onclick="sendDislike(${id},0)" id="dislike"></button>`+
            `</div>`+
        `</div>`+
        `<button onclick="gdpsReport(${id})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
            `<img src=./imgs/flag.svg width=16px style=margin:0>`+
        `</button>`+
    `</div>`;
    return html;
},
TEXTrender = function(parsedData) {
    let html = '';
    
    let gdpsData = parsedData.gdps,
        id = gdpsData[0],
        title = gdpsData[1],
        description = gdpsData[2],
        tags = JSON.parse(gdpsData[3]),
        os = JSON.parse(gdpsData[4]),
        likesCount = gdpsData[5],
        userId = gdpsData[6],
        username = gdpsData[7],
        PictureLink = gdpsData[8],
        AndroidLink = gdpsData[9],
        WindowsLink = gdpsData[10],
        tagsOs =   '';

    tags.forEach(function(tag) {
        tagsOs += `<div class="tag">${toStringGDPS(tag)}</div>`;
    });
    html += '</div>'+'<div class="flex-row">'
    os.forEach(function(tag) {
        tagsOs += `<div class="os">${toStringGDPS(tag)}</div>`;
    });

    html += 
    `<div class="framegdps">`+
        `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(PictureLink)}" width=128px height=128px style="border-radius:24px">`+
        `<h2>${title}</h2>`+
        `<p style="margin:0;padding:0">`+
            `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
            `<button onclick="otherProfile(${userId},'main(pageText())')" style="background:0;border:0;color:white">${username}</button>`+
        `</p>`+
        `<div class="flex-row">${tagsOs}</div>`+
        `<p>${description}</p>`+
        `<div style="margin-top:15px   ">`;

    if (WindowsLink != '') {
        html += 
            `<a data-trans="downloadPC" href="${decodeURIComponent(WindowsLink)}" target=_blank>${getTrans('downloadPC')}</a> `;
    };
    if (AndroidLink != '') {
        html += 
            `<a data-trans="downloadMB" href="${decodeURIComponent(AndroidLink)}" target=_blank>${getTrans('downloadMB')}</a> `;
    };

    html += 
            `<button class="loginbtn" onclick="linkCopy('https://gdpshelper.xyz/textures/texure.php?id=${id}')">Скопировать ссылку</button>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                `<button onclick="sendLike(this.value,0)" id="like" value="${id}"></button>`+
                `<button onclick="sendDislike(this.value,0)" id="dislike" value="${id}"></button>`+
            `</div>`+
        `</div>`+
    `</div>`;
    return html;
},
GDPSrenderInProfile = function(parsedData) {
    let html = '',
        count = 0;

    let gdpsData = null,
        id = null,
        title = null,
        description = null,
        userId = null,
        username = null,
        pictureLink = null,
        renderJoinLink = null,
        isWeeklyData = ['',''];
    
    for (let Id in parsedData) {
        count++;
        if (count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        title = gdpsData[1];
        description = gdpsData[2];
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        renderJoinLink = gdpsData[9];
        isWeekly = gdpsData[10];
        link = gdpsData[11];
        database = gdpsData[12];
        checked = gdpsData[13];
        coowner = gdpsData[14];
        owner = gdpsData[15];
        check = '';
        freejoin_text = '';
        coowners_btn = '';

        renderJoinLink = renderJoinLink ? null : `<a data-trans="joinToGdps" href="join.php?id=${id}" target=_blank>${getTrans('joinToGdps')}</a> `;

        isWeeklyData = ['',''];

        html += 
        `<div class="framegdps" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="${id}">`+
            `${isWeeklyData[1]}`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0;padding:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'main(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:32px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a data-trans="joinToGdps" href="join.php?id=${id}" target="_blank">${getTrans('joinToGdps')}</a>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
TEXTrenderInProfile = function(parsedData) {
    let html = '',
        count = 0;
        
    let gdpsData = null,
        id = null,
        title = null,
        description = null,
        likesCount = null,
        userId = null,
        username = null,
        pictureLink = null,
        AndroidLink = null,
        WindowsLink = null;

    for (let Id in parsedData) {
        count++;
        if (count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        title = gdpsData[1];
        description = gdpsData[2];
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];

        if (gdpsData[9] != '')
            WindowsLink = `<a data-trans="downloadPCmini" href="${gdpsData[10]}" target=_blank>${getTrans('downloadPCmini')}</a>`;
        else
            WindowsLink = `${getTrans('downloadPCmini')} (${getTrans('textNone')})`;

        if (gdpsData[10] != '')
            AndroidLink = `<a data-trans="downloadMBmini" href="${gdpsData[9]}" target=_blank>${getTrans('downloadMBmini')}</a>`;
        else 
            AndroidLink = `${getTrans('downloadMBmini')} (${getTrans('textNone')})`;

        html += 
        `<div class=framegdps style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0;padding:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'main(pageText())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style=min-height:32px>`+
                `<img onerror="this.src='./imgs/empty.png'" align=left src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                AndroidLink+
                ` `+
                WindowsLink+
            `</div>`+
        `</div>`;
    };
    return html;
},
TEXTrenderInProfile2 = function(parsedData) {
    let html = '',
        count = 0;
        
    let gdpsData = null,
        id = null,
        title = null,
        description = null,
        likesCount = null,
        userId = null,
        username = null,
        pictureLink = null,
        AndroidLink = null,
        WindowsLink = null;

    for (let Id in parsedData) {
        count++;
        if (count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        title = gdpsData[1];
        description = gdpsData[2];
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];

        if (gdpsData[9] != '')
            WindowsLink = `<a data-trans="downloadPCmini" href="${gdpsData[10]}" target=_blank>${getTrans('downloadPCmini')}</a>`;
        else
            WindowsLink = `${getTrans('downloadPCmini')} (${getTrans('textNone')})`;

        if (gdpsData[10] != '')
            AndroidLink = `<a data-trans="downloadMBmini" href="${gdpsData[9]}" target=_blank>${getTrans('downloadMBmini')}</a>`;
        else 
            AndroidLink = `${getTrans('downloadMBmini')} (${getTrans('textNone')})`;

        html += 
        `<div class=framegdps style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0;padding:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'main(pageText())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style=min-height:32px>`+
                `<img onerror="this.src='./imgs/empty.png'" align=left src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                AndroidLink+
                ` `+
                WindowsLink+
                `<button data-trans="editText" onclick="editText(${id})" class=loginbtn style="margin-top:8px">${getTrans('editText')}</button> `+
                `<button data-trans="coowners" onclick="coownersMenu(${id},4)" class=loginbtn style="margin-top:8px">${getTrans('coowners')}</button>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
GDPSrenderInProfile2 = function(parsedData) {
    let html = '',
        count = 0;

    let gdpsData = null,
        id = null,
        title = null,
        description = null,
        userId = null,
        username = null,
        pictureLink = null,
        renderJoinLink = null,
        MC = null,
        CC = null,
        Points = null;
    
    for (let Id in parsedData) {
        count++
        if (count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        title = gdpsData[1];
        description = gdpsData[2];
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        renderJoinLink = gdpsData[9];
      //isWeekly = gdpsData[10];
        MC = gdpsData[11];
        CC = gdpsData[12];
        Points = gdpsData[14];
        check = '';
        freejoin_text = '';

        renderJoinLink = renderJoinLink ? null : `<a data-trans="joinToGdps" href="join.php?id=${id}" target=_blank>${getTrans('joinToGdps')}</a> `;

        let coownersBtn = '';

        if (thisUser[1] == userId)
            coownersBtn = `<button data-trans="coowners" onclick="coownersMenu(${id},3)" class=loginbtn style="margin-top:8px">${getTrans('coowners')}</button>`;
        else
            coownersBtn = `<button data-trans="coownersNone" class=loginbtn style="margin-top:8px">${getTrans('coownersNone')}</button>`;

        html += 
        `<div class="framegdps" style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0;padding:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'main(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:32px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a data-trans="joinToGdps" href="join.php?id=${id}" target="_blank">${getTrans('joinToGdps')}</a>`+
            `</div>`+
            `<button data-trans="editGdps" onclick="editGdps(${id})" class=loginbtn style="margin-top:8px">${getTrans('editGdps')}</button> `+
            coownersBtn+
            `<button data-trans="joins" onclick="getJoinLog(${id})" class=loginbtn style="margin-top:8px">${getTrans('joins')}</button><br>`+
            `<span data-trans="isMC">${getTrans('isMC')}</span>:<button id=MC${id} class="loginbtn" data-trans="${!!MC ? 'CCtrue' : 'CCfalse'}" onclick="MCedit(${id})">${getTrans(!!MC ? 'CCtrue' : 'CCfalse')}</button><br>`+
            `<span data-trans="isCC">${getTrans('isCC')}</span>:<button id=CC${id} class="loginbtn" data-trans="${!!CC ? 'CCtrue' : 'CCfalse'}" onclick="CCedit(${id})">${getTrans(!!CC ? 'CCtrue' : 'CCfalse')}</button><br>`+
            `<span data-trans="isJE">${getTrans('isJE')}</span>:<button id=JE${id} class="loginbtn" data-trans="${!!renderJoinLink ? 'no' : 'yes'}" onclick="JEedit(${id})">${getTrans(!!renderJoinLink ? 'no' : 'yes')}</button><br>`+
            `<span data-trans="isBL">${getTrans('isBL')}</span>:<button id=BL${id} class="loginbtn" onclick="ballsUp(${id})">${Points}</button>`+
        `</div>`;
    };
    return html;
},
renderComms = function(parsedData, commtype = 0, dataForNextButton = '') {

    let commcount = 0,
        html = '',
        htmlFull = '',
        delBtn = '',

        gdpsData = null,
        id = null,
        username = null,
        text = null,
        userId = null,
        userrole = null,
        likes = null,
        date = null,
        nameColor = null;

    for (let ide in parsedData) {
        if (commcount == 10) {
            htmlFull = htmlFull + insertBtn(`helperComments(${dataForNextButton})`);
            return htmlFull;
        };
        commcount++;
    
        gdpsData = parsedData[ide];
        id = gdpsData[0];
        username = gdpsData[1];
        text = gdpsData[2];
        userId = gdpsData[3];
        userrole = gdpsData[4];
        likes = gdpsData[5];
        date = gdpsData[6];
        switch (userrole) {
            case 0:
                nameColor = 'white';
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
        `<button onclick="deleteComm(${id},${commtype})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
            `<img width=24px src="./imgs/trash.svg">`+
        `</button>`;
        
        html = 
        `<div class="framecomm" id=comm${id}>`+
            `<button style="border:none;background:none;margin:0;padding:0;font-size:32px;font-weight:bold;color:${nameColor}"`+
            `onclick="otherProfile(${userId},lastUsed3)">${username}</button>`+
            `<p style="margin:0;padding:0">${timeAgo(date)}</p>`+
            `<p>${text}</p>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCountComm${id}">${likes}</span>`+
                `<button onclick="sendLike(${id},${commtype},1)" id="like"></button>`+
                `<button onclick="sendDislike(${id},${commtype},1)" id="dislike"></button>`+
            `</div>`+
            (thisUser[1] == userId ? delBtn : '')+
        `</div>`;
    
        htmlFull = htmlFull + html;
    
        html = '';
    };
    if (htmlFull == '')
        return `<h1 data-trans="commsNone">${getTrans('commsNone')}</h1>`
    return htmlFull;
},
RenderNews = function(data, isComm = 0, innerGdpsRendered = 'mega') {
    let html = '',
        html2 = '',
        delBtn = '',
        canDel = false,
        
        gdpsData = null,
        id = null,
        title = null,
        text = null,
        userId = null,
        username = null,
        gdpsId = null,
        gdpsTitle = null,
        date = null,
        likesCount = null,
        miniRenderMode =   '';

    let myGdpsesIds = [];

    for (let gdpsKey in myGdpses[0]) {
        if (thisUser[1] == myGdpses[0][gdpsKey][6])
            myGdpsesIds.push(myGdpses[0][gdpsKey][0]);
    };

    if (innerGdpsRendered == 'mini')
        miniRenderMode = 'style="width:calc(100% - 40px)"'


    for (let ide in data)  {
    
        html = '';
        
        gdpsData = data[ide];
        id = gdpsData[0];
        title = gdpsData[1];
        text = gdpsData[2];
        userId = gdpsData[3];
        username = gdpsData[4];
        gdpsId = gdpsData[5].slice(1);
        gdpsTitle = gdpsData[6];
        date = gdpsData[7];
        likesCount = gdpsData[8];

        delBtn = 
        `<button onclick="deleteNews(${id},${isComm})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
            `<img style=margin:0 width=24px src="./imgs/trash.svg">`+
        `</button>`;
        canDel = false;
        if (thisUser[1] == userId || myGdpsesIds.includes(gdpsId))
            canDel = true;
    
        html = 
        `<div class=framegdps id=news${id} ${miniRenderMode}>`+
            `<h1>${title}</h1>`+
            `<button class=loginbtn onclick="helperContent('gdps', ${gdpsId})">${gdpsTitle}</button> `+
            `- <button class=emptybtn onclick="otherProfile(${userId},'helperNews(${gdpsId})')">${username}</button>`+
            `<p>${timeAgo(date)}</p>`+
            `<p>${text}</p>`+
            `<div class="likezone"> `+
                `<span class=likeplace id="likesCount${id}">${likesCount}</span> `+
                `<button onclick="sendLike(${id},2)" id="like"></button> `+
                `<button onclick="sendDislike(${id},2)" id="dislike"></button> `+
            `</div>`+
            (canDel ? delBtn : '')+
            `${isComm ? '' : `<button data-trans="comms" class=loginbtn onclick=helperContent('newsC',${id},${gdpsId})>${getTrans('comms')}</button>`}`+
        `</div>`;
        html2 = html2 + html;
    };
    if (html2 == '')
        return `<h1 data-trans="newsNoneReal">${getTrans('newsNoneReal')}</h1>`
    return html2;
},
renderStat = function(data) {
    if (JSON.stringify(data) === '[]') {return document.getElementById('Stat').remove()}

    var parsedData = data;
    var dates = [];
    var levels = [];

    for (var i = 0; i < parsedData.length; i++) {
        dates.push(parsedData[i].date);
        levels.push(parsedData[i].levels);
    }

    var canvas = document.getElementById('Stat');
    var ctx = canvas.getContext('2d');

    var chartWidth = canvas.width - 40;
    var chartHeight = canvas.height - 80;

    var maxValue = Math.max.apply(null, levels);
    var barWidth = chartWidth / levels.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var dated = null;

    var date = null;

    var barHeight = null;
    var x = null;
    var y = null;

    for (var i = 0; i < levels.length; i++) {
        dated = new Date(dates[i] * 1000);
    
        date = dated.getFullYear() + ':' + dated.getMonth() + ':' + dated.getDate();
    
        barHeight = (levels[i] / maxValue) * chartHeight;
        x = i * barWidth + 20;
        y = chartHeight - barHeight + 20;
        ctx.fillStyle = '#ff8600';
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        ctx.fillStyle = '#fff';
        ctx.fillText(levels[i], x, y - 10);
    
        ctx.save();
        ctx.translate(x, canvas.height - 10);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.fillStyle = '#fff';
        ctx.fillText(date, 0, 0);
        ctx.restore();
    };
},
timeAgo = function(timestamp) {
    let timeDiff = Math.floor((Date.now() / 1000) - timestamp);

    if (timeDiff < 60) {
        return timeDiff + getTrans('timeAgo01');
    } else if (timeDiff < 3600) {
        let minutes = Math.floor(timeDiff / 60);
        let seconds = timeDiff % 60;
        return minutes + getTrans('timeAgo02') + seconds + getTrans('timeAgo03');
    } else if (timeDiff < 86400) {
        let hours = Math.floor(timeDiff / 3600);
        let minutes = Math.floor((timeDiff % 3600) / 60);
        return hours + getTrans('timeAgo04') + minutes + getTrans('timeAgo05');
    } else if (timeDiff < 604800) {
        let days = Math.floor(timeDiff / 86400);
        let hours = Math.floor((timeDiff % 86400) / 3600);
        return days + getTrans('timeAgo06') + hours + getTrans('timeAgo07');
    } else if (timeDiff < 2592000) {
        let weeks = Math.floor(timeDiff / 604800);
        let days = Math.floor((timeDiff % 604800) / 86400);
        return weeks + getTrans('timeAgo08') + days + getTrans('timeAgo09');
    } else if (timeDiff < 31536000) {
        let months = Math.floor(timeDiff / 2592000);
        let weeks = Math.floor((timeDiff % 2592000) / 604800);
        return months + getTrans('timeAgo10') + weeks + getTrans('timeAgo11');
    } else {
        return getTrans('timeAgo12');
    };
},

Loading = function(stop = 0) {
    if (stop == 0)
        document.body.insertAdjacentHTML('beforeend',
            '<div data-trans="loading..." id=TheLoadingElem style=position:absolute><h1>' +
                getTrans('loading...') +
            '</h1></div>'
        );
    else
        if (document.getElementById('TheLoadingElem'))
            document.getElementById('TheLoadingElem').remove();
},
linkCopy = function(string) {
    navigator.clipboard.writeText(string)
        .then(function() {})
        .catch(function(error) {returnError(error)});
        document.getElementById('1st').insertAdjacentHTML('beforeend',
        `<div id=CopyElem style=position:absolute><h1 data-trans="copied">${getTrans('copied')}</h1></div>`
        );
        setTimeout(function() {
            document.getElementById('CopyElem').remove();
        }, 1000);
},
enterFormData = function(form, sendPlace) {
    let formData = new FormData(form);
    let params = new URLSearchParams(formData).toString();
    console.log(params);

    Loading();
    helperRequest(`${sData[1]}${sendPlace}`, params)
    .then(data => {
        Loading(1);
        switch (sendPlace) {
            default:
                let resp = JSON.parse(data);
                isLogged = 1;
                thisUser = resp[0];
                GDPSes = resp[1];
                Textures = resp[2];
                myGdpses = [];
                myTextures = [];
                myGdpses.push(resp[3][0]);
                myTextures.push(resp[3][1]);
                main(profilePage());
                break;
            case 'newsPost.php':
                helperContent('gdps',formData.get('gdps'));
                break;
            case 'writeAlarm.php':
                document.getElementById('F45').remove();
                break;
            case 'report.php':
                document.getElementById('1st').insertAdjacentHTML('beforeend',
                `<div id=debug style=position:absolute><h1 data-trans="reported">${getTrans('reported')}</h1></div>`
                );
                setTimeout(function() {
                    document.getElementById('debug').remove();
                    document.getElementById('REPform').remove()
                }, 1000);
                break;
        };
        return false;
    })
    .catch(function(error) {returnError(error)});

    return false;
},

//костыль для работы старых fetch*** функций
getLastUse = function(contentType, inputType, page, tags = '') {
    page++;
    switch (inputType) {
        default:         inputType = `fetchNew(${       contentType},${page})`          ; break;
        case 'recent':   inputType = `fetchNew(${       contentType},${page})`          ; break;
        case 'tags':     inputType = `fetchTags(${      contentType},${page},'${tags}')`; break;
        case 'os':       inputType = `fetchOs(${        contentType},${page},'${tags}')`; break;
        case 'name':     inputType = `fetchName(${      contentType},${page})`          ; break;
        case 'likes':    inputType = `fetchLiked(${     contentType},${page})`          ; break;
        case 'dislikes': inputType = `fetchDisliked(${  contentType},${page})`          ; break;
        case 'points':   inputType = `fetchPoints(${                   page})`          ; break;
        case 'mods':     inputType = `fetchMC(${                       page})`          ; break;
        case 'crec':     inputType = `fetchCC(${                       page})`          ; break;
    }
    if (contentType == 0) {
        lastUsed = inputType;
    } else if (contentType == 1) {
        lastUsed2 = inputType;
    };
    return inputType;
},
fetchNew = function(type, page = 0) {
    return helperFetch(type,'recent',page);
},
fetchTags = function(type, page = 0, tags = '') {
    if (tags == '') return fetchNew(type,page);
    return helperFetch(type,'tags',page, tags);
},
fetchOs = function(type, page = 0, tags = '') {
    return helperFetch(type,'os',page, tags);
},
fetchName = function(type, page = 0) {
    if (document.getElementById('framelabel').value == '')
        return fetchNew(type,page);
    return helperFetch(type,'name',page,'name='+document.getElementById('framelabel').value);
},
fetchLiked = function(type, page = 0) {
    return helperFetch(type, 'likes', page, 'likes');
},
fetchDisliked = function(type, page = 0) {
    return helperFetch(type, 'dislikes', page, 'dislikes');
},
fetchPoints = function(page = 0) {
    return helperFetch(0, 'points', page, 'points');
},
fetchMC = function(page = 0) {
    return helperFetch(0, 'mods', page, 'mods');
},
fetchCC = function(page = 0) {
    return helperFetch(0, 'crec', page, 'crec');
},

sendLike = function(id, channel, isComm = 0) {
    if (!isLogged)
        return alert(getTrans('needLogin'));

    Loading();
    let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
    helperRequest(`${sData[1]}like.php`, data)
        .then(function(data)  {
            if (!isComm)
                document.getElementById('likesCount' + id).innerText = data;
            else
                document.getElementById('likesCountComm' + id).innerText = data;
            Loading(1);
        })
        .catch(function(error) {returnError(error)});
},
sendDislike = function(id, channel, isComm = 0) {
    if (!isLogged)
        return alert(getTrans('needLogin'));
    
    Loading();
    let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
    helperRequest(`${sData[1]}dislike.php`, data)
        .then(function(data)  {
            if (!isComm)
                document.getElementById('likesCount' + id).innerText = data;
            else
                document.getElementById('likesCountComm' + id).innerText = data;
            Loading(1);
        })
        .catch(function(error) {returnError(error)});
},
sendComm = function(id, channel) {
    if (!isLogged)
        return;

    Loading();
    let preTye = '';
    let typeC = 0;
    switch (channel) {
        case 0:    typeC = 3;    break;
        case 1:    typeC = 4;    break;
        case 2:    typeC = 5;    break;
        case 3:    typeC = 6;    break;
    };
    switch (channel) {
        case 0:    preTye = 'gdps';    break;
        case 1:    preTye = 'text';    break;
        case 2:    preTye = 'guid';    break;
        case 3:    preTye = 'news';    break;
    };
    let dataForNextButton = `${id},'${preTye}',1`;
    let text = document.getElementById('text').value;
    let data =
      'ide='   + encodeURIComponent(id)
    + '&type=' + encodeURIComponent(channel)
    + '&text=' + encodeURIComponent(text);
    helperRequest(`${sData[1]}comment.php`, data)
        .then(function(data)  {
            let resp = JSON.parse(data);

            innerComments(renderComms(resp,typeC,dataForNextButton), 0);
            Loading(1);
        })
        .catch(function(error) {returnError(error)});
},
deleteComm = function(id, channel) {
    Loading();
    helperRequest(`${sData[4]}comment.php?ide=${id}&type=${channel}`)
        .then(function(data) {
            Loading(1);
            if (data == '-1')
                return returnError('Access denied');
            document.getElementById('comm'+data).remove();
        })
        .catch(function(error) {returnError(error)});
},
deleteNews = function(id, goBack) {
    Loading();
    helperRequest(`${sData[4]}newsPost.php?ide=${id}`)
        .then(function(data) {
            Loading(1);
            if (data == '-1')
                return returnError('Access denied');
            document.getElementById('news'+data).remove();
            goBack ? history.back() : null;
        })
        .catch(function(error) {returnError(error)});
},
helperFetch = function(channel, type, page = 0, data = '') {

    if (document.getElementById('nextGdps'))
        document.getElementById('nextGdps').remove();
    
    let nextBtn = getLastUse(channel, type, page, data);

    if (data === '')
        type = 'recent';
    else
        data = '&' + data;

    switch (type) {
        default:         type = 'recent';  break;
        case 'recent':   type = 'recent';  break;
        case 'tags':     type = 'tags';    break;
        case 'os':       type = 'tags';    break;
        case 'name':     type = 'other';   break;
        case 'dislikes': type = 'other';   break;
        case 'likes':    type = 'other';   break;
        case 'points':   type = 'other';   break;
        case 'mods':     type = 'other';   break;
        case 'crec':     type = 'other';   break;
    }

    Loading()
    helperRequest(`${sData[3]}${type}.php?type=${channel}&page=${page}${data}`)
        .then(function(data)  {
            Loading(1);
            let Gdpses = JSON.parse(data);
                
            let count = Object.keys(Gdpses).length;
            if (channel == 0)
                innerGdpsPlace(GDPSrenderMini(Gdpses), page);
            else if (channel == 1) 
                innerGdpsPlace(TEXTrenderMini(Gdpses), page);

            if (count >= 9)
                innerGdpsPlace(insertBtn(nextBtn),-1);
        })
        .catch(function(error) {returnError(error)});
},
helperContent = function(type, id, otherData = 0) {
    let commType = 0;
    let backFunc = '';
    switch (type) {
        case 'gdps':
			type = 'camp';
            backFunc = 'pageList())';
            setLink('?'+'gdps='+id);
            main(GDPSpreload(`${id},0`, backFunc));
            break;
        case 'text':
            commType = 1;
            backFunc = 'pageText())';
            setLink('?'+'texture='+id);
            main(contentPreload(`${id},${commType}`, backFunc));
            break;
        case 'guid':
            commType = 3;
            backFunc = 'pageGuid())';
            main(contentPreload(`${id},${commType}`, backFunc));
            break;
        case 'newsC':
            commType = 2;
            backFunc = `gdpsNewsPage(${otherData}));helperContent('gdps', ${otherData})`;
            setLink('?'+'newsC='+id+'.'+otherData);
            main(contentPreload(`${id},${commType}`, backFunc));
            break;
    };
    Loading();
    helperRequest(`${sData[0]}${type}.php?id=${id}`)
        .then(function(data)  {
			if (type === 'camp')
				type = 'gdps';
            let dataForNextButton = `${id},'${type}',1`;

            Loading(1);
            let resp = JSON.parse(data);
            let insert = '';
            switch (type) {
                case 'gdps':
                    insert = GDPSrender(resp);
                    innerComments(renderComms(resp.comments,3,dataForNextButton), 0);
                    let news = ''                    
                    document.getElementById('news').innerHTML = RenderNews(resp.news,0,'mini');
					//статистики давно нет - отключаем
                    //renderStat(resp.gdpsstat);
                    break;
                case 'text':
                    insert = TEXTrender(resp);
                    innerComments(renderComms(resp.comments,4,dataForNextButton), 0);
                    break;
                case 'newsC':
                    insert = RenderNews(resp.gdps,1);
                    innerComments(renderComms(resp.comments,5,dataForNextButton), 0);
                    break;
            };
            document.getElementById('insertable').innerHTML = insert;
        })
        .catch(function(error) {returnError(error)});
},
helperComments = function(postId, type, page = 0) {
    document.getElementById('nextGdps').remove();
    let typeC = 0;
    let dataForNextButton = `${postId},'${type}',${parseInt(page + 1)}`;
    switch (type) {
        case 'gdps':    type = 0; typeC = 3;    break;
        case 'text':    type = 1; typeC = 4;    break;
        case 'guid':    type = 3; typeC = 6;    break;
        case 'news':    type = 2; typeC = 5;    break;
        case 'newsC':   type = 2; typeC = 5;    break;
    };
    Loading();
    helperRequest(`${sData[0]}fetchComms.php?id=${postId}&type=${type}&page=${page}`)
        .then(function(data)  {
            Loading(1);
            let resp = JSON.parse(data);
            innerComments(renderComms(resp,typeC,dataForNextButton), 1);
        })
        .catch(function(error) {returnError(error)});
},
helperNews = function(gdpsId) {
    main(gdpsNewsPage(gdpsId));
    Loading();
    helperRequest(`${sData[0]}news.php?id=${gdpsId}`)
        .then(data => {
            setLink('?'+'news='+gdpsId);
            Loading(1);
            if (data == '{}') {
                innerGdpsPlace(`<h1>${getTrans('newsNone')}</h1>`, 1);
            } else {
                let parsedData = JSON.parse(data);
                innerGdpsPlace(RenderNews(parsedData,5,''));
            };
        })
        .catch(function(error) {returnError(error)});
},
sendRegisterForm = function() {
    let username = document.getElementById('LGusername').value;
    let password = document.getElementById('LGpassword').value;
    let email    = document.getElementById('LGemail'   ).value;
    let hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha) {
        Loading();
        helperRequest(
            `${sData[2]}register.php`,
            `username=${username}&password=${password}&email=${email}`+
            `&g-recaptcha-response=${hcaptcha}&h-captcha-response=${hcaptcha}`
        )
        .then(data => {
            Loading(1);
            switch (data) {
                case '-1':
                    alert('Никнейм или почта уже заняты!');
                    break;
                case '-2':
                    alert('Капча не пройдена!');
                    break;
                default:
                    isLogged = 1;
                    let resp = JSON.parse(data);
                    isLogged = 1;
                    thisUser = resp[0];
                    GDPSes = resp[1];
                    Textures = resp[2];
                    myGdpses = [];
                    myTextures = [];
                    myGdpses.push(resp[3][0]);
                    myTextures.push(resp[3][1]);
                    dropLogin(1);
                    localStorage.helperUser = thisUser[5];
                    thisUser.pop();
            }
        })
        .catch(function(error) {returnError(error)});
    } else {
        alert('Капча не пройдена!');
    };
},
sendLoginForm = function() {
    let username = document.getElementById('LGusername').value;
    let password = document.getElementById('LGpassword').value;
    let hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha) {
        Loading();
        helperRequest(
            `${sData[2]}login.php`,
            `username=${username}&password=${password}`+
            `&g-recaptcha-response=${hcaptcha}&h-captcha-response=${hcaptcha}`
        )
        .then(data => {
            Loading(1);
            switch (data) {
                case '-1':
                    alert('Неправильный пароль!');
                    break;
                case '-2':
                    alert('Такого аккаунта не существует!');
                    break;
                case '-3':
                    alert('Капча не пройдена!');
                    break;
                default:
                    isLogged = 1;
                    let resp = JSON.parse(data);
                    isLogged = 1;
                    thisUser = resp[0];
                    GDPSes = resp[1];
                    Textures = resp[2];
                    myGdpses = [];
                    myTextures = [];
                    myGdpses.push(resp[3][0]);
                    myTextures.push(resp[3][1]);
                    dropLogin(1);
                    localStorage.helperUser = thisUser.slice(5);
                    thisUser.pop();
            }
        })
        .catch(function(error) {returnError(error)});
    } else {
        alert('Капча не пройдена!');
    };
},
sendDrop = function() {
    let username = document.getElementById('LGusername').value;
    let password = document.getElementById('LGpassword').value;
    let email    = document.getElementById('LGemail'   ).value;
    Loading();
    helperRequest(
        `${sData[2]}drop.php`,
        `username=${username}&password=${password}&email=${email}`
    )
    .then(data => {
        Loading(1);
        if (data == '-1')
            return alert('неа');
        else if (data == '1')
            if (thisUser[0] !== '???')
                dropLogin(1);
    })
    .catch(function(error) {returnError(error)});
},
gLogout = function() {
    Loading();
    helperRequest(sData[2]+'logout.php')
        .then(function() {
            Loading(1);
            thisUser = ['???',0,0,0,0,'',/*helperVer*/];
            localStorage.removeItem("helperUser");
            token = undefined;
            isLogged = 0;
            main(pageList());
        })
        .catch(function(error) {returnError(error)});
},
returnError = function(err) {
    console.log(err);
    document.body.insertAdjacentHTML('beforeend',
        '<div id=debug></div>'
    );
    document.getElementById('debug').innerText = err;
    document.getElementById('debug').insertAdjacentHTML(
        'beforeend',
        `<br><br><center><button style=background-color:#333 onclick=reStart()>RESTART</button></center>`
    );
},
helperRequest = function(url, data = '') {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let method = 'GET';
        if (data !== '') 
            method = 'POST';

        xhr.open(method, url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.response);
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network error'));
        };

        if (data !== '') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(data);
        } else {
            xhr.send();
        };
    });
},


ADgdpses = [],
ADtextures = [],
ADwrite = function(userId, inputText = '') {
    let html = 
    `<div class=framemenu id=F45>`+
        `<h1>Write Alarm!!!</h1>`+
        `<form onsubmit="return enterFormData(this,'writeAlarm.php')">`+
            (userId == 0 ?
                `<input placeholder="userId (not username)" class=framelabel name=user><br>` :
                `<input name=user value=${userId} type=hidden>`
            )+
            `<input placeholder=title class=framelabel name=title value="${inputText}"><br>`+
            `<textarea placeholder=text class=framelabel name=text></textarea><br>`+
            `<button onclick="document.getElementById('F45').remove()" class=loginbtn>close</button> `+
            `<input type=submit value=send class=loginbtn>`+
        `</form>`+
    `</div>`;
    document.getElementById('1st').insertAdjacentHTML('beforeend', html);
},
DCgdpses = function(textContent) {
    return document.getElementById('gdpses').insertAdjacentHTML('beforeend', textContent);
},
DCtextures = function(textContent) {
    return document.getElementById('textures').insertAdjacentHTML('beforeend', textContent);
},
ADrender = function(array, type = 'g') {
    let html = ''

    html += 
    `<tr id=${type+array[0]}>`+
        `<td>${array[0]}</td>`+
        `<td><g id=A${type}${array[0]}>${array[6]}</g></td>`+
        `<td>`+
            `<button class=loginbtn onclick=Aaction(0,${array[0]},${Ptype},"activate")>Activate</button>`+
        `</td>`+
        `<td>`+
            `<button class=loginbtn onclick=Aaction(${array[7]},${array[0]},${Ptype},"ban")>Ban</button>`+
        `</td>`+
        `<td>`+
            `<button class=loginbtn onclick=Aaction(${array[7]},${array[0]},${Ptype},"delete")>Delete</button>`+
        `</td>`;

    if (type == 'g') {
        html += 
        `<td>`+
            `<button class=loginbtn onclick=AgdpsEDIT(${array[0]})>Edit GDPS</button>`+
        `</td>`;
    } else {
        html += 
        `<td>`+
            `<button class=loginbtn onclick=AtextEDIT(${array[0]})>Edit TEXT</button>`+
        `</td>`;
    };

    html +=
        `<td>${array[1]}</td>`+
    `</tr>`;

    return html;
},
AsendWeekly = function() {
    let id = document.getElementById('framelabel').value;
    Loading();
    helperRequest(`${sData[2]}Aaction.php?weekly=${id}`)
        .then(() => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data)
            alert('DONE');
        })
        .catch(function(error) {returnError(error)});
},
Aaction = function(userId, id, type, action) {
    let action2 = '';
    switch (action) {
        case "ban":
            action2 = 'Бан вашего сервера';
            break;
        case "delete":
            action2 = 'Удаление вашего сервера';
            break;
    };
    if (userId != 0)
        ADwrite(userId, action2);
    Loading();
    helperRequest(`${sData[2]}Aaction.php?id=${id}&type=${type}&action=${action}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data)
            let t = ''
            switch (type) {
                case 0:
                    t = 'g'
                    break
                case 1:
                    t = 't'
                    break
            }
            
            if (data == '1')
                document.getElementById('A'+t+id).innerHTML = 1
            if (data == '-1')
                document.getElementById('A'+t+id).innerHTML = -1
            if (data == '-2')
                document.getElementById(t+id).remove()
        })
        .catch(function(error) {returnError(error)});
},
AgdpsEDIT = function(id) {
    document.getElementById('gdpsframe').style.display = 'block';
    document.getElementById('sendgdps').value = id;
    let errei = findSubarrayById(id, ADgdpses);
    let tagz = JSON.parse(errei[2]);
    let oz = JSON.parse(errei[3]);

    let chkb = document.querySelectorAll('input[type="checkbox"][name="tags"]');
    chkb.forEach(function(ch) {
        ch.checked = false;
    })

    chkb = document.querySelectorAll('input[type="checkbox"][name="os"]');
    chkb.forEach(function(ch) {
        ch.checked = false;
    })
    
    chkb = null;
    
    for (let i = 0; i < tagz.length; i++) {
        console.log('t'+tagz[i]);
        if (document.getElementById('tag'+tagz[i]))
            document.getElementById('tag'+tagz[i]).checked = true;
    };

    for (let i = 0; i < oz.length; i++) {
        console.log('o'+oz[i]);
        if (document.getElementById('os'+oz[i]))
            document.getElementById('os'+oz[i]).checked = true;
    };
},
AtextEDIT = function(id) {
    document.getElementById('textframe').style.display = 'block';
    document.getElementById('sendtext').value = id;
    let errei = findSubarrayById(id, ADtextures);
    let tagz = JSON.parse(errei[2]);
    let oz = JSON.parse(errei[3]);

    let chkb = document.querySelectorAll('input[type="checkbox"][name="tagz"]');
    chkb.forEach(function(ch) {
        ch.checked = false;
    })

    chkb = document.querySelectorAll('input[type="checkbox"][name="oz"]');
    chkb.forEach(function(ch) {
        ch.checked = false;
    })
    
    chkb = null;
    
    for (let i = 0; i < tagz.length; i++) {
        console.log('t'+tagz[i]);
        if (document.getElementById('tak'+tagz[i]))
            document.getElementById('tak'+tagz[i]).checked = true;
    };

    for (let i = 0; i < oz.length; i++) {
        console.log('o'+oz[i]);
        if (document.getElementById('oz'+oz[i]))
            document.getElementById('oz'+oz[i]).checked = true;
    };
},
findSubarrayById = function(id, arrat) {
    for (var i = 0; i < arrat.length; i++) {
        if (arrat[i][0] === id) {
            return arrat[i];
        }
    }
    return null; // Возвращаем null, если подмассив с заданным id не найден
},
Asend = function(type, id) {
    let tags = ''
    let os = ''

    if (type == 0) {
        document.getElementById('gdpsframe').style.display = 'none';
        tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tags"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="os"]:checked'))
            .map(checkbox => checkbox.value));
    } else {
        document.getElementById('textframe').style.display = 'none';
        tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tagz"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="oz"]:checked'))
            .map(checkbox => checkbox.value));
    }

    Loading();
    helperRequest(`${sData[2]}Aedit.php?id=${id}&type=${type}&tags=${tags}&os=${os}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data)
            alert('DONE FOR '+id);
        })
        .catch(function(error) {returnError(error)});
},
Ptype = 0,

adminPanel = function() {
    setLink('?'+'admin');
    let html = pHeader()+
    `<div class="frameprofile">`+
        `<h1>Admin Panel!!1</h1>`+
        `<p>build 2</p>`+
        `<button class=loginbtn onclick="ADwrite(0)">Write Alarm</button><br>`+
        `<h2>Weekly GDPS</h2>`+
        `<input id="framelabel" class="framelabel">`+
        `<button class="loginbtn" onclick="AsendWeekly()">Set</button><br>`+
        `<div style="background-color:#000000;height:300px;overflow:auto">`+
            `<table>`+
                `<tbody id="gdpses">`+
                `</tbody>`+
            `</table>`+
        `</div><br>`+
        `<div style="background-color:#000000;height:300px;overflow:auto">`+
            `<table>`+
                `<tbody id="textures">`+
                `</tbody>`+
            `</table>`+
        `</div>`+
    `</div>`+
    `<div id=gdpsframe class=framelogin style=position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:none>`+
        `<h1>GDPS EDIT!1!</h1>`+
        `<p>tags</p>`+
        `<label>Старее 2.1:</label>`+
        `<input value=1 type=checkbox name=tags id=tag1><br>`+
        `<label>2.1:</label>`+
        `<input value=2 type=checkbox name=tags id=tag2><br>`+
        `<label>2.2:</label>`+
        `<input value=3 type=checkbox name=tags id=tag3><br>`+
        `<label>Малый сервер:</label>`+
        `<input value=4 type=checkbox name=tags id=tag4><br>`+
        `<label>Большой сервер:</label>`+
        `<input value=5 type=checkbox name=tags id=tag5><br>`+
        `<label>Бесплатный хостинг:</label>`+
        `<input value=6 type=checkbox name=tags id=tag6><br>`+
        `<label>Личный хостинг:</label>`+
        `<input value=7 type=checkbox name=tags id=tag7><br>`+
        `<label>Заказной хостинг:</label>`+
        `<input value=8 type=checkbox name=tags id=tag8><br>`+
        `<label>Модификации:</label>`+
        `<input value=9 type=checkbox name=tags id=tag9><br>`+
        `<label>Текстуры:</label>`+
        `<input value=10 type=checkbox name=tags id=tag10><br>`+
        `<label>Встроенные читы:</label>`+
        `<input value=11 type=checkbox name=tags id=tag11><br>`+
        `<p>os's</p>`+
        `<label>Windows:</label>`+
        `<input value=12 type=checkbox name=os id=os12><br>`+
        `<label>MacOS:</label>`+
        `<input value=13 type=checkbox name=os id=os13><br>`+
        `<label>Android:</label>`+
        `<input value=14 type=checkbox name=os id=os14><br>`+
        `<label>IOS:</label>`+
        `<input value=15 type=checkbox name=os id=os15><br>`+
        `<br><button onclick="document.getElementById('gdpsframe').style.display='none'" class=loginbtn>close</button>`+
        `<button onclick="Asend(0,this.value)" id=sendgdps value=0 class=loginbtn>send</button>`+
    `</div>`+
    `<div id=textframe class=framelogin style=position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:none>`+
        `<h1>TEXT EDIT!1!</h1>`+
        `<p>tags</p>`+
        `<label>1.9:</label>`+
        `<input value=1 type=checkbox name=tagz id=tak1><br>`+
        `<label>2.0:</label>`+
        `<input value=2 type=checkbox name=tagz id=tak2><br>`+
        `<label>2.1:</label>`+
        `<input value=3 type=checkbox name=tagz id=tak3><br>`+
        `<label>2.2:</label>`+
        `<input value=4 type=checkbox name=tagz id=tak4><br>`+
        `<label>Недоделаный:</label>`+
        `<input value=5 type=checkbox name=tagz id=tak5><br>`+
        `<label>Изменены звуки:</label>`+
        `<input value=6 type=checkbox name=tagz id=tak6><br>`+
        `<label>Изменена музыка:</label>`+
        `<input value=7 type=checkbox name=tagz id=tak7><br>`+
        `<label>Изменены иконки:</label>`+
        `<input value=8 type=checkbox name=tagz id=tak8><br>`+
        `<label>Изменены блоки:</label>`+
        `<input value=9 type=checkbox name=tagz id=tak9><br>`+
        `<p>os's</p>`+
        `<label>Low:</label>`+
        `<input value=12 type=checkbox name=oz id=oz12><br>`+
        `<label>Medium:</label>`+
        `<input value=13 type=checkbox name=oz id=oz13><br>`+
        `<label>High:</label>`+
        `<input value=14 type=checkbox name=oz id=oz14><br>`+
        `<label>Есть на Android:</label>`+
        `<input value=15 type=checkbox name=oz id=oz15><br>`+
        `<br><button onclick="document.getElementById('textframe').style.display='none'" class=loginbtn>close</button>`+
        `<button onclick="Asend(1,this.value)" id=sendtext value=0 class=loginbtn>send</button>`+
    `</div>`;
    main(html);
    Loading();
    helperRequest(`${sData[2]}!takeAll.php`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data)

            let prepender = '<tr style=position:sticky;top:2px;background-color:#000>'+
                '<th class=tR>ID</th>'+
                '<th class=tR>Checked</th>'+
                '<th class=tR>Activate</th>'+
                '<th class=tR>Ban</th>'+
                '<th class=tR>Delete</th>'+
                '<th class=tR>SuperAction</th>'+
                '<th class=tR>Name</th>'+
            '</tr>';

            let resp = JSON.parse(data);
            ADgdpses = resp[0];
            ADtextures = resp[1];
            DCgdpses(prepender);
            DCtextures(prepender);
            Ptype = 0;
            for (let i = 0; i < ADgdpses.length; i++) {
                DCgdpses(ADrender(ADgdpses[i], 'g'));
            }
            Ptype = 1
            for (let i = 0; i < ADtextures.length; i++) {
                DCtextures(ADrender(ADtextures[i], 't'));
            }
        })
        .catch(function(error) {returnError(error)});

};

if (!localStorage.getItem('helperLang') || localStorage.getItem('helperLang') == 'Ru') {
    mainLang = 'RU';
    localStorage.setItem('helperLang', 'RU');
};

window.addEventListener('popstate', function(event) {
    ignore = true;
    getLink();
});
window.addEventListener("load", function() {
    reStart();
});
