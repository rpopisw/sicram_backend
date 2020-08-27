var Doctor  = require('../../models/doctor')
var server = require('../../bin/www')
var request = require('request')
const chalk = require('chalk')

var url = 'https://sicramv1.herokuapp.com/api/'


    //antes de cada prueba
    beforeEach(function(done){
        //nos conectamos a la base de datos de pruebas
        var mongoose = require('mongoose');
        
        mongoose.set('useFindAndModify', false);
        mongoose.connect('mongodb://localhost:27017/test_Sicram', {
        useNewUrlParser: true,
        useUnifiedTopology: true 
        })
        .then(db => console.log(chalk.green('DB is connected')))
        .catch(err => console.log(err));

        done()
    })
    //despues de terminar las pruebas
    afterEach(function(done){
        //eliminamos la base de datos de pruebas
        Doctor.deleteMany({},function(err,result){
            if(err) console.log(err)
        })
        done()
    })

//suite
describe('probando API',function(){
    //prueba
    it('GET listar doctores', function(done){
        for (let index = 0; index <= 3; index++) {
            request.get(url+"especialidad", function(err,res,body){
                var resultado = JSON.parse(body)
                console.log("aqui"+res.body)
                expect(res.statusCode).toBe(200)
            })  
        }
        done()
    })
})

//suite
describe('probando API',function(){
    //prueba
    it('GET listar doctores', function(done){
        for (let index = 0; index <= 3; index++) {
            request.get(url+"doctor/listar", function(err,res,body){
                var resultado = JSON.parse(body)
                console.log("aqui"+res.body)
                expect(res.statusCode).toBe(200)
            })  
        }   
        done()
    })
})
//suite
describe('probando API',function(){
    //prueba
    it('GET listar doctores por especialidad', function(done){
        //for (let index = 0; index <= 3; index++) {
            request.get(
                {
                    headers:{'content-type':'application/json'},
                    url: url+"especialidad/doctores",
                    body:'{"especialidad": "Dermatologia"}',
                }
                , function(err,res,body){
                var resultado = JSON.parse(body)
                console.log("aqui"+res.body)
                expect(res.statusCode).toBe(200)
            })  
        //}   
        done()
    })
})