"use strict";
var  puppeteer=  require('puppeteer'); 
//import puppeteer from 'puppeteer';
exports.scrapeProduct = async function scrapeProduct(url) {
    const Doctor = {
      cmp: '',
      apellidos: '',
      nombres: '',
      consejoRegional: '',
      registro: '',
      tipo: '',
      codigo: '',
  
    };
      const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      });
      const page = await browser.newPage();
      await page.goto(url);
  
      //CMP 
      const [cmp] = await page.$x('//*[@id="simple-example-table2"]/tbody/tr[1]/th[1]/center'); 
      const txt1 = await cmp.getProperty('textContent');
      Doctor.cmp = await txt1.jsonValue();
      //apellido
      const [apellido] = await page.$x('//*[@id="simple-example-table1"]/tbody/tr[2]/td[2]'); 
      const txt2 = await apellido.getProperty('textContent');
      Doctor.apellidos = await txt2.jsonValue();
      //nombre
      const [nombre] = await page.$x('//*[@id="wrapper"]/table[1]/tbody/tr[4]/td[2]'); 
      const txt3 = await nombre.getProperty('textContent');
      Doctor.nombres = await txt3.jsonValue();
      //consejoregional
      const [consejoRegional] = await page.$x('//*[@id="simple-example-table3"]/tbody/tr[2]/td[2]'); 
      const txt4 = await consejoRegional.getProperty('textContent');
      Doctor.consejoRegional = await txt4.jsonValue();
      //tipo
      const [tipo] = await page.$x('//*[@id="wrapper"]/table[5]/tbody/tr[3]/td[2]'); 
      const txt5 = await tipo.getProperty('textContent');
      Doctor.tipo = await txt5.jsonValue();
      //codigo
      const [codigo] = await page.$x('//*[@id="simple-example-table4"]/tbody/tr[2]/td[3]'); 
      const txt6 = await codigo.getProperty('textContent');
      Doctor.codigo = await txt6.jsonValue();
      //registro
      const [registro] = await page.$x('//*[@id="simple-example-table4"]/tbody/tr[2]/td[1]'); 
      const txt7 = await registro.getProperty('textContent');
      Doctor.registro = await txt7.jsonValue();
      
      console.log(Doctor);
      browser.close();
      return Doctor;
  }