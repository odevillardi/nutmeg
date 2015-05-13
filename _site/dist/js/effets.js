var currentAudio;
var buffer;

function switchEffet(pedal, effet) {
  if (pedal.className == 'button button-primary off') {
    switch (effet) {
      case 'overall':
        currentAudio.connect(context.destination);
        break;

      case 'boost':
        boostNode = context.createGain();
        boostNode.gain.value = 2;
        currentAudio.connect(boostNode);
        boostNode.connect(context.destination);
        break;

      case 'echo':
        echoNode = context.createDelay(5.0);
        echoNode.delayTime.value = 0.2;
        currentAudio.connect(echoNode);
        echoNode.connect(context.destination);
        break;

      case 'comp':
        compNode = context.createDynamicsCompressor();
        compNode.threshold.value = -50;
        compNode.knee.value = 40;
        compNode.ratio.value = 12;
        compNode.reduction.value = -20;
        compNode.attack.value = 0;
        compNode.release.value = 0.25;
        currentAudio.connect(compNode);
        compNode.connect(context.destination);
        break;

      case 'drive':
        driveNode = context.createWaveShaper();
        driveNode.curve = makeDistortionCurve(400);
        driveNode.oversample = '4x';
        currentAudio.connect(driveNode);
        driveNode.connect(context.destination);
        break;

      case 'wha':
        whaNode = context.createBiquadFilter();
        whaNode.type = "lowshelf";
        whaNode.frequency.value = 1000;
        whaNode.gain.value = 25;
        whaNode.Q.type = "peaking";
        whaNode.Q.frequency = 1000;
        whaNode.Q.value = 30;
        whaNode.gain.value = 25;
        currentAudio.connect(whaNode);
        whaNode.connect(context.destination);
        break;

      case 'reverb':
        reverbNode = context.createConvolver();
        reverbNode.buffer = impulseResponse( 2.5, 2.0 ) ;
        currentAudio.connect(reverbNode);
        reverbNode.connect(context.destination);
        break;
    }
    pedal.className = 'button button-primary';
  }
  else {
    switch (effet) {
      case 'overall':
        currentAudio.disconnect(context.destination);
        break;

      case 'boost':
        currentAudio.disconnect(boostNode);
        currentAudio.connect(context.destination);
        break;

      case 'echo':
        currentAudio.disconnect(echoNode);
        currentAudio.connect(context.destination);
        break;

      case 'comp':
        currentAudio.disconnect(compNode);
        currentAudio.connect(context.destination);
        break;

      case 'drive':
        currentAudio.disconnect(driveNode);
        currentAudio.connect(context.destination);
        break;

      case 'wha':
        currentAudio.disconnect(whaNode);
        currentAudio.connect(context.destination);
        break;

      case 'reverb':
        currentAudio.disconnect(reverbNode);
        currentAudio.connect(context.destination);
        break;
    }
    pedal.className = 'button button-primary off';
  }
  pedal.blur();
}

function convertToMono( input ) {
    var splitter = context.createChannelSplitter(2);
    var merger = context.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function clavier (event){
    var codeClavier = ('charCode' in event) ? event.charCode : event.keyCode;
 
    switch (String.fromCharCode(codeClavier)){
      case 'a':
        switchEffet(document.getElementById('overallEffects'),'overall');
        break;

      case 'b':
        switchEffet(document.getElementById('pigasus'),'boost');
        break;

      case 'e':
        switchEffet(document.getElementById('clover'),'echo');
        break;

      case 'c':
        switchEffet(document.getElementById('tara'),'comp');
        break;

      case 'd':
        switchEffet(document.getElementById('nutmeg'),'drive');
        break;

      case 'w':
        switchEffet(document.getElementById('zelda'),'wha');
        break;

      case 'r':
        switchEffet(document.getElementById('oliver'),'reverb');
        break;
    }
 
}
 
document.onkeypress = clavier;

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

function impulseResponse( duration, decay, reverse ) {
    var sampleRate = context.sampleRate;
    var length = sampleRate * duration;
    var impulse = context.createBuffer(2, length, sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++){
      var n = reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
}

/***********************************/
/* Initialisation du context audio */
/***********************************/
var context;
if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    context = new webkitAudioContext();
} else {
    throw new Error('AudioContext not supported. :(');
}

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasGetUserMedia()) {
  // Good to go!
} else {
  alert('getUserMedia() is not supported in your browser');
}

navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

var errorCallback = function(e) {
    console.log('Reeeejected!', e);
  };

navigator.getUserMedia({audio: true}, function(stream) {
  var input = context.createMediaStreamSource(stream);
  currentAudio = convertToMono( input );
}, errorCallback);