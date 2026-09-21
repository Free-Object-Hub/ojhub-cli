document.addEventListener('xws:destroyed', e=>{
	if (e.detail === 'fpstext')
		fpsRun = false;
})
window.fpsRun = true;

function fpsCounter() {
    fpsRun = true;
    const realFps = _.$.id('realFps');
    const averageFps = _.$.id('averageFps');
    const slowestFps = _.$.id('slowestFps');

    const samples = [];
    const maxSamples = 144; // храним последние 600 кадров

    let lastFrame = performance.now();

    function loop(now) {
        if (!fpsRun) return
        const frameTime = now - lastFrame;
        lastFrame = now;

        if (frameTime > 0) {
            const fps = 1000 / frameTime;

            realFps.textContent = Math.round(fps);

            samples.push({
                time: now,
                fps: fps,
                frameTime: frameTime
            });
        }

        // Удаляем измерения старше 5 секунд
        while (samples.length > maxSamples) {
            samples.shift();
        }

function drawGraph() {
    const canvas = _.$.id('fpsGraph');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const maxFps = 62; // потолок шкалы, под свой монитор

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    samples.forEach((sample, i) => {
        const x = (i / (samples.length - 1 || 1)) * w;
        const y = h - Math.min(sample.fps / maxFps, 1) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#0f0';
    ctx.stroke();

    // линия 30 fps как ориентир
    ctx.strokeStyle = 'rgba(255,0,0,0.4)';
    ctx.beginPath();
    const y30 = h - (30 / maxFps) * h;
    ctx.moveTo(0, y30);
    ctx.lineTo(w, y30);
    ctx.stroke();
}


        if (samples.length) {
            // Средний FPS
            const average =
                samples.reduce((sum, sample) => {
                    return sum + sample.fps;
                }, 0) / samples.length;

            averageFps.textContent = Math.round(average);

            // 1% самых медленных кадров
            const slowestCount = Math.max(
                1,
                Math.ceil(samples.length * 0.01)
            );

            const slowest = [...samples]
                .sort((a, b) => b.frameTime - a.frameTime)
                .slice(0, slowestCount);

            const slowestAverage =
                slowest.reduce((sum, sample) => {
                    return sum + sample.frameTime;
                }, 0) / slowest.length;

            slowestFps.textContent =
                Math.round(1000 / slowestAverage);
            drawGraph()
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

function fpsWindow() {
    if (_.$.q('[fpsdata]')) return;

    _.win.open(
        'fpstext',
        `<p style=margin:0>
            current: <span id=realFps></span><br>
            average: <span id=averageFps></span><br>
            slowest: <span id=slowestFps></span>
        </p>
        <canvas id=fpsGraph width=200 height=60 style="display:block;width:100%"></canvas>`,
        'fpsdata style="width:200px;height:130px;top:calc(100% - 200px);left:calc(100% - 275px)"'
    );
}

fpsWindow();
fpsCounter();
