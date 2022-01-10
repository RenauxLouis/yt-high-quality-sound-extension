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

  const url = location.href;
  const videoID = url.split("&")[0].replace(YOUTUBE_PREFIX, "");

  if (videoInDB(url, videoID, validVideoIDS)) {

    let [flagAdsPassed, audioElementPromise] = await Promise.allSettled([adsPassed(), audioLoaded(videoID)]);

    var audioElement = audioElementPromise.value;

    const video = document.querySelector("video");

    video.pause();

    audioElement.currentTime = 0;
    video.currentTime = 0;

    audioElement.addEventListener('canplaythrough', (event) => {
      video.play();
      video.muted = true;
      audioElement.play();
    });

    // PLAY/PAUSE AUDIO FILE WHEN VIDEO PLAY/PAUSE
    video.addEventListener("pause", (event) => {
      audioElement.pause();
    })
    video.addEventListener("play", (event) => {
        audioElement.play();
    })

    // MOVE AUDIO FILE TIME WHEN USER CLICKS IT ON THE VIDEO
    //TODO: Fix issue when click drag and cursor out of image
    progressBar = document.getElementsByClassName("ytp-progress-bar")[0];
    progressBar.addEventListener("click", function () {
      audioElement.currentTime = video.currentTime;
    });

    muteButton = document.getElementsByClassName("ytp-mute-button")[0];
    muteButton.addEventListener("click", function () {
      if (audioElement.muted) {
        audioElement.muted = false;
      } else {
        audioElement.muted = true;
      }
      video.muted = true;
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.message === 'TabUpdated') {
        console.log("reload");
        location.reload();
      }
    })
  }
}

console.log("in content");

chrome.storage.local.get(["action"], function (result) {
  isExtensionOn = result.action;
  console.log(isExtensionOn);
  if (isExtensionOn) {
    console.log("stream music");
    streamMusic();
  } else {
    console.log("NO stream music");
  }
});


chrome.storage.onChanged.addListener(function(changes) {
  location.reload();
  /*
  var isExtensionOn = changes["action"];
  if (isExtensionOn.newValue) {
    location.reload();
    console.log("stream music");
    streamMusic();
  } else {
    location.reload();
    console.log(isExtensionOn);
    console.log("NO stream music");
  }
  */
});
