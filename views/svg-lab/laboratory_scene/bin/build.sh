#!/bin/bash

node-sass styles/main.scss styles/main.css
autoprefixer styles/main.css

echo 'Sass and Autoprefixer tasks complete'
exit 0
