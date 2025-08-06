const n=document.getElementsByTagName("canvas")[0];n.width=n.clientWidth;n.height=n.clientHeight;let D={TEXTURE_DOWNSAMPLE:1,DENSITY_DISSIPATION:.98,VELOCITY_DISSIPATION:.99,PRESSURE_DISSIPATION:.8,PRESSURE_ITERATIONS:25,CURL:30,SPLAT_RADIUS:.005},a=[],N=[];const{gl:e,ext:_}=Y(n);function Y(t){const o={alpha:!1,depth:!1,stencil:!1,antialias:!1};let r=t.getContext("webgl2",o);const i=!!r;i||(r=t.getContext("webgl",o)||t.getContext("experimental-webgl",o));let u,v;i?(r.getExtension("EXT_color_buffer_float"),v=r.getExtension("OES_texture_float_linear")):(u=r.getExtension("OES_texture_half_float"),v=r.getExtension("OES_texture_half_float_linear")),r.clearColor(0,0,0,1);const f=i?r.HALF_FLOAT:u.HALF_FLOAT_OES;let l,p,F;return i?(l=y(r,r.RGBA16F,r.RGBA,f),p=y(r,r.RG16F,r.RG,f),F=y(r,r.R16F,r.RED,f)):(l=y(r,r.RGBA,r.RGBA,f),p=y(r,r.RGBA,r.RGBA,f),F=y(r,r.RGBA,r.RGBA,f)),{gl:r,ext:{formatRGBA:l,formatRG:p,formatR:F,halfFloatTexType:f,supportLinearFiltering:v}}}function y(t,o,r,i){if(!k(t,o,r,i))switch(o){case t.R16F:return y(t,t.RG16F,t.RG,i);case t.RG16F:return y(t,t.RGBA16F,t.RGBA,i);default:return null}return{internalFormat:o,format:r}}function k(t,o,r,i){let u=t.createTexture();t.bindTexture(t.TEXTURE_2D,u),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,o,4,4,0,r,i,null);let v=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,v),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,u,0),t.checkFramebufferStatus(t.FRAMEBUFFER)==t.FRAMEBUFFER_COMPLETE}function O(){return{id:-1,x:0,y:0,dx:0,dy:0,down:!1,moved:!1,color:[30,0,300]}}a.push(O());class x{constructor(o,r){if(this.uniforms={},this.program=e.createProgram(),e.attachShader(this.program,o),e.attachShader(this.program,r),e.linkProgram(this.program),!e.getProgramParameter(this.program,e.LINK_STATUS))throw e.getProgramInfoLog(this.program);const i=e.getProgramParameter(this.program,e.ACTIVE_UNIFORMS);for(let u=0;u<i;u++){const v=e.getActiveUniform(this.program,u).name;this.uniforms[v]=e.getUniformLocation(this.program,v)}}bind(){e.useProgram(this.program)}}function T(t,o){const r=e.createShader(t);if(e.shaderSource(r,o),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw e.getShaderInfoLog(r);return r}const g=T(e.VERTEX_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
    `),j=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
    `),q=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
    `),K=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
    `),J=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (in sampler2D sam, in vec2 p) {
        vec4 st;
        st.xy = floor(p - 0.5) + 0.5;
        st.zw = st.xy + 1.0;
        vec4 uv = st * texelSize.xyxy;
        vec4 a = texture2D(sam, uv.xy);
        vec4 b = texture2D(sam, uv.zy);
        vec4 c = texture2D(sam, uv.xw);
        vec4 d = texture2D(sam, uv.zw);
        vec2 f = p - st.xy;
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main () {
        vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;
        gl_FragColor = dissipation * bilerp(uSource, coord);
        gl_FragColor.a = 1.0;
    }
    `),Q=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;

    void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
    }
    `),Z=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;

    vec2 sampleVelocity (in vec2 uv) {
        vec2 multiplier = vec2(1.0, 1.0);
        if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
        if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
        if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
        if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
        return multiplier * texture2D(uVelocity, uv).xy;
    }

    void main () {
        float L = sampleVelocity(vL).x;
        float R = sampleVelocity(vR).x;
        float T = sampleVelocity(vT).y;
        float B = sampleVelocity(vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
    `),$=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
    }
    `),ee=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = vec2(abs(T) - abs(B), 0.0);
        force *= 1.0 / length(force + 0.00001) * curl * C;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
    }
    `),re=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    vec2 boundary (in vec2 uv) {
        uv = min(max(uv, 0.0), 1.0);
        return uv;
    }

    void main () {
        float L = texture2D(uPressure, boundary(vL)).x;
        float R = texture2D(uPressure, boundary(vR)).x;
        float T = texture2D(uPressure, boundary(vT)).x;
        float B = texture2D(uPressure, boundary(vB)).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
    `),te=T(e.FRAGMENT_SHADER,`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    vec2 boundary (in vec2 uv) {
        uv = min(max(uv, 0.0), 1.0);
        return uv;
    }

    void main () {
        float L = texture2D(uPressure, boundary(vL)).x;
        float R = texture2D(uPressure, boundary(vR)).x;
        float T = texture2D(uPressure, boundary(vT)).x;
        float B = texture2D(uPressure, boundary(vB)).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
    `);let c,m,S,s,I,C,E;V();const L=new x(g,j),G=new x(g,q),h=new x(g,K),R=new x(g,_.supportLinearFiltering?Q:J),w=new x(g,Z),B=new x(g,$),A=new x(g,ee),U=new x(g,re),P=new x(g,te);function V(){c=e.drawingBufferWidth>>D.TEXTURE_DOWNSAMPLE,m=e.drawingBufferHeight>>D.TEXTURE_DOWNSAMPLE;const t=_.halfFloatTexType,o=_.formatRGBA,r=_.formatRG,i=_.formatR;S=M(2,c,m,o.internalFormat,o.format,t,_.supportLinearFiltering?e.LINEAR:e.NEAREST),s=M(0,c,m,r.internalFormat,r.format,t,_.supportLinearFiltering?e.LINEAR:e.NEAREST),I=b(4,c,m,i.internalFormat,i.format,t,e.NEAREST),C=b(5,c,m,i.internalFormat,i.format,t,e.NEAREST),E=M(6,c,m,i.internalFormat,i.format,t,e.NEAREST)}function b(t,o,r,i,u,v,f){e.activeTexture(e.TEXTURE0+t);let l=e.createTexture();e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,i,o,r,0,u,v,null);let p=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,p),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),e.viewport(0,0,o,r),e.clear(e.COLOR_BUFFER_BIT),[l,p,t]}function M(t,o,r,i,u,v,f){let l=b(t,o,r,i,u,v,f),p=b(t+1,o,r,i,u,v,f);return{get read(){return l},get write(){return p},swap(){let F=l;l=p,p=F}}}const d=(e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),e.STATIC_DRAW),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.enableVertexAttribArray(0),t=>{e.bindFramebuffer(e.FRAMEBUFFER,t),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)});let X=Date.now();W(parseInt(String(Math.random()*20))+5);H();function H(){ie();const t=Math.min((Date.now()-X)/1e3,.016);if(X=Date.now(),e.viewport(0,0,c,m),N.length>0){const r=N.pop();typeof r=="number"&&W(r)}R.bind(),e.uniform2f(R.uniforms.texelSize,1/c,1/m),e.uniform1i(R.uniforms.uVelocity,s.read[2]),e.uniform1i(R.uniforms.uSource,s.read[2]),e.uniform1f(R.uniforms.dt,t),e.uniform1f(R.uniforms.dissipation,D.VELOCITY_DISSIPATION),d(s.write[1]),s.swap(),e.uniform1i(R.uniforms.uVelocity,s.read[2]),e.uniform1i(R.uniforms.uSource,S.read[2]),e.uniform1f(R.uniforms.dissipation,D.DENSITY_DISSIPATION),d(S.write[1]),S.swap();for(let r=0;r<a.length;r++){const i=a[r];i.moved&&(z(i.x,i.y,i.dx,i.dy,i.color),i.moved=!1)}B.bind(),e.uniform2f(B.uniforms.texelSize,1/c,1/m),e.uniform1i(B.uniforms.uVelocity,s.read[2]),d(C[1]),A.bind(),e.uniform2f(A.uniforms.texelSize,1/c,1/m),e.uniform1i(A.uniforms.uVelocity,s.read[2]),e.uniform1i(A.uniforms.uCurl,C[2]),e.uniform1f(A.uniforms.curl,D.CURL),e.uniform1f(A.uniforms.dt,t),d(s.write[1]),s.swap(),w.bind(),e.uniform2f(w.uniforms.texelSize,1/c,1/m),e.uniform1i(w.uniforms.uVelocity,s.read[2]),d(I[1]),L.bind();let o=E.read[2];e.activeTexture(e.TEXTURE0+o),e.bindTexture(e.TEXTURE_2D,E.read[0]),e.uniform1i(L.uniforms.uTexture,o),e.uniform1f(L.uniforms.value,D.PRESSURE_DISSIPATION),d(E.write[1]),E.swap(),U.bind(),e.uniform2f(U.uniforms.texelSize,1/c,1/m),e.uniform1i(U.uniforms.uDivergence,I[2]),o=E.read[2],e.uniform1i(U.uniforms.uPressure,o),e.activeTexture(e.TEXTURE0+o);for(let r=0;r<D.PRESSURE_ITERATIONS;r++)e.bindTexture(e.TEXTURE_2D,E.read[0]),d(E.write[1]),E.swap();P.bind(),e.uniform2f(P.uniforms.texelSize,1/c,1/m),e.uniform1i(P.uniforms.uPressure,E.read[2]),e.uniform1i(P.uniforms.uVelocity,s.read[2]),d(s.write[1]),s.swap(),e.viewport(0,0,e.drawingBufferWidth,e.drawingBufferHeight),G.bind(),e.uniform1i(G.uniforms.uTexture,S.read[2]),d(null),requestAnimationFrame(H)}function z(t,o,r,i,u){h.bind(),e.uniform1i(h.uniforms.uTarget,s.read[2]),e.uniform1f(h.uniforms.aspectRatio,n.width/n.height),e.uniform2f(h.uniforms.point,t/n.width,1-o/n.height),e.uniform3f(h.uniforms.color,r,-i,1),e.uniform1f(h.uniforms.radius,D.SPLAT_RADIUS),d(s.write[1]),s.swap(),e.uniform1i(h.uniforms.uTarget,S.read[2]),e.uniform3f(h.uniforms.color,u[0]*.3,u[1]*.3,u[2]*.3),d(S.write[1]),S.swap()}function W(t){for(let o=0;o<t;o++){const r=[Math.random()*10,Math.random()*10,Math.random()*10],i=n.width*Math.random(),u=n.height*Math.random(),v=1e3*(Math.random()-.5),f=1e3*(Math.random()-.5);z(i,u,v,f,r)}}function ie(){(n.width!=n.clientWidth||n.height!=n.clientHeight)&&(n.width=n.clientWidth,n.height=n.clientHeight,V())}n.addEventListener("mousemove",t=>{a[0].moved=a[0].down,a[0].dx=(t.offsetX-a[0].x)*10,a[0].dy=(t.offsetY-a[0].y)*10,a[0].x=t.offsetX,a[0].y=t.offsetY});n.addEventListener("touchmove",t=>{t.preventDefault();const o=t.targetTouches;for(let r=0;r<o.length;r++){let i=a[r];i.moved=i.down,i.dx=(o[r].pageX-i.x)*10,i.dy=(o[r].pageY-i.y)*10,i.x=o[r].pageX,i.y=o[r].pageY}},!1);n.addEventListener("mousedown",()=>{a[0].down=!0,a[0].color=[Math.random()+.2,Math.random()+.2,Math.random()+.2]});n.addEventListener("touchstart",t=>{t.preventDefault();const o=t.targetTouches;for(let r=0;r<o.length;r++)r>=a.length&&a.push(O()),a[r].id=o[r].identifier,a[r].down=!0,a[r].x=o[r].pageX,a[r].y=o[r].pageY,a[r].color=[Math.random()+.2,Math.random()+.2,Math.random()+.2]});window.addEventListener("mouseup",()=>{a[0].down=!1});window.addEventListener("touchend",t=>{const o=t.changedTouches;for(let r=0;r<o.length;r++)for(let i=0;i<a.length;i++)o[r].identifier==a[i].id&&(a[i].down=!1)});
