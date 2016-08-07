var Client = require('electron-rpc/client')
var client = new Client()

const webview = document.getElementById('view');

webview.addEventListener('ipc-message', (event, args) => {
  console.log(event.channel)
  console.log(event)
  if(event.channel=='lyrics_exist'){
      console.log('exist')
      if(!event.args[0].exist){
          client.request('get_lyrics_from_best_result');
      }
  }
})

client.on('new_track', function(err, data) {
    if (webview){
        view.src=encodeURI(data.url);
    }
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

webview.addEventListener('dom-ready', () => {
  console.log('dom ready');
  // webview.openDevTools()
})
