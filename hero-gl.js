/* Rowan Vale demo: hero liquid reveal in WebGL (lazy-loaded; main.js falls back to the 2D canvas if this fails).
   Pass 1 (half-res ping-pong FBO): metaball trail under the cursor that decays and drifts like liquid.
   Pass 2: face/helmet mix through a thresholded (gooey) mask, refraction from the mask gradient at the edge,
   and depth parallax from a generated depth map so the head moves in 3D with the pointer. */
(function(){
window.RVHeroGL = function(canvas, imgs){
  const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "low-power" });
  if (!gl) throw new Error("no webgl");
  const VS = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  // trail pass (quarter res): r = liquid mask, g/b = its gradient (for refraction), a = edge noise
  const TRAIL = `precision mediump float;varying vec2 v;uniform sampler2D prev;uniform vec2 res,tpx;uniform vec2 m[5];uniform float r[5];uniform float dec;uniform float t;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  void main(){vec2 asp=vec2(res.x/res.y,1.);
    vec2 flow=vec2(n(v*4.+t*.35)-.5,n(v*4.+17.+t*.35)-.5)*.004;
    float a=texture2D(prev,v+flow).r*dec;
    float f=0.;for(int k=0;k<5;k++){vec2 d=(v-m[k])*asp;f+=r[k]*r[k]/(dot(d,d)+1e-4);}
    a=max(a,clamp(f*.9,0.,1.));
    float gx=texture2D(prev,v+vec2(tpx.x,0)).r-texture2D(prev,v-vec2(tpx.x,0)).r;
    float gy=texture2D(prev,v+vec2(0,tpx.y)).r-texture2D(prev,v-vec2(0,tpx.y)).r;
    float nz=n(v*asp*5.+t*.4);
    gl_FragColor=vec4(a,clamp(.5+gx*2.,0.,1.),clamp(.5-gy*2.,0.,1.),nz);}`;
  // main pass: 3-4 texture reads per pixel
  const MAIN = `precision mediump float;varying vec2 v;uniform sampler2D face,helm,depth,trail;uniform vec2 res,op,par,cur,tpx2;uniform float ia,sc,fade,pres;
  vec2 cover(vec2 u){float ca=res.x/res.y;vec2 f=ca>ia?vec2(1.,ia/ca):vec2(ca/ia,1.);f/=sc;return (1.-f)*op+u*f;}
  void main(){vec2 u=vec2(v.x,1.-v.y);vec2 ui=cover(u);
    float d=texture2D(depth,ui).r;vec2 up=ui+par*(d-.35)*vec2(.018,.012);
    vec4 T=texture2D(trail,v);float mm=T.r+(T.a-.5)*.22;vec2 g=(T.gb-.5)*.5;
    float e=smoothstep(.40,.47,mm);float band=smoothstep(.30,.44,mm)*(1.-e);
    vec2 refr=g*.045*(band+.35*e);
    // glass shell: the helmet silhouette (depth.g) sits in front of the face, so it gets more parallax;
    // near the cursor it shows as a refracting glass outline with a moving highlight (stands in for the 3D visor)
    vec2 us=ui+par*vec2(.03,.02);float S=texture2D(depth,us).g;
    float near=pres*(1.-smoothstep(.10,.42,length((u-cur)*vec2(res.x/res.y,1.))));
    vec2 sg=vec2(0.);float srim=0.;
    if(near>.003&&S>.004&&S<.996){sg=vec2(texture2D(depth,us+vec2(tpx2.x,0)).g-texture2D(depth,us-vec2(tpx2.x,0)).g,texture2D(depth,us+vec2(0,tpx2.y)).g-texture2D(depth,us-vec2(0,tpx2.y)).g);
      srim=smoothstep(.06,.5,length(sg));}
    float sin_=smoothstep(.2,.8,S)*near;
    // face and helmet carry a cut-out alpha, so the topo lines show around the head as in the original
    vec4 F=texture2D(face,up-refr*.6+sg*.012*near);vec3 c=F.rgb;float A=F.a;
    float gls=sin_*.35;c=mix(c,c*.94+vec3(.06),gls);A=max(A,gls*.5);
    float rl=srim*near*.55;c=mix(c,vec3(.52,.54,.52),rl);A=max(A,rl);
    float sb=dot(ui-vec2(.5,.25),normalize(vec2(1.,-.6)))-par.x*.035+par.y*.015;float spec=exp(-sb*sb*1400.)*sin_*.22;
    c+=vec3(spec);A=max(A,spec);
    if(e+band>.001){vec4 H=texture2D(helm,up+refr);c=mix(c,H.rgb,e*H.a);A=max(A,e*H.a);
      float rim=smoothstep(.0,.6,band)*(1.-smoothstep(.6,1.,band))*.55;
      c=mix(c,vec3(.80,.80,.73),rim);A=max(A,rim);float sp=pow(max(0.,dot(normalize(vec3(g*6.,1.)),normalize(vec3(-.4,.6,1.)))),24.)*band*.35;c+=vec3(sp);A=max(A,sp);}
    vec2 q=(u-vec2(.5,.55))/vec2(1.2,.95);float al=1.-smoothstep(.6,1.,length(q));al*=clamp(u.y*res.y/fade,0.,1.);al*=A;
    gl_FragColor=vec4(c*al,al);}`;
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
  // textures can be uploaded one per idle slot (api.uploadNext) so a phone never takes the whole hit in one frame
  const TF = tex(null), TH = tex(null), TD = tex(null), pend = [[TD, imgs.depth], [TH, imgs.helmet], [TF, imgs.face]];
  const upload = () => { const [t, src] = pend.shift(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); };
  let fb = [], tw = 0, th = 0, cur = 0;
  const mkFB = () => { fb.forEach(f => { gl.deleteTexture(f.t); gl.deleteFramebuffer(f.f); }); fb = [0, 1].map(() => { const t = tex(null);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); return { t, f }; }); gl.bindFramebuffer(gl.FRAMEBUFFER, null); };
  const quad = P => { const l = gl.getAttribLocation(P.p, "p"); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  const api = {
    uploadNext(){ if (pend.length) upload(); return !pend.length; },
    resize(w, h){ canvas.width = w; canvas.height = h; tw = Math.max(64, w >> 2); th = Math.max(64, h >> 2); mkFB(); },
    // s: {drops:[[x,y,r]...] in 0..1 (x right, y down), op:[x,y], par:[x,y], scale, cssW, cssH, t}
    render(s){
      while (pend.length) upload();
      const src = fb[cur], dst = fb[1 - cur];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f); gl.viewport(0, 0, tw, th); gl.useProgram(PT.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform1i(PT.U.prev, 0);
      gl.uniform2f(PT.U.res, s.cssW, s.cssH); gl.uniform2f(PT.U.tpx, 1.5 / tw, 1.5 / th); gl.uniform1f(PT.U.dec, .968); gl.uniform1f(PT.U.t, s.t);
      const mm = [], rr = []; s.drops.forEach(b => { mm.push(b[0], 1 - b[1]); rr.push(b[2]); });
      gl.uniform2fv(PT.U.m, mm); gl.uniform1fv(PT.U.r, rr); quad(PT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(PM.p);
      [[TF, "face"], [TH, "helm"], [TD, "depth"], [dst.t, "trail"]].forEach(([t, nm], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(PM.U[nm], i); });
      gl.uniform2f(PM.U.res, s.cssW, s.cssH); gl.uniform2f(PM.U.op, s.op[0], s.op[1]); gl.uniform2f(PM.U.par, s.par[0], s.par[1]);
      gl.uniform1f(PM.U.ia, 16 / 9); gl.uniform1f(PM.U.sc, s.scale); gl.uniform1f(PM.U.fade, s.fade || 48);
      gl.uniform2f(PM.U.cur, s.cur ? s.cur[0] : -9, s.cur ? s.cur[1] : -9); gl.uniform1f(PM.U.pres, s.pres || 0); gl.uniform2f(PM.U.tpx2, 2 / 512, 2 / 288);
      quad(PM); cur = 1 - cur;
    }
  };
  return api;
};
})();
