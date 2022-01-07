const BUCKET_NAME = "pure-asmr";
const YOUTUBE_PREFIX = "https://www.youtube.com/watch?v=";

console.log("coucou");

//TODO: Move AWS init to background.js
const accessKeyId = "AKIAUEKUXBWYSUCT7QCF";
const secretAccessKey = "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";
const AWS = require("aws-sdk")
const signedUrlExpireSeconds = 60 * 5
AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: "us-east-2",
    signatureVersion: "v4"
});
const s3 = new AWS.S3()

async function getDB() {

  const dbUrl = s3.getSignedUrl("getObject", {
    Bucket: BUCKET_NAME,
    Key: "video_ids.json",
    Expires: signedUrlExpireSeconds
  });
  const response = await fetch(dbUrl);
  let data = await response.json();
  let validVideoIDS = data["ids"];

  return validVideoIDS;
}

function videoInDB(url, videoID, validVideoIDS) {

  if (url.includes(YOUTUBE_PREFIX) && validVideoIDS.includes(videoID)) {
    return true;
  }
  return false;
}

async function adsPassed2() {

  let promise = new Promise((res, rej) => {
    setTimeout(() => res("Now it's done!"), 1000)
  });
  return promise

}

async function adsPassed() {

  const expectedDuration = 191;

  const video = document.querySelector("video");

  while (Math.floor(video.duration) != expectedDuration) {
    console.log(Math.floor(video.duration));
    console.log("wait cause ads");
    let promise = adsPassed2();
    let result = await promise;
    adsPassed();
  }

  let promise = new Promise((res, rej) => {
    setTimeout(() => res("Now it's done!"), 1)
  });

  return promise;
};

async function audioLoaded(videoID) {

  const readSignedUrl = s3.getSignedUrl("getObject", {
    Bucket: BUCKET_NAME,
    Key: videoID + ".mp3",
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

  let promise = new Promise((res, rej) => {
    setTimeout(() => res(audioElement), 1)
  });

  return promise;
}

async function streamMusic() {

  let validVideoIDS = await getDB();
  console.log(validVideoIDS);

  const url = location.href;
  const videoID = url.split("&")[0].replace(YOUTUBE_PREFIX, "");

  if (videoInDB(url, videoID, validVideoIDS)) {

    let [flagAdsPassed, audioElementPromise] = await Promise.allSettled([adsPassed(), audioLoaded(videoID)]);
    console.log(flagAdsPassed);

    var audioElement = audioElementPromise.value;

    const video = document.querySelector("video");
    console.log(video.duration);

    video.pause();

    audioElement.currentTime = 0;
    video.currentTime = 0;

    audioElement.addEventListener('canplaythrough', (event) => {
      console.log('I think I can play through the entire audio without ever having to stop to buffer.');
      //MuteUnmute(mute = true);
      video.play();
      console.log(video.muted);
      video.muted = true;
      console.log(video.muted);
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

    muteButton = document.getElementsByClassName("ytp-mute-button")[0];
    muteButton.addEventListener("click", function () {
      console.log("mute button clicked");
      if (audioElement.muted) {
        audioElement.muted = false;
      } else {
        audioElement.muted = true;
      }
      video.muted = true;
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.message === 'TabUpdated') {
        console.log("need to stop music and unmute if necessary");
        audioElement.pause();
        MuteUnmute(mute=false);
      }
    })
  }
}

streamMusic();
