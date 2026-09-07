let 
MediaRender = (comicText)=>{
	let comicArray = comicText.split('\n'),
	comicArr = {};

	if (comicArray.length <= 1)
		return `<div class=comicImage><img style=max-width:100% src=${comicText}></div>`;

	for (let i = 0; i < comicArray.length; i++) {
		comicArr['p'+i] = `<div class=comicImage id={winId}_p${i}><img style=max-width:100%;max-height:80vh src=${comicArray[i]}></div> `;
	};
	let comicStrPre = '';
	
	comicStrPre = Object.values(comicArr).join('');
	
	html = 
	`<div style=display:flex;flex-wrap:wrap;height:80vh>`+
		`<div class=backPage style=flex:10%>`+
			emptyButton('><div align=center style=font-size:calc(var(--def-font)*2)><</div><', `setPage('{winId}','p0')`, 'width:100%;height:100%', '{winId}_backPage')+
		`</div>`+
		`<div align=center style=flex:80%;align-content:center id={winId}_pagePlace>`+
			comicArr['p0']+
		`</div>`+
		`<div class=nextPage style=flex:10%>`+
			emptyButton('><div align=center style=font-size:calc(var(--def-font)*2)>></div><', `setPage('{winId}','p1')`, 'width:100%;height:100%', '{winId}_nextPage')+
		`</div>`+
	`</div>`+
	`<h1 class=gdps-list-place id={winId}_pageNum>1</h1>`+
	`<div style=display:none>${comicStrPre}</div>`;
	return html;
},
setPage = (comicId, pageId)=>{
	_.$.id(comicId+'_pagePlace').innerHTML = _.$.id(comicId+'_'+pageId).innerHTML;

	// логика кнопок, я хз как её насрал!!
	let pageNum = parseInt(pageId.slice(1)),
		pagePre = pageNum - 1,
		pageNxt = pageNum + 1;

	_.$.id(comicId+'_pageNum').innerHTML = pageNxt;
	if (_.$.id(comicId+'_p'+pagePre))
		_.$.id(comicId+'_backPage').setAttribute('onclick', `setPage('${comicId}','p${pagePre}')`);
	if (_.$.id(comicId+'_p'+pageNxt))
		_.$.id(comicId+'_nextPage').setAttribute('onclick', `setPage('${comicId}','p${pageNxt}')`);
},
wikiText = (jId, wikitext, depth = 0, counter = { n: 0 }) => {
    let J = Jexec(jId);
    if (!wikitext) return '';
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

    // ===== ФАЗА 1: LEXER =====
    const wtLex = (wikitext) => {
		const lines = wikitext.split('\n');
		const tokens = [];
		let i = 0;
		while (i < lines.length) {
			const line = lines[i];
			// таблица {| ... |}
			if (line.trim().startsWith('{|')) {
				const body = [line.replace('{|', '')];
				i++;
				while (i < lines.length && !lines[i].includes('|}')) {
					body.push(lines[i]);
					i++;
				}
				if (i < lines.length) {
					body.push(lines[i].replace('|}', ''));
					i++;
				}
				tokens.push({
					type: 'table',
					text: body.join('\n')
				});
				continue;
			}
			// заголовки
			const h4 = line.match(/^====(.+?)====$/);
			if (h4) {
				tokens.push({
					type: 'h',
					depth: 4,
					text: h4[1]
				});
				i++;
				continue;
			}
			const h3 = line.match(/^===(.+?)===$/);
			if (h3) {
				tokens.push({
					type: 'h',
					depth: 3,
					text: h3[1]
				});
				i++;
				continue;
			}
			const h2 = line.match(/^==(.+?)==$/);
			if (h2) {
				tokens.push({
					type: 'h',
					depth: 2,
					text: h2[1]
				});
				i++;
				continue;
			}
			// нумерованный пункт ##
			const oli = line.match(/^##\s*(.+)$/);
			if (oli) {
				tokens.push({
					type: 'li',
					ordered: true,
					text: oli[1]
				});
				i++;
				continue;
			}
			// маркированный пункт **
			const uli2 = line.match(/^\*\*\s*(.+)$/);
			if (uli2) {
				tokens.push({
					type: 'li',
					ordered: false,
					text: uli2[1]
				});
				i++;
				continue;
			}
			// нумерованный пункт #
			const oli1 = line.match(/^#\s*(.+)$/);
			if (oli1) {
				tokens.push({
					type: 'li',
					ordered: true,
					text: oli1[1]
				});
				i++;
				continue;
			}
			// маркированный пункт *
			const uli1 = line.match(/^\*\s*(.+)$/);
			if (uli1) {
				tokens.push({
					type: 'li',
					ordered: false,
					text: uli1[1]
				});
				i++;
				continue;
			}
			// пустая строка
			if (line.trim() === '') {
				tokens.push({ type: 'space' });
				i++;
				continue;
			}
			// обычная строка
			tokens.push({
				type: 'p',
				text: line
			});
			i++;
		}
		return tokens;
	};

    // ===== инлайн-разметка =====
    const wtInline = (text) => {
		text = text
			.replaceAll(/&#039;&#039;&#039;&#039;&#039;(.+?)&#039;&#039;&#039;&#039;&#039;/g, '<strong><em>$1</em></strong>')
			.replaceAll(/&#039;&#039;&#039;(.+?)&#039;&#039;&#039;/g, '<strong>$1</strong>')
			.replaceAll(/&#039;&#039;(.+?)&#039;&#039;/g, '<em>$1</em>')
			.replaceAll(/'''''(.+?)'''''/g, '<strong><em>$1</em></strong>')
			.replaceAll(/'''(.+?)'''/g, '<strong>$1</strong>')
			.replaceAll(/''(.+?)''/g, '<em>$1</em>')
			.replaceAll(/\[\[([^|\]]+?)\|(.+?)\]\]/g, `<a onclick="getCurrentGuideByTag(${jId},\'$1\')">$2</a>`)
			.replaceAll(/\[\[([^|\]]+?)\]\]/g, `<a onclick="getCurrentGuideByTag(${jId},\'$1\')">$1</a>`)
			.replaceAll(/\[(https?:\/\/[^\s\]]+)\s(.+?)\]/g, '<a href="$1">$2</a>')
			.replaceAll(/\[(https?:\/\/[^\s\]]+)\]/g, '<a href="$1">$1</a>');
		return text;
	};

    // ===== ФАЗА 2: RENDER =====
    const wtRender = (tokens) => {
		let html = '';
		let listBuf = null;
		const flushList = () => {
			if (!listBuf) return;
			const tag = listBuf.ordered ? 'ol' : 'ul';
			html += '<' + tag + '>';
			for (let j = 0; j < listBuf.items.length; j++) {
				const a = parseBlockAttrs(listBuf.items[j]);
				html += '<li' + a.cls + a.id + '>' +
					wtInline(a.text) +
					'</li>';
			}
			html += '</' + tag + '>';
			listBuf = null;
		};
		for (let i = 0; i < tokens.length; i++) {
			const t = tokens[i];
			if (t.type !== 'li') flushList();
			if (t.type == 'table') {
				const rows = t.text.split('|-').filter(row => row.trim());
				let tableHtml = '<table border="1">';
				rows.forEach(row => {
					tableHtml += '<tr>';
					const cells = row
						.split('|')
						.filter(cell => cell.trim());
					cells.forEach(cell => {
						if (cell.trim().startsWith('!')) {
							tableHtml += '<th>' +
								wtInline(cell.replace('!', '').trim()) +
								'</th>';
						}
						else {
							tableHtml += '<td>' +
								wtInline(cell.trim()) +
								'</td>';
						}
					});
					tableHtml += '</tr>';
				});
				tableHtml += '</table>';
				html += tableHtml;
			}
			else if (t.type == 'h') {
				const a = parseBlockAttrs(t.text);
				html += '<h' + t.depth + a.cls + a.id + '>' +
					wtInline(a.text) +
					'</h' + t.depth + '>';
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
				html += '<br>';
			}
			else if (t.type == 'p') {
				const a = parseBlockAttrs(t.text);
				html += (a.cls || a.id ? '<span' + a.cls + a.id + '>' : '')
					+ wtInline(a.text)
					+ (a.cls || a.id ? '</span>' : '')
					+ '<br>';
			}
		}
		flushList();
		return html;
	};

    // ===== ФАЗА 0: шаблоны =====
    const wtTemplates = (wikitext) =>
		wikitext.replace(
			/\{\{([^}|]+)(?:\|([^}]*))?\}\}/g,
			(match, templateName, argsStr) => {
				if (depth >= 6) {
					return '<div class="template-error">Превышена глубина вложенности шаблонов</div>';
				}
				if (counter.n >= 5000) {
					return '<div class="template-error">Превышен лимит вызовов шаблонов</div>';
				}
				try {
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
						wikiTextGen2(arg, depth + 1, counter)
					);
					return templateFunction(...providedArgs);
				} catch (error) {
					return `<div class="template-error">TEMPLATE FAIL: ${error.message}</div>`;
				}
			}
		);

    wikitext = wikitext.replace(/\\(.)/g, (match, char) =>
		'\u0000ESC' + char.charCodeAt(0).toString(16).padStart(4, '0') + '\u0000'
	);
    wikitext = wtTemplates(wikitext);
    const tokens = wtLex(wikitext);
    let html = wtRender(tokens);
    html = html.replace(/\u0000ESC([0-9a-fA-F]{4})\u0000/g, (m, hex) =>
		String.fromCharCode(parseInt(hex, 16))
	);
    return html;
},
getGuides = (jId, wikiId, page) => {
    let J = Jexec(jId);
    if (J.id('nextGdps'))
		J.id('nextGdps').remove();

    Loading();
    _.http.req('GET',`${sData[7]}getGuides${php}?wiki=${wikiId}&page=${page}`)
		.then(data=>{
			let parsedData = JSON.parse(data),
				page2 = page++,
				html = renderGuideMini(jId, parsedData, page2);
			innerGdpsPlace(jId, html,1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
falseGuideInWindow = (templateName)=>{
	let args = _.$.qa('[argument]'),
			argsList = [],
			method = _.$.id(templateName+'-method').value,
			content = _.$.id(templateName+'-content').value.replaceAll('\n', '\\n');
	if (args.length !== 0) {
		args.forEach(arg=>argsList.push(arg.value));
		console.log(templateName, content, argsList);
	} else
		args = '';
	content = content.replaceAll('&', '&amp;')
									 .replaceAll('<', '&lt;')
									 .replaceAll('>', '&gt;')
									 .replaceAll('"', '&quot;')
									 .replaceAll("'", '&#039;');
	let template = new Function(...argsList, 'return '+method+'(`'+content+'`)'),
			html = '',
			guidedata = [['False', template(...argsList)]];

	console.log(template.toString(), template(...argsList), guidedata[1]);
	guidedata.forEach(div=>{
		let content = '';
		switch (div[0]) {
			case 'MediaRender':
				content = MediaRender(div[1]);
				break;
			case 'wikiText':
				content = wikiText(jId, div[1]);
				break;
			default:
				content = Markdown(jId, div[1]);
				break;
		}
		html +=
		`<div class=frameguide>`+
			content+
		`</div><br>`;
	});
	let subWindowId = _.win.open('templateTest',
		`<div id=helperContent>
			<h1 id=title{winId}></h1>
			<div id=texts{winId}>${html}</div>
		</div>`
	, 'style=min-width:250px');
},
getCurrentGuideByTag = (jId, guideId) => {
    let J = Jexec(jId);
    getGuide(jId, guideId, J.globalWiki);
},
forumRenderMini = (jId, forumId, parsedData, page = 0) => {
    let J = Jexec(jId);
    page++;
    let html = '',
		Count = 0,
		preHtml = [],
		gdpsData = null;

    for (let Id in parsedData) {
		let guid = parsedData[Id];
		if (typeof guid !== 'object' && typeof guid === 'string') {
			J.id('insertable').innerHTML = '<h1>'+guid+` ${basicButton('>+<', `uploadPost(${jId},${forumId})`)}</h1>`;
			continue;
		}
		Count++;
		if (Count == 5) {
			innerGdpsPlace(jId, insertBtn(jId, `getForumPosts(${forumId},${page})`),-1);
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

		preHtml = [guid[1], '', '', 'width:300px;height:290px', -3, 9];
		html += contentRenderMinu(jId, gdpsData, preHtml, 1, 1, 0, 0);
	}
    return html;
},
forumRender = (jId, post) => {
    let J = Jexec(jId);
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

    html += contentRender(jId, gdpsData, gdpsData.date, 0, 9, '', 0, 0, gdpsData.ID, '');
    return html;
},
uploadPost = (jId, forumId) => {
    let J = Jexec(jId);
    if (J.q('[forumpost]'))
		return -1;
    let html = 
	`<div id=helperContentProfile>
		<h1 id=blacktext${getTrans('newPost')}/h1>
		<form method=post onsubmit="return enterFormData(${jId},this,'${sData[1]}forumPost${php}')">
			<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>
			<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>
			<input type=hidden name=forumId value=${forumId}>
			<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}
		</form>
	</div>`;
    return _.win.open('FORUMpost',
		html
	, 'forumpost');
};

renderGuideMini = (jId, parsedData, page = 0) => {
    let J = Jexec(jId);
    page++;
    let html = '',
		Count = 0,
		preHtml = [],

		gdpsData = null;

    for (let Id in parsedData) {
		let guid = parsedData[Id];
		if (!Array.isArray(guid)) {
			if (guid.ID != 0)
				innerGdpsPlace(jId, insertBtn(jId, `openForum(${jId},`+guid.ID+')', 'forumHas', 0),512);
			J.id('wikiName').innerHTML = guid.title;
			continue;
		}
		Count++;
		if (Count == 9) {
			innerGdpsPlace(jId, insertBtn(jId, `getGuides(${jId},${J.globalWiki},${page})`),-1);
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

		preHtml = [J.globalWiki, '', '', 'width:300px;height:300px', -2, 7];
		html += contentRenderMinu(jId, gdpsData, preHtml, 0, 0, 0, 0);
	}
    return html;
};

pageGuides = (jId, wiki, backButton = '') => {
    let J = Jexec(jId);
    if (backButton !== '')
		backButton = `<div class=gdps-forum><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button></div>`;

    if (typeof(wiki) === 'undefined')
		return pageWikiList(jId);
    J.globalWiki = wiki;
    let html = pHeader(jId)+
	`<div id=helperContent>`+
		`<h1 align=center>`+
			`<span id=wikiName></span>`+
			` <span${getTrans('guides09')}/span>`+
			(checkWikiOwn(wiki) ? ` <button class=loginbtn onclick="createGuide(${jId},`+wiki+')">+</button>' : '')+
		`</h1>`+
		backButton+
		`<div class=gdps-list-place id=GDPSesPlace>`+
		`</div>`+
	`</div>`;
    innerMain(jId, html);
    Loading();
    _.http.req('GET',`${sData[7]}getWiki${php}?wiki=${wiki}`)
		.then(data=>{
			let parsedData = JSON.parse(data);
			J.link.set('wiki='+wiki, parsedData[0].title);
			let html = renderGuideMini(jId, parsedData);
			innerGdpsPlace(jId, html);
			if (parsedData[0].color != '')
				wikiApplyColor(parsedData[0].color);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
getGuide = (jId, id, wikiId = 0) => {
    let J = Jexec(jId);
    J.globalWiki = wikiId;
    let html = pHeader(jId)+
		`<div id=helperContent class=guidePageLimiter>`+
			`<h1 id=title class=gdps-forum></h1>`+
			`<div id=texts></div>`+
			`<div id=innerEDIT class=gdps-forum><button class=loginbtn onclick="pageGuides(${jId},${wikiId})"${getTrans('back')}/button></div>`+
			`<div align=center style="margin:8px">`+
				contentSendCommForm(jId, id+',2,6')+
				`<div id=comments>`+
				`</div>`+
			`</div>`+
		`</div>`;
    innerMain(jId, html);
    Loading();
    _.http.req('GET',`${sData[7]}getGuide${php}?id=${id}&wiki=${wikiId}`)
		.then(data=>{
			if (data == '["NONE"]') {
				megaAlert(jId, 'CONTENTISNULL');
				Loading(1);
				return;
			}
			console.log(JSON.parse(data));
			let parsedData = JSON.parse(data),
				guideinfo = parsedData['guideinfo'],
				guidedata = parsedData['guidedata']
				comments = parsedData['comments'],
				templates = parsedData['templates'],
				html = '';
			J.link.set('wikiPage='+id+'.'+wikiId, guideinfo[1]);

			if (!wikiTemplates[wikiId])
				wikiTemplates[wikiId] = {};

			if (Object.keys(templates).length !== 0)
				for (let template in templates) {
					if (!wikiTemplates[wikiId].hasOwnProperty(template)) {
						let t = templates[template],
						doneCode = t[1]
							.replaceAll('&', "&amp;")
							.replaceAll('<', "&lt;")
							.replaceAll('>', "&gt;")
							.replaceAll('"', "&quot;")
							.replaceAll("'", "&#039;");
						wikiTemplates[wikiId][template] = function(){};
						wikiTemplates[wikiId][template] = new Function(...t[0], 'return '+t[2]+'(`'+doneCode+'`)');
					}
				}

			J.id('title').innerHTML = guideinfo[1];
			if (guideinfo[3]) 
				J.id('title').insertAdjacentHTML('afterend', guideinfo[2]);
			if (guideinfo[4]) 
				wikiApplyColor(guideinfo[4]);

			let section = 0;
			guidedata.forEach((div)=>{
				let content = '';
				switch (div[0]) {
					case 'MediaRender':
						content = MediaRender(div[1]);
						break;
					case 'wikiText':
						content = wikiText(jId, div[1]);
						break;
					default :
						content = Markdown(jId, div[1]);
						break;
				}
				html +=
				`<div class=frameguide>`+
					basicButton('>.)<', `throwWikiInWindow(${jId},${wikiId},${id},${section})`, `position:absolute;right:12px`)+
					`<div style=margin:20px id="w${wikiId}-${id}-${section}-engine">`+
						content+
					`</div>`+
				`</div><br>`;
				section++;
			});
			html += guideinfo[2];

			J.id('texts').innerHTML = html;

			J.id('comments')
				.insertAdjacentHTML('beforeend',
					renderComms(jId, comments,2,`${id},2,1`)
				);
			openWikiSidebar(jId, wikiId, id);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};

throwWikiInWindow = (jId, wikiId, guidId, sectId)=>{
	let J = Jexec(jId);
	let html = e=>`<div align=left>${e}</div>`,
		win = _.win.open('wikiread',
			''
		, 'style=width:250px;height:400px'),
		text = (J.id(`w${wikiId}-${guidId}-${sectId}-engine`).innerHTML.replace(/\{winId\}/g,win));
	win.content.innerHTML = html(text);
};
openForum = (jId, forumId) => {
    let J = Jexec(jId);
    contentPreload(jId, '', '', 0, 0);
    Loading();
    helperRequest(`${sData[6]}getPosts${php}?id=${forumId}`)
		.then(data=>{
			J.link.set('forum='+forumId);
			Loading(1);

			let parsedData = JSON.parse(data),
				html = forumRenderMini(jId, forumId, parsedData);

			innerGdpsPlace(jId, html);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};
getForumPost = (jId, forumId, postId) => {
    let J = Jexec(jId);
    contentPreload(jId, `${postId},4`, `openForum(${jId},${forumId})`, 0, 0);

    Loading();
    helperRequest(`${sData[6]}getPost${php}?id=${postId}`)
		.then(data=>{
			if (data == '["NONE"]') {
				pageFind(jId, 0);
				megaAlert(jId, 'CONTENTISNULL');
				Loading(1);
				return;
			}
			J.link.set('forumPost='+forumId+'.'+postId);
			let dataForNextButton = `${postId},4,1`,
				serverResp = JSON.parse(data),
				html = '';

			html = forumRender(jId, serverResp.post);

			innerComments(jId, renderComms(jId, serverResp.comments, 4, dataForNextButton), 0);
			J.id('insertable').innerHTML = html;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};

openWikiSidebar = (jId, wikiId, guideId) => {
    let J = Jexec(jId);
    if (_.$.q(`[bus="${wikiId}-${guideId}"]`))
		return;
    let html = '<div style=display:grid;text-align:left>';
    let headers = _.$.qa('h1,h2,h3', _.$.id('texts'))
    for (let h in headers) {
		if (isNaN(parseInt(h)) == false) {
			elem = headers[h];
			elem.setAttribute('sidebar', h);
			let lvl = parseInt(elem.tagName[1]); // h1 -> 1, h2 -> 2, h3 -> 3
			html += `<a class=loginbtn style=margin-left:${(lvl-1)*14}px onclick="gotoHeading(${jId},${h},'{winId}')">${elem.textContent}</a>`;
		}
	}

    html += '</div>';
    if (headers.length > 0)
		_.win.open('wikisidebar',
			html,
		`bus=${wikiId}-${guideId} style=width:220px;height:400px`);
};
gotoHeading = (jId, headId, winId) => {
    let J = Jexec(jId);
    _.$.q(`[sidebar="${headId}"]`).scrollIntoView()
    if (window.innerWidth <= 1000)
		_.x10.get(winId).hide()
}
