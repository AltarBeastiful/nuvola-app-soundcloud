/*
 * Copyright 2014-2015 Jiří Janoušek <janousek.jiri@gmail.com>
 * Copyright 2015 Rémi Benoit <r3m1.benoit@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

(function(Nuvola)
{

// Create media player component
var player = Nuvola.$object(Nuvola.MediaPlayer);

// Handy aliases
var PlaybackState = Nuvola.PlaybackState;
var PlayerAction = Nuvola.PlayerAction;

// Create new WebApp prototype
var WebApp = Nuvola.$WebApp();

// Initialization routines
WebApp._onInitWebWorker = function(emitter)
{
    Nuvola.WebApp._onInitWebWorker.call(this, emitter);

    var state = document.readyState;
    if (state === "interactive" || state === "complete")
        this._onPageReady();
    else
        document.addEventListener("DOMContentLoaded", this._onPageReady.bind(this));
}

// Page is ready for magic
WebApp._onPageReady = function()
{
    this.playButton = null;
    this.nextButton = null;
    this.previousButton = null;

    // Connect handler for signal ActionActivated
    Nuvola.actions.connect("ActionActivated", this);

    // Start update routine
    this.update();
}

// Extract data from the web page
WebApp.update = function()
{
    this.playButton = document.querySelector(".playControl");
    this.nextButton = document.querySelector(".skipControl__next");
    this.previousButton = document.querySelector(".skipControl__previous");

    if (!this.playButton || !this.nextButton || !this.previousButton) {
        setTimeout(this.update.bind(this), 500);
        return;
    }
    var track = {
        title: null,
        artist: null,
        album: null,
        artLocation: null
    }

    if (this.playButton.getAttribute("tabindex") == "-1") {
        player.setTrack(track);
        player.setPlaybackState(Nuvola.PlaybackState.UNKNOWN);
        player.setCanGoPrev(false);
        player.setCanGoNext(false);
        player.setCanPlay(false);
        player.setCanPause(false);

        setTimeout(this.update.bind(this), 500);
        return;
    }

    var canPrev = (this.previousButton.getAttribute("tabindex") == "-1");
    var canNext = (this.nextButton.getAttribute("tabindex") == "-1");
    var state = this.playButton.classList.contains("playing") ? PlaybackState.PLAYING : PlaybackState.PAUSED;

    var titleNode = document.querySelector(".playbackSoundBadge__title");
    if (titleNode) {
        track.title = titleNode.getAttribute("title");

        var artist = document.title.substring(track.title.length + 6);
        if (artist && artist.length > 0)
            track.artist = artist

        var artUrl = document.querySelector(".playbackSoundBadge__avatar").children[0].children[0].style.backgroundImage;
        if (artUrl)
            track.artLocation = artUrl.substring(4, artUrl.length-1);
    }

    player.setTrack(track);
    player.setPlaybackState(state);
    player.setCanGoPrev(canPrev);
    player.setCanGoNext(canNext);
    player.setCanPlay(state === PlaybackState.PAUSED);
    player.setCanPause(state === PlaybackState.PLAYING);

    // Schedule the next update
    setTimeout(this.update.bind(this), 500);
}

// Handler of playback actions
WebApp._onActionActivated = function(emitter, name, param)
{
    switch (name)
    {
    case PlayerAction.TOGGLE_PLAY:
    case PlayerAction.PLAY:
    case PlayerAction.PAUSE:
    case PlayerAction.STOP:
	if (this.playButton)
	    Nuvola.clickOnElement(this.playButton);
	else
	    Nuvola.warn("Play button not found for '{1}', section {2}", name, this.section);
        break;
    case PlayerAction.PREV_SONG:
        Nuvola.clickOnElement(document.querySelector(".skipControl__previous"));
        break;
    case PlayerAction.NEXT_SONG:
        Nuvola.clickOnElement(document.querySelector(".skipControl__next"));
        break;
    }
}

WebApp.start();

})(this);  // function(Nuvola)
