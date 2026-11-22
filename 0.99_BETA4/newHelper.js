/*
 * Before you is the code of newHelper.js version 2.1.9,
 * A frontend library of super-light and powerful utilities.
 * The library is built on the basis of a factory
 * That begins with Intl.newHelper=function(namespace){...};
 * The reason for using Intl.newHelper is trivially simple
 * If in 2.1.0 I was polluting the global scope with one semi-flexible variable
 * And a couple of addEventListener,
 * Then why not start abandoning global scope pollution
 * when downloading the library as such
 * And yes, to initialize newhelper you actually need to write
 * Intl.newHelper(yourVar) for newHelper to appear in window.yourVar
 * 
 * Comment style
 * FIXME - strange function behavior that would be desirable to redo
 *         or just notes for myself for the future
 * HMM - requires clarification
 * !!! - pay attention
 * See also - read for understanding how it's built
 *
 * 
 * HMM: consider switching to es6 export instead of nesting the factory into Intl
 * HMM: consider redoing windows as an iife factory
 * 
 * Modules that came with the 2.1 release:
 * link
 * lazy
 * lang
 * http
 * html
 * storage
 * err
 * hotkeys
 * win (+wins)
 *
 * Modules removed after 2.1 (look for polyfills at the end of the file):
 * $
 *
 * New modules, preparing for release in 2.2
 * their api may be slightly unstable
 * link (patched, see window[_].link.get => dynamic)
 * form
 * pipe/pipeAsync
 * drag (ported from win._initDrag)
 * fade (ported from win._animate)
 * x10 (x window system - ported and refactored from pieces of win)
 * toast

 *
 * Modules whose names are reserved for 2.3++
 * don't use their namespaces for plugins:
 * filezone
 * ikarus
 * tables
 * resize
 *
 * Plugins, a new pattern I want to legitimize in 2.2
 * It's not _.use(), not _.plugins, not prototype mutation
 * Just a simple assignment _.myPlugin = pluginFabric(_);
 * (where _ is the already-called core factory)
 * How is it supposed to work? same as Intl.newHelper(namespace)
 * The plugin factory returns an object, method, or class, or whatever you need
 * To plug in a plugin you just need to give the plugin a namespace inside the core
 * And call the factory, that's it!
 *
 * About the tables module!!!!
 * I removed it because I fucking don't need to create a second window engine
 * This bitch would have taken me another 200-400 lines just to become
 * a "good alternative" to conditional react-tables or datatables
 * If I do want to do it again then wait for 2.4, maybe by then I'll be smart enough
 * To figure out how to do it right, and in my own way
 * And right now, let this scum burn in hell, there's no place for half-finished shit in the core of unix.js
 *
 * And if you really need newhelper tables
 * Be so kind as to check the 2.1.6 sources on npm
 * Or build your own tables via innerHTML or window[_].html
 * Whichever is more convenient for you, take it
 *
 * I (MIOBOMB) want to release 2.2 already after 2.1.8,
 * because ideally I want to finish toasts and Object Hub 0.98
 */

// deprecated!!
/** @import { NewHelper } from './newHelper.d.ts' */
Intl.newHelper=function(_='_') {
	if (!window[_])
		window[_] = {};

	window[_].ver = '2.1.9';

	window[_].link = {
		/*
		 * LINKS MODULE
		 * Author: MIOBOMB (2023-2026)
		 * Last patch: 2.1.7
		 * 
		 * Works on the principle of [link, commands...]
		 * Example: ?home&debug&lang=ru
		 *          ^^^^ ^^^^^^^^^^^^^
		 *      page  commands
		 * 
		 * During development of the 2.0 core in Object hub I understood
		 * That commands can be very useful for debugging
		 * But in theory you can hang all modal and other actions on them
		 * 
		 * !!!: inside the get() function all the routing works, including nested for pages
		 * !!!: please, treat this module not as a "component model"
		 *      or whatever you have in reactive web.
		 *      But treat it as a server-side router,
		 *      you can make pretty and adequate routes after all.
	   	 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/History_API
		 */
		basePage: ()=>{},
		defTitle: '',
		actions: {},
		commands: {},

		_i: true, // _i - pushState blocker in set()
		_pop() {
			/*
			 * Popstate engine
			 *
			 * It's made for preserving commands in history
			 * This is a unique feature of newHelper.js
			 *
			 * Why did I make command preservation?
			 * It grew out of the needs of object hub
			 * For me it's a need to preserve
			 * debug states in the url
			 * or call one-shot functions, for example:
			 * - calling a modal with specific data (&user=1)
			 * - changing SPA settings by command (language, theme...)
			 * - 
			 * - resetting localStorage
			 * for you it can be anything
			 * but if you don't need it - link.popInit=true
			 *
			 * popstate fires when:
			 * - the user jumps back/forward through history
			 * - we call history.pushState (not replaceState)
			 * 
			 * _i distinguishes these cases:
			 * true = user jumped back
			 * false = the page writes its own address into the link
			 */
			// HMM: some browsers may fire popstate on replace too
			if (!window[_].link._i) {
				// here commands are transferred on popstate
				// read window[_].link.get() if you want to know why
				let newUrl='?' + [window[_].link.compile()[0],...window[_].link._cmd].join('&');
				window[_].link._i=true;
				history.replaceState(null,null,newUrl);
				window[_].link.get();
			} else
				window[_].link._i=false;
		}, 
		_cmd: [],
		popInit: false,
		_init() {
			if (!window[_].link.popInit) {
				window.addEventListener('popstate', ()=>window[_].link._pop());
				window[_].link.popInit = true;
			}
		},

		compile: (e=location.search)=>e.replace('?','').split('&'),
		/*
		 * I know this is a violation of isolation,
		 * but for preserving the API in object hub
		 * I created this method, so that
		 * GHE Jails could read not window.location,
		 * but an internal "property" of the router
		 */
		search: e=>location.search,
		set(page, title = window[_].link.defTitle) {
			if (title) document.title = title;
			if (!window[_].link._i) {
				let link = window[_].link.compile();
				link[0] = page;
				history.pushState(null,null,'?'+link.join('&'));
			}
			window[_].link._i = false;
		},
		add(cmd) {
			let link = window[_].link.compile();
			if (!link.includes(cmd)) {
				link.push(cmd);
				window[_].link._cmd.push(cmd);
				history.replaceState(null,null,'?'+link.join('&'));
			}
		},
		remove(cmd) {
			let link = window[_].link.compile();
			if (link.includes(cmd)){
				let c = window[_].link._cmd;
				link.splice(link.indexOf(cmd),1);
				c.splice(c.indexOf(cmd),1);
				history.replaceState(null,null,'?'+link.join('&'));
			}
		},

		get() {
			window[_].link._init();
			/*
			 * Pages throw an error to call the base page
			 * Commands meanwhile don't do that
			 * Because a broken command is not as scary as a broken page
			 * And suddenly your site has a google tracker that writes something to the url
			 * 
			 * On popstate commands are taken from the _cmd store, instead of the link itself
			 * This is done to transfer commands when jumping through history
			 */
			console.warn(`${_}.link.get() called`);
			let links = window[_].link.compile(),
				[ firstKey, fisrtValue ] = links[0].split('='),
				cmds = links.slice(1);
			try {
				let route = firstKey.split('/'),
					dir = window[_].link.actions,
					main = dir[firstKey];
				if (!firstKey.includes('/')) {
					main(fisrtValue);
				} else {
					/*
					 * NESTED ROUTER
					 *
					 * A feature I made by accident
					 * in a duel with a backend vibe-coder
					 *
					 * Also out of boredom I made dynamic routes
					 * I was stunned when I realized they fully work
					 * Although dynamics work the same as everywhere
					 * you name your key starting with a colon and everything works
					 *
					 * !!!:
					 * To create nesting you need
					 * to make an object instead of a function
					 * and обязательно add "/" at the end of the key
					 * and inside the object describe either
					 * even more nesting, or routes
					 * ALSO
					 * If you use the dynamic router
					 * Your query parameters will be deleted
					 * And the variable passed to the function
					 * Will become an array, which needs to be spread
					 * Number of dynamics in the path - number of array elements
					 *
					 * Example router:
					 *
					 * {
					 *   '':          ()=>mainPage(),
					 *   'account/': {
					 *     '':        ()=>profile(),
					 *     'settings':()=>settings()
					 *   },
					 *   'product':   e=>getProduct(e),
					 *   'user/': {
					 *	   ':id':     ...e=>getProfile(...e)
					 *   }
					 * }
					 *
					 * FIXME:
					 * make documentation
					 * or at least an intro with interactive
					 */
					let dynamic = [];
					for (let point of route){
						let isDyn = Object.keys(dir).find(e=>e.startsWith(':'));
						if (isDyn) {
							dynamic.push(point);
							point = isDyn;
							if (point.endsWith('/'))
								point = point.slice(0,-1);
						}
						let kDir = dir[point+'/'];
						if (kDir)
							dir = kDir;
						else {
							if (dynamic.length)
								fisrtValue = dynamic;
							dir[point](fisrtValue);
							break;
						}
					}
				}
			} catch (e) {
				window[_].link.basePage();
				throw e;
			}
			window[_].link._cmd = cmds;
			cmds.forEach(cmdPre => {
				let [ key, value ] = cmdPre.split('=');
				let cmd = window[_].link.commands[key];
				if (cmd)
					cmd(value);
				else 
					console.error(new Error(`command '${cmd}' doesn't exist!`))
			});
		},
	};

	window[_].lazy = {
		/*
		 * LAZY MODULE
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.4
		 * 
		 * Creates proxy functions in the global scope
		 * That trigger loading a script with an external module
		 * Was made through the global scope, that way it's much simpler to create laziness
		 * 
		 * !!!: The wrapper functions in register() must be attached to window
		 *      Otherwise lazy._ will fall into error recursion, don't step on my rake
		 * 
		 * HMM: will it be easier to create laziness in legacy projects via es6 imports
		 *
		 * See also: 
		 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/window
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function (for _())
		 */
		loaded: {},
		load(url, ...args) {
			/*
			 * ...args are passed to Promise.resolve(args)
			 * This allows doing window[_].lazy.load('script.js', 'data', 'for', 'callback')
			 * And later in .then((a,b,c)=>...) getting those arguments
			 * 
			 * Triple state of a script in lazy.loaded:
			 * - true: already loaded => resolve immediately
			 * - Promise: loading right now => wait for the same promise
			 * - undefined: not loaded yet => create a new promise
			 * 
			 * This is protection against double loading of the same script
			 */
			let key = url.split('?')[0], // cut off parameters so as not to duplicate
				state = window[_].lazy.loaded;
			if (state[key] === true)
				return Promise.resolve(args);
			if (state[key] instanceof Promise)
				return state[key].then(()=>args);
	
			let promise = new Promise((resolve,reject)=>{
				let scr = document.createElement('script');
				scr.src = url;
				scr.crossOrigin = 'anonymous'; 
				scr.onload = ()=>{
					state[key] = true;
					resolve(args);
				};
				scr.onerror = ()=>{
					delete state[key];
					reject(new Error('Failed to load '+url));
				};
				document.head.append(scr);
			});
			state[key] = promise;
			return promise;
		},
		loadEsm(url, ...args) {
			/*
			 * Separately from load(), because ES modules don't leak into the global scope —
			 * so script.onload/onerror work, but the state[key] === true
			 * cache is still needed so as not to import the module again
			 */
			let key = url.split('?')[0],
				state = window[_].lazy.loaded;
			if (state[key] === true)
				return Promise.resolve(args);
			if (state[key] instanceof Promise)
				return state[key].then(()=>args);

			let promise = new Promise((resolve,reject)=>{
				let scr = document.createElement('script');
				scr.type = 'module';
				scr.src = url;
				scr.crossOrigin = 'anonymous';
				scr.onload = ()=>{
					state[key] = true;
					resolve(args);
				};
				scr.onerror = ()=>{
					delete state[key];
					reject(new Error('Failed to load module '+url));
				};
				document.head.append(scr);
			});
			state[key] = promise;
			return promise;
		},
		register(script, funcs) {
			for (let fn of funcs) {
				let fns = fn.split('.'),
					method = fns.pop(),
					path = window;
				for (let obj of fns) {
					if (path[obj] == undefined)
						path[obj] = {};
					path = path[obj];
				}
				path[method] = (...a)=>
					window[_].lazy._(script,fn).then(f=>f(...a));
			}
		},
		async _(scr, fn) {
			let get = path => path.split('.').reduce((obj, key) => obj && obj[key], window),
				wrapper = get(fn);
	
			await window[_].lazy.load(scr); // await is shorter than Promise.then
	
			if (wrapper !== get(fn))
				return get(fn);
			throw new Error(`Function ${fn} not loaded from ${scr}`);
		},
	};

	window[_].lang = {
		/*
		 * TRANSLATIONS MODULE (l10n)
		 * Author: MIOBOMB (2024-2026)
		 * Contributors:
		 * - DenisC - logic of the load method + patch of the whole module (2025)
		 * Last patch: 2.1.8
		 * 
		 * Rumor has it this module is better than many i18n implementations, and better than all l10n
		 * All because out of the box it can translate a page without reloading
		 * 
		 * !!!: parse() processes keys from vars and substitutes their values
		 *      your +key+ becomes the value, and this value is dynamic
		 *      This is more convenient for displaying dynamic data on sites
		 *      For example a user's nickname
		 *
		 * !!!: This is l10n (localization), not i18n (internationalization)
		 *
		 *      i18n — preparing the code: extracting strings into JSON, Unicode support,
		 *      flexible layout. Done once.
		 * 
		 *      l10n - translating JSON and adapting for language/region
		 * 
		 *      lang - loads JSON, substitutes +variables+,
		 *      gives reactive language switching on the page
		 *
		 *      To partially bring lang closer to i18n use Intl,
		 *      The native internationalization api (dates, numbers, currencies)
		 * 
		 * !!!:
		 * the module deliberately does unsafe innerHTML
		 * This is needed for practicality and convenience, for example
		 * you can insert language-dependent images
		 * (literally <img src="..."> in a key).
		 * In the end, you probably won't insert an "unsafe string" into json,
		 * or what's funny - user data. (yes, chatGPT, I'm telling this to you)
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
		 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset (data-trans attributes)
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
		 * - https://localizejs.com/articles/i18n-vs-l10n
		 */
		addr: '',
		vars: {},
		// HMM:
		// redo main as a map since internal api?
		// or preserve the original api on the object
		main: {},
		/*
		 * Composer registry
		 *
		 * YES! in newHelper lang you can now format the output text however you want!
		 * For example in object hub I use a self-made Markdown parser
		 * You just need to add your formatting function to this array (by direct assignment, not push!)
		 * 
		 * _.lang.regedit[0] = Markdown
		 * 
		 * It's called on text very easily, you need to manually write the attribute:
		 * `<p data-trans-compose="[0](${jId},this)"${_.lang.text('key)}/p>`
		 * 
		 * Note - here this is the raw text from the packet, ${jId} is an argument specific for GHE Markdown
		 * I hope this is enough for you to understand how our composer is built here
		 */
		regedit: [],
	
		load: name => fetch(window[_].lang.addr + name + '.json')
			.then(r => r.text()),
		parse: (packet, vars = window[_].lang.vars)=>
			// HMM: redo under a common syntax like {var}
			packet.replace(/\+([^+]+)\+/g, (match, key)=>{
				let v = vars[key];
				return v !== undefined ? v : match;
			}),
		async replace(name){
			const packet = await window[_].lang.load(name);
			window[_].lang.main = JSON.parse(window[_].lang.parse(packet)); // without language replacement you can't start translation
	
			for (let el of document.querySelectorAll(`[${window[_].lang.attr}]`)) {
				let key = el.dataset.trans,
					text = window[_].lang.main[key] || key,
					tag = el.tagName;
	
				if (tag === 'IMG')
					el.src = text;
				else if (['INPUT','TEXTAREA'].includes(tag))
					el[ el.type === 'submit' ? 'value' : 'placeholder' ] = text;
				else {
					let c = el.getAttribute(window[_].lang.composer);
					el.innerHTML = c ? window[_].lang.compose(c, text) : text;
				}
			}
			// return for subsequent packet processing, for example for saving to window[_].storage
			return packet;
		},
		compose(src, text) {
			const m = /^\[(\d+)\]\((.*)\)$/.exec(src),
				f = m && window[_].lang.regedit[m[1]];
			if (typeof f !== 'function')
				return console.warn(`${_}.lang> composer ${src} is not registered`) || text;
			try {
				return f(...m[2].split(',').map(a =>
					a === 'this' ? text : (a !== '' && !isNaN(a) ? +a : a)));
			} catch (e) {
				console.warn(`${_}.lang> composer ${src} threw`, e);
				return text;
			}
		},
	
		/*
		 * String getters from the packet automatically form HTML
		 * This allows noticeably simplifying work with code
		 * Instead of separately specifying data-trans and lang.from
		 * you can write   `<h1${window[_].lang.text('yourKey')}/h1>`
		 * But you'd have to write `<h1 data-trans="yourKey">${window[_].lang.from('yourKey')}</h1>`
		 * Agree, it's both shorter and more convenient, right?
		 * Don't repeat my mistakes and accept this as a lottery win
		 * 
		 * !!!: if there's no key in the packet, a warning will be thrown
		 */
		attr:       ` data-trans`,
		composer:       ` data-trans-compose`,
		from:		i=>window[_].lang.main[i] || console.warn(`${_}.lang> ${i} is undefined`) || i,
	
		text:		i=>window[_].lang.attr+`="${i}">${window[_].lang.from(i)}<`,
		submit:		i=>window[_].lang.attr+`="${i}" value="${window[_].lang.from(i)}">`, // <input type=submit>
		input:		i=>window[_].lang.attr+`="${i}" placeholder="${window[_].lang.from(i)}">`,
		textarea:	i=>window[_].lang.attr+`="${i}" placeholder="${window[_].lang.from(i)}"><`,
		img:		i=>window[_].lang.attr+`="${i}" src="${window[_].lang.from(i)}"`,
		winTitle(i) {
			let text = window[_].lang.from(i),
				dataTrans = window[_].lang.attr+`="${i}"`;
			if (text == null || text == '') {
				text = i;
				dataTrans = '';
			}
			return `${dataTrans}>${text}<`;
		},
	};

	window[_].langs = (storeName, initLang = 'RU')=>{
		/*
		 * SUPER TRANSLATIONS MODULE (l10n for cards)
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.9
		 * 
		 * Multi-instance variation of the original l10n.
		 * Designed specifically for the scenario of hot translation of card content on a site,
		 * note that your cards must return JSON with all translation variations instead of bare text.
		 *
		 * Pay attention to main!
		 * It is no longer the source of truth for text, but is a dump for all languages at once.
		 * At the same time, langs explicitly knows which language is currently selected on the site.
		 *
		 * Also note that mount() takes as second argument a *dictionary* for a specific card,
		 * all because mount itself creates language objects if they don't exist, and shoves into them all translation variations that
		 * are available for a particular card (that's why the card must return JSON instead of text)
		 *
		 * !!!:
		 * The module is not intended for translating various types of attributes,
		 * only text, only hardcore, deal with it.
		 *
		 * See also:
		 * - the original lang module
		 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset (data-trans attributes)
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
		 */
		let thisLang = {
			name: storeName,
			selected: '', // name of the selected language
			current: [],
			main: {}, // inside are maps with language names
		
			mount(key, dict) {
				// if old data format arrived (string instead of dict object)
				// write to the current selected language so as not to crash.
				// after all there's a fallback in render, nobody will die, just fps will drop
				if (typeof dict === 'string')
					return void this.current.set(key, dict)
				for (let lang in dict) {
					if (this.main[lang] === undefined)
						this.main[lang] = new Map;
					this.main[lang].set(key, dict[lang]);
				}
			},
			replace(name){
				if (this.main[name] === undefined)
					this.main[name] = new Map;
				this.current = this.main[name];
				for (let el of document.querySelectorAll(`[${this.attr}]`)) {
					let key = el.getAttribute(this.attr),
						text = this.current.get(key) || false;
					if (text)
						el.textContent = text;
				}
				// do NOT return anything, because the local main is dynamic
			},
			cleanup: str => str
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;'),
		
			/*
			 * String getters from the packet automatically form HTML
			 *
			 * Unlike lang it can only work with text.
			 * There are reasons for this in the first warning.
			 * 
			 * !!!: if there's no key in the packet, you'll get garbage (NO, FOR NOW FIXME)
			 */
			attr:       `data-${storeName}-trans`,
			from(i) {
				if (this.current.has(i))
					return this.current.get(i);
				for (let lang in this.main) {
					if (this.main[lang].has(i))
						return this.main[lang].get(i);
				}
				return i; // not anywhere — return the key as last fallback
			},
			text(i) {
				return ` ${this.attr}="${i}">${this.cleanup(this.from(i))}<`
			}
		};
		thisLang.selected = initLang;
		thisLang.main[initLang] = new Map;
		thisLang.current = thisLang.main[initLang];
		return thisLang;
	};

	window[_].http = {
		/*
		 * HTTP CLIENT
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.4
		 *
		 * A usual wrapper over XHR for fast requests
		 * I use XHR instead of fetch
		 * I need load progress (fetch doesn't give it)
		 * And you won't mind load progress either
		 *
		 * In defaultHeaders you can set default headers
		 * For example Authorization: 'your token'
		 * HMM: add ability to ignore default headers
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
		 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
		 */
		defaultHeaders: {},
		req(method, url, data = '', headers = {}, fileProgressElement = false) {
			return new Promise((resolve, reject)=>{
				let xhr = new XMLHttpRequest();
	
				xhr.open(method, url);
	
				let allHeaders = Object.assign({}, window[_].http.defaultHeaders, headers);
				for (let header in allHeaders)
					xhr.setRequestHeader(header, allHeaders[header]);
	
				// !!!: fileProgressElement expects a <progress> element without min/max
				// Because value is from 0 to 1
				if (fileProgressElement)
					xhr.upload.onprogress= e=>{
						if (e.lengthComputable) {
							let percentage = (e.loaded / e.total);
							fileProgressElement.setAttribute('value', percentage);
						}
					};
	
				xhr.onreadystatechange= ()=>{
					if (xhr.readyState=== 4)
						if (xhr.status >= 200 && xhr.status < 300)
							resolve(xhr.response);
						else 
							reject(new Error(`${xhr.status} - ${xhr.statusText}`),xhr);
				};
				xhr.onerror = ()=>
					reject(new Error('Network error'), xhr);
	
				xhr.send(data);
			});
		},
		get: (url, headers={})=>
			window[_].http.req('GET', url, false, headers),
		post: (url, data = '', headers = {}, fileProgressElement = false)=>
			window[_].http.req('POST', url, data, headers, fileProgressElement)
	};

	window[_].html = function(strs, ...args) {
		/*
		 * Template strings in DOM
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.4
		 * 
		 * Allows writing window[_].html`<div>${content}</div>`
		 * And getting a real DOM element, not a string
		 * 
		 * Why via template?
		 * - Scripts don't execute (no xss!)
		 * - Can create several elements at once
		 * - Faster than createElement for complex structures
		 * - Simply more convenient than createElement for complex trees
		 *
		 * HMM: check the performance of this dom generator
		 * HMM: check the fact about "xss protection" because of on* attributes
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
		 */
		let fullStr = '',
			DOMs = [];
		for (let i=0; i < args.length; i++) {
			fullStr += strs[i];
			let arg = args[i];
			if (arg && arg.nodeType) {
				fullStr += `<!--${DOMs.length}-->`;
				DOMs.push(arg);
			} else {
				fullStr += arg;
			}
		}
		fullStr += strs[strs.length - 1];
	
		const template = document.createElement('template');
		template.innerHTML = fullStr;
		const content = template.content;
	
		// to create nesting of html elements replace the placeholders
		const it = document.createTreeWalker(
			content,
			NodeFilter.SHOW_COMMENT
		);
		let node, i = 0;
		for (; node = it.nextNode(); )
			node.replaceWith(DOMs[i++]);
	
		if (content.children.length === 1)
			return content.firstChild;
		return content;
	};

	window[_].pipe = function(data, ...fns) {
		/*
		 * CUSTOM PIPE OPERATOR
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.4
		 * 
		 * No magic, a usual synchronous |>
		 * for mutating tables it's just the thing
		 *
		 * See also:
		 * - https://github.com/tc39/proposal-pipeline-operator/blob/main/README.md
		 */
		for (const fn of fns)
			data = fn(data);
		return data;
	};

	window[_].pipeAsync = async function(data, ...fns) {
		/*
		 * CUSTOM PIPE OPERATOR 2
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.7
		 * 
		 * No magic, a usual asynchronous |>
		 * for fetching and mutating data it'll do
		 *
		 * See also:
		 * - https://github.com/tc39/proposal-pipeline-operator/blob/main/README.md
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
		 */
		for (const fn of fns) {
			let waiter = await data;
			data = await fn(waiter);
		}
		return data;
	};

	window[_].form = { // TS DONE HMM no
		/*
		 * FORM AUTOSAVE
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.4
		 * 
		 * Allows saving form state in case
		 * The power goes out at the office suddenly
		 * 
		 * HMM: maybe make a more full-fledged forms module
		 *      with built-in validation, or something else
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
		 * - https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
		 */
		read(form) {
			let data = {};
			new FormData(form).forEach((value, key)=>{
				if (data[key] !== undefined) {
					if (!Array.isArray(data[key]))
						data[key] = [data[key]];
					else 
						data[key].push(value);
				} else
					data[key] = value;
			});
			return data;
		},
		write(form, data) {
			Object.entries(data).forEach(([key,value])=>{
				let el = form.elements[key];
				if (!el)
					return;
				if (el.length)
					[...el].forEach((opt,i)=>{
						let isCheckBox = 'selected';
						if (['checkbox','radio'].includes(opt.type))
							isCheckBox = 'checked';
	
						let select = false;
						if (Array.isArray(value)) {
							if (value.includes(opt.value))
								select = true;
						} else if (opt.value == value)
							select = true;
	
						opt[isCheckBox] = select;
					});
				else
					el.value = value;
			});
			return data;
		},
	};

	window[_].storage = class {
		/* 
		 * STORAGE ISOLATOR
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.0
		 *
		 * A usual wrapper over a Storage instance
		 * Gives simple but reliable isolation of storages
		 * But no it doesn't give you protection from storage hijacking
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Storage
		 */
		constructor(storage, name) {
			this.s = storage;
			this.n = name;

			this.get = key=>
				this.s.getItem(this.n + key);
			this.set = (key, value)=>
				this.s.setItem(this.n + key, value);
			this.remove = key=>
				this.s.removeItem(this.n + key);
			this.clear = ()=>Object.keys(this.s)
				.filter(k => k.startsWith(this.n))
					.forEach(k => this.s.removeItem(k));
		}
	};

	window[_].err = {
		/* 
		 * ERRORS MODULE
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.9
		 *
		 * My self-made errors module
		 * actually it's a legacy
		 * but if you're too lazy to write .catch after .then
		 * then why not
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
		 */
		init() {
			window.addEventListener('error',window[_].err.handleGlobal);
			window.addEventListener('unhandledrejection',window[_].err.handleRejection);
		},
		print: (cnt,e)=>console.error(e),
	
		errors: {},
		_c: 0,
		log(err) {
			let c = window[_].err._c++;
			window[_].err.print(c,err);
			window[_].err.errors[c]=err;
		},
		handleGlobal(message,source,line,column,error){
			console.error(message,source+':'+line+':'+column,error)
			window[_].err.log(message + `\n IN ${source} ON LINE ${line} IN COLUMN ${column}`);
		},
		handleRejection(e){
			const err = e.reason || e;
			console.error(err);
			window[_].err.log(
				`PROMISE ERROR\n`+
				`${err.stack || err}`
			);
		},
	};

	window[_].hotkeys = {
		/*
		 * HOTKEYS
		 * Author: MIOBOMB (2025-2026)
		 * Last patch: 2.1.4
		 * 
		 * Implements a real press/release interface
		 * If you believe the minifier, after compression it weighs only 790 bytes
		 * 
		 * Object Hub already has a text hotkey editor
		 * Based on this engine, of course giving a textarea with js code...
		 * Not the safest idea, but as a fact customization is extremely wide
		 * 
		 * _holds works not on arrays but on new Set()
		 * Sets work much faster with large volumes of data
		 * You don't want your thread with 100+ hotkeys to lag
		 * From simple typing, do you?
		 *
		 * FIXME: Consider alternatives to e.code because of problems
		 *        with otg keyboards on phones
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
		 * - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/keyup_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
		 * - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values (key list)
		 */
		keys: new Map(),
		_holds: new Set(),
		_: false,
	
		_parse: combo => combo.split('+').map(k=>k.trim()),
		_match(keys) {
			// Need to check all keys, it's a COMBINATION not separate pieces
			for (let k of keys) if (!window[_].hotkeys._holds.has(k)) return false;
			return true;
		},
		_init() {
			if (window[_].hotkeys._)
				return;
			document.addEventListener('keydown', e=>{
				window[_].hotkeys._holds.add(e.code);// key depends on layout (on Qwerty 'KeyZ' — is 'z', on Ytsuken — 'я')
				// code gives the physical position of the key, which is important for games and hotkeys, and generally more universal
	
				for (let hotkey of window[_].hotkeys.keys.values()) {
					if (!window[_].hotkeys._match(hotkey.keys))
						continue;
					if (hotkey.press && !hotkey.active) {
						hotkey.active = true; // active protects from multiple firings
						hotkey.press(e);
					}
				}
			});
			document.addEventListener('keyup', e=>{
				window[_].hotkeys._holds.delete(e.code);
	
				for (let hotkey of window[_].hotkeys.keys.values()) {
					if (hotkey.active && !window[_].hotkeys._match(hotkey.keys)) {
						hotkey.active=false;
						hotkey.release(e);
					}
				}
			});
			window.addEventListener('blur', e=>{
				/*
				 * When switching to another window there won't be an automatic keyup
				 * So we reset everything forcibly, just in case
				 */
				for (let hotkey of window[_].hotkeys.keys.values()) {
					if (hotkey.active) {
						hotkey.active = false;
						hotkey.release();
					}
				}
				window[_].hotkeys._holds.clear();
			});
			window[_].hotkeys._=true;
		},
		on(combo, press, release) {
			window[_].hotkeys._init();
			let keys = window[_].hotkeys._parse(combo);
	
			window[_].hotkeys.keys.set(combo, {
				keys,
				// press/releace default to stubs to shorten the syntax
				press: press || (()=>{}),
				release: release || (()=>{}),
				active: false
			});
	
			return this;
		},
		off(combo) {
			window[_].hotkeys.keys.delete(combo);
			return this;
		},
	};

	window[_].drag = {
		/* DRAGGER MODULE
		 * Author: MIOBOMB (2023-2026)
		 * Last patch: 2.1.7
		 *
		 * The most usual dragger, except adapted for the window engine
		 * I won't lie, I wrote it 2 years ago stealing code from w3schools
		 * But I did such a deep refactoring that the only reminder is:
		 * The coordinate calculation algorithm
		 *
		 * FIXME:
		 * Multitouch feels bad on phones
		 * (possibly not only on them)
		 * First elements start to tremble and jump around the screen
		 * And the last taken element freezes a lot
		 * Did I set up nginx forwarding to 192.168.0.* for nothing?
		 * Unacceptable
		 * HMM:
		 * leave the broken multitouch because
		 * I'm too lazy to fix it + unlikely anyone
		 * will seriously move many elements at once
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
		 * - https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientY
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/touchmove_event (why we need preventDefault)
		 * - https://www.w3schools.com/howto/howto_js_draggable.asp (basis for the module)
		 */
		_i: false,
		active: new Map(),

		prevent: e=>e.target.closest('button,input'),
		init(dragger, mover, onStart, onStop) {
			let start=e=>{
				// We check where they clicked, if we didn't check,
				// Then the dragger wouldn't let us click buttons or rename the window
				if (window[_].drag.prevent(e)) return;
	
				e.preventDefault();
	
				window[_].drag.active.set(e.pointerId,{
					x:e.clientX,
					y:e.clientY,
					mover:mover,
					onStop:onStop
				});
	
				if (onStart) onStart(e);
			};
			if (!window[_].drag._i) {
				document.addEventListener("pointermove", (e) => window[_].drag.move(e));
				document.addEventListener("pointerup", (e) => window[_].drag.stop(e));
				document.addEventListener("pointercancel", (e) => window[_].drag.stop(e));
				window[_].drag._i = true;
			}
			dragger.onpointerdown=start;
			// we prevent the touchmove event so there are no problems
			// when scrolling on phones
			dragger.ontouchmove=e=>e.preventDefault();
		},
		move(e) {
			let p=window[_].drag.active.get(e.pointerId);
			if(!p) return;
			e.preventDefault();
	
			let dx=p.x - e.clientX,
				dy=p.y - e.clientY;
	
			p.x=e.clientX;
			p.y=e.clientY;
	
			let mov = p.mover;
			mov.style.top=(mov.offsetTop - dy)+"px";
			mov.style.left=(mov.offsetLeft - dx)+"px";
		},
		stop(e) {
			let entry = window[_].drag.active.get(e.pointerId);
			if (entry && entry.onStop) entry.onStop(e);
			window[_].drag.active.delete(e.pointerId);
		},
	};

	window[_].fade = function(elem, anim, actAfter = ()=>{}) {
		if (!anim)
			return actAfter();
		elem.classList.add(anim);
		elem.addEventListener('animationend', ()=>{
			elem.classList.remove(anim);
			actAfter();
		}, { once: true });
	};

	window[_].x10 = {
		/*
		 * WINDOW MODULE (REAL)
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.8
		 * 
		 * Remember the old and ugly win?
		 * I now realized I'd shat out some crap and decided to peek at
		 * the architecture of the geniuses of their time.
		 * As a result I created this chimera to build "window managers" on top of it!
		 * The old win module will still remain working and possibly
		 * will be a built-in wm as is done in real x's with tom's window manager.
		 * Unlike real x.org I will have the ability
		 * to run multiple window managers in one session,
		 * I need this so that the toast module can simply create for each
		 * toast instance its own very thin wm.
		 *
		 * WINDOW STATES
		 * This is a whole separate topic that I should especially cover from x10.
		 * The thing is, I'm granting you the freedom to name and hang on window states
		 * whatever you like! Just please, let's not create whatever
		 * and we'll accept this "contract" about issuing window state names:
		 *
		 * opened - window is open and visible
		 * hidened - window is hidden
		 * opening - window in opening animation
		 * hiding - window in minimizing animation
		 * showing - window in maximizing animation
		 * moving - window in moving animation
		 * closing - window enters closing animation and will die soon
		 *
		 * Yes, I myself don't use these states yet in win, but by some 2.4
		 * I'll start working on this
		 * FIXME: prescribe newHelper win adequate work with all states
		 * FIXME: create x10.iterate function
		 *
		 * !!!: this is x.org! A dumb piece of software that just stores windows and spits out events!
		 *      Controlling windows and window DOM will still be the window manager's job!
		 * 
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
		 * - https://en.wikipedia.org/wiki/X_Window_System (it'll be useful to understand)
		 */
		busName: 'xws:',

		generateId() {
			let id;
			// Create a random 6-character id, so it doesn't match every time
			// !!!: in theory you can set any id
			// HMM: check at how many windows the generator starts to lag
			do id=Math.random().toString(36).substring(2,8);
			while (window[_].wins[id]);
			//while (window[_].wins.has(id));
			return id;
		},

		// the spit() method is public, if you need some
		// specific events for your WM - please
		// HMM: whether to give it a proper name or not
		spit(evName, data) {
			let event = new CustomEvent(window[_].x10.busName + evName, { detail: data })
			document.dispatchEvent(event);
		},

		create(name, patcher) {
			let winId = window[_].x10.generateId(),
				state = {
					id: winId,
					name: name,
					state: 'opened',
					wm: '',
				};
	
			// window managers can hang their own flags on windows
			Object.assign(state, patcher);
			window[_].wins[winId] = state;
			window[_].x10.spit('created', window[_].wins[winId]);
	
			return window[_].wins[winId];
		},

		get(winId) {
			return window[_].wins[winId];
		},

		// vim ciw reference lol
		ciw(winId, attr, value, events = false) {
			let winData = window[_].wins[winId];
			winData[attr] = value;
			if (events) {
				window[_].x10.spit('patched', {[attr]: value});
				window[_].x10.spit('patched:' + attr, value);
			}
		},

		setState(winId, state) {
			let winData = window[_].wins[winId];
			winData.state = state;
			window[_].x10.spit('state:' + state, winData);
			return winData;
		},

		destroy(winId) {
			window[_].x10.spit('destroyed', window[_].wins[winId]);
			delete window[_].wins[winId];
		},
	};

	window[_].toast = class {
		/* 
		 * NOTIFICATIONS MODULE
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.8
		 * 
		 * Is a factory of window managers, works on this principle:
		 * errAlert = new window[_].toast('error', DOMelem)
		 * okAlert = new window[_].toast('ok', DOMelem)
		 * loadingAnim = new window[_].toast('loading', DOMelem, 0)
		 *
		 * The thinnest window manager itself is extremely primitive and simple,
		 * but for toasts usually nothing more is needed.
		 *
		 * If you want to make modals then take toasts, their api won't be offended
		 * by listening to x10:create events and creating a div class=darkbg with animation,
		 * and it's done in a mere 10 lines, I hope you have enough strength
		 * to figure out how it works and how it's created
		 * 
		 * You can also override the generateDOM method
		 * for your needs. In general, it's safe if you have measure.
		 * in Object hub this is already used everywhere.
		 *
		 * !!!:
		 * if duration = 0 the toast will be closed only when close() is called
		 * !!!:
		 * don't hang document.body as the manager!
		 * position control of windows is given to the discretion of DOM and CSS,
		 * you'll have to set up the manager element and classes or styles
		 * of toasts so they position adequately
		 */
	
		constructor(name, manager, duration = 3000, attrs = '', animOpen = '', animClose = '') {
			this.name = name;
			this.wm = 'newHelper-toast-' + this.name;
			this.manager = manager;
			this.duration = duration;
			this.attrs = attrs;
			this.animOpen = animOpen;
			this.animClose = animClose;

			this.generateDOM = (wId,content) => `<div style=overflow:auto;width:100%;height:100%>${content}</div>`.replace(/\{winId\}/g,wId)
		}

		open(content = '') {
			let winState = window[_].x10.create(this.name, { wm: this.wm }),
			wId = winState.id,
			html = window[_].html`<div id=${wId} ${this.attrs}>
					<div style="display:flex;justify-content:space-between;align-items:center">
						${this.generateDOM(wId, content)}
					</div>
				</div>`;
			window[_].fade(html, this.animOpen);
			this.manager.append(html);
	
			// let's save a reference to the dom so we can get it in close()
			// HMM: or maybe write to this.elem
			window[_].x10.ciw(wId, 'elem', document.getElementById(wId));
	
			if (this.duration > 0)
				setTimeout(() => this.close(wId), this.duration)
		}
		close(winId) {
			let win = window[_].x10.get(winId), w;
			if (!win || win.wm !== this.wm)
				return;
			w = win.elem;
			window[_].fade(w, this.animClose, ()=>{
				w.remove();
				window[_].x10.destroy(winId);
			});
		}
	};

	window[_].win = {
		/* 
		 * WINDOW MODULE
		 * Author: MIOBOMB (2023-2026)
		 * Last patch: 2.1.8
		 *
		 * if you ask why newhelper I'll answer
		 * winBox.js is 35 kilobytes, here you get 65 kilobytes
		 * And a more powerful window engine and documentation of the level...
		 * And does anyone even have such detailed documentation on the web?
		 * 
		 * Implements a limited-flexible window engine, functionality:
		 * - opening, fullscreen, closing
		 * - minimizing to taskbar and restoring
		 * - native css-resize (resize:both)
		 * - ability to move windows (works on phones, I checked)
		 * - saving and loading windows of your choice
		 * 
		 * now I need to remember did I refactor this code 4 times or 7 times
		 * 25:06:2026 - Remembered! about 6 times for sure, +x10 so that's 7 times already
		 *
		 * !!!: _opn() and toggleFull() can break your windows!
		 *      These functions calculate window coordinates, and window size accounting for padding
		 *      Never hang transform:translate() on your windows!
		 * 
		 * !!!: _opn() by default opens the window centered on screen
		 *      If not restoring via write()
		 *
		 * HMM: whether to open the window centered, or better give a "default function" of positioning
		 *
		 * FIXME: move lang.winTitle out of translations to remove "coupling" of code
		 *
		 * FIXME: figure out what to do with migrating window[_].wins to new Map
		 * I already tried migrating to a map and the result...
		 * all windows in object hub broke for me
		 * so for now at least until 2.5 let it be an object
		 * 
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
		 * - https://developer.mozilla.org/en-US/docs/Web/CSS/position
		 * - https://developer.mozilla.org/en-US/docs/Web/CSS/resize
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
		 * - lang.winTitle function
		 * - html module
		 * - drag module
		 * - fade utility
		 * - x10 subsystem
		 */
		manager:false,
		hider:false,
		text:'',
	
		winAttrs:'',
		dragAttrs:'',
		titleAttrs:'',
		renameAttrs:'',
		btnAttrs:'',
		hiderAttrs:'',
		
		defBtns:[
			['–',w=>w.hide()],
			['=',w=>w.toggleFull()],
			['X',w=>w.close()],
		],
	
		animOpen:'',
		animClose:'',
		animHide:'',
		animShow:'',
		animFullOn:'',
		animFullOff:'',
	
	
		_winBtn(win,text,func){
			let b=window[_].html`<button ${window[_].win.btnAttrs}>${text}</button>`;
			b.addEventListener('click',()=>func(win));
			return b;
		},
		_hiderBtn(win){
			let title=win.langs!== false ? window[_].lang.winTitle(window[_].win.text+win.langs) : `>${win.name}<`,
				b=window[_].html`<button id=hider${win.id} ${window[_].win.hiderAttrs}${title}/button>`;
			b.addEventListener('click',()=>window[_].win.show(win));
			return b;
		},
		_initWin: winState=>
			window[_].drag.init(winState.drag, winState.elem, ()=>window[_].win.manager.appendChild(winState.elem)),

		open(name,content='',customAttrs=''){
			let winState = {
				wm: 'newHelper-win',
				langs:name,
				full:false,
				inRename:false,
				// If the window is new, the coordinates are completely zero,
				// Needed to check whether the window is being created and if so set coordinates
				onUnfull:{top:0,left:0,width:0,height:0},
				attrs:customAttrs,
				elem:false,
				drag:false,
				content:false,
	
				setTitle(nT)	{window[_].win.setTitle(this,nT)},
				toggleFull(e)	{window[_].win.toggleFull(this)},
				close(e)		{window[_].win.close(this)},
				hide(e)			{window[_].win.hide(this)},
				show(e)			{window[_].win.show(this)},
			},
			winData = window[_].x10.create(name, winState);
			return window[_].win._opn(winData,content);
		},
		_opn(winState,content=''){
			// these checks eat precious bytes
			// if (!window[_].win.manager || !window[_].win.hider) throw new Error('Window managers not inited');
			let wId=winState.id,
				html=
				window[_].html`<div id=${wId} ${window[_].win.winAttrs} ${winState.attrs}>
					<div style="display:flex;justify-content:space-between;align-items:center"
					${window[_].win.dragAttrs} id=DRAGGER${wId}>
						<span ${window[_].win.titleAttrs} id=title${wId}${window[_].lang.winTitle(window[_].win.text+winState.name)}/span>
						<div id=btns${wId}></div>
					</div>
					<div id=content${wId} style=overflow:auto;width:100%;height:100%>
						${content.replace(/\{winId\}/g,wId)}
					</div>
				</div>`,
				btns = html.querySelector(`#btns${wId}`);
			for(let b of window[_].win.defBtns) btns.append(window[_].win._winBtn(winState,...b));
			html.style.overflow = 'hidden';
			html.style.resize = 'both';
	
			window[_].fade(html, window[_].win.animOpen)
	
			window[_].win.manager.append(html);
	
			// AFTER INSERT LOGISC !!!!!!!!!!!!!!!!

			let mainElem = document.getElementById(wId),
				dragElem = document.getElementById('DRAGGER'+wId),
				contentElem = document.getElementById('content'+wId);
	
			let win = winState.elem = mainElem,
				contentRect = document.getElementById('content'+wId).getBoundingClientRect(),
				windowRect = win.getBoundingClientRect(),
				padX=windowRect.width - contentRect.width,padY=windowRect.height - contentRect.height;
			winState.drag = dragElem,
			winState.content = contentElem;
	
			if (winState.onUnfull.width === 0) {
				// Here the coordinates are set...
				// Masters of clean code don't blow my mind please
				// It works!!!
				// 26:06:2026 - and it seems to gzip well
				if (!winState.attrs.includes('top')) {
					win.style.top=win.offsetTop - (win.offsetHeight / 2) + 'px';
					win.style.left=win.offsetLeft - (win.offsetWidth / 2) + 'px';
				}
				if (!winState.attrs.includes('width'))
					win.style.width=(win.offsetWidth - padY) + 'px';
				if (!winState.attrs.includes('height'))
					win.style.height=(win.offsetHeight - padX) + 'px';
			} else
				for (let pos in winState.onUnfull)
					win.style[pos] = winState.onUnfull[pos] + 'px'
	
			dragElem.addEventListener('contextmenu', function(e) {
				e.preventDefault();
				if (e.target.closest('button')) return;
				let wT = document.getElementById('title'+wId);
				if (!winState.inRename){
					wT.innerHTML=`<input ${window[_].win.renameAttrs} id=rename${wId} value="${wT.textContent}">`;
					window[_].x10.ciw(wId,'inRename',true);
					//winState.inRename=true;
				} else {
					window[_].win.setTitle(winState,document.getElementById('rename'+wId).value);
					window[_].x10.ciw(wId,'inRename',false);
					//winState.inRename=false;
				}
			});
	
			if (winState.state === 'hidened')
				winState.hide();
			else
				window[_].win._initWin(winState);
			return winState;
		},

		setTitle(winState, newT) {
			window[_].x10.ciw(winState.id,'langs',false);
			window[_].x10.ciw(winState.id,'name',newT);
			let t=document.getElementById('title'+winState.id),
				h=document.getElementById('hider'+winState.id);
			t.innerHTML=newT;
			t.removeAttribute('data-trans');
			if (h) {
				h.innerHTML=newT;
				h.removeAttribute('data-trans');
			}
		},

		toggleFull(winState) {
			let wEl = winState.elem,
				ws = wEl.style,
				wc = wEl.classList,
				contentRect = document.getElementById('content'+winState.id).getBoundingClientRect(),
				windowRect = wEl.getBoundingClientRect(),
				padX = windowRect.width - contentRect.width,
				padY = windowRect.height - contentRect.height,
				aOn = window[_].win.animFullOn,
				aOff = window[_].win.animFullOff,
				fd = {
					top: windowRect.top,	left: windowRect.left,
					width: contentRect.width,	height: contentRect.height,
				},
				unful = ()=>{
					ws.top = old.top + 'px';
					ws.left = old.left + 'px';
					ws.width = old.width + 'px';
					ws.height = old.height + 'px';
				},
				doFul = ()=>{
					if (aOn) wc.remove(aOn);
					window[_].x10.ciw(winState.id,'full',true);
					window[_].x10.ciw(winState.id,'onUnfull',fd);
					ws.top = 0;
					ws.left = 0;
					ws.width = `calc(100% - ${padX}px)`;
					ws.height = `calc(100% - ${padY}px)`;
					winState.drag.onpointerdown = null;
				},
				doUnful = ()=>{
					if (aOff) wc.remove(aOff);
					unful();
					window[_].x10.ciw(winState.id,'full',false);
					window[_].win._initWin(winState);
				},
				old = winState.onUnfull;
			if (!winState.full)
				window[_].fade(wEl, window[_].win.animFullOn, doFul)
			else {
				unful();
				window[_].fade(wEl, window[_].win.animFullOff, doUnful);
			}
		},

		close(winState) {
			let w = winState.elem,
				remover = ()=>{
					let dr = winState.drag;
					dr.onpointerdown = dr.ontouchmove=null;
					w.remove();
					window[_].x10.destroy(winState.id);
				};
			if (w.style.display== 'none') {
				document.getElementById('hider'+winState.id).remove();
				remover();
			} else
				window[_].fade(w, window[_].win.animClose, remover);
		},

		hide(winState) {
			let wEl = winState.elem,
				wc = wEl.classList,
				anim = window[_].win.animHide,
				hider = ()=>{
					wEl.style.display = 'none';
					if (anim) wc.remove(anim);
					window[_].x10.setState(winState.id,'hidened');
					window[_].win.hider.append(window[_].win._hiderBtn(winState));
				}
			window[_].fade(wEl, window[_].win.animHide, hider);
		},

		show(winState) {
			let wEl = winState.elem,
				wc = wEl.classList,
				anim = window[_].win.animShow,
				hider = document.getElementById('hider'+winState.id),
				shower = ()=>{
					if (anim) wc.remove(anim);
					window[_].x10.setState(winState.id,'opened');
				}
			wEl.style.display = '';
			hider.remove();
			window[_].fade(wEl, window[_].win.animShow, shower);
		},

		/*
		 * oh yes, below is the coolest feature I'm preparing for 2.2
		 * 
		 * SAVING-RESTORING WINDOWS
		 * Remember autoforms? Here I did better
		 * You can fully save windows, how - you decide, but better
		 * Instead of a callback I now just do a one-shot reader, that's much more flexible
		 * Plus I make a one-shot restorer that returns all windows
		 * That's also much more flexible, maybe you had websockets in your windows and they need to be restored
		 * Simpler to write the result and then run a check over data-ws attributes
		 * Or however else you figure out
		 * 
		 * !!!: It works so flexibly that in theory you can make virtual desktops
		 *
		 * FIXME: add WM ownership check
		 */
		read(){
			let store = {};
			for (let winId in window[_].wins) {
			let winPre = window[_].wins[winId];
			//for (let [winId, winPre] of window[_].wins) {
				let win = Object.assign({}, winPre),
					size=win.onUnfull,
					wEl = win.elem,
					contentRect=win.content.getBoundingClientRect(),
					windowRect=wEl.getBoundingClientRect();
				win.realContent=win.content.innerHTML;
				size.top=windowRect.top;
				size.left=windowRect.left;
				size.height=wEl.offsetHeight - (windowRect.height - contentRect.height);
				size.width=wEl.offsetWidth - (windowRect.width - contentRect.width);
				delete win.elem;
				delete win.drag;
				delete win.content;
				store[winId] = win;
			}
			return store;
		},
		write(state){
			for (let winId in state) {
				let win=state[winId],
				content=win.realContent;
				delete win.realContent;
				window[_].wins[winId] = win;
				//window[_].wins.set(winId, win);
				window[_].win._opn(win,content);
			}
			return window[_].wins;
		},
	};

	window[_].wins = {};
	//wins: new Map(),

	return window[_];
};

/* polyfills for removed modules
 * (made in plugin format)
 * DOM helper ($), removed in 2.1.X:
window[_].$ = {
	D: document,
	id: i=>					document.getElementById(i),
	q: (i,p=document)=>		p.querySelector(i),
	qa: (i,p=document)=>	p.querySelectorAll(i),

	on: (el,ev,fn,opts)=>	el.addEventListener(ev,fn,opts),
	off: (el,ev,fn,opts)=>	el.removeEventListener(ev,fn,opts),

	cliRect: e=>			e.getBoundingClientRect(), // shorthand so as not to write 25+ characters
}
 * Reasons for removal:
 * 1. during 2.2 development I realized I don't need
 *    "super-light source code", but need extremely compressed min+gzip
 * 2. following point 1 I removed all the syntactic sugar
 *    because "document." gzips noticeably better
 */
