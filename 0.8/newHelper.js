// ГАЙД ПО МИНИФИКАЦИИ - Z() это обычный док гет элембуид. p() это заменить весь контект внутри div id=1st

const baseApp = location.origin + location.pathname,

sData = [baseApp+'server/133/content/', baseApp+'server/133/send/', baseApp+'server/133/', baseApp+'server/133/search/', baseApp+'server/133/delete/', baseApp+'server/133/user/', '.php'],

helperVer = 1,

statColor = '#ff8600';

Z = (i) => {
    return document.getElementById(i);
};

// переменные для кеша в поиске
let 
GDPSes = [],
Textures = [],

// переменные для кеша в профилях
myGdpses = [],
mytextures = [],

// переменные для кеша в чужих профилях
otherUser = [],
otherGdpses = [],
otherTextures = [],

yourWikies = [],
wikiesMini = [],

ignore = false, // работает с функцией ниже
setLink = (val)=>{
    if (!ignore) {
        history.pushState(null, null, val);
    }
    ignore = false;
},
getLink = ()=>{
    // там где /// там профильные функции, нужно сделать там p(pageList())
    let actions = {
        '': ()=>             {p(pageList())},
            list: ()=>       {p(pageList())},
                en: ()=>     {translateB('EN',1);p(pageList())},
                ru: ()=>     {translateB('RU',1);p(pageList())},
        shows: ()=>          {p(pageText())},
        camp: (gdpsId)=>     {helperContent('gdps', gdpsId)},
        news: (gdpsId)=>     {helperNews(gdpsId)},
        newsC: (postId)=>    {helperContent('newsC',postId.split('.')[0],postId.split('.')[1])},
        show: (textId)=>     {helperContent('text', textId)},
        special: ()=>        {p(uvazuha())},
        about: ()=>          {p(helperAbout())},
        login: ()=>          {loginPage()},
        register: ()=>       {registerPage()},
        profile: ()=>        {p(profilePage())},
        addedCamps: ()=>     {p(profilePage(gdpsesWindow()))},
        addedShows: ()=>     {p(profilePage(texturesWindow()))},
        addedWikis: ()=>     {p(profilePage(wikisWindow()))},
        addCamp: ()=>        {p(profilePage(addGdps()))},
        addShow: ()=>        {p(profilePage(addText()))},
        editCamp: (gdpsId)=> {p(profilePage(editGdps(gdpsId)))},
        editShow: (textId)=> {p(profilePage(editText(textId)))},
        alarms: ()=>         {p(profilePage(alarmsWindow()));getAlarms()},
        alarm: (msgId)=>     {p(profilePage(alarmsWindow()));getFullAlarm(msgId)},
        profiles: (userId)=> {otherProfile(userId,'p(pageList())')},
        profCamps: (userId)=>{otherProfile(userId,'p(pageList())',otherGdpsesWindow)},
        profShows: (userId)=>{otherProfile(userId,'p(pageList())',otherTexturesWindow)},
        wiki: (wikiId)=>     {gGuides(wikiId)},
        wikis: ()=>          {gWiki()},
        wikiPage: (guideId)=>{getGuide(guideId.split('.')[0],guideId.split('.')[1])},
        guideNew: (wikiId)=> {newGuide(wikiId)},
        wikiNew: (wikiId)=>  {newGuide(wikiId)},
        guideEdit: (guidId)=>{editGuide(1,guidId)},
        wikiEdit: (guidId)=> {editGuide(0,guidId)},

        campLog: (gdpsId)=>  {getJoinLog(gdpsId)},
        campOwn: (gdpsId)=>  {p(profilePage(coownersMenu(gdpsId,3)))},
        wikiOwn: (wikiId)=>  {p(profilePage(coownersMenu(wikiId,5)))},
        showOwn: (textId)=>  {p(profilePage(coownersMenu(textId,4)))},

        wikiEditor: (wId)=>  {p(profilePage(wikiAsOwner(wId)))},

        admin: ()=>          {adminPanel()}
    };

    let params = window.location.search
        .replace('?','')
        .split('&')
        .reduce(
            (p,e)=>{
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
token = localStorage.getItem('oschubUser'), // токен юзера

reStart = (drop = 0)=>{
    if (Z('debug'))
        Z('debug').remove();
    p('');
    token = localStorage.getItem('oschubUser');
    let postData = token ? 'token='+token : '';
    Loading();
    helperRequest(sData[2]+'loginT'+sData[6], postData)
        .then((data)=>{
            Loading(1);
            let resp = JSON.parse(data);
            GDPSes = resp[2];
            Textures = [];//resp[2];
            if (postData !== '') {
                isLogged = 1;
                thisUser = resp[0];
                myGdpses = [];
                mytextures = [];
                myGdpses.push(resp[1][0]);
                //mytextures.push(resp[3][1]);
                yourWikies = resp[1][1];
                wikiesMini = [];
                Object.entries(yourWikies).forEach(el => {
                    wikiesMini.push(el.ID.toString());
                });
            }
            getLink();
            if (localStorage.getItem('betaRead') == null)
                makeBetaAlert();
        })
        .catch((error)=>{returnError(error)});
    if (drop !== 0) {
        translateB('RU');
    }
},
makeBetaAlert = ()=>{
    Z('1st').insertAdjacentHTML('afterend',
        `<div class=ALERT id=BETAalert style=position:absolute><h1>BETA!</h1>`+
            `<p>Спешим вам сообщить что это бета версия сайта, а это значит что есть вероятность что мы внезапно удалим все аккаунты или сделаем что то похожее чтобы приблизить вас к выходу релиза сайта.</p>`+
            `<p>Пожалуйста, сообщайте о любых найденных багах и недочётах на наш дискорд сервер!</p><br>`+
            `<button style=background-color:#333 onclick="localStorage.betaRead=1;Z('BETAalert').remove()">Понятно</button>`+
        `</div>`
    );
},
thisUser = [
    '???', // ник
    0, // айди
    0, // роль
    0, // активирован или нет
    0, // есть ли алармы или нет
    '', // токен
    // helperVer // версия хелпера
], // по умолчанию
mainLang = localStorage.getItem('oschubLang'), // язык, хотя вроде очевидно

lastUsed = 'fetchNew(0,1)', // гдпсы
lastUsed2 = 'fetchNew(1,1)', // текстуры
lastUsed3 = "p(helperContent('gdps',45))", // переход в профиле

//работа нового поиска без костылей
newSearch = [0,[],[]],//нулевой это метод поиска, первый просто теги, второй платформы
writeTag = (type,tag)=>{
    let index = 1;
    let elemId = 'GDtag';
    switch (type) {
        case 'gdps':
            index = 1;
            elemId = 'GDtag';
            break;
        case 'gdOS':
            index = 2;
            elemId = 'GDtag';
            break;
        case 'text':
            index = 1;
            elemId = 'TXtag';
            break;
        case 'plat':
            index = 2;
            elemId = 'TXtag';
            break;
    };
    if (!newSearch[index].includes(tag)) {
        Z(elemId+tag).setAttribute('class','tagSel');
        newSearch[index].push(tag);
    } else {
        Z(elemId+tag).setAttribute('class','tagUns');
        let tagPlace = newSearch[index].indexOf(tag);
        if (tagPlace !== -1) {
            newSearch[index].splice(tagPlace, 1);
        }
    }
    newSearch[index].sort((a,b)=>{return a-b});
    sendFinder();
},
setMethod = (Method)=>{
    Z('method'+newSearch[0]).setAttribute('class','tagPre');
    newSearch[0] = Method;
    Z('method'+newSearch[0]).setAttribute('class','tagSel');
    sendFinder();
},
searchType = 0,
sendFinder = (page = 0, query = '')=>{
    if (Z('nextGdps'))
        Z('nextGdps').remove();

    if (query === '') {
        query = 'method='+newSearch[0];
        let enteredName = Z('framelabel').value;
        if (enteredName != '')
            query += '&name='+enteredName;

        newSearch[1].forEach(tag => {
            query += '&tags[]='+tag;
        })

        newSearch[2].forEach(os => {
            query += '&os[]='+os;
        })
    }

    Loading();
	// в оригинале channel не было, он был type
    helperRequest(`${sData[3]}new${sData[6]}?${query}&channel=${searchType}&page=${page}`)
        .then(data => {
            Loading(1);
            let Gdpses = JSON.parse(data);
            let page2 = page + 1;
            let nextBtn = `sendFinder(${page2},'${query}')`;
                
            let count = Object.keys(Gdpses).length;
            if (searchType == 0)
                innerGdpsPlace(GDPSrenderMini(Gdpses), page);
            else 
                innerGdpsPlace(GDPSrenderMini(Gdpses, 1), page);

            if (count >= 9)
                innerGdpsPlace(insertBtn(nextBtn),-1);
        })
        .catch((error)=>{returnError(error+servError)});
},

// перевод "Налету"
translateA = {
    RU: {
        'helperVer':'ver - 0.8 <span style=opacity:50%>(BUILD '+helperVer+')</span>',
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
        'textures':'обджект шоу',
        'helperDs':'Ссылка для входа',
        'yes':'Да',
        'no':'Нет',
        'GDtag01':'Размер: Малые(2-7)',
        'GDtag02':'Размер: Средние(8-16)',
        'GDtag03':'Размер: Крупные(17-29)',
        'GDtag04':'Размер: Огромные(30+)',
        'GDtag05':'Уникальная задумка',
        'GDtag06':'Шуточные',
        'GDtag07':'Уникальная механика',
        'GDtag08':'Малый дедлайн',
        'GDtag09':'',
        'GDtag10':'',
        'GDtag11':'Один сезон',
        'GDtag12':'ВК',
        'GDtag13':'Дискорд',
        'GDtag14':'Телеграм',
        'GDtag15':'Прочее',
        'mostLike':'Самое лайкнутое',
        'mostDisl':'Самое дизлайкнутое',
        'search1':'Последняя активность',
        'search4':'Самые новые',
        'TXtag01':'Комикс',
        'TXtag02':'Сериал',
        'TXtag03':'Компетишн',
        'TXtag04':'Нон компетишн',
        'TXtag05':'Драма',
        'TXtag06':'Комедия',
        'TXtag07':'Хоррор',
        'TXtag08':'Фантастика',
        'TXtag09':'Пародия',
        'TXtag12':'Короткие (1-5)',
        'TXtag13':'Средние (5-20)',
        'TXtag14':'Длинные (20-60)',
        'TXtag15':'Фильмы (60+)',
        'search':'Кемпы',
        'searchT':'Обджект шоу',
        'findByName':'Найдите по названию',
        'gdpsName':'Название Кемпа',
        'textName':'Название шоу',
        'listHelp1':'если вы ищете кемп которого нету в листе то добавьте его! но перед этим зарегистрируйтесь',
        'tags00':'Выберите теги',
        'tags01':'Выберите жанр',
        'os00':'Платформа',
        'os01':'Длительность серии (мин.)',
        'otherSort':'Метод поиска',
        'addGdps':'Добавить Кемп',
        'addGdps01':'Название:',
        'addGdps02':'Описание:',
        'addGdps03':'Ссылка на Кемп:',
        'addGdps04':'Аватар кемпа:',
        'addGdps05':'Тэги <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько)</span>:',
        'addGdps051':'Жанры <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько)</span>:',
        'addGdps06':'Платформа <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько)</span>:',
        'afterGD':'После изменения ваш кемп будет забанен <span style=opacity:50%>(если ранее был подтверждён)</span>',
        'textQual':'Длительность серии (мин.) <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько)</span>:',
        'addText01':'Аватар:',
        'addText03':'Ссылка на ютубе:',
        'addText':'Добавить обджект шоу',
        'editText':'Изменить обджект шоу',
        'editGdps':'Изменить Кемп',
        'afterTX':'После изменения ваше обджект шоу будет забанено на сайте <span style=opacity:50%>(если ранее был подтверждён)</span>',
        'gdpsInput01':'Название этого кемпа',
        'gdpsInput02':'Описание этого кемпа',
        'gdpsInput04':'Прямая ссылка на картинку',
        'gdpsInput05':'https://discord.gg/gdps',
        'textInput01':'Название',
        'textInput02':'Описание',
        'textInput03':'Прямая ссылка на картинку',
        'textInput05':'Если нет оставьте пустым',
        'profName':'Отображаемый никнейм',
        'profId':'ID пользователя',
        'profRole':'Роль',
        'profAccs':'Ваш аккаунт ',
        'notProfAccs':'Аккаунт ',
        'isActive':'Активирован',
        'isNotact':'Неактивирован',
        'yourGdpses':'Ваши кемпы',
        'Alarms':'Уведомления',
        'yourTexts':'Ваши обджект шоу',
        'alarms01':'Сообщения от администрации',
        'msgs':'Сообщения',
        'fullMsgs':'Полный текст',
        'role00':'Нет',
        'role01':'Менеджер',
        'role02':'Админ',
        'role03':'Главный Админ',
        'GDPSstatus10':'Статус сервера: Не работает',
        'GDPSstatus00':'Статус сервера: Проверка не запускалась',
        'GDPSstatus01':'Статус сервера: Работает',
        'weekGdps':'Кемп Недели',
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
        'downloadMB':'Смотреть',
        'downloadPCmini':'Смотреть',
        'account':'Аккаунт',
        'newsNone':'Ничего нет',
        'newsNoneReal':'Новостей нет',
        'remindPass':'Забыли пароль?',
        'login01':'Логин или Почта',
        'login02':'Пароль',
        'login03':'Адрес эл. почты',
        'login04':'Новый пароль',
        'login05':'Адрес эл. почты',
        'login06':'Логин',
        'gdpsLang00':'Язык',
        'gdpsLang01':'Русский',
        'gdpsLang02':'Английский',
        'gdpsLang03':'Испанский',
        'notYourProf':'Профиль',
        'notYourGdpses':'кемпы',
        'notYourTexts':'обджект шоу',
        'textNone':'Нету',
        'delete':'Удалить',
        'coowners':'Со-владельцы',
        'idOrName':'ID пользователя',
        'coownersNone':'Вы со-владелец',
        'CCtrue':'Проводится',
        'CCfalse':'Не проводится',
        'isJE':'Требуется авторизация на сайте для входа в кемп',
        'isBL':'Бампнуть',
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
        'report01':'Жалоба',
        'report02':'Причина жалобы (например - не работает ссылка)',
        'otmena':'Отмена',
        'copied':'Скопировано!',
        'reported':'Отправлено!',
        'aboutHelper':'О Object Hub',
        'history01':'Историческая справка',
        'history02':'27 октября 2023 началась разработка над сайтом предшественником, которая закончилась через 2 дня и была забыта. 20 августа 2024 Мчайден взяла за основу другой свой сайт и начала делать Object Hub, 28 августа вышла первая бета версия',
        'HLadmin':'Администрация',
        'newNick':'новый никнейм',
        'guides00':'Страницы',
        'guides01':'Новая страница',
        'guides02':'Название',
        'guides03':'Добавить раздел',
        'guides04':'Послесловие (например кто автор)',
        'guides05':'Картинка (формат 2:1)',
        'guides06':'Название раздела',
        'guides07':"Текст раздела\n\nесть частичная поддержка Markdown (заголовки и ссылки)\n\nдля добавления картинки введите ![](link)",
        'getLogin':'Получить логин',
        'wrongPass':'Неправильный пароль!',
        'accountEmpty':'Такого аккаунта не существует!',
        'loginClaimed':'Логин или почта уже заняты!',
        'captchaDed':'Капча не пройдена!',
        'CONTENTISNULL':'ОШИБКА: data пустой, не вводите неправильный ID',
        'wait1':'Жди ещё ',
        'wait2':' секунд',
        'bumped':'Бампнуто!',
        'gdpsunckecked':'кемп не проверен',
        'gdpsbanned':'кемп забанен',
        'newPost':'Новый пост',
        'hereAdd':'Нажмите на "Ваши кемпы" чтобы добавить кемп, соответственно для обджект шоу то же самое',
        'guides09':'РУОШК ВИКИ',
        'yourWikis':'Ваши вики',
        'pages':'Страницы',
    },
    EN: {
        'helperVer':'ver - 0.8 <span style=opacity:50%>(BUILD '+helperVer+')</span>',
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
        'textures':'Object show',
        'helperDs':'Link for join',
        'yes':'Yes',
        'no':'No',
        'GDtag01':'Size: Small(2-7)',
        'GDtag02':'Size: Medium(8-16)',
        'GDtag03':'Size: Large(17-29)',
        'GDtag04':'Size: Hude(30+)',
        'GDtag05':'Unique twist',
        'GDtag06':'Humorous',
        'GDtag07':'Unique mechanics',
        'GDtag08':'Small deadline',
        'GDtag09':'',
        'GDtag10':'',
        'GDtag11':'One season',
        'GDtag12':'VK',
        'GDtag13':'Discord',
        'GDtag14':'Telegram',
        'GDtag15':'Прочее',
        'mostLike':'Mosk likes',
        'mostDisl':'Most dislikes',
        'search1':'Last activity',
        'search4':'Recent',
        'TXtag01':'Comics',
        'TXtag02':'Serial',
        'TXtag03':'Competition',
        'TXtag04':'Noncompetition',
        'TXtag05':'Drama',
        'TXtag06':'Comedy',
        'TXtag07':'Horror',
        'TXtag08':'Fiction',
        'TXtag09':'Parody',
        'TXtag12':'Short (1-5)',
        'TXtag13':'Medium (5-20)',
        'TXtag14':'Long (20-60)',
        'TXtag15':'Films (60+)',
        'search':'Camps',
        'searchT':'Object shows',
        'findByName':'Find by name',
        'gdpsName':'Camp name',
        'textName':'Object show name',
        'listHelp1':'If you\'re looking for a camp that\'s not on the list, add it! But before you do, register',
        'tags00':'Select tags',
        'tags01':'Select genre',
        'os00':'Platform',
        'os01':'Series length (min.)',
        'otherSort':'Search method',
        'addGdps':'Add camp',
        'addGdps01':'Title:',
        'addGdps02':'Description:',
        'addGdps03':'Link to camp:',
        'addGdps04':'Camp avatar:',
        'addGdps05':'Tags <span style=opacity:50%>(Windows: hold down CTRL to add multiple)</span>:',
        'addGdps05':'Genre <span style=opacity:50%>(Windows: hold down CTRL to add multiple )</span>:',
        'addGdps05':'Platform <span style=opacity:50%>(Windows: hold down CTRL to add multiple)</span>:',
        'afterGD':'After edit, your camp will be banned <span style=opacity:50%>(if previously verified)</span>',
        'textQual':'Series length (min.) <span style=opacity:50%>(Windows: hold down CTRL to add multiple)</span>:',
        'addText01':'Avatar:',
        'addText03':'Link to youtube:',
        'addText':'Add object show',
        'editText':'Edit object show',
        'editGdps':'Edit camp',
        'afterTX':'After the change, your objet show will be banned from the site <span style=opacity:50%>(if previously confirmed)</span>',
        'gdpsInput01':'Camp name',
        'gdpsInput02':'Camp description',
        'gdpsInput04':'Direct link to picture',
        'gdpsInput05':'https://discord.gg/gdps',
        'textInput01':'Name',
        'textInput02':'Description',
        'textInput03':'Direct link to picture',
        'textInput05':'If not, leave it empty',
        'profName':'Nickname',
        'profId':'UserID',
        'profRole':'Role',
        'profAccs':'Your account ',
        'notProfAccs':'Account',
        'isActive':'Activated',
        'isNotact':'Unactivated',
        'yourGdpses':'Your camps',
        'Alarms':'Notifications',
        'yourTexts':'Your object shows',
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
        'weekGdps':'Weekly Camp',
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
        'downloadMB':'Watch',
        'downloadPCmini':'Watch',
        'account':'Account',
        'newsNone':'Nothing found',
        'newsNoneReal':'There is no news from GDPS',
        'remindPass':'Forgot password?',
        'login01':'Login or Email',
        'login02':'Password',
        'login03':'Email address',
        'login04':'New password',
        'login05':'Email address',
        'login06':'Login',
        'gdpsLang00':'Language',
        'gdpsLang01':'Russian',
        'gdpsLang02':'English',
        'gdpsLang03':'Spanish',
        'notYourProf':'Profile',
        'notYourGdpses':'camps',
        'notYourTexts':'object shows',
        'textNone':'Nothing',
        'delete':'Delete',
        'coowners':'Co-owners',
        'idOrName':'userID',
        'joinsTo':'Joins to',
        'joins':'Joins',
        'coownersNone':'You are co-owner',
        'CCtrue':'Held',
        'CCfalse':'Not held',
        'isCC':'Creator contest',
        'isMC':'Recruitment for moderators',
        'isJE':'Authorization required to join in discord server',
        'isBL':'Bump',
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
        'report01':'Report',
        'report02':'The reason of report (for example, the link does not work)',
        'otmena':'Cancel',
        'copied':'Copied!',
        'reported':'Sent!',
        'aboutHelper':'About Object Hub',
        'history01':'Historical note',
        'history02':'On October 27, 2023 development began on the predecessor site, which ended after 2 days and was forgotten. On August 20, 2024, Mchiden took her other site as a basis and started making Object Hub, with the first beta version released on August 28th',
        'HLadmin':'Administration',
        'newNick':'new nickname',
        'guides00':'pages',
        'guides01':'New page',
        'guides02':'Title',
        'guides03':'Add Section',
        'guides04':'Afterword (such as who the author)',
        'guides05':'Picture (2:1 format)',
        'guides06':'Title of section',
        'guides07':"Section text\n\nthere is partical Markdown support (heading and links)\n\nto add image enter ![](link)",
        'getLogin':'Get login',
        'wrongPass':'Wrong Password!',
        'accountEmpty':'That account doesn\'t exist!',
        'loginClaimed':'Login or mail is already taken!',
        'captchaDed':'Captcha didn\'t pass!',
        'CONTENTISNULL':'ERROR: data is null, don\'t write wrong ID',
        'wait1':'Wait ',
        'wait2':' seconds',
        'bumped':'Bumped!',
        'gdpsunckecked':'GDPS not checked',
        'gdpsbanned':'GDPS banned',
        'newPost':'New post',
        'hereAdd':'Click on "Your camps" to add a camp, respectively for the object shows the same thing',
        'guides09':'RUOSC WIKI',
        'yourWikis':'Your wikis',
        'pages':'Pages',
    },
},
getTrans = (id)=>{
    try {
        return translateA[mainLang][id];
    } catch (err) {
        mainLang = 'RU';
        localStorage.setItem('oschubLang', 'RU');
        returnError(err);
    }
},
translateB = (lang)=>{
    mainLang = lang;
    localStorage.setItem('oschubLang', lang);
    document.querySelectorAll('[data-trans]').forEach((el)=>{
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

// вставка в разные куски страницы =
p = (textContent)=>{
    Z('1st').innerHTML = textContent;
},
innerProfile = (textContent)=>{
    Z('profileWindow').innerHTML = textContent;
},
innerGdpsPlace = (textContent, insert = 0)=>{
    if (insert == 0) // профили
        Z('GDPSesPlace').innerHTML = textContent;
    else if (insert >= 1) // в поиске устарел
        Z('GDPSesPlace').insertAdjacentHTML('beforeend', textContent);
    else 
        // в поиске но лучще это
        Z('GDPSesPlace').insertAdjacentHTML('afterend', textContent);
},
innerGuidPlace = (textContent, insert = 0)=>{
    if (insert == 0) // профили
        Z('guidesPlace').innerHTML = textContent;
    else if (insert >= 1) // в поиске устарел
        Z('guidesPlace').insertAdjacentHTML('beforeend', textContent);
    else 
        // в поиске но лучще это
        Z('guidesPlace').insertAdjacentHTML('afterend', textContent);
},
innerComments = (textContent, insert = 0)=>{
    if (insert == 0) // при рендере гдпса
        Z('comments').innerHTML = textContent;
    else 
        // а эт вроде когда "показать больше"
        Z('comments').insertAdjacentHTML('beforeend', textContent);
},

// страницы
switchLangMenu = ()=>{
    let preLang = '';
    for (let lang in translateA) {
        preLang += 
        `<button onclick="switchLang('${lang}')" style="width:32px" class="emptybtn">`+
            `<img src="./imgs/${lang}.png" width=32px style="padding-bottom:6px">`+
        `</button>`;
    };
    return `<div id=switchLang2 style="position:absolute;top:-16px;left:40px;padding:8px;border:solid black 3px;border-radius:8px;background-color:rgba(255,255,255,.1);">`+
        preLang+
    `</div>`;
},
switchLang = (lang = 32)=>{
    if (lang === 32) {
        if (!Z('switchLang2')) {
            Z('switchLang').insertAdjacentHTML('beforeend', switchLangMenu());
        } else {
            Z('switchLang2').remove();
        }
    } else {
        translateB(lang);
        Z('switchLang2').remove()
    }
},
switchLoginMenu = (predrop)=>{
    if (!isLogged)
        return loginPage();
    if (predrop === 'predrop')
        predrop = 'dropLogin(1);';
    let preLang = '';
    preLang +=
    `<button style="width:80px" class="emptybtn" onclick="${predrop}p(profilePage())">`+
        `<span data-trans="profile">${getTrans('profile')}</span>`+
    `</button>`+
    `<button style="width:80px" class="emptybtn" onclick="${predrop}gLogout()">`+
        `<span data-trans="logout">${getTrans('logout')}</span>`+
    `</button>`;
    return `<div id=switchLogin2 style="position:absolute; bottom:-55px; right:0px; padding:8px; border:solid black 3px;border-radius:8px; background-color:rgba(255,255,255,.1);">`+
        preLang+
    `</div>`;
},
switchLogin = (lang = 32, predrop)=>{
    if (lang === 32) {
        if (!Z('switchLogin2')) {
            Z('switchLogin').insertAdjacentHTML('beforeend', switchLoginMenu(predrop))
        } else {
            Z('switchLogin2').remove()
        }
    } else {
        Z('switchLogin2').remove()
    }
},

pHeader = (predrop = '')=>{
    searchMethod = 0;
    if (predrop === 'predrop')
        predrop = 'dropLogin(1);';
    let html = 
    `<div class="header" align="left">`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}p(pageList())">`+
            `<img src="./imgs/camp.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}p(pageText())">`+
            `<img src="./imgs/obj2.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}gWiki()">`+
            `<img src="./imgs/guid.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}p(helperAbout())">`+
            `<img src="./imgs/uvazuha.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="location.href = 'https://discord.gg/zetb62mqsS'">`+
            `<img src="./imgs/disc.svg" width=32px>`+
        `</button>`+
        `<nodiv id=switchLang style=position:relative>`+
            `<button onclick="switchLang()" style="width:32px" class="emptybtn">`+
                `<img data-trans="src" src="./imgs/${mainLang}.png" width=32px style="padding-bottom:6px">`+
            `</button>`+ // !ПОИСК! switchLang = function
        `</nodiv>`+
        `<div style=position:absolute;right:8px;top:24px>`+
            `<nodiv id=switchLogin style=position:relative>`+
                `${isLogged == 0 ? `<button class="emptybtn" style="position:absolute;top:-8px;right:40px" data-trans="register" onclick="${predrop}registerPage()">${getTrans('register')}</button>` : ''}`+
                `<button style="width:20px;margin-left:20px" class="emptybtn" onclick="${predrop}switchLogin(32,'')">`+
                    `<span style=position:absolute;right:0;top:-8px${
                        isLogged == 0 ? ' data-trans=login>'+getTrans('login') : '>'+thisUser[0]
                    }</span>`+
                `</button>`+ // !ПОИСК! switchLogin = function
            `</nodiv>`+
        `</div>`+
    `</div>`;
    return html;
},
pageList = ()=>{
    newSearch = [3,[],[]];
    searchType = 0;
    setLink('?');
    let html = pHeader()+
    `<h1 align=center style=color:white;margin-bottom:10px>Object hub</h1>`+
    `<div id=finder align=left class="frameprofile">`+
        `<h1 data-trans="search">${getTrans('search')}</h1><br>`+
        `<label data-trans="findByName">${getTrans('findByName')}:</label><br>`+
        `<p data-trans="listHelp1">${getTrans('listHelp1')}</p>`+
        `<input data-trans="gdpsName" type=text id=framelabel class=framelabel style=width:90% placeholder="${getTrans('gdpsName')}"><br><br>`+

        `<label data-trans="tags00">${getTrans('tags00')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label class="tagUns" onclick="writeTag('gdps',1)" id=GDtag1 data-trans="GDtag01">${getTrans('GDtag01')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',2)" id=GDtag2 data-trans="GDtag02">${getTrans('GDtag02')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',3)" id=GDtag3 data-trans="GDtag03">${getTrans('GDtag03')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',4)" id=GDtag4 data-trans="GDtag04">${getTrans('GDtag04')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',5)" id=GDtag5 data-trans="GDtag05">${getTrans('GDtag05')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',6)" id=GDtag6 data-trans="GDtag06">${getTrans('GDtag06')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',7)" id=GDtag7 data-trans="GDtag07">${getTrans('GDtag07')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',8)" id=GDtag8 data-trans="GDtag08">${getTrans('GDtag08')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',11)" id=GDtag11 data-trans="GDtag11">${getTrans('GDtag11')}</label>`+
        `</div>`+

        `<label data-trans="os00">${getTrans('os00')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label class="tagUns" onclick="writeTag('gdOS',12)" id=GDtag12 data-trans="GDtag12">${getTrans('GDtag12')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdOS',13)" id=GDtag13 data-trans="GDtag13">${getTrans('GDtag13')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdOS',14)" id=GDtag14 data-trans="GDtag14">${getTrans('GDtag14')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdOS',15)" id=GDtag15 data-trans="GDtag15">${getTrans('GDtag15')}</label>`+
        `</div>`+

        `<label data-trans="otherSort">${getTrans('otherSort')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label data-trans="search1" onclick=setMethod(3) id=method3 class=tagSel>${getTrans('search1')}</label>`+
            `<label data-trans="search4" onclick=setMethod(0) id=method0 class=tagPre>${getTrans('search4')}</label>`+
            `<label data-trans="mostLike" onclick=setMethod(1) id=method1 class=tagPre>${getTrans('mostLike')}</label>`+
            `<label data-trans="mostDisl" onclick=setMethod(2) id=method2 class=tagPre>${getTrans('mostDisl')}</label>`+
        `</div>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
        GDPSrenderMini(GDPSes)+
    `</div>`+
    insertBtn('sendFinder(1,\'method=0\')');
    return html;
    
},
pageText = ()=>{
    newSearch = [0,[],[]];
    searchType = 1;
    setLink('?'+'shows');
    let html = pHeader()+
    `<h1 align=center style=color:white;margin-bottom:10px>Object hub</h1>`+
    `<div id=finder align=left class="frameprofile"">`+
        `<h1 data-trans="searchT">${getTrans('searchT')}</h1><br>`+
        `<label data-trans="findByName">${getTrans('findByName')}:</label><br>`+
        `<input data-trans="gdpsName" type=text id=framelabel class=framelabel style=width:90% placeholder="${getTrans('textName')}"><br><br>`+
            
        `<label data-trans="tags01">${getTrans('tags01')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label class="tagUns" onclick="writeTag('text',1)" id=TXtag1 data-trans="TXtag01">${getTrans('TXtag01')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',2)" id=TXtag2 data-trans="TXtag02">${getTrans('TXtag02')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',3)" id=TXtag3 data-trans="TXtag03">${getTrans('TXtag03')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',4)" id=TXtag4 data-trans="TXtag04">${getTrans('TXtag04')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',5)" id=TXtag5 data-trans="TXtag05">${getTrans('TXtag05')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',6)" id=TXtag6 data-trans="TXtag06">${getTrans('TXtag06')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',7)" id=TXtag7 data-trans="TXtag07">${getTrans('TXtag07')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',8)" id=TXtag8 data-trans="TXtag08">${getTrans('TXtag08')}</label>`+
            `<label class="tagUns" onclick="writeTag('text',9)" id=TXtag9 data-trans="TXtag09">${getTrans('TXtag09')}</label>`+
        `</div>`+

        `<label data-trans="os01">${getTrans('os01')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label class="tagUns" onclick=writeTag('plat',12) id=TXtag12 data-trans="TXtag12">${getTrans('TXtag12')}</label>`+
            `<label class="tagUns" onclick=writeTag('plat',13) id=TXtag13 data-trans="TXtag13">${getTrans('TXtag13')}</label>`+
            `<label class="tagUns" onclick=writeTag('plat',14) id=TXtag14 data-trans="TXtag14">${getTrans('TXtag14')}</label>`+
            `<label class="tagUns" onclick=writeTag('plat',15) id=TXtag15 data-trans="TXtag15">${getTrans('TXtag15')}</label>`+
        `</div>`+
            
        `<label data-trans="otherSort">${getTrans('otherSort')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label data-trans="search4" onclick=setMethod(0) id=method0 class=tagSel>${getTrans('search4')}</label>`+
            `<label data-trans="mostLike" onclick=setMethod(1) id=method1 class=tagPre>${getTrans('mostLike')}</label>`+
            `<label data-trans="mostDisl" onclick=setMethod(2) id=method2 class=tagPre>${getTrans('mostDisl')}</label>`+
        `</div>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
        TEXTrenderMini(Textures)+
    `</div>`+
    insertBtn('sendFinder(1,\'method=0\')');
    return html;
},
helperAbout = ()=>{
    setLink('?'+'about');
    let html = pHeader()+
    `<div class=frameprofile style=text-align:left>`+
        `<h1 data-trans="aboutHelper">${getTrans('aboutHelper')}</h1>`+
        `<h2 data-trans="history01">${getTrans('history01')}</h2>`+
        `<p data-trans="history02">${getTrans('history02')}</p>`+
        `<h2 data-trans="HLadmin">${getTrans('HLadmin')}</h2>`+
        `<div style="display:flex;flex-wrap:wrap">`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>Мчайден</span> - `+
                    `<span data-trans="role03">${getTrans('role03')}</span>`+
                `</p>`+
                `<img width=128px src="./imgs/mio.png">`+
            `</div>`+
        `</div>`+
    `</div>`;
    return html;
},
globalWiki = 0,
gWiki = ()=>{
    setLink('?'+'wikis');
    let html = pHeader()+
    `<h1 align=center><span data-trans="guides09">${getTrans('guides09')}</span>${isLogged ? ' <button class=loginbtn onclick="newGuide(\'undefined\')">+</button>' : ''}</h1>`+
    `<div class=gdps-list-place id=guidesPlace>`+
    `</div>`+
    insertBtn('getWikis(1)');
    p(html);
    Loading();
    helperRequest(`${sData[0]}getWikis${sData[6]}`)
        .then(data => {
            let parsedData = JSON.parse(data);
            Loading(1);

            let html = renderWiki(parsedData);
            innerGuidPlace(html);
        })
        .catch((error)=>{returnError(error+servError)});
},
checkWikiOwn = (id)=>{
    if (wikiesMini.includes(id.toString()))
        return true;
    return false;
},
gGuides = (wiki)=>{
    if (typeof(wiki) === 'undefined')
        return gWiki();
    setLink('?'+'wiki='+wiki);
    globalWiki = wiki;
    let html = pHeader()+
    `<h1 align=center><span data-trans="guides00">${getTrans('guides00')}</span>${checkWikiOwn(wiki) ? ' <button class=loginbtn onclick="newGuide('+globalWiki+')">+</button>' : ''}</h1>`+
    `<div class=gdps-list-place id=guidesPlace>`+
    `</div>`+
    insertBtn('getGuides('+globalWiki+',1)');
    p(html);
    Loading();
    helperRequest(`${sData[0]}getWiki${sData[6]}?wiki=${wiki}`)
        .then(data => {
            let parsedData = JSON.parse(data);
            Loading(1);

            let html = renderGuideMini(parsedData);
            innerGuidPlace(html);
        })
        .catch((error)=>{returnError(error+servError)});
},
getWikis = (page)=>{
    if (Z('nextGdps'))
        Z('nextGdps').remove();

    Loading();
    helperRequest(`${sData[0]}getWikis${sData[6]}?page=${page}`)
        .then(data => {
            let parsedData = JSON.parse(data);
            Loading(1);

            let page2 = page++;
            let html = renderGuideMini(parsedData, page2);
            innerGuidPlace(html,page);
        })
        .catch((error)=>{returnError(error+servError)});
},
getGuides = (wiki, page)=>{
    if (Z('nextGdps'))
        Z('nextGdps').remove();

    Loading();
    helperRequest(`${sData[0]}getWiki${sData[6]}?wiki=${wiki}&page=${page}`)
        .then(data => {
            let parsedData = JSON.parse(data);
            Loading(1);

            let page2 = page++;
            let html = renderGuideMini(parsedData, page2);
            innerGuidPlace(html,page);
        })
        .catch((error)=>{returnError(error+servError)});
},
removePage = (id)=>{
    helperRequest(`${sData[4]}guide${sData[[6]]}?id=${id}`)
        .then(data => {
            Z(data).remove();
        })
        .catch((error)=>{returnError(error+servError)});
},
guideId = 0,
newGuideFrame = (id = 0, customContent = null)=>{
    let html =
    `<div class=frameguide id=frame${id} style=position:relative>`+
        `<input data-trans="guides06" name=subtitle[] ${customContent !== null ? `value="${customContent[0]}"` : ''} class="guidInp" style=width:100%;font-size:24px placeholder="${getTrans('guides06')}"><br>`+
        `${id == 0 ? '' : `<button style="position:absolute;top:20px;right:20px;padding:2px 4px"`+`
         class=loginbtn onclick="removeGuide(${id})" type=button>`+
            `<img style="margin:0" width="24px" src="./imgs/trash.svg">`+
        `</button>`}`+
        `<textarea data-trans="guides07" name=subtext[] class=guidInp style=width:100%;height:240px placeholder="${getTrans('guides07')}">${customContent !== null ? customContent[1] : ''}</textarea>`+
    `</div><br>`;
    if (id !== 0)
        Z('frames').insertAdjacentHTML('beforeend', html);
    guideId++;
    return html;
},
removeGuide = (id)=>{
    if (id == 0)
        return;
    Z('frame'+id).remove();
},
newGuide = (wikiId = undefined)=>{
    let html = pHeader();
    if (wikiId == 'undefined') {
        setLink('?'+'wikiNew');
        html += 
        `<h1 data-trans="guides01" required>${getTrans('guides01')}</h1>`+
        `<button data-trans="otmena" type=button class=loginbtn onclick="gWiki()">${getTrans('otmena')}</button><br>`+
        `<form id=guidesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'newWiki${sData[6]}')">`+
            `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:32px" placeholder="${getTrans('guides02')}"><br>`+
            `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label> `+
            `<select id="langs" class="framelabel" name="language" required>`+
                `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
            `</select><br>`+
            `<input data-trans="guides05" name=img class=guidInp id=img placeholder="${getTrans('guides05')}">`+
            `<textarea data-trans="textInput02" name=text style=width:100%;height:240px class=guidInp style=width:210px placeholder="${getTrans('textInput02')}"></textarea><br>`+
            `<button data-trans="commSend" type=submit class=loginbtn>${getTrans('commSend')}</button>`+
        `</form>`;
    } else {
        setLink('?'+'guideNew='+wikiId);
        html += 
        `<h1 data-trans="guides01" required>${getTrans('guides01')}</h1>`+
        `<button data-trans="otmena" type=button class=loginbtn onclick="gGuides(${wikiId})">${getTrans('otmena')}</button><br>`+
        `<form id=guidesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'newGuide${sData[6]}')">`+
            `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:32px" placeholder="${getTrans('guides02')}"><br>`+
            `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label> `+
            `<select id="langs" class="framelabel" name="language" required>`+
                `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
            `</select><br>`+
            `<input data-trans="guides05" name=img class=guidInp id=img placeholder="${getTrans('guides05')}">`+
            `<div id=frames>`+
                newGuideFrame()+
            `</div>`+
            `<button data-trans="guides03" type=button class=loginbtn onclick="newGuideFrame(guideId)">${getTrans('guides03')}</button><br><br>`+
            `<input data-trans="guides04" name=aftertext class=guidInp style=width:210px placeholder="${getTrans('guides04')}"><br>`+
            `<input type=hidden value=${wikiId} name=wikiId>`+
            `<button data-trans="commSend" type=submit class=loginbtn>${getTrans('commSend')}</button>`+
        `</form>`;
    }
    p(html);
},
Markdown = (mdText)=>{
  // first, handle syntax for code-block
  mdText = mdText.replace(/\r\n/g, '\n');
  mdText = mdText.replace(/\n~~~ *(.*?)\n([\s\S]*?)\n~~~/g, '<pre><code title="$1">$2</code></pre>' )
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
        .replace(/^#### (.*?)\s*#*$/gm, '<h4 id="$1">$1</h4>')
        .replace(/^### (.*?)\s*#*$/gm, '<h3 id="$1">$1</h3>')
        .replace(/^## (.*?)\s*#*$/gm, '<h2 id="$1">$1</h2>')
        .replace(/^# (.*?)\s*#*$/gm, '<h1 id="$1">$1</h1>')    
        .replace(/^-{3,}|^\_{3,}|^\*{3,}/gm, '<hr/>')    
        .replace(/``(.*?)``/gm, '<code>$1</code>' )
        .replace(/`(.*?)`/gm, '<code>$1</code>' )
        .replace(/^\>> (.*$)/gm, '<blockquote><blockquote>$1</blockquote></blockquote>')
        .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
        .replace(/<\/blockquote\>\n<blockquote\>/g, '\n<br>' )
        .replace(/<\/blockquote\>\n<br\><blockquote\>/g, '\n<br>' )
        .replace(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img alt="$1" src="$2" $3 />')
        .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img alt="$1" src="$2" />')
        .replace(/\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<a href="$2" title="$3">$1</a>')
        .replace(/<http(.*?)\>/gm, '<a href="http$1">http$1</a>')
        .replace(/\[(.*?)\]\(\)/gm, '<a href="$1">$1</a>')
        .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
        .replace(/^[\*|+|-][ |.](.*)/gm, '<ul><li>$1</li></ul>' ).replace(/<\/ul\>\n<ul\>/g, '\n' )
        .replace(/^\d[ |.](.*)/gm, '<ol><li>$1</li></ol>' ).replace(/<\/ol\>\n<ol\>/g, '\n' )
        .replace(/\*\*\*(.*)\*\*\*/gm, '<b><em>$1</em></b>')
        .replace(/\*\*(.*)\*\*/gm, '<b>$1</b>')
        .replace(/\*([\w \d]*)\*/gm, '<em>$1</em>')
        .replace(/___(.*)___/gm, '<b><em>$1</em></b>')
        .replace(/__(.*)__/gm, '<u>$1</u>')
        .replace(/_([\w \d]*)_/gm, '<em>$1</em>')
        .replace(/~~(.*)~~/gm, '<del>$1</del>')
        .replace(/\^\^(.*)\^\^/gm, '<ins>$1</ins>')
        .replace(/ +\n/g, '\n<br/>')
        .replace(/\n\s*\n/g, '\n<p>\n')
        .replace(/^ {4,10}(.*)/gm, '<pre><code>$1</code></pre>' )
        .replace(/^\t(.*)/gm, '<pre><code>$1</code></pre>' )
        .replace(/<\/code\><\/pre\>\n<pre\><code\>/g, '\n' )
        .replace(/\\([`_\\\*\+\-\.\(\)\[\]\{\}])/gm, '$1' );
    }  
  }

  mdHTML = mdHTML.replaceAll("\n", '<br>');
  return mdHTML.trim();
},
getGuide = (id, wikiId = 0)=>{
    let html = pHeader()+
        `<h1 id=title></h1>`+
        `<div id=texts></div>`+
        `<div class=gdps-forum><button class=loginbtn onclick="gGuides(${wikiId})">Назад</button></div>`+
        `<div align=center style="margin:8px">`;
            if (isLogged) {
                html +=
            `<div class="framemain" style="height:60px">`+
                `<p style="margin:0">`+
                    `<span data-trans="loggedAs">${getTrans('loggedAs')}</span>: `+
                    `${thisUser[0]}`+
                `</p>`+
                `<input data-trans="min10chars" type="text" class="framelabel" id="text" required minlength=10 placeholder="${getTrans('min10chars')}"><br>`+
                `<button data-trans="commSend" class="loginbtn" onclick="sendComm(${id},3)" id="commentBtn">${getTrans('commSend')}</button>`+
            `</div>`;
            };
        html +=
            `<div id=comments>`+
            `</div>`+
        `</div>`;
    p(html);
    Loading();
    helperRequest(`${sData[0]}getGuide${sData[6]}?id=${id}`)
    .then(data => {
        if (data == '["NONE"]') {
            Loading(1);
            gGuides();
            megaAlert('CONTENTISNULL');
            return;
        }
        setLink('?'+'wikiPage='+id+'.'+wikiId);
        Loading(1);
        let parsedData = JSON.parse(data);
        let guideinfo = parsedData['guideinfo'];
        let guidedata = parsedData['guidedata'];
        let comments = parsedData['comments'];
        Z('title').innerHTML = guideinfo[1];
        if (guideinfo[3])
            Z('title').insertAdjacentHTML('afterend', guideinfo[2]);

        let html = '';
        guidedata.forEach(val => {
            html +=
            `<div class=frameguide>`+
                `<h2>${val[0]}</h2>`+
                `${Markdown(val[1])}`+
            `</div><br>`;
        });
        html += guideinfo[2];

        Z('texts').innerHTML = html

        Z('comments').insertAdjacentHTML('beforeend',
        renderComms(comments,6,`${id},'guid',1`));
    })
    .catch((error)=>{returnError(error+servError)});
},
editGuide = (contentType, id)=>{
    let html = pHeader(),
        editPlace = '';
    if (contentType == 0) {
        editPlace = 'editWiki';
        html += 
        `<h1 data-trans="guides01" required>${getTrans('guides01')}</h1>`+
        `<button data-trans="otmena" type=button class=loginbtn onclick="p(profilePage(wikisWindow()))">${getTrans('otmena')}</button><br>`+
        `<form id=guidesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'editWiki${sData[6]}?id=${id}')">`+
            `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:32px" placeholder="${getTrans('guides02')}"><br>`+
            `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label> `+
            `<select id="langs" class="framelabel" name="language" required>`+
                `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
            `</select><br>`+
            `<input data-trans="guides05" name=img class=guidInp id=img placeholder="${getTrans('guides05')}">`+
            `<textarea id=text data-trans="textInput02" name=text style=width:100%;height:240px class=guidInp style=width:210px placeholder="${getTrans('textInput02')}"></textarea><br>`+
            `<input type=hidden value=${id} name=wikiId>`+
            `<button data-trans="commSend" type=submit class=loginbtn>${getTrans('commSend')}</button>`+
        `</form>`;
    } else {
        editPlace = 'editGuide';
        html += 
        `<h1 data-trans="guides01" required>${getTrans('guides01')}</h1>`+
        `<button data-trans="otmena" type=button class=loginbtn onclick="gGuides(${globalWiki})">${getTrans('otmena')}</button><br>`+
        `<form id=guidesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'editGuide${sData[6]}?id=${id}')">`+
            `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:32px" placeholder="${getTrans('guides02')}"><br>`+
            `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label> `+
            `<select id="langs" class="framelabel" name="language" required>`+
                `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
            `</select><br>`+
            `<input data-trans="guides05" name=img class=guidInp id=img placeholder="${getTrans('guides05')}">`+
            `<div id=frames>`+
            `</div>`+
            `<button data-trans="guides03" type=button class=loginbtn onclick="newGuideFrame(guideId)">${getTrans('guides03')}</button><br><br>`+
            `<input data-trans="guides04" name=aftertext id=aftertext class=guidInp style=width:210px placeholder="${getTrans('guides04')}"><br>`+
            `<input type=hidden value=${globalWiki} name=wikiId>`+
            `<button data-trans="commSend" type=submit class=loginbtn>${getTrans('commSend')}</button>`+
        `</form>`;
    }
    p(html);
    Loading();
    helperRequest(`${sData[1]}${editPlace}${sData[6]}?id=${id}`)
    .then(data => {
        if (data == '["NONE"]') {
            Loading(1);
            p(profilePage());
            megaAlert('CONTENTISNULL');
            return;
        }
        Loading(1);
        let parsedData = JSON.parse(data);
        if (contentType == 0) {
            setLink('?'+'wikiEdit='+id);
            Z('title').value = parsedData[1];
            Z('text').value = parsedData[2];
            Z('img').value = parsedData[3];
            document.querySelector(`[value=${parsedData[4]}]`).setAttribute('selected', '');
        } else {
            setLink('?'+'guideEdit='+id);
            let guideinfo = parsedData['guideinfo'];
            Z('title').value = guideinfo[1];
            Z('aftertext').value = guideinfo[2];
            document.querySelector(`[value=${guideinfo[3]}]`).setAttribute('selected', '');
            Z('img').value = guideinfo[4];
            let guidedata = parsedData['guidedata'];
            innerGuidPlace(`<input name=guidid value=${id} type=hidden>`,1);
            guideId = 1;
            guidedata.forEach(guid => {
                newGuideFrame(guideId, guid);
            });
            document.querySelector('[onclick="removeGuide(1)"]').remove();
        }
    })
    .catch((error)=>{returnError(error+servError)});
},
wikiAsOwner = (id)=>{
    let html = `<button data-trans="guides01" style="font-size:24px" class="loginbtn" onclick="newGuide(${id})">${getTrans('guides01')}</button>`;
    globalWiki = id;
    Loading();
    helperRequest(`${sData[0]}getWikiAdmin${sData[6]}?wiki=${id}&page=0`)
    .then(data => {
        setLink('?'+'wikiEditor='+id);
        let parsedData = JSON.parse(data);
        Loading(1);

        html += GUIDrenderInProfile2(parsedData);
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
}
renderGuideMini = (guides, page = 1)=>{
    let html = '',
        count = 0,
        id,
        title,
        language,
        date,
        likes,
        img;

    guides.forEach(guid => {
        count++;
        if (count == 5) {
            innerGuidPlace(insertBtn(`getGuides(${page})`),-1);
            return html;
        }

        id = guid[0];
        title = guid[1];
        language = guid[2];
        date = guid[3];
        likes = guid[4];
        img = guid[5];
        html += `<div  class="framegdps" style="width:250px;height:200px">`+
        `<img width=266px height=133px src="${img}" onerror="this.src='./imgs/empty.jpg'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:15px;border-top-right-radius:15px">`+
            `<h2 style="z-index:1;position:inherit;margin-top:120px">${title} <img src="./imgs/${language}.png"></h2>`+
            `<div style="position: absolute;top: 0;left: 0;width: 266px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-black-alpha), var(--color-black));"></div>`+
            `<div style="position:absolute;bottom:0;width:100%">`+
                `<div class="likezone" style=margin-left:-4px;margin-right:4px>`+
                    `<span class=likeplace id="likesCount${id}">${likes}</span>`+
                    `<button onclick="sendLike(${id},7)" id="like"></button>`+
                    `<button onclick="sendDislike(${id},7)" id="dislike"></button>`+
                `</div>`+
                `<div class="likezone" style=position:absolute;bottom:0;right:16px>`+
                    `<button data-trans="moreInfo" class=loginbtn onclick="getGuide(${id},${globalWiki})">${getTrans('moreInfo')}</button>`+
                `</div>`+
            `</div>`+
        `</div>`;
    });
    return html;
},
renderWiki = (guides, page = 1)=>{
    let html = '',
        count = 0,
        id,
        title,
        text,
        img,
        language,
        date,
        likes;

    guides.forEach(guid => {
        count++;
        if (count == 5) {
            innerGuidPlace(insertBtn(`getGuides(${page})`),-1);
            return html;
        }

        id = guid[0];
        title = guid[1];
        text = guid[2];
        img = guid[3];
        language = guid[4];
        date = guid[5];
        likes = guid[6];
        html +=
        `<div  class="framegdps" style="width:300px;height:290px">`+
        `<img width=316px height=158px src="${img}" onerror="this.src='./imgs/empty.jpg'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:15px;border-top-right-radius:15px">`+
            `<h2 style="z-index:1;position:inherit;margin-top:120px">${title} <img src="./imgs/${language}.png"></h2>`+
            `<p>${text}</p>`+
            `<div style="position: absolute;top: 0;left: 0;width: 316px;height: 60px;margin-top: 98px;background: linear-gradient(rgba(0,0,0,0), var(--color-black-alpha), var(--color-black));"></div>`+
            `<div style="position:absolute;bottom:0;width:100%">`+
                `<div class="likezone" style=margin-left:-4px;margin-right:4px>`+
                    `<span class=likeplace id="likesCount${id}">${likes}</span>`+
                    `<button onclick="sendLike(${id},8)" id="like"></button>`+
                    `<button onclick="sendDislike(${id},8)" id="dislike"></button>`+
                `</div>`+
                `<div class="likezone" style=position:absolute;bottom:0;right:16px>`+
                    `<button data-trans="moreInfo" class=loginbtn onclick="gGuides(${id})">${getTrans('moreInfo')}</button>`+
                `</div>`+
            `</div>`+
        `</div>`;
    });
    return html;
},
dropLogin = (type = 0)=>{
    let hcaptchaHtml = Z('2st');
    if (type === 0) {
        Z('3st').appendChild(hcaptchaHtml);
        hcaptchaHtml.style.display = 'block';
    } else if (type === 1) {
        Z('4st').appendChild(hcaptchaHtml);
        hcaptchaHtml.style.display = 'none';
        isLogged ? p(profilePage()) : p(pageList());
    };
},
loginPage = ()=>{
    setLink('?'+'login');
    let html = pHeader('predrop')+
    `<div class="frameprofile">`+
        `<h1 data-trans="login">${getTrans('login')}</h1>`+
        `<input data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
        `<input data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}"><br><br>`+
            `<div id=3st></div><br><br>`+
        `<button data-trans="remindPass" onclick="p(dropWindow())" class="loginbtn">${getTrans('remindPass')}</button><br><br>`+
        `<button data-trans="joinToGdps" onclick="sendLoginForm()" class="loginbtn">${getTrans('joinToGdps')}</button><br>`+
        `<br><button data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
    `</div>`;
    p(html);
    dropLogin();
},
registerPage = ()=>{
    setLink('?'+'register');
    let html = pHeader('predrop')+
    `<div class="frameprofile">`+
        `<h1 data-trans="register">${getTrans('register')}</h1>`+
        `<input data-trans="login06" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login06')}"><br><br>`+
        `<input data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}"><br><br>`+
        `<input data-trans="login03" id="LGemail"    class="framelabel" required placeholder="${getTrans('login03')}"><br><br>`+
            `<div id=3st></div><br><br>`+
        `<button data-trans="register" onclick="sendRegisterForm()" class="loginbtn">${getTrans('register')}</button><br>`+
        `<br><button data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
    `</div>`;
    p(html);
    dropLogin();
},
contentPreload = (sendCommData = '', backFunc = '')=>{
    let html = pHeader()+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class="gdps-forum">`+
        `<button data-trans="back" class="loginbtn" onclick="p(${backFunc}">${getTrans('back')}</button>`+
    `</div><br>`;
    if (isLogged) html += 
    `<div class="framemain" style="height:60px">`+
        `<p style="margin:0">`+
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
GDPSpreload = (sendCommData = '', backFunc = '')=>{
    let html = pHeader()+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class="gdps-forum"></div>`+
    `<div class="gdps-forum">`+
        `<button data-trans="back" class="loginbtn" onclick="p(${backFunc}">${getTrans('back')}</button>`+
    `</div><br>`+
    `<div style="display:flex; flex-wrap:wrap">`+
        `<div style="max-height:300px; overflow:auto; margin-bottom:12px; flex:60%; flex-basis:400px" align=center id="news"></div>`+
        `<div style="max-height:300px; overflow:auto; margin-bottom:12px; flex:40%">`;
    if (isLogged) html += 
            `<div class="framemain" style="height:60px">`+
                `<p style="margin:0">`+
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
gdpsNewsPage = (gdpsId = 0)=>{
    let html = pHeader()+
    `<div class=gdps-forum>`+
        `<button data-trans="back" class=loginbtn onclick="helperContent('gdps', ${gdpsId})">${getTrans('back')}</button><br>`+
    `</div>`+
    `<div id=GDPSesPlace class=gdps-forum style=flex-direction:column></div>`;
    return html;
},
getTags = ()=>{
    let checkboxes = document.querySelectorAll('input[type=\'checkbox\']:checked');
    let queryString = '';
    
    if (checkboxes.length === 0) {
        queryString = '';
    } else {
        checkboxes.forEach((checkbox, index)=>{
            let name = checkbox.name;
            let value = checkbox.value;
            queryString += (index > 0 ? '&' : '') +
            encodeURIComponent(name) + '=' + encodeURIComponent(value);
        })
    };
    return queryString;
},

// кнопка "показать больше"
insertBtn = (lastUse)=>{
    return `<div id=nextGdps class=gdps-helper align=center>
        <button data-trans="showMore" onclick="${lastUse}" class=loginbtn style="font-size:32px; padding: 4px 8px; margin: 12px 0;">
            ${getTrans('showMore')}
        </button>
    </div>`;
},

// рендеры
phoneSwitch = false,
profileSwitcherPhone = (userId = thisUser[1], backButton = '')=>{
    let html = '';
    if (userId === thisUser[1]) {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile"     class=loginbtn onclick="innerProfile(gProfileMini())"            >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="yourGdpses"class=loginbtn onclick="innerProfile(gdpsesWindow())"            >${getTrans('yourGdpses')}</button><br><br>`+
            `<button data-trans="Alarms"    class=loginbtn onclick="innerProfile(alarmsWindow());getAlarms()">${getTrans('Alarms')}</button><br><br>`+
            `<button data-trans="yourTexts" class=loginbtn onclick="innerProfile(texturesWindow())"            >${getTrans('yourTexts')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="p(pageList())">${getTrans('back')}</button>`+
        `</div>`;
    } else {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile"     class=loginbtn onclick="otherProfileMini(${userId})"         >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="notYourGdpses" class=loginbtn onclick="otherGdpsesWindow(${userId})"    >${getTrans('notYourGdpses')}</button><br><br>`+
            `<button data-trans="notYourTexts"    class=loginbtn onclick="otherTexturesWindow(${userId})">${getTrans('notYourTexts')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`;
    };
    return html;
},

editNickPre = ()=>{
    Z('newNick').innerHTML =
    `<input class="framelabel" id=newNick2 data-trans="newNick" placeholder="${getTrans('newNick')}">`+
    `<button data-trans="edit" onclick="editNick()" class=loginbtn>${getTrans('edit')}</button>`;
},
editNick = ()=>{
    let newNick = Z('newNick2').value;
    helperRequest(`${sData[2]}setNickname${sData[6]}?name=${newNick}`)
        .then(data => {
            let timename = thisUser[0].slice();
            thisUser[0] = data;
            for (let gdpsKey in myGdpses[0]) {
                if (myGdpses[0][gdpsKey][7] == timename) {
                    myGdpses[0][gdpsKey][7] = data;
                }
            }
            for (let gdpsKey in mytextures[0]) {
                if (mytextures[0][gdpsKey][7] == timename) {
                    mytextures[0][gdpsKey][7] = data;
                }
            }
            // потом сделать во всех гдпсах и текстурах
            Z('oldNick').innerHTML = data;
            Z('newNick').innerHTML = '';
        })
},

profilePage = (innerHtnl = gProfileMini())=>{
    let html = pHeader()+
    `<div class=frameprofile style="margin:0;height:100%">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone())">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position: absolute;transform: translate(0%, 50%);top: -15px;width: 235px;" align="left">`+
            `<button data-trans="profile"     class=loginbtn onclick="innerProfile(gProfileMini())"            >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="yourGdpses"class=loginbtn onclick="innerProfile(gdpsesWindow())"            >${getTrans('yourGdpses')}</button><br><br>`+
            `<button data-trans="Alarms"    class=loginbtn onclick="innerProfile(alarmsWindow());getAlarms()">${getTrans('Alarms')}</button><br><br>`+
            `<button data-trans="yourTexts" class=loginbtn onclick="innerProfile(texturesWindow())"            >${getTrans('yourTexts')}</button><br><br>`+
            `<button data-trans="yourWikis" class=loginbtn onclick="innerProfile(wikisWindow())"            >${getTrans('yourWikis')}</button><br><br>`+
        `</div>`+
        `<div class=profileMobile3 id="profileWindow" align="left">`+
            innerHtnl+
        `</div>`+
        `<p align=right data-trans="helperVer">${getTrans('helperVer')}</p>`+
    `</div>`;
    return html;
},
gProfileMini = ()=>{
    setLink('?'+'profile');
    let accStatus = thisUser[3] ? getTrans('isActive') : getTrans('isNotact');
    let html = 
    `<h1 data-trans="yourProf">${getTrans('yourProf')}</h1>`+
    `<p><span data-trans="profName">${getTrans('profName')}</span>: <span id=oldNick>${thisUser[0]}</span></p>`+
    `<button data-trans="edit" onclick="editNickPre()" class=loginbtn>${getTrans('edit')}</button>`+
    `<div style=position:relative id=newNick></div>`+
    `<p><span data-trans="profId"    >${ getTrans('profId') }</span>: ${thisUser[1]}</p>`+
    `<p><span data-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(thisUser[2])}</p>`+
    `<p><span data-trans="profAccs">${getTrans('profAccs')}</span> <span data-trans="${thisUser[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`+
    `<button data-trans="logout2" class=loginbtn onclick=gLogout()>${getTrans('logout2')}</button><br><br>`+
    `<button data-trans="getLogin" class=loginbtn onclick=getConfInfo()>${getTrans('getLogin')}</button><br><br>`+
    `<button data-trans="dropPass" class=loginbtn onclick="dropPass()">${getTrans('dropPass')}</button>`+
    `<p data-trans="hereAdd">${getTrans('hereAdd')}</p>`;
    if (thisUser[2] !== 0) 
        html += 
    `<br><br><button class=loginbtn onclick="adminPanel()">Admin Panel!!1</button>`;
    return html;
},
getConfInfo = (step = 0)=>{
    if (step == 0) {
        let html = 
        `<div class=framemenu id=F45>`+
            `<form method=post onsubmit="return false">`+
                `<input data-trans="login02" placeholder=${getTrans('login02')} class=framelabel id=LGpassword><br>`+
                `<button data-trans=otmena onclick="Z('F45').remove()" class=loginbtn>${getTrans('otmena')}</button>`+
                `<button data-trans=commSend onclick=getConfInfo(1) class=loginbtn>${getTrans('commSend')}</button>`+
            `</form>`+
        `</div>`;
        Z('1st').insertAdjacentHTML('beforeend', html);
    } else {
        let password = Z('LGpassword').value;
        Z('F45').remove();
        Loading();
        helperRequest(`${sData[2]}getAccInfo${sData[6]}`, 'password='+password)
            .then(data => {
                Loading(1);
                if (data == '-1') {
                    megaAlert('wrongPass');
                } else {
                    let parsedData = JSON.parse(data);
                    let html2 =
                        `<div class=framemenu id=F90 align=left>`+
                            `<span data-trans="login06">${getTrans('login06')}</span>: ${parsedData[0]}<br>`+
                            `<span data-trans="login03">${getTrans('login03')}</span>: ${parsedData[1]}<br><br>`+
                            `<button data-trans=back onclick="Z('F90').remove()" class=loginbtn>${getTrans('back')}</button>`+
                        `</div>`;
                    Z('1st').insertAdjacentHTML('beforeend', html2);
                }
            })
            .catch((error)=>{returnError(error+servError)});
    }
},
gdpsesWindow = ()=>{
    setLink('?'+'addedCamps');
    let gdpses = "";
    myGdpses.forEach((gdps) => {
        gdpses+=GDPSrenderInProfile2(gdps);
    });
    let html =
    `<h1 data-trans="yourGdpses">${getTrans('yourGdpses')}</h1><br>`+
    `<div align=left>`+
    `<button data-trans="addGdps" onclick="innerProfile(addGdps())" style=font-size:24px class=loginbtn>${getTrans('addGdps')}</button>`+
    `<button data-trans="addNews" onclick="innerProfile(newsWindow())" style=font-size:24px;margin-top:4px class=loginbtn>${getTrans('addNews')}</button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 300px); overflow:auto' align=left>`+
        gdpses+
    `</div>`;
    return html;
},
newsWindow = (isGdps = 0)=>{
    let gdpses = '';
    let needArray = isGdps == 0 ? myGdpses[0] : mytextures[0];
    for (let gdpsKey in needArray) {
        let gdps = needArray[gdpsKey];
        let Gid = gdps[0];
        let title = gdps[1];

        gdpses += `<option value=${Gid}>${title}</option>`
    };
    let html = 
    `<h1 data-trans="newPost" id=blacktext>${getTrans('newPost')}</h1>`+
    `<form method=post onsubmit="return enterFormData(this,'newsPost${sData[6]}')">`+
        `<input data-trans="addGdps01" class=framelabel type=title placeholder=${getTrans("addGdps01")} name=title><br>`+
        `<textarea data-trans="newsText" class=framelabel name=text placeholder="${getTrans('newsText')}"></textarea><br>`+
        `<select class=framelabel style=color:black name=gdps>${gdpses}</select><br>`+
        `<input type=hidden name=gid value=${isGdps}><br>`+
        `<input data-trans="publishNews" type=submit value="${getTrans('publishNews')}" class="loginbtn">`+
    `</form>`;
    return html;
},
texturesWindow = ()=>{
    setLink('?'+'addedShows');
    let gdpses = "";
    mytextures.forEach((gdps) => {
        gdpses+=TEXTrenderInProfile2(gdps);
    });
    let html =
    `<h1 data-trans="yourTexts">${getTrans('yourTexts')}</h1><br>`+
    `<div align=left>`+
        `<button data-trans="addText" onclick="innerProfile(addText())" style=font-size:24px class=loginbtn>${getTrans('addText')}</button>`+
        `<button data-trans="addNews" onclick="innerProfile(newsWindow(1))" style=font-size:24px;margin-top:4px class=loginbtn>${getTrans('addNews')}</button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 300px); overflow:auto' align=left>`+
        gdpses+
    `</div>`;
    return html;
},
wikisWindow = ()=>{
    setLink('?'+'addedWikis');
    let gdpses = "";
    yourWikies.forEach(gdps => {
        gdpses+=WIKIrenderInProfile2([gdps]);
    });
    let html =
    `<h1 data-trans="yourWikis">${getTrans('yourWikis')}</h1><br><br> `+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 300px); overflow:auto' align=left>`+
        gdpses+
    `</div>`;
    return html;
},
alarmsWindow = ()=>{
    let html = 
    `<div align=center>`+
        `<h1 data-trans="alarms01">${getTrans('alarms01')}</h1>`+
        `<div style="display:flex">`+
            `<div style="width: 30%;    height: 400px;">`+
                `<h2 data-trans="msgs">${getTrans('msgs')}</h2>`+
                `<div id=alarms_small>`+
                `</div>`+
            `</div>`+
            `<div style="width: 70%;    height: 400px;">`+
                `<h2 data-trans="fullMsgs">${getTrans('fullMsgs')}</h2>`+
                `<div id=alarms_big>`+
                `</div>`+
            `</div>`+
        `</div>`+
    `</div>`;
    return html;
},
getAlarms = (page = 0)=>{
    setLink('?'+'alarms');
    Loading();
    helperRequest(`${sData[0]}getAlarms${sData[6]}?page=${page}`)
    .then(data => {
        Loading(1);
        if (data == '[]') 
            return Z('alarms_small').innerHTML = `<span data-trans="newsNone">${getTrans('newsNone')}</span>`;
        let parsedData = JSON.parse(data);
        let html = '';
        parsedData.forEach(el => {
            html += `<button id="btn${el[0]}" class=loginbtn onclick="getFullAlarm(${el[0]})">${el[1]}</button>`;
        });
        Z('alarms_small').innerHTML = html;
    })
    .catch((error)=>{returnError(error+servError)});
},
getFullAlarm = (id)=>{
    setLink('?'+'alarm='+id);
    Loading();
    helperRequest(`${sData[0]}getAlarm${sData[6]}?id=${id}`)
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
        Z('alarms_big').innerHTML = html;
    })
    .catch((error)=>{returnError(error+servError)});
},
removeAlarm = (id)=>{
    Loading();
    helperRequest(`${sData[1]}deleteAlarm${sData[6]}?id=${id}`)
    .then(() => {
        Loading(1);
        Z('btn'+id).remove();
        Z('fullAlarm').remove();
    })
    .catch((error)=>{returnError(error+servError)});
},
dropWindow = ()=>{
    let html = pHeader()+
    `<div class="frameprofile" style="width:10vw%">`+
        `<h1 data-trans="passReset">${getTrans('passReset')}</h1>`+
        `<input data-trans="login06" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login06')}"><br><br>`+
        `<input data-trans="login04" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login04')}"><br><br>`+
        `<input data-trans="login05" id="LGemail"    class="framelabel" required placeholder="${getTrans('login05')}"><br><br>`+
        `<p data-trans="passResetIf">${getTrans('passResetIf')}</p>`+
        `<button data-trans="submit" class=loginbtn onclick="sendDrop()">${getTrans('submit')}</button><br><br>`+
        `<button data-trans="back" class=loginbtn onclick="p(profilePage())">${getTrans('back')}</button>`+
    `</div>`;
    return html;
},
addGdps = ()=>{
    setLink('?'+'addCamp');
    let html = 
    `<h1 data-trans="addGdps">${getTrans('addGdps')}</h1>`+
    `<form method=POST action='gdpsAdd${sData[6]}' onsubmit="return enterFormData(this,'gdpsAdd${sData[6]}')">`+
        `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input data-trans="gdpsInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('gdpsInput01')}"><br>`+
        `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="gdpsInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('gdpsInput02')}"></textarea><br>`+
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
addText = ()=>{
    setLink('?'+'addShow');
    let html = 
    `<h1 data-trans="addText">${getTrans('addText')}</h1>`+
    `<form method=POST action='textAdd${sData[6]}' onsubmit="return enterFormData(this,'textAdd${sData[6]}')">`+
        `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input data-trans="textInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('textInput01')}"><br>`+
        `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="textInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('textInput02')}"></textarea><br>`+
        `<label data-trans="addText01">${getTrans('addText01')}</label><br><input data-trans="textInput03" class=framelabel type=text name=img style=width:100% placeholder="${getTrans('textInput03')}"><br>`+
        `<label data-trans="addText03">${getTrans('addText03')}</label><br><input data-trans="textInput05" class=framelabel type=text name=link style=width:100% placeholder="${getTrans('textInput05')}"><br><br>`+
        
        `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label><br>`+
        `<select id="langs" class="framelabel" name="language" required>`+
            `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
            `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
            `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
        `</select><br><br>`+

        `<label data-trans="addGdps051">${getTrans('addGdps051')}</label><br>`+
        `<select name=tags[] size=5 multiple required class=framelabel>`+
            `<option data-trans="TXtag01" value=1>${getTrans('TXtag01')}</option>`+
            `<option data-trans="TXtag02" value=2>${getTrans('TXtag02')}</option>`+
            `<option data-trans="TXtag03" value=3>${getTrans('TXtag03')}</option>`+
            `<option data-trans="TXtag04" value=4>${getTrans('TXtag04')}</option>`+
            `<option data-trans="TXtag05" value=5>${getTrans('TXtag05')}</option>`+
            `<option data-trans="TXtag06" value=6>${getTrans('TXtag06')}</option>`+
            `<option data-trans="TXtag07" value=7>${getTrans('TXtag07')}</option>`+
            `<option data-trans="TXtag08" value=8>${getTrans('TXtag08')}</option>`+
            `<option data-trans="TXtag09" value=9>${getTrans('TXtag09')}</option>`+
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
editGdps = (gdpsId)=>{
    Loading();
    let html = ``;
    helperRequest(`${sData[1]}gdpsEdit${sData[6]}?id=${gdpsId}`)
    .then (data => {
        Loading(1);
        setLink('?'+'editCamp='+gdpsId);
        let parsedData = JSON.parse(data);
        let tags = JSON.parse(parsedData[5]);
        let os = JSON.parse(parsedData[6]);
        html = 
            `<h1 data-trans="editGdps">${getTrans('editGdps')}</h1>`+
            `<form method=POST action='gdpsEdit${sData[6]}' onsubmit="return enterFormData(this,'gdpsEdit${sData[6]}?id=${gdpsId}')">`+
                `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input value="${parsedData[0]}" data-trans="gdpsInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('gdpsInput01')}"><br>`+
                `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="gdpsInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('gdpsInput02')}">${parsedData[1]}</textarea><br>`+
                `<label data-trans="addGdps04">${getTrans('addGdps04')}</label><br><input value="${parsedData[3]}" data-trans="gdpsInput04" class=framelabel type=text    name=img style=width:100% placeholder="${getTrans('gdpsInput04')}"><br>`+
                `<label data-trans="helperDs">${ getTrans('helperDs') }</label><br><input value="${parsedData[4]}" data-trans="gdpsInput05" class=framelabel type=text    name=link style=width:100% required placeholder="${getTrans('gdpsInput05')}"><br><br>`+
                
                `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label><br>`+
                `<select id="language" class="framelabel" name="language" required>`+
                    `<option ${parsedData[7] == 'RU' ? 'selected' : ''} data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                    `<option ${parsedData[7] == 'EN' ? 'selected' : ''} data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                    `<option ${parsedData[7] == 'ES' ? 'selected' : ''} data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
                `</select><br><br>`+

                `<label data-trans="addGdps05">${getTrans('addGdps05')}</label><br>`+
                `<select name=tags[] id=tags size=5 multiple required class=framelabel>`+
                    `<option ${tags.includes("1") ? 'selected' : ''    } data-trans="GDtag01" value=1>${getTrans('GDtag01')}</option>`+
                    `<option ${tags.includes("2") ? 'selected' : ''    } data-trans="GDtag02" value=2>${getTrans('GDtag02')}</option>`+
                    `<option ${tags.includes("3") ? 'selected' : ''    } data-trans="GDtag03" value=3>${getTrans('GDtag03')}</option>`+
                    `<option ${tags.includes("4") ? 'selected' : ''    } data-trans="GDtag04" value=4>${getTrans('GDtag04')}</option>`+
                    `<option ${tags.includes("5") ? 'selected' : ''    } data-trans="GDtag05" value=5>${getTrans('GDtag05')}</option>`+
                    `<option ${tags.includes("6") ? 'selected' : ''    } data-trans="GDtag06" value=6>${getTrans('GDtag06')}</option>`+
                    `<option ${tags.includes("7") ? 'selected' : ''    } data-trans="GDtag07" value=7>${getTrans('GDtag07')}</option>`+
                    `<option ${tags.includes("8") ? 'selected' : ''    } data-trans="GDtag08" value=8>${getTrans('GDtag08')}</option>`+
                    `<option ${tags.includes("11") ? 'selected' : '' } data-trans="GDtag11" value=11>${getTrans('GDtag11')}</option>`+
                `</select><br>`+
                `<label data-trans="addGdps06">${getTrans('addGdps06')}:</label><br>`+
                `<select name=os[] id=os multiple required class=framelabel>`+
                    `<option ${os.includes("12") ? 'selected' : ''    } data-trans="GDtag12" value=12>${getTrans('GDtag12')}</option>`+
                    `<option ${os.includes("13") ? 'selected' : ''    } data-trans="GDtag13" value=13>${getTrans('GDtag13')}</option>`+
                    `<option ${os.includes("14") ? 'selected' : ''    } data-trans="GDtag14" value=14>${getTrans('GDtag14')}</option>`+
                    `<option ${os.includes("15") ? 'selected' : ''    } data-trans="GDtag15" value=15>${getTrans('GDtag15')}</option>`+
                `</select><br><br>`+
                `<input data-trans="editGdps" type=submit value="${getTrans('editGdps')}" class=loginbtn><br>`+
                `<p data-trans="afterGD">${getTrans('afterGD')}</p><br>`+
            `</form>`;
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
},
editText = (gdpsId)=>{
    Loading();
    let html = ``;
    helperRequest(`${sData[1]}textEdit${sData[6]}?id=${gdpsId}`)
    .then (data => {
        Loading(1);
        setLink('?'+'editShow='+gdpsId);
        let parsedData = JSON.parse(data);
        let tags = JSON.parse(parsedData[5]);
        let os = JSON.parse(parsedData[6]);
        html = 
            `<h1 data-trans="editText">${getTrans('editText')}</h1>`+
            `<form id=formGdps method=POST action='textEdit${sData[6]}' onsubmit="return enterFormData(this,'textEdit${sData[6]}?id=${gdpsId}')">`+
                `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input value="${parsedData[0]}" data-trans="textInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('textInput01')}"><br>`+
                `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="textInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('textInput02')}">${parsedData[1]}</textarea><br>`+
                `<label data-trans="addText01">${getTrans('addText01')}</label><br><input value="${parsedData[2]}" data-trans="textInput03" class=framelabel type=text name=img style=width:100% placeholder="${getTrans('textInput03')}"><br>`+
                `<label data-trans="addText03">${getTrans('addText03')}</label><br><input value="${parsedData[4]}" data-trans="textInput05" class=framelabel type=text name=link style=width:100% placeholder="${getTrans('textInput05')}"><br><br>`+
                `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label><br>`+
                `<select id="language" class="framelabel" name="language" required>`+
                    `<option ${parsedData[7] == 'RU' ? 'selected' : ''} data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                    `<option ${parsedData[7] == 'EN' ? 'selected' : ''} data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                    `<option ${parsedData[7] == 'ES' ? 'selected' : ''} data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
                `</select><br><br>`+
                `<label data-trans="addGdps051">${getTrans('addGdps051')}</label><br>`+
                `<select name=tags[] size=5 multiple required class=framelabel>`+
                    `<option ${tags.includes("1") ? 'selected' : ''    } data-trans="TXtag01" value=1>${getTrans('TXtag01')}</option>`+
                    `<option ${tags.includes("2") ? 'selected' : ''    } data-trans="TXtag02" value=2>${getTrans('TXtag02')}</option>`+
                    `<option ${tags.includes("3") ? 'selected' : ''    } data-trans="TXtag03" value=3>${getTrans('TXtag03')}</option>`+
                    `<option ${tags.includes("4") ? 'selected' : ''    } data-trans="TXtag04" value=4>${getTrans('TXtag04')}</option>`+
                    `<option ${tags.includes("5") ? 'selected' : ''    } data-trans="TXtag05" value=5>${getTrans('TXtag05')}</option>`+
                    `<option ${tags.includes("6") ? 'selected' : ''    } data-trans="TXtag06" value=6>${getTrans('TXtag06')}</option>`+
                    `<option ${tags.includes("7") ? 'selected' : ''    } data-trans="TXtag07" value=7>${getTrans('TXtag07')}</option>`+
                    `<option ${tags.includes("8") ? 'selected' : ''    } data-trans="TXtag08" value=8>${getTrans('TXtag08')}</option>`+
                    `<option ${tags.includes("9") ? 'selected' : ''    } data-trans="TXtag09" value=9>${getTrans('TXtag09')}</option>`+
                `</select><br>`+
                `<label data-trans="textQual">${getTrans('textQual')}</label><br>`+
                `<select name=os[] multiple required class=framelabel>`+
                    `<option ${os.includes("12") ? 'selected' : ''    } data-trans="TXtag12" value=12>${getTrans('TXtag12')}</option>`+
                    `<option ${os.includes("13") ? 'selected' : ''    } data-trans="TXtag13" value=13>${getTrans('TXtag13')}</option>`+
                    `<option ${os.includes("14") ? 'selected' : ''    } data-trans="TXtag14" value=14>${getTrans('TXtag14')}</option>`+
                    `<option ${os.includes("15") ? 'selected' : ''    } data-trans="TXtag15" value=15>${getTrans('TXtag15')}</option>`+
                `</select><br><br>`+
                `<input data-trans="editText" type=submit value="${getTrans('editText')}" class=loginbtn><br>`+
                `<p data-trans="afterTX">${getTrans('afterTX')}</p><br>`+
            `</form>`;
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
},
coownersMenu = (id, contentType)=>{
    let contentTypeNew = contentType - 3;
    Loading();
    helperRequest(`${sData[0]}getOwners${sData[6]}?id=${id}&type=${contentType}`)
    .then(data => {
        Loading(1);
        if (contentType == 3)
            setLink('?'+'campOwn='+id);
        else if (contentType == 4)
            setLink('?'+'showOwn='+id);
        else if (contentType == 5)
            setLink('?'+'wikiOwn='+id);
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
    .catch((error)=>{returnError(error+servError)});
},
ownersAdd = (id, type)=>{
    let userData = Z('addown').value;
    Loading();
    helperRequest(`${sData[1]}permAdd${sData[6]}?gdps=${id}&type=${type}&user=${userData}`)
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
    .catch((error)=>{returnError(error+servError)});
},
deleteOwner = (contentId, type, userId)=>{
    Loading();
    helperRequest(`${sData[1]}perm${sData[6]}?gdps=${contentId}&type=${type}&id=${userId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        Z('perm'+userId).remove();
    })
    .catch((error)=>{returnError(error+servError)});
},
getJoinLog = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[0]}getJoinLog${sData[6]}?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        setLink('?'+'campLog='+gdpsId);
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
    .catch((error)=>{returnError(error+servError)});
},

MCedit = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}modc${sData[6]}?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        Z('MC'+gdpsId).innerHTML = getTrans(data);
    });
},
CCedit = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}crec${sData[6]}?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        Z('CC'+gdpsId).innerHTML = getTrans(data);
    });
},
JEedit = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}setj${sData[6]}?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        if (data == '-2')
            return returnError('Access denied');
        Z('JE'+gdpsId).innerHTML = getTrans(data);
    });
},
ballsUp = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}bump${sData[6]}?id=${gdpsId}`)
    .then(data => {
        Loading(1);
        if (data == 'no') 
            return Z('BL'+gdpsId).innerHTML = getTrans('gdpsunckecked');
        let pData = JSON.parse(data);
        let canBump;
        if (pData[2] > 0) {
            canBump = `<span data-trans=isBL>${getTrans('isBL')}</span>`;
        } else {
            canBump = `<span data-trans=wait1>${getTrans('wait1')}</span>${Math.abs(pData[2])}<span data-trans=wait2>${getTrans('wait2')}</wait>`;
            if (pData[2] == -7200) {
                megaAlert('bumped');
                myGdpses[0]['g'+gdpsId][14] = pData[0];
            }
        }
        Z('BL'+gdpsId).innerHTML = canBump;
    });
},

otherProfile = (userId, backButton, innerHtnl = otherProfileMini)=>{
    let html = pHeader()+
    `<div class=frameprofile style="margin:0;height:100%">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone(${userId}, '${backButton}'))">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position: absolute;transform: translate(0%, 50%);top: -15px;width: 235px;" align="left">`+
            `<button data-trans="profile"     class=loginbtn onclick="otherProfileMini(${userId})"     >${getTrans('profile')}</button><br><br>`+
            `<button data-trans="notYourGdpses" class=loginbtn onclick="otherGdpsesWindow(${userId})"    >${getTrans('notYourGdpses')}</button><br><br>`+
            `<button data-trans="notYourTexts"    class=loginbtn onclick="otherTexturesWindow(${userId})">${getTrans('notYourTexts')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`+
        `<div class=profileMobile3 id="profileWindow" align="left">`+
        `</div>`+
    `</div>`;
    p(html);
    innerHtnl(userId);
},
otherProfileMini = (userId)=>{
    setLink('?'+'profiles='+userId);
    Loading();
    helperRequest(`${sData[0]}getUser${sData[6]}?id=${userId}`)
    .then(data => {
        Loading(1);
        let userData = JSON.parse(data);
        let accStatus = userData[3] ? getTrans('isActive') : getTrans('isNotact');
        let html = 
        `<h1><span data-trans="notYourProf">${getTrans('notYourProf')}</span> ${userData[0]}</h1>`+
        `<p><spandata-trans="profName">${getTrans('profName')}</span>: ${userData[0]}</p>`+
        `<p><spandata-trans="profId">${     getTrans('profId') }</span>: ${userData[1]}</p>`+
        `<p><spandata-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(userData[2])}</p>`+
        `<p><span data-trans="notProfAccs">${getTrans('notProfAccs')}</span> ${userData[0]} <span data-trans="${userData[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`;
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
},
otherGdpsesWindow = (userId)=>{
    setLink('?'+'profCamps='+userId);
    Loading();
    helperRequest(`${sData[0]}getAddedGdpses${sData[6]}?id=${userId}&type=0`)
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
    .catch((error)=>{returnError(error+servError)});
},
otherTexturesWindow = (userId)=>{
    setLink('?'+'profShows='+userId);
    Loading();
    helperRequest(`${sData[0]}getAddedTextures${sData[6]}?id=${userId}&type=1`)
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
    .catch((error)=>{returnError(error+servError)});
},

toStringRole = (id)=>{
    switch (id) {
        case 0: return getTrans('role00');
        case 1: return getTrans('role01');
        case 2: return getTrans('role02');
        case 3: return getTrans('role03');
    };
},
toStringGDPS = (tag)=>{
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
toStringTEXT = (tag)=>{
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
GDPSrenderMini = (parsedData)=>{
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
        title = gdpsData[1];
        description = gdpsData[2];
        tags = JSON.parse(gdpsData[3]);
        os = JSON.parse(gdpsData[4]);
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        renderJoinLink = gdpsData[9];
        isWeekly = gdpsData[10];
        language = gdpsData[11];
        tagsOs =     '';
		*/

        renderJoinLink = renderJoinLink ? '' : `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('joinToGdps')}</a>`;

        if(isWeekly == 1)
            isWeeklyData = ['background:var(--color-weekly);',
            `<h1 data-trans="weekGdps" style="position:absolute;top:-55px;background:var(--color-weekly-two);border-radius:8px;width:calc(100% - 16px);" align="center">${getTrans('weekGdps')}</h1>`];
        else 
            isWeeklyData = ['',''];
        
        tags.forEach((tag)=>{
            tagsOs += `<div class="tag">${toStringGDPS(tag)}</div>`;
        });
        os.forEach((tag)=>{
            tagsOs += `<div class="tag">${toStringGDPS(tag)}</div>`;
        });
        
    
        html += 
        `<div class="framegdps" style="${isWeeklyData[0]}width:280px;height:375px" id="${id}">`+
            isWeeklyData[1]+
            `<h2>${title} <img src="./imgs/${language}.png"></h2>`+
            `<p style="margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'p(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:128px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=128px height=128px style="border-radius:24px">`+
                `<p style="margin:0">${description}${description[120] === undefined ? '' : '...'}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `${renderJoinLink}`+
                `<button data-trans="moreInfo" class=loginbtn onclick="helperContent('gdps', ${id})">${getTrans('moreInfo')}</button>`+
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
TEXTrenderMini = (parsedData)=>{
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
        language = null,
        tagsOs = '';
    
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
        renderJoinLink = gdpsData[9];
        language = gdpsData[11];
        tagsOs =     '';

        renderJoinLink = renderJoinLink ? '' : `<a class="loginbtn" data-trans="downloadPCmini" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('downloadPCmini')}</a>`;

        tags.forEach((tag)=>{
            tagsOs += `<div class="tag">${toStringTEXT(tag)}</div>`;
        });
        os.forEach((tag)=>{
            tagsOs += `<div class="tag">${toStringTEXT(tag)}</div>`;
        });
        
    
        html += 
        `<div class="framegdps" style="width:280px;height:375px" id="${id}">`+
            `<h2>${title} <img src="./imgs/${language}.png"></h2>`+
            `<p style="margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'p(pageText())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:128px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=128px height=128px style="border-radius:24px">`+
                `<p style="margin:0">${description}${description[120] === undefined ? '' : '...'}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `${renderJoinLink}`+
                `<button data-trans="moreInfo" class=loginbtn onclick="helperContent('text', ${id})">${getTrans('moreInfo')}</button>`+
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
gdpsReport = (gdpsId)=>{
    let html = 
    `<div class=framemenu id=REPform>`+
        `<h1 data-trans="report01">${getTrans('report01')}</h1>`+
        `<form onsubmit="return enterFormData(this,'report${sData[6]}')">`+
            `<input name=gdps value="${gdpsId}" type=hidden>`+
            `<textarea data-trans="report02" style="width:250px;height:100px" placeholder="${getTrans('report02')}" class=framelabel name=text></textarea><br>`+
            `<button data-trans="otmena" onclick="Z('REPform').remove()" class=loginbtn>${getTrans('otmena')}</button>`+
            `<input data-trans="commSend" type=submit value=${getTrans('commSend')} class=loginbtn>`+
        `</form>`+
    `</div>`;
    Z('1st').insertAdjacentHTML('beforeend', html);
},
GDPSrender = (parsedData)=>{
    let html = '';

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
        tagsOs =     '';
	*/

    tags.forEach((tag)=>{
        tagsOs += `<div class="tag">${toStringGDPS(tag)}</div>`;
    });
    html += '</div>'+'<div class="flex-row">';
    os.forEach((tag)=>{
        tagsOs += `<div class="tag">${toStringGDPS(tag)}</div>`;
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
        `<p style="margin:0">`+
            `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
            `<button onclick="otherProfile(${userId},'p(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
        `</p>`+
        `<div class="flex-row">${tagsOs}</div>`+
        `<p>${description}</p>`+
        `<div style="margin-top:15px">`+
            `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('joinToGdps')}</a>`+
            `<button data-trans="getLink" class="loginbtn" onclick="linkCopy('https://gdpshelper.xyz/list/gdps${sData[6]}?id=${id}')">${getTrans('getLink')}</button>`+
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
TEXTrender = (parsedData)=>{
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
        pictureLink = gdpsData[8],
        renderJoinLink = gdpsData[9],
        tagsOs =     '';

    tags.forEach((tag)=>{
        tagsOs += `<div class="tag">${toStringTEXT(tag)}</div>`;
    });
    html += '</div>'+'<div class="flex-row">';
    os.forEach((tag)=>{
        tagsOs += `<div class="tag">${toStringTEXT(tag)}</div>`;
    });

    html += 
    `<div class="framegdps">`+
        `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=128px height=128px style="border-radius:24px">`+
        `<h2>${title}</h2>`+
        `<p style="margin:0">`+
            `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
            `<button onclick="otherProfile(${userId},'p(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
        `</p>`+
        `<div class="flex-row">${tagsOs}</div>`+
        `<p>${description}</p>`+
        `<div style="margin-top:15px">`+
            `<a class="loginbtn" data-trans="downloadPCmini" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('downloadPCmini')}</a>`+
            `<button data-trans="getLink" class="loginbtn" onclick="linkCopy('https://gdpshelper.xyz/list/gdps${sData[6]}?id=${id}')">${getTrans('getLink')}</button>`+
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
GDPSrenderInProfile = (parsedData)=>{
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
        renderJoinLink = null,
        isWeeklyData = ['',''],
        isWeekly,
        link,
        database,
        checked,
        coowner,
        owner;
    
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

        renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('joinToGdps')}</a>`;

        isWeeklyData = ['',''];

        html += 
        `<div class="framegdps" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="${id}">`+
            `${isWeeklyData[1]}`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'p(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:32px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target="_blank">${getTrans('joinToGdps')}</a>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
TEXTrenderInProfile = (parsedData)=>{
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

        html += 
        `<div class=framegdps style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'p(pageText())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style=min-height:32px>`+
                `<img onerror="this.src='./imgs/empty.png'" align=left src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a class="loginbtn" data-trans="downloadPCmini" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('downloadPCmini')}</a>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
TEXTrenderInProfile2 = (parsedData)=>{
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

        if (thisUser[1] == userId)
            coownersBtn = `<button data-trans="coowners" onclick="coownersMenu(${id},4)" class=loginbtn style="margin-top:8px">${getTrans('coowners')}</button>`;
        else 
            coownersBtn = `<button data-trans="coownersNone" class=loginbtn style="margin-top:8px">${getTrans('coownersNone')}</button>`;

        html += 
        `<div class=framegdps style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'p(pageText())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style=min-height:32px>`+
                `<img onerror="this.src='./imgs/empty.png'" align=left src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a class="loginbtn" data-trans="downloadPCmini" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('downloadPCmini')}</a>`+
                `<button data-trans="editText" onclick="editText(${id})" class=loginbtn style="margin-top:8px">${getTrans('editText')}</button>`+
                coownersBtn+
            `</div>`+
        `</div>`;
    };
    return html;
},
WIKIrenderInProfile2 = (parsedData)=>{
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
        userId = null;

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
        likesCount = gdpsData[6];
        userId = gdpsData[7];

        if (thisUser[1] == userId)
            coownersBtn = `<button data-trans="coowners" onclick="coownersMenu(${id},5)" class=loginbtn style="margin-top:8px">${getTrans('coowners')}</button>`;
        else 
            coownersBtn = `<button data-trans="coownersNone" class=loginbtn style="margin-top:8px">${getTrans('coownersNone')}</button>`;

        html += 
        `<div class=framegdps style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<div style=min-height:32px>`+
                `<img onerror="this.src='./imgs/empty.png'" align=left src="${decodeURIComponent(img)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${text}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<button data-trans="edit" onclick="editGuide(0,${id})" class=loginbtn style="margin-top:8px">${getTrans('edit')}</button>`+
                `<button data-trans="pages" onclick="wikiAsOwner(${id})" class=loginbtn style="margin-top:8px">${getTrans('pages')}</button>`+
                coownersBtn+
            `</div>`+
        `</div>`;
    };
    return html;
},
GUIDrenderInProfile2 = (parsedData)=>{
    let html = '',
        count = 0;
        
    let gdpsData = null,
        id = null,
        title = null,
        language = null,
        date = null,
        likes = null,
        img = null,
        userId = null;

    for (let Id in parsedData) {
        count++;
        if (count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        title = gdpsData[1];
        language = gdpsData[2];
        date = gdpsData[6];
        likes = gdpsData[6];
        img = gdpsData[7];
        userId = gdpsData[8];

        html += 
        `<div class=framegdps style="width:250px;height:190px" id="${id}">`+
            `<img width=266px height=133px src="${img}" onerror="this.src='./imgs/empty.jpg'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:15px;border-top-right-radius:15px">`+
            `<h2 style="z-index:1;position:inherit;margin-top:120px">${title} <img src="./imgs/${language}.png"></h2>`+
            `<div style="position: absolute;top: 0;left: 0;width: 266px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-black-alpha), var(--color-black));"></div>`+
            `<div style="margin-top:15px">`+
                `<button data-trans="edit" onclick="editGuide(1,${id})" class=loginbtn style="margin-top:8px">${getTrans('edit')}</button>`+
                `<button onclick="removePage(${id})" style="position:absolute;bottom:8px;right:8px;padding:2px 4px" class="loginbtn">`+
                    `<img width="24px" style=margin:0 src="./imgs/trash.svg">`+
                `</button>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
GDPSrenderInProfile2 = (parsedData)=>{
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
        renderJoinLink = null,
        PointsPre = null,
        Points = null;
    
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
        if (gdpsData[13] == '0') {
            Points = getTrans('gdpsunckecked');
        } else if (gdpsData[13] == '-1') {
            Points = getTrans('gdpsbanned');
        } else {
            PointsPre = ~~(Date.now() / 1000) - gdpsData[12];
            Points = PointsPre > 0 ? `<span data-trans=isBL>${getTrans('isBL')}</span>` : `<span data-trans=wait1>${getTrans('wait1')}</span>${Math.abs(PointsPre)}<span data-trans=wait2>${getTrans('wait2')}</wait>`;
        }
        renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('joinToGdps')}</a>`;

        let coownersBtn = '';

        if (thisUser[1] == userId)
            coownersBtn = `<button data-trans="coowners" onclick="coownersMenu(${id},3)" class=loginbtn style="margin-top:8px">${getTrans('coowners')}</button>`;
        else 
            coownersBtn = `<button data-trans="coownersNone" class=loginbtn style="margin-top:8px">${getTrans('coownersNone')}</button>`;

        html += 
        `<div class="framegdps" style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
            `<p style="display:inline;margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'p(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:32px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target="_blank">${getTrans('joinToGdps')}</a>`+
            `</div>`+
            `<button data-trans="editGdps" onclick="editGdps(${id})" class=loginbtn style="margin-top:8px">${getTrans('editGdps')}</button>`+
            coownersBtn+`<br>`+
            `<span data-trans="isJE">${getTrans('isJE')}</span>:<button id=JE${id} class="loginbtn" data-trans="${!!renderJoinLink ? 'no' : 'yes'}" onclick="JEedit(${id})">${getTrans(!!renderJoinLink ? 'no' : 'yes')}</button><br>`+
            `<span data-trans="isBL">${getTrans('isBL')}</span>:<button id=BL${id} class="loginbtn" ${gdpsData[13] == 1 ? `onclick="ballsUp(${id})"` : ''}>${Points}</button>`+
        `</div>`;
    };
    return html;
},
renderComms = (parsedData, commtype = 0, dataForNextButton = '')=>{

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
            `<button style="border:none;background:none;margin:0;font-size:32px;font-weight:bold;color:${nameColor}"`+
            `onclick="otherProfile(${userId},lastUsed3)">${username}</button>`+
            `<p style="margin:0">${timeAgo(date)}</p>`+
            `<p>${text}</p>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCountComm${id}">${likes}</span>`+
                `<button onclick="sendLike(${id},${commtype},1)" id="like"></button>`+
                `<button onclick="sendDislike(${id},${commtype},1)" id="dislike"></button>`+
            `</div>`+
            (thisUser[1] == userId || thisUser[2] > 0 ? delBtn : '')+
        `</div>`;
    
        htmlFull = htmlFull + html;
    
        html = '';
    };
    if (htmlFull == '')
        return `<h1 data-trans="commsNone">${getTrans('commsNone')}</h1>`;
    return htmlFull;
},
RenderNews = (data, isComm = 0, innerGdpsRendered = 'mega')=>{
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
        miniRenderMode =     '';

    let myGdpsesIds = [];

    for (let gdpsKey in myGdpses[0]) {
        if (thisUser[1] == myGdpses[0][gdpsKey][6])
            myGdpsesIds.push(myGdpses[0][gdpsKey][0]);
    };

    if (innerGdpsRendered == 'mini')
        miniRenderMode = 'style="width:calc(100% - 40px)"';


    for (let ide in data)    {
    
        html = '';
        
        gdpsData = data[ide];
        id = gdpsData[0];
        title = gdpsData[1];
        text = gdpsData[2];
        userId = gdpsData[3];
        username = gdpsData[4];
        gdpsId = gdpsData[5];
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
            `<button class=loginbtn onclick="helperContent('gdps', ${gdpsId})">${gdpsTitle}</button>`+
            `- <button class=emptybtn onclick="otherProfile(${userId},'helperNews(${gdpsId})')">${username}</button>`+
            `<p>${timeAgo(date)}</p>`+
            `<p>${text}</p>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                `<button onclick="sendLike(${id},2)" id="like"></button>`+
                `<button onclick="sendDislike(${id},2)" id="dislike"></button>`+
            `</div>`+
            (canDel || thisUser[2] > 0 ? delBtn : '')+
            `${isComm ? '' : `<button data-trans="comms" class=loginbtn onclick=helperContent('newsC',${id},${gdpsId})>${getTrans('comms')}</button>`}`+
        `</div>`;
        html2 = html2 + html;
    };
    if (html2 == '')
        return `<h1 data-trans="newsNoneReal">${getTrans('newsNoneReal')}</h1>`;
    return html2;
},
timeAgo = (timestamp)=>{
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

Loading = (stop = 0)=>{
    if (stop == 0)
        document.body.insertAdjacentHTML('beforeend',
            '<div data-trans="loading..." class=ALERT id=TheLoadingElem style=position:absolute><h1>' +
                getTrans('loading...') +
            '</h1></div>'
        );
    else 
        if (Z('TheLoadingElem'))
            Z('TheLoadingElem').remove();
},
linkCopy = (string)=>{
    navigator.clipboard.writeText(string)
        .then(()=>{})
        .catch((error)=>{returnError(error)});
    Z('1st').insertAdjacentHTML('beforeend',
        `<div class=ALERT id=CopyElem style=position:absolute><h1 data-trans="copied">${getTrans('copied')}</h1></div>`
    );
    setTimeout(()=>{
        Z('CopyElem').remove();
    }, 1000);
},
globalAlertId = 0,
megaAlert = (text)=>{
    globalAlertId = globalAlertId++;
    Z('1st').insertAdjacentHTML('beforeend',
        `<div class=ALERT id=alert${globalAlertId} style=position:absolute><h1 data-trans="${text}">${getTrans(text)}</h1></div>`
    );
    setTimeout(()=>{
        Z('alert'+globalAlertId).remove();
    }, 3000);
},
enterFormData = (form, sendPlace)=>{
    let formData = new FormData(form);
    let params = new URLSearchParams(formData).toString();

    Loading();
    helperRequest(`${sData[1]}${sendPlace}`, params)
    .then(data => {
        Loading(1);
        if (sendPlace.indexOf('?') !== -1)
            sendPlace = sendPlace.split('?')[0];
        switch (sendPlace) {
            default:
                let resp = JSON.parse(data);
                isLogged = 1;
                thisUser = resp[0];
                myGdpses = [];
                mytextures = [];
                myGdpses.push(resp[3][0]);
                mytextures.push(resp[3][1]);
                yourWikies = resp[3][2];
                wikiesMini = [];
                yourWikies.forEach(el => {
                    wikiesMini.push(el[0].toString());
                });
                p(profilePage());
                break;
            case 'newsPost'+sData[6]:
                let type = formData.get('gid')
                if (type == 0)
                    helperContent('gdps',formData.get('gdps'));
                else
                    helperContent('text',formData.get('gdps'));
                break;
            case 'writeAlarm'+sData[6]:
                Z('F45').remove();
                break;
            case 'report'+sData[6]:
                Z('1st').insertAdjacentHTML('beforeend',
                `<div id=debug style=position:absolute><h1 data-trans="reported">${getTrans('reported')}</h1></div>`
                );
                setTimeout(()=>{
                    Z('debug').remove();
                    Z('REPform').remove()
                }, 1000);
                break;
            case 'newGuide'+sData[6]:
                getGuide(data, formData.get('wikiId'));
                break;
            case 'newWiki'+sData[6]:
                gGuides(data);
                break;
            case 'editGuide'+sData[6]:
                getGuide(data, formData.get('wikiId'));
                break;
            case 'editWiki'+sData[6]:
                gGuides(data);
                break;
        };
        return false;
    })
    .catch((error)=>{returnError(error+servError)});

    return false;
},

sendLike = (id, channel, isComm = 0)=>{
    if (!isLogged)
        return alert(getTrans('needLogin'));

    Loading();
    let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
    helperRequest(`${sData[1]}like${sData[6]}`, data)
        .then((data)=>{
            if (!isComm)
                Z('likesCount' + id).innerText = data;
            else 
                Z('likesCountComm' + id).innerText = data;
            Loading(1);
        })
        .catch((error)=>{returnError(error+servError)});
},
sendDislike = (id, channel, isComm = 0)=>{
    if (!isLogged)
        return alert(getTrans('needLogin'));
    
    Loading();
    let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
    helperRequest(`${sData[1]}dislike${sData[6]}`, data)
        .then((data)=>{
            if (!isComm)
                Z('likesCount' + id).innerText = data;
            else 
                Z('likesCountComm' + id).innerText = data;
            Loading(1);
        })
        .catch((error)=>{returnError(error+servError)});
},
sendComm = (id, channel)=>{
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
    let text = Z('text').value;
    let data =
        'ide='     + encodeURIComponent(id)
    + '&type=' + encodeURIComponent(channel)
    + '&text=' + encodeURIComponent(text);
    helperRequest(`${sData[1]}comment${sData[6]}`, data)
        .then((data)=>{
            let resp = JSON.parse(data);

            innerComments(renderComms(resp,typeC,dataForNextButton), 0);
            Loading(1);
        })
        .catch((error)=>{returnError(error+servError)});
},
deleteComm = (id, channel)=>{
    Loading();
    helperRequest(`${sData[4]}comment${sData[6]}?ide=${id}&type=${channel}`)
        .then((data)=>{
            Loading(1);
            if (data == '-1')
                return returnError('Access denied');
            Z('comm'+data).remove();
        })
        .catch((error)=>{returnError(error+servError)});
},
deleteNews = (id, goBack)=>{
    Loading();
    helperRequest(`${sData[4]}newsPost${sData[6]}?ide=${id}`)
        .then((data)=>{
            Loading(1);
            if (data == '-1')
                return returnError('Access denied');
            Z('news'+data).remove();
            goBack ? history.back() : null;
        })
        .catch((error)=>{returnError(error+servError)});
},
helperContent = (type, id, otherData = 0)=>{
    let commType = 0;
    let backFunc = '';
    switch (type) {
        case 'gdps':
			type = 'camp';
            backFunc = 'pageList())';
            setLink('?'+'camp='+id);
            p(GDPSpreload(`${id},0`, backFunc));
            break;
        case 'text':
            commType = 1;
            backFunc = 'pageText())';
            setLink('?'+'show='+id);
            p(GDPSpreload(`${id},0`, backFunc));
            break;
        case 'guid':
            commType = 3;
            backFunc = 'pageGuid())';
            p(contentPreload(`${id},${commType}`, backFunc));
            break;
        case 'newsC':
            commType = 2;
            backFunc = `gdpsNewsPage(${otherData}));helperContent('gdps', ${otherData})`;
            setLink('?'+'newsC='+id+'.'+otherData);
            p(contentPreload(`${id},${commType}`, backFunc));
            break;
    };
    Loading();
    helperRequest(`${sData[0]}${type}${sData[6]}?id=${id}`)
        .then((data)=>{
			if (type === 'camp')
				type = 'gdps';
            if (data == '["NONE"]') {
                Loading(1);
                if (type == 'text')
                    p(pageText());
                else
                    p(pageList());
                megaAlert('CONTENTISNULL');
                return;
            }
            let dataForNextButton = `${id},'${type}',1`;

            Loading(1);
            let resp = JSON.parse(data);
            let insert = '';
            switch (type) {
                case 'gdps':
                    insert = GDPSrender(resp);
                    innerComments(renderComms(resp.comments,3,dataForNextButton), 0);
                    Z('news').innerHTML = RenderNews(resp.news,0,'mini');
                    break;
                case 'text':
                    insert = TEXTrender(resp);
                    innerComments(renderComms(resp.comments,3,dataForNextButton), 0);
                    Z('news').innerHTML = RenderNews(resp.news,0,'mini');
                    break;
                case 'newsC':
                    insert = RenderNews(resp.gdps,1);
                    innerComments(renderComms(resp.comments,5,dataForNextButton), 0);
                    break;
            };
            Z('insertable').innerHTML = insert;
        })
        .catch((error)=>{returnError(error+servError)});
},
helperComments = (postId, type, page = 0)=>{
    Z('nextGdps').remove();
    let typeC = 0;
    let dataForNextButton = `${postId},'${type}',${parseInt(page + 1)}`;
    switch (type) {
        case 'gdps':    type = 0; typeC = 3;    break;
        case 'text':    type = 1; typeC = 4;    break;
        case 'guid':    type = 3; typeC = 6;    break;
        case 'news':    type = 2; typeC = 5;    break;
        case 'newsC':     type = 2; typeC = 5;    break;
    };
    Loading();
    helperRequest(`${sData[0]}fetchComms${sData[6]}?id=${postId}&type=${type}&page=${page}`)
        .then((data)=>{
            Loading(1);
            let resp = JSON.parse(data);
            innerComments(renderComms(resp,typeC,dataForNextButton), 1);
        })
        .catch((error)=>{returnError(error+servError)});
},
helperNews = (gdpsId)=>{
    p(gdpsNewsPage(gdpsId));
    Loading();
    helperRequest(`${sData[0]}news${sData[6]}?id=${gdpsId}`)
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
        .catch((error)=>{returnError(error+servError)});
},
sendRegisterForm = ()=>{
    let username = Z('LGusername').value;
    let password = Z('LGpassword').value;
    let email    = Z('LGemail'     ).value;
    let hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha) {
        Loading();
        helperRequest(
            `${sData[2]}register${sData[6]}`,
            `username=${username}&password=${password}&email=${email}`+
            `&g-recaptcha-response=${hcaptcha}&h-captcha-response=${hcaptcha}`
        )
        .then(data => {
            Loading(1);
            switch (data) {
                case '-1':
                    megaAlert('loginClaimed');
                    break;
                case '-2':
                    megaAlert('captchaDed');
                    break;
                default:
                    isLogged = 1;
                    let resp = JSON.parse(data);
                    isLogged = 1;
                    thisUser = resp[0];
                    GDPSes = resp[1];
                    Textures = resp[2];
                    myGdpses = [];
                    mytextures = [];
                    myGdpses.push(resp[3][0]);
                    mytextures.push(resp[3][1]);
                    yourWikies = [];
                    yourWikies = resp[3][2];
                    wikiesMini = [];
                    yourWikies.forEach(el => {
                        wikiesMini.push(el[0].toString());
                    });
                    dropLogin(1);
                    localStorage.oschubUser = thisUser[5];
                    thisUser.pop();
            }
        })
        .catch((error)=>{returnError(error+servError)});
    } else {
        megaAlert('captchaDed');
    };
},
sendLoginForm = ()=>{
    let username = Z('LGusername').value;
    let password = Z('LGpassword').value;
    let hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha) {
        Loading();
        helperRequest(
            `${sData[2]}login${sData[6]}`,
            `username=${username}&password=${password}`+
            `&g-recaptcha-response=${hcaptcha}&h-captcha-response=${hcaptcha}`
        )
        .then(data => {
            Loading(1);
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
                    isLogged = 1;
                    let resp = JSON.parse(data);
                    isLogged = 1;
                    thisUser = resp[0];
                    GDPSes = resp[1];
                    Textures = resp[2];
                    myGdpses = [];
                    mytextures = [];
                    myGdpses.push(resp[3][0]);
                    mytextures.push(resp[3][1]);
                    yourWikies = [];
                    yourWikies = resp[3][2];
                    wikiesMini = [];
                    yourWikies.forEach(el => {
                        wikiesMini.push(el[0].toString());
                    });
                    dropLogin(1);
                    localStorage.oschubUser = thisUser.slice(5);
                    thisUser.pop();
            }
        })
        .catch((error)=>{returnError(error+servError)});
    } else {
        megaAlert('captchaDed');
    };
},
sendDrop = ()=>{
    let username = Z('LGusername').value;
    let password = Z('LGpassword').value;
    let email    = Z('LGemail'     ).value;
    Loading();
    helperRequest(
        `${sData[2]}drop${sData[6]}`,
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
    .catch((error)=>{returnError(error+servError)});
},
gLogout = ()=>{
    Loading();
    helperRequest(sData[2]+'logout'+sData[6])
        .then(()=>{
            Loading(1);
            thisUser = ['???',0,0,0,0,'',/*helperVer*/];
            localStorage.removeItem("oschubUser");
            token = undefined;
            isLogged = 0;
            p(pageList());
        })
        .catch((error)=>{returnError(error+servError)});
},
returnError = (err)=>{
    console.log(err);
    document.body.insertAdjacentHTML('beforeend',
        `<div id=debug>
            <p align=center style=margin:0>DEBUG INFO</p>
<pre style=background-color:#000>
LOCATION:${location}
USERID:${thisUser[1]}</pre>
            ERROR<br>
            <div id=debug2 style=background-color:#000></div>
            <br><br>
            <center>
                <button style=background-color:#333 onclick="location.search=''">
                    FULL RESTART
                </button>
                <button style=background-color:#333 onclick=reStart()>
                    RESTART
                </button><br>
                <button style=background-color:#333 onclick=linkCopy(Z('debug').innerText)>
                    COPY ERROR
                </button>
            </center>
        </div>`
    );
    Z('debug2').innerText = err;
},
servError = "\n\nSERVER RESP:\n\n    +xhr.response",
helperRequest = (url, data = '')=>{
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let method = 'GET';
        if (data !== '') 
            method = 'POST';

        xhr.open(method, url);
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState === 4 && xhr.status === 200) {
                servError = "\n\nSERVER RESP:\n\n"+xhr.response;
                resolve(xhr.response);
            }
        };
// .catch((error)=>{returnError(error+servError)})
        xhr.onerror = ()=>{
            reject(new Error('Network error'), xhr);
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
ADwrite = (userId, inputText = '')=>{
    let html = 
    `<div class=framemenu id=F45>`+
        `<h1>Write Alarm!!!</h1>`+
        `<form onsubmit="return enterFormData(this,'writeAlarm${sData[6]}')">`+
            (userId == 0 ?
                `<input placeholder="userId (not username)" class=framelabel name=user><br>` :
                `<input name=user value=${userId} type=hidden>`
            )+
            `<input placeholder=title class=framelabel name=title value="${inputText}"><br>`+
            `<textarea placeholder=text class=framelabel name=text></textarea><br>`+
            `<button onclick="Z('F45').remove()" class=loginbtn>close</button>`+
            `<input type=submit value=send class=loginbtn>`+
        `</form>`+
    `</div>`;
    Z('1st').insertAdjacentHTML('beforeend', html);
},
DCgdpses = (textContent)=>{
    return Z('gdpses').insertAdjacentHTML('beforeend', textContent);
},
DCtextures = (textContent)=>{
    return Z('textures').insertAdjacentHTML('beforeend', textContent);
},
ADrender = (array, type = 'g')=>{
    let html = '';

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
    } else if (type == 't') {
        html += 
        `<td>`+
            `<button class=loginbtn onclick=AtextEDIT(${array[0]})>Edit TEXT</button>`+
        `</td>`;
    };

    html += `<td>${array[1]}</td>`;
    html += `</tr>`;

    return html;
},
AsendWeekly = ()=>{
    let id = Z('framelabel').value;
    Loading();
    helperRequest(`${sData[2]}Aaction${sData[6]}?weekly=${id}`)
        .then(() => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            alert('DONE');
        })
        .catch((error)=>{returnError(error+servError)});
},
Aaction = (userId, id, type, action)=>{
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
    helperRequest(`${sData[2]}Aaction${sData[6]}?id=${id}&type=${type}&action=${action}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            let t = '';
            switch (type) {
                case 0:
                    t = 'g';
                    break;
                case 1:
                    t = 't';
                    break;
                case 2:
                    t = 'h';
                    break;
            }
            
            if (data == '1')
                console.log(Z('A'+t+id).innerHTML = 1);
            if (data == '-1')
                console.log(Z('A'+t+id).innerHTML = -1);
            if (data == '-2')
                console.log(Z(t+id).remove());
        })
        .catch((error)=>{returnError(error+servError)});
},
AgdpsEDIT = (id)=>{
    Z('gdpsframe').style.display = 'block';
    Z('sendgdps').value = id;
    let errei = findSubarrayById(id, ADgdpses);
    let tagz = JSON.parse(errei[2]);
    let oz = JSON.parse(errei[3]);

    let chkb = document.querySelectorAll('input[type="checkbox"][name="tags"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });

    chkb = document.querySelectorAll('input[type="checkbox"][name="os"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });
    
    chkb = null;
    
    for (let i = 0; i < tagz.length; i++) {
        console.log('t'+tagz[i]);
        if (Z('tag'+tagz[i]))
            Z('tag'+tagz[i]).checked = true;
    };

    for (let i = 0; i < oz.length; i++) {
        console.log('o'+oz[i]);
        if (Z('os'+oz[i]))
            Z('os'+oz[i]).checked = true;
    };
},
AtextEDIT = (id)=>{
    Z('textframe').style.display = 'block';
    Z('sendtext').value = id;
    let errei = findSubarrayById(id, ADtextures);
    let tagz = JSON.parse(errei[2]);
    let oz = JSON.parse(errei[3]);

    let chkb = document.querySelectorAll('input[type="checkbox"][name="tagz"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });

    chkb = document.querySelectorAll('input[type="checkbox"][name="oz"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });
    
    chkb = null;
    
    for (let i = 0; i < tagz.length; i++) {
        console.log('t'+tagz[i]);
        if (Z('tak'+tagz[i]))
            Z('tak'+tagz[i]).checked = true;
    };

    for (let i = 0; i < oz.length; i++) {
        console.log('o'+oz[i]);
        if (Z('oz'+oz[i]))
            Z('oz'+oz[i]).checked = true;
    };
},
findSubarrayById = (id, arrat)=>{
    for (var i = 0; i < arrat.length; i++) {
        if (arrat[i][0] === id) {
            return arrat[i];
        }
    }
    return null; // Возвращаем null, если подмассив с заданным id не найден
},
Asend = (type, id)=>{
    let tags = '';
    let os = '';

    if (type == 0) {
        Z('gdpsframe').style.display = 'none';
        tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tags"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="os"]:checked'))
            .map(checkbox => checkbox.value));
    } else {
        Z('textframe').style.display = 'none';
        tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tagz"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="oz"]:checked'))
            .map(checkbox => checkbox.value));
    }

    Loading();
    helperRequest(`${sData[2]}Aedit${sData[6]}?id=${id}&type=${type}&tags=${tags}&os=${os}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            alert('DONE FOR '+id);
        })
        .catch((error)=>{returnError(error+servError)});
},
Ptype = 0,

adminPanel = ()=>{
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
        `</div><br>`+
    `</div>`+
    `<div id=gdpsframe class=frameprofile style=position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:none>`+
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
        `<br><button onclick="Z('gdpsframe').style.display='none'" class=loginbtn>close</button>`+
        `<button onclick="Asend(0,this.value)" id=sendgdps value=0 class=loginbtn>send</button>`+
    `</div>`+
    `<div id=textframe class=frameprofile style=position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:none>`+
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
        `<br><button onclick="Z('textframe').style.display='none'" class=loginbtn>close</button>`+
        `<button onclick="Asend(1,this.value)" id=sendtext value=0 class=loginbtn>send</button>`+
    `</div>`;
    p(html);
    Loading();
    helperRequest(`${sData[2]}!takeAll${sData[6]}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);

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
            Ptype = 1;
            for (let i = 0; i < ADtextures.length; i++) {
                DCtextures(ADrender(ADtextures[i], 't'));
            }
        })
        .catch((error)=>{returnError(error+servError)});

},
timeout = null;

if (!localStorage.getItem('oschubLang') || localStorage.getItem('oschubLang') == 'Ru') {
    mainLang = 'RU';
    localStorage.setItem('oschubLang', 'RU');
};

window.addEventListener('popstate', ()=>{
    ignore = true;
    getLink();
});

window.addEventListener('input', function() {
    let input = Z('framelabel').value
    clearTimeout(timeout);
    if (input != '') {
        timeout = setTimeout(() => {
            sendFinder();
        }, 300);
    }
});

reStart();
