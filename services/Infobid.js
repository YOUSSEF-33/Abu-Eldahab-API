import followRedirects from 'follow-redirects';
const { https } = followRedirects;
import fs from 'fs';

export const InfobidSendMessage = (postData) => {

    var options = {
        'method': 'POST',
        'hostname': '2m16ew.api.infobip.com',
        'path': '/whatsapp/1/message/template',
        'headers': {
            'Authorization': 'App f66bc2f948964e6dd8a58c8acb7fa44b-830e447f-9f89-4817-a1fc-fdd3957a07f4',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        'maxRedirects': 20
    };

    var req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });

        res.on("error", function (error) {
            console.error(error);
        });
    });
    //console.log(postData)
    req.write(postData);
    req.end();
}