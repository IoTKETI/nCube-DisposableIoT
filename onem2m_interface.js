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

const edgex = require('./edgex_interface')
const Onem2mClient = require('./onem2m_client');
var mqtt = require('mqtt');
const { device } = require('./conf');

var options = {
    protocol: conf.useprotocol,
    host: conf.cse.host,
    port: conf.cse.port,
    mqttport: conf.cse.mqttport,
    wsport: conf.cse.wsport,
    cseid: conf.cse.id,
    aei: conf.ae.id,
    aeport: conf.ae.port,
    bodytype: conf.ae.bodytype,
    usesecure: conf.usesecure,
};

var onem2m_client = new Onem2mClient(options);
global.onem2m_client = onem2m_client

function ae_response_action(status, res_body, callback) {
    var aeid = res_body['m2m:ae']['aei'];
    conf.ae.id = aeid;
    callback(status, aeid);
}

function create_sub_all(count, callback) {
    if(conf.sub.length == 0) {
        callback(2001, count);
    }
    else {
        if(conf.sub.hasOwnProperty(count)) {
            var parent = conf.sub[count].parent;
            var rn = conf.sub[count].name;
            var nu = conf.sub[count].nu;
            onem2m_client.create_sub(parent, rn, nu, count, function (rsc, res_body, count) {
                if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
                    create_sub_all(++count, function (status, count) {
                        callback(status, count);
                    });
                }
                else {
                    callback('9999', count);
                }
            });
        }
        else {
            callback(2001, count);
        }
    }
}

function create_cnt_all(count, callback) {
    if(conf.cnt.length == 0) {
        callback(2001, count);
    }
    else {
        if(conf.cnt.hasOwnProperty(count)) {
            var parent = conf.cnt[count].parent;
            var rn = conf.cnt[count].name;
            onem2m_client.create_cnt(parent, rn, count, function (rsc, res_body, count) {
                if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
                    create_cnt_all(++count, function (status, count) {
                        callback(status, count);
                    });
                }
                else {
                    callback(9999, count);
                }
            });
        }
        else {
            callback(2001, count);
        }
    }
}

function mqtt_init() {
    const topic = "EdgeXEvents";

    var connectOptions = {
        host: 'localhost',
        port: '1883',
        //host: conf.host,
        //port: conf.mqttport,
        protocol: "mqtt",
        keepalive: 10,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 2000,
        connectTimeout: 2000,
        rejectUnauthorized: false
    };

    mqtt_client = mqtt.connect(connectOptions);

    mqtt_client.on('connect', function () {
        mqtt_client.subscribe(topic);
    });

    mqtt_client.on('message', mqtt_message_handler);

    function mqtt_message_handler(topic, message) {
        var msg_str = message.toString()
        console.log(msg_str)
        var jsonObj = JSON.parse(msg_str);
        
        deviceName = jsonObj['deviceName']
        mi = jsonObj['tags']['mi']
        typeName = jsonObj['readings'][0]['resourceName']
        typeValue = jsonObj['readings'][0]['value']

        data_json = {
            device : deviceName,
            mi : mi,
            name : typeName,
            value : typeValue
        }

        data_str = JSON.stringify(data_json)

        onem2m_client.create_cin(conf.gateway_path+'/devices/'+deviceName+'/data', 1, data_str, null, function(rsc, res_body, parent, socket) {
            console.log(res_body)
            if(rsc == 9999) {
                console.log('[???} create container error!');
            }
            else {
                console.log('x-msm-rsc : ' + rsc)                
            }
        })
    }
}

function setup_resources(_status) {
    sh_state = _status;

    console.log('[status] : ' + _status);

    if (_status === 'crtae') {
        onem2m_client.create_ae(conf.ae.parent, conf.ae.name, conf.ae.appid, function (status, res_body) {
            console.log(res_body);
            if (status == 2001) {
                ae_response_action(status, res_body, function (status, aeid) {
                    console.log('x-m2m-rsc : ' + status + ' - ' + aeid + ' <----');
                    request_count = 0;

                    setTimeout(setup_resources, 100, 'rtvae');
                });
            }
            else if (status == 5106 || status == 4105) {
                console.log('x-m2m-rsc : ' + status + ' <----');

                setTimeout(setup_resources, 100, 'rtvae');
            }
            else {
                console.log('[???} create container error!  ', status + ' <----');
                // setTimeout(setup_resources, 3000, 'crtae');
            }
        });
    }
    else if (_status === 'rtvae') {
        onem2m_client.retrieve_ae(conf.ae.parent + '/' + conf.ae.name, function (status, res_body) {
            if (status == 2000) {
                var aeid = res_body['m2m:ae']['aei'];
                console.log('x-m2m-rsc : ' + status + ' - ' + aeid + ' <----');

                if(conf.ae.id != aeid && conf.ae.id != ('/'+aeid)) {
                    console.log('AE-ID created is ' + aeid + ' not equal to device AE-ID is ' + conf.ae.id);
                }
                else {
                    request_count = 0;
                    setTimeout(setup_resources, 100, 'crtct');
                }
            }
            else {
                console.log('x-m2m-rsc : ' + status + ' <----');
                // setTimeout(setup_resources, 3000, 'rtvae');
            }
        });
    }
    else if (_status === 'crtct') {
        create_cnt_all(request_count, function (status, count) {
            if(status == 9999) {
                console.log('[???} create container error!');
            }
            else {
                request_count = ++count;
                if (conf.cnt.length <= count) {
                    request_count = 0;
                    setTimeout(setup_resources, 100, 'crtsub');
                }
            }
        });
    }
    else if (_status === 'crtsub') {
        create_sub_all(request_count, function (status, count) {
            if(status == 9999) {
                console.log('[???} create container error!');
            }
            else {
                request_count = ++count;
                if (conf.sub.length <= count) {
                   console.log("Resource Setup End!")
                }
            }
        });
    }
}

function device_register(_status, device_id) {
    if (_status == "device_registration") {
        var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/gateways/' + conf.gateway_name + '/devices';
        var rn = device_id;
        onem2m_client.create_cnt(parent, rn, 0, function (rsc, res_body, count) {
            if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
                setTimeout(device_register, 100, "device_registration_completed", device_id)
            }
            else {
                console.log('[???} create container error!');
            }
        });
    } else if (_status == "device_registration_completed"){
        var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/gateways/' + conf.gateway_name + '/devices/' + device_id;
        var rn = 'info';
        onem2m_client.create_cnt(parent, rn, 0, function (rsc, res_body, count) {
            if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
                
            }
            else {
                console.log('[???} create container error!');
            }
        });

        parent = '/' + conf.cse.name + '/' + conf.ae.name + '/gateways/' + conf.gateway_name + '/devices/' + device_id;
        rn = 'data';
        onem2m_client.create_cnt(parent, rn, 0, function (rsc, res_body, count) {
            if (rsc == 5106 || rsc == 2001 || rsc == 4105) {
                
            }
            else {
                console.log('[???} create container error!');
            }
        });
    }
}

onem2m_client.on('notification', function (source_uri, cinObj) {

    console.log(source_uri, cinObj);

    var path_arr = source_uri.split('/')
    var event_cnt_name = path_arr[path_arr.length-2];
    var content = cinObj.con;

    if(event_cnt_name === 'service_deploy') {
        
        console.log("OK")
    }
});

function setup() {
    setTimeout(setup_resources, 100, 'crtae');
    mqtt_init()    
}

module.exports = {
    setup: setup,
    device_register : device_register
}