import {test,expect} from "@playwright/test";

test("embedded mount leaves the main landmark to the host, standalone retains one", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => (window).ready.length)).toBe(1);
  await expect(page.locator("pma-candy-snake").locator("main, [role=main]")).toHaveCount(0);
  await page.goto("http://127.0.0.1:5301/");
  await expect(page.locator("main")).toHaveCount(1);
});
test.use({hasTouch:true});
const tag="pma-candy-snake";
test("renderer failure releases allocated resources and reconnect recovers", async ({page}) => {
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.addInitScript(()=>{
   window.contexts=[];const Audio=window.AudioContext;
   window.AudioContext=class extends Audio{constructor(...args){super(...args);window.contexts.push(this)}};
 });
 await initialized(page);
 await page.evaluate(tag=>document.querySelector(tag).remove(),tag);
 await expect.poll(()=>page.evaluate(()=>window.contexts.every(c=>c.state==="closed"))).toBe(true);
 await page.evaluate(tag=>{
   window.contexts=[];window.ready=[];window.failures=[];window.failureSignals=[];
   const add=EventTarget.prototype.addEventListener;
   EventTarget.prototype.addEventListener=function(type,listener,options){
     if(options?.signal)window.failureSignals.push(options.signal);
     return add.call(this,type,listener,options);
   };
   window.originalGetContext=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){
     if(type==="webgl"||type==="webgl2"||type==="experimental-webgl"){
       window.failedCanvas=this;throw Error("renderer unavailable");
     }
     return window.originalGetContext.call(this,type,...args);
   };
   window.failedElement=document.createElement(tag);
   document.querySelector("#player").append(window.failedElement);
   EventTarget.prototype.addEventListener=add;
 },tag);
 await expect.poll(()=>page.evaluate(()=>window.failures)).toEqual([{gameId:tag.slice(4),message:"Unable to start game. Please try again."}]);
 expect(await page.evaluate(()=>window.contexts.length)).toBe(1);
 await expect.poll(()=>page.evaluate(()=>window.contexts.every(c=>c.state==="closed"))).toBe(true);
 expect(await page.evaluate(()=>window.failureSignals.length)).toBeGreaterThan(0);
 expect(await page.evaluate(()=>window.failureSignals.every(signal=>signal.aborted))).toBe(true);
 expect(await page.evaluate(()=>window.failedCanvas.isConnected)).toBe(false);
 expect(await page.evaluate(()=>window.ready)).toEqual([]);
 await page.evaluate(()=>{
   window.failedElement.remove();
   HTMLCanvasElement.prototype.getContext=window.originalGetContext;
   document.querySelector("#player").append(window.failedElement);
 });
 await expect.poll(()=>page.evaluate(()=>window.ready.length)).toBe(1);
 await start(page.locator(tag),page);
 await assertPlaying(page.locator(tag));
 await page.evaluate(tag=>document.querySelector(tag).remove(),tag);
 await expect.poll(()=>page.evaluate(()=>window.contexts.every(c=>c.state==="closed"))).toBe(true);
 expect(errors).toEqual([]);
});
test("disconnect during boot cancels the old session before reconnect",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await initialized(page);
 await page.evaluate(tag=>{
   document.querySelector(tag).remove();
   const el=document.createElement(tag),host=document.querySelector("#player");
   host.append(el);el.remove();host.append(el);
 },tag);
 await expect.poll(()=>page.evaluate(()=>window.ready.length)).toBe(2);
 await expect(page.locator(tag+" canvas")).toHaveCount(1);
 await page.waitForTimeout(250);
 expect(errors).toEqual([]);
});
test("paused removal releases resources even when animation frames stop",async({page})=>{
 await page.addInitScript(()=>{
   window.contexts=[];window.buffers=[];const Audio=window.AudioContext;
   for(const prototype of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype]){
     const create=prototype.createBuffer;
     prototype.createBuffer=function(){const buffer=create.call(this);window.buffers.push({gl:this,buffer});return buffer};
   }
   window.AudioContext=class extends Audio{constructor(...args){super(...args);window.contexts.push(this)}};
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=callback=>raf(time=>{if(!window.freezeFrames)callback(time)});
 });
 const game=await initialized(page);await start(game,page);
 await page.evaluate(tag=>document.querySelector(tag).pause(),tag);
 await assertPaused(game);
 await page.evaluate(tag=>{
   const el=document.querySelector(tag),canvas=el.shadowRoot.querySelector("canvas");
   window.gl=canvas.getContext("webgl")||canvas.getContext("webgl2");
   window.freezeFrames=true;
 },tag);
 await page.waitForTimeout(100);
 expect(await page.evaluate(()=>window.buffers.some(({gl,buffer})=>gl.isBuffer(buffer)))).toBe(true);
 await page.evaluate(tag=>document.querySelector(tag).remove(),tag);
 await expect.poll(()=>page.evaluate(()=>window.contexts.every(c=>c.state==="closed"))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.buffers.every(({gl,buffer})=>!gl.isBuffer(buffer)))).toBe(true);
});
test("cross-origin component initializes a playable scene",async({page})=>{
await page.goto("/");
await expect.poll(()=>page.evaluate(tag=>Boolean(customElements.get(tag)),tag)).toBe(true);
await expect(page.locator(tag+" canvas")).toBeVisible();
await expect.poll(()=>page.evaluate(()=>window.ready)).toEqual([{gameId:tag.slice(4)}]);
});
async function initialized(page) {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => window.ready.length)).toBe(1);
  return page.locator(tag);
}
async function canvasClick(game, x, y) {
  const canvas = game.locator("canvas"), box = await canvas.boundingBox();
  await canvas.click({position:{x:box.width*x,y:box.height*y}});
}
test("host input, focus pause, native activation, lifetime and ten reconnects", async ({page}) => {
  const errors=[]; page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(() => {
    window.contexts=[];window.detached=[];window.visibilityListeners=new Set();
    window.originalBlur=()=>{};window.originalFocus=()=>{};
    window.onblur=window.originalBlur;window.onfocus=window.originalFocus;
    const add=document.addEventListener.bind(document),remove=document.removeEventListener.bind(document);
    document.addEventListener=function(type,listener,options){
      if(type==="visibilitychange"){
        window.visibilityListeners.add(listener);
        if(options?.signal) options.signal.addEventListener("abort",()=>window.visibilityListeners.delete(listener),{once:true});
      }
      return add(type,listener,options);
    };
    document.removeEventListener=function(type,listener,options){
      if(type==="visibilitychange")window.visibilityListeners.delete(listener);
      return remove(type,listener,options);
    };
    const Audio=window.AudioContext;
    window.AudioContext=class extends Audio{constructor(...args){super(...args);window.contexts.push(this)}};
    for(const [prototype,method] of [[CanvasRenderingContext2D.prototype,"drawImage"],[CanvasRenderingContext2D.prototype,"fillRect"],[WebGLRenderingContext.prototype,"drawArrays"],[WebGL2RenderingContext.prototype,"drawArrays"]]){
      const original=prototype[method];prototype[method]=function(...args){
        for(const record of window.detached)if(record.canvas===this.canvas&&!this.canvas.isConnected)record.draws++;
        return original.apply(this,args);
      };
    }
  });
  const game=await initialized(page);
  await start(game,page);
  await assertPlaying(game);
  await page.getByLabel("Host text").fill("a w s d ");
  await page.getByLabel("Host text").press("Space");
  await expect(page.getByLabel("Host text")).toHaveValue("a w s d  ");
  await assertPaused(game);
  await page.getByRole("button",{name:"Host button",exact:true}).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button",{name:"Host clicked",exact:true})).toBeVisible();
  await resume(game,page);
  await assertPlaying(game);
  await page.evaluate(tag=>document.querySelector(tag).pause(),tag);
  await assertPaused(game);
  await restart(game,page);
  await assertPlaying(game);
  await expect.poll(()=>page.evaluate(()=>window.onblur===window.originalBlur&&window.onfocus===window.originalFocus)).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.contexts.length)).toBeGreaterThan(0);
  for(let i=0;i<10;i++){
    await page.evaluate(tag=>{
      const el=document.querySelector(tag);window.detached.push({canvas:el.shadowRoot.querySelector("canvas"),draws:0});
      el.remove();window.removed=el;
    },tag);
    await page.waitForTimeout(150);
    await expect.poll(()=>page.evaluate(()=>window.contexts.every(c=>c.state==="closed"))).toBe(true);
    await expect.poll(()=>page.evaluate(()=>window.visibilityListeners.size)).toBe(0);
    const draws=await page.evaluate(()=>window.detached.map(r=>r.draws));
    await page.waitForTimeout(100);
    expect(await page.evaluate(()=>window.detached.map(r=>r.draws))).toEqual(draws);
    await page.evaluate(()=>document.querySelector("#player").append(window.removed));
    await expect.poll(()=>page.evaluate(()=>window.ready.length)).toBe(i+2);
    await expect(game.locator("canvas")).toHaveCount(1);
    await start(game,page);
  }
  expect(await page.evaluate(()=>window.failures)).toEqual([]);
  expect(errors).toEqual([]);
});
test("real controls render within 900, 390 and 320 pixel hosts",async({page},info)=>{
  const game=await initialized(page);
  for(const width of [900,390,320]){
    await page.locator("#player").evaluate((el,width)=>el.style.width=width+"px",width);
    await expect.poll(()=>game.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await game.screenshot({path:info.outputPath("component-"+width+".png")});
    await page.evaluate(tag=>{const el=document.querySelector(tag);el.remove();document.querySelector("#player").append(el)},tag);
    await expect(game.locator("canvas")).toBeVisible();
    await game.screenshot({path:info.outputPath("fresh-"+width+".png")});
  }
  await start(game,page);
  await game.screenshot({path:info.outputPath("playing-320.png")});
  expect((await game.locator("canvas").boundingBox()).height).toBeGreaterThan((await game.boundingBox()).height - 2);
});
test("safe setup error and reconnect recovery",async({page})=>{
  await page.addInitScript(()=>{
    const create=document.createElement.bind(document);window.failSetup=true;
    document.createElement=function(name,...args){if(name==="div"&&window.failSetup)throw Error("private setup detail");return create(name,...args)};
  });
  await page.goto("/");
  await expect.poll(()=>page.evaluate(()=>window.failures)).toEqual([{gameId:tag.slice(4),message:"Unable to start game. Please try again."}]);
  expect(await page.evaluate(()=>window.ready)).toEqual([]);
  await page.evaluate(tag=>{window.failSetup=false;const el=document.querySelector(tag);el.remove();document.querySelector("#player").append(el)},tag);
  await expect.poll(()=>page.evaluate(()=>window.ready.length)).toBe(1);
});

async function start(game,page){await game.locator(".game-container").focus();await page.keyboard.press("Space");await assertPlaying(game);}
async function assertPlaying(game){await expect(game.locator("canvas")).toHaveAttribute("aria-label",/Playing.*Score: 0/);}
async function assertPaused(game){await expect(game.locator("canvas")).toHaveAttribute("aria-label",/Paused/);}
async function resume(game,page){await game.locator(".game-container").focus();await page.keyboard.press("Escape");}
async function restart(game){await canvasClick(game,.5,.5+38/820);}
test("keyboard and touch steer, scored round emits once and replay resets",async({page})=>{
 page.on('pageerror', error => { throw error; });
 await page.clock.install();
 const game=await initialized(page);
 await page.clock.pauseAt(new Date(Date.now()+100));
 // A repeatable PRNG preserves Phaser's unique texture IDs and places food at (9,15).
 await page.evaluate(()=>{let seed=1;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}});
 await game.locator(".game-container").focus();await page.keyboard.press("Space");await page.clock.runFor(32);
 await assertPlaying(game);
 await page.clock.runFor(900);
 await page.keyboard.press("ArrowDown");await page.clock.runFor(900);
 await expect(game.locator("canvas")).toHaveAttribute("aria-label", /Score: 10/);
 await page.keyboard.press("ArrowLeft");await page.clock.runFor(180);
 await expect(game.locator("canvas")).toHaveAttribute("aria-label", /Direction: left/);
 const box=await game.locator("canvas").boundingBox();
 const cdp=await page.context().newCDPSession(page);
 const x=box.x+box.width/2,y=box.y+box.height/2;
 await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
 await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y-70}]});
 await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
 await page.clock.runFor(180);
 await expect(game.locator("canvas")).toHaveAttribute("aria-label", /Direction: up/);
 await cdp.detach();
 // Advance real scene ticks through wall collisions and all three lives.
 await page.clock.runFor(12000);
 expect(await page.evaluate(()=>window.rounds)).toEqual([{gameId:"candy-snake",mode:"classic",score:10}]);
 await expect(game.locator("canvas")).toHaveAttribute("aria-label","Game Over. Score: 10");
 await game.locator(".game-container").focus();await page.keyboard.press("Space");await page.clock.runFor(32);
 await assertPlaying(game);
 expect(await page.evaluate(()=>window.rounds.length)).toBe(1);
});

test("audio loads from the game origin and standalone shares the playable mount",async({page})=>{
 const audio=[];page.on("response",r=>{if(r.url().endsWith(".mp3"))audio.push([r.url(),r.status()])});
 await initialized(page);
 expect(audio).toHaveLength(8);
 for(const [url,status]of audio){expect(url).toMatch(/^http:\/\/127.0.0.1:5301\/audio\//);expect(status).toBe(200);}
 await page.goto("http://127.0.0.1:5301");
 await expect(page.locator("canvas")).toHaveAttribute("aria-label",/Candy Snake/);
 await page.locator("#game").focus();await page.keyboard.press("Space");
 await expect(page.locator("canvas")).toHaveAttribute("aria-label",/Playing/);
 const box=await page.locator("canvas").boundingBox(),cdp=await page.context().newCDPSession(page);
 const x=box.x+box.width/2,y=box.y+box.height/2;
 await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
 await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y-70}]});
 await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
 await expect(page.locator("canvas")).toHaveAttribute("aria-label",/Direction: up/);
 await cdp.detach();
});
