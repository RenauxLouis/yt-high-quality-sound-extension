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


const BUCKET_NAME = "pure-asmr";
const OBJECT_NAME = "the-duck-song-v2.mp3";

//TODO: Change to manifest V3

function mute() {
  for (const muteButton of document.getElementsByClassName(
    "ytp-mute-button"
  )) {
    muteButton.click();
  }
}

async function adsPassed() {

  progressBar = document.getElementsByClassName("ytp-progress-bar")[0];

  if (progressBar.style.backgroundColor === "rgb(255, 204, 0)") {
    setTimeout(adsPassed, 50);
    return;
  } else {
    return true;
  }
};

async function audioLoaded() {

  const signedUrlExpireSeconds = 60 * 5
  const readSignedUrl = s3.getSignedUrl("getObject", {
    Bucket: BUCKET_NAME,
    Key: OBJECT_NAME,
    Expires: signedUrlExpireSeconds
  });

  var audioElement = document.createElement("audio");
  audioElement.setAttribute("preload", "auto");
  audioElement.autobuffer = true;
  var audioSource = document.createElement("source");
  audioSource.type = "audio/mpeg";
  audioSource.src = readSignedUrl;
  audioElement.appendChild(audioSource);
  audioElement.load;

  return audioElement;
}

async function streamMusic() {

  let [flagAdsPassed, audioElement] = await Promise.all([adsPassed(), audioLoaded()]);
  console.log(flagAdsPassed);

  const video = document.querySelector('video');

  video.pause();

  audioElement.currentTime = 0;
  video.currentTime = 0;

  audioElement.addEventListener('canplaythrough', (event) => {
    console.log('I think I can play through the entire ' +
      'audio without ever having to stop to buffer.');
    video.play();
    audioElement.play();
  });

  console.log("Played")
  //TODO: FIX WHEN USE OF SHORTCUTS
  //TODO: FIX WHEN CLICK ON VIDEO TO PAUSE

  // PAUSE/RESUME AUDIO FILE WHEN USER CLICKS PLAY/PAUSE ON THE VIDEO
  playButton = document.getElementsByClassName("ytp-play-button")[0];
  playButton.addEventListener("click", function () {
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
    console.log(video.currentTime);
    audioElement.currentTime = video.currentTime;
  });
}

streamMusic();



  // WAIT FOR AFTER ADS
  /*

  function playing() {
    return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
  }
  ad_showing = document.querySelector("div.ad-showing");

  ad_showing.addEventListener("ended", function () {
    console.log("this is an ad")
  } else {
  */
//   console.log("the video is playing")
//   if (playing()) {
//     //TODO: Assert autoplay
//     console.log("Video starting");
//     video.pause();
//     console.log("Video paused");
//     mute();
//     console.log("Video muted");
//   }
  //TODO: Assert video muted
  // document.querySelector("video").defaultMuted
  // document.querySelector("video").muted

  //TODO: Assert length of music file maps video length


  //audioElement.load();

  // PLAY AUDIO WHEN VIDEO STARTS
//   var pro_audio = audioElement.play();
//   console.log(pro_audio);
//   if (pro_audio !== undefined) {
//     video.play();
//   }
//audioElement.addEventListener("canplaythrough", (event) => {
//    audioElement.play();
//    video.play();
//  });


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