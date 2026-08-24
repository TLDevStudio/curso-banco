function initNavLogoWave() {
    const container = document.getElementById('navLogo');
    const canvasEl = document.getElementById('navLogoCanvas');
    if (!container || !canvasEl || typeof THREE === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
        u_time: { value: 0 },
        u_base: { value: new THREE.Color('#F8F6F0') }, // off-white
        u_wave1: { value: new THREE.Color('#E8C97A') }, // gold-light, camada mais distante
        u_wave2: { value: new THREE.Color('#C9A84C') }, // gold, camada do meio
        u_wave3: { value: new THREE.Color('#A07830') }, // gold-dark, camada mais próxima
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float u_time;
      uniform vec3  u_base;
      uniform vec3  u_wave1;
      uniform vec3  u_wave2;
      uniform vec3  u_wave3;

      float waveLine(vec2 uv, float baseline, float freq, float speed, float amp, float phase){
        return baseline + sin(uv.x * freq + u_time * speed + phase) * amp;
      }

      void main(){
        vec2 uv = vUv;
        vec3 col = u_base;
        float edge = 0.025;

        float l1 = waveLine(uv, 0.40, 4.0, 0.35, 0.07, 0.0);
        float f1 = 1.0 - smoothstep(l1 - edge, l1 + edge, uv.y);
        col = mix(col, u_wave1, f1 * 0.35);

        float l2 = waveLine(uv, 0.28, 5.5, 0.55, 0.055, 2.4);
        float f2 = 1.0 - smoothstep(l2 - edge, l2 + edge, uv.y);
        col = mix(col, u_wave2, f2 * 0.55);

        float l3 = waveLine(uv, 0.15, 7.0, 0.8, 0.045, 4.8);
        float f3 = 1.0 - smoothstep(l3 - edge, l3 + edge, uv.y);
        col = mix(col, u_wave3, f3 * 0.85);

        float sheen = smoothstep(0.0, 1.0, sin(uv.x * 6.283 - u_time * 0.4) * 0.5 + 0.5);
        col += u_wave3 * sheen * 0.05 * f3;

        gl_FragColor = vec4(col, 1.0);
      }
    `
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
    }
    resize();

    if ('ResizeObserver' in window) {
        new ResizeObserver(resize).observe(container);
    } else {
        window.addEventListener('resize', resize);
    }

    const SPEED_FACTOR = 2.2;

    const clock = new THREE.Clock();
    function animate() {
        uniforms.u_time.value = clock.getElapsedTime() * SPEED_FACTOR;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

window.addEventListener('DOMContentLoaded', initNavLogoWave);



function initHeroWaveBg() {

    const container = document.getElementById('wave-bg');
    const canvasEl = document.getElementById('heroWaveCanvas');

    if (!container || !canvasEl || typeof THREE === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {

        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_goldPale: { value: new THREE.Color('#F0DFAE') },
        u_goldLight: { value: new THREE.Color('#E8C97A') },
        u_gold: { value: new THREE.Color('#C9A84C') },
        u_goldDark: { value: new THREE.Color('#A07830') },
        u_goldDeep: { value: new THREE.Color('#7A5A20') },
        u_foam: { value: new THREE.Color('#FDF9EE') },
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthTest: false,
        vertexShader: `

                varying vec2 vUv;
                void main(){
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,

        fragmentShader: `

                precision highp float;
                varying vec2 vUv;
                uniform float u_time;
                uniform vec2  u_resolution;
                uniform vec3  u_goldPale;
                uniform vec3  u_goldLight;
                uniform vec3  u_gold;
                uniform vec3  u_goldDark;
                uniform vec3  u_goldDeep;
                uniform vec3  u_foam;

                float oceanWave(float flowX, float t, float speed, float scale){
                    float w = 0.0;
                    w += sin(flowX * 4.0  * scale + t * speed)               * 0.5;
                    w += sin(flowX * 8.0  * scale + t * speed * 1.6 + 1.5)    * 0.25;
                    w += sin(flowX * 14.0 * scale + t * speed * 0.7 + 3.0)    * 0.15;
                    w += sin(flowX * 20.0 * scale + t * speed * 2.1 + 4.5)    * 0.08;
                    return w;

                }

                vec4 waveLayer(vec2 uv, float aspect, float baseline, float amp, float speed, float scale, float tilt, float skew, vec3 color, float fillAlpha){
                    float x = uv.x * aspect;
                    float y = uv.y;
                    float flowX = x - y * skew;
                    float crestBase = baseline + uv.x * tilt;
                    float w = oceanWave(flowX, u_time, speed, scale) * amp;
                    float crest = crestBase + w;
                    float fill = 1.0 - smoothstep(crest - 0.02, crest + 0.004, y);
                    float glow = 1.0 - smoothstep(0.0, 0.018, abs(y - crest));
                    float foamLine = 1.0 - smoothstep(0.0, 0.006, abs(y - (crest + 0.012)));
                    vec3 finalColor = mix(color, u_foam, foamLine * 0.7);
                    float alpha = fill * fillAlpha + glow * fillAlpha * 0.6 + foamLine * fillAlpha * 0.6;
                    return vec4(finalColor, clamp(alpha, 0.0, 1.0));
                }

                void main(){

                    vec2 uv = vUv;
                    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
                    vec3 col = vec3(0.0);
                    float alpha = 0.0;
                    vec4 l1 = waveLayer(uv, aspect, 0.30, 0.05, 0.35, 0.55, 0.40, 0.75, u_goldPale, 0.30);
                    col = mix(col, l1.rgb, l1.a);
                    alpha = max(alpha, l1.a);
                    vec4 l2 = waveLayer(uv, aspect, 0.21, 0.05, 0.48, 0.68, 0.48, 0.85, u_goldLight, 0.40);
                    col = mix(col, l2.rgb, l2.a);
                    alpha = max(alpha, l2.a);
                    vec4 l3 = waveLayer(uv, aspect, 0.13, 0.05, 0.62, 0.80, 0.56, 0.95, u_gold, 0.50);
                    col = mix(col, l3.rgb, l3.a);
                    alpha = max(alpha, l3.a);
                    vec4 l4 = waveLayer(uv, aspect, 0.06, 0.045, 0.78, 0.92, 0.64, 1.05, u_goldDark, 0.58);
                    col = mix(col, l4.rgb, l4.a);
                    alpha = max(alpha, l4.a);
                    vec4 l5 = waveLayer(uv, aspect, 0.00, 0.03, 0.92, 1.05, 0.72, 1.15, u_goldDeep, 0.55);
                    col = mix(col, l5.rgb, l5.a);
                    alpha = max(alpha, l5.a);
                    float topFade = smoothstep(0.44, 0.68, uv.y);
                    alpha *= (1.0 - topFade);
                    gl_FragColor = vec4(col, alpha);
                }

            `

    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
        uniforms.u_resolution.value.set(w, h);
    }

    resize();

    if ('ResizeObserver' in window) {
        new ResizeObserver(resize).observe(container);
    } else {
        window.addEventListener('resize', resize);
    }

    const SPEED_FACTOR = 2.5;
    const clock = new THREE.Clock();

    function animate() {

        uniforms.u_time.value = clock.getElapsedTime() * SPEED_FACTOR;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

window.addEventListener('DOMContentLoaded', initHeroWaveBg);