#!/bin/bash


sass --watch styles:styles views:views
autoprefixer styles/main.css views/**/*.css
