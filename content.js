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
    Key: "duration_per_id_to_rickroll.json",
    Expires: signedUrlExpireSeconds
  });
  const response = await fetch(dbUrl);
  let data = await response.json();
  let durationPerValidVideoIDS = data["duration_per_id"];

  return durationPerValidVideoIDS;
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

  video.pause();
  let promise = new Promise((res, rej) => {
    setTimeout(() => res("Now it's done!"), 1)
  });

  return promise;
};

async function audioLoaded() {

  const readSignedUrl = s3.getSignedUrl("getObject", {
    Bucket: BUCKET_NAME,
    Key: "rickroll.mp3",
    Expires: signedUrlExpireSeconds
  });

  var audio = document.createElement("audio");
  audio.setAttribute("preload", "auto");
  audio.autobuffer = true;
  var audioSource = document.createElement("source");
  audioSource.type = "audio/mpeg";
  audioSource.src = readSignedUrl;
  audio.appendChild(audioSource);
  audio.load;

  let promise = new Promise((res, rej) => {
    setTimeout(() => res(audio), 1)
  });

  return promise;
}

async function replaceAudio(videoID, videoDuration) {

  let audioCanPlay = false;
  let videoCanPlay = false;

  if (VERBOSE) { console.log("stream music"); }

  muteButton = document.getElementsByClassName("ytp-mute-button")[0];

  const video = document.querySelector("video");

  let [flagAdsPassed, audioPromise] = await Promise.allSettled([
    adsPassed(videoDuration),
    audioLoaded(videoID)
  ]);

  video.pause();

  var audio = audioPromise.value;
  let audioDuration = audio.duration;

  audio.currentTime = 0;
  video.currentTime = 0;

  function audioPlay() {
    audioCanPlay = true;
    if (VERBOSE) { console.log("audio can play");}
    if(videoCanPlay) play();
  }
  function videoPlay() {
    videoCanPlay = true;
    if (VERBOSE) { console.log("video can play");}
    if(audioCanPlay) play();
  }
  audio.addEventListener("canplay", audioPlay);
  video.addEventListener("canplay", videoPlay);

  if (VERBOSE) { console.log(flagAdsPassed);}
  if (VERBOSE) { console.log(audio);}
  if (VERBOSE) { console.log(video);}

  function play() {

    if (VERBOSE) { console.log("can play");}
    video.play();
    video.muted = true;
    audio.play();

    // If the YT player was muted by default, mute the audio
    if (muteButton.title == "Unmute (m)") {
      if (VERBOSE) { console.log("auto mute");}
      audio.muted = true;
    }
  };

  video.addEventListener("pause", (event) => {
    if (VERBOSE) { console.log("pause");}
    audio.pause();
  })
  video.addEventListener("play", (event) => {
    if (VERBOSE) { console.log("play");}
    audio.play();
  })

  //TODO: Fix issue when click drag and cursor out of image
  progressBar = document.getElementsByClassName("ytp-progress-bar")[0];
  progressBar.addEventListener("click", function () {
    if (VERBOSE) { console.log("change time: audio, video");}
    if (VERBOSE) { console.log(audio.currentTime);}
    if (VERBOSE) { console.log(video.currentTime);}
    audio.currentTime = video.currentTime % audioDuration;
    if (VERBOSE) { console.log(audio.currentTime);}
    if (VERBOSE) { console.log(video.currentTime);}
  });

  // When tab changes, cut the audio
  video.addEventListener("durationchange", (event) => {
    if (VERBOSE) { console.log("duration changed = URL changed so reload page");}
    location.reload();
  });

  muteButton.addEventListener("click", function () {
    if (VERBOSE) { console.log("mute/unmute");}
    audio.muted = !audio.muted;
    video.muted = true;
  });
}

async function videoInDB() {

  let durationPerValidVideoIDS = await getDB();
  let validVideoIDS = Object.keys(durationPerValidVideoIDS);
  if (VERBOSE) { console.log(validVideoIDS); }

  const url = location.href;
  const videoID = url.split("&")[0].replace(YOUTUBE_PREFIX, "");

  if (url.includes(YOUTUBE_PREFIX) && validVideoIDS.includes(videoID)) {
    videoDuration = durationPerValidVideoIDS[videoID];
    return [true, videoID, videoDuration];
  }
  return [false, "", 0];
}

chrome.storage.local.get(["action"], async function (result) {
  isExtensionOn = result.action;
  if (isExtensionOn) {
    let [videoIsInDB, videoID, videoDuration] = await videoInDB();
    if (VERBOSE) { console.log(videoIsInDB); }
    if (VERBOSE) { console.log(videoID); }
    if (VERBOSE) {console.log(videoDuration);}
    if (videoIsInDB) {
      replaceAudio(videoID, videoDuration);
    } else {
      if (VERBOSE) {console.log("Video not in DB");}
    }
  }
});

chrome.storage.onChanged.addListener(function(changes) {
  if (VERBOSE) { console.log("extension turned on/off: reload page");}
    location.reload();
});