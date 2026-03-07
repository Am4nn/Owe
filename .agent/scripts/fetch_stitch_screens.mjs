import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Dest dir explicitly set relative to the project root
const ARTIFACTS_DIR = path.join(PROJECT_ROOT, 'artifacts', 'stitch_owe_design');

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const sanitizeFolderName = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
};

const run = async () => {
  try {
    const jsonPath = process.argv[2];
    if (!jsonPath) {
      console.error('Usage: node fetch_stitch_screens.mjs <path-to-stitch-output-json>');
      process.exit(1);
    }
    const data = fs.readFileSync(jsonPath, 'utf8');
    const json = JSON.parse(data);
    const screens = json.screens;

    console.log(`Found ${screens?.length || 0} screens to download.`);

    if (!screens || screens.length === 0) {
      console.log("No screens found in the provided JSON file.");
      return;
    }

    for (const screen of screens) {
      if (!screen.title) continue;
      const folderName = sanitizeFolderName(screen.title);
      const targetDir = path.join(ARTIFACTS_DIR, folderName);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      console.log(`Downloading: ${screen.title} -> ${folderName}`);

      const htmlFilePath = path.join(targetDir, 'index.html');
      const pngFilePath = path.join(targetDir, 'screenshot.png');

      const downloads = [];
      if (screen.htmlCode?.downloadUrl) {
        downloads.push(downloadFile(screen.htmlCode.downloadUrl, htmlFilePath));
      }
      if (screen.screenshot?.downloadUrl) {
        downloads.push(downloadFile(screen.screenshot.downloadUrl, pngFilePath));
      }

      await Promise.all(downloads);
    }

    console.log('All screens downloaded successfully to:', ARTIFACTS_DIR);
  } catch (err) {
    console.error('Error fetching screens:', err);
  }
};

run();
