/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */
/* jshint browser: true, camelcase: true, curly: true, devel: true, eqeqeq: true, forin: false, globalstrict: true, quotmark: single, undef: true, unused: strict */

'use strict';

addTestSuite("recordingTest", recordingTest);

function recordingTest() {
  doGetUserMedia({audio:true}, function(stream) {
    if (checkTracks(stream)) {
      checkAudioStart(stream);
    }
  });
}

function checkTracks(stream) {
  reportSuccess("getUserMedia succeeded.");
  var tracks = stream.getAudioTracks();
  if (tracks.length < 1) {
    return reportFatal("No audio track in returned stream.");
  }
  var audioTrack = tracks[0];
  reportSuccess("Audio track exists with label=" + audioTrack.label);
  return true;
}

// Analyze one buffer of audio.
function checkAudioStart(stream) {
  var processFunc = function(event) {
    var sampleRate = event.sampleRate;
    var inputBuffer = event.inputBuffer;
    var numFrames = 20;
    if (++frameCount >= numFrames) {
      // End the test.
      source.disconnect(scriptNode); 
      scriptNode.disconnect(audioContext.destination);
      audioRecorder.stop();
      audioRecorder.exportWAV(doneEncoding);
      testSuiteFinished();
    }   
  };

  var frameCount = 0;
  var source = audioContext.createMediaStreamSource(stream);
  var audioRecorder = new Recorder(source);
  var scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
  scriptNode.onaudioprocess = processFunc;
  source.connect(scriptNode);
  scriptNode.connect(audioContext.destination);
  audioRecorder.record();
}

function doneEncoding(blob) {
  Recorder.forceDownload(blob, "myRecording.wav" );
}
