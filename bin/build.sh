#!/bin/bash

echo 'Converting sass to css'
sass styles/main.scss styles/main.css
echo 'Sass task complete'

echo 'autoprefixing CSS'
autoprefixer styles/main.css
echo 'Autoprefixer task complete'

#echo 'Optimizing SVGs'
#svgo -f img/
#echo 'SVG Optimization complete'

exit 0
