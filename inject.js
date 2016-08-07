const ipc = require('electron').ipcRenderer

function get_page_type() {
    var url = window.location.href;
    var type_lyrics = url.match("https:\/\/www.musixmatch.com\/lyrics\/(.*)\/embed")
    var type_black = url.match("about:blank")
    if (type_lyrics) {
        return {
            'type': 'lyrics',
            'url': url
        }
    } else if (type_black) {
        return {
            'type': 'blank',
            'url': url
        }
    } else {
        return {
            'type': 'unknown',
            'url': url
        }
    }
}

var page_type = get_page_type();

function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(init)

function init() {
    var lyrics_exist = check_lyrics_exist()
    if (page_type['type'] == 'lyrics') {
        if(lyrics_exist){
            ipc.sendToHost('lyrics_exist', {'exist': true})
        }
        else{
            ipc.sendToHost('lyrics_exist', {'exist': false})
        }
    }
    console.log(lyrics_exist);
}

function check_lyrics_exist() {
    if (page_type['type'] == 'lyrics') {
        var exist = document.getElementsByClassName('track-widget-header')
        if (exist.length) {
            return true;
        }
    }
    return false
}
