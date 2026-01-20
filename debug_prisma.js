const { exec } = require('child_process');
// Use the absolute path or relative path to apps/api
const cwd = 'c:/Users/uinformatica8.GIGHA/OneDrive - GIGHA SAS - JIRO SAS/Documentos/Tomas/latios-sign/apps/api';

console.log('Starting prisma db push...');
exec('npx prisma db push', { cwd }, (error, stdout, stderr) => {
    console.log('Finished');
    const report = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error ? error.message : 'No error object'}`;
    require('fs').writeFileSync('prisma_debug_output.txt', report);
});
