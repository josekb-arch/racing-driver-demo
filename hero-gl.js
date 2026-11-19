/* Rowan Vale demo: hero liquid reveal in WebGL (lazy-loaded; main.js falls back to the 2D canvas if this fails).
   Pass 1 (half-res ping-pong FBO): metaball trail under the cursor that decays and drifts like liquid.
   Pass 2: face/helmet mix through a thresholded (gooey) mask, refraction from the mask gradient at the edge,
   and depth parallax from a generated depth map so the head moves in 3D with the pointer. */
(function(){
window.RVHeroGL = function(canvas, imgs){
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) throw new Error("no webgl");
  const VS = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const TRAIL = `precision mediump float;varying vec2 v;uniform sampler2D prev;uniform vec2 res;uniform vec2 m[5];uniform float r[5];uniform float dec;uniform float t;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  void main(){vec2 asp=vec2(res.x/res.y,1.);
    vec2 flow=vec2(n(v*4.+t*.35)-.5,n(v*4.+17.+t*.35)-.5)*.004;
    float a=texture2D(prev,v+flow).r*dec;
    float f=0.;for(int k=0;k<5;k++){vec2 d=(v-m[k])*asp;f+=r[k]*r[k]/(dot(d,d)+1e-4);}
    a=max(a,clamp(f*.9,0.,1.));gl_FragColor=vec4(a,0.,0.,1.);}`;
  const MAIN = `precision mediump float;varying vec2 v;uniform sampler2D face,helm,depth,trail;uniform vec2 res,op,par,px;uniform float ia,sc,t;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  vec2 cover(vec2 u){float ca=res.x/res.y;vec2 f=ca>ia?vec2(1.,ia/ca):vec2(ca/ia,1.);f/=sc;return (1.-f)*op+u*f;}
  void main(){vec2 u=vec2(v.x,1.-v.y);vec2 ui=cover(u);
    float d=texture2D(depth,ui).r;vec2 up=ui+par*(d-.35)*vec2(.018,.012);
    float m=texture2D(trail,v).r;float nz=(n(v*vec2(res.x/res.y,1.)*5.+t*.4)-.5)*.22;
    float gx=texture2D(trail,v+vec2(px.x,0)).r-texture2D(trail,v-vec2(px.x,0)).r;
    float gy=texture2D(trail,v+vec2(0,px.y)).r-texture2D(trail,v-vec2(0,px.y)).r;
    vec2 g=vec2(gx,-gy);
    float e=smoothstep(.40,.47,m+nz);float band=smoothstep(.30,.44,m+nz)*(1.-e);
    vec2 refr=g*.045*(band+.35*e);
    vec3 fc=texture2D(face,up-refr*.6).rgb;vec3 hc=texture2D(helm,up+refr).rgb;
    vec3 c=mix(fc,hc,e);
    float rim=smoothstep(.0,.6,band)*(1.-smoothstep(.6,1.,band));
    c=mix(c,vec3(.80,.80,.73),rim*.55);c+=vec3(1.)*pow(max(0.,dot(normalize(vec3(g*6.,1.)),normalize(vec3(-.4,.6,1.)))),24.)*band*.35;
    gl_FragColor=vec4(c,1.);}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = fs => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link"); const U = {}; const nU = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nU; i++) { const a = gl.getActiveUniform(p, i), nm = a.name.replace("[0]", ""); U[nm] = gl.getUniformLocation(p, a.name); } return { p, U }; };
  const PT = prog(TRAIL), PM = prog(MAIN);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const tex = src => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); return t; };
  const TF = tex(imgs.face), TH = tex(imgs.helmet), TD = tex(imgs.depth);
  let fb = [], tw = 0, th = 0, cur = 0;
  const mkFB = () => { fb.forEach(f => { gl.deleteTexture(f.t); gl.deleteFramebuffer(f.f); }); fb = [0, 1].map(() => { const t = tex(null);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); return { t, f }; }); gl.bindFramebuffer(gl.FRAMEBUFFER, null); };
  const quad = P => { const l = gl.getAttribLocation(P.p, "p"); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  const api = {
    resize(w, h){ canvas.width = w; canvas.height = h; tw = Math.max(64, w >> 2); th = Math.max(64, h >> 2); mkFB(); },
    // s: {blobs:[[x,y,r]...] in 0..1 (x right, y down), op:[x,y], par:[x,y], scale, cssW, cssH, t}
    render(s){
      const src = fb[cur], dst = fb[1 - cur];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f); gl.viewport(0, 0, tw, th); gl.useProgram(PT.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform1i(PT.U.prev, 0);
      gl.uniform2f(PT.U.res, s.cssW, s.cssH); gl.uniform1f(PT.U.dec, .968); gl.uniform1f(PT.U.t, s.t);
      const mm = [], rr = []; s.blobs.forEach(b => { mm.push(b[0], 1 - b[1]); rr.push(b[2]); });
      gl.uniform2fv(PT.U.m, mm); gl.uniform1fv(PT.U.r, rr); quad(PT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(PM.p);
      [[TF, "face"], [TH, "helm"], [TD, "depth"], [dst.t, "trail"]].forEach(([t, nm], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(PM.U[nm], i); });
      gl.uniform2f(PM.U.res, s.cssW, s.cssH); gl.uniform2f(PM.U.op, s.op[0], s.op[1]); gl.uniform2f(PM.U.par, s.par[0], s.par[1]);
      gl.uniform2f(PM.U.px, 1.5 / tw, 1.5 / th); gl.uniform1f(PM.U.ia, 16 / 9); gl.uniform1f(PM.U.sc, s.scale); gl.uniform1f(PM.U.t, s.t);
      quad(PM); cur = 1 - cur;
    }
  };
  return api;
};
})();
