console.log("coucou");

//TODO: Move AWS init to background.js
const accessKeyId = "AKIAUEKUXBWYSUCT7QCF";
const secretAccessKey = "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";
const AWS = require("aws-sdk")
AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: "us-east-2",
    signatureVersion: "v4"
});
const s3 = new AWS.S3()

/*
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting === "hello")
      sendResponse({farewell: "goodbye"});
  }
);
*/

const BUCKET_NAME = "pure-asmr";
const OBJECT_NAME = "olive_et_tom.mp3";

//TODO: Change to manifest V3

function mute() {
  for (const muteButton of document.getElementsByClassName(
    "ytp-mute-button"
  )) {
    muteButton.click();
  }
}

function stream_music() {

  const video = document.querySelector('video');

  function playing() {
    return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
  }

  // WAIT FOR AFTER ADS
  /*
  ad_showing = document.querySelector("div.ad-showing");

  ad_showing.addEventListener("ended", function () {
    console.log("this is an ad")
  } else {
  */
  console.log("the video is playing")
  if (playing()) {
    //TODO: Assert autoplay
    console.log("Video starting");
    video.pause();
    console.log("Video paused");
    mute();
    console.log("Video muted");
  }
  //TODO: Assert video muted
  // document.querySelector("video").defaultMuted
  // document.querySelector("video").muted

  //TODO: Assert length of music file maps video length

  const signedUrlExpireSeconds = 60 * 5
  const readSignedUrl = s3.getSignedUrl("getObject", {
    Bucket: BUCKET_NAME,
    Key: OBJECT_NAME,
    Expires: signedUrlExpireSeconds
  });
  // BUILD AUDIO ELEMENT IN BROWSER
  var audioElement = document.createElement("audio");
  audioElement.setAttribute("preload", "auto");
  audioElement.autobuffer = true;
  var source1 = document.createElement("source");
  source1.type = "audio/mpeg";
  source1.src = readSignedUrl;
  audioElement.appendChild(source1);
  //audioElement.load();

  // PLAY AUDIO WHEN VIDEO STARTS
  var pro_audio = audioElement.play();
  console.log(pro_audio);
  if (pro_audio !== undefined) {
    video.play();
  }

  //TODO: FIX WHEN USE OF SHORTCUTS
  //TODO: FIX WHEN CLICK ON VIDEO TO PAUSE

  // PAUSE/RESUME AUDIO FILE WHEN USER CLICKS PLAY/PAUSE ON THE VIDEO
  play_button = document.getElementsByClassName("ytp-play-button")[0];
  play_button.addEventListener("click", function () {
    videoPaused = video.paused;
    if (videoPaused) {
      console.log("pause");
      audioElement.pause();
    } else {
      console.log("resume");
      audioElement.play();
    };
  });

  // MOVE AUDIO FILE TIME WHEN USER CLICKS IT ON THE VIDEO
  //TODO: Fix issue when click drag and cursor out of image
  progressBar = document.getElementsByClassName("ytp-progress-bar")[0];
  progressBar.addEventListener("click", function () {
    newTime = video.currentTime;
    console.log(newTime);
    audioElement.currentTime = newTime;
  });
}

stream_music();
