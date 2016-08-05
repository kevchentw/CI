var menubar = require('menubar')
var accents = require('remove-accents')

var mb = menubar({
    width: 415,
    height: 550,
    // showDockIcon: true
})
var SpotifyWebHelper = require('@jonny/spotify-web-helper')
var helper = SpotifyWebHelper()
initSpotify()

var Server = require('electron-rpc/server')
var app = new Server()

var mb_ready = false;
var spotify_ready = false;

function remove_remastered(s){
    return s.split('- Remastered')[0].trim();
}

function replaceDot(s){
    return s.replace(".", "-2").trim();
}

function removeBrackets(s){
    return s.replace(/ *\([^)]*\) */g, "").trim();
}

function slugify(s) {
    return s.split(/'| |,|\.|-|&|!/).filter(Boolean).join("-").trim();
}

function removeDash(s) {
    return s.split('-')[0].trim();
}

function parseString(s) {
    // s = remove_remastered(s);
    s = removeDash(s);
    s = removeBrackets(s);
    s = replaceDot(s);
    s = accents(s);
    s = slugify(s)
    s = s.trim();
    return s;
}

function generate_musixmatch_url(track) {
    var u = `https://www.musixmatch.com/lyrics/${parseString(track.artist_resource.name)}/${parseString(track.track_resource.name)}/embed`
    console.info(u);
    return u
}

function refresh_lyrics(track){
    console.info('update');
    var data = {
        'url': generate_musixmatch_url(track)
    };
    if(mb_ready){
        app.send('new_track', JSON.stringify(data));
    }
}

function initSpotify(){
    helper.player.on('ready', function() {
        spotify_ready = true;
        refresh_lyrics(helper.status.track);
        var player_status = {
            'status': helper.status.playing
        }
        app.send('player_status_change', player_status);
        helper.player.on('play', function() {
            var player_status = {
                'status': true
            }
            app.send('player_status_change', player_status);
            console.log('play');
        })
        helper.player.on('pause', function() {
            var player_status = {
                'status': false
            }
            app.send('player_status_change', player_status);
            console.log('pause');
        })
        helper.player.on('end', function() {
            var player_status = {
                'status': helper.status.playing
            }
            app.send('player_status_change', player_status);
            console.log('end');
        })
        helper.player.on('track-change', function(track) {
            console.log('change');
            var player_status = {
                'status': helper.status.playing
            }
            app.send('player_status_change', player_status);
            var data = {
                'url': generate_musixmatch_url(track)
            };
            if(mb_ready){
                app.send('new_track', JSON.stringify(data));
            }
        })

        helper.player.on('error', function(err) {
            console.log('error');
        })
    });
}


mb.on('ready', function ready() {
    console.log('app is ready');
})

mb.on('after-create-window', function show() {
    app.configure(mb.window.webContents);
    mb_ready = true;
    // mb.window.openDevTools();
})

app.on('terminate', function terminate (ev) {
    mb.app.quit();
    console.info("terminate")
})

app.on('dev', function terminate (ev) {
    mb.window.openDevTools();
    console.info("dev")
})

app.on('refresh_lyrics', function terminate (ev) {
    if(spotify_ready){
        refresh_lyrics(helper.status.track);
    }
    console.info("refresh_lyrics");
})

app.on('refresh_spotify', function terminate (ev) {
    helper = SpotifyWebHelper();
    initSpotify();
    console.info("refresh_spotify");
})

app.on('pinned', function terminate (req, next) {
    var next_pinned_status = !mb.getOption('alwaysOnTop');
    mb.setOption('alwaysOnTop', next_pinned_status);
    next(null, {'new_pinned_status': next_pinned_status});
    console.info("pinned");
})

app.on('play_pause', function terminate (ev) {
    if(spotify_ready){
        if(helper.status.playing){
            helper.player.pause();
        }
        else{
            helper.player.pause(true);
        }
    }
    console.info("play_pause");
})
