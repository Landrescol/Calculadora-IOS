# Landres Calculator

Calculadora web moderna y responsiva desarrollada con HTML, CSS y JavaScript vanilla. La interfaz conserva su estilo oscuro, animaciones, entrada mediante botones y soporte completo de teclado.

## Características

- Operaciones básicas: suma, resta, multiplicación y división.
- Manejo de números decimales y cambios de signo.
- Teclado compatible para números, operadores, Enter, Escape y retroceso.
- Prevención y visualización de errores para la división entre cero.
- Diseño responsivo con animaciones y efectos visuales.
- Cero dependencias externas.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript vanilla

## Estructura del proyecto

```text
CalculadoraIOS/
├── Frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── Backend/
│   └── README.md
└── .gitignore
```

## Ejecución local

1. Clona o descarga el repositorio.
2. Abre `Frontend/index.html` directamente en el navegador.

También puedes iniciar un servidor local desde la carpeta `Frontend/`:

```powershell
cd Frontend
python -m http.server 8000
```

Posteriormente visita `http://localhost:8000`.

## Cómo subirlo a GitHub

1. Crea un repositorio nuevo en GitHub sin archivos iniciales.
2. Ejecuta los siguientes comandos desde la raíz del proyecto:

```powershell
git init
git add .
git commit -m "Organizar calculadora frontend"
git branch -M main
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

## Posibles mejoras futuras

- Historial de operaciones.
- Operaciones científicas.
- Soporte para temas visuales.
- Pruebas automatizadas.
- Instalación como aplicación web progresiva.
