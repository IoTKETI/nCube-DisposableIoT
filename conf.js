/**
 * Created by SEOKJUN, LEE in KETI on 2021-12-03.
 */

/**
 * Copyright (c) 2018, OCEAN
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var conf = {};
var cse = {};
var ae = {};
var cnt_arr = [];
var sub_arr = [];

conf.useprotocol = 'http'; // select one for 'http' or 'mqtt' or 'coap' or 'ws'

// build cse
cse.host        = '203.253.128.161';
cse.port        = '7579';
cse.name        = 'Mobius';
cse.id          = '/Mobius2';
cse.mqttport    = '1883';
cse.wsport      = '7577';

/*********** build ae (Disposable IoT Service) *************/
ae.name         = 'DisposableIoT';

ae.id           = 'S'+ae.name;

ae.parent       = '/' + cse.name;
ae.appid        = 'disposableiot';
ae.port         = '9727';
ae.bodytype     = 'json'; // select 'json' or 'xml' or 'cbor'
ae.tasport      = '3105';
/*********** build ae (Disposable IoT Edge Gateway) end *************/

// build cnt
var count = 0;
conf.gateway_name = 'Gateway1'
cnt_arr[count] = {};
cnt_arr[count].parent = '/' + cse.name + '/' + ae.name;
cnt_arr[count++].name = conf.gateway_name;
cnt_arr[count] = {};
cnt_arr[count].parent = '/' + cse.name + '/' + ae.name + '/' + conf.gateway_name;
cnt_arr[count++].name = 'gateway_information';
cnt_arr[count] = {};
cnt_arr[count].parent = '/' + cse.name + '/' + ae.name + '/' + conf.gateway_name;
cnt_arr[count++].name = 'service_deploy';
cnt_arr[count] = {};
cnt_arr[count].parent = '/' + cse.name + '/' + ae.name + '/' + conf.gateway_name;
cnt_arr[count++].name = 'stationary_device';
cnt_arr[count] = {};
cnt_arr[count].parent = '/' + cse.name + '/' + ae.name + '/' + conf.gateway_name;
cnt_arr[count++].name = 'disposable_device';

conf.port = 8282
count = 0;
sub_arr[count] = {};
sub_arr[count].parent = '/' + cse.name + '/' + ae.name + '/' + conf.gateway_name + '/' + 'service_deploy';
sub_arr[count].name = 'sub';
sub_arr[count++].nu = 'mqtt://' + cse.host + '/' + ae.id + '?ct=json'; // mqtt

conf.usesecure  = 'disable';

conf.cse = cse;
conf.ae = ae;
conf.cnt = cnt_arr;
conf.sub = sub_arr;

module.exports = conf;
