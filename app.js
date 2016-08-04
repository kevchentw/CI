var Client = require('electron-rpc/client')
var client = new Client()
var request = require('superagent');


client.on('new_track', function(err, body) {
    data = JSON.parse(body);
    console.log(data);
    document.getElementById('lyrics_view').src=encodeURI(data.url);
    console.log(encodeURI(data.url));
})

function quit() {
    client.request('terminate');
}

function dev() {
    client.request('dev');
}

function refresh_lyrics() {
    client.request('refresh_lyrics');
}

function refresh_spotify() {
    client.request('refresh_spotify');
}
