var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var csv = require('fast-csv');
const prompt = require('prompt-sync')();

const country = prompt('What is the country? ');
const city = prompt('What is the city? ');
const url = "https://www.cargoyellowpages.com/en/"; // Site Url

var cleanString = (str) =>{
	var res = str.toLowerCase();
	res = res.replace(" ", "-");
	return res;
}

var getDataByUrl = (country, city) => {
	var file_final = `companies-${country}-${city}.csv`;
	var ws = fs.createWriteStream(file_final);
	request(`${url+country}/${city}/`, function(err, res, body) {
		if (err) console.log('Erro: ' + err);

		var $ = cheerio.load(body);

		var data = [];

		$('.bubbleInfo').each(function() {
			var company_name = $(this).find("span a").text().trim();

			var email_str = $(this).find(".mailinline").html();
			if(email_str != null){
				var email_res = email_str.replace(/<img[^>]*>/g,"@");
			}

			var company_site = $(this).find("img[alt*='Visit']").next().text();

			company = {
				company_name: company_name,
				company_email: email_res,
				company_site: company_site
			}
			
			data.push(company);
		});

		csv.write(data, {headers:true})
		.pipe(ws);

		console.log("File created");
	});
}

getDataByUrl( cleanString(country), cleanString(city) );


