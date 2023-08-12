import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST requests allowed.');
    }

    const { file, format } = req.body;

    // 檢查輸入
    if (!file || !format) {
      throw new Error('Missing required fields: fileName and format.');
    }

    const inputPath = path.join(process.cwd(), 'uploads', file);
    const parsedPath = path.parse(file);
    const outputFileName = parsedPath.name;

    const outputPath = path.join(process.cwd(), 'results', `${outputFileName}.${format}`);

    // 轉檔
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .outputFormat(format)
        .on('end', () => {
          res
            .status(200)
            .json({ message: `${file} convert to ${format.toUpperCase()} successfully!` });
          resolve();
        })
        .on('error', (error) => {
          reject(
            new Error(`Failed to convert ${file} to ${format.toUpperCase()}: ${error.message}`)
          );
        })
        .save(outputPath);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
