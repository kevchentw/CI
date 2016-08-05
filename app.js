var Client = require('electron-rpc/client')
var client = new Client()


client.on('new_track', function(err, body) {
    var data = JSON.parse(body);
    console.log(data);
    document.getElementById('lyrics_view').src=encodeURI(data.url);
    console.log(encodeURI(data.url));
})

client.on('player_status_change', function (err, data) {
    var icon = document.getElementById('iconPlay');
    if(data.status){
        icon.innerHTML = 'pause';
    }
    else{
        icon.innerHTML = 'play_arrow';
    }
    console.log("player_status_change")
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

function pinned() {
    client.request('pinned', {}, function (err, data){
        if (err) return;
        var icon = document.getElementById('iconPinned');
        if(data.new_pinned_status){
            icon.innerHTML = 'lock';
        }
        else{
            icon.innerHTML = 'lock_open';
        }
    });
}

function playPause() {
    client.request('play_pause');
}
