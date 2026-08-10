// #region Action Write
/*
 * Action Write - полу-ручная система тестирования
 * Ходит по критичным флоу через [aw-actname] атрибуты, репортит в плавающее окно
 */

let awScenarios = {}, // { name: [ {action, target, value, expect} ] }
	awResults = {},    // { name: { status: 'pending'|'pass'|'fail', log: [] } }
	awWindow = '',
	awContext = {},
	awStepsToast = new _.toast(
		'aw-steps',
		_.$.id('alerts'), // или другой manager-контейнер, если хочешь их отдельно от обычных ошибок
		0, // 0 = не закроется сам, только через close()
		`class=framegdpsOld style="width:fit-content;border:solid var(--color-window) 1px;border-radius:var(--def-border-small)"`,
		'ANIM-create',
		'ANIM-stop'
	);
awStepsToast.generateDOM = (wId, content) => `<div>${content}</div>`.replace(/\{winId\}/g, wId);

let awStepWinIds = {}; // { scenarioName: [winId, winId, ...] } - все тосты шагов текущего прогона

awRegister = (name, steps) => {
	awScenarios[name] = steps;
};

awFindTarget = (target) => document.querySelector(`[aw-actname="${target}"]`);

awWait = (ms) => new Promise(r => setTimeout(r, ms));

awWaitFor = async (target, timeoutMs = 3000) => {
	let waited = 0;
	while (waited < timeoutMs) {
		let el = awFindTarget(target);
		if (el) return el;
		await awWait(100);
		waited += 100;
	}
	return null;
};

awRunStep = async (step) => {
	// action, которым не нужен target
	if (step.action === 'wait-form-success') {
		let resultData = await awWaitForFormSuccess(step.sendPlace, step.timeout || 3000);
		if (resultData === null)
			return { ok: false, msg: `не дождались aw:form-success для ${step.sendPlace}` };
		awContext[step.saveAs || 'lastResult'] = resultData;
		return { ok: true, msg: `форма отправлена успешно, data: ${resultData}` };
	}
	if (step.action === 'assert-exists-dynamic') {
		let dynTarget = step.buildTarget(awContext);
		let dynEl = document.getElementById(dynTarget);
		if (dynEl) return { ok: true, msg: `динамический элемент ${dynTarget} найден` };
		return { ok: false, msg: `динамический элемент ${dynTarget} не найден` };
	}
	if (step.action === 'wait') {
		await awWait(step.value || 500);
		return { ok: true, msg: `пауза ${step.value || 500}мс` };
	}
	// всё что ниже - действия требующие target
	let el = await awWaitFor(step.target);
	if (!el) return { ok: false, msg: `не найден элемент: ${step.target}` };
	switch (step.action) {
		case 'click':
			el.click();
			return { ok: true, msg: `клик по ${step.target}` };
		case 'type':
			el.value = step.value;
			el.dispatchEvent(new Event('input', { bubbles: true }));
			return { ok: true, msg: `ввод "${step.value}" в ${step.target}` };
		case 'select':
			el.value = step.value;
			el.dispatchEvent(new Event('change', { bubbles: true }));
			return { ok: true, msg: `выбор "${step.value}" в ${step.target}` };
		case 'assert-exists':
			return { ok: true, msg: `элемент ${step.target} существует` };
		case 'assert-text':
			if (el.textContent.includes(step.value))
				return { ok: true, msg: `текст совпал: "${step.value}"` };
			return { ok: false, msg: `текст не совпал, ожидалось "${step.value}", получено "${el.textContent}"` };
		default:
			return { ok: false, msg: `неизвестное действие: ${step.action}` };
	}
};

awWaitForFormSuccess = (expectedSendPlace, timeoutMs = 3000) => {
	return new Promise((resolve) => {
		let timer = setTimeout(() => {
			document.removeEventListener('aw:form-success', handler);
			resolve(null);
		}, timeoutMs);

		function handler(e) {
			if (e.detail.adde === expectedSendPlace) {
				clearTimeout(timer);
				document.removeEventListener('aw:form-success', handler);
				resolve(e.detail.data);
			}
		}

		document.addEventListener('aw:form-success', handler);
	});
};

awRunScenario = async (name) => {
	let steps = awScenarios[name];
	if (!steps) return;
	awContext = {};
	awResults[name] = { status: 'pending', log: [] };
	awStepWinIds[name] = [];
	awRenderTable();
	for (let step of steps) {
		let result = await awRunStep(step);
		awResults[name].log.push({ step, result });
		let color = result.ok ? 'green' : 'red';
		let toastId = awStepsToast.open(`<span style="color:${color}">${step.action} → ${result.msg}</span>`);
		awStepWinIds[name].push(toastId);
		if (!result.ok) {
			awResults[name].status = 'fail';
			awRenderTable();
			return;
		}
	}
	awResults[name].status = 'pass';
	awRenderTable();
	// все тосты шагов умирают если тест успешный
	awStepWinIds[name].forEach(id => awStepsToast.close(id));
	awStepWinIds[name] = [];
};

awRunAll = async () => {
	for (let name in awScenarios)
		await awRunScenario(name);
};

// #region UI
awOpenMainWindow = () => {
	let winId = _.win.open('action-write',
		`<p>АВТОР КОДА ACTION WRITE - CLAUDE, эта система может очень сильно сбоить</p>
		<div id=aw-table-holder></div>
		${basicButton('>RUN ALL<', `awRunAll()`)}`,
	'style=width:300px;height:400px');
	awWindow = winId;
	awRenderTable();
};

awRenderTable = () => {
	let holder = document.getElementById('aw-table-holder');
	if (!holder) return;

	let rows = Object.keys(awScenarios).map(name => {
		let res = awResults[name] || { status: 'не запущен' };
		let color = res.status === 'pass' ? 'green' : res.status === 'fail' ? 'red' : 'gray';
		return `<tr>
			<td>${name}</td>
			<td style="color:${color}">${res.status}</td>
			<td>${basicButton('>RUN THIS<', `awRunScenario('${name}')`)}</td>
		</tr>`;
	}).join('');

	holder.innerHTML = `<table border=1><tr><th>тест</th><th>статус</th><th></th></tr>${rows}</table>`;
};
//
// #endregion
// #endregion

awRegister('publish-news', [
	{ action: 'click', target: 'aw-header-news' },
	{ action: 'type', target: 'aw-news-title', value: 'AW тестовая новость' },
	{ action: 'type', target: 'aw-news-text', value: 'Текст автотеста, можно удалить' },
	{ action: 'click', target: 'aw-news-submit' },
	{
		action: 'wait-form-success',
		sendPlace: sData[1] + 'newsPost' + php,
		saveAs: 'newsId',
	},
	{ action: 'wait', value: 500 },
	{
		action: 'assert-exists-dynamic',
		buildTarget: (ctx) => 'news' + ctx.newsId,
	},
]);
