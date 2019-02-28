var fs = require('fs');
var elasticDb= require('./elasticSearch.js');
var mapping= require('./mapping.json');
var parse = require('csv-parse');

var inputObj = require('./input.js');

var services ={
    bulkInsert:async function(req,res){
        try{
            let path= __dirname+"/"+"dataFiles";
            let index= "tst_lax";

            let files = await services.getallFilesFromDirectory(path);            

           await services.deleteIndex(index) ;
            await services.createMapping(index);

            for (const filename of files) { 
                await services.readFile(path+"/"+filename,index) ;
            }

            res.status(200).json("done")
        }catch(err){
            res.status(500).json(err);
        }
        
    },
    getallFilesFromDirectory:function(folderpath){
        return new Promise(function(resolve,reject){
            fs.readdir(folderpath, function(err, filenames) {
                if (err) {
                  return reject(err);
                }
                resolve(filenames);
              });
        })
    },
    readFile:function(filepath,index){
        return new Promise(function(resolve,reject){
            const parser = parse({
                delimiter: ',',
                from_line:2
              }) ;
            
            let csvData=[];

            fs.createReadStream(filepath).pipe(parser)
                    .on('data', async function(csvrow) {
                        //do something with csvrow

                        csvData.push({
                            index: {
                            _index: index,
                            _type: "match_all"
                            }
                        })

                        if(services.isDate(csvrow[19])){
                            csvrow[19]= services.formateDate(csvrow[19])
                        }else{
                            csvrow[19]= "01-01-1900"
                        }

                        if(!csvrow[22]){
                            csvrow[22]= "01-01-1900"
                        }

                        if(!csvrow[31]){
                            csvrow[31]= "01-01-1900"
                        }

                        csvData.push(new inputObj(csvrow[0],csvrow[1],csvrow[2],csvrow[3],csvrow[4],csvrow[5],csvrow[6],csvrow[7],csvrow[8],csvrow[9],csvrow[10],csvrow[11],csvrow[12],csvrow[13],csvrow[14],
                            csvrow[15],csvrow[16],csvrow[17],csvrow[18],csvrow[19],csvrow[20],csvrow[21],csvrow[22],csvrow[23],csvrow[24],csvrow[25],csvrow[26],csvrow[27],csvrow[28],csvrow[29],
                            csvrow[30],csvrow[31],csvrow[32],csvrow[33],csvrow[34],csvrow[35],csvrow[36],csvrow[37],csvrow[38],csvrow[39],csvrow[40],csvrow[41],csvrow[42],csvrow[43],csvrow[44],csvrow[45],
                            csvrow[46],csvrow[47],csvrow[48]
                            ));
                           
                        if(csvData.length==100000)    {
                            let tempData= csvData;
                            csvData=[];
                            await services.bulkQuery(index,tempData)
                        }

                    })
                    .on('end',async function() {
                    //do something wiht csvData
                        if(csvData.length){
                            await services.bulkQuery(index,csvData)
                        }
                        resolve(csvData);
                    })
                    .on('error', function(error) {
                        console.log("error"+error)
                        reject(error);
                    });
        })
    },
    isDate : function(date) {
        return (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ) ? true : false;
    },
    formateDate:function(date) {
        if (typeof date == "string")
            date = new Date(date);
        var day = (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate());
        var month = (date.getMonth() + 1 <= 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1));
        var dateString = day + "-" + month + "-" + date.getFullYear();
        return dateString;
    },
    deleteIndex:function(index){
        return new Promise(function(resolve,reject){
            elasticDb.indices.delete({
                index:index
            },async function(err,resp,status){
                resolve(resp);
            })
        })
    },
    createMapping:function(index){
        return new Promise(function(resolve,reject){
            elasticDb.indices.create({
                "index":index,
                "body":mapping
            },async function(err,resp,status){
                await services.updateIndexSetting(index);
                resolve(resp);
            })
        })
    },
    updateIndexSetting:function(indexName){
        return new Promise(function(resolve,reject){
            elasticDb.indices.putSettings({
                index:indexName,
                body:{ 
                    "max_result_window" : 50000000 
                }
            },function(err,resp){
                if (err) return reject(err);
                resolve();
            })
        })
    },
    bulkQuery: function(index, data){
        return new Promise(function(resolve,reject){
            elasticDb.bulk({
                requestTimeout:600000,
                index:index,
                body:data
            },function(err,resp){
                
                if(err){
                  reject(err);
                }
                resolve();
            })  
        })
    }
}

module.exports=services;