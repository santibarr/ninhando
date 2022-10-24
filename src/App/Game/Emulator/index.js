import React, { useRef, useEffect } from 'react';
import * as jsnes from 'jsnes';

// Canvas + framebuffer
// ====================

const Emulator = () => {

    const canvasRef = useRef(null);

    useEffect(() => {
        console.log("Emulator");
        canvasRef.current.width = 512;
        canvasRef.current.height = 480;
        var ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
        var imageData = ctx.getImageData(0, 0, 256, 240);
        var frameBuffer = new ArrayBuffer(imageData.data.length);
        var frameBuffer8 = new Uint8ClampedArray(frameBuffer);
        var frameBuffer32 = new Uint32Array(frameBuffer);

        // AudioContext + audio buffers + samples lists
        // =============================================

        // var audio = new AudioContext();
        // var audioprocessor = audio.createScriptProcessor(512, 0, 2);
        // audioprocessor.connect(audio.destination);

        // // When the Audio processor requests new samples to play
        // audioprocessor.onaudioprocess = audioEvent => {

        //     // Ensure that we've buffered enough samples
        //     if (leftSamples.length > currentSample + 512) {
        //         for (var i = 0; i < 512; i++) {

        //             // Output (play) the buffers
        //             audioEvent.outputBuffer.getChannelData(0)[i] = leftSamples[currentSample];
        //             audioEvent.outputBuffer.getChannelData(1)[i] = rightSamples[currentSample];
        //             currentSample++;
        //         }
        //     }
        // }
        // var leftSamples = [];
        // var rightSamples = [];
        // var currentSample = 0;


        // Load ROM + Start emulator
        // =========================
        var filename = "Tetris.nes";
        var file = new XMLHttpRequest();
        file.open('GET', filename);
        file.overrideMimeType("text/plain; charset=x-user-defined");
        file.send();
        file.onload = () => {
            var nes = new jsnes.NES({

                // Display each new frame on the canvas
                onFrame: function (frameBuffer) {
                    var i = 0;
                    for (var y = 0; y < 256; ++y) {
                        for (var x = 0; x < 240; ++x) {
                            i = y * 256 + x;
                            frameBuffer32[i] = 0xff000000 | frameBuffer[i];
                        }
                    }
                    imageData.data.set(frameBuffer8);
                    ctx.putImageData(imageData, 0, 0);
                       
                    // var id = ctx.getImageData(0, 0, 256, 240);
                    // var newCanvas = new document.createElement('canvas');
                    // newCanvas.width = 256;
                    // newCanvas.height = 240;
                        
                    // newCanvas.getContext("2d").putImageData(id, 0, 0);
                        
                    // ctx.scale(1.5, 1.5);
                    // ctx.drawImage(newCanvas, 0, 0);
                },

                // Add new audio samples to the Audio buffers
                // onAudioSample: function (left, right) {
                //     //console.log(left, right);
                //     leftSamples.push(left);
                //     rightSamples.push(right);
                // },

                // Pass the browser's sample rate to the emulator
                // sampleRate: 44100,
            });

            // Send ROM to emulator
            nes.loadROM(file.responseText);

            // 60 fps loop
            setInterval(nes.frame, 16);

            // Controller #1 keys listeners
            onkeydown = onkeyup = e => {
                console.log("keylistened", e);
                nes[e.type === "keyup" ? "buttonUp" : "buttonDown"](
                    1,
                    jsnes.Controller["BUTTON_" +
                        {
                            37: "LEFT",
                            38: "UP",
                            39: "RIGHT",
                            40: "DOWN",
                            88: "A", // X
                            67: "B", // C
                            27: "SELECT",
                            13: "START"
                        }[e.keyCode]
                    ]
                )
            }

            document.addEventListener("keydown", onkeydown);
            document.addEventListener("keyup", onkeyup);

            // Or: load ROM from disk


        }
    }, []);



    return (
        <canvas ref={canvasRef}/>
    )
}

export default Emulator;