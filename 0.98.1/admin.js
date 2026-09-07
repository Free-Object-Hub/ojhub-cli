adminPanel = (jId)=>{
	let J = Jexec(jId);
    J.link.set('admin');
    let html = pHeader(jId)+
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
                `<tbody id="wikis">`+
                `</tbody>`+
            `</table>`+
        `</div><br>`+
        `<div style="background-color:#000000;height:300px;overflow:auto">`+
            `<table>`+
                `<tbody id="vacs">`+
                `</tbody>`+
            `</table>`+
        `</div>`+
    `</div>`;
    innerMain(jId, html);
    Loading();
    _.http.req('GET', `${sData[2]}!newTakeAll${php}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return document.body = null // код точно упадёт

            let gdpsTab = '<tr style=position:sticky;top:2px;background-color:#000>'+
                '<th class=tR>ID</th>'+
                '<th class=tR>Avatar</th>'+
                '<th class=tR>Checked</th>'+

				// слой действий
                '<th class=tR>Activate</th>'+
                '<th class=tR>Ban</th>'+
                '<th class=tR>Delete</th>'+
                '<th class=tR>SuperAction</th>'+

                '<th class=tR>Name</th>'+
            '</tr>',
			leGdps = gdps=>`<tr id=g${gdps.ID}>
				<td>${gdps.ID}</td>
				<td><img loading=lazy width=40px height=40px src="${gdps.img}" onerror=this.src='./imgs/hubbig.png'></td>
				<td id=Ag${gdps.ID}>${gdps.checked}</td>
				<td>${basicButton('>Activate<', `Aaction(${jId},${gdps.ID},'0','activate')`)}</td>
				<td>${basicButton('>Ban<', `Aaction(${jId},		${gdps.ID},'0','ban')`)}</td>
				<td>${basicButton('>Delete<', `Aaction(${jId},	${gdps.ID},'0','delete')`)}</td>
				<td>${basicButton('>Open<', `getFind(openJail(),${gdps.channel},${gdps.ID})`)}</td>
				<td>${gdps.title}</td>
			</tr>`,

			// остальные рендеры не готовы
            wikiTab = '<tr style=position:sticky;top:2px;background-color:#000>'+
                '<th class=tR>ID</th>'+
                '<th class=tR>Avatar</th>'+
                '<th class=tR>Checked</th>'+

				// слой действий
                '<th class=tR>Activate</th>'+
                '<th class=tR>Ban</th>'+
                '<th class=tR>Delete</th>'+
                '<th class=tR>SuperAction</th>'+

                '<th class=tR>Name</th>'+
            '</tr>',
			leWiki = gdps=>`<tr id=w${gdps.ID}>
				<td>${gdps.ID}</td>
				<td><img loading=lazy width=40px height=40px src="${gdps.img}" onerror=this.src='./imgs/hubbig.png'></td>
				<td id=Aw${gdps.ID}>${gdps.checked}</td>
				<td>${basicButton('>Activate<', `Aaction(${jId},${gdps.ID},'-1','activate')`)}</td>
				<td>${basicButton('>Ban<', `Aaction(${jId},		${gdps.ID},'-1','ban')`)}</td>
				<td>${basicButton('>Delete<', `Aaction(${jId},	${gdps.ID},'-1','delete')`)}</td>
				${false ? `FIXME: сделать нормальную функцию для получения списка всех статей с игнором поля checked` : ''}
				<td>${basicButton('>Open<', `pageGuides(openJail(),${gdps.ID})`)}</td>
				<td>${basicButton('>Open2<', `ageGuides(openJail(),${gdps.ID})`)}</td>
				<td>${gdps.title}</td>
			</tr>`,

            vacsTab = '<tr style=position:sticky;top:2px;background-color:#000>'+
                '<th class=tR>ID</th>'+
                '<th class=tR>GdpsId</th>'+
                '<th class=tR>Checked</th>'+

				// слой действий
                '<th class=tR>Activate</th>'+
                '<th class=tR>Ban</th>'+
                '<th class=tR>Delete</th>'+
                '<th class=tR>SuperAction</th>'+

                '<th class=tR>Title</th>'+
            '</tr>',
			leVac = gdps=>`<tr id=v${gdps.ID}>
				<td>${gdps.ID}</td>
				<td>${gdps.gdpsId}</td>
				<td id=Av${gdps.ID}>${gdps.checked}</td>
				<td>${basicButton('>Activate<', `Aaction(${jId},${gdps.ID},'-5','activate')`)}</td>
				<td>${basicButton('>Ban<', `Aaction(${jId},		${gdps.ID},'-5','ban')`)}</td>
				<td>${basicButton('>Delete<', `Aaction(${jId},	${gdps.ID},'-5','delete')`)}</td>
				<td>${basicButton('>Open<', `getVacsWithComments(openJail(),${gdps.ID})`)}</td>
				<td>${gdps.title}</td>
			</tr>`,

			serverResp = JSON.parse(data);
			let [gdpsesEl, wikisEl, vacsEl] = [J.id('gdpses'), J.id('wikis'), J.id('vacs')];
			let [renderedGdpses, renderedWikis, renderedVacs] = ['','',''];

			for (let g of serverResp[0]) renderedGdpses += leGdps(g);
			gdpsesEl.innerHTML = gdpsTab + renderedGdpses;

			for (let w of serverResp[1]) renderedWikis += leWiki(w);
			wikisEl.innerHTML = wikiTab + renderedWikis;

			for (let v of serverResp[2]) renderedVacs += leVac(v);
			vacsEl.innerHTML = vacsTab + renderedVacs;
        })
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};

ageGuides = function(jId, wiki, backButton = '') {
	// трюк чтобы начать грузить зависимость немедленно, dom операции как никак не выполняются за 0.00 мс
	_.lazy.load(scritpsUrl+'/publicWiki.js?ver='+scrLoadVer)
	// FIXME: на i9-14900k DOM операции выполняются за 0.00 мс
	let J = Jexec(jId);
	let page =
		`<div id=helperContent>`+
			basicButton('>BAN<', '', `WIKI.ban(${wiki})`)+
			basicButton('>UNBAN<', '', `WIKI.unban(${wiki})`)+
			basicButton('>DELETE<', '', `WIKI.delete(${wiki})`)+
			basicButton('>ISLGBT<', '', `WIKI.setlgbt(${wiki})`)+
			basicButton('>ISNTLGBT<', '', `WIKI.dellgbt(${wiki})`)+
			`<h1 align=center>`+
				`<span id=wikiName></span>`+
				` <span${getTrans('guides09')}/span>`+
			`</h1>`+
			`<div class=gdps-list-place id=wikiInner${wiki}></div>`+
		`</div>`;
	innerMain(jId, page);

	// делаем это чтобы гарантированно дождаться загрузки publicWiki модуля
	setTimeout(() => {
		helperRequest(`${sData[2]}!newTakeAll${php}?wiki=${wiki}`)
			.then(function(data) {
				let parsedData = JSON.parse(data),
					html = renderGuideMini(jId, parsedData);
				J.id('wikiInner'+wiki).innerHTML = html;
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});
	}, 10);
};

// бан/разбан/удаление
Aaction = (jId, id, contentType, action)=>{
	let J = Jexec(jId);
    Loading();
    _.http.req('GET', `${sData[2]}Aaction${php}?id=${id}&type=${contentType}&action=${action}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            let t = '';
            switch (parseInt(contentType)) {
                case 0:
                    t = 'g';
                    break;
                case -1:
                    t = 'w';
                    break;
                case -2:
                    t = 'p';
                    break;
                case -5:
                    t = 'v';
                    break;
            }
            
			console.log('A'+t+id, J.id('A'+t+id))
            if (data == '1')
                console.log(J.id('A'+t+id).innerHTML = 1);
            if (data == '-1')
                console.log(J.id('A'+t+id).innerHTML = -1);
            if (data == '-2')
                console.log(J.id(t+id).remove());
        })
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
// изменение тегов у гдпсов
AgdpsEDIT = (id)=>{
    getElement('gdpsframe').style.display = 'block';
    getElement('sendgdps').value = id;
    let errei = findSubarrayById(id, ADgdpses),
        tagz = JSON.parse(errei[2]),
        oz = JSON.parse(errei[3]),

        chkb = document.querySelectorAll('input[type="checkbox"][name="tags"]');
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
        if (getElement('tag'+tagz[i]))
            getElement('tag'+tagz[i]).checked = true;
    };

    for (let i = 0; i < oz.length; i++) {
        console.log('o'+oz[i]);
        if (getElement('os'+oz[i]))
            getElement('os'+oz[i]).checked = true;
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
    let Tags = '',
        os = '';

    if (type == 0) {
        getElement('gdpsframe').style.display = 'none';
        Tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tags"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="os"]:checked'))
            .map(checkbox => checkbox.value));
    } else {
        getElement('textframe').style.display = 'none';
        Tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tagz"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="oz"]:checked'))
            .map(checkbox => checkbox.value));
    }

    Loading();
    _.http.req('GET',`${sData[2]}Aedit${php}?id=${id}&type=${type}&tags=${Tags}&os=${os}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            alert('DONE FOR '+id);
        })
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
};// ###END_REGION
