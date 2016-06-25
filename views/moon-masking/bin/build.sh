#!/bin/bash

echo 'Converting sass to css'
node-sass main.scss main.css
echo 'Sass task complete'

echo 'autoprefixing CSS'
postcss --use autoprefixer main.css --replace
echo 'Autoprefixer task complete'

#echo 'Optimizing SVGs'
#svgo -f img/
#echo 'SVG Optimization complete'

exit 0
