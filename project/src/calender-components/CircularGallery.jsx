import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef } from "react";
import "./CircularGallery.css";

/* ---------------- utils ---------------- */

const lerp = (a, b, t) => a + (b - a) * t;

const debounce = (fn, delay) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
};

/* ---------------- date texture ---------------- */

function createDateTexture(gl, text, color) {
    const canvas = document.createElement("canvas");
    const size = 256;
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, size, size);

    ctx.font = "bold 120px Figtree, sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2);

    const texture = new Texture(gl, { generateMipmaps: false });
    texture.image = canvas;
    return texture;
}

/* ---------------- media ---------------- */

class Media {
    constructor(opts) {
        Object.assign(this, opts);
        this.extra = 0;
        this.createProgram();
        this.createMesh();
    }

    createProgram() {
        this.program = new Program(this.gl, {
            transparent: true,
            depthTest: false,
            depthWrite: false,
            vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin(p.x * 4.0 + uTime) * 0.15 * uSpeed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        }
      `,
            fragment: `
        precision highp float;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float rounded(vec2 p, vec2 b, float r){
          vec2 d = abs(p) - b;
          return length(max(d,0.0)) + min(max(d.x,d.y),0.0) - r;
        }

        void main(){
          float d = rounded(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float a = 1.0 - smoothstep(0.0, 0.01, d);
          vec4 c = texture2D(tMap, vUv);
          gl_FragColor = vec4(c.rgb, a);
        }
      `,
            uniforms: {
                tMap: { value: createDateTexture(this.gl, this.text, this.textColor) },
                uTime: { value: Math.random() * 100 },
                uSpeed: { value: 0 },
                uBorderRadius: { value: this.borderRadius }
            }
        });
    }

    createMesh() {
        this.plane = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program
        });
        this.plane.setParent(this.scene);
    }

    onResize({ screen, viewport }) {
        this.screen = screen;
        this.viewport = viewport;

        const scale = screen.height / 1200;
        this.plane.scale.y = (viewport.height * (500 * scale)) / screen.height;
        this.plane.scale.x = this.plane.scale.y;

        this.padding = 1.5;
        this.width = this.plane.scale.x + this.padding;
        this.widthTotal = this.width * this.length;
        this.x = this.width * this.index;
    }

    update(scroll, dir) {
        this.plane.position.x = this.x - scroll.current - this.extra;

        const x = this.plane.position.x;
        const H = this.viewport.width / 2;

        if (this.bend !== 0) {
            const B = Math.abs(this.bend);
            const R = (H * H + B * B) / (2 * B);
            const ex = Math.min(Math.abs(x), H);
            const arc = R - Math.sqrt(R * R - ex * ex);
            this.plane.position.y = this.bend > 0 ? -arc : arc;
            this.plane.rotation.z =
                Math.sign(x) * Math.asin(ex / R) * (this.bend > 0 ? -1 : 1);
        }

        this.program.uniforms.uSpeed.value = scroll.current - scroll.last;
        this.program.uniforms.uTime.value += 0.04;

        const off = this.plane.scale.x / 2;
        const vOff = this.viewport.width / 2;

        if (dir === "right" && this.plane.position.x + off < -vOff)
            this.extra -= this.widthTotal;

        if (dir === "left" && this.plane.position.x - off > vOff)
            this.extra += this.widthTotal;
    }
}

/* ---------------- app ---------------- */

class App {
    constructor(container, opts) {
        this.container = container;
        this.opts = opts;
        this.scroll = { current: 0, target: 0, last: 0, ease: opts.scrollEase };
        this.scrollSpeed = opts.scrollSpeed;

        this.createRenderer();
        this.createCamera();
        this.createScene();
        this.createGeometry();
        this.onResize();          // ✅ FIRST
        this.createMedias();      // ✅ THEN
        this.addEvents();
        this.update();
    }

    createRenderer() {
        this.renderer = new Renderer({ alpha: true, antialias: true });
        this.gl = this.renderer.gl;
        this.gl.clearColor(0, 0, 0, 0);
        this.container.appendChild(this.gl.canvas);
    }

    createCamera() {
        this.camera = new Camera(this.gl);
        this.camera.fov = 45;
        this.camera.position.z = 20;
    }

    createScene() {
        this.scene = new Transform();
    }

    createGeometry() {
        this.geometry = new Plane(this.gl, { widthSegments: 40, heightSegments: 40 });
    }

    createMedias() {
        const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
        const items = [...days, ...days];

        this.medias = items.map(
            (text, index) =>
                new Media({
                    gl: this.gl,
                    geometry: this.geometry,
                    scene: this.scene,
                    index,
                    length: items.length,
                    screen: this.screen,
                    viewport: this.viewport,
                    text,
                    bend: this.opts.bend,
                    textColor: this.opts.textColor,
                    borderRadius: this.opts.borderRadius
                })
        );

        this.medias.forEach(m =>
            m.onResize({ screen: this.screen, viewport: this.viewport })
        );
    }

    onResize = () => {
        this.screen = {
            width: this.container.clientWidth,
            height: this.container.clientHeight
        };

        this.renderer.setSize(this.screen.width, this.screen.height);
        this.camera.perspective({
            aspect: this.screen.width / this.screen.height
        });

        const fov = (this.camera.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fov / 2) * this.camera.position.z;
        const w = h * this.camera.aspect;
        this.viewport = { width: w, height: h };

        if (this.medias)
            this.medias.forEach(m =>
                m.onResize({ screen: this.screen, viewport: this.viewport })
            );
    };

    onWheel = e => {
        this.scroll.target +=
            (e.deltaY > 0 ? 1 : -1) * this.scrollSpeed;
    };

    onDown = e => {
        this.isDown = true;
        this.startX = e.clientX;
        this.startScroll = this.scroll.target;
    };

    onMove = e => {
        if (!this.isDown) return;
        const dx = e.clientX - this.startX;
        this.scroll.target = this.startScroll - dx * 0.01 * this.scrollSpeed;
    };

    onUp = () => (this.isDown = false);

    update = () => {
        this.scroll.current = lerp(
            this.scroll.current,
            this.scroll.target,
            this.scroll.ease
        );

        const dir =
            this.scroll.current > this.scroll.last ? "right" : "left";

        this.medias.forEach(m => m.update(this.scroll, dir));

        this.renderer.render({ scene: this.scene, camera: this.camera });
        this.scroll.last = this.scroll.current;
        requestAnimationFrame(this.update);
    };

    addEvents() {
        window.addEventListener("resize", this.onResize);
        window.addEventListener("wheel", this.onWheel);
        window.addEventListener("mousedown", this.onDown);
        window.addEventListener("mousemove", this.onMove);
        window.addEventListener("mouseup", this.onUp);
    }
}

/* ---------------- react wrapper ---------------- */

export default function CircularGallery({
                                            bend = 3,
                                            textColor = "#ffffff",
                                            borderRadius = 0.06,
                                            scrollSpeed = 2,
                                            scrollEase = 0.08
                                        }) {
    const ref = useRef(null);

    useEffect(() => {
        const app = new App(ref.current, {
            bend,
            textColor,
            borderRadius,
            scrollSpeed,
            scrollEase
        });
        return () => app.renderer.gl.canvas.remove();
    }, [bend, textColor, borderRadius, scrollSpeed, scrollEase]);

    return <div ref={ref} className="circular-gallery" />;
}
