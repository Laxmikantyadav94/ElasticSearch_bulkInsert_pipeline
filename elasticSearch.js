var elasticsearch = require('elasticsearch');
var clientlocal = new elasticsearch.Client({
   hosts: [ 'http://localhost:9200']
});

var client = new elasticsearch.Client({
   hosts: [ 'https://vpc-fs-searchtool-djvapr2kgvdzhckjo3mzlilqbm.us-west-2.es.amazonaws.com'],
   timeout: 12000000
});

module.exports=client;