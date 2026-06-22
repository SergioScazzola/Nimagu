const fs = require("fs");
const dotenv = require("dotenv");

// Cargar variables de entorno desde .env
const environment = dotenv.config().parsed || {};
console.log(environment);
// Valor por defecto para API_HOST
const apiHost = environment.API_HOST || "http://localhost:5000";

// Crear contenido del environment.ts
const envConfigFile = `
// Archivo generado automáticamente, no editar manualmente
export const environment = {
  apiUrl: '${apiHost}/api/'
};
`;

// Asegurar que el directorio existe
const dir = "./src/environments";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Escribir el archivo de entorno
fs.writeFileSync("./src/environments/environment.ts", envConfigFile);
