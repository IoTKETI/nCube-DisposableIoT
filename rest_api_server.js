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

const express = require("express");
const app = express();

app.use(express.text());
app.use(express.urlencoded({extended: true}));

app.post("/device/register", (req, res) => {
    body_json = JSON.parse(req.body.replaceAll('\'', '\"'));

    device_id = body_json.device_id;
    device_category = body_json.device_category;
    
    var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/' + conf.gateway_name;
    var rn = device_category;
    onem2m_client.create_cnt(parent, rn, 0, function (rsc, res_body, count) {
        if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
            
        }
        else {
            console.log('[???} create container error!');
        }
    });

    var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/' + conf.gateway_name + '/' + device_category;
    var rn = device_id;
    onem2m_client.create_cnt(parent, rn, 0, function (rsc, res_body, count) {
        if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
            
        }
        else {
            console.log('[???} create container error!');
        }
    });

    res.json({ok: true})
});

app.listen(8282, () => console.log("nCube for Disposable IoT"))