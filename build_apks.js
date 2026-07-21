import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const originalConfig = fs.readFileSync('capacitor.config.ts', 'utf-8');
const stringsXmlPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
let originalStringsXml = '';
if (fs.existsSync(stringsXmlPath)) {
    originalStringsXml = fs.readFileSync(stringsXmlPath, 'utf-8');
}

const apps = [
    { id: 'com.minto.admin', name: 'Mintoo Admin', file: 'Mintoo_Admin.apk' },
    { id: 'com.minto.hotel', name: 'Mintoo Kitchen', file: 'Mintoo_Hotel.apk' },
    { id: 'com.minto.rider', name: 'Mintoo Rider', file: 'Mintoo_Rider.apk' }
];

function run(command, cwd) {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd });
}

try {
    console.log('Building web dist...');
    run('npm run build', __dirname);

    for (const app of apps) {
        console.log(`\n\n--- Preparing ${app.name} ---`);
        
        // 1. Modify capacitor.config.ts
        const newConfig = originalConfig
            .replace(/appId:\s*['"][^'"]+['"]/, `appId: '${app.id}'`)
            .replace(/appName:\s*['"][^'"]+['"]/, `appName: '${app.name}'`);
        fs.writeFileSync('capacitor.config.ts', newConfig);

        // 2. Sync Android
        console.log('Syncing Capacitor...');
        run('npx cap sync android', __dirname);

        // 3. Modify strings.xml
        if (originalStringsXml) {
            const newStrings = originalStringsXml.replace(
                /<string name="app_name">[^<]+<\/string>/,
                `<string name="app_name">${app.name}</string>`
            );
            fs.writeFileSync(stringsXmlPath, newStrings);
        }

        // 4. Build APK
        console.log('Building APK...');
        // We need to clean sometimes to prevent caching issues with different package names
        run('gradlew.bat clean assembleDebug', path.join(__dirname, 'android'));

        // 5. Copy and rename APK
        const apkPath = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
        const destPath = path.join(__dirname, app.file);
        fs.copyFileSync(apkPath, destPath);
        console.log(`Saved ${app.file} to root!`);
    }

} catch (err) {
    console.error('Error during build:', err);
} finally {
    // Restore originals
    console.log('\nRestoring original files...');
    fs.writeFileSync('capacitor.config.ts', originalConfig);
    if (originalStringsXml) {
        fs.writeFileSync(stringsXmlPath, originalStringsXml);
    }
    console.log('Done!');
}
