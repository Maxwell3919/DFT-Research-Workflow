import puppeteer from 'puppeteer-core';
const base=(process.env.SITE_URL??'http://127.0.0.1:4322/DFT-Research-Workflow').replace(/\/+$/,'');
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN??'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const routes=[['/tools/','Tools','Scientific programming'],['/tools/ase/','Atomic Simulation Environment','Reviewed practical pages'],['/tools/vasp/','VASP','Restricted licence'],['/tools/aiida/','AiiDA','No reviewed practical page']];
try {
  for(const width of [1440,390]){
    const page=await browser.newPage(); await page.setCacheEnabled(false); await page.setViewport({width,height:844});
    for(const[route,title,phrase]of routes){
      const response=await page.goto(base+route,{waitUntil:'load'});
      const state=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent?.trim(),text:document.body.innerText,scripts:document.scripts.length,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}));
      if(response?.status()!==200||state.title!==title||!state.text.includes(phrase)||state.scripts||state.overflow) throw Error(`${route} ${width} ${JSON.stringify({status:response?.status(),title:state.title,text:state.text.includes(phrase),scripts:state.scripts,overflow:state.overflow})}`);
    }
    await page.close();
  }
  const page=await browser.newPage(); await page.setCacheEnabled(false); await page.setJavaScriptEnabled(false);
  for(const[route,title,phrase]of routes){const response=await page.goto(base+route,{waitUntil:'load'}),text=await page.$eval('body',x=>x.innerText);if(response?.status()!==200||!text.includes(title)||!text.includes(phrase))throw Error(`${route} no-js`)}
  console.log('Tools browser smoke passed: index and representative pages, 1440px/390px no-overflow, and no-JavaScript reading.');
} finally { await browser.close(); }
