/**
 * Copyright (c) 2018, OCEAN
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Created by SEOKJUN, LEE in KETI on 2021-12-03.
 */

const EDGEX_SUBSCRIPTION_PATH = '/api/v2/subscription';
const EDGEX_SUBSCRIPTION_PORT = '59860';

function http_post(path, port, bodyString) {
    var options = {
        hostname: 'localhost',
        port: port,
        path: path,
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    http = require('http');    

    var res_body = '';
    var req = http.request(options, function (res) {
        res.on('data', function (chunk) {
            res_body += chunk;
        });
        console.log(res_body)
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(bodyString);
    req.end();
}

function subscribe_device_register(){
    request = [{
        apiVersion: "v2",
        subscription: {
            name: "DisposableIoT-Device-Registration-Handler",
            receiver: "nCube-DisposableIoT",
            adminState: "UNLOCKED",
            categories: [
                "DisposableIoT"
            ],
            labels: [
                "device-registration"
            ],            
            channels: [
                {
                    type: "REST",
                    httpMethod: "POST",
                    host: "dockerhost",
                    port: 8282,
                    path: "/device/register"
                }              
            ]
        }
    }];
    
    bodyString = JSON.stringify(request);
    console.log(bodyString)
    http_post(EDGEX_SUBSCRIPTION_PATH, EDGEX_SUBSCRIPTION_PORT, bodyString, function (res, res_body) {
        console.log(res, res_body);
    });
}

module.exports = {
    subscribe_device_register : subscribe_device_register    
}