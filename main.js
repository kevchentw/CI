var menubar = require('menubar')
var accents = require('remove-accents')
var dialog = require('dialog');
const shell = require('electron').shell;

var mb = menubar({
    width: 415,
    height: 550,
    resizable: false,
    icon: __dirname + '/icon.png'
})
var SpotifyWebHelper = require('@jonny/spotify-web-helper')
var helper = SpotifyWebHelper()
initSpotify()
var compare = require('node-version-compare');
var VERSION_URL = "https://raw.githubusercontent.com/kevchentw/CI/master/version"
var RELEASE_URL = "https://github.com/kevchentw/CI/releases"
var request = require('superagent');
var Server = require('electron-rpc/server')
var app = new Server()
var mb_ready = false;
var spotify_ready = false;

function check_new_version() {
    request
        .get(VERSION_URL)
        .end(function(err, res) {
            var now_version = mb.app.getVersion()
            var lastest_version = res.text
            var result = compare(lastest_version, now_version)
            if (result > 0) {
                var index = dialog.showMessageBox(mb.window, {
                  type: 'info',
                  buttons: ['Download', 'Cancel'],
                  title: "New Version Available",
                  message: 'New Version Available',
                  detail: `You are currently on v${now_version}, update to v${lastest_version} to try out new features!`
                });
                if (index==1){
                    return
                }
                else if (index==0) {
                    shell.openExternal(RELEASE_URL);
                }
            }
        });
}

function replaceDot(s) {
    return s.replace(".", "-2").trim();
}

function removeBrackets(s) {
    return s.replace(/ *\([^)]*\) */g, "").trim();
}

function slugify(s) {
    return s.split(/'| |,|\.|-|&|!/).filter(Boolean).join("-").trim();
}

function removeDash(s) {
    return s.split('-')[0].trim();
}

function parseString(s) {
    s = removeDash(s);
    s = removeBrackets(s);
    s = replaceDot(s);
    s = accents(s);
    s = slugify(s)
    s = s.trim();
    return s;
}

function generate_musixmatch_url(track) {
    return `https://www.musixmatch.com/lyrics/${parseString(track.artist_resource.name)}/${parseString(track.track_resource.name)}/embed`
}

function refresh_lyrics(track) {
    var data = {
        'url': generate_musixmatch_url(track)
    };
    if (mb_ready) {
        app.send('new_track', JSON.stringify(data));
    }
}

function initSpotify() {
    helper.player.on('ready', function() {
        spotify_ready = true;
        refresh_lyrics(helper.status.track);
        send_player_status_change(helper.status.playing);
        helper.player.on('play', function() {
            send_player_status_change(true);
        })

        helper.player.on('pause', function() {
            send_player_status_change(false);
        })

        helper.player.on('end', function() {
            send_player_status_change(helper.status.playing);
        })

        helper.player.on('track-change', function(track) {
            send_player_status_change(helper.status.playing);
            send_new_track(track);
        })

        helper.player.on('error', function(err) {
        })
    });
}

function send_pinned_status() {
    var pinned_status = {
        'status': mb.getOption('alwaysOnTop')
    }
    if (mb_ready) {
        app.send('pinned_status', pinned_status);
    }
}

function send_player_status_change(s) {
    var player_status = {
        'status': s
    }
    if (mb_ready) {
        app.send('player_status_change', player_status);
    }
}

function send_new_track(track) {
    var data = {
        'url': generate_musixmatch_url(track)
    };
    if (mb_ready) {
        app.send('new_track', JSON.stringify(data));
    }
}


// menubar event listener
mb.on('ready', function ready() {
})

mb.on('show', function ready() {
    send_pinned_status();
})

mb.on('after-create-window', function show() {
    app.configure(mb.window.webContents);
    check_new_version()
    mb_ready = true;
    // mb.window.openDevTools();
})


// rpc
app.on('terminate', function terminate(ev) {
    mb.app.quit();
})

app.on('dev', function terminate(ev) {
    mb.window.openDevTools();
})

app.on('refresh_lyrics', function terminate(ev) {
    if (spotify_ready) {
        refresh_lyrics(helper.status.track);
    }
})

app.on('refresh_spotify', function terminate(ev) {
    helper = SpotifyWebHelper();
    initSpotify();
})

app.on('pinned', function terminate(req, next) {
    var next_pinned_status = !mb.getOption('alwaysOnTop');
    mb.setOption('alwaysOnTop', next_pinned_status);
    next(null, {
        'new_pinned_status': next_pinned_status
    });
    mb.window.setAlwaysOnTop(next_pinned_status)
})

app.on('play_pause', function terminate(ev) {
    if (spotify_ready) {
        if (helper.status.playing) {
            helper.player.pause();
        } else {
            helper.player.pause(true);
        }
    }
})
