const VERBOSE = true;

const BUCKET_NAME = "pure-asmr";
const YOUTUBE_PREFIX = "https://www.youtube.com/watch?v=";

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
    Key: "duration_per_id.json",
    Expires: signedUrlExpireSeconds
  });
  const response = await fetch(dbUrl);
  let data = await response.json();
  let durationPerValidVideoIDS = data["duration_per_id"];

  return durationPerValidVideoIDS;
}

function videoInDB(url, videoID, validVideoIDS) {

  if (VERBOSE) { console.log();}

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

async function adsPassed(expectedVideoDuration) {

  const video = document.querySelector("video");

  while (Math.floor(video.duration) != expectedVideoDuration) {
    let promise = adsPassed2();
    let result = await promise;
    adsPassed(expectedVideoDuration);
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


  muteButton = document.getElementsByClassName("ytp-mute-button")[0];
  progressBar = document.getElementsByClassName("ytp-progress-bar")[0];

  let durationPerValidVideoIDS = await getDB();
  let validVideoIDS = Object.keys(durationPerValidVideoIDS);
  if (VERBOSE) { console.log(validVideoIDS);}

  const url = location.href;
  const videoID = url.split("&")[0].replace(YOUTUBE_PREFIX, "");

  const video = document.querySelector("video");

  video.pause();

  if (videoInDB(url, videoID, validVideoIDS)) {

    expectedVideoDuration = durationPerValidVideoIDS[videoID];

    let [flagAdsPassed, audioElementPromise] = await Promise.allSettled([
      adsPassed(expectedVideoDuration),
      audioLoaded(videoID)
    ]);

    var audioElement = audioElementPromise.value;

    audioElement.currentTime = 0;
    video.currentTime = 0;

    if (VERBOSE) { console.log(flagAdsPassed);}
    if (VERBOSE) { console.log(audioElement);}
    if (VERBOSE) { console.log(video);}

    audioElement.addEventListener("canplay", (event) => {

      if (VERBOSE) { console.log("can play");}
      video.play();
      video.muted = true;
      audioElement.play();

      // If the YT player was muted by default, mute the audio
      if (muteButton.title == "Unmute (m)") {
        if (VERBOSE) { console.log("auto mute");}
        audioElement.muted = true;
      }
    });

    video.addEventListener("pause", (event) => {
      if (VERBOSE) { console.log("pause");}
      audioElement.pause();
    })
    video.addEventListener("play", (event) => {
      if (VERBOSE) { console.log("play");}
      audioElement.play();
    })

    //TODO: Fix issue when click drag and cursor out of image
    progressBar.addEventListener("click", function () {
      if (VERBOSE) { console.log("change time: audio, video");}
      if (VERBOSE) { console.log(audioElement.currentTime);}
      if (VERBOSE) { console.log(video.currentTime);}
      audioElement.currentTime = video.currentTime;
      if (VERBOSE) { console.log(audioElement.currentTime);}
      if (VERBOSE) { console.log(video.currentTime);}
    });

    muteButton = document.getElementsByClassName("ytp-mute-button")[0];
    muteButton.addEventListener("click", function () {
      if (VERBOSE) { console.log("mute/unmute");}
      audioElement.muted = !audioElement.muted;
      video.muted = true;
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.message === "TabUpdated") {
        if (VERBOSE) { console.log("URL changed: reload page");}
        location.reload();
      }
    })
  }
}

chrome.storage.local.get(["action"], function (result) {
  isExtensionOn = result.action;
  if (isExtensionOn) {
    if (VERBOSE) { console.log("stream music");}
    streamMusic();
  }
});

chrome.storage.onChanged.addListener(function(changes) {
  if (VERBOSE) { console.log("extension turned on/off: reload page");}
    location.reload();
});
