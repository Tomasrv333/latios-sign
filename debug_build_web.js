const { exec } = require('child_process');
const cwd = 'c:/Users/uinformatica8.GIGHA/OneDrive - GIGHA SAS - JIRO SAS/Documentos/Tomas/latios-sign';

console.log('Starting web build...');
exec('pnpm --filter @latios/web build', { cwd }, (error, stdout, stderr) => {
    console.log('Finished');
    const report = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error ? error.message : 'No error'}`;
    require('fs').writeFileSync('web_build_debug.txt', report);
});
