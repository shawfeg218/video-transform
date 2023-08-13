// utils/ffmpeg.js
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
import fs from 'fs';

global.conversionStatus = global.conversionStatus || { file: '', status: '' };

export const convertVideo = async (file, format, fps, size, inputDir, outputDir) => {
  try {
    // generate input path
    let filePath;
    if (inputDir === 'uploads') {
      filePath = path.join(process.cwd(), 'uploads', file);
    } else {
      filePath = path.join(inputDir, file);
    }
    console.log('filePath: ', filePath);

    // generate output path
    let outputFilePath;
    const parsedPath = path.parse(file);
    const outputFileName = parsedPath.name;
    if (outputDir === 'results') {
      outputFilePath = path.join(
        process.cwd(),
        'results',
        `${outputFileName}_${size}p_${fps}fps.${format}`
      );
    } else {
      outputFilePath = path.join(outputDir, `${outputFileName}_${size}p_${fps}fps.${format}`);
    }
    console.log('outputFilePath: ', outputFilePath);

    // generate quality settings
    const outputFps = Number(fps) || 30;
    let outputSize = '?x1080';
    if (size === '720') {
      outputSize = '?x720';
    } else if (size === '1080') {
      outputSize = '?x1080';
    } else if (size === '1440') {
      outputSize = '?x1440';
    } else if (size === '2160') {
      outputSize = '?x2160';
    }
    console.log('Fps: ', outputFps, ', Size: ', outputSize);

    // convert video
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(filePath)
        .fpsOutput(outputFps)
        .size(outputSize)
        .outputFormat(format)
        .on('start', () => {
          console.log('ffmpeg start converting...');
          conversionStatus = { file: file, status: 'processing' };
        })
        .on('end', () => {
          console.log('ffmpeg finished converting.');
          conversionStatus = { file: file, status: 'completed' };
          resolve();
        })
        .on('error', (error) => {
          console.log('ffmpeg error:', error.message);
          conversionStatus = { file: file, status: 'failed' };
          if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
          }
          reject(
            new Error(`Failed to convert ${file} to ${format.toUpperCase()}: ${error.message}`)
          );
        })
        .save(outputFilePath);
    });
  } catch (error) {
    console.log(error.message);
    conversionStatus = { file: file, status: 'failed' };
  }
};
