#!/usr/bin/nodejs

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
const port = 3111;

companies={
	"kinchbus": {
		"domain": "kinchbus.co.uk"
	},
	"trentbarton": {
		"domain": "trentbarton.co.uk"
	}
};

function get_company(company_tag) {
	if (companies[company_tag]) {
		return companies[company_tag];
	} else {
		return false;
	};
};
app.get('/', function (req, res) {
	res.send('Welcome!');
});

app.post('/:company_tag/signin', function (req, res) {
	company=get_company(req.params.company_tag);
	if (!company) {
		res.send("Not a valid company");
	};

	username=req.body.username;
	password=req.body.password;

	//get viewstate
//	res.send(company);
	res.send(req.body);
});

app.listen(port, function() {
	for (var company_tag in companies) {
		console.log(`Loaded ${company_tag} on domain ${companies[company_tag]['domain']}`);
	};

	console.log(`Kinchango listening on port ${port}!`)
});
