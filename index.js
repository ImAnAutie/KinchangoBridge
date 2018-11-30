#!/usr/bin/nodejs

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
const port = 3111;
const request = require('request');
const { JSDOM } = require( 'jsdom' );
var cookiejars=[];
var cookieparse = require('cookie');

companies={
	"kinchbus": {
		"name": "kinchbus",
		"protocol": "https",
		"domain": "kinchbus.co.uk",
		"smartcardurl": "/kinchkard",
	},
	"trentbarton": {
		"name": "trentbarton",
		"protocol": "https",
		"domain": "trentbarton.co.uk",
		"smartcardurl": "/mango"
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
	res.send('Welcome to Kinchango!');
});

app.post('/:company_tag/signin', function (req, res) {
	company=get_company(req.params.company_tag);
	if (!company) {
		res.send("Not a valid company");
	};

	username=req.body.username;
	password=req.body.password;

	request(company.protocol+"://"+company.domain+company.smartcardurl, function (error, response, body) {
		console.log(`Getting ${company.name} smartcardurl viewstate`);
		if (error) {
			console.log('error:', error);
			console.log('statusCode:', response && response.statusCode);
		} else {
			console.log('statusCode:', response && response.statusCode);
			//console.log('body:', body);


			var myJSDom = new JSDOM (body);
			var $ = require('jquery')(myJSDom.window);
			formdata={};

			formdata['__EVENTTARGET']="";
			formdata['__EVENTARGUMENT']="";
			formdata['__VIEWSTATE']=$('#__VIEWSTATE').val();
			formdata['ctl00$ctl00$Main$ctl00$ctl01$txtUsername']=username;
			formdata['ctl00$ctl00$Main$ctl00$ctl01$txtPassword']=password;
			formdata['ctl00$ctl00$Main$ctl00$ctl01$btnLogin']=$('#Main_ctl00_ctl01_btnLogin').val();
			formdata['__VIEWSTATEGENERATOR']=$('#__VIEWSTATEGENERATOR').val();
			formdata['__EVENTVALIDATION']=$('#__EVENTVALIDATION').val();

			cookiejarindex=cookiejars.push( request.jar() ) - 1;
		
			request.post({url:company.protocol+"://"+company.domain+company.smartcardurl, followRedirect: false, form: formdata,jar: cookiejars[cookiejarindex]}, function(error,response,body){
				console.log(`Posting to ${company.name} smartcard url`);
				if (error) {
					console.log('error:', error);
					console.log('statusCode:', response && response.statusCode);
				} else {
					console.log('statusCode:', response && response.statusCode);

					cookies=cookieparse.parse(cookiejars[cookiejarindex].getCookieString(company.protocol+"://"+company.domain+company.smartcardurl));
					cookiejars[cookiejarindex]=null;

					result={};
					if (cookies['MangoUser_ID']) {
							console.log("Signed in");
							result.status=true;
							result.authenticationtoken=cookies;
					} else {
							console.log("Sign in failure.");
							result.status=false;
							result.status_human=`Failed to sign in. Either incorrect username/password or ${company.name} server error.`;
					};

					res.json(result);
				};
			});

		};
	});
});




app.get('/:company_tag/profile', function (req, res) {
	company=get_company(req.params.company_tag);
	if (!company) {
		res.send("Not a valid company");
	};

	var url = company.protocol+"://"+company.domain+company.smartcardurl+"/profile";
	var cookiejarindex=cookiejars.push( request.jar() ) - 1;
	try {
		authenticationtoken=JSON.parse(req.query.authenticationtoken);
		cookiejars[cookiejarindex].setCookie(request.cookie('MangoUser_ID='+authenticationtoken['MangoUser_ID']), url);
		cookiejars[cookiejarindex].setCookie(request.cookie('MangoUser_Token='+authenticationtoken['MangoUser_Token']), url);
	} catch (error) {
		console.log(error);
		result={};
		result.status=false;
		result.status_human=`Invalid authentication token`;
		res.json(result);
		return;
	};

	console.log(url);
	request.get({url:url, followRedirect: false, jar: cookiejars[cookiejarindex]}, function(error,response,body){
		console.log(`getting ${company.name} smartcard profile`);
		if (error) {
			console.log('error:', error);
			console.log('statusCode:', response && response.statusCode);
		} else {
			console.log('statusCode:', response && response.statusCode);

			if (response.statusCode!=200) {
				result={};
				result.status=false;
				result.status_human=`Unknown status from ${company.name}`;
				res.json(result);
				return;
			};
			var myJSDom = new JSDOM (body);
			var $ = require('jquery')(myJSDom.window);

			result={};
			result.status=true;
			result.profile={};

			result.profile.name={};
			result.profile.name.title=$('#Main_ctl01_ctrlProfile_drpTitle').val();
			result.profile.name.firstname=$('#Main_ctl01_ctrlProfile_txtFirstName').val();
			result.profile.name.surname=$('#Main_ctl01_ctrlProfile_txtSurname').val();

			result.profile.address={};
			result.profile.address.postcode=$('#Main_ctl01_ctrlProfile_txtPostcode').val();
			result.profile.address.housenumber=$('#Main_ctl01_ctrlProfile_txtHouseNumber').val();
			result.profile.address.street=$('#Main_ctl01_ctrlProfile_txtStreet').val();
			result.profile.address.address1=$('#Main_ctl01_ctrlProfile_txtAddress1').val();
			result.profile.address.address2=$('#Main_ctl01_ctrlProfile_txtAddress2').val();
			result.profile.address.town=$('#Main_ctl01_ctrlProfile_txtTown').val();
			result.profile.address.county=$('#Main_ctl01_ctrlProfile_txtCounty').val();

			result.profile.misc={};
			result.profile.misc.phone=$('#Main_ctl01_ctrlProfile_txtPhone').val();
			result.profile.misc.email=$('#Main_ctl01_ctrlProfile_txtEmailAddress').val();
			result.profile.misc.dob=$('#Main_ctl01_ctrlProfile_txtDateOfBirth').val();
			result.profile.misc.twitter=$('#Main_ctl01_ctrlProfile_txtTwitterUsername').val();
			result.profile.misc.keepinformed=$('#Main_ctl01_ctrlProfile_chkKeepInformed').is(':checked');

			result.profile.news={};
			$('.serviceChkBoxList').find('.chkBoxItem').each(function( index ) {
				service={};
				service.name=$(this).find('span').text();
				service.checked=$(this).find('[type="checkbox"]').is(':checked');
				result.profile.news[service.name.replace(/\s/g, '')]=service;
			});

			res.json(result);
		};
	});
});

app.listen(port, function() {
	for (var company_tag in companies) {
		console.log(`Loaded ${company_tag} on domain ${companies[company_tag]['domain']}`);
	};

	console.log(`Kinchango listening on port ${port}!`)
});
