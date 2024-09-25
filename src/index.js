// import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";
// import axios from "axios";
// import cors from "cors";

// const app = express();
// const PORT = 3000;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Habilita CORS
// app.use(cors());
// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.static(path.join(__dirname, "views")));
// app.use(express.json()); // Middleware para parsear JSON

// // Función para traducir texto
// const traducirTexto = async (texto) => {
//     try {
//         const response = await axios.post('URL_DE_TU_API_DE_TRADUCCION', { text: texto, targetLanguage: 'es' });
//         return response.data.translatedText; 
//     } catch (error) {
//         console.error('Error al traducir:', error.message);
//         return texto; // Devuelve el texto original en caso de error
//     }
// };

// // Función para traducir objetos
// const traducirObjetos = async (objetos) => {
//     console.log('Objetos a traducir:', objetos);
//     const objetosTraducidos = [];

//     for (const objeto of objetos) {
//         try {
//             const tituloTraducido = await traducirTexto(objeto.title || '');
//             const culturaTraducida = await traducirTexto(objeto.culture || '');
//             const dinastiaTraducida = await traducirTexto(objeto.dynasty || '');

//             objetosTraducidos.push({
//                 ...objeto,
//                 title: tituloTraducido,
//                 culture: culturaTraducida,
//                 dynasty: dinastiaTraducida
//             });
//         } catch (error) {
//             console.error('Error en la traducción:', error);
//             objetosTraducidos.push(objeto); // Agrega el objeto original en caso de error
//         }
//     }
//     return objetosTraducidos;
// };

// // Ruta principal
// app.get("/", (req, res) => {
//     res.render("index");
// });

// // Ruta para buscar objetos 
// app.get("/search", async (req, res) => {
//     const departmentId = req.query.departmentId || "";
//     const keyword = req.query.keyword || "";
//     const geoLocation = req.query.geoLocation || "";

//     let url = `https://collectionapi.metmuseum.org/public/collection/v1/search?`;
//     let hasParameter = false;

//     if (departmentId) {
//         url += `departmentId=${departmentId}`;
//         hasParameter = true;
//     }

//     if (keyword) {
//         url += hasParameter ? `&q=${encodeURIComponent(keyword)}` : `q=${encodeURIComponent(keyword)}`;
//         hasParameter = true;
//     }

//     if (geoLocation) {
//         url += hasParameter ? `&geoLocation=${encodeURIComponent(geoLocation)}` : `geoLocation=${encodeURIComponent(geoLocation)}`;
//     }

//     if (!hasParameter) {
//         return res.status(400).json({ message: "Ingrese los parámetros de búsqueda." });
//     }

//     try {
//         const response = await axios.get(url);

//         if (response.data.total === 0) {
//             return res.status(404).json({ message: "No se encontraron resultados para la búsqueda." });
//         }

//         const objects = await Promise.all(response.data.objectIDs.slice(0, 20).map(async id => {
//             const objectResponse = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
//             return objectResponse.data;
//         }));

//         // Traducir los objetos antes de enviarlos como respuesta
//         const objetosTraducidos = await traducirObjetos(objects);
        
//         res.json(objetosTraducidos); // Envía los objetos traducidos como respuesta
//     } catch (error) {
//         console.error("Error fetching data from the API:", error.message);
//         res.status(500).json({ message: "Error al buscar datos." });
//     }
// });

// // Ruta para obtener detalles 
// app.get("/object/:objectID", async (req, res) => {
//     const objectID = req.params.objectID;

//     try {
//         const response = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
//         const objectData = response.data;

//         res.render("object", { object: objectData });
//     } catch (error) {
//         console.error("Error fetching object details:", error.message);
//         res.status(500).json({ message: "Error interno del servidor" });
//     }
// });

// // Iniciar el servidor
// app.listen(PORT, () => {
//     console.log(`Servidor corriendo en el puerto ${PORT}`);
// });

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";
import translate from 'node-google-translate-skidz'; // Asegúrate de tener esta biblioteca instalada

const app = express();
const PORT = 3000; // Cambia a 3001 si es necesario
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Habilita CORS
app.use(cors());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.json()); // Middleware para parsear JSON

// Función para traducir texto usando node-google-translate-skidz
const traducirTexto = async (texto) => {
    if (!texto) return ''; // Devuelve una cadena vacía si no hay texto
    return new Promise((resolve, reject) => {
        translate({
            text: texto,
            target: 'es' // Idioma objetivo: español
        }, (result) => {
            if (result && result.translation) {
                resolve(result.translation);
            } else {
                reject('Error en la traducción');
            }
        });
    });
};

// Función para traducir objetos
const traducirObjetos = async (objetos) => {
    console.log('Objetos a traducir:', objetos);
    const objetosTraducidos = [];

    for (const objeto of objetos) {
        try {
            const tituloTraducido = await traducirTexto(objeto.title || '');
            const culturaTraducida = await traducirTexto(objeto.culture || '');
            const dinastiaTraducida = await traducirTexto(objeto.dynasty || '');

            objetosTraducidos.push({
                ...objeto,
                title: tituloTraducido,
                culture: culturaTraducida,
                dynasty: dinastiaTraducida
            });
        } catch (error) {
            console.error('Error en la traducción:', error);
            objetosTraducidos.push(objeto); // Agrega el objeto original en caso de error
        }
    }
    return objetosTraducidos;
};

// Ruta principal
app.get("/", (req, res) => {
    res.render("index");
});

// Ruta para buscar objetos 
app.get("/search", async (req, res) => {
    const departmentId = req.query.departmentId || "";
    const keyword = req.query.keyword || "";
    const geoLocation = req.query.geoLocation || "";

    let url = `https://collectionapi.metmuseum.org/public/collection/v1/search?`;
    let hasParameter = false;

    if (departmentId) {
        url += `departmentId=${departmentId}`;
        hasParameter = true;
    }

    if (keyword) {
        url += hasParameter ? `&q=${encodeURIComponent(keyword)}` : `q=${encodeURIComponent(keyword)}`;
        hasParameter = true;
    }

    if (geoLocation) {
        url += hasParameter ? `&geoLocation=${encodeURIComponent(geoLocation)}` : `geoLocation=${encodeURIComponent(geoLocation)}`;
    }

    if (!hasParameter) {
        return res.status(400).json({ message: "Ingrese los parámetros de búsqueda." });
    }

    try {
        const response = await axios.get(url);

        if (response.data.total === 0) {
            return res.status(404).json({ message: "No se encontraron resultados para la búsqueda." });
        }

        const objects = await Promise.all(response.data.objectIDs.slice(0, 20).map(async id => {
            const objectResponse = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            return objectResponse.data;
        }));

        // Traducir los objetos antes de enviarlos como respuesta
        const objetosTraducidos = await traducirObjetos(objects);
        
        res.json(objetosTraducidos); // Envía los objetos traducidos como respuesta
    } catch (error) {
        console.error("Error fetching data from the API:", error.message);
        res.status(500).json({ message: "Error al buscar datos." });
    }
});

// Ruta para obtener detalles 
app.get("/object/:objectID", async (req, res) => {
    const objectID = req.params.objectID;

    try {
        const response = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
        const objectData = response.data;

        res.render("object", { object: objectData });
    } catch (error) {
        console.error("Error fetching object details:", error.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});



